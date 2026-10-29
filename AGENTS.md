# AGENTS.md — webnote-web

## Project scope

- This directory is the SolidJS/Vite frontend for Webnote. The sibling `../webnote` contains the Go backend; do not mix backend code or deployment changes into this frontend.
- Preserve Markdown as the stored/exported document format. The editor implementation stays behind the app-facing `IEditor` interface in `src/type.d.ts`.
- The old `lib` git submodule was intentionally removed. Do not restore imports from it; use `@muyajs/core` for editing and Markdown rendering.

## Current application structure

- `src/components/app-header.tsx` owns the global top bar, writing-space brand, Community/User Center links, and authentication actions.
- `src/pages/editor.tsx` is the writing workspace. It always renders `WorkspaceSidebar` beside the Muya editing area; the removed old top editing menu and global account/community sidebar must not be reintroduced.
- `src/components/workspace-sidebar.tsx` owns document and outline tabs plus create/save/import/export/rename/delete/share actions. Guests use `src/utils/local-drafts.ts` and browser storage; login is not a prerequisite for editing, creating, saving, importing, exporting, renaming, deleting, or browsing outlines.
- Auth state is shared through `src/utils/session.ts`. A failed or missing session must remain a quiet guest state, not block the editor.
- `/community`, `/user`, and `/article/:id` remain routable pages under the same top bar. Community/User navigation belongs in the top bar, not a second page-specific global sidebar.

## Muya integration

- The active editor package is `@muyajs/core` (`Muya`), adapted in `src/components/muya-editor.ts` and mounted from `src/components/editor.tsx`.
- Register Muya UI plugins with `Muya.use(...)` before creating the editor and before `init()`. Keep inline formatting, code language selection, quick insert, preview tools, table controls, images, and links enabled.
- Keep `autoPairMarkdownSyntax: false`; this prevents unwanted auto-pairing of Markdown markers such as `*` and `~`.
- `@muyajs/core/lib/core.css` is loaded by the application entry so editor and rendered article views share the MarkText/Muya stylesheet. The host editor must have the `.mu-container` class. Muya floating controls are portaled to `document.body`; style conservatively and do not override their internal controls broadly.
- Mermaid fences imported from Markdown become native diagram blocks. The adapter also converts the active code block when its language becomes `mermaid`; native diagram preview updates as the source is edited. Keep `PreviewToolBar` registered.
- The adapter exposes `setValue()`, `getMd()`, `getOutline()`, and `getRoot()`. Keep file load/save/import/export flows routed through this interface.

## Validation

From this directory run:

```sh
npx tsc --noEmit
npm run build
```

- A browser check should cover guest local draft CRUD and persistence, remote files after login, Community/User top navigation, outline navigation, Mermaid imported/new/converted rendering, and Muya floating menus.
- Type declarations in `node_modules/@types` may be newer than the pinned TypeScript 4.9 parser. Record this as an environment/dependency compatibility issue rather than working around it by restoring the removed submodule.

## Git safety

- Preserve unrelated pre-existing changes in `src/components/login.tsx`, `src/utils/ajax.ts`, `tsconfig.json`, `vite.config.ts`, and other files unless directly required by the current request. Stage only files belonging to the requested refactor.
- The observed `origin` is `git@e.coding.net:zanilia/webnote/webnote-web.git`. Do not push unless explicitly requested; if GitHub is requested, confirm the GitHub remote URL first.
- Keep `docs/muya-editor-refactor-status.md` current when handing off substantial editor/workspace changes.
