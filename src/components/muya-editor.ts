import {
  Muya, en, zh, MarkdownToHtml, InlineFormatToolbar, CodeBlockLanguageSelector,
  ImageResizeBar, ImageToolBar, LinkTools, ParagraphFrontButton,
  ParagraphFrontMenu, ParagraphQuickInsertMenu, PreviewToolBar,
  TableColumnToolbar, TableDragBar, TableRowColumMenu,
} from "@muyajs/core";
import "@muyajs/core/lib/core.css";

let mermaidWarmed = false;
function warmMermaid(muya: Muya) {
  if (mermaidWarmed) return;
  mermaidWarmed = true;
  // Start loading Mermaid as soon as Muya is initialized. A fixed delay made
  // the first user-authored diagram pay the full renderer startup cost.
  const example = "```mermaid\nflowchart TD\n  Start --> Done\n```";
  void new MarkdownToHtml(example, muya).renderHtml().catch(() => {
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
  root_ele: HTMLDivElement;
  state = 0;
  old_cursor: ICursor;
  tem_cursor: ICursor;
  need_update = new Set<HTMLElement>();
  private instance: Muya;

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
    warmMermaid(this.instance);
  }

  setValue(markdown: string) { this.instance?.setContent(markdown || ""); }
  getMd() { return this.instance?.getMarkdown() || ""; }
  getOutline(): IOutLine[] {
    return (this.instance?.getTOC() || []).map((item) => ({ level: item.lvl, title: item.content }));
  }
  getRoot() { return this.root_ele; }
  destroy() { this.instance?.destroy(); }

  // The old toolbar delegates editing commands through IEditor. Muya's native
  // floating menus now own these interactions; these remain for compatibility.
  setHeading(_level: number) { this.instance?.focus(); }
  setInlineFormat(_format: InlineFormat) { this.instance?.focus(); }
  setBlockFormat(_format: BlockFormat) { this.instance?.focus(); }
  alignTableItem(_align: TableAlignType) { this.instance?.focus(); }
  alterTable(_range: Range, _row: number, _col: number) { this.instance?.focus(); }
  createTable(_range: Range, _row: number, _col: number) { this.instance?.focus(); }
  deleteTable() { this.instance?.focus(); }
  insertNewLineBefore() { this.instance?.focus(); }
  insertNewLineAfter() { this.instance?.focus(); }
  promoteLine() { this.instance?.focus(); }
}

export default MuyaEditor;
