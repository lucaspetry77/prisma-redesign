/* Asimov Prisma · início (index.html)
 * Saudação + composer + atalhos que preenchem (não enviam), centralizados na vertical.
 * Referências: A.1 (Claude, Langdock, Notion AI, Apollo). Enviar abre chat.html com q, model, agent, skills,
 * project e attachments (contrato preservado). */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, esc } = P;
  const icon = (n, c) => P.icon(n, c);

  const name = D.user.nickname || D.user.name;
  const greet = $("[data-greet]");
  greet.textContent = `O que vamos criar hoje, ${name}?`;
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

  // Atalhos: as três sugestões do produto, uma por linha. Preenchem, não enviam; o X dispensa e fica lembrado neste navegador.
  const ICON = { assistant: "agent", database: "database", workflow: "workflow" };
  const hidden = new Set(P.store.get("home:starters-hidden", []));
  const starters = D.suggestions.map((s, i) => ({ label: s.title, icon: ICON[s.icon] || s.icon, run: () => comp.setText(s.prompt), key: "s" + i }));
  const box = $("[data-starters]");
  box.innerHTML = starters.filter((s) => !hidden.has(s.key)).map((s) => `<div class="starter" data-k="${s.key}"><button type="button" class="starter__go">${icon(s.icon)}<span class="t-clamp-1">${esc(s.label)}</span></button><button type="button" class="icon-btn icon-btn--xs starter__x" aria-label="Dispensar sugestão: ${esc(s.label)}">${icon("x")}</button></div>`).join("");
  box.addEventListener("click", (e) => {
    const row = e.target.closest("[data-k]");
    if (!row) return;
    if (e.target.closest(".starter__x")) {
      hidden.add(row.dataset.k);
      P.store.set("home:starters-hidden", [...hidden]);
      const next = row.nextElementSibling || row.previousElementSibling;
      row.classList.add("is-leaving");
      setTimeout(() => { row.remove(); (next?.querySelector(".starter__go") || comp.input).focus({ preventScroll: true }); }, P.reduced ? 0 : 140);
      return;
    }
    starters.find((s) => s.key === row.dataset.k).run();
  });

  const pre = P.params.get("texto");
  if (pre) comp.setText(pre);
  if (P.params.get("modo") === "imagem") comp.setImage(true);
  P.ready();
  P.motion?.words(greet, 120);
  comp.input.focus({ preventScroll: true });
})();
