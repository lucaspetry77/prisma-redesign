/* Asimov Prisma · Projetos (projetos.html)
 * Mesmo layout de Agentes e Skills (library.js): busca larga, seção "Seus projetos" em linhas de duas colunas
 * (pasta na cor do projeto · nome · conversas e contexto · ⋯), com "Criar projeto" fechando a lista. Ordem: atividade
 * recente. Criar com o mínimo (nome + contexto), renomear, apagar. ?novo=1 abre "Novo projeto" (contrato preservado). */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, esc } = P;
  const icon = (n, c) => P.icon(n, c);
  const box = $("[data-projects]");
  const search = $("[data-search]");
  const count = $("[data-count]");
  let projects = [];

  const row = (p) => `<div class="lib-row">
      <span class="icon-chip icon-chip--tone tone-${p.tone} lib-row__mark" aria-hidden="true">${icon("folder")}</span>
      <div class="lib-row__text"><h3 class="lib-row__name"><a class="card__link" href="projeto.html?id=${p.id}">${esc(p.name)}</a></h3>
        <p class="lib-row__desc">${P.plural(p.conversations, "conversa", "conversas")}<span aria-hidden="true"> · </span>${esc(p.context || "Sem contexto ainda")}</p></div>
      <button type="button" class="icon-btn icon-btn--sm lib-row__act" data-more="${p.id}" aria-label="Ações de “${esc(p.name)}”">${icon("more")}</button></div>`;
  const newRow = () => `<div class="lib-row lib-row--new"><span class="icon-chip lib-row__mark" aria-hidden="true">${icon("plus")}</span>
    <div class="lib-row__text"><h3 class="lib-row__name"><button type="button" class="card__link lib-row__btn" data-new>Criar projeto</button></h3><p class="lib-row__desc">Um contexto e arquivos para várias conversas</p></div></div>`;

  const render = () => {
    const term = search.value.trim();
    const t = P.norm(term);
    const items = projects.filter((p) => !t || P.norm(`${p.name} ${p.context}`).includes(t));
    count.textContent = projects.length ? (term ? `${items.length} de ${projects.length}` : projects.length) : "";
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
      box.innerHTML = P.empty({ icon: "search", title: `Nada encontrado para “${term}”`, text: "A busca olha o nome e o contexto dos projetos. Tente outra palavra.", actions: [{ label: "Limpar busca", act: "clear" }, { label: "Criar projeto", act: "new", variant: "primary", icon: "plus" }], center: true });
    } else {
      box.className = "lib-list";
      box.innerHTML = items.map(row).join("") + (term ? "" : newRow());
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
    if (a?.dataset.act === "new" || e.target.closest("[data-new]")) openNew();
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
  search.addEventListener("input", P.debounce(render, 80));
  P.ready();
  P.load(box, () => P.api.get("/v1/projects"), (list) => { projects = list; render(); }, { skeleton: `<div class="stack" style="--gap:var(--s-3)">${P.skeleton.lines(4)}</div>`, label: "Carregando projetos" });
  if (P.params.has("novo")) openNew();
})();
