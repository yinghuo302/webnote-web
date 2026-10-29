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
- Mermaid 围栏由 Muya 导入为原生 diagram block。adapter 将普通代码块语言切换为 `mermaid` 后原位转换，并把光标移入源码。`diagram-preview.update()` 使用 MarkText 当前采用的 `mermaid.render(id, code, target)` 路径，生成唯一 render ID 并丢弃旧渲染结果；复用 Muya 自身的 Mermaid chunk。转换等待异步 paste handler 完成，避免改写粘贴事务中的光标。
- 为 Muya 0.2.0 的 Selection `_select` / `_setFocus` 添加合法 DOM Range offset clamp，对应 MarkText 新版 `getLegalOffset` 修复，防止粘贴后的 stale offset 触发 `IndexSizeError`。
- 游客启动时不请求 `/api/private/user`；仅登录标记存在或登录事件发生后才检查会话，避免开发前端单独启动时无意义请求未运行的后端。此轮只修改前端，没有改 Go API。
- `IEditor` adapter 继续提供 `setValue()`、`getMd()`、`getOutline()`、`getRoot()`，供文件侧栏和大纲使用。

## 本轮修改的验证状态

- TypeScript 工具链已更新到 5.9.3；本轮 `node_modules/.bin/tsc.cmd --noEmit`：通过。
- `npm run build`：通过；复用 Muya Mermaid core chunk，未再额外打包第二份 Mermaid runtime。Vite 仍提示其他 >500 KB 大 chunk。
- `git diff --check`：通过。
- 尚未在浏览器完成实际交互验收。请重点验证 Mermaid 围栏粘贴/载入、slash 图表块、代码语言切换、连续快速编辑时旧渲染是否被丢弃，以及复制粘贴后的光标是否正常；游客模式不应请求 `/api/private/user`。

## Git 注意事项

- 本地原有修改包括 `src/components/login.tsx`、`src/utils/ajax.ts`、`tsconfig.json`、`vite.config.ts` 等。除直接服务于本次重构的文件外，应继续保留，不要顺手回滚或混入无关改动。
- `origin` 当前为 `git@e.coding.net:zanilia/webnote/webnote-web.git`；用户未要求推送时不要推送。
