import { createSignal, For, onMount, Show } from "solid-js";
const MenuItem = (props:{item:IMenuItem}) =>{
	const [subShow,setSubShow] = createSignal(false)
	return (
		<div class="w-1/4 h-7 z-10 float-left text-base bg-slate-100" onmouseover={()=>setSubShow(true)} onmouseout={()=>setSubShow(false)}> 
			<div class="text-center">{props.item.content}</div>
			<div>
				<For each={props.item.subMenu}>
					{ (item) =>  
						<div class={item.className +" toolbar-menus-level2 text-center p-1 z-10 bg-white"} style={subShow()?"":"display:none"} onclick={(e)=>{
							if(item.click) item.click(window['editor'],e)
						}} >  {item.content}</div>
					}
				</For>
			</div>
		</div>
	)
}
export default MenuItem;