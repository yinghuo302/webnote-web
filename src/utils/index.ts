export { ajax } from "./ajax";
import mitt from "mitt"

type MyEvent = {
	Login:void,
	Logout:void,
	FileBar:void,
	FileOp:IFileOP,
	SideBar:void,
	PageChange:number,
	Modal:ModalState
}

export const bus = mitt<MyEvent>();
