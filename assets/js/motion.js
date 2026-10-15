/* Asimov Prisma — movimento e efeitos (par de assets/css/motion.css).
 *
 * Carregue depois de app.js. Prisma.ready() chama Prisma.motion.init(); um
 * MutationObserver aplica os efeitos ao que as telas renderizam depois.
 * Respeita prefers-reduced-motion e só usa hover em ponteiro fino.
 */
(() => {
  const P = (window.Prisma = window.Prisma || {});
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ───────────────────────── Entrada ao rolar ───────────────────────── */

  const REVEAL = [
    ".page-head", ".toolbar", ".filters", ".filterbar", ".admin-nav", ".tabs",
    ".grid > *", ".kpis > *", ".table-wrap", ".block-title", ".form-section", ".tips",
    ".list-card", ".project-panels > *", ".settings__nav", ".detail__hero", ".detail__desc",
    ".detail__aside > *", ".codeblock", ".bars", ".screens > *", ".section-label", ".note", ".empty",
  ].join(",");
  const io = "IntersectionObserver" in window && !reduced
    ? new IntersectionObserver((entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }), { rootMargin: "0px 0px -6% 0px" })
    : null;
  const reveal = (root) => {
    if (!io) return;
    const groups = new Map();
    $$(REVEAL, root).forEach((el) => {
      if (el.dataset.reveal !== undefined || el.closest(".modal, .menu, .panel, .sidebar, .test-panel")) return;
      // Irmãos entram em cascata
      const key = el.parentElement;
      const n = groups.get(key) || 0;
      groups.set(key, n + 1);
      el.dataset.reveal = "";
      el.style.setProperty("--d", Math.min(n, 10) * 55);
      io.observe(el);
    });
  };

  /* Palavras que sobem: <h1 data-split> */
  const split = (el, base = 0) => {
    if (reduced || el.dataset.splitDone) return;
    el.dataset.splitDone = "1";
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const s = document.createElement("span");
            s.className = "w";
            s.style.setProperty("--i", i++);
            s.style.setProperty("--base", base + "ms");
            s.textContent = part;
            frag.append(s);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && c.tagName === "EM") {
          c.classList.add("w");
          c.style.setProperty("--i", i++);
          c.style.setProperty("--base", base + "ms");
        } else if (c.nodeType === 1) walk(c);
      });
    };
    walk(el);
  };

  /* ───────────────────────── Holofote e inclinação ───────────────────────── */

  const SPOT = ".tone-card, .card--link, .g-card, .kpi, .project-card, .example, .form-section, .test-panel, .login__card-surface";
  const spot = (root) => {
    $$(SPOT, root).forEach((el) => {
      if (el.dataset.spot !== undefined) return;
      el.dataset.spot = "";
      const s = document.createElement("span");
      s.className = "spot";
      s.setAttribute("aria-hidden", "true");
      el.prepend(s);
    });
  };
  if (fine && !reduced) {
    let target = null;
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest?.("[data-spot]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      target = el;
    }, { passive: true });
  }

  // Inclinação com amortecimento (mola simples): segue o ponteiro sem travar
  const tilts = new Map();
  const tilt = (root) => {
    if (!fine || reduced) return;
    $$("[data-tilt]", root).forEach((el) => {
      if (tilts.has(el)) return;
      const st = { x: 0, y: 0, tx: 0, ty: 0, raf: 0, max: +(el.dataset.tilt || 5) };
      tilts.set(el, st);
      const loop = () => {
        st.x += (st.tx - st.x) * 0.14;
        st.y += (st.ty - st.y) * 0.14;
        el.style.transform = `perspective(900px) rotateX(${st.y.toFixed(2)}deg) rotateY(${st.x.toFixed(2)}deg) translateY(${(-Math.abs(st.x) - Math.abs(st.y)) * 0.4}px)`;
        if (Math.abs(st.tx - st.x) > 0.02 || Math.abs(st.ty - st.y) > 0.02) st.raf = requestAnimationFrame(loop);
        else { st.raf = 0; if (!st.tx && !st.ty) el.style.transform = ""; }
      };
      const kick = () => { if (!st.raf) st.raf = requestAnimationFrame(loop); };
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        st.tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * st.max;
        st.ty = -((e.clientY - r.top) / r.height - 0.5) * 2 * st.max;
        kick();
      });
      el.addEventListener("pointerleave", () => { st.tx = 0; st.ty = 0; kick(); });
    });
  };

  /* ───────────────────────── Indicadores deslizantes ───────────────────────── */

  const thumbs = (root) => {
    $$(".segmented", root).forEach((seg) => {
      if (seg._thumb) return;
      const t = document.createElement("span");
      t.className = "seg-thumb";
      t.setAttribute("aria-hidden", "true");
      seg.prepend(t);
      seg._thumb = t;
      seg.classList.add("has-thumb");
      const place = (instant) => {
        const on = seg.querySelector("[aria-selected='true'], [aria-current='page']");
        if (!on) { t.style.opacity = 0; return; }
        if (instant) t.style.transition = "none";
        t.style.opacity = 1;
        t.style.width = on.offsetWidth + "px";
        t.style.transform = `translateX(${on.offsetLeft}px)`;
        if (instant) requestAnimationFrame(() => (t.style.transition = ""));
      };
      place(true);
      new MutationObserver(() => place(false)).observe(seg, { subtree: true, attributes: true, attributeFilter: ["aria-selected", "aria-current"] });
      new ResizeObserver(() => place(true)).observe(seg);
    });
    $$(".tabs", root).forEach((tabs) => {
      if (tabs._bar) return;
      const b = document.createElement("span");
      b.className = "tabs-bar";
      b.setAttribute("aria-hidden", "true");
      tabs.append(b);
      tabs._bar = b;
      tabs.classList.add("has-bar");
      const place = (instant) => {
        const on = tabs.querySelector("[aria-selected='true']");
        if (!on) return;
        if (instant) b.style.transition = "none";
        b.style.width = on.offsetWidth + "px";
        b.style.transform = `translateX(${on.offsetLeft}px)`;
        if (instant) requestAnimationFrame(() => (b.style.transition = ""));
      };
      place(true);
      new MutationObserver(() => place(false)).observe(tabs, { subtree: true, attributes: true, attributeFilter: ["aria-selected"] });
      new ResizeObserver(() => place(true)).observe(tabs);
    });
  };

  // Destaque que desliza entre os itens da navegação lateral
  const glide = () => {
    if (!fine) return;
    $$(".sidebar .nav-list").forEach((list) => {
      if (list._glide) return;
      const g = document.createElement("li");
      g.className = "nav-glide";
      g.setAttribute("aria-hidden", "true");
      list.prepend(g);
      list._glide = g;
      list.addEventListener("pointerover", (e) => {
        const item = e.target.closest(".nav-item");
        if (!item || !list.contains(item)) return;
        g.style.transform = `translateY(${item.offsetTop}px)`;
        g.style.height = item.offsetHeight + "px";
      });
    });
  };

  /* ───────────────────────── Números que contam ───────────────────────── */

  const countUp = (root) => {
    if (reduced) return;
    $$(".kpi__value, [data-count-up]", root).forEach((el) => {
      if (el._counted) return;
      el._counted = true;
      const text = el.textContent;
      const m = text.match(/-?\d{1,3}(?:\.\d{3})*(?:,\d+)?|-?\d+(?:,\d+)?/);
      if (!m) return;
      const raw = m[0];
      const decimals = (raw.split(",")[1] || "").length;
      const target = parseFloat(raw.replace(/\./g, "").replace(",", "."));
      if (!isFinite(target) || target === 0) return;
      const start = performance.now();
      const dur = 1100;
      const fmt = (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - p, 4);
        el.textContent = text.replace(raw, fmt(target * e));
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = text;
      };
      el.textContent = text.replace(raw, fmt(0));
      requestAnimationFrame(step);
    });
    $$(".bars__bar", root).forEach((b, i) => b.style.setProperty("--i", i));
  };

  /* ───────────────────────── Logo: o cristal inclina para o ponteiro ───────────────────────── */

  const crystalTilt = () => {
    if (!fine || reduced) return;
    $$(".crystal--hero:not(.crystal--still)").forEach((el) => {
      if (el._tilt) return;
      el._tilt = true;
      const body = el.querySelector(".crystal__body");
      const st = { x: 0, y: 0, tx: 0, ty: 0, raf: 0 };
      const loop = () => {
        st.x += (st.tx - st.x) * 0.08;
        st.y += (st.ty - st.y) * 0.08;
        body.style.transform = `perspective(600px) rotateY(${st.x.toFixed(2)}deg) rotateX(${st.y.toFixed(2)}deg)`;
        st.raf = Math.abs(st.tx - st.x) + Math.abs(st.ty - st.y) > 0.05 ? requestAnimationFrame(loop) : 0;
      };
      addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        st.tx = Math.max(-14, Math.min(14, (e.clientX - (r.left + r.width / 2)) / 30));
        st.ty = Math.max(-10, Math.min(10, -(e.clientY - (r.top + r.height / 2)) / 30));
        if (!st.raf) st.raf = requestAnimationFrame(loop);
      }, { passive: true });
    });
  };

  /* ───────────────────────── Placeholder que se escreve ───────────────────────── */

  const typewriter = (input, phrases) => {
    if (reduced || !input) return;
    let pi = 0, ci = 0, dir = 1, timer;
    const base = input.placeholder;
    const tick = () => {
      if (input.closest(".is-image-mode")) { input.classList.remove("is-typing"); timer = setTimeout(tick, 800); return; }
      if (input.value) { input.placeholder = base; input.classList.remove("is-typing"); timer = setTimeout(tick, 800); return; }
      input.classList.add("is-typing");
      const ph = phrases[pi];
      ci += dir;
      input.placeholder = ph.slice(0, ci) + (dir > 0 || ci ? "▍" : "");
      let wait = dir > 0 ? 34 + Math.random() * 40 : 14;
      if (dir > 0 && ci >= ph.length) { dir = -1; wait = 2200; input.placeholder = ph; }
      else if (dir < 0 && ci <= 0) { dir = 1; pi = (pi + 1) % phrases.length; wait = 380; }
      timer = setTimeout(tick, wait);
    };
    timer = setTimeout(tick, 1600);
    return () => clearTimeout(timer);
  };

  /* ───────────────────────── Pequenos feedbacks ───────────────────────── */

  const burst = (el, colors) => {
    if (reduced) return;
    const b = document.createElement("span");
    b.className = "burst";
    b.innerHTML = Array.from({ length: 8 }, (_, i) => `<i style="--a:${i * 45}deg;--c:${colors[i % colors.length]}"></i>`).join("");
    el.append(b);
    setTimeout(() => b.remove(), 700);
  };
  // Coração: estoura ao favoritar
  document.addEventListener("click", (e) => {
    const f = e.target.closest(".fav-btn");
    // O listener da tela (no grid) já trocou o estado: aqui só lemos
    if (f && f.getAttribute("aria-pressed") === "true") burst(f, ["#f43f5e", "#fb7185", "#f97316", "#a855f7"]);
    const c = e.target.closest("[data-copy], [data-copy-ins]");
    if (c && P.icon) {
      const prev = c.innerHTML;
      c.classList.add("is-copied");
      c.innerHTML = c.innerHTML.replace(/<span class="i[^"]*"[\s\S]*?<\/span>/, P.icon("check"));
      clearTimeout(c._t);
      c._t = setTimeout(() => { c.classList.remove("is-copied"); c.innerHTML = prev; }, 1400);
    }
    const s = e.target.closest(".star");
    if (s) $$(".star", s.parentElement).forEach((x, i) => x.style.setProperty("--i", i));
  });

  // Conversas em cascata só na primeira visita da sessão
  const convs = () => {
    const list = document.querySelector(".convs");
    if (!list || reduced) return;
    let first = true;
    try { first = !sessionStorage.getItem("prisma:seen"); sessionStorage.setItem("prisma:seen", "1"); } catch {}
    if (!first) return;
    $$(".conv", list).forEach((c, i) => c.style.setProperty("--i", Math.min(i, 14)));
    list.classList.add("is-staggered");
  };

  /* ───────────────────────── Ligação ───────────────────────── */

  const apply = (root = document) => { spot(root); tilt(root); thumbs(root); reveal(root); countUp(root); };

  let mo;
  const init = () => {
    apply();
    glide();
    convs();
    crystalTilt();
    $$("[data-split]").forEach((el) => split(el, +(el.dataset.split || 0)));
    if (!mo) {
      let queued = new Set();
      let raf = 0;
      mo = new MutationObserver((records) => {
        records.forEach((r) => r.addedNodes.forEach((n) => { if (n.nodeType === 1) queued.add(n); }));
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const nodes = queued;
          queued = new Set();
          nodes.forEach((n) => { if (n.isConnected && !n.closest(".spot")) apply(n.parentElement || n); });
        });
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  };

  P.motion = { init, split, typewriter, burst, reduced };
})();
