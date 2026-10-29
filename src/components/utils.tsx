import { ajax, bus } from "../utils";
import notify from "./notify";

function FileDrop(props: {
  tips: string;
  accept: string;
  handler: (files: FileList) => void;
}) {
  function prevent(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  function onDrop(event: DragEvent) {
    prevent(event);
    if (event.dataTransfer?.files) props.handler(event.dataTransfer.files);
  }

  return (
    <form class="image-upload-form" onDragEnter={prevent} onDragOver={prevent} onDrop={onDrop}>
      <label class="image-drop-target">
        <span class="image-drop-mark">↑</span>
        <span class="image-drop-title">{props.tips}</span>
        <span class="image-drop-hint">点击选择，或拖放到这里</span>
        <input
          class="hidden"
          type="file"
          accept={props.accept}
          onChange={(event) => {
            const files = event.currentTarget.files;
            if (files) props.handler(files);
            event.currentTarget.value = "";
          }}
        />
      </label>
    </form>
  );
}

export function uploadImg() {
  const upload = async (files: FileList) => {
    const file = files.item(0);
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await ajax.ajax({
        type: "POST",
        url: "/api/private/img",
        dataType: "raw",
        data: form,
      });
      if (result?.status !== "success" || !result.url) {
        notify("warning", "图片上传失败");
        return;
      }
      await navigator.clipboard.writeText(result.url);
      notify("success", "图片链接已复制，可粘贴到文档中");
    } catch {
      notify("danger", "图片上传或复制失败");
    }
  };

  bus.emit("Modal", {
    open: true,
    component: FileDrop,
    props: { tips: "上传图片到写作空间", accept: "image/*", handler: upload },
  });
}
