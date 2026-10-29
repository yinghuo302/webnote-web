import { createSignal, onCleanup, Show } from "solid-js";
import { ajax, bus } from "../utils";
import notify from "./notify";

export default function Login() {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [code, setCode] = createSignal("");
  const [registerMode, setRegisterMode] = createSignal(false);
  const [busy, setBusy] = createSignal(false);
  const [cooldown, setCooldown] = createSignal(0);
  let cooldownTimer: number | undefined;

  function close() {
    bus.emit("Modal", { open: false, component: null });
  }

  async function requestCode() {
    if (!email().trim()) {
      notify("warning", "请先填写邮箱");
      return;
    }
    try {
      const result = await ajax.ajax({
        type: "POST",
        url: "/api/public/code",
        data: { email: email().trim() },
      });
      if (result?.status !== "success") {
        notify("warning", "验证码发送失败");
        return;
      }
      const end = Date.now() + 60_000;
      setCooldown(60);
      if (cooldownTimer) window.clearInterval(cooldownTimer);
      cooldownTimer = window.setInterval(() => {
        const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        setCooldown(remaining);
        if (!remaining && cooldownTimer) {
          window.clearInterval(cooldownTimer);
          cooldownTimer = undefined;
        }
      }, 300);
    } catch {
      notify("danger", "验证码暂时无法发送");
    }
  }

  async function submit(event: Event) {
    event.preventDefault();
    if (busy()) return;
    setBusy(true);
    try {
      const result = await ajax.ajax({
        type: "POST",
        url: registerMode() ? "/api/public/signup" : "/api/public/signin",
        data: {
          email: email().trim(),
          passwd: password(),
          code: code(),
        },
      });
      if (result?.status === "success") {
        bus.emit("Login");
      } else {
        notify("warning", result?.status || "账号或密码不正确");
      }
    } catch {
      notify("danger", "无法连接账户服务");
    } finally {
      setBusy(false);
    }
  }

  onCleanup(() => {
    if (cooldownTimer) window.clearInterval(cooldownTimer);
  });

  return (
    <section class="auth-panel" aria-labelledby="auth-title">
      <button class="auth-close" type="button" onClick={close} aria-label="关闭">×</button>
      <p class="auth-kicker">账户</p>
      <h2 id="auth-title">{registerMode() ? "创建账户" : "欢迎回来"}</h2>
      <p class="auth-intro">{registerMode() ? "保存并分享你的写作。" : "登录后同步你的云端文档。"}</p>

      <form class="auth-form" onSubmit={submit}>
        <label for="auth-email">邮箱</label>
        <input
          id="auth-email"
          type="email"
          autocomplete="email"
          required
          value={email()}
          onInput={(event) => setEmail(event.currentTarget.value)}
        />

        <label for="auth-password">密码</label>
        <input
          id="auth-password"
          type="password"
          autocomplete={registerMode() ? "new-password" : "current-password"}
          required
          value={password()}
          onInput={(event) => setPassword(event.currentTarget.value)}
        />

        <Show when={registerMode()}>
          <label for="auth-code">邮箱验证码</label>
          <div class="auth-code-row">
            <input
              id="auth-code"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              required
              value={code()}
              onInput={(event) => setCode(event.currentTarget.value)}
            />
            <button class="auth-code-button" type="button" disabled={cooldown() > 0} onClick={requestCode}>
              {cooldown() ? `${cooldown()} 秒后重试` : "发送验证码"}
            </button>
          </div>
        </Show>

        <button class="auth-submit" type="submit" disabled={busy()}>
          {busy() ? "请稍候…" : registerMode() ? "注册" : "登录"}
        </button>
      </form>

      <div class="auth-switch">
        <span>{registerMode() ? "已有账户？" : "还没有账户？"}</span>
        <button type="button" onClick={() => setRegisterMode(!registerMode())}>
          {registerMode() ? "返回登录" : "注册账户"}
        </button>
      </div>
      <p class="auth-local-note">不登录也可以继续使用本机草稿。</p>
    </section>
  );
}
