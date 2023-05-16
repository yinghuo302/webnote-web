import { bus } from ".";
import { saveFile } from "./method";

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
		content:"导入",
		className:"toolbar-menus-level2",
	},{
		content:"导出为PDF",
		className:"toolbar-menus-level2",
	},{
		content:"保存",
		className:"toolbar-menus-level2",
		click:saveFile
	},{
		content:"分享",
		className:"toolbar-menus-level2"
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
	},{
		content:"斜体",
		className:"toolbar-menus-level2",
	},{
		content:"删除线",
		className:"toolbar-menus-level2",
	},{
		content:"行内代码",
		className:"toolbar-menus-level2",
	},{
		content:"超链接",
		className:"toolbar-menus-level2",
	},{
		content:"图像",
		className:"toolbar-menus-level2",
	}]
}

const block_format:IMenuItem = {
	content:"段落格式",
	className:"toolbar-menus-level1",
	subMenu:[{
		content:"引用",	
		className:"toolbar-menus-level2",
	},{
		content:"无序列表",
		className:"toolbar-menus-level2",
	},{
		content:"有序列表",
		className:"toolbar-menus-level2",
	},{
		content:"代码块",
		className:"toolbar-menus-level2",
	},{
		content:"公式块",
		className:"toolbar-menus-level2",
	}]
}

const table_menu:IMenuItem = {
	content:"表格",
	className:"toolbar-menus-level1",
	subMenu:[{
		content:"左对齐",	
		className:"toolbar-menus-level2",
	},{
		content:"右对齐",
		className:"toolbar-menus-level2",
	},{
		content:"居中",
		className:"toolbar-menus-level2",
	},{
		content:"在下方添加一行",
		className:"toolbar-menus-level2",
	},{
		content:"在下方添加一行",
		className:"toolbar-menus-level2",
	},{
		content:"在左侧加一行",
		className:"toolbar-menus-level2",
	},{
		content:"在下方添加一行",
		className:"toolbar-menus-level2",
	}]
}

export class Config{
	static menu_items:IMenuItem[] = [file_menu,head_menu,inline_format,block_format,table_menu]
};
