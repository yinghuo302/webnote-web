import { onCleanup, onMount } from "solid-js";
import MuyaEditor from "./muya-editor";

const Editor = (props: { onReady?: (editor: IEditor) => void }) => {
  let root: HTMLDivElement;
  let editor: MuyaEditor;

  onMount(() => {
    editor = new MuyaEditor(root);
    window["editor"] = editor;
    props.onReady?.(editor);
  });

  onCleanup(() => {
    if (window["editor"] === editor) window["editor"] = undefined;
    void editor?.destroy();
  });

  return (
    <div class="editor-stage">
      <div class="editor-paper">
        <div ref={root} class="mu-container muya-root" />
      </div>
    </div>
  );
};

export default Editor;
