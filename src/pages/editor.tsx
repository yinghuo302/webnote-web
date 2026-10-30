import { createSignal, Show } from "solid-js";
import Editor from "../components/editor";
import WorkspaceSidebar from "../components/workspace-sidebar";

export default function EditorPage() {
  const [editor, setEditor] = createSignal<IEditor>();
  const [sidebarVisible, setSidebarVisible] = createSignal(true);
  return (
    <div class={`writer-workspace ${sidebarVisible() ? "" : "sidebar-collapsed"}`}>
      <WorkspaceSidebar editor={editor()} visible={sidebarVisible()} onToggleVisibility={() => setSidebarVisible(false)} />
      <Show when={!sidebarVisible()}>
        <button class="sidebar-reopen-toggle" type="button" onClick={() => setSidebarVisible(true)} aria-label="显示侧栏" title="显示侧栏">›</button>
      </Show>
      <section class="writer-canvas" aria-label="Markdown 写作区">
        <Editor onReady={setEditor} />
      </section>
    </div>
  );
}
