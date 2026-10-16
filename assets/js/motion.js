/* Asimov Prisma · efeitos (por cima dos componentes; sem esta camada tudo funciona igual)
 * - words(el): palavras do título entram em sequência (fadeSlideIn do DS)
 * - cristal herói inclina na direção do ponteiro (só ponteiro fino, sem movimento reduzido)
 * - typewriter(input, frases): placeholder que se escreve sozinho enquanto o campo está vazio
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

  P.motion = { words, tilt, typewriter, init: (root) => tilt(root) };
})();
