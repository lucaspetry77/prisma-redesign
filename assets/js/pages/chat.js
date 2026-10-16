/* Asimov Prisma · conversa (chat.html)
 * ?id= abre uma conversa; ?q= começa uma nova (com model, agent, skills, project, attachments).
 * A resposta é simulada em streaming. Na integração, troque streamReply() pelo stream da API mantendo
 * os mesmos elementos (.prose e as palavras em .tok). Referências: A.2 (Claude, ChatGPT, Mistral, Obvious).
 */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, $$, esc, params } = P;
  const icon = (n, c) => P.icon(n, c);
  const thread = $("[data-thread]");
  const live = $("[data-live]");

  /* ───────────────────────── Mensagens ───────────────────────── */

  const fileCard = (f) => {
    const image = f.type === "image" || f.image;
    return `<span class="file-card" title="${esc(f.name)}"><span class="file-card__icon ${image ? "file-card__icon--img" : ""}">${image && f.preview ? `<img src="${esc(f.preview)}" alt="Prévia de ${esc(f.name)}">` : icon(image ? "image" : "file", "i--sm")}</span><span class="file-card__text"><span class="file-card__name">${esc(f.name)}</span><span class="file-card__meta">${esc(f.meta || [f.kind, f.size].filter(Boolean).join(" · "))}</span></span></span>`;
  };

  const userMsg = (m) => `
    <article class="msg msg--user" aria-label="Sua mensagem">
      ${m.files?.length ? `<div class="msg__files">${m.files.map(fileCard).join("")}</div>` : ""}
      ${m.text ? `<div class="msg__bubble">${esc(m.text)}</div>` : ""}
      <div class="msg__under"><span class="msg__time">${esc(m.time || "agora")}</span><button type="button" class="icon-btn icon-btn--xs" data-copy aria-label="Copiar mensagem" data-tip="Copiar">${icon("copy")}</button></div>
    </article>`;

  const actions = (m) => `
    <div class="msg__actions" role="toolbar" aria-label="Ações da resposta">
      <button type="button" class="icon-btn icon-btn--sm" data-copy aria-label="Copiar resposta" data-tip="Copiar">${icon("copy")}</button>
      <button type="button" class="icon-btn icon-btn--sm" data-rate="up" aria-pressed="${m.rated === "up"}" aria-label="Boa resposta" data-tip="Boa resposta">${icon("thumb-up")}</button>
      <button type="button" class="icon-btn icon-btn--sm" data-rate="down" aria-pressed="${m.rated === "down"}" aria-label="Resposta ruim" data-tip="Resposta ruim">${icon("thumb-down")}</button>
      ${m.last ? `<button type="button" class="btn btn--ghost btn--sm" data-retry data-tip="Gera uma nova resposta e usa créditos">${icon("refresh")}Refazer</button>` : ""}
    </div>`;

  const aiMsg = (m) => {
    const md = P.model(m.model);
    const avatar = md.icon === "prisma" || md.icon === "prisma-plus" ? P.crystalBadge() : P.modelIcon(md);
    return `
    <article class="msg msg--ai ${m.last ? "is-last" : ""}" aria-label="Resposta de ${esc(md.name)}" data-model="${esc(md.key)}">
      <div class="msg__who">${avatar}<strong>${esc(md.name)}</strong><span class="msg__time">${esc(m.time || "agora")}</span></div>
      <div class="msg__body">
        ${m.reasoning ? reasoning(m.reasoning) : ""}
        <div class="prose">${m.html || ""}</div>
      </div>
      ${m.streaming ? "" : actions(m)}
    </article>`;
  };
  const reasoning = (text) => `<div class="reasoning"><button type="button" class="reasoning__toggle" aria-expanded="false">${icon("chevron-right")}Raciocínio</button><div class="reasoning__body"><div class="reasoning__inner"><p class="reasoning__text">${esc(text)}</p></div></div></div>`;
  const eventMsg = (m) => `<div class="event" role="note"><span class="event__in">${icon("cpu", "i--xs")}${esc(m.text)} ${P.modelIcon(P.model(m.model))}<strong>${esc(P.model(m.model).name)}</strong></span></div>`;
  const render = (m) => (m.role === "user" ? userMsg(m) : m.role === "ai" ? aiMsg(m) : eventMsg(m));

  /* ───────────────────────── Resposta simulada ───────────────────────── */

  const replyFor = (text, agent, modelKey) => {
    if (modelKey && P.model(modelKey).modality === "image") return [
      { tag: "p", text: `Pedido de imagem: ${text}` },
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
      if (qi >= queue.length) { done(false); return; }
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
        follow();
        if (wi < toks.length) setTimeout(tick, P.reduced ? 0 : 28 + Math.random() * 40);
        else setTimeout(next, 120);
      };
      tick();
    };
    const t0 = setTimeout(() => { prose.innerHTML = ""; next(); }, 900);
    return () => {
      stopped = true;
      clearTimeout(t0);
      $$(".tok:not(.on)", prose).forEach((t) => t.remove());
      $(".thinking", prose)?.remove();
      done(true);
    };
  };
  const THINKING = `<span class="thinking" role="status">Pensando…</span>`;

  /* ───────────────────────── Rolagem ───────────────────────── */

  let stick = true;
  const down = $("[data-down]");
  const atBottom = () => innerHeight + scrollY > document.documentElement.scrollHeight - 120;
  const follow = () => { if (stick) scrollTo({ top: document.documentElement.scrollHeight }); };
  addEventListener("scroll", () => {
    stick = atBottom();
    down.classList.toggle("is-on", !stick);
    $("[data-head]").classList.toggle("is-stuck", scrollY > 4);
  }, { passive: true });
  down.addEventListener("click", () => { stick = true; scrollTo({ top: document.documentElement.scrollHeight, behavior: P.reduced ? "auto" : "smooth" }); comp.input.focus({ preventScroll: true }); });

  /* ───────────────────────── Responder ───────────────────────── */

  let comp;
  const clearRetry = () => { $$(".msg [data-retry]", thread).forEach((b) => b.remove()); $$(".msg--ai.is-last", thread).forEach((m) => m.classList.remove("is-last")); };
  const startStream = (art, blocks) => {
    const prose = $(".prose", art);
    prose.innerHTML = THINKING;
    art.classList.add("is-streaming");
    comp.setBusy(true);
    live.textContent = "O Prisma está respondendo.";
    comp.stop = streamReply(prose, blocks, (stopped) => {
      art.classList.remove("is-streaming");
      art.classList.add("is-last");
      art.insertAdjacentHTML("beforeend", actions({ last: true }));
      if (stopped) $(".msg__body", art).insertAdjacentHTML("beforeend", `<p class="msg__note mt-2">Resposta interrompida.</p>`);
      comp.setBusy(false);
      comp.stop = null;
      live.textContent = stopped ? "Resposta interrompida." : "Resposta pronta.";
      comp.input.focus({ preventScroll: true });
    });
  };
  const answer = async ({ text, files, model, agent }) => {
    clearRetry();
    thread.insertAdjacentHTML("beforeend", userMsg({ text, files }));
    stick = true;
    follow();
    try {
      // A ida ao servidor: falha simulada com ?estado=erro-salvar
      await P.api.send("POST", "/v1/conversations/messages", { text }, { delay: 120 });
    } catch (err) {
      thread.lastElementChild.remove();
      comp.showError({ message: "A conexão falhou antes de a mensagem chegar." }, text);
      return;
    }
    const wrap = document.createElement("div");
    wrap.innerHTML = aiMsg({ model, streaming: true });
    const art = wrap.firstElementChild;
    thread.append(art);
    P.hydrateIcons(thread);
    follow();
    startStream(art, replyFor(text, agent, model));
  };

  thread.addEventListener("click", (e) => {
    const copy = e.target.closest("[data-copy]");
    if (copy) {
      const msg = copy.closest(".msg");
      const txt = ($(".msg__bubble", msg) || $(".prose", msg))?.innerText || "";
      navigator.clipboard?.writeText(txt).catch(() => {});
      copy.innerHTML = icon("check");
      copy.classList.add("is-done");
      live.textContent = "Copiado.";
      setTimeout(() => { copy.innerHTML = icon("copy"); copy.classList.remove("is-done"); }, 1400);
      return;
    }
    const rate = e.target.closest("[data-rate]");
    if (rate) {
      const on = rate.getAttribute("aria-pressed") !== "true";
      $$("[data-rate]", rate.parentElement).forEach((b) => b.setAttribute("aria-pressed", "false"));
      rate.setAttribute("aria-pressed", String(on));
      if (on) P.toast(rate.dataset.rate === "up" ? "Obrigado pela avaliação" : "Obrigado. Isso ajuda a melhorar as respostas", { icon: rate.dataset.rate === "up" ? "thumb-up" : "thumb-down" });
      return;
    }
    const toggle = e.target.closest(".reasoning__toggle");
    if (toggle) {
      const r = toggle.closest(".reasoning");
      const o = r.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(o));
      return;
    }
    const retry = e.target.closest("[data-retry]");
    if (retry) {
      const art = retry.closest(".msg");
      $(".reasoning", art)?.remove();
      $(".msg__actions", art)?.remove();
      $(".msg__note", art)?.remove();
      startStream(art, replyFor("rotina", null, comp.state.model));
    }
  });

  /* ───────────────────────── Cabeçalho ───────────────────────── */

  const isNew = params.has("q");
  const id = params.get("id") || "";
  const q = params.get("q") || "";
  const conv = D.conversations.flatMap((g) => g.items).find((c) => c.id === id);
  const projectId = params.get("project") || conv?.project || null;
  const project = projectId && D.projects.find((p) => p.id === projectId);
  let title = isNew ? (q.slice(0, 60) + (q.length > 60 ? "…" : "") || "Conversa com imagem") : (conv?.title || D.thread.title);

  const renderHead = () => {
    $("[data-crumbs]").innerHTML = `${project ? `<a href="projeto.html?id=${project.id}">${icon("folder")}${esc(project.name)}</a>${icon("chevron-right")}` : ""}
      <button type="button" class="chat-head__title" data-chat-title aria-haspopup="menu" aria-expanded="false" aria-label="${esc(title)}: ações da conversa"><span>${esc(title)}</span>${icon("chevron-down")}</button>`;
    document.title = `${title} · Asimov Prisma`;
    $("[data-h1]").textContent = title;
    const tb = $(".topbar__title");
    if (tb) tb.textContent = title;
  };
  const rename = () => {
    const btn = $("[data-chat-title]");
    const input = document.createElement("input");
    input.className = "conv__rename";
    input.style.maxWidth = "420px";
    input.value = title;
    input.maxLength = 120;
    input.setAttribute("aria-label", "Novo nome da conversa");
    btn.replaceWith(input);
    input.focus();
    input.select();
    const done = (save) => {
      if (!input.isConnected) return;
      const v = input.value.trim();
      if (save && v && v !== title) { title = v; P.toast("Conversa renomeada", { icon: "pencil" }); const li = $(`.conv[data-id="${id}"] .conv__link`); if (li) li.textContent = v; }
      renderHead();
      P.hydrateIcons($("[data-crumbs]"));
      $("[data-chat-title]").focus();
    };
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") done(true); if (e.key === "Escape") { e.stopPropagation(); done(false); } });
    input.addEventListener("blur", () => done(true));
  };
  const copyLink = () => { navigator.clipboard?.writeText(location.href).catch(() => {}); P.toast("Link copiado", { icon: "link" }); };
  const menuItems = () => [
    { label: "Renomear", icon: "pencil", onClick: rename },
    { label: project ? "Trocar de projeto" : "Mover para projeto", icon: "folder", onClick: () => P.projectPicker((p) => P.toast(`Movida para ${p.name}`, { icon: "folder" }), { title: "Mover para projeto", desc: "A conversa passa a usar o contexto e os arquivos do projeto.", current: projectId }) },
    { label: "Baixar (.md)", icon: "download", onClick: () => P.toast("Download começou", { icon: "download" }) },
    { label: "Copiar link", icon: "link", onClick: copyLink },
    { sep: true },
    { label: "Apagar conversa", icon: "trash", danger: true, onClick: () => P.confirm({ title: "Apagar esta conversa?", desc: "A conversa e todas as mensagens dela somem para sempre.", onConfirm: () => P.api.send("DELETE", `/v1/conversations/${id}`).then(() => { location.href = "index.html"; }) }) },
  ];
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-chat-title], [data-more], button.topbar__title");
    if (t) P.menu(t, menuItems(), { label: "Ações da conversa", align: t.matches("[data-more]") ? "end" : "start" });
    if (e.target.closest("[data-copy-link]")) copyLink();
  });
  // No celular, o título no topo abre o mesmo menu
  const tb = $(".topbar__title");
  if (tb) { const b = document.createElement("button"); b.type = "button"; b.className = "topbar__title"; b.setAttribute("aria-haspopup", "menu"); b.textContent = title; tb.replaceWith(b); }
  renderHead();

  /* ───────────────────────── Montagem ───────────────────────── */

  const startAgent = params.get("agent") && [...D.myAgents, ...D.gallery.agents].find((a) => a.id === params.get("agent"));
  const startModel = params.get("model") || (isNew ? null : D.thread.model);
  comp = P.composer($("[data-composer]"), {
    placeholder: "Escreva sua mensagem",
    label: "Mensagem",
    model: startModel,
    skills: params.get("skills") ? params.get("skills").split("|") : [],
    agent: startAgent || null,
    project: projectId,
    onSend: (msg) => { answer(msg); },
  });
  comp.onModel = (k) => { thread.insertAdjacentHTML("beforeend", eventMsg({ text: "Modelo trocado para", model: k })); P.hydrateIcons(thread); follow(); };

  const skeleton = `<div class="msg msg--user" aria-hidden="true"><div class="skel" style="width:46%;height:44px;border-radius:18px"></div></div>
    <div class="msg msg--ai" aria-hidden="true"><div class="row"><div class="skel skel--circle" style="width:26px;height:26px;border-radius:8px"></div><div class="skel skel--line" style="width:120px"></div></div>${P.skeleton.lines(4)}</div>`;

  if (isNew) {
    history.replaceState(null, "", "chat.html?id=nova");
    let files = [];
    const key = params.get("attachments");
    if (key?.startsWith("prisma:attachments:")) {
      try { files = JSON.parse(sessionStorage.getItem(key) || "[]"); } catch {}
      sessionStorage.removeItem(key);
    }
    P.ready();
    answer({ text: q, files, model: comp.state.model, agent: startAgent });
  } else {
    P.load(thread, () => P.api.get(`/v1/conversations/${id || D.thread.id}`), (t) => {
      thread.innerHTML = t.messages.map(render).join("");
      P.ready(thread);
      if (!params.has("topo")) scrollTo({ top: document.documentElement.scrollHeight });
    }, { skeleton, label: "Carregando conversa" });
    P.ready();
  }
  comp.input.focus({ preventScroll: true });
})();
