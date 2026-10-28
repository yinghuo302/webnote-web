# AGENTS.md — webnote-web

## Project scope

- This directory is the SolidJS/Vite frontend for Webnote. The sibling `../webnote` contains the Go backend; do not mix backend deployment/code changes into this frontend.
- The frontend owns the writing workspace, local file list, article/community views, and API calls under `/api`.
- Preserve existing Markdown as the stored/exported format. Keep editor implementation behind the app-facing `IEditor` adapter where possible.

## Current editor integration

- The working branch is `feature/muya-editor`. The active editor package is `@muyajs/core` (`Muya`), adapted in `src/components/muya-editor.ts` and mounted from `src/components/editor.tsx`.
- Register Muya UI plugins with `Muya.use(...)` before creating the editor and before calling `init()`. Current integration enables inline formatting, code-language selection, quick insert, preview tools, table controls, images, and links.
- Current editor options intentionally include `autoPairMarkdownSyntax: false` to avoid auto-closing Markdown markers such as `*` and `~`; do not re-enable it without confirming the desired behavior with the user.
- Muya's current npm package in this project ships `lib/core.css`; import that path (not the older README's `lib/style.css`). Its popover/toolbar nodes are portaled to `document.body`, outside the editor container. Style them with `body .mu-float-wrapper`, `.mu-front-menu`, `.mu-quick-insert`, `.mu-list-picker`, `.mu-preview-tools`, and related selectors so Tailwind preflight does not make them unreadable.
- Mermaid is supported. Existing Markdown fenced blocks tagged `mermaid` are parsed into Muya diagram blocks when loading content. For interactive authoring, the Muya slash menu's **Mermaid** diagram item is the reliable insertion path; changing an ordinary code block's language to Mermaid alone does not necessarily convert its block type. Keep `PreviewToolBar` registered. The adapter currently warms Mermaid rendering after editor startup; verify this behavior in a browser before changing it.
- Code language selection is provided by `CodeBlockLanguageSelector`. In the active code block, use its language input/tag above the code. Keep that control visible/readable when editing Muya CSS.
- The adapter exposes `getMd()`, `setValue()`, and `getOutline()` for the existing file save/load and outline sidebar. Do not bypass those flows without checking `src/components/files.tsx` and `src/components/filebar.tsx`.

## Dependency installation

- `@muyajs/core` has a transitive Git dependency (`@marktext/file-icons` -> `file-icons@github:file-icons/atom`). With npm 12, install it using a one-command allowance after reviewing the dependency: `npm install @muyajs/core@^0.2.0 --allow-git=all`. This is broader than `root`, so avoid making it a global npm setting.
- `package-lock.json` is ignored by this repository's `.gitignore`; `package.json` is the tracked dependency declaration. Do not edit generated lock files directly as a substitute for changing `package.json`.

## Validation

From this directory run:

```sh
npx tsc --noEmit
npm run build
```

- The Muya bundle is large: the last successful build emitted an editor chunk around 1.56 MB (about 465 KB gzip), plus Vite's >500 KB warning. Consider route-level/dynamic splitting if the user prioritizes startup size.
- The public article page still uses the old Markdown renderer; compare it against Muya output for GFM, Mermaid, and math before claiming full editor/reader parity.

## Git safety and current state

- Milkdown experiment snapshot: branch `backup/milkdown-attempt`, commit `8d73b80` (`backup current Milkdown editor attempt`). The Muya work branch is based on that snapshot.
- Preserve unrelated pre-existing working-tree changes. Before staging, inspect `git status` and stage only files relevant to the requested task.
- The current `origin` observed during the Muya migration is `git@e.coding.net:zanilia/webnote/webnote-web.git`, not GitHub. Do not push to it when the user asks for GitHub; ask for the GitHub remote URL or explicit confirmation to use `origin`.
- See `docs/muya-editor-refactor-status.md` for the current handoff, known issues, validation status, and outstanding push requirement.
