import { Editor, rootCtx, defaultValueCtx, editorViewCtx } from "@milkdown/kit/core";
import { commonmark, toggleStrongCommand, toggleEmphasisCommand, toggleInlineCodeCommand, wrapInHeadingCommand, wrapInBlockquoteCommand, wrapInBulletListCommand, wrapInOrderedListCommand, createCodeBlockCommand } from "@milkdown/kit/preset/commonmark";
import { gfm, insertTableCommand, setAlignCommand, deleteSelectedCellsCommand, toggleStrikethroughCommand, addRowAfterCommand, addColAfterCommand, selectRowCommand, selectColCommand } from "@milkdown/kit/preset/gfm";
import { callCommand, getMarkdown, replaceAll } from "@milkdown/kit/utils";
import { isInTable, selectedRect } from "@milkdown/kit/prose/tables";
import { createParser } from "@milkdown/plugin-highlight/lowlight";
import { highlight, highlightPluginConfig } from "@milkdown/plugin-highlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);
const codeParser = createParser(lowlight);

/** A small compatibility layer while the app migrates away from the hand-built editor. */
export class MilkdownEditor implements IEditor {
  root_ele: HTMLDivElement;
  state = 0;
  old_cursor: ICursor;
  tem_cursor: ICursor;
  need_update = new Set<HTMLElement>();
  private instance: Editor;
  private ready: Promise<void>;

  constructor(root: HTMLDivElement, initial = "# 请输入标题") {
    this.root_ele = root;
    this.ready = this.create(initial);
  }

  private async create(initial: string) {
    this.instance = await Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, this.root_ele);
        ctx.set(defaultValueCtx, initial);
        ctx.set(highlightPluginConfig.key, { parser: codeParser });
      })
      .use(commonmark)
      .use(gfm)
      .use(highlight)
      .create();
  }

  async destroy() {
    await this.ready;
    await this.instance?.destroy();
  }

  async setValue(mdtext: string) {
    await this.ready;
    this.instance.action(replaceAll(mdtext || ""));
  }

  getMd() {
    if (!this.instance) return "";
    return this.instance.action(getMarkdown());
  }

  getOutline(): IOutLine[] {
    return Array.from(this.root_ele.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((heading) => ({
      level: Number(heading.tagName.substring(1)),
      title: heading.textContent || "",
    }));
  }

  getRoot() { return this.root_ele; }

  private run(command: any, payload?: any) {
    if (this.instance) this.instance.action(callCommand(command.key, payload));
  }

  setHeading(level: number) { this.run(wrapInHeadingCommand, level); }
  setInlineFormat(format: InlineFormat) {
    if (format === "**" || format === "***") this.run(toggleStrongCommand);
    else if (format === "*") this.run(toggleEmphasisCommand);
    else if (format === "~") this.run(toggleStrikethroughCommand);
    else if (format === "`") this.run(toggleInlineCodeCommand);
    else if (format === "link" || format === "img") {
      const url = window.prompt(format === "img" ? "请输入图片地址" : "请输入链接地址", "https://");
      if (!url || !this.instance) return;
      const view = this.instance.ctx.get(editorViewCtx);
      const { from, to } = view.state.selection;
      const selected = view.state.doc.textBetween(from, to, " ");
      const label = selected || (format === "img" ? "图片描述" : "链接文字");
      if (format === "link") {
        const tr = view.state.tr;
        const start = from;
        if (!selected) tr.insertText(label, from, to);
        const end = start + label.length;
        tr.addMark(start, end, view.state.schema.marks.link.create({ href: url }));
        view.dispatch(tr);
      } else {
        const image = view.state.schema.nodes.image.create({ src: url, alt: label });
        view.dispatch(view.state.tr.replaceSelectionWith(image));
      }
    }
  }
  setBlockFormat(format: BlockFormat) {
    if (format === "quote") this.run(wrapInBlockquoteCommand);
    else if (format === "ul") this.run(wrapInBulletListCommand);
    else if (format === "ol") this.run(wrapInOrderedListCommand);
    else if (format === "code") this.run(createCodeBlockCommand);
  }
  alignTableItem(align: TableAlignType) { this.run(setAlignCommand, align); }
  alterTable(_range: Range, _row: number, _col: number) { /* not exposed by this first-pass adapter */ }
  createTable(_range: Range, row: number, col: number) { this.run(insertTableCommand, { row, col }); }
  deleteTable() { this.run(deleteSelectedCellsCommand); }
  addTableRowAfter() { this.run(addRowAfterCommand); }
  addTableColumnAfter() { this.run(addColAfterCommand); }
  deleteCurrentTableRow() { this.selectCurrentTableLine("row"); }
  deleteCurrentTableColumn() { this.selectCurrentTableLine("column"); }
  private selectCurrentTableLine(axis: "row" | "column") {
    if (!this.instance) return;
    const view = this.instance.ctx.get(editorViewCtx);
    if (!isInTable(view.state)) return;
    const rect = selectedRect(view.state);
    const position = view.state.selection.from;
    if (axis === "row") this.run(selectRowCommand, { index: rect.top, pos: position });
    else this.run(selectColCommand, { index: rect.left, pos: position });
    this.run(deleteSelectedCellsCommand);
  }
  insertNewLineBefore() { /* native Enter behavior is preferred */ }
  insertNewLineAfter() { /* native Enter behavior is preferred */ }
  promoteLine() { /* native list indentation shortcuts are preferred */ }
}

export default MilkdownEditor;
