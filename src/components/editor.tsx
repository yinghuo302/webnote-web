import { onMount } from "solid-js";
import { bus } from "../utils";
import ZEditor from "../../lib";


let editor = null
const Editor = () =>{
	let root_ele:any = null;

	onMount(()=>{
		editor = new ZEditor(root_ele);
		bus.emit("EditorLoad",editor);
	});

	return (
		<div ref={root_ele} class="w-full h-full"/>
	) 
}
export function getEditor():IEditor{
	return editor
}
export default Editor;