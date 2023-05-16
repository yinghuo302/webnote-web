import { For } from "solid-js"
import Editor from "../components/editor"
import FileBar from "../components/filebar"
import MenuItem from "../components/MenuItem"
import { Config } from "../utils/config"

const EditorPage = () => {
	return (
		<div class="flex flex-row h-full w-full">
			<FileBar></FileBar>
			<div class="flex flex-col h-full grow">
				<div class="webnote-menu flex flex-row w-full justify-between ">
					<For each={Config.menu_items}>
						{(item)=> <MenuItem item={item} ></MenuItem>}
					</For>
				</div>
				<Editor></Editor>
			</div>
		</div>
	)
}

export default EditorPage