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
	otherName?:string
}


interface IFileList{
	name:string
	description:string
	uuid?:string
}

interface IUser{
	name:string,
	avator:string,
	description:string
}