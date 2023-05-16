export { ajax } from "./ajax";
import mitt from "mitt"
import { ValidComponent } from "solid-js";

type FileOpInfo = {
	type: string;
	file: string;
	folder: string;
	newName?: string;
};

type MyEvent = {
	EditorLoad:IEditor,
	ReName:string,
	Login:void,
	FileBar:void,
	FileOp:FileOpInfo,
	Modal:{
		component:ValidComponent,
		open:boolean,
	}
	searchArticles:IArticle[]
}

export const bus = mitt<MyEvent>();
