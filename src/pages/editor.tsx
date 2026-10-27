import { For } from "solid-js";
import Editor from "../components/editor";
import FileBar from "../components/filebar";
import MenuItem from "../components/MenuItem";
import { Config } from "../utils/config";

const EditorPage = () => (
  <main class="workspace-shell">
    <FileBar />
    <section class="workspace-main">
      <header class="workspace-header">
        <div class="workspace-brand">
          <div class="workspace-mark">w</div>
          <div><div class="workspace-title">写作空间</div><div class="workspace-subtitle">把想法，写成值得分享的内容</div></div>
        </div>
        <div class="workspace-header-right">
          <span class="workspace-status"><i /> 本地草稿</span>
          <span class="workspace-shortcut">Markdown · GFM</span>
        </div>
      </header>
      <nav class="workspace-toolbar" aria-label="编辑器工具栏">
        <div class="toolbar-group-label">编辑</div>
        <For each={Config.menu_items}>{(item) => <MenuItem item={item} />}</For>
        <div class="toolbar-spacer" />
        <div class="toolbar-hint">快速建表：输入 <code>|3x4|</code> 后按空格（3列 × 4行）</div>
      </nav>
      <Editor />
    </section>
  </main>
);

export default EditorPage;
