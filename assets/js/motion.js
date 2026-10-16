/* Asimov Prisma · efeitos (por cima dos componentes; sem esta camada tudo funciona igual)
 * - words(el): palavras do título entram em sequência (fadeSlideIn do DS)
 * - cristal herói inclina na direção do ponteiro (só ponteiro fino, sem movimento reduzido)
 * - typewriter(input, frases): placeholder que se escreve sozinho enquanto o campo está vazio
 * - iconFx: no clique, o ícone do item se desenha traço a traço (o press do clique fica em motion.css)
 */
(() => {
  const P = window.Prisma;
  const { $$, reduced, fine } = P;

  const words = (el, base = 0) => {
    if (!el || reduced || el.dataset.words) return;
    el.dataset.words = "1";
    el.classList.add("words");
    let i = 0;
    const walk = (node) => [...node.childNodes].forEach((c) => {
      if (c.nodeType !== 3) { walk(c); return; }
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
    });
    walk(el);
  };

  const tilt = (root = document) => {
    if (!fine || reduced) return;
    $$(".crystal--hero:not(.crystal--still)", root).forEach((el) => {
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

  const typewriter = (input, phrases) => {
    if (reduced || !input || !phrases?.length) return;
    let pi = 0, ci = 0, dir = 1, timer = 0;
    const base = input.placeholder;
    const tick = () => {
      if (input.value || document.activeElement === input && input.dataset.paused) { timer = setTimeout(tick, 600); return; }
      const p = phrases[pi];
      ci += dir;
      input.placeholder = p.slice(0, ci) || base;
      if (dir > 0 && ci >= p.length) { dir = -1; timer = setTimeout(tick, 2200); return; }
      if (dir < 0 && ci <= 0) { dir = 1; pi = (pi + 1) % phrases.length; timer = setTimeout(tick, 400); return; }
      timer = setTimeout(tick, dir > 0 ? 45 + Math.random() * 40 : 18);
    };
    timer = setTimeout(tick, 1600);
    input.addEventListener("input", () => { if (input.value) input.placeholder = base; });
    return () => { clearTimeout(timer); input.placeholder = base; };
  };

  // Ícone que se desenha no clique: cada traço é "construído" do começo ao fim, em sequência, como uma caneta.
  // Mouse e toque; teclado não anima. O press continua no CSS.
  // Fora do desenho: ícones com movimento próprio (chevrons, enviar, favorito) e utilitários que não são destinos:
  // buscar e recolher no topo da barra lateral, o + de Projetos e Recentes e as ferramentas do composer.
  const OWN = ".sec__chev, .sb-item__chev, .sb-item__folder, .sb-item__folder-open, .send-btn .i, .fav .i, [data-cmdk] .i, [data-collapse] .i, .sec__add .i, .composer .i";
  const SHAPES = "path, circle, ellipse, rect, line, polyline, polygon";
  const DRAW = { dur: 420, step: 70, max: 640, ease: "cubic-bezier(.65, 0, .35, 1)" };

  const draw = (svg) => {
    if (reduced || !svg || svg._drawing || svg.matches(OWN)) return;
    const shapes = [...svg.querySelectorAll(SHAPES)];
    if (!shapes.length) return;
    svg._drawing = true;
    // Contorno fraco do ícone por baixo: ele se constrói sobre o próprio desenho, sem piscar vazio.
    const ghost = document.createElementNS("http://www.w3.org/2000/svg", "g");
    ghost.setAttribute("opacity", ".2");
    ghost.innerHTML = svg.innerHTML;
    svg.prepend(ghost);
    const step = Math.min(DRAW.step, (DRAW.max - DRAW.dur) / Math.max(1, shapes.length - 1));
    const runs = shapes.map((el, i) => {
      const delay = i * step;
      if (getComputedStyle(el).stroke === "none") {
        // Forma preenchida (selo, ponto): não tem traço para desenhar, então aparece no tempo dela.
        return el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DRAW.dur * .6, delay, easing: "ease-out", fill: "backwards" });
      }
      let len;
      try { len = el.getTotalLength(); } catch { return null; }
      if (!len) return null;
      el.style.strokeDasharray = `${len} ${len}`;
      const run = el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: DRAW.dur, delay, easing: DRAW.ease, fill: "backwards" });
      run.finished.finally(() => { el.style.strokeDasharray = ""; }).catch(() => {});
      return run;
    }).filter(Boolean);
    // Aba em segundo plano congela as animações: o prazo as encerra para o ícone nunca ficar pela metade.
    const guard = setTimeout(() => runs.forEach((r) => { try { r.finish(); } catch {} }), DRAW.max + 300);
    Promise.allSettled(runs.map((r) => r.finished)).then(() => { clearTimeout(guard); ghost.remove(); svg._drawing = false; });
  };

  const iconOf = (el) => el?.querySelector(":scope > svg.i, :scope > .icon-chip > svg.i");
  const TARGET = "a[href], button, [role=button], [role=menuitem]";
  let wired = false;
  const iconFx = () => {
    if (wired || reduced) return;
    wired = true;
    document.addEventListener("click", (e) => {
      if (!e.detail) return; // teclado: sem desenho
      const el = e.target.closest?.(TARGET);
      if (!el || el.disabled) return;
      draw(iconOf(el));
      // Link da navegação troca de página antes do desenho terminar: a página nova o desenha no item ativo.
      if (el.matches("a.nav-item") && el.origin === location.origin) {
        try { sessionStorage.setItem("prisma:fx-nav", el.pathname); } catch {}
      }
    }, true);
  };

  const replayNav = (root = document) => {
    let path;
    try { path = sessionStorage.getItem("prisma:fx-nav"); sessionStorage.removeItem("prisma:fx-nav"); } catch { return; }
    // Pelo endereço, não por aria-current: "Novo chat" leva ao início, mas nunca fica marcado como página atual.
    const a = path && [...root.querySelectorAll("a.nav-item[href]")].find((x) => x.pathname === path);
    if (a) draw(iconOf(a));
  };

  P.motion = { words, tilt, typewriter, draw, init: (root) => { tilt(root); iconFx(); replayNav(root); } };
})();
