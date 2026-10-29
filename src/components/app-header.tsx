import { A } from "@solidjs/router";
import { onCleanup, onMount, Show } from "solid-js";
import avatarFallback from "../assets/imgs/avatar.png";
import { ajax, bus } from "../utils";
import { clearSession, refreshSession, sessionUser } from "../utils/session";
import Login from "./login";
import notify from "./notify";

export default function AppHeader() {
  const onLogin = () => {
    bus.emit("Modal", { open: false, component: null });
    void refreshSession();
  };

  onMount(() => {
    bus.on("Login", onLogin);
    void refreshSession();
  });
  onCleanup(() => bus.off("Login", onLogin));

  function openLogin() {
    bus.emit("Modal", { open: true, component: Login });
  }

  async function logout() {
    try {
      const result = await ajax.ajax({ type: "POST", url: "/api/private/logout" });
      if (result?.status !== "success") {
        notify("warning", "退出登录失败");
        return;
      }
      // Let the workspace preserve the current remote document locally first.
      bus.emit("Logout");
      clearSession();
      notify("success", "已退出登录；本地草稿仍可继续使用");
    } catch {
      notify("danger", "服务器连接失败，当前草稿未受影响");
    }
  }

  return (
    <header class="app-header">
      <A class="app-brand" href="/" aria-label="Webnote 写作空间">
        <span class="app-brand-mark">w</span>
        <span class="app-brand-copy">
          <strong>写作空间</strong>
          <small>把想法，写成值得分享的内容</small>
        </span>
      </A>

      <nav class="app-nav" aria-label="主导航">
        <A href="/" end class="app-nav-link">编辑</A>
        <A href="/community" class="app-nav-link">社区</A>
        <A href="/user" class="app-nav-link">用户中心</A>
      </nav>

      <div class="app-account">
        <Show when={sessionUser()} fallback={
          <>
            <span class="account-status"><i /> 本地模式</span>
            <button class="account-button account-button-primary" onClick={openLogin}>登录 / 注册</button>
          </>
        }>
          {(user) => (
            <>
              <span class="account-status"><i class="online" /> 云端已连接</span>
              <A class="account-profile" href="/user">
                <img src={user().avatar || avatarFallback} alt="" />
                <span>{user().nickname || "用户"}</span>
              </A>
              <button class="account-button" onClick={logout}>退出</button>
            </>
          )}
        </Show>
      </div>
    </header>
  );
}
