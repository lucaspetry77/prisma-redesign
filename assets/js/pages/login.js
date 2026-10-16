/* Asimov Prisma · Entrar (login.html)
 * Um botão só: a conta da Asimov (SSO do Hub). Estados: entrando, conta sem acesso (?erro=acesso) e
 * sessão expirada (?erro=sessao). Quem já entrou neste navegador vê "Bem-vindo de volta".
 * Ao lado, a demonstração: o pedido se escreve no composer, vira mensagem e a resposta chega em streaming,
 * sempre no modelo da Asimov (Basic ou Plus, que escolhem o melhor modelo para cada pedido). Referências: Plain, Quicken, Lovable, Base44, Chatbase, SchoolAI. */
(() => {
  const P = window.Prisma;
  const { $, reduced, store, sleep, esc } = P;
  const icon = (n, c) => P.icon(n, c);

  $("[data-mark]").innerHTML = P.crystal({ hero: true });

  /* ── Quem volta ── */
  const returning = store.get("login:last", null);
  if (returning) {
    $("[data-title]").textContent = "Bem-vindo de volta";
    $("[data-sub]").textContent = "Suas conversas, projetos e agentes estão do jeito que você deixou.";
  }

  /* ── Estados de erro ── */
  const err = P.params.get("erro");
  const box = $("[data-alert]");
  if (err === "acesso") box.innerHTML = `<div class="alert alert--warning" role="alert">${icon("lock")}<div class="alert__body"><p><strong>Sua conta ainda não tem acesso ao Prisma.</strong> O beta está aberto para alunos com assinatura ativa. Se você acabou de assinar, tente de novo em alguns minutos.</p><p><a class="link" href="https://link.asimov.academy/transferencia-CS" target="_blank" rel="noopener">Falar com o suporte</a></p></div></div>`;
  if (err === "sessao") box.innerHTML = `<div class="alert" role="status">${icon("clock")}<div class="alert__body"><p><strong>Sua sessão expirou.</strong> Entre de novo para continuar de onde parou.</p></div></div>`;

  /* ── Entrar ── */
  const cta = $("[data-sso]");
  const label = $("[data-label]");
  const go = () => {
    if (cta.getAttribute("aria-busy") === "true") return;
    cta.setAttribute("aria-busy", "true");
    store.set("login:last", Date.now());
    // O A viaja até a ponta direita do botão (8px de folga de cada lado)
    const ic = cta.querySelector(".login__cta-icon");
    cta.style.setProperty("--travel", `${cta.offsetWidth - ic.offsetWidth - 16}px`);
    cta.classList.add("is-going");
    $("[data-live]").textContent = "Confirmando sua conta Asimov.";
    setTimeout(() => {
      label.textContent = "Tudo certo! Entrando no Prisma…";
      cta.classList.add("is-done");
      $("[data-live]").textContent = "Conta confirmada. Entrando no Prisma.";
    }, reduced ? 0 : 1150);
    setTimeout(() => (location.href = cta.href), reduced ? 900 : 2500);
  };
  cta.addEventListener("click", (e) => { e.preventDefault(); go(); });
  // Hover: o A se desenha com a mesma motion.draw dos ícones da barra lateral (só mouse, como lá)
  const mark = $("[data-a]");
  cta.addEventListener("pointerenter", (e) => {
    if (e.pointerType !== "mouse" || cta.classList.contains("is-going")) return;
    P.motion.draw(mark);
  });
  // Enter em qualquer lugar da página continua: a única ação não precisa de mira
  addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
    if (e.target.closest?.("a, button, input, textarea, select")) return;
    e.preventDefault();
    go();
  });
  // Voltar do SSO pelo histórico não deixa o botão preso em "Abrindo…"
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    cta.removeAttribute("aria-busy");
    cta.classList.remove("is-going", "is-done");
    label.textContent = "Continuar com a conta Asimov";
  });

  P.hydrateIcons();
  P.motion.init();

  /* ── Demonstração ── */
  const SCENES = [
    {
      model: "Asimov Basic",
      file: "vendas-setembro.xlsx",
      ask: "Analise esta planilha e me diga onde estou perdendo margem",
      answer: "Encontrei três pontos. O frete para o Sul come 18% da margem, os cupons acima de 15% não aumentaram o ticket e dois produtos vendem abaixo do custo. Quer que eu monte o gráfico?",
    },
    {
      model: "Asimov Plus",
      ask: "Crie um script em Python que renomeia minhas fotos pela data",
      answer: "Pronto. Ele lê a data de cada foto e renomeia no formato ano-mês-dia:",
      code: "for foto in pasta.glob(\"*.jpg\"):\n    data = ler_data(foto)\n    foto.rename(f\"{data:%Y-%m-%d}.jpg\")",
    },
    {
      model: "Asimov Basic",
      ask: "Monte um plano de 30 dias para eu aprender IA com 1h por dia",
      answer: "Semana 1: fundamentos e primeiros prompts. Semana 2: Python para dados. Semana 3: automações com agentes. Semana 4: um projeto seu, do zero ao ar.",
    },
  ];

  const demo = $("[data-demo]");
  const thread = $("[data-thread]");
  const typed = $("[data-typed]");
  const chip = $("[data-chip]");
  const art = $("[data-carousel]");

  const setModel = async (s, animate = true) => {
    if ($("[data-chip-name]").textContent === s.model) return;
    if (animate) { chip.classList.add("is-swap"); await sleep(200); }
    $("[data-chip-name]").textContent = s.model;
    chip.classList.remove("is-swap");
  };
  const outMsg = (s) => `<div class="demo__msg demo__msg--out">${s.file ? `<span class="demo__file">${icon("file")}${esc(s.file)}</span><br>` : ""}${esc(s.ask)}</div>`;
  // Como no chat real: a resposta não repete o modelo (ele fica só no seletor do composer)
  const inMsg = () => `<div class="demo__msg demo__msg--in"><span class="demo__think" data-think><i></i><i></i><i></i></span><div data-out></div></div>`;
  const staticScene = (s) => {
    thread.innerHTML = outMsg(s) + inMsg(s);
    thread.querySelector("[data-think]").remove();
    thread.querySelector("[data-out]").textContent = s.answer;
  };

  // Painel escondido (celular): nada a animar
  if (getComputedStyle(art).display === "none") return;

  // Títulos dos slides: cada palavra sobe na sua vez (o <br> fica)
  document.querySelectorAll(".slide__title").forEach((h) => {
    let i = 0;
    h.innerHTML = h.innerHTML.split(/(<br>)/).map((part) => part === "<br>" ? part
      : part.split(/(\s+)/).map((w) => (w.trim() ? `<span class="w" style="--i:${i++}">${w}</span>` : w)).join("")).join("");
  });

  /* ── Demonstração: cada cena roda numa "época"; trocar de slide encerra a cena em andamento ── */
  let visible = !document.hidden;
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; });
  let epoch = 0;
  const STOP = Symbol("stop");
  const waitIn = (my) => async (ms) => { await sleep(ms); while (!visible || paused) await sleep(200); if (my !== epoch) throw STOP; };

  const play = async (s, wait) => {
    await setModel(s);
    thread.innerHTML = "";
    typed.textContent = "";
    demo.classList.remove("is-ready", "is-sent");
    await wait(500);
    for (let i = 1; i <= s.ask.length; i++) {
      typed.textContent = s.ask.slice(0, i);
      if (i === 1) demo.classList.add("is-ready");
      await wait(22 + Math.random() * 30);
    }
    await wait(450);
    demo.classList.add("is-sent");
    await wait(140);
    demo.classList.remove("is-sent", "is-ready");
    typed.textContent = "";
    thread.innerHTML = outMsg(s);
    await wait(420);
    thread.insertAdjacentHTML("beforeend", inMsg(s));
    await wait(850);
    const out = thread.querySelector("[data-out]");
    thread.querySelector("[data-think]")?.remove();
    let txt = "";
    for (const p of s.answer.split(/(\s+)/)) { txt += p; out.textContent = txt; if (p.trim()) await wait(34 + Math.random() * 36); }
    if (s.code) {
      const code = document.createElement("code");
      out.after(code);
      for (const line of s.code.split("\n")) { code.textContent += (code.textContent ? "\n" : "") + line; await wait(240); }
    }
  };

  /* ── Carrossel ── tempo por slide; o ponto ativo enche como barra. Pausa com o ponteiro no painel. */
  const slides = [...art.querySelectorAll("[data-slide]")];
  const dots = [...art.querySelectorAll("[data-dots] button")];
  const DUR = { demo: 12500, modelos: 6500, agentes: 6500, aluno: 6500 };
  let cur = 0, elapsed = 0, last = 0, paused = false, scene = 0;
  art.addEventListener("pointerenter", () => { paused = true; });
  art.addEventListener("pointerleave", () => { paused = false; });

  const enter = (i) => {
    epoch++;
    cur = i; elapsed = 0;
    slides.forEach((el, k) => {
      el.classList.toggle("is-on", k === i);
      el.setAttribute("aria-hidden", k === i ? "false" : "true");
    });
    dots.forEach((d, k) => {
      d.classList.toggle("is-on", k === i);
      d.toggleAttribute("aria-current", k === i);
      d.style.setProperty("--p", 0);
    });
    const name = slides[i].dataset.slide;
    if (name === "demo") {
      if (reduced) { staticScene(SCENES[0]); return; }
      const s = SCENES[scene++ % SCENES.length];
      play(s, waitIn(epoch)).catch((e) => { if (e !== STOP) throw e; });
    }
    if (name === "agentes") {
      const use = slides[i].querySelector("[data-use]");
      use.classList.remove("is-done");
      use.textContent = "Usar agente";
      const my = epoch;
      setTimeout(() => { if (my !== epoch) return; use.classList.add("is-done"); use.textContent = "Agente ativado"; }, 2600);
    }
  };
  dots.forEach((d, k) => d.addEventListener("click", () => enter(k)));

  enter(0);
  // Movimento reduzido: sem troca automática; os pontos continuam trocando o slide
  if (reduced) return;
  const tick = (t) => {
    const dt = last ? Math.min(t - last, 100) : 0;
    last = t;
    if (!paused && visible) elapsed += dt;
    const dur = DUR[slides[cur].dataset.slide];
    dots[cur].style.setProperty("--p", Math.min(1, elapsed / dur).toFixed(4));
    if (elapsed >= dur) enter((cur + 1) % slides.length);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
