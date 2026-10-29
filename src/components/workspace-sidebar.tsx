import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import { ajax, bus } from "../utils";
import { sessionUser } from "../utils/session";
import { createDraft, readLocalDrafts, writeLocalDrafts, type LocalDraft } from "../utils/local-drafts";
import notify from "./notify";
import Login from "./login";
import { uploadImg } from "./utils";

type WorkspaceFile = {
  id: string;
  fileId?: string;
  name: string;
  description: string;
  content: string;
  local: boolean;
  updatedAt?: number;
};

type Props = { editor?: IEditor };
type PanelTab = "files" | "outline";
const BLANK_MARKDOWN = "# 请输入标题";

function fromLocal(draft: LocalDraft): WorkspaceFile {
  return { ...draft, local: true };
}

function toLocal(file: WorkspaceFile): LocalDraft {
  return {
    id: file.id,
    name: file.name,
    description: file.description,
    content: file.content,
    updatedAt: file.updatedAt || Date.now(),
  };
}

function safeName(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "-").trim() || "未命名文档";
}

export default function WorkspaceSidebar(props: Props) {
  const [files, setFiles] = createSignal<WorkspaceFile[]>([]);
  const [selectedId, setSelectedId] = createSignal("");
  const [tab, setTab] = createSignal<PanelTab>("files");
  const [mode, setMode] = createSignal<"local" | "remote">("local");
  const [pendingContent, setPendingContent] = createSignal<string | null>(null);
  const [renamingId, setRenamingId] = createSignal<string | null>(null);
  const [renameValue, setRenameValue] = createSignal("");
  const [savedAt, setSavedAt] = createSignal<number | null>(null);
  const [outline, setOutline] = createSignal<IOutLine[]>([]);
  let importInput: HTMLInputElement | undefined;
  let renameInput: HTMLInputElement | undefined;
  let autosaveTimer: number | undefined;
  let loadSequence = 0;

  const selectedFile = () => files().find((file) => file.id === selectedId());

  function showInEditor(content: string) {
    if (props.editor) props.editor.setValue(content);
    else setPendingContent(content);
  }

  createEffect(() => {
    const editor = props.editor;
    const content = pendingContent();
    if (editor && content !== null) {
      editor.setValue(content);
      setPendingContent(null);
    }
  });

  function persistLocal(nextFiles: WorkspaceFile[]) {
    const ok = writeLocalDrafts(nextFiles.filter((file) => file.local).map(toLocal));
    if (!ok) notify("warning", "浏览器本地存储不可用，请导出 Markdown 备份");
  }

  function loadLocalFiles() {
    let drafts = readLocalDrafts();
    if (!drafts.length) {
      const first = createDraft("未命名文档", BLANK_MARKDOWN);
      drafts = [first];
      writeLocalDrafts(drafts);
    }
    const localFiles = drafts.map(fromLocal);
    setMode("local");
    setFiles(localFiles);
    const retained = localFiles.find((file) => file.id === selectedId());
    const next = retained || localFiles[0];
    setSelectedId(next.id);
    showInEditor(next.content);
  }

  async function loadRemoteFiles() {
    setMode("remote");
    try {
      const result = await ajax.ajax({ type: "GET", url: "/api/private/files" });
      if (result?.status !== "success" || !Array.isArray(result.files)) {
        loadLocalFiles();
        return;
      }
      const remoteFiles: WorkspaceFile[] = result.files.map((file: IFileList) => ({
        id: file.fileId || `remote-${file.name}`,
        fileId: file.fileId,
        name: file.name,
        description: file.description || "",
        content: "",
        local: false,
      }));
      if (!remoteFiles.length) {
        remoteFiles.push({
          id: `new-${Date.now()}`,
          name: "未命名文档",
          description: "新建文档 · 点击保存同步到云端",
          content: BLANK_MARKDOWN,
          local: false,
        });
      }
      const localFiles = readLocalDrafts().map(fromLocal);
      const combined = [...remoteFiles, ...localFiles];
      const retained = combined.find((file) => file.id === selectedId());
      setFiles(combined);
      if (retained) {
        setSelectedId(retained.id);
        if (retained.local || !retained.fileId) showInEditor(retained.content);
        else await loadRemoteFile(retained, ++loadSequence);
      } else {
        setSelectedId(remoteFiles[0].id);
        if (remoteFiles[0].fileId) await loadRemoteFile(remoteFiles[0], ++loadSequence);
        else showInEditor(remoteFiles[0].content);
      }
    } catch {
      // Network availability is not a requirement for the writing sidebar.
      loadLocalFiles();
    }
  }

  async function loadRemoteFile(file: WorkspaceFile, sequence: number) {
    if (!file.fileId) {
      showInEditor(file.content || BLANK_MARKDOWN);
      return;
    }
    try {
      const result = await ajax.ajax({
        type: "GET",
        url: "/api/private/file",
        data: { id: file.fileId },
      });
      if (sequence !== loadSequence || selectedId() !== file.id) return;
      if (result?.status !== "success") {
        notify("warning", "文件内容获取失败");
        return;
      }
      const content = result.content || "";
      setFiles((items) => items.map((item) => item.id === file.id ? { ...item, content } : item));
      showInEditor(content);
    } catch {
      notify("danger", "服务器连接失败；可继续编辑本地草稿");
    }
  }

  createEffect(() => {
    const user = sessionUser();
    if (user) void loadRemoteFiles();
    else loadLocalFiles();
  });

  function selectFile(file: WorkspaceFile) {
    setSelectedId(file.id);
    if (file.local || !file.fileId) {
      showInEditor(file.content || "");
      return;
    }
    void loadRemoteFile(file, ++loadSequence);
  }

  function createFile() {
    if (mode() === "local") {
      const file = fromLocal(createDraft("未命名文档", BLANK_MARKDOWN));
      const next = [...files().filter((item) => item.local), file];
      setFiles(next);
      setSelectedId(file.id);
      persistLocal(next);
      showInEditor(file.content);
      return;
    }
    const file: WorkspaceFile = {
      id: `new-${Date.now()}`,
      name: "未命名文档",
      description: "新建文档 · 点击保存同步到云端",
      content: BLANK_MARKDOWN,
      local: false,
    };
    setFiles((items) => [...items, file]);
    setSelectedId(file.id);
    showInEditor(file.content);
  }

  async function saveRemote(file: WorkspaceFile, content: string, name = file.name): Promise<WorkspaceFile | null> {
    try {
      const result = await ajax.ajax({
        type: "POST",
        url: "/api/private/file",
        data: {
          name,
          description: content.slice(0, 48),
          fileId: file.fileId,
          content,
        },
      });
      if (result?.status !== "success") {
        notify("warning", "云端保存失败，请稍后重试或导出为 Markdown");
        return null;
      }
      const fileId = result.fileId || file.fileId;
      const updated: WorkspaceFile = {
        ...file,
        id: fileId || file.id,
        fileId,
        name,
        description: content.slice(0, 48),
        content,
        updatedAt: Date.now(),
      };
      setFiles((items) => items.some((item) => item.id === file.id)
        ? items.map((item) => item.id === file.id ? updated : item)
        : [...items, updated]);
      setSelectedId(updated.id);
      setSavedAt(Date.now());
      notify("success", "已保存到云端");
      return updated;
    } catch {
      notify("danger", "云端暂不可用；请导出 Markdown 备份");
      return null;
    }
  }

  async function saveCurrent() {
    const file = selectedFile();
    const content = props.editor?.getMd() ?? file?.content ?? BLANK_MARKDOWN;
    if (!file) {
      const draft = fromLocal(createDraft("未命名文档", content));
      const next = [...files(), draft];
      setFiles(next);
      setSelectedId(draft.id);
      persistLocal(next);
      setSavedAt(Date.now());
      notify("success", "已保存到本机");
      return;
    }
    if (file.local || mode() === "local") {
      const updated = { ...file, content, description: content.slice(0, 48), updatedAt: Date.now() };
      const next = files().map((item) => item.id === file.id ? updated : item);
      setFiles(next);
      persistLocal(next);
      setSavedAt(Date.now());
      notify("success", "已保存到本机");
    } else {
      await saveRemote(file, content);
    }
  }

  function renameCurrent() {
    const file = selectedFile();
    if (!file) return;
    setRenamingId(file.id);
    setRenameValue(file.name);
    requestAnimationFrame(() => renameInput?.focus());
  }

  function cancelRename() {
    setRenamingId(null);
    setRenameValue("");
  }

  async function commitRename(event?: Event) {
    event?.preventDefault();
    const file = selectedFile();
    if (!file || renamingId() !== file.id) return;
    const name = safeName(renameValue());
    if (!name || name === file.name) {
      cancelRename();
      return;
    }
    const content = props.editor?.getMd() ?? file.content;
    if (file.local || mode() === "local") {
      const next = files().map((item) => item.id === file.id
        ? { ...item, name, content, description: content.slice(0, 48), updatedAt: Date.now() }
        : item);
      setFiles(next);
      persistLocal(next);
      notify("success", "文档名已更新");
    } else {
      const saved = await saveRemote(file, content, name);
      if (!saved) return;
    }
    cancelRename();
  }

  async function deleteCurrent() {
    const file = selectedFile();
    if (!file) return;
    if (!confirm(`确定删除“${file.name}”吗？`)) return;
    if (!file.local && file.fileId) {
      try {
        const result = await ajax.ajax({
          type: "DELETE",
          url: `/api/private/file?id=${encodeURIComponent(file.fileId)}`,
        });
        if (result?.status !== "success") {
          notify("warning", "删除失败");
          return;
        }
      } catch {
        notify("danger", "服务器连接失败");
        return;
      }
    }
    const next = files().filter((item) => item.id !== file.id);
    if (file.local || mode() === "local") persistLocal(next);
    if (!next.length) {
      setFiles([]);
      setSelectedId("");
      createFile();
    } else {
      setFiles(next);
      selectFile(next[0]);
    }
    notify("success", "文件已删除");
  }

  async function syncCurrentToCloud() {
    const file = selectedFile();
    if (!file?.local || !sessionUser()) return null;
    const content = props.editor?.getMd() ?? file.content;
    return saveRemote({ ...file, id: `sync-${Date.now()}-${file.id}`, fileId: undefined, local: false }, content);
  }

  async function shareCurrent() {
    let file = selectedFile();
    if (!sessionUser()) {
      notify("info", "登录后即可分享；本地草稿仍可继续编辑");
      bus.emit("Modal", { open: true, component: Login });
      return;
    }
    if (file?.local) {
      const synced = await syncCurrentToCloud();
      if (!synced) return;
      file = synced;
    }
    if (!file?.fileId) {
      notify("warning", "请先保存文档再分享");
      return;
    }
    try {
      const result = await ajax.ajax({
        type: "POST",
        url: "/api/private/share",
        dataType: "queryStr",
        data: { id: file.fileId },
      });
      if (result?.status === "success") notify("success", "分享链接已创建");
      else notify("warning", "分享失败");
    } catch {
      notify("danger", "服务器连接失败");
    }
  }

  function exportCurrent() {
    const file = selectedFile();
    const content = props.editor?.getMd() ?? file?.content ?? "";
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeName(file?.name || "未命名文档")}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importMarkdown(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    try {
      const content = await file.text();
      const name = safeName(file.name.replace(/\.(md|markdown)$/i, ""));
      const imported: WorkspaceFile = mode() === "local"
        ? fromLocal(createDraft(name, content))
        : { id: `new-${Date.now()}`, name, description: content.slice(0, 48), content, local: false };
      const next = [...files(), imported];
      setFiles(next);
      setSelectedId(imported.id);
      if (imported.local) persistLocal(next);
      showInEditor(content);
      notify("success", "Markdown 已导入");
    } catch {
      notify("danger", "文件读取失败");
    }
  }

  function preserveRemoteDraftOnLogout() {
    if (mode() !== "remote") return;
    const active = selectedFile();
    if (!active || active.local) return;
    const content = props.editor?.getMd() ?? active.content ?? BLANK_MARKDOWN;
    const duplicate = fromLocal(createDraft(`${active.name}（本机副本）`, content));
    const localFiles = [...files().filter((file) => file.local), duplicate];
    writeLocalDrafts(localFiles.map(toLocal));
    setFiles(localFiles);
    setSelectedId(duplicate.id);
    setMode("local");
    showInEditor(content);
  }

  function handleEditorChanged() {
    const file = selectedFile();
    if (!file || !file.local) return;
    if (autosaveTimer) window.clearTimeout(autosaveTimer);
    autosaveTimer = window.setTimeout(() => {
      const current = selectedFile();
      if (!current?.local) return;
      const content = props.editor?.getMd() ?? current.content;
      const updated = { ...current, content, description: content.slice(0, 48), updatedAt: Date.now() };
      const next = files().map((item) => item.id === current.id ? updated : item);
      setFiles(next);
      persistLocal(next);
      setSavedAt(Date.now());
    }, 450);
  }

  function refreshOutline() {
    setOutline(props.editor?.getOutline() || []);
  }

  function jumpToHeading(title: string, level: number) {
    const root = document.querySelector(".mu-editor");
    if (!root) return;
    const heading = Array.from(root.querySelectorAll(`h${level}`))
      .find((node) => node.textContent?.trim() === title);
    heading?.scrollIntoView({ behavior: "smooth", block: "center" });
    props.editor?.getRoot()?.focus();
  }

  const onLogout = () => preserveRemoteDraftOnLogout();
  const onEditorChanged = () => {
    handleEditorChanged();
    refreshOutline();
  };

  bus.on("Logout", onLogout);
  bus.on("EditorChanged", onEditorChanged);
  createEffect(() => {
    if (props.editor) refreshOutline();
  });
  onCleanup(() => {
    if (autosaveTimer) window.clearTimeout(autosaveTimer);
    bus.off("Logout", onLogout);
    bus.off("EditorChanged", onEditorChanged);
  });

  return (
    <aside class="workspace-sidebar" aria-label="文件与大纲侧边栏">
      <div class="sidebar-heading">
        <div>
          <h2>文档</h2>
          <p>{mode() === "local" ? "保存在此浏览器" : "云端与本机文档"}</p>
        </div>
        <span class="sidebar-count">{files().length}</span>
      </div>

      <div class="sidebar-command-panel" aria-label="文档操作">
        <For each={[
          { label: "新建", mark: "+", run: createFile },
          { label: "保存", mark: "↥", run: saveCurrent },
          { label: "导入", mark: "↓", run: () => importInput?.click() },
          { label: "导出", mark: "↑", run: exportCurrent },
          { label: "重命名", mark: "✎", run: renameCurrent },
          { label: "删除", mark: "−", run: deleteCurrent },
          { label: "分享", mark: "↗", run: shareCurrent },
          ...(sessionUser() ? [{ label: "图片", mark: "▧", run: uploadImg }] : []),
          ...(sessionUser() && selectedFile()?.local ? [{ label: "同步", mark: "⇧", run: syncCurrentToCloud }] : []),
        ]}>{(action) => (
          <button class="sidebar-command" type="button" onClick={() => { void action.run(); }} title={action.label}>
            <span class="command-mark" aria-hidden="true">{action.mark}</span>
            <span>{action.label}</span>
          </button>
        )}</For>
      </div>
      <input ref={importInput} class="visually-hidden" type="file" accept=".md,.markdown,text/markdown" onChange={importMarkdown} />

      <div class="sidebar-tabbar" role="tablist" aria-label="侧栏面板">
        <button class={tab() === "files" ? "is-active" : ""} onClick={() => setTab("files")} role="tab" aria-selected={tab() === "files"}>
          文档 <span>{files().length}</span>
        </button>
        <button class={tab() === "outline" ? "is-active" : ""} onClick={() => { setTab("outline"); refreshOutline(); }} role="tab" aria-selected={tab() === "outline"}>
          大纲 <span>{outline().length}</span>
        </button>
      </div>

      <div class="sidebar-list">
        <Show when={tab() === "files"} fallback={
          <Show when={outline().length} fallback={<div class="sidebar-empty"><b>暂无大纲</b><span>添加标题后会显示在这里</span></div>}>
            <div class="outline-list">
              <For each={outline()}>{(item) => (
                <button class={`outline-item outline-level-${item.level}`} onClick={() => jumpToHeading(item.title, item.level)} title={item.title}>
                  <span class="outline-dot" />{item.title}
                </button>
              )}</For>
            </div>
          </Show>
        }>
          <Show when={files().length} fallback={<div class="sidebar-empty"><b>还没有文档</b><span>创建一个本机草稿开始写作</span></div>}>
            <div class="document-list">
              <For each={files()}>{(file) => (
                <Show when={renamingId() === file.id} fallback={
                  <button class={`document-row ${selectedId() === file.id ? "is-selected" : ""}`} onClick={() => selectFile(file)}>
                    <span class="document-glyph" aria-hidden="true">¶</span>
                    <span class="document-copy">
                      <strong>{file.name}</strong>
                      <small>{file.local ? "本机草稿" : "云端文档"}</small>
                    </span>
                    <Show when={selectedId() === file.id}><span class="selected-mark" aria-hidden="true">•</span></Show>
                  </button>
                }>
                  <form class="document-rename" onSubmit={commitRename}>
                    <input
                      ref={renameInput}
                      value={renameValue()}
                      aria-label="文档名称"
                      onInput={(event) => setRenameValue(event.currentTarget.value)}
                      onKeyDown={(event) => { if (event.key === "Escape") cancelRename(); }}
                    />
                    <button type="submit" aria-label="保存名称">保存</button>
                    <button type="button" aria-label="取消重命名" onClick={cancelRename}>取消</button>
                  </form>
                </Show>
              )}</For>
            </div>
          </Show>
        </Show>
      </div>

      <div class="sidebar-footer">
        <span>{selectedFile()?.local || mode() === "local" ? "本机草稿会自动保存" : "云端文档需手动保存"}</span>
        <Show when={savedAt()}><small>最近保存 {new Date(savedAt()!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></Show>
      </div>
    </aside>
  );
}
