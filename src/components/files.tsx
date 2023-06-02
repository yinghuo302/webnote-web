import { createSignal, For, onMount } from "solid-js"
import { ajax, bus } from "../utils"
import { getFileContent, shareFile } from "../utils/method"
import notify from "./notify"
import { openFileMenu } from "./utils"

export function Files() {
	const [files, setFiles] = createSignal<IFileList[]>([])
	const [selectFile, setSelectFile] = createSignal<IFileList>()
	function saveFile(editor: IEditor,file:IFileList):IFileList {
		if(!file) return
		let promise = ajax.ajax({
			type: 'POST',
			url: "/api/private/file",
			data: {
				name: file.name,
				description: editor.getDescription(),
				fileId: file.fileId,
				content:editor.getMd()
			}
		})
		promise.then((ret) => {
			if (ret.status != 'success')
				notify('warning','文件保存失败')
			else{
				notify('success','文件保存成功')
				file.fileId = ret.fileId
				setFiles(files().map((item) => file.name == item.name ? file: item))
			}
		}, () => {
			notify('danger','服务器连接失败')
		})
	}
	function initFiles() {
		let promise = ajax.ajax({
			type:"GET",
			url:"/api/private/files",
		})
		promise.then((ret)=>{
			if(ret.status!='success')
				notify('danger','文件列表获取失败')
			else
				setFiles(ret.files)
		},()=>{
			notify('danger','文件列表获取失败')
		})
	}
	onMount(initFiles)
	bus.on('FileOp', (op) => {
		if (op.type == 'create') {
			setSelectFile({ name: op.name, description: "" })
			setFiles([...files(), { name: op.name, description: "" }])
		}
		if (op.type == 'delete')
			setFiles(files().filter((item) => item.name != op.name))
		if (op.type == 'rename')
			setFiles(files().map((item) => {
				return {
					name: (item.name == op.name) ? op.otherName : item.name,
					description: item.description,
					uuid: item.fileId
				}
			}))
		if (op.type == 'save') {
			if (!selectFile()) { openFileMenu('create'); return; }
			saveFile(window['editor'], selectFile())
		}
		if (op.type == 'share')
			shareFile(selectFile())
	})
	return (
		<For each={files()}>
			{(item) => <div class="h-16 w-full pl-1 pt-2 border-solid border" data-uuid={item.fileId} onclick={(e) => {
				setSelectFile(item); getFileContent(window['editor'], item);
			}} style={{
				background: (selectFile()&&item.name == selectFile().name) ? "#eeeeee" : "#fafafa"
			}}>
				<div class="file-name">{item.name}</div>
				<div class="file-description">{item.description}</div>
			</div>}
		</For>
	)
}