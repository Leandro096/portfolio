import { $ } from "./dom";

const nav = $("nav");
const menuBtn = $("menuBtn");

function setMenu(open: boolean) {
  if (!nav || !menuBtn) return;
  nav.classList.toggle("is-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute(
    "aria-label",
    (open ? menuBtn.dataset.labelClose : menuBtn.dataset.labelOpen) ?? "",
  );
}
menuBtn?.addEventListener("click", () =>
  setMenu(menuBtn.getAttribute("aria-expanded") !== "true"),
);
nav
  ?.querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

if (nav && "IntersectionObserver" in window) {
  const links = Array.from(
    nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'),
  );
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) =>
          a.setAttribute(
            "aria-current",
            String(a.getAttribute("href") === `#${en.target.id}`),
          ),
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  links.forEach((a) => {
    const target = document.querySelector(a.getAttribute("href") ?? "");
    if (target) io.observe(target);
  });
}

export {};
