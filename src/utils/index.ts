export { ajax } from "./ajax";
import mitt from "mitt"

type MyEvent = {
	Login:void,
	Logout:void,
	FileOp:IFileOP,
	SideBar:void,
	Modal:ModalState
}

export const bus = mitt<MyEvent>();
