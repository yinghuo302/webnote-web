import { createSignal, For, onMount, Show } from "solid-js";
import "../assets/css/menu.css"
const MenuItem = (props:{item:IMenuItem}) =>{
	const [subShow,setSubShow] = createSignal(false)
	return (
		<div class="toolbar-menus-level1" onmouseover={()=>setSubShow(true)} onmouseout={()=>setSubShow(false)}> 
			<div class="text-center">{props.item.content}</div>
			<div>
				<For each={props.item.subMenu}>
					{ (item) =>  
						<div class={item.className +" toolbar-menus-level2 text-center"} style={subShow()?"":"display:none"} onclick={(e)=>{
							if(item.click) item.click(window['editor'],e)
						}} >  {item.content}</div>
					}
				</For>
			</div>
		</div>
	)
}
export default MenuItem;