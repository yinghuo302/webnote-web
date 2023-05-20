import { A } from "@solidjs/router"
import {  For } from "solid-js"

export const ArticleInfo = (props:{items:IArticle[]}) => {
	return (
		<main class="m-auto flex flex-col justify-center items-center w-full">
			<For each={props.items}>
				{(item) => <div class="text-lg w-2/3">
					<div>
						<h2 class="mt-5 text-2xl leading-loose text-blue-900 "><A href={"/article/" + item.uuid}>{item.title}</A></h2>
						<p>{item.description}</p>
					</div>
					<hr class="my-4 border-0 border-t border-solid border-slate-100"></hr>
				</div>}
			</For>
		</main>
	)
}