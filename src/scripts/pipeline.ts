import { $, reducedMotion } from "./dom";

const pipe = $("pipe");
const badge = $("pipeBadge");
const result = $("pipeResult");

if (pipe && badge && result) {
  const stages = Array.from(pipe.querySelectorAll<HTMLElement>("[data-stage]"));
  const live = $("pipeLive");
  let timers: number[] = [];

  const at = (ms: number, fn: () => void) => {
    timers.push(window.setTimeout(fn, ms));
  };
  const set = (el: Element, state?: "is-active" | "is-done") => {
    el.classList.remove("is-active", "is-done");
    if (state) el.classList.add(state);
  };
  const setBadge = (state: "running" | "done") => {
    badge.dataset.state = state;
    const label =
      (state === "done" ? pipe.dataset.labelDone : pipe.dataset.labelRunning) ??
      "";
    badge.textContent = label;
    if (live)
      live.textContent =
        state === "done"
          ? `${label}: ${result.textContent?.replace(/\s+/g, " ").trim()}`
          : "";
  };

  const reset = () => {
    timers.forEach(clearTimeout);
    timers = [];
    pipe
      .querySelectorAll(".row, .job")
      .forEach((e) => e.classList.remove("is-active", "is-done", "is-live"));
    result.classList.remove("is-in");
    setBadge("running");
  };

  const finish = () => {
    stages.forEach((s) => {
      s.classList.add("is-live");
      if (s.dataset.stage === "step") set(s, "is-done");
      s.querySelectorAll(".job").forEach((j) => set(j, "is-done"));
    });
    result.classList.add("is-in");
    setBadge("done");
  };

  const run = () => {
    reset();
    if (reducedMotion) {
      finish();
      return;
    }

    let t = 500;
    stages.forEach((s) => {
      if (s.dataset.stage === "step") {
        const start = t;
        at(start, () => set(s, "is-active"));
        t += 800;
        at(t, () => set(s, "is-done"));
      } else {
        const jobs = Array.from(s.querySelectorAll(".job"));
        const start = t;
        at(start, () => {
          s.classList.add("is-live");
          jobs.forEach((j) => set(j, "is-active"));
        });
        jobs.forEach((j, i) =>
          at(start + 700 + i * 350, () => set(j, "is-done")),
        );
        t = start + 700 + (jobs.length - 1) * 350 + 100;
      }
    });
    at(t + 100, () => {
      result.classList.add("is-in");
      setBadge("done");
    });
  };

  $("replay")?.addEventListener("click", run);
  at(900, run);
}

export {};
