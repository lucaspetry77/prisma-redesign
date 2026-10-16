/* Asimov Prisma · Skills (skills.html)
 * Biblioteca das suas skills (sem liga/desliga: a skill é ligada por conversa, no + do composer).
 * Busca, categorias, ações; atalho para as oficiais na galeria. ?vazio=1 mostra o estado vazio (preservado).
 * Referências: B.3a (LangChain, Langdock, Klaviyo). */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, $$, esc } = P;
  const icon = (n, c) => P.icon(n, c);
  const box = $("[data-skills]");
  const search = $("[data-search]");
  const chips = $("[data-cats]");
  let skills = [], cat = "";

  const card = (s) => `
    <article class="card card--interactive item-card">
      <div class="item-card__head">
        <span class="icon-chip">${icon("skill")}</span>
        <div class="grow"><h2 class="item-card__title"><a class="card__link" href="skill-nova.html?id=${s.id}">${esc(s.name)}</a></h2>
          <p class="item-card__by">Atualizada ${esc(s.updated)} · usada em ${P.plural(s.uses, "conversa", "conversas")}</p></div>
        <button type="button" class="icon-btn icon-btn--sm item-card__corner" data-more="${s.id}" aria-label="Ações de “${esc(s.name)}”">${icon("more")}</button>
      </div>
      <p class="item-card__desc t-clamp-2">${esc(s.desc)}</p>
      <div class="item-card__foot"><div class="row" style="gap:6px">${s.category ? `<span class="badge">${esc(s.category)}</span>` : ""}<span class="badge badge--plain">${icon("lock")}Só você</span></div></div>
    </article>`;

  const render = () => {
    const term = search.value.trim();
    const t = P.norm(term);
    const cats = [...new Set(skills.map((s) => s.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    chips.hidden = !skills.length;
    chips.innerHTML = [["", "Todas", skills.length], ...cats.map((c) => [c, c, skills.filter((s) => s.category === c).length])].map(([v, l, n]) => `<button type="button" class="chip" data-cat="${esc(v)}" aria-pressed="${v === cat}">${esc(l)}<span class="count">${n}</span></button>`).join("");
    const items = skills.filter((s) => (!cat || s.category === cat) && (!t || P.norm(`${s.name} ${s.desc} ${s.category}`).includes(t)));
    if (!skills.length) {
      box.className = "";
      box.innerHTML = P.empty({
        icon: "skill", title: "Sua primeira skill",
        text: "Comece por algo que você pede em toda conversa. A IA segue a skill enquanto ela estiver ligada.",
        steps: ["“Responda em até 5 tópicos, uma frase cada.”", "“Use português sem jargão e explique siglas.”", "“Termine sempre com o próximo passo prático.”"],
        actions: [{ label: "Criar skill", href: "skill-nova.html", variant: "primary", icon: "plus" }, { label: "Ver skills oficiais", href: "galeria.html?tipo=skills", icon: "gallery" }],
      });
    } else if (!items.length) {
      box.className = "";
      box.innerHTML = P.empty({ icon: "search", title: term ? `Nada encontrado para “${term}”` : "Nenhuma skill nesta categoria", text: "Tente outra palavra ou outra categoria.", actions: [{ label: "Limpar filtros", act: "clear" }], center: true });
    } else {
      box.className = "grid grid--cards";
      box.setAttribute("data-reveal-group", "");
      box.innerHTML = items.map(card).join("") + (term || cat ? "" : `<a class="card card--dashed new-card" href="skill-nova.html"><span class="icon-chip">${icon("plus")}</span>Criar skill</a>`);
    }
    P.hydrateIcons(box);
    P.hydrateIcons(chips);
    P.reveal(box);
  };

  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-cat]");
    if (c) { cat = c.dataset.cat; render(); return; }
    if (e.target.closest('[data-act="clear"]')) { cat = ""; search.value = ""; render(); search.focus(); return; }
    const b = e.target.closest("[data-more]");
    if (!b) return;
    const s = skills.find((x) => x.id === b.dataset.more);
    P.menu(b, [
      { label: "Editar", icon: "pencil", onClick: () => (location.href = "skill-nova.html?id=" + s.id) },
      { label: "Usar numa conversa", icon: "chat", onClick: () => (location.href = "index.html?" + new URLSearchParams({ skills: s.name })) },
      { label: "Publicar na galeria", icon: "gallery", soon: true, onClick: () => P.toast("Publicar skills chega depois do MVP", { icon: "clock" }) },
      { sep: true },
      { label: "Apagar", icon: "trash", danger: true, onClick: () => P.confirm({
        title: `Apagar “${esc(s.name)}”?`, desc: "Ela sai de todas as conversas e agentes em que estava ligada.",
        onConfirm: () => P.api.send("DELETE", `/v1/skills/${s.id}`).then(() => { skills = skills.filter((x) => x !== s); render(); P.toast("Skill apagada", { icon: "trash" }); }),
      }) },
    ], { label: "Ações da skill", align: "end" });
  });
  search.addEventListener("input", P.debounce(render, 80));
  P.ready();
  P.load(box, () => P.api.get("/v1/skills"), (list) => { skills = list; render(); }, { skeleton: `<div class="grid grid--cards">${P.skeleton.cards(2)}</div>`, label: "Carregando skills" });
  P.api.get("/v1/gallery").then((g) => { const n = g.skills.length; $("[data-official-count]").textContent = n ? P.plural(n, "skill oficial", "skills oficiais") : ""; }).catch(() => {});
})();
