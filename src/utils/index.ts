export { ajax } from "./ajax";
import mitt from "mitt"
import { ValidComponent } from "solid-js";

type MyEvent = {
	EditorLoad:IEditor,
	ReName:string,
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
	searchArticles:IArticle[]
}

export const bus = mitt<MyEvent>();
