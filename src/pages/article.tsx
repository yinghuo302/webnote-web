import { A, useParams } from "@solidjs/router"
import { createResource, createSignal, onMount, Show } from "solid-js"
import { MdRender } from "../../lib"
import { getArticle } from "../utils/method"
function UserInfo(props:{user:IUser}) {
	return (
	  <div role="list" class="divide-y divide-gray-100">
		<div class="flex justify-between gap-x-6 py-5">
			<div class="flex gap-x-4">
			  <img class="h-12 w-12 flex-none rounded-full bg-gray-50" src={props.user.avator} alt="" />
			  <div class="min-w-0 flex-auto">
				<p class="text-sm font-semibold leading-6 text-gray-900">{props.user.name}</p>
				<p class="mt-1 truncate text-xs leading-5 text-gray-500">{props.user.description}</p>
			  </div>
			</div>
		  </div>
	  </div>
	)
}
 

function ArticleContent(props:{mdtext:string}){
	let self:HTMLDivElement = null
	onMount(()=>{
		self.append(...MdRender.render(props.mdtext))
	})
	return <div class="md-root" ref={self} style="padding:0px;"></div>
}

export function Article(){
	const params = useParams()
	const [article,setArticle] = createSignal<IArticle>()
	onMount(()=>{
		setArticle(getArticle(params.id))
	})
	return <Show when={article()}>
		<div class="w-full h-full flex flex-col p-10">
			<div class="w-full flex flex-row justify-between">
				<UserInfo user={article().user}></UserInfo>
				<A class="font-semibold text-indigo-600 hover:text-indigo-500" href="/community">返回首页</A>
			</div>
			
			<ArticleContent mdtext={article().content}></ArticleContent>
		</div>
	</Show>
}