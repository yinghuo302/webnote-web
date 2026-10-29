import { createSignal } from "solid-js";
import { ajax } from "./ajax";

const [user, setUser] = createSignal<IUser | null>(null);
const [ready, setReady] = createSignal(false);
let refreshInFlight: Promise<void> | null = null;

export const sessionUser = user;
export const sessionReady = ready;

export async function refreshSession() {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = ajax.ajax({
    type: "GET",
    url: "/api/private/user",
  }).then((result) => {
    if (result?.status === "success" && result.user) {
      setUser(result.user);
      try {
        localStorage.setItem("user-avatar", result.user.avatar || "");
      } catch { /* storage is optional */ }
    } else {
      setUser(null);
    }
  }, () => {
    // Being offline or unauthenticated must not prevent local writing.
    setUser(null);
  }).finally(() => {
    setReady(true);
    refreshInFlight = null;
  });
  return refreshInFlight;
}

export function clearSession() {
  setUser(null);
  setReady(true);
  try {
    localStorage.removeItem("user-avatar");
  } catch { /* storage is optional */ }
}
