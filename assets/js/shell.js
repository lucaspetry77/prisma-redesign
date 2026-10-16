/* Asimov Prisma · shell
 * Monta a barra lateral e o topo do celular em volta de <div class="app" data-page data-nav> + <main class="main">,
 * e cuida do que é global: paleta de comandos (⌘K), atalhos, créditos, conta, mover para projeto e NPS.
 */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, $$, esc, fmt, store, keys, mod } = P;
  const icon = (n, c) => P.icon(n, c);

  const NAV = [
    { id: "projetos", label: "Projetos", icon: "folder", href: "projetos.html" },
    { id: "agentes", label: "Agentes", icon: "agent", href: "agentes.html" },
    { id: "skills", label: "Skills", icon: "skill", href: "skills.html" },
    { id: "galeria", label: "Galeria", icon: "gallery", href: "galeria.html" },
  ];

  /* ───────────────────────── Mover para projeto ───────────────────────── */

  const projectPicker = (onPick, { title = "Adicionar ao projeto", desc = "O contexto e os arquivos do projeto passam a valer para esta conversa.", current = null } = {}) => {
    const m = P.modal({
      title, desc,
      body: `<div class="pick" role="list">${D.projects.map((p) => `
        <button type="button" class="pick__row" role="listitem" data-project="${p.id}" ${p.id === current ? 'aria-current="true"' : ""}>
          <span class="icon-chip icon-chip--tone tone-${p.tone}">${icon("folder")}</span>
          <span class="grow"><span class="pick__title">${esc(p.name)}</span><br><span class="pick__desc">${P.plural(p.conversations, "conversa", "conversas")} · ${p.files ? P.plural(p.files, "arquivo", "arquivos") : "sem arquivos"}</span></span>
          ${p.id === current ? `<span class="badge">Atual</span>` : icon("chevron-right", "i--sm")}
        </button>`).join("")}
        <a class="pick__row" href="projetos.html?novo=1"><span class="icon-chip">${icon("plus")}</span><span class="pick__title">Novo projeto</span></a></div>`,
    });
    m.addEventListener("click", (e) => {
      const b = e.target.closest("[data-project]");
      if (!b) return;
      m._close();
      onPick(D.projects.find((p) => p.id === b.dataset.project));
    });
    return m;
  };

  /* ───────────────────────── Avaliação da plataforma (NPS) ───────────────────────── */

  const platformReview = () => P.modal({
    title: "Avaliação da plataforma",
    desc: "De 0 a 10, quanto você recomendaria o Prisma a um colega?",
    body: `<fieldset><legend class="sr-only">Nota de 0 a 10</legend>
        <div class="nps">${Array.from({ length: 11 }, (_, n) => `<label><input type="radio" name="nps" value="${n}" aria-label="Nota ${n}"><span>${n}</span></label>`).join("")}</div>
        <div class="row row--between mt-2"><span class="hint">Nada provável</span><span class="hint">Muito provável</span></div></fieldset>
      <div class="field mt-6"><div class="field__top"><label class="label" for="nps-c">O que podemos melhorar? <small>opcional</small></label><span class="counter"></span></div>
        <textarea id="nps-c" class="textarea" rows="3" maxlength="2000" placeholder="Conte o que funcionou e o que atrapalhou."></textarea></div>`,
    footLeft: "Fica salva neste navegador.",
    buttons: [{ label: "Cancelar" }, { label: "Enviar avaliação", variant: "primary", id: "nps-ok", disabled: true, onClick: (m) => {
      const v = $("input[name='nps']:checked", m);
      if (!v) return false;
      return P.api.send("POST", "/v1/feedback", { score: +v.value }).then(() => {
        store.set("platformReview", { score: +v.value, comment: $("#nps-c", m).value.trim(), date: new Date().toISOString() });
        P.toast("Avaliação enviada. Obrigado!");
      });
    } }],
    onOpen: (m) => m.addEventListener("change", () => ($("#nps-ok", m).disabled = !$("input[name='nps']:checked", m))),
  });

  /* ───────────────────────── Ajuda de atalhos ───────────────────────── */

  const shortcutsHelp = () => {
    const rows = [
      ["Buscar e ir para qualquer lugar", "mod+k"],
      ["Novo chat", "mod+shift+o"],
      ["Recolher ou abrir a barra lateral", "mod+\\"],
      ["Focar o campo de mensagem", "/"],
      ["Enviar mensagem", "enter"],
      ["Quebrar linha", "shift+enter"],
      ["Fechar menus e janelas", "escape"],
      ["Ver atalhos", "?"],
    ];
    P.modal({ title: "Atalhos de teclado", body: `<div class="shortcuts">${rows.map(([l, c]) => `<div class="shortcuts__row"><span>${l}</span><span class="shortcuts__keys">${keys.kbd(c)}</span></div>`).join("")}</div>` });
  };

  /* ───────────────────────── Paleta de comandos ───────────────────────── */

  const PAGES = [
    { title: "Início", href: "index.html", icon: "home" },
    ...NAV.map((n) => ({ title: n.label, href: n.href, icon: n.icon })),
    { title: "Configurações", href: "perfil.html", icon: "settings" },
  ];
  const ACTIONS = [
    { title: "Novo chat", href: "index.html", icon: "new-chat", kbd: "mod+shift+o" },
    { title: "Novo projeto", href: "projetos.html?novo=1", icon: "folder-plus" },
    { title: "Criar agente", href: "agente-novo.html", icon: "agent" },
    { title: "Criar skill", href: "skill-nova.html", icon: "skill" },
    { title: "Atalhos de teclado", run: shortcutsHelp, icon: "keyboard", kbd: "?" },
  ];

  let cmdkOpen = null;
  const cmdk = (initial = "") => {
    if (cmdkOpen) { cmdkOpen.querySelector(".cmdk__input").focus(); return; }
    P.closePopover(false);
    const last = document.activeElement;
    const isAdmin = D.user.role === "ADMIN";
    const pages = [...PAGES, ...(isAdmin ? [
      { title: "Admin · Modelos", href: "admin-modelos.html", icon: "cpu" },
      { title: "Admin · Uso e custo", href: "admin-uso.html", icon: "chart" },
      { title: "Admin · Usuários e tetos", href: "admin-usuarios.html", icon: "users" },
    ] : [])];
    const convs = D.conversations.flatMap((g) => g.items.map((c) => ({ title: c.title, href: `chat.html?id=${c.id}`, icon: "chat", meta: g.group })));
    const sources = [
      { label: "Ações", items: ACTIONS, always: true },
      { label: "Conversas", items: convs, limit: 6 },
      { label: "Projetos", items: D.projects.map((p) => ({ title: p.name, href: `projeto.html?id=${p.id}`, icon: "folder", meta: P.plural(p.conversations, "conversa", "conversas") })) },
      { label: "Seus agentes", items: D.myAgents.map((a) => ({ title: a.name, href: `agente-novo.html?id=${a.id}`, icon: "agent", meta: "Seu agente" })) },
      { label: "Suas skills", items: D.mySkills.map((s) => ({ title: s.name, href: `skill-nova.html?id=${s.id}`, icon: "skill", meta: s.category })) },
      { label: "Galeria", items: [...D.gallery.agents.map((a) => ({ title: a.name, href: `galeria-item.html?id=${a.id}`, icon: "agent", meta: `Agente · ${a.category}` })), ...D.gallery.skills.map((s) => ({ title: s.name, href: `galeria-item.html?id=${s.id}`, icon: "skill", meta: `Skill · ${s.category}` }))], limit: 6 },
      { label: "Páginas", items: pages, always: true },
    ];

    const layer = document.createElement("div");
    layer.className = "cmdk-layer";
    layer.innerHTML = `
      <div class="overlay__scrim" data-close></div>
      <div class="cmdk" role="dialog" aria-modal="true" aria-label="Buscar no Prisma">
        <div class="cmdk__search">${icon("search")}
          <input class="cmdk__input" type="text" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" placeholder="Buscar conversas, projetos, agentes, skills…" autocomplete="off" spellcheck="false">
          <kbd>Esc</kbd>
        </div>
        <div class="cmdk__list scroll-soft" id="cmdk-list" role="listbox" aria-label="Resultados"></div>
        <div class="cmdk__foot"><span><kbd>↑</kbd><kbd>↓</kbd> navegar</span><span><kbd>↵</kbd> abrir</span><span><kbd>Esc</kbd> fechar</span></div>
      </div>`;
    document.body.append(layer);
    cmdkOpen = layer;
    document.documentElement.style.overflow = "hidden";
    const input = $(".cmdk__input", layer);
    const list = $(".cmdk__list", layer);
    let flat = [], sel = 0;

    const mark = (title, q) => {
      if (!q) return esc(title);
      const i = P.norm(title).indexOf(P.norm(q));
      return i < 0 ? esc(title) : esc(title.slice(0, i)) + `<mark>${esc(title.slice(i, i + q.length))}</mark>` + esc(title.slice(i + q.length));
    };
    const render = () => {
      const q = input.value.trim();
      const nq = P.norm(q);
      flat = [];
      const groups = sources.map((s) => {
        let items = q ? s.items.filter((it) => P.norm(`${it.title} ${it.meta || ""}`).includes(nq)) : (s.always ? s.items : s.label === "Conversas" ? s.items.slice(0, 5) : []);
        if (s.limit) items = items.slice(0, s.limit);
        if (!items.length) return "";
        return `<div class="cmdk__group" role="group" aria-label="${esc(s.label)}"><div class="cmdk__label" aria-hidden="true">${esc(s.label)}</div>${items.map((it) => {
          const i = flat.push(it) - 1;
          return `<button type="button" class="cmdk__item" role="option" id="cmdk-o${i}" data-i="${i}" aria-selected="false" tabindex="-1">${icon(it.icon)}<span class="cmdk__title">${mark(it.title, q)}</span>${it.meta ? `<span class="cmdk__meta">${esc(it.meta)}</span>` : ""}${it.kbd ? `<span class="cmdk__go">${keys.kbd(it.kbd)}</span>` : `<span class="cmdk__go"><kbd>↵</kbd></span>`}</button>`;
        }).join("")}</div>`;
      }).join("");
      list.innerHTML = groups || `<div class="cmdk__empty"><strong>Nada encontrado para “${esc(q)}”</strong>Tente outra palavra, ou comece uma conversa com ela.<div class="mt-4"><a class="btn btn--secondary btn--sm" href="index.html?${new URLSearchParams({ texto: q })}">${icon("new-chat")}Novo chat com “${esc(q.slice(0, 30))}”</a></div></div>`;
      sel = 0;
      highlight();
    };
    const highlight = () => {
      $$(".cmdk__item", list).forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.i === sel)));
      const on = $(`#cmdk-o${sel}`, list);
      input.setAttribute("aria-activedescendant", on ? on.id : "");
      on?.scrollIntoView({ block: "nearest" });
    };
    const go = (it) => {
      if (!it) return;
      closeCmdk();
      if (it.run) it.run(); else location.href = it.href;
    };
    const closeCmdk = () => {
      if (!cmdkOpen) return;
      cmdkOpen = null;
      layer.classList.add("is-leaving");
      document.documentElement.style.overflow = "";
      setTimeout(() => layer.remove(), 150);
      if (last?.isConnected) last.focus({ preventScroll: true });
    };
    input.addEventListener("input", render);
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(flat.length - 1, sel + 1); highlight(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); highlight(); }
      else if (e.key === "Enter") { e.preventDefault(); go(flat[sel]); }
      else if (e.key === "Escape") { e.preventDefault(); closeCmdk(); }
      else if (e.key === "Tab") e.preventDefault();
    });
    list.addEventListener("pointermove", (e) => { const b = e.target.closest(".cmdk__item"); if (b && +b.dataset.i !== sel) { sel = +b.dataset.i; highlight(); } });
    list.addEventListener("click", (e) => { const b = e.target.closest(".cmdk__item"); if (b) go(flat[+b.dataset.i]); });
    layer.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeCmdk(); });
    input.value = initial;
    render();
    requestAnimationFrame(() => input.focus());
  };

  /* ───────────────────────── Shell ───────────────────────── */

  const recentsHtml = (groups, active) => groups.length ? groups.map((g) => `
    <section class="recents__group" aria-label="${esc(g.group)}">
      <h3 class="recents__label">${esc(g.group)}</h3>
      <ul role="list">${g.items.map((c) => `
        <li class="conv ${c.id === active ? "is-active" : ""}" data-id="${c.id}">
          <a class="conv__link" href="chat.html?id=${c.id}" ${c.id === active ? 'aria-current="page"' : ""} title="${esc(c.title)}">${esc(c.title)}</a>
          <button type="button" class="icon-btn icon-btn--xs conv__more" aria-label="Ações de “${esc(c.title)}”" aria-haspopup="menu" aria-expanded="false">${icon("more")}</button>
        </li>`).join("")}</ul>
    </section>`).join("")
    : `<p class="recents__empty">Suas conversas aparecem aqui. Comece pelo <a class="link" href="index.html">novo chat</a>.</p>`;

  const shell = () => {
    const app = $(".app");
    if (!app || app.dataset.shell === "off") return;
    const nav = app.dataset.nav || app.dataset.page;
    const active = app.dataset.conv || "";
    const u = D.user;
    const pct = Math.min(100, (u.credits.used / u.credits.limit) * 100);
    const level = pct > 90 ? "meter--danger" : pct > 70 ? "meter--warn" : "";

    const aside = document.createElement("aside");
    aside.className = "sidebar";
    aside.id = "sidebar";
    aside.setAttribute("aria-label", "Navegação principal");
    aside.innerHTML = `
      <div class="sidebar__inner">
        <div class="sidebar__head">
          <a class="brand" href="index.html" aria-label="Asimov Prisma, início">
            <img class="brand__logo" src="assets/img/asimov-logo.svg" alt="" width="62" height="19">
            <span class="brand__product">Prisma</span>
            <span class="brand__mark">${P.crystal({ small: true })}</span>
          </a>
          <button type="button" class="icon-btn icon-btn--sm" data-collapse aria-controls="sidebar" aria-expanded="true" aria-label="Recolher barra lateral" data-tip="Recolher barra" data-tip-kbd="mod+\\">${icon("sidebar")}</button>
        </div>
        <ul class="nav" role="list" data-hl>
          <li><a class="nav-item nav-item--primary" href="index.html" ${nav === "chat-home" ? 'aria-current="page"' : ""} data-tip-side="right">${icon("new-chat")}<span class="nav-item__label">Novo chat</span><span class="nav-item__kbd">${keys.kbd("mod+shift+o")}</span></a></li>
          <li><button type="button" class="nav-item" data-cmdk data-tip-side="right">${icon("search")}<span class="nav-item__label">Buscar</span><span class="nav-item__kbd">${keys.kbd("mod+k")}</span></button></li>
        </ul>
        <nav class="sidebar__group" aria-label="Seções">
          <ul class="nav" role="list" data-hl>${NAV.map((n) => `
            <li><a class="nav-item" href="${n.href}" ${n.id === nav ? 'aria-current="page"' : ""} data-tip-side="right">${icon(n.icon)}<span class="nav-item__label">${n.label}</span></a></li>`).join("")}
          </ul>
        </nav>
        <div class="sidebar__group sidebar__label" id="recents-t">Recentes</div>
        <nav class="recents scroll-soft" aria-labelledby="recents-t" data-recents>${recentsHtml(D.conversations, active)}</nav>
        <div class="sidebar__spacer"></div>
        <div class="sidebar__foot">
          <ul class="nav" role="list" data-hl>
            ${u.role === "ADMIN" ? `<li><a class="nav-item" href="admin-modelos.html" ${nav === "admin" ? 'aria-current="page"' : ""} data-tip-side="right">${icon("shield")}<span class="nav-item__label">Administração</span></a></li>` : ""}
            <li><a class="nav-item" href="https://hub.asimov.academy" target="_blank" rel="noopener" data-tip-side="right">${icon("course")}<span class="nav-item__label">Cursos da Asimov</span>${icon("external", "nav-item__ext")}<span class="sr-only">(abre em nova aba)</span></a></li>
          </ul>
          <button type="button" class="credits" data-credits aria-haspopup="dialog" aria-expanded="false" aria-label="Créditos: ${Math.round(pct)}% da semana usados. Ver limites">
            <span class="credits__row"><span class="credits__title">Créditos da semana</span><span class="credits__value">${Math.round(pct)}% usado</span></span>
            <span class="meter meter--thin ${level}" aria-hidden="true"><span class="meter__fill" style="--v:${Math.max(pct, 2)}%"></span></span>
          </button>
          <button type="button" class="account" data-account aria-haspopup="menu" aria-expanded="false" aria-label="Conta de ${esc(u.nickname || u.name)}">
            <span class="avatar avatar--neutral avatar--md">${esc(u.initials)}</span>
            <span class="account__text"><span class="account__name">${esc(u.nickname || u.name)}</span><span class="account__mail">${esc(u.email)}</span></span>
            ${icon("chevron-up-down", "i--sm")}
          </button>
        </div>
      </div>`;
    app.prepend(aside);

    const main = $(".main", app);
    const top = document.createElement("header");
    top.className = "topbar";
    top.innerHTML = `
      <button type="button" class="icon-btn" data-open-nav aria-label="Abrir navegação" aria-controls="sidebar" aria-expanded="false">${icon("menu")}</button>
      <span class="topbar__title">${esc(app.dataset.title || document.title.split(" · ")[0])}</span>
      <a class="icon-btn" href="index.html" aria-label="Novo chat">${icon("new-chat")}</a>`;
    main.prepend(top);
    const skip = document.createElement("a");
    skip.className = "skip-link";
    skip.href = "#conteudo";
    skip.textContent = "Pular para o conteúdo";
    document.body.prepend(skip);
    const scrim = document.createElement("div");
    scrim.className = "scrim";
    app.append(scrim);

    // Rótulos das dicas no trilho recolhido
    $$(".nav-item", aside).forEach((a) => (a.dataset.tipLabel = $(".nav-item__label", a)?.textContent || ""));
    const collapseBtn = $("[data-collapse]", aside);
    const setRail = (on, save = true) => {
      app.classList.toggle("is-rail", on);
      collapseBtn.setAttribute("aria-expanded", String(!on));
      collapseBtn.setAttribute("aria-label", on ? "Abrir barra lateral" : "Recolher barra lateral");
      collapseBtn.dataset.tip = on ? "Abrir barra" : "Recolher barra";
      collapseBtn.dataset.tipSide = on ? "right" : "bottom";
      $$(".nav-item", aside).forEach((a) => { if (on) a.dataset.tip = a.dataset.tipLabel; else delete a.dataset.tip; });
      if (save) store.set("rail", on);
    };
    setRail(store.get("rail", false), false);
    collapseBtn.addEventListener("click", () => setRail(!app.classList.contains("is-rail")));

    // Gaveta no celular: foco vai para dentro e volta ao botão
    const openBtn = $("[data-open-nav]", top);
    const setDrawer = (o) => {
      app.classList.toggle("nav-open", o);
      openBtn.setAttribute("aria-expanded", String(o));
      if (o) $(".nav-item", aside).focus(); else openBtn.focus({ preventScroll: true });
    };
    openBtn.addEventListener("click", () => setDrawer(true));
    scrim.addEventListener("click", () => setDrawer(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && app.classList.contains("nav-open") && !P.layers.length) setDrawer(false); });

    // Destaque que desliza entre os itens ao passar o ponteiro (UI Arc · morph highlight)
    $$("[data-hl]", aside).forEach((list) => {
      const hl = document.createElement("li");
      hl.className = "nav__hl";
      hl.setAttribute("aria-hidden", "true");
      list.prepend(hl);
      list.addEventListener("pointerover", (e) => {
        const it = e.target.closest(".nav-item");
        if (!it || it.getAttribute("aria-current") === "page" || app.classList.contains("is-rail")) { list.classList.remove("is-hovering"); return; }
        const first = !list.classList.contains("is-hovering");
        if (first) hl.style.transition = "opacity var(--d-fast)";
        list.style.setProperty("--hl-y", it.parentElement.offsetTop + "px");
        list.style.setProperty("--hl-h", it.offsetHeight + "px");
        list.classList.add("is-hovering");
        if (first) requestAnimationFrame(() => (hl.style.transition = ""));
      });
      list.addEventListener("pointerleave", () => list.classList.remove("is-hovering"));
    });

    $("[data-cmdk]", aside).addEventListener("click", () => cmdk());

    // Créditos
    $("[data-credits]", aside).addEventListener("click", (e) => {
      P.popover(e.currentTarget, `
        <div class="row row--between"><h2 class="t-h3" style="font-size:var(--text-base)">Seus créditos</h2><span class="badge">Renova ${esc(u.credits.renews)}</span></div>
        <div class="credits-pop__big"><strong data-tick>${Math.round(pct)}%</strong><span>da semana usados</span></div>
        <div class="meter ${level}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}" aria-label="Uso semanal"><span class="meter__fill" style="--v:${Math.max(pct, 2)}%"></span></div>
        <p class="hint mt-2">${fmt(u.credits.used)} de ${fmt(u.credits.limit)} créditos nesta semana.</p>
        <dl><div><dt>Limite diário</dt><dd>${fmt(u.credits.dailyLimit)} créditos</dd></div><div><dt>Limite semanal</dt><dd>${fmt(u.credits.limit)} créditos</dd></div></dl>`,
        { side: "top", className: "credits-pop", label: "Créditos", focus: false });
      const big = $(".credits-pop [data-tick]");
      if (big) P.ticker(big);
    });

    // Conta
    $("[data-account]", aside).addEventListener("click", (e) => P.menu(e.currentTarget, [
      { heading: u.email },
      { label: "Configurações", icon: "settings", onClick: () => (location.href = "perfil.html") },
      { label: "Atalhos de teclado", icon: "keyboard", kbd: "?", onClick: shortcutsHelp },
      { label: "Avaliar a plataforma", icon: "star", onClick: platformReview },
      { label: "Ajuda", icon: "help", onClick: () => window.open("https://link.asimov.academy/transferencia-CS", "_blank", "noopener") },
      { sep: true },
      { label: "Sair", icon: "logout", onClick: () => (location.href = "login.html") },
    ], { side: "top", label: "Conta" }));

    // Ações de cada conversa
    $("[data-recents]", aside).addEventListener("click", (e) => {
      const b = e.target.closest(".conv__more");
      if (!b) return;
      const li = b.closest(".conv");
      const link = $(".conv__link", li);
      P.menu(b, [
        { label: "Renomear", icon: "pencil", onClick: () => renameInline(li, link) },
        { label: "Mover para projeto", icon: "folder", onClick: () => projectPicker((p) => P.toast(`Movida para ${p.name}`, { icon: "folder" }), { title: "Mover para projeto", desc: "A conversa passa a usar o contexto e os arquivos do projeto." }) },
        { label: "Baixar (.md)", icon: "download", onClick: () => P.toast("Download começou", { icon: "download" }) },
        { label: "Copiar link", icon: "link", onClick: () => { navigator.clipboard?.writeText(new URL(link.getAttribute("href"), location.href).href).catch(() => {}); P.toast("Link copiado", { icon: "link" }); } },
        { sep: true },
        { label: "Apagar", icon: "trash", danger: true, onClick: () => P.confirm({
          title: "Apagar esta conversa?",
          desc: `“${esc(link.textContent)}” e todas as mensagens dela somem para sempre.`,
          onConfirm: () => P.api.send("DELETE", `/v1/conversations/${li.dataset.id}`).then(() => {
            li.style.transition = "opacity .2s, transform .2s"; li.style.opacity = "0"; li.style.transform = "translateX(-6px)";
            setTimeout(() => li.remove(), 200);
            P.toast("Conversa apagada", { icon: "trash" });
            if (li.dataset.id === active) setTimeout(() => (location.href = "index.html"), 400);
          }),
        }) },
      ], { label: "Ações da conversa" });
    });
    $(".conv.is-active", aside)?.scrollIntoView({ block: "center" });
  };

  const renameInline = (li, link) => {
    const input = document.createElement("input");
    input.className = "conv__rename";
    input.value = link.textContent;
    input.maxLength = 120;
    input.setAttribute("aria-label", "Novo nome da conversa");
    link.hidden = true;
    $(".conv__more", li).hidden = true;
    li.prepend(input);
    input.focus();
    input.select();
    const done = (save) => {
      if (!input.isConnected) return;
      const v = input.value.trim();
      if (save && v && v !== link.textContent) { link.textContent = v; link.title = v; P.toast("Conversa renomeada", { icon: "pencil" }); }
      input.remove();
      link.hidden = false;
      $(".conv__more", li).hidden = false;
      link.focus({ preventScroll: true });
    };
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") done(true); if (e.key === "Escape") { e.stopPropagation(); done(false); } });
    input.addEventListener("blur", () => done(true));
  };

  /* ───────────────────────── Atalhos globais ───────────────────────── */

  keys.on("mod+k", () => cmdk(), { label: "Buscar", allowInInput: true });
  keys.on("mod+shift+o", () => (location.href = "index.html"), { label: "Novo chat", allowInInput: true });
  keys.on("mod+\\", () => $("[data-collapse]")?.click(), { label: "Barra lateral", allowInInput: true });
  keys.on("?", shortcutsHelp, { label: "Atalhos", when: () => !P.layers.length && !cmdkOpen });
  keys.on("/", () => { const f = $(".composer__input") || $("[data-search]"); f?.focus(); }, { label: "Focar o campo" });

  Object.assign(P, { cmdk, projectPicker, platformReview, shortcutsHelp, NAV });

  shell();

  /** Cada página chama ao terminar de montar o conteúdo. */
  P.ready = (root = document) => {
    P.hydrateIcons(root);
    P.bindFields(root);
    P.reveal(root);
    P.motion?.init?.(root);
  };
})();
