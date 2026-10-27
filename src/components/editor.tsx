import { onCleanup, onMount } from "solid-js";
import { bus } from "../utils";
import MilkdownEditor from "./milkdown-editor";

const Editor = () => {
  let root: HTMLDivElement;
  let editor: MilkdownEditor;

  onMount(() => {
    editor = new MilkdownEditor(root);
    window["editor"] = editor;
  });

  const reset = () => editor?.setValue("# 请输入标题");
  bus.on("Logout", reset);
  onCleanup(() => {
    bus.off("Logout", reset);
    if (window["editor"] === editor) window["editor"] = undefined;
    void editor?.destroy();
  });

  return (
    <div class="editor-stage">
      <div class="editor-paper">
        <div ref={root} class="milkdown-root" />
      </div>
    </div>
  );
};

export default Editor;
