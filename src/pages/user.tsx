import { Show } from "solid-js";
import { refreshSession, sessionUser } from "../utils/session";
import { ajax, bus } from "../utils";
import notify from "../components/notify";
import Login from "../components/login";

export default function User() {
  let nicknameInput: HTMLInputElement | undefined;
  let passwordInput: HTMLInputElement | undefined;
  let descriptionInput: HTMLInputElement | undefined;
  let avatarInput: HTMLInputElement | undefined;

  function requireLogin() {
    bus.emit("Modal", { open: true, component: Login });
  }

  async function modify(event: Event) {
    event.preventDefault();
    try {
      const result = await ajax.ajax({
        type: "POST",
        url: "/api/private/user",
        data: {
          nickname: nicknameInput?.value || "",
          passwd: passwordInput?.value || "",
          description: descriptionInput?.value || "",
        },
      });
      if (result?.status === "success") {
        await refreshSession();
        notify("success", "资料已更新");
      } else notify("warning", "资料更新失败");
    } catch {
      notify("danger", "服务器连接失败");
    }
  }

  async function uploadAvatar() {
    const file = avatarInput?.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await ajax.ajax({
        type: "POST",
        url: "/api/private/avatar",
        dataType: "raw",
        data: form,
      });
      if (result?.status !== "success") {
        notify("warning", "头像上传失败");
        return;
      }
      await refreshSession();
      notify("success", "头像已更新");
    } catch {
      notify("danger", "头像上传失败");
    }
  }

  return (
    <section class="user-page">
      <Show when={sessionUser()} fallback={
        <div class="user-login-notice">
          <span class="sidebar-eyebrow">ACCOUNT</span>
          <h1>用户中心</h1>
          <p>登录后可管理头像、昵称和个人介绍。未登录时仍可使用写作空间及本地草稿。</p>
          <button class="user-submit" onClick={requireLogin}>登录 / 注册</button>
        </div>
      }>
        {(user) => (
          <form class="user-page-card" onSubmit={modify}>
            <h1>用户中心</h1>
            <img class="user-avatar" src={user().avatar} alt="用户头像" />
            <label for="avatar">更换头像</label>
            <input ref={avatarInput} id="avatar" type="file" accept="image/*" onChange={uploadAvatar} />

            <label for="nickname">昵称</label>
            <input ref={nicknameInput} id="nickname" type="text" value={user().nickname || ""} />

            <label for="description">个人介绍</label>
            <input ref={descriptionInput} id="description" type="text" value={user().description || ""} />

            <label for="password">新密码（留空则不修改）</label>
            <input ref={passwordInput} id="password" type="password" autocomplete="new-password" />

            <button class="user-submit" type="submit">保存资料</button>
          </form>
        )}
      </Show>
    </section>
  );
}
