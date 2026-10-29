# Webnote Web 前端重构交接

## 当前实现

- 当前工作分支：`feature/muya-editor`。
- 前端继续使用 `@muyajs/core` (`Muya`)；adapter 在 `src/components/muya-editor.ts`，写作画布在 `src/components/editor.tsx`。
- 页面外壳由统一 `AppHeader` 提供：顶栏保留“写作空间”，并承载社区、用户中心和登录状态入口。旧的全局账户/社区左侧导航与编辑器菜单栏已移除。
- 写作页使用常驻 `WorkspaceSidebar`：文档/大纲切换、创建、保存、导入、导出、重命名、删除、分享；编辑区仍采用 Muya 的 MarkText 核心样式与纸张式画布。
- 游客可直接使用本机草稿：数据保存在浏览器 localStorage，支持草稿自动保存、文档管理、Markdown 导入导出和大纲查看。登录后继续使用现有 `/api/private/*` 云端文件接口。
- 退出登录时，当前打开的云端文档会另存为一个本机副本，避免清空编辑器或丢失当前内容。
- `src/pages/community.tsx`、`src/pages/user.tsx`、`src/pages/article.tsx` 保留为顶栏可达页面；公开文章 Markdown 渲染迁移到 Muya `MarkdownToHtml`。
- `lib` 子仓库、`.gitmodules`、子模块工作树和 `.git/modules/lib` 本地元数据已按用户要求移除。前端不应再有任何 `../../lib` imports；全局应用类型已移入 `src/type.d.ts`。

## Muya 要点

- 在实例化和 `init()` 前注册 UI 插件；保留 `autoPairMarkdownSyntax: false`。
- Muya 样式从 `@muyajs/core/lib/core.css` 由应用入口全局载入；Muya host 使用 `.mu-container` 类。
- Markdown 中的 `mermaid` 围栏在导入时由 Muya 解析为图表块。用户将普通代码块语言切换为 `mermaid` 时，adapter 会将当前 code block 原位换成原生 diagram block，并将光标移到源码；后续编辑走 Muya 原生实时预览路径。
- `IEditor` adapter 继续提供 `setValue()`、`getMd()`、`getOutline()`、`getRoot()`，供文件侧栏和大纲使用。

## 本轮修改的验证状态

- `node_modules/.bin/tsc.cmd --noEmit`：通过。
- `npm run build`：通过；Vite 生成生产资源。仍有 Muya/Mermaid 相关 >500 KB chunk 警告及 Browserslist 数据过期提示。
- `git diff --check`：通过。
- 尚未在浏览器完成交互验收。下一步覆盖：游客本地草稿 CRUD/自动保存/导入导出；登录后的云端 CRUD；退出登录副本保护；顶栏社区/用户中心导航；大纲点击跳转；Mermaid Markdown 导入、slash 创建和语言切换后的实时渲染；Muya 浮动菜单显示。

## Git 注意事项

- 本地原有修改包括 `src/components/login.tsx`、`src/utils/ajax.ts`、`tsconfig.json`、`vite.config.ts` 等。除直接服务于本次重构的文件外，应继续保留，不要顺手回滚或混入无关改动。
- `origin` 当前为 `git@e.coding.net:zanilia/webnote/webnote-web.git`；用户未要求推送时不要推送。
