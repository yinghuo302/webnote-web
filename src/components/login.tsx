import { createSignal, JSXElement, Show } from 'solid-js';
import { ajax, bus } from '../utils';
import notify from './notify';

const Login = () => {
	const [email, setEmail] = createSignal('');
	const [password, setPassword] = createSignal('');
	const [code, setCode] = createSignal('');
	const [codeText, setCodeText] = createSignal("获取验证码");
	const [codeDisabled, setCodeDisabled] = createSignal(false)
	const [loginFlag, setLoginFlag] = createSignal(true)
	let timer: any = null

	const handleSubmit = (e: Event) => {
		var promise = ajax.ajax({
			type: loginFlag() ? "GET" : "POST",
			url: loginFlag() ? "/api/signin" : "/api/signup",
			data: {
				email: email(), passwd: password(), code: code()
			},
			dataType: "json"
		})
		promise.then((result) => {
			if (result.status == 'success')
				bus.emit('Login')
			else
				notify('danger',"登录失败")
		}, () => {
			notify('danger',"服务器连接失败")
		})
	};
	const codeHandler = function () {
		clearInterval(timer)
		var time = 60;
		let promise = ajax.ajax({
			type: "GET",
			url: "/api/code",
			data: {
				email: email()
			},
			responseType: 'string'
		})
		promise.then((res) => {
			if (res.status == 'success') {
				timer = setInterval(function () {
					if (time <= 0) {
						setCodeText(`获取验证码`);
						setCodeDisabled(true);
					} else {
						setCodeText(`剩余 ${time} 秒`);
						setCodeDisabled(false)
						time--;
					}
				}, 1000);	
			} else {
				notify('danger',"验证码获取失败")
			}
		}, () => {
			notify('danger',"验证码获取失败")
		})

	}
	const changeFlag = () => {
		setLoginFlag(!loginFlag())
	}

	return (
		<div class="w-[550px] h-[550px] flex justify-center items-center">
			<div class="w-[400px] space-y-6">
				<h2 class='text-center text-2xl font-bold w-full'>注册登录</h2>
				<div class="space-y-6 w-full">
					<div class='w-full'>
						<label for="email" class="block text-sm font-medium leading-6 text-gray-900">邮箱</label>
						<div class="mt-2">
							<input id="nickname" name="email" type="text" autocomplete="email" class="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 focus:ring-2 focus:ring-inset  sm:text-sm sm:leading-6" onInput={(e) => setEmail(e.target.value)}/>
						</div>
					</div>

					<div class='w-full'>
						<div class="flex items-center justify-between">
							<label for="password" class="block text-sm font-medium leading-6 text-gray-900">密码</label>
						</div>
						<div class="mt-2">
							<input id="password" name="password" type="password" autocomplete="current-password" class="block w-full rounded-md border-0 p-1.5 text-gray-900 ring-1 shadow-sm ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6" onInput={(e) => setPassword(e.target.value)} />
						</div>
					</div>

					<Show when={!loginFlag()}>
						<div class='w-full'>
							<label for="email" class="block text-sm font-medium leading-6 text-gray-900">验证码</label>
							<div class="mt-2 flex flex-row h-10 overflow-hidden justify-between">
								<input id="nickname" name="email" type="text" autocomplete="email" class="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 focus:ring-2 focus:ring-inset  sm:text-sm sm:leading-6" onInput={(e) => setCode(e.target.value)}/>
								<button class="h-full w-[140px] bg-slate-200" disabled={codeDisabled()} onclick={codeHandler} >{codeText()}</button>
							</div>
						</div>
					</Show>
					<div class='w-full'>
						<button class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" onclick={handleSubmit}>
							{loginFlag() ? "登录" : "注册/重置"}
						</button>
					</div>
				</div>

				<div class='text-lg text-center leading-6'>
					<a href="#" class="font-semibold  text-indigo-600 hover:text-indigo-500" onclick={changeFlag}>
						去{loginFlag() ? "注册/重置" : "登录"}
					</a>
				</div>
			</div>
		</div>
	);
};
export default Login;
