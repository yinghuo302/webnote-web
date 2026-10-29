export interface LocalDraft {
  id: string;
  name: string;
  description: string;
  content: string;
  updatedAt: number;
}

const STORAGE_KEY = "webnote.local-drafts.v1";

export function createDraft(name = "未命名文档", content = "# 请输入标题"): LocalDraft {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    name,
    description: content.slice(0, 48),
    content,
    updatedAt: Date.now(),
  };
}

export function readLocalDrafts(): LocalDraft[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is LocalDraft =>
      item && typeof item.id === "string" && typeof item.name === "string"
      && typeof item.content === "string",
    );
  } catch {
    return [];
  }
}

export function writeLocalDrafts(drafts: LocalDraft[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    return true;
  } catch {
    return false;
  }
}
