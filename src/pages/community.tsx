import bg from "../assets/imgs/community-bg.jpg"
import { ArticleInfo } from "../components/articleinfo"
import { createEffect, createSignal, onMount } from "solid-js"
import { searchArticle } from "../utils/method"
import { Pagination } from "../components/pagination"
import { MyButton, MyInput } from "../components/utils"
export default function Community() {
	const [items, setItems] = createSignal<IArticle[]>([])
	const [curPage, setCurPage] = createSignal(1)
	const [maxPage, setMaxPage] = createSignal(1)
	let input: HTMLInputElement
	const setInput = (el: HTMLInputElement) => { input = el }
	createEffect(() => {
		setItems(searchArticle(input.value, curPage()))
	})
	onMount(() => {
		setCurPage(1)
		setItems(searchArticle(''))
	})
	return <div class="w-full h-full overflow-scroll">
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
						setItems(searchArticle(input.value))
					}}></MyButton></div>
				</div>
			</div>
		</header>
		<div class="w-full flex flex-col justify-center"><ArticleInfo items={items()}></ArticleInfo></div>
		<div class="flex justify-center"><Pagination curPage={curPage} setCurPage={setCurPage} maxPage={maxPage()}></Pagination></div>

	</div>
}