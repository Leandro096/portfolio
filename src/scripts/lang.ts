document.querySelectorAll<HTMLAnchorElement>(".lang__btn").forEach((a) => {
  a.addEventListener("click", () => {
    try {
      localStorage.setItem("lang", a.dataset.lang ?? "");
    } catch {}
  });
});

export {};
