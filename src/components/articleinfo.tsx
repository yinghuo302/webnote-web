import { A } from "@solidjs/router"
import { createSignal, For, onMount } from "solid-js"
import { searchArticle } from "../utils/method"

export const ArticleInfo = () =>{
	const [items,setItems] = createSignal<IArticle[]>([])
	onMount(()=>{
		setItems(searchArticle(''))
	})
	return (
		<main class="container">
			<For each={items()}>
				{(item) => <div class="article-info">
					<div>
						<h2><A href={"/article/"+item.uuid}>{item.title}</A></h2>
						<p>{item.description}</p>
					</div>
					<hr></hr>
				</div>}
			</For>
			
		</main>
	)
}