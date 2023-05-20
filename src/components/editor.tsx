import { onMount } from "solid-js";
import { bus } from "../utils";
import ZEditor from "../../lib";
const Editor = () =>{
	let root_ele:any = null;

	onMount(()=>{
		window['editor'] = new ZEditor(root_ele);
		bus.emit("EditorLoad",window['editor'] as IEditor);
	});

	return (
		<div ref={root_ele} class="w-full h-full"/>
	) 
}
export default Editor;