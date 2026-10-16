/* Asimov Prisma · Agentes (agentes.html)
 * Seus agentes com "Conversar" no cartão, favoritos da galeria e, com poucos agentes, exemplos oficiais.
 * ?vazio=1 mostra o estado vazio (preservado). Referências: B.4a (Langdock, SchoolAI, Mistral). */
(() => {
  const P = window.Prisma;
  const { $, esc } = P;
  const icon = (n, c) => P.icon(n, c);
  const mineBox = $("[data-mine]");
  const favBox = $("[data-favs]");
  const exBox = $("[data-examples]");
  let mine = [], gallery = { agents: [] };

  const renderMine = () => {
    mineBox.className = mine.length ? "grid grid--cards" : "";
    mineBox.setAttribute("data-reveal-group", "");
    mineBox.innerHTML = mine.length
      ? mine.map((a) => P.galleryCard(a, "agents", { mine: true })).join("") + `<a class="card card--dashed new-card" href="agente-novo.html"><span class="icon-chip">${icon("plus")}</span>Criar agente</a>`
      : P.empty({
          icon: "agent", title: "Crie seu primeiro agente",
          text: "Um agente guarda instruções, modelo, arquivos e skills. Você abre uma conversa e ele já sabe o que fazer.",
          steps: ["Comece de um exemplo oficial ou do zero.", "Escreva quem ele é e como deve responder.", "Teste ao lado antes de salvar."],
          actions: [{ label: "Criar agente", href: "agente-novo.html", variant: "primary", icon: "plus" }, { label: "Ver agentes prontos", href: "galeria.html", icon: "gallery" }],
        });
  };
  const renderFavs = () => {
    const favs = gallery.agents.filter((a) => a.fav);
    favBox.className = favs.length ? "grid grid--cards" : "";
    favBox.setAttribute("data-reveal-group", "");
    favBox.innerHTML = favs.length ? favs.map((a) => P.galleryCard(a, "agents")).join("")
      : `<p class="hint">Toque no ${icon("heart", "i--xs")} de um agente na galeria para ele aparecer aqui.</p>`;
    const ex = gallery.agents.filter((a) => !a.fav).slice(0, 3);
    $("[data-examples-section]").hidden = mine.length > 3 || !ex.length;
    exBox.className = "grid grid--cards";
    exBox.setAttribute("data-reveal-group", "");
    exBox.innerHTML = ex.map((a) => P.galleryCard(a, "agents")).join("");
  };
  const renderAll = () => { renderMine(); renderFavs(); [mineBox, favBox, exBox].forEach((b) => { P.hydrateIcons(b); P.reveal(b); }); };

  document.addEventListener("click", (e) => {
    const f = e.target.closest("[data-fav]");
    if (f) { const a = gallery.agents.find((x) => x.id === f.dataset.fav); P.favToggle(f, a, () => setTimeout(() => { renderFavs(); P.hydrateIcons(favBox); P.hydrateIcons(exBox); }, 450)); return; }
    const b = e.target.closest("[data-more]");
    if (!b) return;
    const a = mine.find((x) => x.id === b.dataset.more);
    P.menu(b, [
      { label: "Conversar", icon: "chat", onClick: () => (location.href = P.chatWith(a)) },
      { label: "Editar", icon: "pencil", onClick: () => (location.href = "agente-novo.html?id=" + a.id) },
      { sep: true },
      { label: "Apagar", icon: "trash", danger: true, onClick: () => P.confirm({
        title: `Apagar “${esc(a.name)}”?`, desc: a.published ? "Ele sai da galeria e as conversas com ele continuam na sua lista." : "As conversas com ele continuam na sua lista.",
        onConfirm: () => P.api.send("DELETE", `/v1/agents/${a.id}`).then(() => { mine = mine.filter((x) => x !== a); renderAll(); P.toast("Agente apagado", { icon: "trash" }); }),
      }) },
    ], { label: "Ações do agente", align: "end" });
  });

  P.ready();
  P.load(mineBox, async () => { [mine, gallery] = await Promise.all([P.api.get("/v1/agents"), P.api.get("/v1/gallery")]); return true; }, renderAll,
    { skeleton: `<div class="grid grid--cards">${P.skeleton.cards(2)}</div>`, label: "Carregando agentes" });
})();
