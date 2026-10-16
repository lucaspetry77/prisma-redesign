/* Asimov Prisma · Projeto (projeto.html?id=)
 * Composer no topo (conversa nova já no projeto), conversas do projeto e, ao lado, contexto e arquivos.
 * No celular, abas Conversas | Contexto | Arquivos. Referências: B.2 (Claude Projects, ChatGPT Projects).
 * Regras: contexto até 2.000; até 20 arquivos de texto, 30 MB cada; apagar mantém as conversas. */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, $$, esc, fmt, params } = P;
  const icon = (n, c) => P.icon(n, c);
  const root = $("[data-project]");
  const MAX_FILES = 20, MAX_MB = 30;
  const SAMPLE = [
    { name: "briefing-campanha.pdf", meta: "PDF · 2,1 MB" }, { name: "tom-de-voz.docx", meta: "DOCX · 84 KB" },
    { name: "calendario.xlsx", meta: "XLSX · 36 KB" }, { name: "publico.txt", meta: "TXT · 4 KB" },
    { name: "roteiros.md", meta: "MD · 12 KB" }, { name: "criativos.csv", meta: "CSV · 9 KB" },
  ];

  const notFound = () => {
    root.innerHTML = `<div class="page page--narrow">${P.empty({ icon: "folder", title: "Projeto não encontrado", heading: true, text: "Ele pode ter sido apagado ou o link está incompleto.", actions: [{ label: "Ver projetos", href: "projetos.html", variant: "primary" }], center: true })}</div>`;
    P.hydrateIcons(root);
  };

  const mount = (p) => {
    if (!p) return notFound();
    document.title = `${p.name} · Asimov Prisma`;
    const tb = $(".topbar__title"); if (tb) tb.textContent = p.name;
    const files = SAMPLE.slice(0, Math.min(p.files, SAMPLE.length)).map((f) => ({ ...f, state: "ready" }));
    const convs = D.conversations.flatMap((g) => g.items.map((c) => ({ ...c, when: g.group }))).filter((c) => c.project === p.id);

    root.innerHTML = `
      <div class="page">
        <a class="back page-head__back" href="projetos.html">${icon("chevron-left")}Projetos</a>
        <header class="page-head">
          <div class="page-head__text project__title">
            <span class="icon-chip icon-chip--lg icon-chip--tone tone-${p.tone}">${icon("folder")}</span>
            <div class="grow"><h1 class="page-title" data-name>${esc(p.name)}</h1></div>
          </div>
          <div class="page-head__actions"><button type="button" class="icon-btn icon-btn--outline" data-more aria-label="Ações do projeto" data-tip="Ações do projeto">${icon("more")}</button></div>
        </header>
        <div class="seg mobile-tabs" role="tablist" aria-label="Seções do projeto" data-tabs>
          <button type="button" role="tab" class="seg__btn" aria-selected="true" data-t="conversas">Conversas</button>
          <button type="button" role="tab" class="seg__btn" aria-selected="false" tabindex="-1" data-t="contexto">Contexto</button>
          <button type="button" role="tab" class="seg__btn" aria-selected="false" tabindex="-1" data-t="arquivos">Arquivos</button>
        </div>
        <div class="project" data-tab="conversas">
          <div class="project__main">
            <form class="project__composer" data-composer></form>
            <div class="section-title"><h2>Conversas neste projeto</h2><span class="hint">${P.plural(convs.length, "conversa", "conversas")}</span></div>
            ${convs.length ? `<div class="rows">${convs.map((c) => `<a class="conv-row" href="chat.html?id=${c.id}"><span class="icon-chip icon-chip--sm">${icon("chat")}</span><span class="grow" style="min-width:0"><span class="conv-row__title t-clamp-1">${esc(c.title)}</span><span class="conv-row__meta">${esc(c.when)}</span></span>${icon("chevron-right", "i--sm")}</a>`).join("")}</div>`
              : P.empty({ icon: "chat", title: "Nenhuma conversa ainda", text: "Escreva no campo acima para começar a primeira conversa deste projeto. Ela já sabe o contexto e lê os arquivos." })}
          </div>
          <aside class="project__aside" aria-label="Contexto e arquivos">
            <section class="card side-card side-card--ctx" aria-labelledby="ctx-t">
              <div class="side-card__head">${icon("notebook", "i--sm")}<h2 class="side-card__title" id="ctx-t">Contexto</h2><button type="button" class="btn btn--ghost btn--sm" data-edit-ctx>${icon("pencil")}Editar</button></div>
              <div data-ctx></div>
            </section>
            <section class="card side-card side-card--files" aria-labelledby="files-t">
              <div class="side-card__head">${icon("file", "i--sm")}<h2 class="side-card__title" id="files-t">Arquivos</h2><span class="badge" data-fcount></span></div>
              <div data-files></div>
              <div class="dropzone" data-drop><button type="button" class="btn btn--secondary btn--sm" data-add>${icon("upload")}Adicionar</button><span>ou arraste para cá</span><input type="file" hidden multiple accept=".pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx,.json,.py,.js,.html" data-input></div>
              <p class="hint mt-2">Valem para todas as conversas do projeto. Até ${MAX_FILES} arquivos de texto, ${MAX_MB} MB cada.</p>
            </section>
          </aside>
        </div>
      </div>`;

    const renderCtx = () => {
      $("[data-ctx]", root).innerHTML = p.context
        ? `<p class="side-card__text is-clamped">${esc(p.context)}</p><p class="hint mt-2">${fmt(p.context.length)} / 2.000 caracteres</p>`
        : `<p class="side-card__empty">Diga o objetivo, o público e o tom. Toda conversa do projeto já começa sabendo.</p><button type="button" class="btn btn--secondary btn--sm mt-3" data-edit-ctx>${icon("plus")}Adicionar contexto</button>`;
      P.hydrateIcons($("[data-ctx]", root));
    };
    const renderFiles = () => {
      $("[data-fcount]", root).textContent = `${files.length} de ${MAX_FILES}`;
      $("[data-files]", root).innerHTML = files.length ? files.map((f, i) => `
        <div class="file-row">
          <span class="icon-chip icon-chip--sm">${f.state === "uploading" ? `<span class="spinner"></span>` : f.state === "error" ? icon("danger") : icon("file")}</span>
          <span class="grow" style="min-width:0"><span class="file-row__name" style="display:block">${esc(f.name)}</span><span class="file-row__meta">${f.state === "uploading" ? "Enviando…" : f.state === "error" ? `<span class="t-danger">Falhou ao enviar</span>` : esc(f.meta)}</span></span>
          ${f.state === "error" ? `<button type="button" class="btn btn--ghost btn--sm" data-retry-file="${i}">Tentar de novo</button>` : ""}
          <button type="button" class="icon-btn icon-btn--xs" data-rm="${i}" aria-label="Remover ${esc(f.name)}" ${f.state === "uploading" ? "disabled" : ""}>${icon("x")}</button>
        </div>`).join("")
        : `<p class="side-card__empty">Nenhum arquivo ainda. Briefings, planilhas e textos de apoio entram aqui e valem para todas as conversas.</p>`;
      const full = files.length >= MAX_FILES;
      $("[data-add]", root).disabled = full;
      $("[data-drop] span", root).textContent = full ? `Limite de ${MAX_FILES} arquivos atingido` : "ou arraste para cá";
      P.hydrateIcons($("[data-files]", root));
    };
    const upload = (list) => {
      const room = MAX_FILES - files.length;
      const picked = [...list];
      if (picked.length > room) P.toast(`Só cabem mais ${room} arquivo(s). Os demais ficaram de fora.`, { icon: "info" });
      picked.slice(0, room).forEach((f) => {
        const tooBig = f.size > MAX_MB * 1048576;
        const item = { name: f.name, meta: `${(f.name.split(".").pop() || "").toUpperCase()} · ${Math.max(1, Math.round(f.size / 1024))} KB`, state: "uploading" };
        files.push(item);
        P.api.send("POST", `/v1/projects/${p.id}/files`, { name: f.name }, { delay: 700 })
          .then(() => { if (tooBig) throw new Error(); item.state = "ready"; })
          .catch(() => { item.state = "error"; if (tooBig) P.toast(`${f.name} passa de ${MAX_MB} MB`, { danger: true }); })
          .finally(renderFiles);
      });
      renderFiles();
    };

    const editCtx = () => P.modal({
      title: "Contexto do projeto",
      desc: "Vale para todas as conversas deste projeto, junto com o “Sobre você” do seu perfil.",
      wide: true,
      body: `<div class="field"><div class="field__top"><label class="label" for="ctx-ta">Contexto</label><span class="counter"></span></div>
        <textarea id="ctx-ta" class="textarea" rows="9" maxlength="2000" placeholder="Objetivo: o que este projeto precisa entregar.&#10;Público: para quem é.&#10;Tom: como escrever.&#10;Sempre: regras que valem em toda resposta.">${esc(p.context)}</textarea></div>`,
      buttons: [{ label: "Cancelar" }, { label: "Salvar contexto", variant: "primary", id: "ctx-ok", disabled: true, onClick: (m) => {
        const v = $("#ctx-ta", m).value.trim();
        return P.api.send("PATCH", `/v1/projects/${p.id}`, { context: v }).then(() => { p.context = v; renderCtx(); P.toast("Contexto salvo"); });
      } }],
      onOpen: (m) => { const ta = $("#ctx-ta", m); ta.addEventListener("input", () => ($("#ctx-ok", m).disabled = ta.value.trim() === p.context.trim())); },
    });

    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-edit-ctx]")) editCtx();
      if (e.target.closest("[data-add]")) $("[data-input]", root).click();
      const rm = e.target.closest("[data-rm]");
      if (rm) { const f = files.splice(+rm.dataset.rm, 1)[0]; renderFiles(); P.toast(`${f.name} removido`, { icon: "trash", action: { label: "Desfazer", onClick: () => { files.splice(+rm.dataset.rm, 0, f); renderFiles(); } } }); }
      const rf = e.target.closest("[data-retry-file]");
      if (rf) { const f = files[+rf.dataset.retryFile]; f.state = "uploading"; renderFiles(); P.api.send("POST", "/v1/files", {}, { delay: 700 }).then(() => (f.state = "ready")).catch(() => (f.state = "error")).finally(renderFiles); }
      if (e.target.closest("[data-more]")) P.menu(e.target.closest("[data-more]"), [
        { label: "Renomear", icon: "pencil", onClick: () => P.modal({
          title: "Renomear projeto",
          body: `<div class="field"><div class="field__top"><label class="label" for="rn">Nome</label><span class="counter"></span></div><input id="rn" class="input" maxlength="80" value="${esc(p.name)}"></div>`,
          buttons: [{ label: "Cancelar" }, { label: "Salvar", variant: "primary", onClick: (m) => { const v = $("#rn", m).value.trim(); if (!v) return false; return P.api.send("PATCH", `/v1/projects/${p.id}`, { name: v }).then(() => { p.name = v; $("[data-name]", root).textContent = v; document.title = `${v} · Asimov Prisma`; P.toast("Projeto renomeado", { icon: "pencil" }); }); } }],
        }) },
        { sep: true },
        { label: "Apagar projeto", icon: "trash", danger: true, onClick: () => P.confirm({ title: `Apagar “${esc(p.name)}”?`, desc: "O contexto e os arquivos do projeto somem. As conversas continuam na sua lista, fora do projeto.", onConfirm: () => P.api.send("DELETE", `/v1/projects/${p.id}`).then(() => { location.href = "projetos.html"; }) }) },
      ], { label: "Ações do projeto", align: "end" });
    });
    $("[data-input]", root).addEventListener("change", (e) => { upload(e.target.files); e.target.value = ""; });
    $("[data-drop]", root).addEventListener("drop", (e) => { if (e.dataTransfer?.files?.length) upload(e.dataTransfer.files); });
    root.addEventListener("tabchange", (e) => { $(".project", root).dataset.tab = e.detail.dataset.t; });

    renderCtx();
    renderFiles();
    P.composer($("[data-composer]", root), {
      placeholder: `Nova conversa em ${p.name}`,
      label: `Nova conversa no projeto ${p.name}`,
      project: p.id,
      lockedProject: true,
      onSend: ({ text, model, skills, agent }) => {
        location.href = "chat.html?" + new URLSearchParams({ q: text, model, project: p.id, ...(skills.length ? { skills: skills.join("|") } : {}), ...(agent ? { agent: agent.id } : {}) });
      },
    });
    P.ready(root);
  };

  root.innerHTML = `<div class="page"><div class="skel skel--line" style="width:90px;margin-bottom:18px"></div><div class="row" style="gap:12px;margin-bottom:28px"><div class="skel" style="width:48px;height:48px;border-radius:14px"></div><div class="skel skel--title" style="width:260px;height:28px"></div></div><div class="project"><div><div class="skel" style="height:118px;border-radius:20px"></div><div class="rows mt-8">${P.skeleton.rows(3)}</div></div><div class="stack"><div class="card skel-card">${P.skeleton.lines(4)}</div><div class="card skel-card">${P.skeleton.lines(3)}</div></div></div></div>${P.loading("Carregando projeto")}`;
  P.ready();
  P.api.get(`/v1/projects/${params.get("id") || D.projects[0]?.id}`)
    .then(mount)
    .catch((err) => {
      root.innerHTML = `<div class="page page--narrow">${P.errorState(err?.message)}</div>`;
      P.hydrateIcons(root);
      $("[data-retry]", root).addEventListener("click", () => location.reload());
    });
})();
