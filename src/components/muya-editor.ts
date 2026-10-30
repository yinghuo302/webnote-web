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
  private editorPaper: HTMLElement;
  private detachedVisualHost: DocumentFragment;
  private instance: Muya;
  private sourceShell: HTMLDivElement;
  private sourceGutter: HTMLDivElement;
  private sourceArea: HTMLTextAreaElement;
  private mode: "visual" | "source" = "visual";
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
    this.editorPaper = (root.closest(".editor-paper") as HTMLElement | null) || root.parentElement!;
    this.detachedVisualHost = document.createDocumentFragment();
    this.sourceShell = document.createElement("div");
    this.sourceShell.className = "markdown-source-shell";
    this.sourceShell.hidden = true;
    this.sourceGutter = document.createElement("div");
    this.sourceGutter.className = "markdown-source-gutter";
    this.sourceGutter.setAttribute("aria-hidden", "true");
    this.sourceArea = document.createElement("textarea");
    this.sourceArea.className = "markdown-source-editor";
    this.sourceArea.setAttribute("aria-label", "Markdown 源码编辑器");
    this.sourceArea.spellcheck = false;
    this.sourceArea.wrap = "off";
    this.sourceShell.append(this.sourceGutter, this.sourceArea);
    root.insertAdjacentElement("afterend", this.sourceShell);
    this.sourceArea.addEventListener("input", () => {
      this.updateSourceGutter();
      bus.emit("EditorChanged");
    });
    this.sourceArea.addEventListener("scroll", () => { this.sourceGutter.scrollTop = this.sourceArea.scrollTop; });
    this.sourceArea.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        const start = this.sourceArea.selectionStart;
        const end = this.sourceArea.selectionEnd;
        this.sourceArea.setRangeText("  ", start, end, "end");
        this.sourceArea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    registerPlugins();
    this.instance = new Muya(root, {
      markdown: "",
      autoPairMarkdownSyntax: false,
      trimUnnecessaryCodeBlockEmptyLines: false,
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

  private updateSourceGutter() {
    const lineCount = Math.max(1, this.sourceArea.value.split("\n").length);
    this.sourceGutter.textContent = Array.from({ length: lineCount }, (_, index) => String(index + 1)).join("\n");
  }

  setValue(markdown: string) {
    const value = markdown || "";
    this.sourceArea.value = value;
    this.updateSourceGutter();
    this.instance?.setContent(value);
  }
  getMd() { return this.mode === "source" ? this.sourceArea.value : (this.instance?.getMarkdown() || ""); }
  getOutline(): IOutLine[] {
    if (this.mode === "visual") return (this.instance?.getTOC() || []).map((item) => ({ level: item.lvl, title: item.content }));
    return this.sourceArea.value.split(/\r?\n/).flatMap((line) => {
      const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
      return match ? [{ level: match[1].length, title: match[2] }] : [];
    });
  }
  getRoot() { return (this.instance?.domNode as HTMLDivElement) || this.root_ele; }
  getMode() { return this.mode; }
  setMode(mode: "visual" | "source") {
    if (mode === this.mode) return;
    const paper = this.editorPaper;
    if (mode === "source") {
      this.sourceArea.value = this.instance.getMarkdown() || "";
      this.updateSourceGutter();
      this.detachedVisualHost.appendChild(this.root_ele);
    } else {
      paper?.insertBefore(this.root_ele, this.sourceShell);
      this.instance.setContent(this.sourceArea.value);
    }
    this.mode = mode;
    paper?.classList.toggle("is-source-mode", mode === "source");
    this.sourceShell.hidden = mode !== "source";
    this.sourceShell.style.display = mode === "source" ? "grid" : "none";
    document.body.classList.toggle("webnote-source-mode", mode === "source");
    if (mode === "source") this.sourceArea.focus();
    else this.instance.focus();
    bus.emit("EditorChanged");
  }
  jumpToHeading(index: number) {
    if (this.mode === "source") {
      const lines = this.sourceArea.value.split(/\r?\n/);
      let headingIndex = -1;
      let offset = 0;
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
        const line = lines[lineIndex];
        if (/^#{1,6}\s+/.test(line) && ++headingIndex === index) {
          this.sourceArea.focus();
          this.sourceArea.setSelectionRange(offset, offset + line.length);
          const lineHeight = Number.parseFloat(getComputedStyle(this.sourceArea).lineHeight) || 23;
          this.sourceArea.scrollTop = Math.max(0, lineIndex * lineHeight - lineHeight * 2);
          return;
        }
        offset += line.length + (lineIndex < lines.length - 1 && this.sourceArea.value.slice(offset + line.length, offset + line.length + 2) === "\r\n" ? 2 : 1);
      }
      return;
    }
    const scrollPage = (this.instance.editor as any).scrollPage;
    const topLevelHeadings = Array.from(scrollPage?.children?.iterator?.() || []) as any[];
    const block = topLevelHeadings.filter((candidate) => candidate.blockName === "atx-heading" || candidate.blockName === "setext-heading")[index];
    if (!block) return;
    const heading = block.domNode as HTMLElement | undefined;
    heading?.scrollIntoView({ behavior: "auto", block: "center" });
    const content = block.firstContentInDescendant?.();
    if (content?.setCursor) {
      content.setCursor(0, 0, true);
      this.instance.focus();
      return;
    }
    heading?.click();
    this.instance.focus();
  }
  destroy() {
    this.destroyed = true;
    if (this.mode === "source") this.editorPaper.insertBefore(this.root_ele, this.sourceShell);
    this.instance?.off("json-change", this.onJsonChange);
    this.instance?.destroy();
    this.editorPaper.classList.remove("is-source-mode");
    document.body.classList.remove("webnote-source-mode");
    this.root_ele.style.removeProperty("display");
    this.sourceShell.remove();
  }
}

export default MuyaEditor;
