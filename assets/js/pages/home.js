/* Asimov Prisma · início (index.html)
 * Saudação + composer + atalhos que preenchem (não enviam) + "Continuar de onde parou" e "Seus agentes".
 * Referências: A.1 (Claude, Langdock, Notion AI, Apollo). Enviar abre chat.html com q, model, agent, skills,
 * project e attachments (contrato preservado). */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, esc } = P;
  const icon = (n, c) => P.icon(n, c);

  const name = D.user.nickname || D.user.name;
  const greet = $("[data-greet]");
  greet.innerHTML = `O que vamos criar hoje, <em>${esc(name)}</em>?`;
  $("[data-mark]").innerHTML = P.crystal({ hero: true });

  const comp = P.composer($("[data-composer]"), {
    placeholder: "Pergunte, peça ou cole um texto",
    label: "Mensagem para o Prisma",
    skills: P.params.get("skills") ? P.params.get("skills").split("|") : [],
    phrases: ["Crie um agente para atender clientes…", "Analise minha planilha de vendas…", "Monte um plano de estudos de Python…", "Resuma a reunião de hoje…", "Sugira cores para a minha marca…"],
    onSend: ({ text, files, model, agent, skills, project }) => {
      const q = new URLSearchParams({ q: text, model });
      if (files.length) {
        const key = `prisma:attachments:${crypto.randomUUID?.() || P.uid()}`;
        try { sessionStorage.setItem(key, JSON.stringify(files)); q.set("attachments", key); }
        catch { P.toast("A imagem é grande demais para abrir uma conversa nova. Use uma imagem menor ou anexe na conversa aberta.", { danger: true }); return false; }
      }
      if (agent) q.set("agent", agent.id);
      if (skills.length) q.set("skills", skills.join("|"));
      if (project) q.set("project", project);
      location.href = "chat.html?" + q;
    },
  });

  // Atalhos: as três sugestões do produto + criar imagem + usar um agente. Preenchem, não enviam.
  const ICON = { assistant: "agent", database: "database", workflow: "workflow" };
  const starters = [
    ...D.suggestions.map((s, i) => ({ label: s.title, icon: ICON[s.icon] || s.icon, run: () => comp.setText(s.prompt), key: "s" + i })),
    { label: "Criar imagem", icon: "image", run: () => { comp.setImage(comp.state.mode !== "image"); }, key: "img", toggle: true },
  ];
  const box = $("[data-starters]");
  box.innerHTML = starters.map((s) => `<button type="button" class="starter" data-k="${s.key}" ${s.toggle ? 'aria-pressed="false"' : ""}>${icon(s.icon)}${esc(s.label)}</button>`).join("");
  box.addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]");
    if (!b) return;
    starters.find((s) => s.key === b.dataset.k).run();
    if (b.dataset.k === "img") b.setAttribute("aria-pressed", String(comp.state.mode === "image"));
  });
  comp.onModel = () => $('[data-k="img"]', box)?.setAttribute("aria-pressed", String(comp.state.mode === "image"));

  // Listas leves: retomar e começar com um agente
  const lists = $("[data-lists]");
  P.load(lists, async () => {
    const [convs, mine, gallery] = await Promise.all([P.api.get("/v1/conversations"), P.api.get("/v1/agents"), P.api.get("/v1/gallery")]);
    return { convs, agents: [...mine, ...gallery.agents.filter((a) => a.fav)] };
  }, ({ convs, agents }) => {
    const recent = convs.flatMap((g) => g.items.map((c) => ({ ...c, when: g.group }))).slice(0, 4);
    const agentLink = (a) => "chat.html?" + new URLSearchParams({ q: "Oi! Vamos começar?", agent: a.id });
    lists.innerHTML = `
      <section aria-labelledby="hl-r">
        <div class="home-list__head"><h2 class="home-list__title" id="hl-r">Continuar de onde parou</h2><button type="button" class="home-list__more" data-all>Buscar</button></div>
        ${recent.length ? `<ul role="list">${recent.map((c) => `<li><a class="home-item" href="chat.html?id=${c.id}">${icon("chat")}<span class="home-item__title">${esc(c.title)}</span><span class="home-item__meta">${esc(c.when)}</span></a></li>`).join("")}</ul>`
          : `<p class="hint" style="padding:6px 8px">Nenhuma conversa ainda. A primeira começa no campo acima.</p>`}
      </section>
      <section aria-labelledby="hl-a">
        <div class="home-list__head"><h2 class="home-list__title" id="hl-a">Seus agentes</h2><a class="home-list__more" href="agentes.html">Ver todos</a></div>
        ${agents.length ? `<ul role="list">${agents.slice(0, 4).map((a) => `<li><a class="home-item" href="${agentLink(a)}">${P.agentAvatar(a, "xs")}<span class="home-item__title">${esc(a.name)}</span><span class="home-item__meta">${a.id.startsWith("g-") ? "Favorito" : "Seu"}</span></a></li>`).join("")}</ul>`
          : `<a class="home-item" href="galeria.html">${icon("gallery")}<span class="home-item__title">Explorar agentes prontos na galeria</span></a>`}
      </section>`;
    $("[data-all]", lists)?.addEventListener("click", () => P.cmdk());
  }, { skeleton: `<div>${P.skeleton.rows(3)}</div><div>${P.skeleton.rows(3)}</div>`, label: "Carregando recentes" });

  const pre = P.params.get("texto");
  if (pre) comp.setText(pre);
  P.ready();
  P.motion?.words(greet, 120);
  comp.input.focus({ preventScroll: true });
})();
