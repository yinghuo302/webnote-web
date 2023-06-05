import { createSignal, For, Match, onMount, Show, Switch } from "solid-js";
// import "../assets/css/filebar.css"
import { bus } from "../utils";
import { Files } from "./files";

const FileBar = () => {
	const [state, setState] = createSignal(true)
	const [filebarState, setFileBarState] = createSignal(true)
	const [outlines, setOutlines] = createSignal<IOutLine[]>([])
	bus.on('FileBar', () => { setFileBarState(!filebarState()) })
	return (
		<Show when={filebarState()}>
			<div class="border-r-2 border-solid h-full w-[200px] flex-shrink-0">
				<div class="flex flex-row text-center w-full mt-1">
					<div class="flex flex-col w-1/2" onclick={() => { setState(true) }}>
						<div>文件</div>
						<div class="w-full h-1 bg-black" style={state() ? "display: inline-block;" : "display:none;"}></div>
					</div>
					<div class="flex flex-col w-1/2" onclick={() => { setState(false); setOutlines((window['editor'] as IEditor).getOutline()) }}>
						<div>大纲</div>
						<div class="w-full h-1 bg-black" style={state()?"display:none;" :"display: inline-block;" }></div>
					</div>
				</div>
				<div class="w-full h-full overflow-auto">
					<div class="w-full" style={state()?"display: inline-block;" : "display:none;"}>
						<Files></Files>
					</div>
					<div style={state()?"display:none;" :"display: inline-block;" }>
						<For each={outlines()}>
							{(outline) => <div class={"outline-" + outline.level}>{outline.title}</div>}
						</For>
					</div>
					
				</div>
			</div>
		</Show>
	)
}
export default FileBar;