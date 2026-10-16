/* Asimov Prisma · shell
 * Monta a barra lateral e o topo do celular em volta de <div class="app" data-page data-nav> + <main class="main">,
 * e cuida do que é global: busca global, créditos, conta, mover para projeto e NPS.
 */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, $$, esc, fmt, store } = P;
  const icon = (n, c) => P.icon(n, c);

  // Itens fixos da barra (a Galeria saiu: os oficiais da Asimov ficam na aba "Da Asimov" de Agentes e de Skills). Projetos virou seção (com "Ver todos os projetos"); no trilho recolhido volta como ícone.
  const NAV = [
    { id: "agentes", label: "Agentes", icon: "agent", href: "agentes.html" },
    { id: "skills", label: "Skills", icon: "skill", href: "skills.html" },
  ];
  const TONES = ["teal", "cyan", "blue", "violet", "rose", "orange", "amber", "green"];

  /* ───────────────────────── Novo projeto (modal compartilhado) ─────────────────────────
   * Abre no lugar, de onde for chamado (barra lateral, página de projetos, busca). Avisa a página com "prisma:project". */
  const projectEvent = (type, project, source = "") => document.dispatchEvent(new CustomEvent("prisma:project", { detail: { type, project, source } }));
  const createProject = () => P.modal({
    title: "Novo projeto",
    desc: "Comece pelo nome. Arquivos você adiciona dentro do projeto.",
    body: `<div class="field"><div class="field__top"><label class="label" for="np-name">Nome <span class="req" aria-hidden="true">*</span></label><span class="counter"></span></div>
        <input id="np-name" class="input" maxlength="80" placeholder="Ex.: Lançamento de março" autocomplete="off" required></div>
      <div class="field"><div class="field__top"><label class="label" for="np-ctx">Contexto <small>opcional</small></label><span class="counter"></span></div>
        <textarea id="np-ctx" class="textarea" rows="4" maxlength="2000" placeholder="Objetivo, público e tom. Ex.: Campanha para alunos que pararam de estudar há mais de 30 dias. Tom próximo, sem cara de propaganda."></textarea>
        <p class="hint">Vale para todas as conversas do projeto, junto com o “Sobre você” do seu perfil.</p></div>`,
    buttons: [{ label: "Cancelar" }, { label: "Criar projeto", variant: "primary", id: "np-ok", disabled: true, onClick: (m) => {
      const name = $("#np-name", m).value.trim();
      if (!name) return false;
      const p = { id: "p" + Date.now(), name, tone: TONES[D.projects.length % TONES.length], context: $("#np-ctx", m).value.trim(), files: 0, conversations: 0, updated: "agora" };
      return P.api.send("POST", "/v1/projects", p).then(() => {
        D.projects.unshift(p);
        P.toast(`Projeto “${name}” criado`, { icon: "folder" });
        projectEvent("created", p);
      });
    } }],
    onOpen: (m) => $("#np-name", m).addEventListener("input", (e) => ($("#np-ok", m).disabled = !e.target.value.trim())),
  });

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

  /* ───────────────────────── Paleta de comandos ───────────────────────── */

  const PAGES = [
    { title: "Início", href: "index.html", icon: "home" },
    { title: "Projetos", href: "projetos.html", icon: "folder" },
    ...NAV.map((n) => ({ title: n.label, href: n.href, icon: n.icon })),
    { title: "Configurações", href: "perfil.html", icon: "settings" },
  ];
  const ACTIONS = [
    { title: "Novo chat", href: "index.html", icon: "new-chat" },
    { title: "Novo projeto", run: () => createProject(), icon: "folder-plus" },
    { title: "Criar agente", href: "agente-novo.html", icon: "agent" },
    { title: "Criar skill", href: "skill-nova.html", icon: "skill" },
  ];

  let cmdkOpen = null;
  const cmdk = (initial = "", { scope = null } = {}) => {
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
      { label: "Da Asimov", items: [...D.gallery.agents.map((a) => ({ title: a.name, href: `galeria-item.html?id=${a.id}`, icon: "agent", meta: `Agente · ${a.category}` })), ...D.gallery.skills.map((s) => ({ title: s.name, href: `galeria-item.html?id=${s.id}`, icon: "skill", meta: `Skill · ${s.category}` }))], limit: 6 },
      { label: "Páginas", items: pages, always: true },
    ];

    const layer = document.createElement("div");
    layer.className = "cmdk-layer";
    layer.innerHTML = `
      <div class="overlay__scrim" data-close></div>
      <div class="cmdk" role="dialog" aria-modal="true" aria-label="Buscar no Prisma">
        <div class="cmdk__search">${icon("search")}
          <input class="cmdk__input" type="text" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" placeholder="Buscar conversas, projetos, agentes, skills…" autocomplete="off" spellcheck="false">
        </div>
        <div class="cmdk__list scroll-soft" id="cmdk-list" role="listbox" aria-label="Resultados"></div>
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
      const groups = sources.filter((s) => !scope || s.label === scope).map((s) => {
        let items = q ? s.items.filter((it) => P.norm(`${it.title} ${it.meta || ""}`).includes(nq)) : (scope ? s.items : s.always ? s.items : s.label === "Conversas" ? s.items.slice(0, 5) : []);
        if (s.limit && !scope) items = items.slice(0, s.limit);
        if (!items.length) return "";
        return `<div class="cmdk__group" role="group" aria-label="${esc(s.label)}"><div class="cmdk__label" aria-hidden="true">${esc(s.label)}</div>${items.map((it) => {
          const i = flat.push(it) - 1;
          return `<button type="button" class="cmdk__item" role="option" id="cmdk-o${i}" data-i="${i}" aria-selected="false" tabindex="-1">${icon(it.icon)}<span class="cmdk__title">${mark(it.title, q)}</span>${it.meta ? `<span class="cmdk__meta">${esc(it.meta)}</span>` : ""}</button>`;
        }).join("")}</div>`;
      }).join("");
      list.innerHTML = groups || `<div class="cmdk__empty"><strong>Nada encontrado para “${esc(q)}”</strong>Tente outra palavra, ou comece uma conversa com ela.<div class="mt-4"><a class="btn btn--sm" href="index.html?${new URLSearchParams({ texto: q })}">${icon("new-chat")}Novo chat com “${esc(q.slice(0, 30))}”</a></div></div>`;
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
      else if (e.key === "Enter") { e.preventDefault(); if (flat.length) go(flat[sel]); else $(".cmdk__empty a", list)?.click(); }
      else if (e.key === "Escape") { e.preventDefault(); closeCmdk(); }
      else if (e.key === "Tab") e.preventDefault();
    });
    list.addEventListener("pointermove", (e) => { const b = e.target.closest(".cmdk__item"); if (b && +b.dataset.i !== sel) { sel = +b.dataset.i; highlight(); } });
    list.addEventListener("click", (e) => { const b = e.target.closest(".cmdk__item"); if (b) go(flat[+b.dataset.i]); });
    layer.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeCmdk(); });
    input.value = initial;
    if (scope) input.placeholder = `Buscar em ${scope.toLowerCase()}…`;
    render();
    requestAnimationFrame(() => input.focus());
  };

  /* ───────────────────────── Barra lateral ─────────────────────────
   * Referências em 02-referencias.md, Parte E (ChatGPT, Grok e Claude na web): cabeçalho com marca, busca e recolher;
   * itens fixos; duas seções que recolhem (Projetos e Recentes, sem separar por dia); linhas só de texto com "…" no
   * hover; a lista se dissolve num véu com desfoque antes da conta, sem borda. */

  const SB_MAX_PROJECTS = 5;
  const SB_MAX_CONVS = 30;
  const forceEmpty = P.state === "vazio";
  const hiddenProjects = new Set(forceEmpty ? D.projects.map((p) => p.id) : []);
  const hiddenConvs = forceEmpty;
  const sbProjects = () => D.projects.filter((p) => !hiddenProjects.has(p.id));
  // O contrato entrega as conversas em grupos por dia, já em ordem; a barra mostra uma lista só, por recência.
  const allConvs = () => D.conversations.flatMap((g) => g.items);
  const sbConvs = () => (hiddenConvs ? [] : allConvs());
  const secState = () => ({ projetos: true, recentes: true, ...store.get("sidebar:sections", {}) });
  // Projetos abertos na barra (lembrados neste navegador). O projeto aberto na tela e o da conversa atual abrem sozinhos.
  const SB_MAX_SUB = 5;
  const openProjects = () => new Set(store.get("sidebar:projects-open", []));
  const projConvs = (id) => sbConvs().filter((c) => c.project === id);

  const rowActions = (label) => `<span class="sb-item__actions"><button type="button" class="icon-btn icon-btn--xs sb-item__more" aria-label="${label}" aria-haspopup="menu" aria-expanded="false">${icon("more")}</button></span>`;

  /* Projeto: a pasta vira chevron no hover e abre as conversas dele logo abaixo, recuadas sob uma guia fina.
   * O nome continua sendo link para a página do projeto. */
  const projectRow = (p, current, open, activeConv) => {
    const convs = projConvs(p.id);
    const list = convs.slice(0, SB_MAX_SUB);
    const extra = activeConv && !list.some((c) => c.id === activeConv) && convs.find((c) => c.id === activeConv);
    if (extra) list.push(extra); // a conversa aberta sempre aparece, mesmo além do limite
    const subId = `sb-sub-${esc(p.id)}`;
    return `
            <li class="sb-item sb-item--project tone-${esc(p.tone || "teal")}${current ? " is-active" : ""}${open ? " is-open" : ""}" data-sb-project="${esc(p.id)}">
              <button type="button" class="sb-item__toggle" aria-expanded="${open}" aria-controls="${subId}" aria-label="Conversas do projeto “${esc(p.name)}”">${icon("folder", "sb-item__icon sb-item__folder")}${icon("folder-open", "sb-item__icon sb-item__folder-open")}${icon("chevron-right", "sb-item__chev")}</button>
              <a class="sb-item__link" href="projeto.html?id=${esc(p.id)}"${current ? ' aria-current="page"' : ""}><span class="sb-item__title">${esc(p.name)}</span></a>
              ${rowActions(`Mais ações para o projeto “${esc(p.name)}”`)}
            </li>
            <li class="sb-sub${open ? "" : " is-collapsed"}" id="${subId}" data-sb-sub="${esc(p.id)}"${open ? "" : " inert"}><div class="sb-sub__clip">${list.length ? `
              <ul class="sb-list" role="list" aria-label="Conversas de ${esc(p.name)}">${list.map((c) => convRow(c, c.id === activeConv)).join("")}
              </ul>${convs.length > list.length ? `
              <a class="sb-row sb-more" href="projeto.html?id=${esc(p.id)}">Ver todas (${convs.length})</a>` : ""}` : `
              <p class="sb-empty">Nenhuma conversa ainda.</p>`}
            </div></li>`;
  };

  const convRow = (c, current) => {
    const proj = c.project && D.projects.find((p) => p.id === c.project);
    return `
            <li class="sb-item${current ? " is-active" : ""}" data-sb-conv="${esc(c.id)}">
              <a class="sb-item__link" href="chat.html?id=${esc(c.id)}"${current ? ' aria-current="page"' : ""}><span class="sb-item__title">${esc(c.title)}</span>${proj ? `<span class="sr-only">, no projeto ${esc(proj.name)}</span>` : ""}</a>
              ${rowActions(`Mais ações para “${esc(c.title)}”`)}
            </li>`;
  };

  const projectsList = (cur, onIndex, activeConv) => {
    const all = sbProjects();
    const list = all.slice(0, SB_MAX_PROJECTS);
    const convProject = activeConv && allConvs().find((c) => c.id === activeConv)?.project;
    const want = [cur, convProject].filter(Boolean);
    want.forEach((id) => { const p = !list.some((x) => x.id === id) && all.find((x) => x.id === id); if (p) list.push(p); }); // o projeto aberto sempre aparece, mesmo além do limite
    const open = openProjects();
    want.forEach((id) => open.add(id));
    return list.length ? `
          <ul class="sb-list" role="list">${list.map((p) => projectRow(p, p.id === cur, open.has(p.id), activeConv)).join("")}
          </ul>
          <a class="sb-row sb-more" href="projetos.html"${onIndex ? ' aria-current="page"' : ""}>Ver todos os projetos</a>` : "";
  };
  const projectsBody = (cur, onIndex, activeConv) => `
          <div data-sb-projects>${projectsList(cur, onIndex, activeConv)}</div>`;

  // Recentes: só conversas soltas; as de projeto moram dentro do projeto
  const convsBody = (cur) => {
    const all = sbConvs().filter((c) => !c.project);
    const list = all.slice(0, SB_MAX_CONVS);
    const extra = cur && !list.some((c) => c.id === cur) && all.find((c) => c.id === cur);
    if (extra) list.push(extra);
    return list.length ? `
          <ul class="sb-list" role="list">${list.map((c) => convRow(c, c.id === cur)).join("")}
          </ul>
          <button type="button" class="sb-row sb-more" data-all-convs>Ver todas as conversas</button>`
      : `<p class="sb-empty">Suas conversas aparecem aqui.</p>`;
  };

  // O "+" do título cria o item da seção; fica no título (fora da parte que se redesenha) para o foco voltar a ele quando o modal fecha
  const SEC_ADD = {
    projetos: `<button type="button" class="icon-btn icon-btn--xs sec__add" data-new-project aria-label="Novo projeto">${icon("plus")}</button>`,
    recentes: `<a class="icon-btn icon-btn--xs sec__add" href="index.html" aria-label="Novo chat">${icon("plus")}</a>`,
  };
  const section = (key, label, open, body) => `
      <section class="sec${open ? "" : " is-collapsed"}" data-sec="${key}">
        <h2 class="sec__h"><button type="button" class="sec__toggle" id="sec-${key}-t" aria-expanded="${open}" aria-controls="sec-${key}"><span>${label}</span>${icon("chevron-down", "sec__chev")}</button>${SEC_ADD[key] || ""}</h2>
        <div class="sec__body" id="sec-${key}" role="region" aria-labelledby="sec-${key}-t"${open ? "" : " inert"}><div class="sec__clip">${body}
        </div></div>
      </section>`;

  const ADMIN = [
    { group: "Visão geral", items: [{ id: "admin-uso", label: "Uso e custo", icon: "chart", href: "admin-uso.html" }] },
    { group: "Catálogo", items: [{ id: "admin-modelos", label: "Modelos", icon: "cpu", href: "admin-modelos.html" }] },
    { group: "Pessoas", items: [{ id: "admin-usuarios", label: "Usuários e tetos", icon: "users", href: "admin-usuarios.html" }] },
  ];
  const adminLists = (page) => `
      <nav class="sidebar__nav" aria-label="Principal">
        <ul class="nav" role="list">
          <li><a class="nav-item" href="index.html">${icon("arrow-left")}<span class="nav-item__label">Voltar ao Prisma</span></a></li>
        </ul>
      </nav>
      <nav class="sidebar__scroll scroll-soft" aria-label="Administração" data-sb-scroll><div class="sidebar__lists">${ADMIN.map((g, gi) => `
        <div class="sidebar__label" id="adm-g${gi}">${g.group}</div>
        <ul class="nav" role="list" aria-labelledby="adm-g${gi}">${g.items.map((n) => `
          <li><a class="nav-item" href="${n.href}"${n.id === page ? ' aria-current="page"' : ""}>${icon(n.icon)}<span class="nav-item__label">${n.label}</span></a></li>`).join("")}
        </ul>`).join("")}
      </div></nav>`;

  const mainLists = ({ nav, page, active }) => {
    const st = secState();
    const current = (n) => n.id === nav;
    const curProject = page === "projeto" ? P.params.get("id") : null;
    return `
      <nav class="sidebar__nav" aria-label="Principal">
        <ul class="nav" role="list">
          <li><a class="nav-item" href="index.html">${icon("new-chat")}<span class="nav-item__label">Novo chat</span></a></li>${NAV.map((n) => `
          <li><a class="nav-item" href="${n.href}"${current(n) ? ' aria-current="page"' : ""}>${icon(n.icon)}<span class="nav-item__label">${n.label}</span></a></li>`).join("")}
          <li class="nav__rail-only"><a class="nav-item" href="projetos.html"${nav === "projetos" ? ' aria-current="page"' : ""}>${icon("folder")}<span class="nav-item__label">Projetos</span></a></li>
          <li class="nav__rail-only"><button type="button" class="nav-item" data-all-convs>${icon("history")}<span class="nav-item__label">Conversas recentes</span></button></li>
        </ul>
      </nav>
      <nav class="sidebar__scroll scroll-soft" aria-label="Projetos e conversas" data-sb-scroll><div class="sidebar__lists">${section("projetos", "Projetos", st.projetos, projectsBody(curProject, page === "projetos", active))}${section("recentes", "Recentes", st.recentes, convsBody(active))}
      </div></nav>`;
  };

  const creditsInfo = () => {
    const c = D.user.credits;
    const pct = Math.min(100, (c.used / c.limit) * 100);
    return { pct, n: Math.round(pct), level: pct >= 90 ? "danger" : pct > 70 ? "warn" : "" };
  };

  const shell = () => {
    const app = $(".app");
    if (!app || app.dataset.shell === "off") return;
    const nav = app.dataset.nav || app.dataset.page;
    const page = app.dataset.page;
    const active = app.dataset.conv || (page === "chat" ? P.params.get("id") || "" : "");
    const u = D.user;
    const isAdmin = u.role === "ADMIN";
    const cr = creditsInfo();
    const name = () => u.nickname || u.name;

    const aside = document.createElement("aside");
    aside.className = nav === "admin" ? "sidebar sidebar--admin" : "sidebar";
    aside.id = "sidebar";
    aside.setAttribute("aria-label", "Barra lateral");
    aside.innerHTML = `
    <div class="sidebar__inner">
      <div class="sidebar__head">
        <a class="brand" href="index.html" aria-label="${nav === "admin" ? "Asimov Prisma, voltar ao início" : "Asimov Prisma, início"}">
          <img class="brand__logo" src="assets/img/asimov-logo.svg" alt="" width="62" height="19">
          <span class="brand__product">Prisma</span>
          <span class="brand__mark">${P.crystal({ small: true })}</span>
        </a>${nav === "admin" ? `<span class="badge badge--ink sidebar__badge">Admin</span>` : ""}
        <div class="sidebar__tools">
          <button type="button" class="icon-btn icon-btn--sm" data-cmdk aria-label="Buscar" data-tip="Buscar">${icon("search")}</button>
          <button type="button" class="icon-btn icon-btn--sm sidebar__collapse" data-collapse aria-controls="sidebar" aria-expanded="true" aria-label="Recolher barra lateral" data-tip="Recolher barra">${icon("sidebar")}</button>
          <button type="button" class="icon-btn icon-btn--sm sidebar__close" data-close-nav aria-label="Fechar navegação">${icon("x")}</button>
        </div>
      </div>${nav === "admin" ? adminLists(page) : mainLists({ nav, page, active })}
      <div class="sidebar__foot">
        <ul class="nav sidebar__courses"><li><a class="nav-item" href="https://hub.asimov.academy" target="_blank" rel="noopener">${icon("course")}<span class="nav-item__label">Cursos da Asimov</span>${icon("external", "nav-item__ext")}<span class="sr-only"> (abre em nova aba)</span></a></li></ul>
        <button type="button" class="account${nav === "perfil" ? " is-current" : ""}" data-account aria-haspopup="menu" aria-expanded="false">
          <span class="avatar avatar--neutral account__avatar" aria-hidden="true">${esc(u.initials)}</span>
          <span class="account__text"><span class="account__name">${esc(name())}</span><span class="account__sub${cr.level ? ` is-${cr.level}` : ""}"><svg class="account__ring" viewBox="0 0 16 16" aria-hidden="true"><circle class="account__ring-track" cx="8" cy="8" r="6"/><circle class="account__ring-fill" cx="8" cy="8" r="6" pathLength="100" stroke-dasharray="${Math.max(cr.pct, 4).toFixed(1)} 100"/></svg>${cr.n}% dos créditos usados</span></span>
          <span class="sr-only">. Menu da conta</span>
        </button>
      </div>
    </div>`;
    app.prepend(aside);

    const main = $(".main", app);
    const top = document.createElement("header");
    top.className = "topbar";
    top.innerHTML = `
      <button type="button" class="icon-btn" data-open-nav aria-label="Abrir navegação" aria-controls="sidebar" aria-expanded="false">${icon("menu")}</button>
      <span class="topbar__title">${esc(app.dataset.screenTitle || document.title.split(" · ")[0])}</span>
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

    const sc = $("[data-sb-scroll]", aside);
    const account = $("[data-account]", aside);

    /* Véu entre a lista e a conta: aparece só quando há conversa escondida embaixo e some ao chegar no fim */
    const FADE_B = 56, FADE_T = 16;
    const syncFade = () => {
      if (!sc) return;
      const below = sc.scrollHeight - sc.clientHeight - sc.scrollTop;
      aside.style.setProperty("--more-below", Math.max(0, Math.min(1, below / 48)).toFixed(3));
      aside.style.setProperty("--more-above", Math.max(0, Math.min(1, sc.scrollTop / FADE_T)).toFixed(3));
    };
    // Mantém a linha focada ou aberta fora do véu (scroll-padding não vale para foco em todo navegador)
    const keepVisible = (el) => {
      if (!sc || !el || sc.scrollHeight <= sc.clientHeight) return;
      const r = el.getBoundingClientRect(), s = sc.getBoundingClientRect();
      const top = s.top + FADE_T, bottom = s.bottom - FADE_B;
      if (r.top < top) sc.scrollTop -= top - r.top;
      else if (r.bottom > bottom) sc.scrollTop += r.bottom - bottom;
    };
    // Título cortado ganha o title nativo com o nome inteiro (sem dica própria: rolar a lista não dispara cascata)
    const markTruncated = (root = sc) => $$(".sb-item__link", root).forEach((a) => {
      const t = $(".sb-item__title", a);
      if (t && t.scrollWidth > t.clientWidth + 1) a.title = t.textContent; else a.removeAttribute("title");
    });
    if (sc) {
      sc.addEventListener("scroll", syncFade, { passive: true });
      if ("ResizeObserver" in window) { const ro = new ResizeObserver(syncFade); ro.observe(sc); ro.observe($(".sidebar__lists", sc)); }
      sc.addEventListener("focusin", (e) => keepVisible(e.target.closest(".sb-item, .sb-row, .sec__h, .nav-item") || e.target));
      syncFade();
      requestAnimationFrame(() => { markTruncated(); keepVisible($(".sb-item.is-active", sc)); });
    }

    /* Seções que recolhem: independentes, lembradas neste navegador, sem animar ao carregar */
    $$(".sec__toggle", aside).forEach((b) => b.addEventListener("click", () => {
      const sec = b.closest(".sec");
      const open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(open));
      sec.classList.toggle("is-collapsed", !open);
      $(".sec__body", sec).inert = !open;
      store.set("sidebar:sections", { ...secState(), [sec.dataset.sec]: open });
    }));

    /* Trilho recolhido, só no desktop */
    const desktop = matchMedia("(min-width: 900px)");
    const collapseBtn = $("[data-collapse]", aside);
    const searchBtn = $("[data-cmdk]", aside);
    const railTips = () => {
      const on = app.classList.contains("is-rail") && desktop.matches;
      $$(".nav-item", aside).forEach((a) => { if (on) { a.dataset.tip = $(".nav-item__label", a)?.textContent || ""; a.dataset.tipSide = "right"; } else { delete a.dataset.tip; delete a.dataset.tipSide; } });
      [collapseBtn, searchBtn].forEach((b) => (b.dataset.tipSide = on ? "right" : "bottom"));
      if (on) { account.dataset.tip = name(); account.dataset.tipSide = "right"; } else { delete account.dataset.tip; delete account.dataset.tipSide; }
    };
    const setRail = (on, save = true) => {
      // O que some no trilho não pode ficar com o foco: ele vai para o botão que reabre a barra
      if (on && desktop.matches && document.activeElement?.closest?.(".sidebar__scroll")) collapseBtn.focus({ preventScroll: true });
      app.classList.toggle("is-rail", on);
      collapseBtn.setAttribute("aria-expanded", String(!on));
      collapseBtn.setAttribute("aria-label", on ? "Abrir barra lateral" : "Recolher barra lateral");
      collapseBtn.dataset.tip = on ? "Abrir barra" : "Recolher barra";
      railTips();
      if (save) store.set("rail", on);
    };
    setRail(store.get("rail", false), false);
    collapseBtn.addEventListener("click", () => setRail(!app.classList.contains("is-rail")));
    desktop.addEventListener?.("change", railTips);

    /* Gaveta no celular: foco vai para dentro e volta ao botão; o resto da página fica inerte */
    const openBtn = $("[data-open-nav]", top);
    const setDrawer = (o) => {
      app.classList.toggle("nav-open", o);
      openBtn.setAttribute("aria-expanded", String(o));
      main.inert = o;
      if (o) $(".nav-item", aside).focus(); else openBtn.focus({ preventScroll: true });
      if (!o) setTimeout(() => (main.inert = false), 0);
    };
    openBtn.addEventListener("click", () => setDrawer(true));
    $("[data-close-nav]", aside).addEventListener("click", () => setDrawer(false));
    scrim.addEventListener("click", () => setDrawer(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && app.classList.contains("nav-open") && !P.layers.length) setDrawer(false); });

    searchBtn.addEventListener("click", () => cmdk());

    /* Conta: um botão, um menu. Créditos e Administração moram aqui; Cursos fica à vista, logo acima */
    const openCredits = (anchor) => {
      const c = creditsInfo();
      const cls = c.level ? `meter--${c.level === "warn" ? "warn" : "danger"}` : "";
      P.popover(anchor, `
        <div class="row row--between"><h2 class="t-h3 credits-pop__title" id="credits-pop-t" tabindex="-1" style="font-size:var(--text-base)">Seus créditos</h2><span class="badge">Renova ${esc(u.credits.renews)}</span></div>
        <div class="credits-pop__big"><strong data-tick>${c.n}%</strong><span>da semana usados</span></div>
        <div class="meter ${cls}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${c.n}" aria-label="Uso semanal"><span class="meter__fill" style="--v:${Math.max(c.pct, 2)}%"></span></div>
        <p class="hint mt-2">${fmt(u.credits.used)} de ${fmt(u.credits.limit)} créditos nesta semana.</p>
        <dl><div><dt>Limite diário</dt><dd>${fmt(u.credits.dailyLimit)} créditos</dd></div><div><dt>Limite semanal</dt><dd>${fmt(u.credits.limit)} créditos</dd></div></dl>`,
        { side: "top", align: "start", className: "credits-pop", label: "Créditos", initialFocus: ".credits-pop__title" });
      const big = $(".credits-pop [data-tick]");
      if (big) P.ticker(big);
    };
    account.addEventListener("click", () => P.menu(account, [
      { identity: { name: name(), email: u.email } },
      { sep: true },
      { label: "Configurações", icon: "settings", onClick: () => (location.href = "perfil.html") },
      { label: "Créditos e limites", icon: "wallet", meta: `${creditsInfo().n}%`, onClick: () => openCredits(account) },
      ...(isAdmin && nav !== "admin" ? [{ label: "Administração", icon: "shield", onClick: () => (location.href = "admin-modelos.html") }] : []),
      { sep: true },
      { label: "Avaliar a plataforma", icon: "star", onClick: platformReview },
      { label: "Ajuda", icon: "help", ext: true, onClick: () => window.open("https://link.asimov.academy/transferencia-CS", "_blank", "noopener") },
      { sep: true },
      { label: "Sair", icon: "logout", onClick: () => (location.href = "login.html") },
    ], { side: "top", align: "start", width: 244 }));

    if (!sc || nav === "admin") return;

    /* Linhas: menu "…", renomear no lugar, apagar com o foco indo para a vizinha */
    const projSec = $('[data-sec="projetos"]', aside);
    const convSec = $('[data-sec="recentes"]', aside);
    const projBox = $("[data-sb-projects]", projSec);
    const renderProjects = () => {
      projBox.innerHTML = projectsList(page === "projeto" ? P.params.get("id") : null, page === "projetos", active);
      P.hydrateIcons(projBox);
      markTruncated(projBox);
      syncFade();
    };
    const renderConvs = () => {
      const clip = $(".sec__clip", convSec);
      clip.innerHTML = convsBody(active);
      P.hydrateIcons(clip);
      markTruncated(clip);
      syncFade();
    };
    const setProjectOpen = (id, open) => {
      const ids = openProjects();
      open ? ids.add(id) : ids.delete(id);
      store.set("sidebar:projects-open", [...ids]);
    };
    const toggleProject = (btn) => {
      const li = btn.closest(".sb-item");
      const sub = document.getElementById(btn.getAttribute("aria-controls"));
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      li.classList.toggle("is-open", open);
      sub.classList.toggle("is-collapsed", !open);
      sub.inert = !open;
      setProjectOpen(li.dataset.sbProject, open);
      if (open) setTimeout(() => keepVisible(sub), 200);
    };

    const removeRow = (li) => {
      const sec = li.closest(".sec");
      const list = li.parentElement;
      const near = li.nextElementSibling || li.previousElementSibling;
      const nearLink = near && $(".sb-item__link", near);
      // Foco vai para a linha vizinha (ou "Ver todas", o título da seção), nunca para o topo da página.
      // Roda de novo depois que a confirmação fecha: ela devolveria o foco a um "…" que já não existe.
      const refocus = () => {
        const a = document.activeElement;
        if (a && a !== document.body && !li.contains(a) && !a.closest(".overlay.is-leaving")) return;
        [nearLink, $(".sb-more", sec), $(".sec__toggle", sec)].find((x) => x?.isConnected)?.focus({ preventScroll: true });
      };
      const done = () => {
        if (li.contains(document.activeElement)) refocus();
        li.remove();
        if (!list.children.length) { if (sec === convSec) renderConvs(); else renderProjects(); }
        refocus();
        setTimeout(refocus, 420);
      };
      if (P.reduced) return done();
      li.style.height = li.offsetHeight + "px";
      void li.offsetHeight;
      li.classList.add("is-leaving");
      setTimeout(done, 200);
    };

    const renameInline = (li) => {
      const link = $(".sb-item__link", li);
      const title = $(".sb-item__title", link);
      const old = title.textContent;
      const isProject = !!li.dataset.sbProject;
      const input = document.createElement("input");
      input.className = "sb-rename";
      input.value = old;
      input.maxLength = isProject ? 80 : 120;
      input.setAttribute("aria-label", isProject ? "Novo nome do projeto" : "Novo nome da conversa");
      li.classList.add("is-renaming");
      li.prepend(input);
      input.focus();
      input.select();
      const done = (save) => {
        if (!input.isConnected) return;
        const v = input.value.trim();
        input.remove();
        li.classList.remove("is-renaming");
        link.focus({ preventScroll: true });
        if (!save || !v || v === old) return;
        title.textContent = v;
        markTruncated(li);
        const id = isProject ? li.dataset.sbProject : li.dataset.sbConv;
        const item = isProject ? D.projects.find((p) => p.id === id) : allConvs().find((c) => c.id === id);
        if (item) item[isProject ? "name" : "title"] = v;
        P.api.send("PATCH", isProject ? `/v1/projects/${id}` : `/v1/conversations/${id}`, isProject ? { name: v } : { title: v })
          .then(() => { P.toast(isProject ? "Projeto renomeado" : "Conversa renomeada", { icon: "pencil" }); if (isProject) projectEvent("renamed", item, "sidebar"); })
          .catch((err) => { title.textContent = old; if (item) item[isProject ? "name" : "title"] = old; markTruncated(li); P.toast(err?.message || "Não foi possível renomear.", { danger: true }); });
      };
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") done(true); if (e.key === "Escape") { e.stopPropagation(); done(false); } });
      input.addEventListener("blur", () => done(true));
    };

    const convMenu = (li) => {
      const id = li.dataset.sbConv;
      const c = allConvs().find((x) => x.id === id);
      const link = $(".sb-item__link", li);
      const titleNow = () => $(".sb-item__title", li).textContent;
      return [
        { label: "Renomear", icon: "pencil", onClick: () => renameInline(li) },
        { label: c?.project ? "Trocar de projeto" : "Mover para projeto", icon: "folder", onClick: () => projectPicker((p) => {
          if (c) c.project = p.id;
          setProjectOpen(p.id, true); // a conversa reaparece dentro do projeto, já aberto
          renderProjects();
          renderConvs();
          $(`.sb-item[data-sb-conv="${CSS.escape(id)}"]`, projBox)?.classList.add("is-new");
          P.toast(`Movida para ${p.name}`, { icon: "folder" });
        }, { title: "Mover para projeto", desc: "A conversa passa a usar o contexto e os arquivos do projeto.", current: c?.project || null }) },
        { label: "Copiar link", icon: "link", onClick: () => { navigator.clipboard?.writeText(new URL(link.getAttribute("href"), location.href).href).catch(() => {}); P.toast("Link copiado", { icon: "link" }); } },
        { label: "Baixar (.md)", icon: "download", onClick: () => P.toast("Download começou", { icon: "download" }) },
        { sep: true },
        { label: "Apagar", icon: "trash", danger: true, onClick: () => P.confirm({
          title: "Apagar esta conversa?",
          desc: `“${esc(titleNow())}” e todas as mensagens dela somem para sempre.`,
          onConfirm: () => P.api.send("DELETE", `/v1/conversations/${id}`).then(() => {
            D.conversations.forEach((g) => { g.items = g.items.filter((x) => x.id !== id); });
            removeRow(li);
            P.toast("Conversa apagada", { icon: "trash" });
            if (id === active) setTimeout(() => (location.href = "index.html"), 400);
          }),
        }) },
      ];
    };

    const projectMenu = (li) => {
      const id = li.dataset.sbProject;
      const nameNow = () => $(".sb-item__title", li).textContent;
      return [
        { label: "Renomear", icon: "pencil", onClick: () => renameInline(li) },
        { sep: true },
        { label: "Apagar projeto", icon: "trash", danger: true, onClick: () => P.confirm({
          title: `Apagar “${nameNow()}”?`,
          desc: "O contexto e os arquivos do projeto somem. As conversas continuam na sua lista, fora do projeto.",
          onConfirm: () => P.api.send("DELETE", `/v1/projects/${id}`).then(() => {
            const i = D.projects.findIndex((p) => p.id === id);
            const [gone] = i >= 0 ? D.projects.splice(i, 1) : [];
            allConvs().forEach((c) => { if (c.project === id) delete c.project; });
            setProjectOpen(id, false);
            li.nextElementSibling?.matches(".sb-sub") && li.nextElementSibling.remove();
            removeRow(li);
            renderConvs(); // as conversas do projeto voltam para Recentes
            P.toast("Projeto apagado", { icon: "trash" });
            projectEvent("deleted", gone || { id }, "sidebar");
            if (page === "projeto" && P.params.get("id") === id) setTimeout(() => (location.href = "projetos.html"), 400);
          }),
        }) },
      ];
    };

    // No trilho, o relógio abre a busca já filtrada em conversas (o mesmo de "Ver todas as conversas")
    $(".sidebar__nav [data-all-convs]", aside)?.addEventListener("click", () => cmdk("", { scope: "Conversas" }));
    sc.addEventListener("click", (e) => {
      if (e.target.closest("[data-all-convs]")) { cmdk("", { scope: "Conversas" }); return; }
      if (e.target.closest("[data-new-project]")) { createProject(); return; }
      const tg = e.target.closest(".sb-item__toggle");
      if (tg) { toggleProject(tg); return; }
      const b = e.target.closest(".sb-item__more");
      if (!b) return;
      const li = b.closest(".sb-item");
      li.classList.add("has-menu");
      const m = P.menu(b, li.dataset.sbProject ? projectMenu(li) : convMenu(li), {
        label: li.dataset.sbProject ? "Ações do projeto" : "Ações da conversa",
        align: "start",
        onClose: () => li.classList.remove("has-menu"),
      });
      if (!m) li.classList.remove("has-menu");
    });

    // Projeto criado, renomeado ou apagado em qualquer lugar (página de projetos, busca) aparece aqui
    document.addEventListener("prisma:project", (e) => {
      if (e.detail.source === "sidebar") return;
      renderProjects();
      if (e.detail.type === "created") $(`[data-sb-project="${CSS.escape(e.detail.project.id)}"]`, projBox)?.classList.add("is-new");
    });
  };

  Object.assign(P, { cmdk, projectPicker, createProject, projectEvent, platformReview, NAV, TONES });

  shell();

  /** Cada página chama ao terminar de montar o conteúdo. */
  P.ready = (root = document) => {
    P.hydrateIcons(root);
    P.bindFields(root);
    P.reveal(root);
    P.motion?.init?.(root);
  };
})();
