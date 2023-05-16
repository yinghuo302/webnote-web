import avatar from "../assets/imgs/avatar.png"
export default function User() {
	return <div class="w-full h-full flex flex-col adjust-center items-center p-10 space-y-6">
		<h1 class="text-3xl my-5">用户信息修改</h1>
		<img class="w-[100px] h-[100px] rounded-full" src={avatar} alt="user" />

		<div class="flex items-center justify-center w-full">
			<label for="dropzone-file" class="flex flex-col items-center justify-center w-max h-max">
				<div class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">选择头像</div>
				<input id="dropzone-file" type="file" class="hidden" />
			</label>
		</div>
		<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
			<form class="space-y-6" action="#">
				<div>
					<label for="email" class="block text-sm font-medium leading-6 text-gray-900">昵称</label>
					<div class="mt-2">
						<input id="nickname" name="email" type="text" autocomplete="email" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
					</div>
				</div>

				<div>
					<div class="flex items-center justify-between">
						<label for="password" class="block text-sm font-medium leading-6 text-gray-900">密码</label>
					</div>
					<div class="mt-2">
						<input id="password" name="password" type="password" autocomplete="current-password" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
					</div>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium leading-6 text-gray-900">描述</label>
					<div class="mt-2">
						<input id="nickname" name="email" type="text" autocomplete="email" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
					</div>
				</div>

				<div>
					<button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">修改信息</button>
				</div>


			</form>
		</div>
	</div>
}