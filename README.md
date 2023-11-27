# Webnote

该仓库为webnote前端部分，包括[编辑器部分](https://github.com/zanilia1016/zeditor)(该部分为单独的submodule)和界面部分
## 简介
基于Web的笔记平台
1. 类似Typora的Markdown即时渲染编辑器
2. 用户分享和搜索笔记的笔记社区

### 已实现内容

1. 行内格式：倾斜，加粗，加粗倾斜，删除线，行内代码，行内latex公式，超链接，图片。
2. 块格式：分割线，标题，列表（支持嵌套），表格

### 实现效果

https://github.com/zanilia1016/webnote/assets/76104215/c142ba56-572c-447f-80ad-91c0e7781d56


![效果图](https://github.com/zanilia1016/webnote/assets/76104215/dcdce8b7-f772-4585-a08c-56a9746aaf18)


### 类似项目

Typora为闭源软件，但也有部分项目实现类似Typora的即时渲染功能，如[Muya](https://github.com/marktext/muya)和[Vditor](https://github.com/Vanessa219/vditor).

## 使用方法
### 安装依赖
```bash
$ npm install # or pnpm install or yarn install
```

### 开发模式
```bash
$ npm run dev 
```

### 编译部署
```bash
$ npm run build 
```
