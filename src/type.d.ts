type ModalState = {
	component: any,
	props?:any
	open: boolean
}

interface IOutLine {
  level: number;
  title: string;
}

interface IEditor {
  setValue(markdown: string): void;
  getMd(): string;
  getOutline(): IOutLine[];
  getRoot(): HTMLDivElement;
  getMode(): "visual" | "source";
  setMode(mode: "visual" | "source"): void;
  jumpToHeading(index: number): void;
}

interface IArticle{
	fileId:string,
	name:string,
	user?:IUser
	description:string,
	content?:string
}

interface IFileList{
	name:string
	description:string
	fileId?:string
}

interface IUser{
	nickname:string,
	avatar:string,
	description:string
}