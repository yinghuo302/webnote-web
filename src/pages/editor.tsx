import { createSignal } from "solid-js";
import Editor from "../components/editor";
import WorkspaceSidebar from "../components/workspace-sidebar";

export default function EditorPage() {
  const [editor, setEditor] = createSignal<IEditor>();
  return (
    <div class="writer-workspace">
      <WorkspaceSidebar editor={editor()} />
      <section class="writer-canvas" aria-label="Markdown 写作区">
        <div class="canvas-caption">
          <span class="canvas-caption-dot" />
          <span>Markdown · GFM</span>
          <span class="canvas-caption-separator">/</span>
          <span>Muya 即时渲染</span>
        </div>
        <Editor onReady={setEditor} />
      </section>
    </div>
  );
}
