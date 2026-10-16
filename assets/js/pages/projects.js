/* Asimov Prisma · Projetos (projetos.html)
 * Busca, ordenação, cartões ou lista (lembrado), criar com o mínimo (nome + contexto), renomear, apagar.
 * Referências: B.1 (Claude, ChatGPT, Hex). ?novo=1 abre "Novo projeto" (contrato preservado). */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, esc, store } = P;
  const icon = (n, c) => P.icon(n, c);
  const TONES = ["teal", "cyan", "blue", "violet", "rose", "orange", "amber", "green"];
  const box = $("[data-projects]");
  const search = $("[data-search]");
  const sortSel = $("[data-sort]");
  const count = $("[data-count]");
  let projects = [];
  let view = store.get("projectsView", "cards");

  const card = (p) => `
    <article class="card card--interactive item-card" style="--card-tone:var(--tone-${p.tone})">
      <div class="item-card__head">
        <span class="icon-chip icon-chip--tone tone-${p.tone}">${icon("folder")}</span>
        <div class="grow"><h2 class="item-card__title"><a class="card__link" href="projeto.html?id=${p.id}">${esc(p.name)}</a></h2></div>
        <button type="button" class="icon-btn icon-btn--sm item-card__corner" data-more="${p.id}" aria-label="Ações de “${esc(p.name)}”">${icon("more")}</button>
      </div>
      <p class="item-card__desc t-clamp-3 ${p.context ? "" : "is-empty"}">${esc(p.context || "Sem contexto ainda. Abra o projeto para dizer o objetivo e o público.")}</p>
      <div class="item-card__foot"><div class="item-card__meta">
        <span>${icon("chat")}${P.plural(p.conversations, "conversa", "conversas")}</span>
        <span>${icon("file")}${p.files ? P.plural(p.files, "arquivo", "arquivos") : "Sem arquivos"}</span>
        <span>${icon("clock")}${esc(p.updated)}</span>
      </div></div>
    </article>`;
  const row = (p) => `
    <div class="list-item" style="position:relative">
      <span class="icon-chip icon-chip--sm icon-chip--tone tone-${p.tone}">${icon("folder")}</span>
      <div class="grow"><a class="list-item__title card__link" href="projeto.html?id=${p.id}" style="display:block">${esc(p.name)}</a><p class="list-item__desc">${esc(p.context || "Sem contexto")}</p></div>
      <span class="list-item__meta">${P.plural(p.conversations, "conversa", "conversas")}</span>
      <span class="list-item__meta" style="width:90px">${p.files ? P.plural(p.files, "arquivo", "arquivos") : "Sem arquivos"}</span>
      <span class="list-item__meta" style="width:80px">${esc(p.updated)}</span>
      <button type="button" class="icon-btn icon-btn--sm" style="position:relative;z-index:1" data-more="${p.id}" aria-label="Ações de “${esc(p.name)}”">${icon("more")}</button>
    </div>`;

  const render = () => {
    const term = search.value.trim();
    const t = P.norm(term);
    let items = projects.filter((p) => !t || P.norm(`${p.name} ${p.context}`).includes(t));
    if (sortSel.value === "nome") items = [...items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (sortSel.value === "conversas") items = [...items].sort((a, b) => b.conversations - a.conversations);
    count.textContent = term ? `${P.plural(items.length, "projeto", "projetos")} para “${term}”` : P.plural(projects.length, "projeto", "projetos");
    if (!projects.length) {
      box.className = "";
      box.innerHTML = P.empty({
        icon: "folder", title: "Organize por assunto com projetos",
        text: "Um projeto guarda um contexto e arquivos que valem para todas as conversas dele. Você explica uma vez e o Prisma lembra.",
        steps: ["Dê um nome, como “Lançamento de março”.", "Escreva o objetivo, o público e o tom.", "Converse: toda conversa nova já começa sabendo disso."],
        actions: [{ label: "Criar projeto", act: "new", variant: "primary", icon: "plus" }],
      });
    } else if (!items.length) {
      box.className = "";
      box.innerHTML = P.empty({ icon: "search", title: `Nada encontrado para “${term}”`, text: "A busca olha o nome e o contexto dos projetos. Tente outra palavra.", actions: [{ label: "Limpar busca", act: "clear" }], center: true });
    } else if (view === "list") {
      box.className = "rows";
      box.innerHTML = items.map(row).join("");
    } else {
      box.className = "grid grid--cards";
      box.setAttribute("data-reveal-group", "");
      box.innerHTML = items.map(card).join("") + (term ? "" : `<button type="button" class="card card--dashed new-card" data-act="new"><span class="icon-chip">${icon("plus")}</span>Novo projeto</button>`);
    }
    P.hydrateIcons(box);
    P.reveal(box);
  };

  const openNew = () => P.modal({
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
      const p = { id: "p" + Date.now(), name, tone: TONES[projects.length % TONES.length], context: $("#np-ctx", m).value.trim(), files: 0, conversations: 0, updated: "agora" };
      return P.api.send("POST", "/v1/projects", p).then(() => {
        projects.unshift(p);
        D.projects.unshift(p);
        search.value = "";
        render();
        P.toast(`Projeto “${name}” criado`, { icon: "folder" });
      });
    } }],
    onOpen: (m) => $("#np-name", m).addEventListener("input", (e) => ($("#np-ok", m).disabled = !e.target.value.trim())),
  });

  const rename = (p) => P.modal({
    title: "Renomear projeto",
    body: `<div class="field"><div class="field__top"><label class="label" for="rn">Nome</label><span class="counter"></span></div><input id="rn" class="input" maxlength="80" value="${esc(p.name)}"></div>`,
    buttons: [{ label: "Cancelar" }, { label: "Salvar", variant: "primary", id: "rn-ok", onClick: (m) => {
      const v = $("#rn", m).value.trim();
      if (!v) return false;
      return P.api.send("PATCH", `/v1/projects/${p.id}`, { name: v }).then(() => { p.name = v; render(); P.toast("Projeto renomeado", { icon: "pencil" }); });
    } }],
    onOpen: (m) => { const i = $("#rn", m); i.select(); i.addEventListener("input", () => ($("#rn-ok", m).disabled = !i.value.trim())); },
  });

  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-act]");
    if (a?.dataset.act === "new") openNew();
    if (a?.dataset.act === "clear") { search.value = ""; render(); search.focus(); }
    const more = e.target.closest("[data-more]");
    if (more) {
      const p = projects.find((x) => x.id === more.dataset.more);
      P.menu(more, [
        { label: "Abrir", icon: "folder-open", onClick: () => (location.href = `projeto.html?id=${p.id}`) },
        { label: "Renomear", icon: "pencil", onClick: () => rename(p) },
        { sep: true },
        { label: "Apagar projeto", icon: "trash", danger: true, onClick: () => P.confirm({
          title: `Apagar “${esc(p.name)}”?`,
          desc: "O contexto e os arquivos do projeto somem. As conversas continuam na sua lista, fora do projeto.",
          onConfirm: () => P.api.send("DELETE", `/v1/projects/${p.id}`).then(() => { projects = projects.filter((x) => x !== p); render(); P.toast("Projeto apagado", { icon: "trash" }); }),
        }) },
      ], { label: "Ações do projeto", align: "end" });
    }
  });
  $("[data-new]").addEventListener("click", openNew);
  search.addEventListener("input", P.debounce(render, 80));
  sortSel.addEventListener("change", render);
  const viewSeg = $("[data-view]");
  viewSeg.querySelectorAll("[data-v]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === view)));
  viewSeg.addEventListener("click", (e) => {
    const b = e.target.closest("[data-v]");
    if (!b) return;
    view = b.dataset.v;
    store.set("projectsView", view);
    viewSeg.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    P.moveInd(viewSeg);
    render();
  });

  P.ready();
  P.load(box, () => P.api.get("/v1/projects"), (list) => { projects = list; render(); }, { skeleton: `<div class="grid grid--cards">${P.skeleton.cards(3)}</div>`, label: "Carregando projetos" });
  if (P.params.has("novo")) openNew();
})();
