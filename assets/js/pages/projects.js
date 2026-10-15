/* Asimov Prisma — Projetos (lista) e Projeto (detalhe). */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, esc } = P;
  const params = new URLSearchParams(location.search);
  const toneVars = (t) => `--tone:var(--tone-${t});--tone-dark:var(--tone-${t}-dark)`;
  const TONES = ["teal", "cyan", "blue", "violet", "rose", "orange", "amber", "green"];

  const projectForm = (p = {}) => `
    <div class="field"><div class="field__top"><label class="label" for="pf-name">Nome do projeto <span class="req">*</span></label><span class="counter"></span></div>
      <input id="pf-name" class="input" maxlength="80" value="${esc(p.name || "")}" placeholder="Ex.: Lançamento de março" autofocus></div>
    <div class="field"><div class="field__top"><label class="label" for="pf-ctx">Contexto <small>(opcional)</small></label><span class="counter"></span></div>
      <textarea id="pf-ctx" class="textarea" maxlength="2000" placeholder="Objetivo, público, tom. Ex.: Campanha para alunos que pararam de estudar há mais de 30 dias.">${esc(p.context || "")}</textarea>
      <p class="hint">Vale para todas as conversas deste projeto.</p></div>
    <div class="field"><span class="label">Arquivos de contexto <small>(opcional)</small></span>
      <div class="dropzone"><button type="button" class="btn btn--secondary btn--sm" data-toast="Seletor de arquivos aberto" data-toast-icon="upload"><i class="i" data-icon="upload"></i>Selecionar arquivos</button><span>ou arraste para cá</span></div>
      <p class="hint">PDF, DOCX, TXT, planilha ou código · até 30 MB cada, até 20 arquivos.</p></div>
    <div class="field"><div class="field__top"><span class="label">Cor</span><span class="badge badge--soon">Pós-MVP</span></div>
      <div class="row" aria-hidden="true" style="opacity:.55">${TONES.map((t, i) => `<span class="avatar avatar--sm tone-${t}" style="${toneVars(t)};${i === 0 ? "box-shadow:0 0 0 2px #fff,0 0 0 4px var(--accent)" : ""}"></span>`).join("")}</div></div>`;

  /* ───────────────────────── Lista ───────────────────────── */

  const list = $("[data-projects]");
  if (list) {
    const render = (term = "") => {
      const t = term.trim().toLowerCase();
      const items = D.projects.filter((p) => !t || (p.name + " " + p.context).toLowerCase().includes(t));
      list.innerHTML = items.map((p) => `
        <article class="tone-card project-card" style="${toneVars(p.tone)}">
          <div class="project-card__top">
            <span class="icon-chip"><i class="i" data-icon="folder"></i></span>
            <button type="button" class="icon-btn icon-btn--sm" data-more="${p.id}" aria-haspopup="menu" aria-expanded="false" aria-label="Mais ações para “${esc(p.name)}”"><i class="i" data-icon="more"></i></button>
          </div>
          <div>
            <h2 class="project-card__name"><a href="projeto.html?id=${p.id}">${esc(p.name)}</a></h2>
            <p class="project-card__ctx ${p.context ? "" : "is-empty"}">${esc(p.context || "Sem contexto ainda.")}</p>
          </div>
          <div class="project-card__meta">
            <span><i class="i" data-icon="chat"></i>${p.conversations} ${p.conversations === 1 ? "conversa" : "conversas"}</span>
            <span><i class="i" data-icon="file"></i>${p.files ? `${p.files} arquivos` : "Nenhum arquivo"}</span>
            <span><i class="i" data-icon="clock"></i>Atualizado ${esc(p.updated)}</span>
          </div>
        </article>`).join("")
        + (t ? (items.length ? "" : `<div class="card empty" style="grid-column:1/-1"><p class="empty__title">Nada encontrado para “${esc(term)}”</p><p class="empty__text">Tente outro nome ou uma palavra do contexto.</p></div>`)
             : `<button type="button" class="project-card--new" data-new-project><span class="icon-chip"><i class="i" data-icon="plus"></i></span>Novo projeto</button>`);
      P.hydrateIcons(list);
    };
    render();
    $("#busca").addEventListener("input", (e) => render(e.target.value));

    const openNew = () => P.modal({
      title: "Novo projeto",
      desc: "Dê um nome e, se quiser, o contexto e os arquivos que valem para todas as conversas dele.",
      body: projectForm(),
      buttons: [{ label: "Cancelar" }, { label: "Criar projeto", variant: "primary", id: "pf-ok", disabled: true, onClick: (m) => {
        const name = $("#pf-name", m).value.trim();
        D.projects.unshift({ id: "p" + Date.now(), name, tone: TONES[D.projects.length % TONES.length], context: $("#pf-ctx", m).value.trim(), files: 0, conversations: 0, updated: "agora" });
        render();
        P.toast(`Projeto “${name}” criado`, "folder");
      } }],
      onOpen: (m) => { P.hydrateIcons(m); $("#pf-name", m).addEventListener("input", (e) => ($("#pf-ok", m).disabled = !e.target.value.trim())); },
    });
    document.addEventListener("click", (e) => { if (e.target.closest("[data-new-project]")) openNew(); });
    if (params.has("novo")) openNew();

    list.addEventListener("click", (e) => {
      const b = e.target.closest("[data-more]");
      if (!b) return;
      const p = D.projects.find((x) => x.id === b.dataset.more);
      P.menu(b, [
        { label: "Renomear", icon: "pencil", onClick: () => P.modal({ title: "Renomear projeto", body: `<div class="field"><div class="field__top"><label class="label" for="rn">Nome</label><span class="counter"></span></div><input id="rn" class="input" maxlength="80" value="${esc(p.name)}" autofocus></div>`, buttons: [{ label: "Cancelar" }, { label: "Salvar", variant: "primary", onClick: (m) => { p.name = $("#rn", m).value.trim() || p.name; render(); P.toast("Projeto renomeado", "pencil"); } }] }) },
        { sep: true },
        { label: "Apagar", icon: "trash", danger: true, onClick: () => P.confirm({ title: `Apagar “${esc(p.name)}”?`, desc: "O contexto e os arquivos do projeto somem. As conversas continuam na sua lista, fora do projeto.", onConfirm: () => { D.projects.splice(D.projects.indexOf(p), 1); render(); P.toast("Projeto apagado", "trash"); } }) },
      ], { label: "Ações do projeto", align: "end" });
    });
    P.ready();
    return;
  }

  /* ───────────────────────── Detalhe ───────────────────────── */

  const p = D.projects.find((x) => x.id === params.get("id")) || D.projects[0];
  document.title = `${p.name} · Asimov Prisma`;
  $("[data-project-name]").textContent = p.name;
  $("[data-project-chip]").style.cssText = toneVars(p.tone);

  const ctxBox = $("[data-ctx]");
  const renderCtx = (editing = false) => {
    $("[data-ctx-count]").textContent = p.context ? `${P.fmt(p.context.length)} / 2.000` : "";
    if (editing) {
      ctxBox.innerHTML = `<div class="field"><label class="sr-only" for="ctx-ta">Contexto do projeto</label><textarea id="ctx-ta" class="textarea" maxlength="2000" rows="5" placeholder="Objetivo, público, tom e o que a IA deve sempre lembrar.">${esc(p.context)}</textarea><div class="row row--between"><span class="counter"></span><div class="row"><button type="button" class="btn btn--ghost btn--sm" data-ctx-cancel>Cancelar</button><button type="button" class="btn btn--primary btn--sm" data-ctx-save>Salvar contexto</button></div></div></div>`;
      P.bindFields(ctxBox);
      $("#ctx-ta").focus();
      return;
    }
    ctxBox.innerHTML = p.context
      ? `<p style="white-space:pre-wrap;color:var(--ink)">${esc(p.context)}</p><button type="button" class="btn btn--secondary btn--sm" data-ctx-edit><i class="i" data-icon="pencil"></i>Editar contexto</button>`
      : `<p>Nenhum contexto ainda. Diga o objetivo e o público, e toda conversa aqui já começa sabendo.</p><button type="button" class="btn btn--secondary btn--sm" data-ctx-edit><i class="i" data-icon="plus"></i>Adicionar contexto</button>`;
    P.hydrateIcons(ctxBox);
  };
  ctxBox.addEventListener("click", (e) => {
    if (e.target.closest("[data-ctx-edit]")) renderCtx(true);
    if (e.target.closest("[data-ctx-cancel]")) renderCtx();
    if (e.target.closest("[data-ctx-save]")) { p.context = $("#ctx-ta").value.trim(); renderCtx(); P.toast("Contexto salvo", "check-circle"); }
  });
  renderCtx();

  const files = p.files ? Array.from({ length: Math.min(p.files, 4) }, (_, i) => ({ name: ["briefing-campanha.pdf", "tom-de-voz.docx", "calendario.xlsx", "publico.txt"][i], meta: ["PDF · 2,1 MB", "DOCX · 84 KB", "Planilha · 36 KB", "TXT · 4 KB"][i] })) : [];
  const filesBox = $("[data-files]");
  const renderFiles = () => {
    $("[data-files-count]").textContent = `${files.length} de 20`;
    filesBox.innerHTML = (files.length
      ? `<div class="stack" style="gap:8px">${files.map((f, i) => `<div class="row"><span class="file-chip__icon" style="width:30px;height:30px"><i class="i i--sm" data-icon="file"></i></span><span class="grow"><span class="file-chip__name">${esc(f.name)}</span><span class="file-chip__meta">${esc(f.meta)}</span></span><button type="button" class="icon-btn icon-btn--sm" data-rm-file="${i}" aria-label="Remover ${esc(f.name)}"><i class="i" data-icon="trash"></i></button></div>`).join("")}</div>`
      : `<p>Nenhum arquivo ainda. O que você adicionar aqui vale para todas as conversas do projeto.</p>`)
      + `<input type="file" hidden multiple data-file-input><button type="button" class="btn btn--secondary btn--sm" data-add-file><i class="i" data-icon="plus"></i>Adicionar</button>`;
    P.hydrateIcons(filesBox);
  };
  filesBox.addEventListener("click", (e) => {
    if (e.target.closest("[data-add-file]")) $("[data-file-input]", filesBox).click();
    const rm = e.target.closest("[data-rm-file]");
    if (rm) { files.splice(+rm.dataset.rmFile, 1); renderFiles(); P.toast("Arquivo removido", "trash"); }
  });
  filesBox.addEventListener("change", (e) => {
    [...e.target.files].forEach((f) => files.push({ name: f.name, meta: `${(f.name.split(".").pop() || "").toUpperCase()} · ${Math.max(1, Math.round(f.size / 1024))} KB` }));
    renderFiles();
  });
  renderFiles();

  const convs = D.conversations.flatMap((g) => g.items.map((c) => ({ ...c, group: g.group }))).filter((c) => c.project === p.id);
  $("[data-project-convs]").innerHTML = convs.length
    ? convs.map((c) => `<a class="list-row" href="chat.html?id=${c.id}"><i class="i" data-icon="chat"></i><span class="list-row__title">${esc(c.title)}</span><span class="list-row__meta">${esc(c.group)}</span></a>`).join("")
    : `<div class="empty"><p class="empty__title">Nenhuma conversa ainda</p><p class="empty__text">Escreva abaixo para começar a primeira conversa deste projeto.</p></div>`;

  $("[data-project-more]").addEventListener("click", (e) => P.menu(e.currentTarget, [
    { label: "Renomear", icon: "pencil", onClick: () => P.modal({ title: "Renomear projeto", body: `<div class="field"><div class="field__top"><label class="label" for="rn">Nome</label><span class="counter"></span></div><input id="rn" class="input" maxlength="80" value="${esc(p.name)}" autofocus></div>`, buttons: [{ label: "Cancelar" }, { label: "Salvar", variant: "primary", onClick: (m) => { p.name = $("#rn", m).value.trim() || p.name; $("[data-project-name]").textContent = p.name; P.toast("Projeto renomeado", "pencil"); } }] }) },
    { sep: true },
    { label: "Apagar projeto", icon: "trash", danger: true, onClick: () => P.confirm({ title: `Apagar “${esc(p.name)}”?`, desc: "O contexto e os arquivos do projeto somem. As conversas continuam na sua lista, fora do projeto.", onConfirm: () => (location.href = "projetos.html") }) },
  ], { label: "Ações do projeto", align: "end" }));

  P.composer($(".composer"), {
    placeholder: "Comece uma conversa neste projeto",
    project: p.id,
    lockedProject: true,
    onSend: ({ text, model, skills }) => (location.href = "chat.html?" + new URLSearchParams({ q: text, model, project: p.id, ...(skills.length ? { skills: skills.join("|") } : {}) })),
  });
  P.ready();
})();
