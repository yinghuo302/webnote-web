import { A } from "@solidjs/router";
import { ValidComponent } from "solid-js";
import avator from "../assets/imgs/avatar.png"
import { bus } from "../utils";
import Login from "./login";
import notify from "./notify";
const Sidebar = () => {
	return <div class="flex flex-col w-[150px] h-full bg-slate-300">
		<div class="p-4">
			<img class="rounded-full w-[100px]" id="avatar" src={avator} alt="Avatar"/>
			<div class="text-center" id="nickname">
				未登录
			</div>
		</div>
		<ul class="m-auto w-full flex flex-col items-center">
			<li class="w-full text-center text-lg py-4 hover:bg-slate-200" id="editor"><A href="/editor">编 &ensp;辑</A> </li>
			<li class="w-full text-center text-lg py-4 hover:bg-slate-200" id="community"><A href="/community">社 &ensp;区</A></li>
			<li class="w-full text-center text-lg py-4 hover:bg-slate-200" id="user-center"><A href="/user">我 &ensp;的</A></li>
		</ul>
		<div class="m-auto w-full flex flex-col space-y-4 mb-0">
			<button class="my-0 p-2 w-full bg-slate-200 text-center" onclick={(e)=>{
				bus.emit('Modal',{
					open:true,
					component:<Login></Login> as ValidComponent
				})
			}}>登录</button>
			<button class="my-0 p-2 w-full bg-slate-200 text-center" onclick={
				()=>notify("info","已注销")
			} >注销</button>
		</div>
	</div>
}
export default Sidebar;