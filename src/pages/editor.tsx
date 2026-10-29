import { createSignal } from "solid-js";
import Editor from "../components/editor";
import WorkspaceSidebar from "../components/workspace-sidebar";

export default function EditorPage() {
  const [editor, setEditor] = createSignal<IEditor>();
  const [sidebarVisible, setSidebarVisible] = createSignal(true);
  return (
    <div class={`writer-workspace ${sidebarVisible() ? "" : "sidebar-collapsed"}`}>
      <WorkspaceSidebar editor={editor()} visible={sidebarVisible()} />
      <section class="writer-canvas" aria-label="Markdown 写作区">
        <div class="canvas-caption">
          <span class="canvas-caption-dot" />
          <span>Markdown · GFM</span>
          <span class="canvas-caption-separator">/</span>
          <span>Muya 即时渲染</span>
          <button class="sidebar-visibility-toggle" type="button" onClick={() => setSidebarVisible((visible) => !visible)} aria-expanded={sidebarVisible()}>
            {sidebarVisible() ? "隐藏侧栏" : "显示侧栏"}
          </button>
        </div>
        <Editor onReady={setEditor} />
      </section>
    </div>
  );
}
