// import { getFiles, setFiles } from "../components/filebar";
import { bus } from ".";
import { openFileMenu } from "../components/utils";
import { ajax } from "./ajax";

export const initFiles = (): IFileList[] => {
	// let promise = ajax.ajax({
	// 	type:"GET",
	// 	url:"/api/files",
	// })
	// let res = []
	// promise.then((ret)=>{
	// 	res = ret.val
	// },()=>{
	// 	window.alert('文件列表获取失败')
	// })
	// return res
	return [{
		name: "name",
		description: "description",
	}, {
		name: "nfdslk",
		description: "description",
	}]
}
export const selectFile = function (editor: IEditor, file:IFileList) {
	if (!file.uuid) {
		editor.setValue("# 请输入标题\n")
		return;
	}
	let promise = ajax.ajax({
		type: 'GET',
		url: '/api/file',
		data: {
			uuid: file.uuid
		},
		responseType: 'text'
	})
	promise.then((str) => {
		editor.setValue(str)
	}, () => {
		window.alert('文件获取失败')
	})
}

export const saveFile = (editor: IEditor, file:IFileList) => {
	if (!file) {
		openFileMenu('create');
		return;
	}
	let promise = ajax.ajax({
		type: 'POST',
		url: "/api/file",
		data: {
			name: file.name,
			description: editor.getDescription(),
			uuid: file.uuid,
			content:editor.getMd()
		}
	})
	promise.then((ret) => {
		if (ret.status != 'success')
			window.alert('文件保存失败')
	}, () => {
		window.alert('服务器连接失败')
	})
}

export function shareFile(){

}

export function searchArticle(keyword: string, pageNum: number = 0): IArticle[] {
	// let ret:IArticle[]
	// let promise = ajax.ajax({
	// 	type:"GET",
	// 	url:"/api/articles",
	// 	data:{keyword:keyword},
	// })
	// promise.then(()=>{
	// 	window.alert("文章列表获取失败");
	// },(res)=>{
	// 	ret = res.val
	// })
	// return ret
	return [{
		title: "这是一个演示1",
		description: "这是一个演示1",
		uuid: 'test',
	}, {
		title: "这是一个演示2",
		description: "这是一个演示2",
		uuid: 'test',
	}]
}

export const getArticle = (id: string): IArticle => {
	return {
		title: "这是一个演示1",
		description: "这是一个演示1",
		uuid: 'test',
		content: "# 这是一个演示\n***加粗倾斜***，**加粗**，*倾斜*，~删除线~，行内代码:`int a = 0;`， 数学公式：$\\sqrt x$ 链接：[baidu](baidu.com)\n",
		user: {
			name: "昵称",
			description: "这个人很懒，没有描述",
			avator: "/favicon.ico"
		}
	}
	// let ret:IArticle
	// let promise = ajax.ajax({
	// 	type:"GET",
	// 	url:"/api/articles",
	// 	data:{id:id},
	// })
	// promise.then(()=>{
	// 	window.alert("文章列表获取失败");
	// },(res)=>{
	// 	ret = res.val
	// })
	// return ret
}

export function getUser(id?:number):IUser{
	return null
}