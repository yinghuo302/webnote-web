import { createSignal, For, onCleanup, onMount } from "solid-js";
import { Portal } from "solid-js/web";
import { bus } from "../utils";

type NoticeKind = "info" | "warning" | "danger" | "success";
type ToastItem = { id: number; type: NoticeKind; content: string };
let nextToastId = 0;

export function ToastHost() {
  const [items, setItems] = createSignal<ToastItem[]>([]);
  const timers = new Set<number>();
  const onToast = (item: ToastItem) => {
    setItems((current) => [...current, item]);
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      setItems((current) => current.filter((toast) => toast.id !== item.id));
    }, 3600);
    timers.add(timer);
  };

  onMount(() => bus.on("Toast", onToast));
  onCleanup(() => {
    bus.off("Toast", onToast);
    timers.forEach((timer) => window.clearTimeout(timer));
  });

  return (
    <Portal mount={document.body}>
      <div class="toast-stack" aria-live="polite" aria-atomic="false">
        <For each={items()}>{(item) => (
          <div class={`toast-item toast-${item.type}`} role="status">
            <span>{item.content}</span>
            <button type="button" aria-label="关闭通知" onClick={() => setItems((current) => current.filter((toast) => toast.id !== item.id))}>×</button>
          </div>
        )}</For>
      </div>
    </Portal>
  );
}

export default function notify(type: NoticeKind, content: string) {
  bus.emit("Toast", { id: ++nextToastId, type, content });
}
