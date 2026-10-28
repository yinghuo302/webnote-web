# Muya 编辑器重构进度与交接记录

## 当前状态

- 开发分支：`feature/muya-editor`
- Milkdown 备份点：`backup/milkdown-attempt`，提交 `8d73b80`（`backup current Milkdown editor attempt`）。
- 当前工作仍包含未提交的 Muya 页面改造；本记录按用户要求暂停后续修复工作。
- Muya 基础替换阶段曾通过 `npx tsc --noEmit` 和 `npm run build`。**在用户报告 Mermaid、自动补全、代码语言选择及菜单可读性问题后追加的最后一组改动，没有确认完成类型检查或生产构建**：对应并行命令被中断，结果未记录。继续前应先重跑验证。
- 未做实际浏览器交互验收。

## 已完成的 Muya 集成

- 使用 `@muyajs/core@0.2.0`，适配器位于 `src/components/muya-editor.ts`，入口为 `src/components/editor.tsx`。
- 适配器保留现有文件工作流需要的 `setValue()`、`getMd()`、`getOutline()`；公开文章展示、社区搜索、分享 API 尚未迁移。
- 已注册 Muya 内置的行内格式、快速插入、代码语言、表格、图片/链接及预览工具插件。
- 对 Mermaid/编辑交互问题已追加但待验证的修改：
  - `autoPairMarkdownSyntax: false`，避免 `*`、`~` 等 Markdown 标记自动补齐右半边。
  - 使用 `MarkdownToHtml.renderHtml()` 延迟预热一次 Mermaid 引擎，缩短首次流程图渲染等待。
  - 给 `body` 下的 Muya 浮动菜单增加高对比亮色覆盖；给活跃代码块的语言标签增加可见样式。
  - 编辑页提示改为从 `/` 快速插入 Mermaid，以及点击代码块上方语言标签修改语言。

## Muya 行为要点

- MarkText/Muya 的常见初始化模式是先静态注册插件 `Muya.use(Plugin)`，再 `new Muya(container, options)`，最后 `muya.init()`。参考 [Muya README](https://github.com/marktext/muya) 与 [MarkText Architecture](https://marktext.me/docs/dev/architecture)。
- Muya 默认 `autoPairMarkdownSyntax` 为 `true`；它是独立选项，当前应用显式设置为 `false`。MarkText 也将该项暴露为编辑偏好，见 [Muya 默认配置](https://github.com/marktext/muya/blob/master/packages/core/src/config/index.ts) 和 [MarkText Editing](https://marktext.me/docs/editing)。
- Muya Markdown 导入会把 `mermaid` fenced block 转为 diagram block；交互式新建应使用 `/` 快速插入菜单中的 **Mermaid**，或 Muya 的图表块流程。仅把普通 code block 的语言设成 `mermaid` 不保证其类型会转换成可渲染 diagram。
- `PreviewToolBar` 用于预览型块的工具；代码语言选择由 `CodeBlockLanguageSelector` 提供。需要在浏览器中核实插件弹出入口是否清楚、列表是否可读以及修改语言是否正常。
- 当前实际安装包只有 `@muyajs/core/lib/core.css`；虽然部分上游说明提到 `lib/style.css`，不要在未核实包文件的情况下换路径。
- Muya 浮动工具挂载在 `document.body`，不在 `.muya-root` 内。项目使用 Tailwind preflight，因此菜单样式需要针对 `.mu-float-wrapper`、`.mu-front-menu`、`.mu-quick-insert`、`.mu-list-picker`、`.mu-preview-tools` 和表格工具类进行验证。

## 依赖安装说明

npm 12 默认拒绝 Git 类型依赖（`EALLOWGIT`）。`@muyajs/core` 经由 `@marktext/file-icons` 依赖 `file-icons@github:file-icons/atom`。已经用**单次命令**成功安装：

```sh
npm install @muyajs/core@^0.2.0 --allow-git=all
```

该选项范围较宽，不要未经审查写入全局 `.npmrc`。当前项目 `.gitignore` 忽略 `package-lock.json`，依赖版本声明在 `package.json`。

## 验证步骤

在 `webnote-web` 目录执行：

```sh
npx tsc --noEmit
npm run build
```

此前 Muya 构建曾产生约 1.56 MB 的编辑器 chunk（gzip 约 465 KB）以及 Vite 大 chunk 警告。需要时再评估拆包。未完成浏览器验证的项目：

1. 通过 `/` 新建 Mermaid diagram，连续编辑内容时确认图形更新速度与错误状态。
2. 打开已有 ````mermaid` fenced Markdown，确认导入时会转成 diagram block。
3. 输入 `*`、`~`，确认不会自动补齐；同时检查括号/引号配对是否仍符合产品预期。
4. 在代码块上方语言标签打开语言列表、切换语言，并保存/重新打开。
5. 检查格式、快速插入、表格、语言列表等浮动菜单在 Tailwind 页面中的颜色、层级、键盘/鼠标交互。
6. 比较编辑页 Muya 渲染与仍使用旧渲染器的公开文章页面，检查 GFM、数学公式和 Mermaid 是否一致。

## Git 与推送

- 本次任务所在分支为 `feature/muya-editor`，备份提交 `8d73b80` 已保留。
- 用户要求推送到 GitHub，但当前 `origin` 是 `git@e.coding.net:zanilia/webnote/webnote-web.git`，不是 GitHub。尚未 push，避免将代码推到错误平台；需要 GitHub remote URL，或用户明确授权把现有 `origin` 作为目标。
- 当前工作树还有在本次 Muya 任务前就存在的改动（如 `src/components/login.tsx`、`src/components/sidebar.tsx`、`src/components/utils.tsx`、`src/utils/ajax.ts`、`src/utils/index.ts`、`tsconfig.json`、`vite.config.ts` 及 `lib` 子模块）。提交前必须逐项审查，只暂存明确属于 Muya 重构和本次文档的文件，不要夹带这些既有改动。
