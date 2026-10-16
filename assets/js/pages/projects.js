/* Asimov Prisma · Projetos (projetos.html)
 * Busca, ordenação, cartões ou lista (lembrado), criar com o mínimo (nome + contexto), renomear, apagar.
 * Referências: B.1 (Claude, ChatGPT, Hex). ?novo=1 abre "Novo projeto" (contrato preservado). */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, esc, store } = P;
  const icon = (n, c) => P.icon(n, c);
  const box = $("[data-projects]");
  const search = $("[data-search]");
  const sortSel = $("[data-sort]");
  const count = $("[data-count]");
  let projects = [];
  let view = store.get("projectsView", "cards");

  const card = (p) => `
    <article class="card card--interactive item-card" style="--card-tone:var(--tone-${p.tone})">
      <div class="item-card__head">
        <span class="icon-chip icon-chip--lg icon-chip--tone tone-${p.tone}">${icon("folder")}</span>
        <div class="grow"><h2 class="item-card__title"><a class="card__link" href="projeto.html?id=${p.id}">${esc(p.name)}</a></h2>
          <p class="item-card__by"><span>${P.plural(p.conversations, "conversa", "conversas")}</span><span aria-hidden="true">·</span><span>${p.files ? P.plural(p.files, "arquivo", "arquivos") : "Sem arquivos"}</span></p></div>
      </div>
      <p class="item-card__desc t-clamp-2 ${p.context ? "" : "is-empty"}">${esc(p.context || "Sem contexto ainda. Abra o projeto para dizer o objetivo e o público.")}</p>
      <div class="item-card__foot"><span class="item-card__meta"><span>${icon("clock")}Atualizado ${esc(p.updated)}</span></span>
        <button type="button" class="icon-btn icon-btn--sm item-card__act" data-more="${p.id}" aria-label="Ações de “${esc(p.name)}”">${icon("more")}</button></div>
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

  // O modal de criar é o mesmo da barra lateral (P.createProject); a lista reage ao evento "prisma:project"
  const openNew = () => P.createProject();
  const syncData = (id, patch) => { const d = D.projects.find((x) => x.id === id); if (d) Object.assign(d, patch); return d; };
  document.addEventListener("prisma:project", (e) => {
    const { type, project, source } = e.detail;
    if (source === "projetos") return;
    if (type === "created" && !projects.some((x) => x.id === project.id)) { projects.unshift({ ...project }); search.value = ""; }
    if (type === "renamed") { const x = projects.find((y) => y.id === project.id); if (x) x.name = project.name; }
    if (type === "deleted") projects = projects.filter((x) => x.id !== project.id);
    render();
  });

  const rename = (p) => P.modal({
    title: "Renomear projeto",
    body: `<div class="field"><div class="field__top"><label class="label" for="rn">Nome</label><span class="counter"></span></div><input id="rn" class="input" maxlength="80" value="${esc(p.name)}"></div>`,
    buttons: [{ label: "Cancelar" }, { label: "Salvar", variant: "primary", id: "rn-ok", onClick: (m) => {
      const v = $("#rn", m).value.trim();
      if (!v) return false;
      return P.api.send("PATCH", `/v1/projects/${p.id}`, { name: v }).then(() => { p.name = v; render(); P.toast("Projeto renomeado", { icon: "pencil" }); P.projectEvent("renamed", syncData(p.id, { name: v }) || p, "projetos"); });
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
          onConfirm: () => P.api.send("DELETE", `/v1/projects/${p.id}`).then(() => {
            projects = projects.filter((x) => x !== p);
            const i = D.projects.findIndex((x) => x.id === p.id);
            if (i >= 0) D.projects.splice(i, 1);
            render();
            P.toast("Projeto apagado", { icon: "trash" });
            P.projectEvent("deleted", p, "projetos");
          }),
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
