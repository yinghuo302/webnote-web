export { ajax } from "./ajax";
import mitt from "mitt"

type MyEvent = {
  Login: void;
  Logout: void;
  EditorChanged: void;
  Toast: { id: number; type: "info" | "warning" | "danger" | "success"; content: string };
  Modal: ModalState;
}

export const bus = mitt<MyEvent>();
