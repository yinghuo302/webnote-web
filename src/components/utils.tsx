import { createSignal, For, onMount, Setter, ValidComponent } from "solid-js"
import { ajax, bus } from "../utils"
import notify from "./notify"

interface InputItem {
	type: string,
	id?: string,
	placeholder?: string
	refCallback: (HTMLInputElement) => void
}
export function MultiInput(props: { items: InputItem[], onclick: (e) => void, button: string }) {
	return (
		<>
			<For each={props.items}>
				{(item) => <MyInput item={item}></MyInput>}
			</For>
			<MyButton onclick={props.onclick} button={props.button}></MyButton>
		</>
	)
}

export function MyInput(props: { item: InputItem }) {
	return (
		<input type={props.item.type} id={props.item.id} placeholder={props.item.placeholder} class="block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 shadow-sm ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" ref={props.item.refCallback} />
	)
}

export function MyButton(props: { onclick: (e) => void, button: string }) {
	return (
		<button class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" onclick={props.onclick}>{props.button}</button>
	)
}

export function FileMenu(props: { type: string }) {
	let input1: HTMLInputElement, input2: HTMLInputElement
	const setInput1 = (el: HTMLInputElement) => { input1 = el }
	const setInput2 = (el: HTMLInputElement) => { input2 = el }
	const items: InputItem[] = [{
		type: "text",
		placeholder: "请输入文件名",
		refCallback: setInput1
	}]
	let button_str = ''
	if (props.type == 'create') button_str = '新建文件'
	if (props.type == 'delete') button_str = '删除文件'
	if (props.type == 'rename') {
		button_str = '重命名文件'
		items.push({
			type: "text", placeholder: "请输入新文件名", refCallback: setInput2
		})
	}
	function click() {
		bus.emit('FileOp', {
			type: props.type,
			name: input1.value,
			otherName: input2 ? input2.value : undefined
		})
		bus.emit('Modal', { open: false, component: null })
	}
	return <div class="w-[300px] h-[300px] mx-32 flex flex-col space-y-6 justify-center items-center">
		<MultiInput items={items} onclick={click} button={button_str}></MultiInput></div>
}

export function ImgUpLoad() {
	let form_ele: HTMLFormElement
	const upload = () => {
		let fd = new FormData(form_ele)
		let promise = ajax.ajax({
			type: 'POST',
			url: '/api/public/img',
			dataType: 'raw',
			data: fd,
		})
		promise.then((res) => {
			navigator.clipboard.writeText(res.url)
			notify('success', '链接已复制到剪贴板')
		}, () => {
			notify('danger', '服务器连接失败')
		})
	}
	return (
		<form class="flex items-center justify-center w-full" ref={form_ele}>
			<label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
				<div class="flex flex-col items-center justify-center pt-5 pb-6">
					<svg aria-hidden="true" class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
					<p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
				</div>
				<input name="file" id="dropzone-file" type="file" class="hidden" accept="image/*" oninput={upload} />
			</label>
		</form>
	)
}

export function SizeInput(props: { editor: IEditor, type: "create" | "alter" }) {
	let input1: HTMLInputElement = null, input2: HTMLInputElement = null
	const setInput1 = (el: HTMLInputElement) => { input1 = el }
	const setInput2 = (el: HTMLInputElement) => { input2 = el }
	const items: InputItem[] = [{
		type: "number", placeholder: "请输入表格行数", refCallback: setInput1
	}, {
		type: "number", placeholder: "请输入表格列数", refCallback: setInput2
	}]
	let button_str = (props.type == 'create' ? "创建表格" : "修改表格大小")
	const click = function(){
		if(props.type=='create')
			props.editor.createTable(Number(input1.value), Number(input2.value)); 
		else
			props.editor.alterTable(Number(input1.value),Number(input2.value))
		bus.emit('Modal', { open: false, component: null })
	}
	return <div class="w-[300px] h-[300px] mx-32 flex flex-col space-y-6 justify-center items-center">
		<MultiInput items={items} button={button_str} onclick={click}></MultiInput>
	</div>
}

export function createTable(editor: IEditor) {
	bus.emit('Modal', {
		open: true, component: <SizeInput editor={editor} type="create"></SizeInput> as ValidComponent
	})
}

export function alterTable(editor: IEditor) {
	bus.emit('Modal', {
		open: true, component: <SizeInput editor={editor} type="alter"></SizeInput> as ValidComponent
	})
}

export function uploadImg() {
	bus.emit('Modal', {
		open: true, component: <ImgUpLoad></ImgUpLoad> as ValidComponent
	})
}

export function openFileMenu(type: string) {
	bus.emit('Modal', {
		open: true, component: <FileMenu type={type}></FileMenu> as ValidComponent
	})
}