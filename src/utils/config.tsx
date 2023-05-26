import { ValidComponent } from "solid-js";
import { bus } from ".";
import { alterTable, createTable, FileMenu, ImgUpLoad, openFileMenu, uploadImg } from "../components/utils";
import { shareFile } from "./method";

const file_menu:IMenuItem = {
	content:"文件",
	className:"toolbar-menus-level1",
	subMenu:[{
		content:"侧边栏",
		className:"toolbar-menus-level2",
		click : (editor, event) =>{
			bus.emit('FileBar')
		}
	},{
		content:"新建文件",
		className:"toolbar-menus-level2",
		click(editor, e) {
			openFileMenu('create')
		},
	},{
		content:"删除文件",
		className:"toolbar-menus-level2",
		click(editor, e) {
			openFileMenu('delete')
		},
	},{
		content:"重命名文件",
		className:"toolbar-menus-level2",
		click(editor, e) {
			openFileMenu('rename')
		},
	},{
		content:"上传图像",
		className:"toolbar-menus-level2",
		click:uploadImg
	},{
		content:"保存",
		className:"toolbar-menus-level2",
		click(editor,e){
			bus.emit('FileOp',{type:"save"})
		}
	},{
		content:"分享",
		className:"toolbar-menus-level2",
		click(editor, e) {
			bus.emit('FileOp',{
				type:"share"
			})
		},
	}]
}

const head_menu:IMenuItem = {
	content:"标题",
	className:"toolbar-menus-level1",
	subMenu:[{
		content:"一级标题",
		className:"toolbar-menus-level2",
		click: (editor, event) => {
			editor.setHeading(1)
		}
	},{
		content:"二级标题",
		className:"toolbar-menus-level2",
		click : (editor, event) => {
			editor.setHeading(2)
		}
	},{
		content:"三级标题",
		className:"toolbar-menus-level2",
		click : (editor, event) => {
			editor.setHeading(3)
		}
	},{
		content:"四级标题",
		className:"toolbar-menus-level2",
		click : (editor, event) => {
			editor.setHeading(4)
		}
	},{
		content:"五级标题",
		className:"toolbar-menus-level2",
		click :(editor, event) =>{
			editor.setHeading(5)
		}
	},{
		content:"六级标题",
		className:"toolbar-menus-level2",
		click:(editor, event) => {
			editor.setHeading(6)
		}
	}]
}

const inline_format:IMenuItem ={
	content:"行内格式",
	className:"toolbar-menus-level1",
	subMenu:[{
		content:"粗体",
		className:"toolbar-menus-level2",
		click(editor, e) {
			editor.setInlineFormat('**')
		},
	},{
		content:"斜体",
		className:"toolbar-menus-level2",
		click(editor,e){
			editor.setInlineFormat('*')
		}
	},{
		content:"删除线",
		className:"toolbar-menus-level2",
		click(editor,e){
			editor.setInlineFormat('~')
		}
	},{
		content:"行内代码",
		className:"toolbar-menus-level2",
		click(editor,e){
			editor.setInlineFormat('`')
		}
	},{
		content:"超链接",
		className:"toolbar-menus-level2",
		click(editor,e){
			editor.setInlineFormat('link')
		}
	},{
		content:"图像",
		className:"toolbar-menus-level2",
		click(editor,e){
			editor.setInlineFormat('img')
		}
	}]
}

const block_format:IMenuItem = {
	content:"段落格式",
	className:"toolbar-menus-level1",
	subMenu:[{
		content:"引用",	
		className:"toolbar-menus-level2",
		click(editor,e){
			editor.setBlockFormat('quote')
		}
	},{
		content:"无序列表",
		className:"toolbar-menus-level2",
		click(editor,e){
			editor.setBlockFormat('ul')
		}
	},{
		content:"有序列表",
		className:"toolbar-menus-level2",
		click(editor,e){
			editor.setBlockFormat('ol')
		}
	},{
		content:"代码块",
		className:"toolbar-menus-level2",
		click(editor,e){
			editor.setBlockFormat('code')
		}
	},{
		content:"公式块",
		className:"toolbar-menus-level2",
		click(editor,e){
			editor.setBlockFormat('math')
		}
	}]
}

const table_menu:IMenuItem = {
	content:"表格",
	className:"toolbar-menus-level1",
	subMenu:[{
		content:"左对齐",	
		className:"toolbar-menus-level2",
		click(editor, e) {
			editor.alignTableItem('left')
		},
	},{
		content:"右对齐",
		className:"toolbar-menus-level2",
		click(editor, e) {
			editor.alignTableItem('right')
		},
	},{
		content:"居中",
		className:"toolbar-menus-level2",
		click(editor, e) {
			editor.alignTableItem('center')
		},
	},{
		content:"修改表格大小",
		className:"toolbar-menus-level2",
		click:alterTable
	},{
		content:"插入表格",
		className:"toolbar-menus-level2",
		click:createTable
	}]
}

export class Config{
	static menu_items:IMenuItem[] = [file_menu,head_menu,inline_format,block_format,table_menu]
};
