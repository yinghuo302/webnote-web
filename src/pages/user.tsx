import { createSignal } from "solid-js"
import { ajax } from "../utils"
export default function User() {
	const [nickname, setNickName] = createSignal('')
	const [passwd, setPasswd] = createSignal('')
	const [desc, setDesc] = createSignal('')
	const [imgUrl, setImgUrl] = createSignal('/api/imgs/avatar')
	let form_ele:HTMLFormElement
	function modify() {
		let promise = ajax.ajax({
			type: 'POST',
			url: '/api/user',
			data: { passwd: passwd(), description: desc(), nickname: nickname() },
		})
		promise.then(() => {
			window.alert('服务器连接失败')
		}, () => {
			window.confirm('修改成功')
		})
	}
	const upload = ()=>{
		let fd = new FormData(form_ele)
		let promise = ajax.ajax({
			type:'POST',
			url:'/api/avatar',
			dataType:'raw',
			data:fd,
		})
		promise.then(()=>{
			window.alert('服务器连接失败')
		},(res)=>{
			setImgUrl(res.url)
			window.confirm('修改成功')
		})
	}
	return <div class="w-full h-full flex flex-col adjust-center items-center p-10 space-y-6">
		<h1 class="text-3xl my-5">用户信息修改</h1>
		<img class="w-48 h-48 rounded-full" src={imgUrl()} />

		<form class="flex items-center justify-center w-full" ref={form_ele}>
			<label for="dropzone-file" class="flex flex-col items-center justify-center w-max h-max">
				<div class="flex w-full justify-center rounded-md bg-indigo-600 px-3 p-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">选择头像</div>
				<input id="dropzone-file" type="file" accept="image/*" class="hidden" onchange={upload} />
			</label>
		</form>
		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
			<div class="space-y-6">
				<div>
					<label for="email" class="block text-sm font-medium leading-6 text-gray-900">昵称</label>
					<div class="mt-2">
						<input id="nickname" name="email" type="text" autocomplete="email" class="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
					</div>
				</div>

				<div>
					<div class="flex items-center justify-between">
						<label for="password" class="block text-sm font-medium leading-6 text-gray-900">密码</label>
					</div>
					<div class="mt-2">
						<input id="password" name="password" type="password" autocomplete="current-password" class="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
					</div>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium leading-6 text-gray-900">描述</label>
					<div class="mt-2">
						<input id="nickname" name="email" type="text" autocomplete="email" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
					</div>
				</div>

				<div>
					<button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" onclick={modify}>修改信息</button>
				</div>


			</div>
		</div>
	</div>
}