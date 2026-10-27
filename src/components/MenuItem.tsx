import { createSignal, For, Show } from "solid-js";

const MenuItem = (props: { item: IMenuItem }) => {
  const [open, setOpen] = createSignal(false);
  return (
    <div class="toolbar-menu-wrap" onMouseLeave={() => setOpen(false)}>
      <button class="toolbar-menu-button" aria-expanded={open()} onClick={() => setOpen(!open())}>
        {props.item.content}<span class="toolbar-chevron">⌄</span>
      </button>
      <Show when={open()}>
        <div class="toolbar-dropdown">
          <For each={props.item.subMenu}>
            {(item) => (
              <button class="toolbar-dropdown-item" onClick={(e) => {
                item.click?.(window["editor"], e);
                setOpen(false);
              }}>{item.content}</button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default MenuItem;
