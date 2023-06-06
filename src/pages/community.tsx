import bg from "../assets/imgs/community-bg.jpg"
import { ArticleInfo } from "../components/articleinfo"
import { createEffect, createSignal, onMount } from "solid-js"
import { Pagination } from "../components/pagination"
import { MyButton, MyInput } from "../components/utils"
import { ajax } from "../utils"
import notify from "../components/notify"
export default function Community() {
	const [items, setItems] = createSignal<IArticle[]>([])
	const [curPage, setCurPage] = createSignal(1)
	const [maxPage, setMaxPage] = createSignal(1)
	let input: HTMLInputElement
	const setInput = (el: HTMLInputElement) => { input = el }
	createEffect(() => {
		searchArticle(input.value, curPage())
	})
	function searchArticle(keywd: string, pageNum: number = 1) {
		let promise = ajax.ajax({
			type: "GET",
			url: "/api/public/articles",
			data: { keywd: keywd ,page:pageNum},
		})
		promise.then((res) => {
			if (res.status != "success")
				notify("danger", "文章列表获取失败")
			else {
				if (res.pages) {setMaxPage(res.pages); setCurPage(1)}
				setItems(res.articles)
			}
		}, () => {
			notify("danger", "服务器连接失败");
		})
	}
	onMount(() => {
		setCurPage(1)
		searchArticle('')
	})
	return <div class="w-full h-full overflow-auto">
		<header style={{
			background: "no-repeat center center",
			"background-image": `url(${bg})`,
			"background-size": "cover"
		}}>
			<nav class="flex justify-between text-white items-center">
				<h1 class="m-5">My Blog</h1>
				<ul>
					<li class="inline-block mr-5">Home</li>
					<li class="inline-block mr-5">About</li>
					<li class="inline-block mr-5"> Contact</li>
				</ul>
			</nav>
			<div class="flex justify-center items-center h-52">
				<div class="w-[400px] flex flex-row">
					<MyInput item={{
						type: "text", placeholder: "搜索", refCallback: setInput
					}}></MyInput>
					<div class="w-32"><MyButton button="搜索" onclick={(e) => {
						searchArticle(input.value)
					}}></MyButton></div>
				</div>
			</div>
		</header>
		<div class="w-full flex flex-col justify-center"><ArticleInfo items={items()}></ArticleInfo></div>
		<div class="flex justify-center"><Pagination curPage={curPage} setCurPage={setCurPage} maxPage={maxPage()}></Pagination></div>

	</div>
}