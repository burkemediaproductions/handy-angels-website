(function () {
  const root = document.querySelector("[data-carousel]");
  if (!root) return;

  const prefersReduced =
    document.documentElement.dataset.reducedMotion === "true" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stage = root.querySelector("[data-carousel-stage]");
  const live = root.querySelector("[data-carousel-live]");
  const tiles = Array.from(root.querySelectorAll("[data-carousel-tile]"));
  const autoplayToggle = root.querySelector("[data-carousel-autoplay]");

  const slides = tiles.map((btn) => ({
    id: btn.getAttribute("data-id"),
    name: btn.getAttribute("data-name"),
    desc: btn.getAttribute("data-desc"),
    href: btn.getAttribute("data-href"),
    img: btn.getAttribute("data-img"),
  }));

  const AUTOPLAY_DELAY = 5200;
  let index = 0;
  let timer = null;
  let autoplay = !prefersReduced;
  let isAnimating = false;

  function getPanels() {
    return {
      current: stage?.querySelector('[data-carousel-panel="current"]'),
      next: stage?.querySelector('[data-carousel-panel="next"]'),
    };
  }

  function setPanelContent(panel, slide) {
    if (!panel || !slide) return;

    const media = panel.querySelector(".media");
    const title = panel.querySelector("[data-carousel-title], [data-carousel-title-next]");
    const desc = panel.querySelector("[data-carousel-desc], [data-carousel-desc-next]");
    const cta = panel.querySelector("[data-carousel-cta], [data-carousel-cta-next]");

    if (media) {
      media.style.backgroundImage = slide.img ? `url('${slide.img}')` : "";
    }

    if (title) title.textContent = slide.name;
    if (desc) desc.textContent = slide.desc;

    if (cta) {
      cta.setAttribute("href", slide.href);
      cta.setAttribute("aria-label", `Explore ${slide.name}`);
    }
  }

  function syncTileState() {
    tiles.forEach((tile, i) => {
      tile.setAttribute("aria-pressed", i === index ? "true" : "false");
    });
  }

  function announce(slide) {
    if (live && slide) {
      live.textContent = `${slide.name}. ${slide.desc}`;
    }
  }

  function resetProgress(panel) {
    if (!panel) return;
    const fill = panel.querySelector("[data-carousel-progress-fill]");
    if (!fill) return;
    fill.style.animation = "none";
    fill.style.height = "0%";
    void fill.offsetHeight;
    fill.style.animation = "";
  }

  function refreshProgressState() {
    stage?.style.setProperty("--carousel-autoplay-duration", `${AUTOPLAY_DELAY}ms`);
    stage?.classList.toggle("is-autoplaying", autoplay && !prefersReduced && !isAnimating);
    stage?.classList.toggle("is-paused", !autoplay || prefersReduced || isAnimating);

    const { current, next } = getPanels();
    resetProgress(next);

    if (current) {
      resetProgress(current);
      if (autoplay && !prefersReduced && !isAnimating) {
        const fill = current.querySelector("[data-carousel-progress-fill]");
        if (fill) {
          fill.style.animation = "carousel-progress-fill var(--carousel-autoplay-duration) linear forwards";
        }
      }
    }
  }

  function renderInitial() {
    const { current, next } = getPanels();
    setPanelContent(current, slides[index]);
    setPanelContent(next, slides[(index + 1) % slides.length]);
    syncTileState();
    announce(slides[index]);
    refreshProgressState();
  }

  function finishRotation(newIndex) {
    index = newIndex;

    const { current, next } = getPanels();
    if (!current || !next) {
      isAnimating = false;
      return;
    }

    current.classList.remove("is-current", "is-next");
    next.classList.remove("is-current", "is-next");

    current.setAttribute("data-carousel-panel", "next");
    current.classList.add("is-next");
    current.setAttribute("aria-hidden", "true");

    next.setAttribute("data-carousel-panel", "current");
    next.classList.add("is-current");
    next.setAttribute("aria-hidden", "false");

    stage.classList.remove("is-animating-next", "is-animating-prev");
    stage.dataset.direction = "next";

    const refreshed = getPanels();
    setPanelContent(refreshed.current, slides[index]);
    setPanelContent(refreshed.next, slides[(index + 1) % slides.length]);

    syncTileState();
    announce(slides[index]);
    isAnimating = false;
    refreshProgressState();
  }

  function jumpTo(newIndex) {
    const normalized = (newIndex + slides.length) % slides.length;
    index = normalized;

    const { current, next } = getPanels();
    setPanelContent(current, slides[index]);
    setPanelContent(next, slides[(index + 1) % slides.length]);

    syncTileState();
    announce(slides[index]);
    refreshProgressState();
  }

  function rotateTo(targetIndex) {
    if (isAnimating || slides.length < 2) return;

    const normalized = (targetIndex + slides.length) % slides.length;
    if (normalized === index) return;

    if (prefersReduced) {
      jumpTo(normalized);
      return;
    }

    isAnimating = true;
    refreshProgressState();

    const forward =
      normalized === (index + 1) % slides.length ||
      (index === slides.length - 1 && normalized === 0);

    const { next } = getPanels();
    setPanelContent(next, slides[normalized]);

    stage.classList.remove("is-animating-next", "is-animating-prev");
    stage.dataset.direction = forward ? "next" : "prev";
    void stage.offsetWidth;
    stage.classList.add(forward ? "is-animating-next" : "is-animating-prev");

    window.setTimeout(() => {
      finishRotation(normalized);
    }, 980);
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
    refreshProgressState();
  }

  function start() {
    stop();
    if (!autoplay || slides.length < 2) return;

    timer = window.setInterval(() => {
      rotateTo(index + 1);
    }, AUTOPLAY_DELAY);

    refreshProgressState();
  }

  tiles.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      rotateTo(i);
    });
  });

  autoplayToggle?.addEventListener("change", (e) => {
    autoplay = Boolean(e.target.checked);
    start();
  });

  if (autoplayToggle) {
    autoplayToggle.checked = autoplay;

    if (prefersReduced) {
      autoplayToggle.checked = false;
      autoplayToggle.disabled = true;
      autoplayToggle.setAttribute("aria-describedby", "reduced-motion-note");
    }
  }

  renderInitial();
  start();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
})();