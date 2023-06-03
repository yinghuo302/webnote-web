import { onCleanup, onMount } from "solid-js";
import { bus } from "../utils";
import ZEditor from "../../lib";
const Editor = () =>{
	let root_ele:any = null;
	onMount(()=>{
		let editor = new ZEditor(root_ele);
		editor.setValue("# 请输入标题")
		window['editor'] = editor
	});
	bus.on('Logout',()=>{
		window['editor'].setValue("# 请输入标题")
	})
	onCleanup(()=>{
		window['editor'] = undefined
	})

	return (
		<div ref={root_ele} class="w-full h-full"/>
	) 
}
export default Editor;