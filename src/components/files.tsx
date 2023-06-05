import { createRoot, createSignal, For, onMount } from "solid-js"
import { ajax, bus } from "../utils"
import notify from "./notify"
import { openFileMenu } from "./utils"

export const getFileContent = function (editor: IEditor,file:IFileList) {
	if (!file.fileId) {
		editor.setValue("# 请输入标题")
		return;
	}
	let promise = ajax.ajax({
		type: 'GET',
		url: '/api/private/file',
		data: {
			id: file.fileId
		},
	})
	promise.then((ret) => {
		if(ret.status!="success")
			notify("danger","文章内容获取失败")
		else
			editor.setValue(ret.content)
	}, () => {
		notify('danger','文件获取失败')
	})
}

export function shareFile(file:IFileList){
	if(!file||!file.fileId) {notify("warning","请先保存文件或选中文件")}
	let promise = ajax.ajax({
		type: 'POST',
		url: "/api/private/share",
		dataType:"queryStr",
		data: {id:file.fileId}
	})
	promise.then((ret) => {
		if (ret.status != 'success')
			notify('warning','文件分享失败')
		else{
			notify('success','文件分享成功')
		}
	}, () => {
		notify('danger','服务器连接失败')
	})
}



export function Files() {
	const [files, setFiles] = createSignal<IFileList[]>([])
	const [selectFile, setSelectFile] = createSignal<IFileList>()
	function saveFile(editor: IEditor,file:IFileList):IFileList {
		if(!file) return
		let content = editor.getMd()
		let promise = ajax.ajax({
			type: 'POST',
			url: "/api/private/file",
			data: {
				name: file.name,
				description: content.substring(0,30),
				fileId: file.fileId,
				content:content
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
	bus.on('Login',initFiles)
	bus.on('Logout',()=>{
		setFiles([])
	})
	bus.on('FileOp', (op) => {
		if (op.type == 'create') {
			setSelectFile({ name: op.name, description: "" })
			setFiles([...files(), { name: op.name, description: "" }])
		}
		if (op.type == 'delete'){
			if(!selectFile()) return
			if(!selectFile().fileId){
				setFiles(files().filter((item) => item.name != selectFile().name))
				setSelectFile(null);
				(window['editor'] as IEditor).setValue("# 请输入标题")
				return 
			} 
			ajax.ajax({
				type:"DELETE",
				url:"/api/private/file?id=" + selectFile().fileId
			}).then((ret)=>{
				if(ret.status=='success'){
					setFiles(files().filter((item) => item.name != op.name))
					setSelectFile(null);
					(window['editor'] as IEditor).setValue("# 请输入标题")
				}
				else
					notify('warning','文件删除失败')
			},()=>{
				notify('danger','文件列表获取失败')
			})
		}
		if (op.type == 'rename')
			setFiles(files().map((item) => {
				return {
					name: (item.name == op.name) ? op.otherName : item.name,
					description: item.description,
					uuid: item.fileId
				}
			}))
		if (op.type == 'save') {
			if(op.name){
				setSelectFile({ name: op.name, description: "" })
				setFiles([...files(), { name: op.name, description: "" }])
			}
			if (!selectFile()) { openFileMenu('save'); }
			saveFile(window['editor'], selectFile())
		}
		if (op.type == 'share')
			shareFile(selectFile())
	})
	return (
		<For each={files()}>
			{(item) => <div class="h-20 w-full pl-1 pt-2 border-solid border overflow-hidden" data-uuid={item.fileId} onclick={(e) => {
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