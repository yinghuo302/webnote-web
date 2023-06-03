import { bus } from ".";
import notify from "../components/notify";
import { ajax } from "./ajax";



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

export function Logout() {
	let ret:IArticle
	let promise = ajax.ajax({
		type:"GET",
		url:"/api/private/logout",
	})
	promise.then((ret)=>{
		if(ret.status=='success'){
			bus.emit('Logout')
			notify('info',"已注销")
		}else{
			notify('warning','注销失败')
		}
	},()=>{
		notify('danger',"服务器连接失败")
	})
	return ret
}

