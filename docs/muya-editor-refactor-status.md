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
- Mermaid 围栏由 Muya 导入为原生 diagram block。adapter 将普通代码块语言切换为 `mermaid` 后原位转换，并把光标移入源码。预览使用本地 MarkText `packages/muya/src/utils/diagram/render.ts` 的 Mermaid 12.2 `render(id, code, target)` 路径，给每次 render 唯一 ID 并忽略过期结果。Muya 0.2.0 的 Mermaid 11 仍用于其它内建导出路径。
- 自动 Mermaid 转换等待异步 paste handler 完成；Selection `_select`/`_setFocus` 使用合法 DOM Range offset clamp，对应 MarkText 的 `getLegalOffset` 修复。
- 游客启动不探测 `/api/private/user`，只有本地认证标记或登录成功后才验证会话。本轮仅修改前端，不改 Go API。
- 登录、用户中心、社区和文档侧栏采用统一的纸张白、细边框、墨绿/暖灰视觉；文件操作使用同一命令组，重命名改为行内编辑，反馈改为非阻塞 toast。
- `IEditor` adapter 提供 `setValue()`、`getMd()`、`getOutline()`、`getRoot()`；同时支持侧栏切换源码 (`textarea`) / Muya 即时渲染模式。源码编辑的 Markdown 在切回即时渲染时整体载入 Muya；保存/导出直接读取当前模式内容。
- 大纲通过稳定的标题顺序索引定位：即时渲染模式滚动并聚焦对应标题，源码模式选中对应 Markdown 标题行。源码模式当前识别 ATX 标题（`#` 至 `######`）。
- 粘贴兼容性检查：仍由 Muya clipboard 负责 `text/html` 与 `text/plain` 的解析/复制；adapter 仅等待异步 paste handler 完成后再进行 Mermaid 块转换，并对 stale DOM selection 做合法 Range offset clamp。未用全局事件劫持浏览器剪贴板，也未更改后端/API。需在真实浏览器覆盖纯文本、富文本、Markdown/Mermaid 围栏及图片粘贴；此环境尚未执行浏览器交互验收。

## 本轮修改的验证状态

- TypeScript 5.9.3；`node_modules/.bin/tsc.cmd --noEmit`：通过。
- 当前 UI 改造的 `npm run build`：通过；仍有体积较大的按需 chunk 警告。Muya 11 的文章导出 renderer 和 Mermaid 12.2 编辑预览 renderer 可能分别进入构建产物。
- `git diff --check`：通过。
- 尚未在浏览器完成实际交互验收。请重点验证 Mermaid 围栏粘贴/载入、slash 图表块、代码语言切换、连续快速编辑时旧渲染是否被丢弃，以及粘贴后的光标是否正常；游客启动时不应请求 `/api/private/user`。

## Git 注意事项

- 本地原有修改包括 `src/components/login.tsx`、`src/utils/ajax.ts`、`tsconfig.json`、`vite.config.ts` 等。除直接服务于本次重构的文件外，应继续保留，不要顺手回滚或混入无关改动。
- `origin` 当前为 `git@e.coding.net:zanilia/webnote/webnote-web.git`；用户未要求推送时不要推送。
