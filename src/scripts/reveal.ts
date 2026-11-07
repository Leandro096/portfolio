import { reducedMotion } from "./dom";
import { formatNumber as fmt } from "../lib/format";

function countUp(el: HTMLElement) {
  const to = parseFloat(el.dataset.to ?? "0");
  const pre = el.dataset.prefix ?? "";
  const suf = el.dataset.suffix ?? "";
  if (reducedMotion) {
    el.textContent = pre + fmt(to) + suf;
    return;
  }

  const duration = 1400;
  let start: number | null = null;
  const step = (t: number) => {
    if (start === null) start = t;
    const p = Math.min((t - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + fmt(Math.round(to * eased)) + suf;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target as HTMLElement;
        el.classList.add("is-in");
        el.querySelectorAll<HTMLElement>(".count").forEach(countUp);
        io.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
  );
  targets.forEach((el) => io.observe(el));
} else {
  targets.forEach((el) => el.classList.add("is-in"));
}

export {};
