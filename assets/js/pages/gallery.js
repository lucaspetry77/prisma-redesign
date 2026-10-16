/* Asimov Prisma · Galeria (galeria.html; ?tipo=skills e ?vista=favoritos)
 * Explorar | Meus favoritos, Agentes | Skills, busca (nova), categorias com contagem, origem e ordem;
 * filtros ativos viram chips removíveis. Referências: B.5a (ChatGPT GPTs, Langdock, Relevance, Claude). */
(() => {
  const P = window.Prisma;
  const { $, $$, esc } = P;
  const icon = (n, c) => P.icon(n, c);
  const grid = $("[data-grid]");
  const st = { view: P.params.get("vista") === "favoritos" ? "favoritos" : "explorar", type: P.params.get("tipo") === "skills" ? "skills" : "agents", q: "", cat: "", origin: "", order: "recentes" };
  let data = { agents: [], skills: [] };
  const LABEL = { agents: ["agente", "agentes"], skills: ["skill", "skills"] };

  const syncUrl = () => {
    const u = new URLSearchParams();
    if (st.type === "skills") u.set("tipo", "skills");
    if (st.view === "favoritos") u.set("vista", "favoritos");
    history.replaceState(null, "", "galeria.html" + (u.toString() ? "?" + u : ""));
  };
  const render = () => {
    const all = data[st.type];
    const base = st.view === "favoritos" ? all.filter((x) => x.fav) : all;
    const cats = [...new Set(base.map((x) => x.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    if (st.cat && !cats.includes(st.cat)) st.cat = "";
    $("[data-cats]").innerHTML = [["", "Todas", base.length], ...cats.map((c) => [c, c, base.filter((x) => x.category === c).length])].map(([v, l, n]) => `<button type="button" class="chip" data-cat="${esc(v)}" aria-pressed="${v === st.cat}">${esc(l)}<span class="count">${n}</span></button>`).join("");
    $("[data-fav-count]").textContent = [...data.agents, ...data.skills].filter((x) => x.fav).length || "";
    const q = P.norm(st.q);
    let items = base.filter((x) => (!st.cat || x.category === st.cat) && (!q || P.norm(`${x.name} ${x.desc} ${x.category}`).includes(q)) && st.origin !== "comunidade");
    if (st.order === "nome") items = [...items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (st.order === "avaliados") items = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    $("[data-count]").textContent = `${P.plural(items.length, ...LABEL[st.type])}`;
    if (!items.length) {
      grid.className = "";
      grid.innerHTML = st.view === "favoritos" && !base.length
        ? P.empty({ icon: "heart", title: `Nenhum ${LABEL[st.type][0]} favorito ainda`, text: `Toque no ${icon("heart", "i--xs")} de um ${LABEL[st.type][0]} em Explorar para guardar aqui. Seus agentes favoritos também aparecem em Agentes.`, actions: [{ label: "Explorar a galeria", act: "explore", variant: "primary" }], center: true })
        : st.origin === "comunidade" && !st.q && !st.cat
          ? P.empty({ icon: "users", title: "Ainda não há itens da comunidade", text: "Quando alunos publicarem agentes e skills, eles aparecem aqui. Por enquanto, a galeria tem os oficiais da Asimov.", actions: [{ label: "Ver oficiais", act: "official" }], center: true })
          : P.empty({ icon: "search", title: "Nada combina com esses filtros", text: "Tente outra palavra ou outra categoria.", actions: [{ label: "Limpar filtros", act: "clear" }], center: true });
    } else {
      grid.className = "grid grid--cards";
      grid.setAttribute("data-reveal-group", "");
      grid.innerHTML = items.map((x) => P.galleryCard(x, st.type)).join("");
    }
    $("[data-featured]").hidden = !items.length || st.view === "favoritos";
    [grid, $("[data-cats]")].forEach((b) => P.hydrateIcons(b));
    P.reveal(grid);
  };

  const viewTabs = $("[data-view]");
  viewTabs.querySelectorAll("[data-v]").forEach((b) => { const on = b.dataset.v === st.view; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
  viewTabs.addEventListener("tabchange", (e) => { st.view = e.detail.dataset.v; syncUrl(); render(); });
  const typeSeg = $("[data-type]");
  typeSeg.querySelectorAll("[data-t]").forEach((b) => { const on = b.dataset.t === st.type; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
  typeSeg.addEventListener("tabchange", (e) => { st.type = e.detail.dataset.t; st.cat = ""; syncUrl(); render(); });
  $("[data-search]").addEventListener("input", P.debounce((e) => { st.q = e.target.value.trim(); render(); }, 100));
  $("#g-origin").addEventListener("change", (e) => { st.origin = e.target.value; render(); });
  $("#g-order").addEventListener("change", (e) => { st.order = e.target.value; render(); });

  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-cat]");
    if (c) { st.cat = c.dataset.cat; render(); return; }
    const a = e.target.closest("[data-act]");
    if (a?.dataset.act === "clear") { st.q = ""; st.cat = ""; st.origin = ""; $("[data-search]").value = ""; $("#g-origin").value = ""; render(); }
    if (a?.dataset.act === "official") { st.origin = "oficial"; $("#g-origin").value = "oficial"; render(); }
    if (a?.dataset.act === "explore") P.selectTab(viewTabs, $('[data-v="explorar"]', viewTabs), true);
    const f = e.target.closest("[data-fav]");
    if (f) { const it = [...data.agents, ...data.skills].find((x) => x.id === f.dataset.fav); P.favToggle(f, it, () => { if (st.view === "favoritos") setTimeout(render, 450); else $("[data-fav-count]").textContent = [...data.agents, ...data.skills].filter((x) => x.fav).length || ""; }); }
    const cp = e.target.closest("[data-copy-skill]");
    if (cp) { const it = data.skills.find((x) => x.id === cp.dataset.copySkill); P.run(cp, () => P.api.send("POST", `/v1/skills/copy`, { id: it.id }), { success: `“${it.name}” copiada para Suas skills` }).catch(() => {}); }
  });

  P.ready();
  P.load(grid, () => P.api.get("/v1/gallery"), (g) => { data = g; render(); }, { skeleton: `<div class="grid grid--cards">${P.skeleton.cards(6)}</div>`, label: "Carregando a galeria" });
})();
