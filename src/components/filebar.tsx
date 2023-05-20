import { Accessor, createSignal, For, mapArray, Match, onMount, Setter, Show, Switch } from "solid-js";
import {  initFiles, selectFile } from "../utils/method";
import "../assets/css/filebar.css"
import { bus } from "../utils";

let editor: IEditor;
bus.on('EditorLoad', (data) => {
	editor = data;
})

function Files() {
	const [files, setFiles] = createSignal<IFileList[]>([])
	const [selectFile, setSelectFile] = createSignal('')
	onMount(() => {
		setFiles(initFiles())
	})
	bus.on('FileOp', (op) => {
		if (op.type == 'create')
			setFiles([...files(), { name: op.name, description: "" }])
		if (op.type == 'delete')
			setFiles(files().filter((item) => item.name != op.name))
		if (op.type == 'rename')
			setFiles(files().map((item) => {
				return {
					name: (item.name == op.name) ? op.otherName : item.name,
					description: item.description,
					uuid: item.uuid
				}
			}))
	})
	return (
		<For each={files()}>
			{(item) => <div class="file-warp" data-uuid={item.uuid} onclick={(e) => {
				setSelectFile(item.name)
			}}>
				<div class="file-name">{item.name}</div>
				<div class="file-description">{item.description}</div>
			</div>}
		</For>
	)
}

const FileBar = () => {
	const [state, setState] = createSignal('file')
	const [filebarState, setFileBarState] = createSignal(true)
	const [outlines, setOutlines] = createSignal<IOutLine[]>([])
	bus.on('FileBar', () => { setFileBarState(!filebarState()) })
	return (
		<Show when={filebarState()}>
			<div class="webnote-sidebar border-r-2 border-solid h-full w-[200px]">
				<div class="flex flex-row text-center w-full mt-1">
					<div class="flex flex-col w-1/2" onclick={() => { setState('file') }}>
						<div class="sidebar-tab-title">文件</div>
						<div class="sidebar-tab-border w-full h-1 bg-black" style={state() == "file" ? "display: inline-block;" : "display:none;"}></div>
					</div>
					<div class="flex flex-col w-1/2" onclick={() => { setState('outline'); setOutlines(editor.getOutline()) }}>
						<div class="sidebar-tab-title">大纲</div>
						<div class="sidebar-tab-border w-full h-1 bg-black" style={state() == "outline" ? "display: inline-block;" : "display:none;"}></div>
					</div>
				</div>
				<div class="sidebar-content-wrapper">
					<Switch>
						<Match when={state() == "file"}>
							<Files></Files>
						</Match>
						<Match when={state() == "outline"}>
							<For each={outlines()}>
								{(outline) => <div class={"outline-" + outline.level}>{outline.title}</div>}
							</For>
						</Match>
					</Switch>
				</div>
			</div>
		</Show>
	)
}
export default FileBar;