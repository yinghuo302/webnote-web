import { notificationService } from "@hope-ui/solid";
import { getFiles, setFiles } from "../components/filebar";
import { ajax } from "./ajax";

export const initFiles = ():IFoldList[] =>{
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
		name:"folder",
		files:[{
			name:"name",
			description:"description",
		},{
			name:"nfdslk",
			description:"description",
		}]
	}]
}
let select_file:HTMLElement = null
export const selectFile = function(editor:IEditor,e:Event){
	let node = e.target as HTMLElement
	if(node.classList.contains('file-name')||
		node.classList.contains('file-description')){
			node = node.parentElement as HTMLElement
	}
	if(select_file){
		select_file.classList.remove('file-selected')
		node.contentEditable = 'false'
	}
	node.classList.add('file-selected')
	select_file = node 
	if(node.classList.contains('file-warp')){
		if(!node.hasAttribute('data-uuid')) {
			editor.setValue("# 请输入标题\n")
			return ;
		}
		let promise =  ajax.ajax({
			type:'GET',
			url:'/api/file',
			data:{
				uuid:node.getAttribute('uuid')
			},
			responseType:'text'
		})
		promise.then((str)=>{
			editor.setValue(str)
		},()=>{
			window.alert('文件获取失败')
		})
	}
} 

export const saveFile = (editor:IEditor, event:Event) => {
	let node = editor.select_file
	if(!node) return ;
	if(!node.classList.contains('file-warp')) return;
	let folder = node.parentNode.firstChild as HTMLElement
	let promise = ajax.ajax({
		type:'POST',
		url:"/api/file",
		data:{
			name: (node.firstChild as HTMLElement).innerText,
			folder:folder.innerText,
			description:(node.lastChild as HTMLElement).innerText,
			uuid:''
		}
	})
	promise.then((ret)=>{
		if(ret.status!='success')
			window.alert('文件保存失败')
	},()=>{
		window.alert('服务器连接失败')
	})
}

const getSelectedFile = function():[string,string] {
	return [",",""]
}

export const renameFile = function(){
	let folders = getFiles()
	let new_files:IFoldList[] = []
	const [folderName,fileName] = getSelectedFile()
	if(folderName==''||fileName=='')
		return 
	for(let i=0;i<folders.length;i++){
		let folder = folders[i]
		if(folders[i].name==folderName)
			folder.files.filter((item)=>item.name==fileName)
		new_files.push(folder)
	}
	setFiles(new_files)
}

export const deleteFile = function(){
	let folders = getFiles()
	let new_files:IFoldList[] = []
	const [folderName,fileName] = getSelectedFile()
	if(folderName==''||fileName=='')
		return 
	for(let i=0;i<folders.length;i++){
		let folder = folders[i]
		if(folders[i].name==folderName)
			folder.files.filter((item)=>item.name==fileName)
		new_files.push(folder)
	}
	setFiles(new_files)
}


export const addFile = function(){
	let folders = getFiles()
	let new_files:IFoldList[] = []
	const [folderName,fileName] = getSelectedFile()
	if(folderName==''||fileName=='')
		return 
	for(let i=0;i<folders.length;i++){
		let folder = folders[i]
		if(folders[i].name==folderName)
			folder.files.filter((item)=>item.name==fileName)
		new_files.push(folder)
	}
	setFiles(new_files)
}

export function searchArticle(keyword:string):IArticle[]{
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
		title:"这是一个演示1",
		description:"这是一个演示1",
		uuid:'test',
	},{
		title:"这是一个演示2",
		description:"这是一个演示2",
		uuid:'test',
	}]
}

export const getArticle = (id:string):IArticle =>{
	return {
		title:"这是一个演示1",
		description:"这是一个演示1",
		uuid:'test',
		content:"# 这是一个演示\n***加粗倾斜***，**加粗**，*倾斜*，~删除线~，行内代码:`int a = 0;`， 数学公式：$\\sqrt x$ 链接：[baidu](baidu.com)\n",
		user:{
			name:"昵称",
			description:"这个人很懒，没有描述",
			avator:"/favicon.ico"
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
// type notificationType = "info"|"warning"|"success"|"danger"
// export function notify(type:notificationType,title:string,content:string){
// 	notificationService.show({
//         status: type,
//         title: title,
//         description: content,
// 	});
// }