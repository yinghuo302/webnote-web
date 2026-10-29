import { Show } from "solid-js";
import { sessionUser, refreshSession } from "../utils/session";
import { ajax, bus } from "../utils";
import notify from "../components/notify";
import Login from "../components/login";

export default function User() {
  let nicknameInput: HTMLInputElement | undefined;
  let passwordInput: HTMLInputElement | undefined;
  let descriptionInput: HTMLTextAreaElement | undefined;
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
      <header class="page-heading">
        <div>
          <p class="page-kicker">账户资料</p>
          <h1>用户中心</h1>
          <p class="page-description">管理账户资料，写作与本机草稿不受登录状态影响。</p>
        </div>
      </header>
      <Show when={sessionUser()} fallback={
        <div class="user-login-notice">
          <div class="notice-mark">W</div>
          <h2>登录后管理账户资料</h2>
          <p>现在也可以继续使用本地文档和大纲。</p>
          <button class="form-submit" type="button" onClick={requireLogin}>登录 / 注册</button>
        </div>
      }>
        {(user) => (
          <form class="user-profile" onSubmit={modify}>
            <section class="profile-identity">
              <img class="user-avatar" src={user().avatar} alt="用户头像" />
              <div>
                <strong>{user().nickname || "Webnote 用户"}</strong>
                <span>账户资料</span>
              </div>
              <label class="avatar-change" for="avatar-file">更换头像</label>
              <input ref={avatarInput} id="avatar-file" class="visually-hidden" type="file" accept="image/*" onChange={uploadAvatar} />
            </section>

            <div class="profile-divider" />
            <label class="form-field">
              <span>昵称</span>
              <input ref={nicknameInput} type="text" value={user().nickname || ""} placeholder="你的显示名称" />
            </label>
            <label class="form-field">
              <span>个人介绍</span>
              <textarea ref={descriptionInput} rows="4" placeholder="写几句话介绍自己">{user().description || ""}</textarea>
            </label>
            <label class="form-field">
              <span>新密码</span>
              <input ref={passwordInput} type="password" autocomplete="new-password" placeholder="留空表示不修改" />
            </label>
            <div class="profile-actions">
              <span>资料仅用于你的 Webnote 账户。</span>
              <button class="form-submit" type="submit">保存更改</button>
            </div>
          </form>
        )}
      </Show>
    </section>
  );
}
