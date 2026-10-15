/* Asimov Prisma — telas de chat: início (index.html) e conversa (chat.html).
 * A resposta da IA é simulada em streaming, palavra a palavra. Na integração,
 * troque streamReply() pelo stream da API mantendo os mesmos elementos. */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, $$, esc } = P;
  const app = $(".app");
  const params = new URLSearchParams(location.search);

  /* ───────────────────────── Mensagens ───────────────────────── */

  const fileChip = (f) => `<span class="file-chip" title="${esc(f.name)}"><span class="file-chip__icon" style="--tone:${f.type === "image" || f.image ? "var(--tone-orange)" : "var(--tone-blue)"}">${f.image && f.preview ? `<img src="${esc(f.preview)}" alt="Prévia de ${esc(f.name)}">` : P.icon(f.type === "image" || f.image ? "image" : "file")}</span><span class="file-chip__text"><span class="file-chip__name">${esc(f.name)}</span><span class="file-chip__meta">${esc(f.kind ? `${f.kind} · ${f.size}` : f.meta)}</span></span></span>`;

  const userMsg = (m) => `
    <article class="msg msg--user" aria-label="Sua mensagem">
      ${m.files?.length ? `<div class="row row--wrap" style="justify-content:flex-end">${m.files.map(fileChip).join("")}</div>` : ""}
      ${m.text ? `<div class="msg__bubble">${esc(m.text)}</div>` : ""}
      <div class="msg__meta">
        <button type="button" class="icon-btn icon-btn--sm" data-copy aria-label="Copiar">${P.icon("copy")}</button>
        <span class="msg__time">${esc(m.time || "agora")}</span>
      </div>
    </article>`;

  const aiActions = (m) => `
    <div class="msg__ai-actions">
      <button type="button" class="icon-btn icon-btn--sm" data-copy aria-label="Copiar">${P.icon("copy")}</button>
      <button type="button" class="icon-btn icon-btn--sm" data-rate="up" aria-pressed="${m.rated === "up"}" aria-label="Avaliar positivamente">${P.icon("thumb-up")}</button>
      <button type="button" class="icon-btn icon-btn--sm" data-rate="down" aria-pressed="${m.rated === "down"}" aria-label="Avaliar negativamente">${P.icon("thumb-down")}</button>
      ${m.last ? `<button type="button" class="btn btn--ghost" data-retry title="Gera uma nova resposta e usa créditos">${P.icon("refresh")}Refazer</button>` : ""}
      <span class="msg__time">${esc(m.time || "agora")}</span>
    </div>`;

  const aiMsg = (m) => {
    const md = P.model(m.model);
    return `
    <article class="msg msg--ai" aria-label="Resposta de ${esc(md.name)}">
      <span class="msg__avatar-wrap">${md.icon === "prisma" ? P.crystalBadge("msg__avatar") : P.modelIcon(md, "msg__avatar model-icon--lg")}</span>
      <div class="msg__model"><strong>${esc(md.name)}</strong></div>
      <div>
        ${m.reasoning ? `<details class="reasoning"><summary>${P.icon("chevron-right")}Raciocínio</summary><div class="reasoning__body">${esc(m.reasoning)}</div></details>` : ""}
        <div class="prose" ${m.reasoning ? 'style="margin-top:10px"' : ""}>${m.html || ""}</div>
      </div>
      ${m.streaming ? "" : aiActions(m)}
    </article>`;
  };

  const eventMsg = (m) => `<div class="event" role="note"><span class="event__pill">${P.icon("cpu", "i--xs")}${esc(m.text)} <strong>${esc(P.model(m.model).name)}</strong></span></div>`;

  const render = (m) => (m.role === "user" ? userMsg(m) : m.role === "ai" ? aiMsg(m) : eventMsg(m));

  /* ───────────────────────── Resposta simulada ───────────────────────── */

  const replyFor = (text, agent, modelKey) => {
    if (modelKey && P.model(modelKey).modality === "image") return [
      { tag: "p", text: `Seu pedido de imagem: ${text}` },
      { tag: "p", text: "A geração de imagens está em demonstração neste protótipo. Nenhuma imagem foi gerada." },
    ];
    const t = text.toLowerCase();
    if (agent) return [
      { tag: "p", text: `Oi! Sou o ${agent.name}. ${agent.desc}` },
      { tag: "p", text: "Para começar bem, me conta em uma frase o que você precisa agora e qual resultado espera no fim da conversa." },
    ];
    if (/tarefa|rotina|assistente|prioriz/.test(t)) return [
      { tag: "p", text: "Combinado. Vou funcionar como seu assistente de rotina, em três frentes:" },
      { tag: "ul", items: ["**Prioridade do dia:** você lista as tarefas e eu ordeno por urgência e impacto, com o motivo em uma linha.", "**Follow-ups:** guardo quem precisa de retorno, sobre o quê e até quando.", "**Reuniões:** você cola as anotações soltas e eu devolvo decisões, pendências e próximos passos."] },
      { tag: "p", text: "Para começar: **quais são as suas tarefas de hoje?** Pode mandar uma por linha, do jeito que estiver na sua cabeça." },
    ];
    if (/dado|planilha|tabela|csv/.test(t)) return [
      { tag: "p", text: "Ótimo, vamos olhar esses dados juntos. Antes de colar, me diga duas coisas:" },
      { tag: "ul", items: ["**O que cada linha representa** (uma venda, um cliente, um dia?)", "**Qual decisão** você quer tomar com a análise."] },
      { tag: "p", text: "Com isso eu aponto tendências, valores fora do padrão e fecho com uma tabela resumo." },
    ];
    if (/design|marca|cor|fonte/.test(t)) return [
      { tag: "p", text: "Vamos montar a identidade da sua marca. Preciso de três respostas rápidas:" },
      { tag: "ul", items: ["**Nome da marca** e o que ela vende.", "**Público:** quem compra e onde essa pessoa está.", "**Sensação:** três palavras que a marca deve passar."] },
      { tag: "p", text: "Depois eu devolvo a paleta com códigos hex, a combinação de fontes e o tom de voz, cada escolha explicada em uma frase." },
    ];
    if (/automat/.test(t)) return [
      { tag: "p", text: "Boa escolha. Vou mapear sua rotina e separar o que a IA pode fazer por você." },
      { tag: "p", text: "**Me descreva um dia típico de trabalho**, do começo ao fim: que ferramentas você abre, o que repete toda semana e o que mais toma tempo." },
    ];
    return [
      { tag: "p", text: "Entendi. Vou direto ao ponto e, se faltar alguma informação, eu pergunto antes de supor." },
      { tag: "p", text: "Pode me dar um pouco mais de contexto? Para quem é isso e qual o resultado que você espera ao final?" },
    ];
  };

  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code>$1</code>");

  // Envolve cada palavra num <span class="tok">, que aparece desfocando
  const tokenize = (el) => {
    const toks = [];
    const walk = (node) => [...node.childNodes].forEach((c) => {
      if (c.nodeType !== 3) { walk(c); return; }
      const frag = document.createDocumentFragment();
      c.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(part); return; }
        const t = document.createElement("span");
        t.className = "tok";
        t.textContent = part;
        toks.push(t);
        frag.append(t);
      });
      c.replaceWith(frag);
    });
    walk(el);
    return toks;
  };

  /** Escreve os blocos palavra a palavra. Devolve uma função que interrompe. */
  const streamReply = (prose, blocks, done) => {
    let stopped = false;
    const queue = [];
    blocks.forEach((b) => {
      if (b.tag === "ul") { const ul = document.createElement("ul"); queue.push({ open: ul }); b.items.forEach((it) => queue.push({ parent: ul, tag: "li", text: it })); }
      else queue.push({ parent: prose, tag: b.tag, text: b.text });
    });
    let qi = 0;
    const next = () => {
      if (stopped) return;
      if (qi >= queue.length) { done(); return; }
      const job = queue[qi++];
      if (job.open) { prose.append(job.open); next(); return; }
      const el = document.createElement(job.tag);
      el.innerHTML = inline(job.text);
      const toks = tokenize(el);
      job.parent.append(el);
      let wi = 0;
      const tick = () => {
        if (stopped) return;
        const n = 1 + Math.floor(Math.random() * 2);
        for (let k = 0; k < n && wi < toks.length; k++) toks[wi++].classList.add("on");
        keepBottom();
        if (wi < toks.length) setTimeout(tick, P.motion?.reduced ? 0 : 30 + Math.random() * 45);
        else setTimeout(next, 140);
      };
      tick();
    };
    setTimeout(() => { prose.innerHTML = ""; next(); }, 1100);
    return () => {
      stopped = true;
      prose.querySelectorAll(".tok:not(.on)").forEach((t) => t.remove());
      $(".thinking", prose)?.remove();
      done(true);
    };
  };

  const THINKING = `<span class="thinking" role="status">${P.icon("sparkles", "i--sm")}Pensando…</span>`;

  /* ───────────────────────── Conversa ───────────────────────── */

  const thread = $(".thread");
  let follow = true;
  const keepBottom = () => { if (follow) scrollTo({ top: document.body.scrollHeight }); };
  addEventListener("scroll", () => { follow = innerHeight + scrollY > document.body.scrollHeight - 140; }, { passive: true });

  let comp;
  const answer = ({ text, files, model, agent }) => {
    $$(".msg [data-retry]", thread).forEach((b) => b.remove());
    thread.insertAdjacentHTML("beforeend", userMsg({ text, files }));
    const wrap = document.createElement("div");
    wrap.innerHTML = aiMsg({ model, html: "", streaming: true });
    const art = wrap.firstElementChild;
    thread.append(art);
    const prose = $(".prose", art);
    prose.innerHTML = THINKING;
    art.classList.add("is-streaming");
    P.hydrateIcons(thread);
    follow = true;
    keepBottom();
    comp.setBusy(true);
    comp.stop = streamReply(prose, replyFor(text, agent, model), (stopped) => {
      art.classList.remove("is-streaming");
      art.insertAdjacentHTML("beforeend", aiActions({ last: true, time: "agora" }));
      if (stopped) prose.insertAdjacentHTML("beforeend", `<p class="hint">Resposta interrompida.</p>`);
      comp.setBusy(false);
      comp.stop = null;
      comp.input.focus({ preventScroll: true });
    });
  };

  thread?.addEventListener("click", (e) => {
    const copy = e.target.closest("[data-copy]");
    if (copy) {
      const msg = copy.closest(".msg");
      const txt = ($(".msg__bubble", msg) || $(".prose", msg))?.innerText || "";
      navigator.clipboard?.writeText(txt).catch(() => {});
      P.toast("Copiado", "copy");
    }
    const rate = e.target.closest("[data-rate]");
    if (rate) {
      const on = rate.getAttribute("aria-pressed") !== "true";
      $$("[data-rate]", rate.parentElement).forEach((b) => b.setAttribute("aria-pressed", "false"));
      rate.setAttribute("aria-pressed", on);
      if (on) P.toast(rate.dataset.rate === "up" ? "Obrigado pela avaliação" : "Obrigado. Isso ajuda a melhorar as respostas", rate.dataset.rate === "up" ? "thumb-up" : "thumb-down");
    }
    const retry = e.target.closest("[data-retry]");
    if (retry) {
      const art = retry.closest(".msg");
      const prose = $(".prose", art);
      $(".reasoning", art)?.remove();
      $(".msg__ai-actions", art).remove();
      prose.style.marginTop = "";
      prose.innerHTML = THINKING;
      art.classList.add("is-streaming");
      comp.setBusy(true);
      comp.stop = streamReply(prose, replyFor("rotina", null, comp.state.model), () => {
        art.classList.remove("is-streaming");
        art.insertAdjacentHTML("beforeend", aiActions({ last: true, time: "agora" }));
        comp.setBusy(false);
        comp.stop = null;
      });
    }
  });

  /* ───────────────────────── Início ───────────────────────── */

  if (app.dataset.page === "chat-home") {
    const name = D.user.nickname || D.user.name;
    $("[data-greet]").innerHTML = `O que vamos criar hoje, <em>${esc(name)}</em>?`;
    $(".suggestions").innerHTML = D.suggestions.map((s, i) => `<li><button type="button" class="pill-suggestion" data-s="${i}">${P.icon(s.icon)}${esc(s.title)}</button></li>`).join("");
    comp = P.composer($(".composer"), {
      placeholder: "O que vamos criar hoje?",
      onSend: ({ text, files, model, agent, skills, project }) => {
        const q = new URLSearchParams({ q: text, model });
        if (files.length) {
          const key = `prisma:attachments:${crypto.randomUUID()}`;
          try {
            sessionStorage.setItem(key, JSON.stringify(files));
            q.set("attachments", key);
          } catch {
            P.toast("A imagem é grande demais para abrir uma nova conversa. Use uma imagem menor ou anexe na conversa aberta.", "info");
            return false;
          }
        }
        if (agent) q.set("agent", agent.id);
        if (skills.length) q.set("skills", skills.join("|"));
        if (project) q.set("project", project);
        location.href = "chat.html?" + q;
      },
    });
    $(".suggestions").addEventListener("click", (e) => {
      const b = e.target.closest("[data-s]");
      if (b) comp.setText(D.suggestions[+b.dataset.s].prompt);
    });
    P.ready();
    P.motion?.split($("[data-greet]"), 150);
    // O orbe “acorda” enquanto o campo está em foco ou com texto
    const orb = $(".welcome__mark .orb");
    if (orb) {
      const wake = () => orb.classList.toggle("is-awake", document.activeElement === comp.input || !!comp.input.value.trim());
      ["focus", "blur", "input"].forEach((ev) => comp.input.addEventListener(ev, wake));
      wake();
    }
    P.motion?.typewriter(comp.input, [
      "Crie um agente para atender clientes…",
      "Analise minha planilha de vendas…",
      "Monte um plano de estudos de Python…",
      "Resuma a reunião de hoje…",
      "Sugira cores para a minha marca…",
    ]);
    comp.input.focus({ preventScroll: true });
    return;
  }

  /* ───────────────────────── Conversa existente ou nova ───────────────────────── */

  const q = params.get("q");
  const t = D.thread;
  const isNew = params.has("q");
  const title = isNew ? (q.slice(0, 60) + (q.length > 60 ? "…" : "") || "Conversa com imagem") : t.title;
  document.title = `${title} · Asimov Prisma`;
  $("[data-title]").textContent = isNew ? "Nova conversa" : title;
  const startModel = params.get("model") || (isNew ? "asimov" : t.model);
  if (!isNew) thread.innerHTML = t.messages.map(render).join("");

  const startAgent = params.get("agent") && [...D.myAgents, ...D.gallery.agents].find((a) => a.id === params.get("agent"));
  comp = P.composer($(".composer"), {
    placeholder: "Escreva sua mensagem",
    model: startModel,
    skills: params.get("skills") ? params.get("skills").split("|") : [],
    agent: startAgent || null,
    project: params.get("project"),
    onSend: (msg) => answer(msg),
  });
  comp.onModel = (k) => { thread.insertAdjacentHTML("beforeend", eventMsg({ text: "Modelo trocado para", model: k })); keepBottom(); };

  $("[data-chat-more]").addEventListener("click", (e) => P.menu(e.currentTarget, [
    { label: "Renomear", icon: "pencil", onClick: () => {
      const m = P.modal({ title: "Renomear conversa", body: `<div class="field"><div class="field__top"><label class="label" for="rn">Nome</label><span class="counter"></span></div><input id="rn" class="input" maxlength="120" value="${esc($("[data-title]").textContent)}" autofocus></div>`,
        buttons: [{ label: "Cancelar" }, { label: "Salvar", variant: "primary", onClick: (m) => { $("[data-title]").textContent = $("#rn", m).value.trim() || "Nova conversa"; P.toast("Conversa renomeada", "pencil"); } }] });
    } },
    { label: "Mover para projeto", icon: "folder", onClick: () => P.projectPicker((p) => P.toast(`Movida para ${p.name}`, "folder"), { title: "Mover para projeto", desc: "A conversa passa a usar o contexto e os arquivos do projeto." }) },
    { label: "Baixar conversa (.md)", icon: "download", onClick: () => P.toast("Download começou", "download") },
    { sep: true },
    { label: "Apagar", icon: "trash", danger: true, onClick: () => P.confirm({ title: "Apagar conversa?", desc: "A conversa e as mensagens dela somem para sempre.", onConfirm: () => (location.href = "index.html") }) },
  ], { label: "Mais ações", align: "end" }));

  P.ready();
  if (!params.has("topo")) scrollTo({ top: document.body.scrollHeight });
  if (isNew) {
    history.replaceState(null, "", "chat.html?id=nova");
    let files = [];
    const attachmentKey = params.get("attachments");
    if (attachmentKey?.startsWith("prisma:attachments:")) {
      try { files = JSON.parse(sessionStorage.getItem(attachmentKey) || "[]"); } catch {}
      sessionStorage.removeItem(attachmentKey);
    }
    answer({ text: q, files, model: startModel, agent: startAgent });
  }
  comp.input.focus({ preventScroll: true });
})();
