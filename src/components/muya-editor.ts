import {
  Muya, en, zh, MarkdownToHtml, InlineFormatToolbar, CodeBlockLanguageSelector,
  ImageResizeBar, ImageToolBar, LinkTools, ParagraphFrontButton,
  ParagraphFrontMenu, ParagraphQuickInsertMenu, PreviewToolBar,
  TableColumnToolbar, TableDragBar, TableRowColumMenu,
} from "@muyajs/core";
import { bus } from "../utils";

let mermaidWarmed = false;
function warmMermaid() {
  if (mermaidWarmed) return;
  mermaidWarmed = true;
  // MarkdownToHtml shares Muya's internal lazy renderer cache with diagram
  // blocks, so this exercises the exact Mermaid renderer used by previews.
  const example = "```mermaid\nflowchart TD\n  Start --> Done\n```";
  void new MarkdownToHtml(example).renderHtml().catch(() => {
    mermaidWarmed = false;
  });
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
  private destroyed = false;

  private readonly onJsonChange = () => {
    bus.emit("EditorChanged");
    if (this.mermaidConversionQueued) return;
    this.mermaidConversionQueued = true;
    Promise.resolve().then(() => {
      this.mermaidConversionQueued = false;
      if (!this.destroyed) this.convertActiveMermaidCodeBlock();
    });
  };

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
      markdown: initial,
      autoPairMarkdownSyntax: false,
      math: true,
      locale: zh || en,
      fontSize: 15,
      lineHeight: 1.85,
      codeBlockLineNumbers: true,
    });
    this.instance.init();
    this.instance.on("json-change", this.onJsonChange);
    warmMermaid();
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
