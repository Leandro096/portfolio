import { $ } from "./dom";

const root = document.documentElement;
const meta = document.querySelector<HTMLMetaElement>(
  'meta[name="theme-color"]',
);

function applyTheme(theme: "dark" | "light") {
  root.dataset.theme = theme;
  meta?.setAttribute("content", theme === "dark" ? "#0A0F1E" : "#F4F7FB");
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

meta?.setAttribute(
  "content",
  root.dataset.theme === "light" ? "#F4F7FB" : "#0A0F1E",
);
$("themeToggle")?.addEventListener("click", () => {
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

export {};
