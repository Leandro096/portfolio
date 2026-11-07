import { $ } from "./dom";

const toast = $("toast");
let toastTimer: number | undefined;

function showToast(message: string) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-show"), 2400);
}

const copyBtn = $("copyEmail");
copyBtn?.addEventListener("click", async () => {
  const email = copyBtn.dataset.email ?? "";
  try {
    await navigator.clipboard.writeText(email);
    showToast(copyBtn.dataset.copied ?? email);
  } catch {
    showToast(email);
  }
});

const clock = $("clock");
if (clock?.dataset.tz) {
  const locale = document.documentElement.lang === "es" ? "es-DO" : "en-US";
  const tz = clock.dataset.tz;
  const label = clock.dataset.tzLabel ?? "";
  const tick = () => {
    try {
      const time = new Intl.DateTimeFormat(locale, {
        timeZone: tz,
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date());
      clock.textContent = `${time} ${label}`.trim();
    } catch {}
  };
  tick();
  setInterval(tick, 30_000);
}

const year = $("year");
if (year) year.textContent = String(new Date().getFullYear());

export {};
