/* Asimov Prisma · Agentes e Skills (agentes.html, skills.html; ?aba=asimov rola até os oficiais)
 * Layout da página de plugins do ChatGPT: busca larga no topo, a seção "Seus" e a seção "Da Asimov", cada uma em
 * linhas de duas colunas (marca · nome · descrição · ação à direita). A busca filtra as duas seções; as categorias
 * (com Favoritos) filtram só a da Asimov. Ação à direita: ⋯ nos seus, ♥ nos oficiais. A Galeria saiu da barra.
 * ?vazio=1 mostra o estado vazio (preservado). Referências: B.3a, B.4a, B.5a, ChatGPT Plugins. */
(() => {
  const P = window.Prisma;
  const { $, esc } = P;
  const icon = (n, c) => P.icon(n, c);
  const isAgents = document.querySelector(".app").dataset.page === "agentes";
  const K = isAgents
    ? { type: "agents", api: "/v1/agents", many: "agentes", newHref: "agente-novo.html", newLabel: "Criar agente", newDesc: "Instruções, modelo, arquivos e skills salvos", editHref: "agente-novo.html?id=" }
    : { type: "skills", api: "/v1/skills", many: "skills", newHref: "skill-nova.html", newLabel: "Criar skill", newDesc: "Algo que você pede em toda conversa", editHref: "skill-nova.html?id=" };
  const FAV = "fav";
  const search = $("[data-search]"), chips = $("[data-cats]"), none = $("[data-none]");
  const box = { seus: $('[data-list="seus"]'), asimov: $('[data-list="asimov"]') };
  const st = { q: "", cat: "" };
  let mine = [], official = [];

  const mark = (it) => isAgents
    ? `<span class="avatar avatar--square tone-${it.tone || "teal"} lib-row__mark" aria-hidden="true">${it.initials ? esc(it.initials) : icon("agent", "i--sm")}</span>`
    : `<span class="icon-chip lib-row__mark" aria-hidden="true">${icon(P.SKILL_ICON[it.category] || "skill")}</span>`;
  const row = (it, own) => {
    const href = own ? K.editHref + it.id : `galeria-item.html?id=${it.id}`;
    const flag = own
      ? (it.published ? `<span role="img" title="Publicado" aria-label="Publicado">${icon("globe")}</span>` : `<span role="img" title="Só você" aria-label="Só você">${icon("lock")}</span>`)
      : P.verified();
    const act = own
      ? `<button type="button" class="icon-btn icon-btn--sm lib-row__act" data-more="${it.id}" aria-label="Ações de “${esc(it.name)}”">${icon("more")}</button>`
      : `<button type="button" class="icon-btn icon-btn--sm fav lib-row__act" data-fav="${it.id}" aria-pressed="${!!it.fav}" aria-label="${it.fav ? "Tirar dos favoritos" : "Favoritar"}: ${esc(it.name)}">${icon("heart")}</button>`;
    return `<div class="lib-row">${mark(it)}
      <div class="lib-row__text"><h3 class="lib-row__name"><a class="card__link" href="${href}">${esc(it.name)}</a>${flag}</h3><p class="lib-row__desc">${esc(it.desc)}</p></div>
      ${act}</div>`;
  };
  const newRow = () => `<div class="lib-row lib-row--new"><span class="icon-chip lib-row__mark" aria-hidden="true">${icon("plus")}</span>
    <div class="lib-row__text"><h3 class="lib-row__name"><a class="card__link" href="${K.newHref}">${K.newLabel}</a></h3><p class="lib-row__desc">${K.newDesc}</p></div></div>`;

  const match = (x) => { const q = P.norm(st.q); return !q || P.norm(`${x.name} ${x.desc} ${x.category || ""}`).includes(q); };
  const render = () => {
    // Categorias da Asimov, com Favoritos logo depois de Todas
    const cats = [...new Set(official.map((x) => x.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const favs = official.filter((x) => x.fav).length;
    if ((st.cat === FAV && !favs) || (st.cat && st.cat !== FAV && !cats.includes(st.cat))) st.cat = "";
    const opts = [["", "Todas", official.length], ...(favs ? [[FAV, "Favoritos", favs]] : []), ...cats.map((c) => [c, c, official.filter((x) => x.category === c).length])];
    chips.hidden = opts.length < 3;
    chips.innerHTML = opts.map(([v, l, n]) => `<button type="button" class="chip" data-cat="${esc(v)}" aria-pressed="${v === st.cat}">${v === FAV ? icon("heart", "i--xs") : ""}${esc(l)}<span class="count">${n}</span></button>`).join("");

    const ours = mine.filter(match);
    const theirs = official.filter((x) => match(x) && (!st.cat || (st.cat === FAV ? x.fav : x.category === st.cat)))
      .sort((a, b) => (b.fav ? 1 : 0) - (a.fav ? 1 : 0)); // favoritos primeiro
    const searching = !!st.q;

    // Seus: a linha "Criar" fecha a lista (e é o estado vazio); com busca, a seção some se não achou nada
    $('[data-sec="seus"]').hidden = searching && !ours.length;
    box.seus.className = "lib-list";
    box.seus.innerHTML = ours.map((x) => row(x, true)).join("") + (searching ? "" : newRow());
    $('[data-count="seus"]').textContent = mine.length ? (searching ? `${ours.length} de ${mine.length}` : mine.length) : "";

    $('[data-sec="asimov"]').hidden = searching && !theirs.length;
    box.asimov.className = theirs.length ? "lib-list" : "";
    box.asimov.innerHTML = theirs.length ? theirs.map((x) => row(x, false)).join("")
      : P.empty({ icon: "search", title: "Nada nesta categoria", actions: [{ label: "Ver todas", act: "clear" }], center: true, plain: true });
    $('[data-count="asimov"]').textContent = official.length ? (searching || st.cat ? `${theirs.length} de ${official.length}` : official.length) : "";

    none.innerHTML = searching && !ours.length && !theirs.length
      ? P.empty({ icon: "search", title: `Nada encontrado para “${st.q}”`, text: `Tente outra palavra, ou crie ${isAgents ? "um agente" : "uma skill"} sobre isso.`, actions: [{ label: "Limpar busca", act: "clear" }, { label: K.newLabel, href: K.newHref, variant: "primary", icon: "plus" }], center: true })
      : "";
    [box.seus, box.asimov, chips, none].forEach((b) => P.hydrateIcons(b));
    P.reveal(box.seus); P.reveal(box.asimov);
  };

  search.addEventListener("input", P.debounce(() => { st.q = search.value.trim(); render(); }, 80));

  const menu = (b) => {
    const it = mine.find((x) => x.id === b.dataset.more);
    const del = () => P.confirm({
      title: `Apagar “${esc(it.name)}”?`,
      desc: isAgents ? "As conversas com ele continuam na sua lista." : "Ela sai de todas as conversas e agentes em que estava ligada.",
      onConfirm: () => P.api.send("DELETE", `${K.api}/${it.id}`).then(() => { mine = mine.filter((x) => x !== it); render(); P.toast(isAgents ? "Agente apagado" : "Skill apagada", { icon: "trash" }); }),
    });
    P.menu(b, [
      isAgents
        ? { label: "Conversar", icon: "chat", onClick: () => (location.href = P.chatWith(it)) }
        : { label: "Usar numa conversa", icon: "chat", onClick: () => (location.href = "index.html?" + new URLSearchParams({ skills: it.name })) },
      { label: "Editar", icon: "pencil", onClick: () => (location.href = K.editHref + it.id) },
      { sep: true },
      { label: "Apagar", icon: "trash", danger: true, onClick: del },
    ], { label: isAgents ? "Ações do agente" : "Ações da skill", align: "end" });
  };

  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-cat]");
    if (c) { st.cat = c.dataset.cat; render(); return; }
    const a = e.target.closest("[data-act]");
    if (a?.dataset.act === "clear") { st.cat = ""; st.q = ""; search.value = ""; render(); search.focus(); return; }
    const f = e.target.closest("[data-fav]");
    if (f) { const it = official.find((x) => x.id === f.dataset.fav); P.favToggle(f, it, () => setTimeout(render, 450)); return; }
    const b = e.target.closest("[data-more]");
    if (b) menu(b);
  });

  P.ready();
  P.load(box.seus, async () => {
    const [m, g] = await Promise.all([P.api.get(K.api), P.api.get("/v1/gallery")]);
    mine = m; official = g[K.type];
    return true;
  }, () => {
    render();
    if (P.params.get("aba") === "asimov") requestAnimationFrame(() => $("#asimov").scrollIntoView({ block: "start" }));
  }, { skeleton: `<div class="stack" style="--gap:var(--s-3)">${P.skeleton.lines(4)}</div>`, label: `Carregando ${K.many}` });
})();
