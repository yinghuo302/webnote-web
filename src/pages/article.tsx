import { A, useParams } from "@solidjs/router"
import { createSignal, onMount, Show } from "solid-js"
import { MdRender } from "../../lib"
import notify from "../components/notify"
import { ajax } from "../utils"
function UserInfo(props:{user:IUser}) {
	return (
	  <div role="list" class="divide-y divide-gray-100">
		<div class="flex justify-between gap-x-6 py-5">
			<div class="flex gap-x-4">
			  <img class="h-12 w-12 flex-none rounded-full bg-gray-50" src={props.user.avatar} alt="" />
			  <div class="min-w-0 flex-auto">
				<p class="text-sm font-semibold leading-6 text-gray-900">{props.user.nickname}</p>
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
	function getArticle(id: string) {
	
		let ret:IArticle
		let promise = ajax.ajax({
			type:"GET",
			url:"/api/public/article",
			data:{id:id},
		})
		promise.then((res)=>{
			if(res.status!="success")
				notify("danger","文章列表获取失败")
			else
				setArticle(res.article)
		},()=>{
			notify("danger","服务器连接失败");
		})
		return ret
	}
	

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