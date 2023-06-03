export { ajax } from "./ajax";
import mitt from "mitt"
import { ValidComponent } from "solid-js";

type MyEvent = {
	Login:void,
	Logout:void,
	FileBar:void,
	FileOp:IFileOP,
	SideBar:void,
	PageChange:number,
	Modal:{
		component:ValidComponent,
		open:boolean,
	}
}

export const bus = mitt<MyEvent>();
