import { createSignal, For, mapArray, Match, onMount, Show, Switch } from "solid-js";
import { initFiles, selectFile } from "../utils/method";
import { getEditor } from "./editor";
import {AiOutlineFileAdd,AiOutlineEdit, AiOutlineDelete, AiOutlineFolderAdd } from "solid-icons/ai"
import "../assets/css/filebar.css"
import { bus } from "../utils";

let editor:IEditor; 
bus.on('EditorLoad',(data)=>{
	editor = data;
})

const FileDesc = (props: { folder:IFoldList }) => {
	const [files,setFiles] = createSignal(props.folder.files,{equals:false})
	const [folderName,setFolderName]  = createSignal(props.folder.name)
	const [state,setState] = createSignal(true)

	onMount(()=>{
		registerHandler(props.folder.name,(op:IFileOP)=>{
			if(op.type=='create'){

			} else if(op.type=='delete')
				setFiles(files().filter(item=>item.name==op.name))
			else if(op.type=='rename')
				setFiles(files().map(item=>{if(item.name==op.name) item.name = op.newFile; return item}))
		})
	})
	return (
		<div>
			<div class="folder-title" onclick={(e)=>{selectFile(editor,e);setState(!state())}} >{folderName()}</div>
			<Show when={state()}>
				<For each={files()}>
					{(item) => 
						<div class="file-warp" data-uuid={item.uuid} onclick={(e)=>selectFile(editor,e)}>
							<div class="file-name">{item.name}</div>
							<div class="file-description">{item.description}</div>
						</div>}
				</For>
			</Show>
		</div>
	)
}
const [outlines, setOutlines] = createSignal<IOutLine[]>([])
const [files, setFiles] = createSignal<IFoldList[]>([])
const FileBar = () => {
	const [state, setState] = createSignal('file')
	const [filebarState, setFileBarState] = createSignal(true)
	const [folders,setFolders] = createSignal<string[]>([],{equals:false})
	onMount(()=>{
		registerHandler('',(op:IFileOP)=>{
			if(op.type=='create'){
				let origin = folders();
				origin.push(op.folder);
				setFolders(origin);
			}
			if(op.type=='delete')
				setFolders(folders().filter((item)=>item==op.folder))
			if(op.type=='rename')
				setFolders(folders().map((old)=>{old=op.newFolder;return old}))
		})
	})
	bus.on('FileBar',()=>{setFileBarState(!filebarState())})
	return (
		<Show when={filebarState()}>
			<div class="webnote-sidebar border-r-2 border-solid h-full w-[200px]">
				<div class="flex flex-row text-center w-full">
					<div class="sidebar-tab-wrapper w-1/2 my-0.5" onclick={() => { setState('file') }}>
						<div class="sidebar-tab-title">文件</div>
						<div class="sidebar-tab-border w-full h-1 bg-black" style={state() == "file" ? "display: inline-block;" : "display:none;"}></div>
					</div>
					<div class="sidebar-tab-wrapper w-1/2 my-0.5" onclick={() => { setState('outline');setOutlines(editor.getOutline()) }}>
						<div class="sidebar-tab-title">大纲</div>
						<div class="sidebar-tab-border w-full h-1 bg-black" style={state() == "outline" ? "display: inline-block;" : "display:none;"}></div>
					</div>
				</div>
				<div class="sidebar-content-wrapper">
					<div class="h-[25px]">
						<Show when={state() == "file"}>
							<div class="float-right"><AiOutlineFileAdd size="24px"/></div> 
							<div class="float-right"><AiOutlineFolderAdd size="24px"/></div> 
							<div class="float-right"><AiOutlineDelete size="24px"/></div> 
							<div class="float-right"><AiOutlineEdit size="24px"/></div> 
						</Show>
					</div>
					<Switch>
						<Match when={state() == "file"}>
							<For each={files()}>
								{(item) => <FileDesc folder={item}></FileDesc>}
							</For>
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
const folderMap = new Map<string,(IFileOp)=> void>()
const fileOPHandler = function(op:IFileOP){
	let func = folderMap.get(op.folder)
	if(func) func(op);
	else if(op.type=='create'){	
		func = folderMap.get('');
		func(op);
		setInterval(()=>{
			fileOPHandler(op);
		},500);
	}
}

const registerHandler = function(folder:string,handler:(IFileOp)=> void){
	folderMap.set(folder,handler);
}


export {files as getFiles,setFiles,setOutlines}
export default FileBar;