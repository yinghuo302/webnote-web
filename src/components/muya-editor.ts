import {
  Muya, en, zh, InlineFormatToolbar, CodeBlockLanguageSelector,
  ImageResizeBar, ImageToolBar, LinkTools, ParagraphFrontButton,
  ParagraphFrontMenu, ParagraphQuickInsertMenu, PreviewToolBar,
  TableColumnToolbar, TableDragBar, TableRowColumMenu,
} from "@muyajs/core";
import { bus } from "../utils";

type MermaidRenderer = typeof import("mermaid").default;
let mermaidRendererPromise: Promise<MermaidRenderer> | null = null;
let mermaidRenderId = 0;
const mermaidPreviewVersions = new WeakMap<HTMLElement, number>();

// Use Mermaid's public render API, matching the current MarkText diagram renderer.
function getMermaidRenderer() {
  if (!mermaidRendererPromise) {
    mermaidRendererPromise = import("mermaid").then(({ default: mermaid }) => mermaid);
  }
  return mermaidRendererPromise;
}

function warmMermaid() {
  void getMermaidRenderer()
    .then((mermaid) => {
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "default" });
      return mermaid.parse("flowchart TD\n  Start --> Done");
    })
    .catch(() => {
      mermaidRendererPromise = null;
    });
}

function renderMermaidPreview(preview: any, code: string) {
  const target = preview.domNode as HTMLElement;
  const version = (mermaidPreviewVersions.get(target) || 0) + 1;
  mermaidPreviewVersions.set(target, version);
  preview.code = code;
  if (!code) {
    target.textContent = "< Empty Diagram >";
    return Promise.resolve();
  }

  target.textContent = "Loading...";
  const theme = preview.muya.options.mermaidTheme || "default";
  return getMermaidRenderer().then(async (mermaid) => {
    mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme });
    await mermaid.parse(code);
    const { svg, bindFunctions } = await mermaid.render(`webnote-mermaid-${++mermaidRenderId}`, code, target);
    if (mermaidPreviewVersions.get(target) !== version) return;
    target.innerHTML = svg;
    bindFunctions?.(target);
  }).catch((error: unknown) => {
    if (mermaidPreviewVersions.get(target) !== version) return;
    const message = error instanceof Error ? error.message : String(error);
    const errorElement = document.createElement("div");
    errorElement.className = "mu-diagram-error";
    errorElement.textContent = `< Invalid Diagram Code > ${message}`;
    target.replaceChildren(errorElement);
  });
}

function installLiveMermaidPreview(muya: Muya) {
  const scrollPage = muya.editor.scrollPage as any;
  const previewClass = scrollPage?.constructor?.loadBlock("diagram-preview");
  const prototype = previewClass?.prototype;
  if (!prototype || prototype.__webnoteLiveMermaid) return;

  const originalUpdate = prototype.update;
  prototype.update = function (code = this.code) {
    if (this.type !== "mermaid") return originalUpdate.call(this, code);
    return renderMermaidPreview(this, code);
  };
  prototype.__webnoteLiveMermaid = true;
}

function legalRangeOffset(node: Node, offset: number) {
  if (!Number.isFinite(offset) || offset < 0) return 0;
  const max = node.nodeType === Node.TEXT_NODE ? (node as Text).length : node.childNodes.length;
  return Math.min(offset, max);
}

// Muya 0.2.0 predates MarkText's legal-offset clamp for stale DOM selections.
function installRangeOffsetGuard(muya: Muya) {
  const selection = muya.editor.selection as any;
  if (!selection || selection.__webnoteRangeOffsetGuard) return;
  const nativeSelect = selection._select;
  if (typeof nativeSelect === "function") {
    selection._select = function (startNode: Node, startOffset: number, endNode?: Node, endOffset?: number) {
      return nativeSelect.call(
        this,
        startNode,
        legalRangeOffset(startNode, startOffset),
        endNode,
        endNode && typeof endOffset === "number" ? legalRangeOffset(endNode, endOffset) : endOffset,
      );
    };
  }
  const nativeSetFocus = selection._setFocus;
  if (typeof nativeSetFocus === "function") {
    selection._setFocus = function (focusNode: Node, focusOffset: number) {
      return nativeSetFocus.call(this, focusNode, legalRangeOffset(focusNode, focusOffset));
    };
  }
  selection.__webnoteRangeOffsetGuard = true;
}

function registerPlugins() {
  [
    InlineFormatToolbar,
    CodeBlockLanguageSelector,
    ImageResizeBar,
    ImageToolBar,
    LinkTools,
    ParagraphFrontButton,
    ParagraphFrontMenu,
    ParagraphQuickInsertMenu,
    PreviewToolBar,
    TableColumnToolbar,
    TableDragBar,
    TableRowColumMenu,
  ].forEach((plugin) => {
    if (!Muya.plugins.some((registered) => registered.plugin === plugin)) Muya.use(plugin);
  });
}

/** Application-facing adapter for Muya while file/save flows are migrated. */
export class MuyaEditor implements IEditor {
  private root_ele: HTMLDivElement;
  private instance: Muya;
  private mermaidConversionQueued = false;
  private mermaidConversionPending = false;
  private pasteInProgress = 0;
  private destroyed = false;

  private readonly onJsonChange = () => {
    bus.emit("EditorChanged");
    this.mermaidConversionPending = true;
    this.scheduleMermaidConversion();
  };

  private scheduleMermaidConversion() {
    if (this.destroyed) return;
    if (this.pasteInProgress > 0) {
      this.mermaidConversionPending = true;
      return;
    }
    if (this.mermaidConversionQueued || !this.mermaidConversionPending) return;

    this.mermaidConversionQueued = true;
    Promise.resolve().then(() => {
      this.mermaidConversionQueued = false;
      if (this.destroyed) return;
      if (this.pasteInProgress > 0) return;
      this.mermaidConversionPending = false;
      this.convertActiveMermaidCodeBlock();
    });
  }

  private wrapPasteHandler() {
    const clipboard = this.instance.editor.clipboard as any;
    if (!clipboard || clipboard.__webnotePasteGuard) return;
    const pasteHandler = clipboard.pasteHandler;
    if (typeof pasteHandler !== "function") return;

    clipboard.pasteHandler = (...args: any[]) => {
      this.pasteInProgress += 1;
      let result: Promise<unknown>;
      try {
        result = Promise.resolve(pasteHandler.apply(clipboard, args));
      } catch (error) {
        this.pasteInProgress = Math.max(0, this.pasteInProgress - 1);
        this.scheduleMermaidConversion();
        throw error;
      }
      return result.finally(() => {
        this.pasteInProgress = Math.max(0, this.pasteInProgress - 1);
        this.scheduleMermaidConversion();
      });
    };
    clipboard.__webnotePasteGuard = true;
  }

  private convertActiveMermaidCodeBlock() {
    const selection = this.instance.editor.selection.getSelection();
    const anchorBlock = selection?.anchorBlock as any;
    const codeBlock = anchorBlock?.getAncestors?.().find((ancestor: any) => ancestor.blockName === "code-block");
    if (!codeBlock || codeBlock.meta?.lang?.toLowerCase() !== "mermaid") return;

    const cursorOffset = anchorBlock.blockName === "language-input" ? 0 : selection.anchor.offset;
    const scrollPage = this.instance.editor.scrollPage as any;
    const diagramFactory = scrollPage?.constructor?.loadBlock("diagram");
    if (!diagramFactory) return;

    const diagram = diagramFactory.create(this.instance, {
      name: "diagram",
      text: codeBlock.lastContentInDescendant()?.text || "",
      meta: { type: "mermaid", lang: "yaml" },
    });
    codeBlock.replaceWith(diagram);
    diagram.lastContentInDescendant()?.setCursor(cursorOffset, cursorOffset, true);
  }

  constructor(root: HTMLDivElement, initial = "# 请输入标题") {
    this.root_ele = root;
    registerPlugins();
    this.instance = new Muya(root, {
      markdown: "",
      autoPairMarkdownSyntax: false,
      math: true,
      locale: zh || en,
      fontSize: 15,
      lineHeight: 1.85,
      codeBlockLineNumbers: true,
    });
    installRangeOffsetGuard(this.instance);
    this.wrapPasteHandler();
    this.instance.init();
    installLiveMermaidPreview(this.instance);
    this.instance.on("json-change", this.onJsonChange);
    warmMermaid();
    this.instance.setContent(initial || "");
  }

  setValue(markdown: string) { this.instance?.setContent(markdown || ""); }
  getMd() { return this.instance?.getMarkdown() || ""; }
  getOutline(): IOutLine[] {
    return (this.instance?.getTOC() || []).map((item) => ({ level: item.lvl, title: item.content }));
  }
  getRoot() { return (this.instance?.domNode as HTMLDivElement) || this.root_ele; }
  destroy() {
    this.destroyed = true;
    this.instance?.off("json-change", this.onJsonChange);
    this.instance?.destroy();
  }
}

export default MuyaEditor;
