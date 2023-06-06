import { Accessor, createEffect, createSignal, For, Match, onMount, Setter, Show, Switch } from "solid-js"
import { bus } from "../utils"

function PaginationItem(props: { curPage: number, pageNum: number,maxPage:number,onclick:(Event)=>void}) {
	return <Show when={props.pageNum>0&&props.pageNum <=props.maxPage} >
		<Show when={props.curPage==props.pageNum}>
			<li aria-current="page" class="z-10 px-4 py-3 leading-tight text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white" onclick={props.onclick}>{props.pageNum}
			</li>
		</Show>
		<Show when={props.curPage!=props.pageNum}>
			<li class="px-4 py-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" onclick={props.onclick}>{props.pageNum}</li>
		</Show>
	</Show>
}


export function Pagination(props: { curPage: Accessor<number>, setCurPage: Setter<number>, maxPage: Accessor<number> }) {
	const [items,setItems] = createSignal<Array<number>>([])
	function setPage(pageNum:number){
		if(pageNum>0&&pageNum<=props.maxPage()){
			props.setCurPage(pageNum)
			setItems([pageNum-2,pageNum-1,pageNum,pageNum+1,pageNum+2])
		}
	}
	onMount(()=>{setPage(1);})
	createEffect(()=>{setItems(items().filter((item)=>item<=props.maxPage()))})
	return (

		<nav aria-label="Page navigation example">
			<ul class="inline-flex items-center -space-x-px">
				<li class="block px-4 py-3 m-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" onclick={(e)=>setPage(props.curPage()-1)}>
						<span class="sr-only">Previous</span>
						<svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
				</li>
				<For each={items()}>{
					(item) => <PaginationItem curPage={props.curPage()} pageNum={item} maxPage={props.maxPage()} onclick={(e)=>setPage(item)} ></PaginationItem>}
				</For>
				
				<li class="block px-4 py-3 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white" onclick={(e)=>setPage(props.curPage()+1)}>
						<span class="sr-only">Next</span>
						<svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
				</li>
			</ul>
		</nav>


	)
} 