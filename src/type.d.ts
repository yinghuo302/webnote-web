interface IMenuItem{
	content:string
	tip?:string
	className?:string
	subMenu?:IMenuItem[]
	click?:(editor:IEditor,e:Event)=>void
}

interface IArticle{
	uuid:string,
	title:string,
	user?:IUser
	description:string,
	content?:string
}

interface IFileOP{
	type:string,
	name:string,
	folder:string,
	description:string
	uuid?:string
	newFolder?:string
	newFile?:string
}


interface IFileList{
	folder?:string
	name:string
	description:string
	uuid?:string
}


interface IFoldList{
	name:string,
	files:IFileList[]
}

interface IUser{
	name:string,
	avator:string,
	description:string
}