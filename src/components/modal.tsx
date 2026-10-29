import { createSignal, Show } from "solid-js";
import { Dynamic, Portal } from "solid-js/web";
import { bus } from "../utils";

export function Modal() {
  const [state, setState] = createSignal<ModalState>({ component: null, open: false });
  bus.on("Modal", (next: ModalState) => setState(next));

  function close() {
    setState((current) => ({ ...current, open: false }));
  }

  return (
    <Show when={state().open}>
      <Portal mount={document.body}>
        <div class="modal-layer" role="presentation">
          <button class="modal-backdrop" type="button" aria-label="关闭弹窗" onClick={close} />
          <div class="modal-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <Dynamic component={state().component} {...state().props} />
          </div>
        </div>
      </Portal>
    </Show>
  );
}
