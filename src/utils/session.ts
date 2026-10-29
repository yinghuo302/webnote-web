import { createSignal } from "solid-js";
import { ajax } from "./ajax";

const AUTH_MARKER = "webnote.authenticated.v1";
const [user, setUser] = createSignal<IUser | null>(null);
const [ready, setReady] = createSignal(false);
let refreshInFlight: Promise<void> | null = null;

export const sessionUser = user;
export const sessionReady = ready;

function hasAuthMarker() {
  try {
    return localStorage.getItem(AUTH_MARKER) === "1";
  } catch {
    return false;
  }
}

function clearAuthMarker() {
  try {
    localStorage.removeItem(AUTH_MARKER);
    localStorage.removeItem("user-avatar");
  } catch { /* browser storage is optional */ }
}

export async function refreshSession(force = false) {
  // Don't probe private APIs for a guest; the editor is also used without a running backend.
  if (!force && !hasAuthMarker()) {
    setUser(null);
    setReady(true);
    return;
  }
  if (refreshInFlight) return refreshInFlight;

  if (force) {
    try { localStorage.setItem(AUTH_MARKER, "1"); } catch { /* marker is optional */ }
  }
  refreshInFlight = ajax.ajax({
    type: "GET",
    url: "/api/private/user",
  }).then((result) => {
    if (result?.status === "success" && result.user) {
      setUser(result.user);
      try {
        localStorage.setItem(AUTH_MARKER, "1");
        localStorage.setItem("user-avatar", result.user.avatar || "");
      } catch { /* browser storage is optional */ }
    } else {
      setUser(null);
      clearAuthMarker();
    }
  }, () => {
    // A stale or unavailable session should fall back to local writing.
    setUser(null);
    clearAuthMarker();
  }).finally(() => {
    setReady(true);
    refreshInFlight = null;
  });
  return refreshInFlight;
}

export function clearSession() {
  setUser(null);
  setReady(true);
  clearAuthMarker();
}
