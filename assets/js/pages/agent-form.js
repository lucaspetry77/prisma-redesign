/* Asimov Prisma · Criar e editar agente (agente-novo.html, ?id= edita, #testar abre o teste no celular)
 * Formulário por seções com índice + teste ao vivo fixo à direita (gaveta abaixo de 1180px).
 * Referências: B.4b (ChatGPT GPT builder, Gemini Gems, Langdock).
 * Regras: nome 80 e instruções 20.000 obrigatórios; descrição 200 obrigatória para publicar; imagem até 5 MB;
 * até 5 arquivos (30 MB) e 5 skills; até 4 perguntas (120); primeira mensagem 1.000; "Usar como base" confirma. */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, $$, esc, params } = P;
  const icon = (n, c) => P.icon(n, c);
  const form = $("[data-form]");
  const builder = $(".builder");
  const name = $("#ag-name"), desc = $("#ag-desc"), ins = $("#ag-ins"), first = $("#ag-first");
  const TONES = ["teal", "cyan", "blue", "violet", "rose", "orange", "amber", "green"];
  const MAX_FILES = 5, MAX_SKILLS = 5, MAX_Q = 4;
  const editing = D.myAgents.find((a) => a.id === params.get("id"));
  const st = { tone: editing?.tone || TONES[Math.floor(Math.random() * TONES.length)], model: editing?.model || "asimov", image: null, files: [], skills: [], categories: [], questions: [] };

  // "Automático" ainda não existe: o segmento volta para "Manual"
  $("[data-mode]").addEventListener("tabchange", (e) => { if (e.detail.dataset.soon !== undefined) P.selectTab($("[data-mode]"), $("[data-mode] [role='tab']")); });

  /* ── Avatar e prévia ── */
  const avatar = (size) => st.image
    ? `<span class="avatar avatar--${size} avatar--square"><img src="${esc(st.image)}" alt=""></span>`
    : `<span class="avatar avatar--${size} avatar--square tone-${st.tone}">${name.value.trim() ? esc(P.initials(name.value)) : icon("agent", "i--lg")}</span>`;
  const ready = () => name.value.trim() && ins.value.trim();
  const syncPreview = () => {
    $$("[data-av]").forEach((el) => (el.innerHTML = avatar(el.dataset.av)));
    $("[data-bar-name]").textContent = name.value.trim() || (editing ? "Editar agente" : "Novo agente");
    const intro = $("[data-intro]");
    if (intro) {
      $("[data-intro-name]", intro).textContent = name.value.trim() || "Seu agente";
      $("[data-intro-text]", intro).textContent = ready() ? (first.value.trim() || desc.value.trim() || "Mande uma mensagem para ver como ele responde.") : "Preencha o nome e as instruções para testar aqui.";
      const qs = st.questions.filter(Boolean);
      $("[data-intro-qs]", intro).innerHTML = ready() ? qs.map((q) => `<button type="button" class="test__q" data-ask="${esc(q)}">${esc(q)}</button>`).join("") : "";
    }
    $("#test-input").disabled = !ready();
    $("[data-test-send]").disabled = !ready() || !$("#test-input").value.trim();
    P.hydrateIcons(builder);
  };

  /* ── Estado de salvamento ── */
  const snapshot = () => JSON.stringify([name.value, desc.value, ins.value, first.value, st.model, st.files.length, st.skills, st.categories, st.questions, $("[name=tone]:checked")?.value, $("[data-publish]").checked, st.image]);
  let saved = snapshot();
  const dirty = () => snapshot() !== saved;
  const syncState = () => {
    const d = dirty();
    const s = $("[data-save-state]");
    s.textContent = d ? "Alterações não salvas" : editing ? "Salvo" : "Rascunho";
    s.className = "save-state " + (d ? "is-dirty" : editing ? "is-saved" : "");
    if (editing) $("[data-save]").disabled = !d;
  };
  const changed = () => { syncPreview(); syncState(); };
  form.addEventListener("input", changed);
  form.addEventListener("change", changed);
  addEventListener("beforeunload", (e) => { if (dirty()) { e.preventDefault(); e.returnValue = ""; } });

  /* ── Exemplos oficiais (só ao criar) ── */
  const exBox = $("[data-examples]");
  if (editing) { $("#sec-exemplos").remove(); $('[href="#sec-exemplos"]').remove(); }
  else {
    exBox.innerHTML = D.gallery.agents.map((a) => `<button type="button" class="example" data-ex="${a.id}">${P.agentAvatar(a, "md")}<span class="grow" style="min-width:0"><span class="example__name" style="display:block">${esc(a.name)}</span><span class="example__cat">${esc(a.category)}</span></span>${icon("arrow-right", "i--sm")}</button>`).join("");
    exBox.addEventListener("click", (e) => {
      const b = e.target.closest("[data-ex]");
      if (!b) return;
      const a = D.gallery.agents.find((x) => x.id === b.dataset.ex);
      const fill = () => {
        name.value = a.name;
        desc.value = a.desc;
        ins.value = `Você é o ${a.name}, um agente da Asimov Academy.\n${a.desc}\n\nComo responder:\n- Comece pelo que importa, sem introdução longa.\n- Use listas curtas quando houver mais de duas ideias.\n- Se faltar informação, pergunte antes de supor.\n- Escreva em português do Brasil, com frases curtas.`;
        st.tone = a.tone;
        st.categories = [a.category].filter(Boolean);
        renderCats();
        $$("input, textarea", form).forEach((el) => el.dispatchEvent(new Event("input", { bubbles: true })));
        P.toast(`Formulário preenchido com “${a.name}”. Ajuste antes de salvar.`);
        $("#sec-identidade").scrollIntoView({ behavior: P.reduced ? "auto" : "smooth", block: "start" });
      };
      if (name.value.trim() || ins.value.trim()) P.confirm({ title: "Trocar o que você já escreveu?", desc: `O nome, a descrição e as instruções serão substituídos pelos do exemplo “${esc(a.name)}”.`, confirm: "Usar como base", danger: false, onConfirm: fill });
      else fill();
    });
  }

  /* ── Imagem ── */
  $("[data-pick-image]").addEventListener("click", () => $("[data-image]").click());
  $("[data-image]").addEventListener("change", (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (!/^image\/(png|jpeg|gif|webp)$/.test(f.type)) { P.toast("Use PNG, JPG, GIF ou WebP", { danger: true }); return; }
    if (f.size > 5 * 1048576) { P.toast("A imagem precisa ter até 5 MB", { danger: true }); return; }
    const r = new FileReader();
    r.onload = () => { st.image = r.result; $("[data-rm-image]").hidden = false; changed(); };
    r.readAsDataURL(f);
  });
  $("[data-rm-image]").addEventListener("click", (e) => { st.image = null; e.currentTarget.hidden = true; changed(); });

  /* ── Modelo ── */
  const renderModel = () => {
    const m = P.model(st.model);
    $("[data-model]").innerHTML = `${P.modelIcon(m, "model-icon--lg")}<span class="grow" style="min-width:0;text-align:left"><span class="check__title" style="display:block">${esc(m.name)}</span><span class="check__desc">${esc(m.desc)}</span></span>${icon("chevron-up-down", "i--sm")}`;
    $("[data-model]").setAttribute("aria-label", `Modelo: ${m.name}. Trocar`);
  };
  $("[data-model]").addEventListener("click", (e) => P.modelPicker(e.currentTarget, st.model, (k) => { st.model = k; renderModel(); changed(); }, { align: "start" }));

  /* ── Categorias (cria nova digitando) ── */
  const catOptions = [...new Set(D.gallery.agents.map((a) => a.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  $("#ag-cats-list").innerHTML = catOptions.map((c) => `<option value="${esc(c)}">`).join("");
  const renderCats = () => {
    $("[data-cat-tags]").innerHTML = st.categories.map((c, i) => `<span class="ctx-pill">${esc(c)}<button type="button" class="ctx-pill__x" data-rm-cat="${i}" aria-label="Tirar a categoria ${esc(c)}">${icon("x", "i--xs")}</button></span>`).join("");
    P.hydrateIcons($("[data-cat-tags]"));
  };
  const catInput = $("#ag-cat");
  const addCat = () => {
    const v = catInput.value.trim().slice(0, 40);
    if (v && !st.categories.some((c) => P.norm(c) === P.norm(v))) { st.categories.push(v); renderCats(); changed(); $("[data-cat-status]").textContent = `Categoria ${v} adicionada`; }
    catInput.value = "";
  };
  catInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addCat(); }
    if (e.key === "Backspace" && !catInput.value && st.categories.length) { st.categories.pop(); renderCats(); changed(); }
  });
  catInput.addEventListener("change", () => { if (catOptions.includes(catInput.value)) addCat(); });
  $("[data-cat-tags]").addEventListener("click", (e) => { const b = e.target.closest("[data-rm-cat]"); if (b) { st.categories.splice(+b.dataset.rmCat, 1); renderCats(); changed(); catInput.focus(); } });
  $(".tagbox").addEventListener("click", (e) => { if (e.target === e.currentTarget) catInput.focus(); });

  /* ── Arquivos ── */
  const renderFiles = () => {
    $("[data-fcount]").textContent = `${st.files.length} de ${MAX_FILES}`;
    $("[data-files]").innerHTML = st.files.map((f, i) => `<div class="file-row"><span class="icon-chip icon-chip--sm">${f.state === "uploading" ? `<span class="spinner"></span>` : icon("file")}</span><span class="grow" style="min-width:0"><span class="file-row__name" style="display:block">${esc(f.name)}</span><span class="file-row__meta">${f.state === "uploading" ? "Enviando…" : esc(f.meta)}</span></span><button type="button" class="icon-btn icon-btn--xs" data-rm-file="${i}" aria-label="Remover ${esc(f.name)}">${icon("x")}</button></div>`).join("");
    $("[data-pick-files]").disabled = st.files.length >= MAX_FILES;
    $("[data-pick-files]").title = st.files.length >= MAX_FILES ? `Limite de ${MAX_FILES} arquivos` : "";
    P.hydrateIcons($("[data-files]"));
  };
  const addFiles = (list) => {
    for (const f of list) {
      if (st.files.length >= MAX_FILES) { P.toast(`Até ${MAX_FILES} arquivos por agente`, { icon: "info" }); break; }
      if (f.size > 30 * 1048576) { P.toast(`${f.name} passa de 30 MB`, { danger: true }); continue; }
      const item = { name: f.name, meta: `${(f.name.split(".").pop() || "").toUpperCase()} · ${Math.max(1, Math.round(f.size / 1024))} KB`, state: "uploading" };
      st.files.push(item);
      setTimeout(() => { item.state = "ready"; renderFiles(); }, 650);
    }
    renderFiles();
    changed();
  };
  $("[data-pick-files]").addEventListener("click", () => $("[data-files-input]").click());
  $("[data-files-input]").addEventListener("change", (e) => { addFiles(e.target.files); e.target.value = ""; });
  $("[data-drop]").addEventListener("drop", (e) => { if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files); });
  $("[data-files]").addEventListener("click", (e) => { const b = e.target.closest("[data-rm-file]"); if (b) { st.files.splice(+b.dataset.rmFile, 1); renderFiles(); changed(); } });

  /* ── Skills (até 5, suas e oficiais) ── */
  const skillRow = (s) => `<label class="check"><input type="checkbox" name="skills" value="${esc(s.name)}"><span class="check__text"><span class="check__title">${esc(s.name)}</span><span class="check__desc">${esc(s.desc)}</span></span></label>`;
  $("[data-skills]").innerHTML = `<div class="menu__label">Suas skills</div>${D.mySkills.length ? D.mySkills.map(skillRow).join("") : `<p class="hint" style="padding:4px 10px 8px">Você ainda não tem skills. <a class="link" href="skill-nova.html">Criar skill</a></p>`}<div class="menu__label">Oficiais da Asimov</div>${D.gallery.skills.map(skillRow).join("")}`;
  const syncSkills = () => {
    st.skills = $$("input[name='skills']:checked", form).map((i) => i.value);
    $("[data-scount]").textContent = `${st.skills.length} de ${MAX_SKILLS}`;
    $$("input[name='skills']", form).forEach((cb) => { cb.disabled = !cb.checked && st.skills.length >= MAX_SKILLS; cb.closest(".check").title = cb.disabled ? `Limite de ${MAX_SKILLS} skills por agente` : ""; });
  };
  form.addEventListener("change", (e) => { if (e.target.name === "skills") syncSkills(); });

  /* ── Perguntas sugeridas ── */
  const qBox = $("[data-questions]");
  const renderQs = () => {
    qBox.innerHTML = st.questions.map((q, i) => `<div class="q-row"><label class="sr-only" for="q${i}">Pergunta ${i + 1}</label><input id="q${i}" class="input" maxlength="120" value="${esc(q)}" placeholder="Ex.: Pode revisar esta proposta?" data-q="${i}"><button type="button" class="icon-btn" data-rm-q="${i}" aria-label="Remover pergunta ${i + 1}">${icon("x")}</button></div>`).join("");
    $("[data-qcount]").textContent = `${st.questions.length} de ${MAX_Q}`;
    $("[data-add-q]").hidden = st.questions.length >= MAX_Q;
    P.hydrateIcons(qBox);
  };
  $("[data-add-q]").addEventListener("click", () => { st.questions.push(""); renderQs(); $(`[data-q="${st.questions.length - 1}"]`, qBox).focus(); changed(); });
  qBox.addEventListener("input", (e) => { const i = e.target.dataset.q; if (i !== undefined) st.questions[+i] = e.target.value; });
  qBox.addEventListener("click", (e) => { const b = e.target.closest("[data-rm-q]"); if (b) { st.questions.splice(+b.dataset.rmQ, 1); renderQs(); changed(); } });

  /* ── Publicar ── */
  $("[data-publish]").addEventListener("change", (e) => { $("[data-publish-note]").hidden = !e.target.checked; });

  /* ── Índice que acompanha a rolagem ── */
  const links = $$(".builder__index a");
  links.forEach((l, i) => l.setAttribute("aria-current", String(i === 0)));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) links.forEach((l) => l.setAttribute("aria-current", String(l.getAttribute("href") === "#" + en.target.id))); });
  }, { rootMargin: "-25% 0px -65% 0px" });
  $$(".builder__form > section[id]").forEach((s) => spy.observe(s));
  links.forEach((l) => l.addEventListener("click", (e) => { e.preventDefault(); const t = $(l.getAttribute("href")); t?.scrollIntoView({ behavior: P.reduced ? "auto" : "smooth", block: "start" }); t?.querySelector("input, textarea, button")?.focus({ preventScroll: true }); }));

  /* ── Teste ao vivo ── */
  const body = $("[data-test-body]");
  const introHtml = () => `<div class="test__intro" data-intro><span data-av="xl"></span><strong data-intro-name></strong><p data-intro-text></p><div class="test__questions" data-intro-qs></div></div>`;
  const sendTest = (text) => {
    if (!text || !ready()) return;
    $("[data-intro]")?.remove();
    body.insertAdjacentHTML("beforeend", `<div class="test__msg-user">${esc(text)}</div>`);
    const art = document.createElement("div");
    art.className = "test__msg-ai";
    art.innerHTML = `${avatar("sm")}<div class="grow"><div class="prose"><span class="thinking">Pensando…</span></div></div>`;
    body.append(art);
    body.scrollTop = body.scrollHeight;
    $("#test-input").value = "";
    syncPreview();
    setTimeout(() => {
      const line = ins.value.trim().split("\n").find((l) => l.trim() && !/^[-#]/.test(l.trim())) || "";
      $(".prose", art).innerHTML = `<p>Entendi. Seguindo as minhas instruções (<em>${esc(line.slice(0, 90))}${line.length > 90 ? "…" : ""}</em>), eu começaria assim:</p><ul><li>Confirmo o que você quer no fim desta conversa.</li><li>Peço o material que falta, se faltar.</li><li>Entrego no formato combinado.</li></ul><p class="hint">Resposta simulada neste protótipo.</p>`;
      body.scrollTop = body.scrollHeight;
    }, 900);
  };
  $("[data-test-send]").addEventListener("click", () => sendTest($("#test-input").value.trim()));
  $("#test-input").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); sendTest($("#test-input").value.trim()); } });
  $("#test-input").addEventListener("input", syncPreview);
  body.addEventListener("click", (e) => { const q = e.target.closest("[data-ask]"); if (q) sendTest(q.dataset.ask); });
  $("[data-clear-test]").addEventListener("click", () => { body.innerHTML = introHtml(); syncPreview(); });

  const fab = $("[data-open-test]");
  const setTesting = (on) => {
    builder.classList.toggle("is-testing", on);
    fab.setAttribute("aria-expanded", String(on));
    if (on) setTimeout(() => ($("#test-input").disabled ? $("[data-close-test]") : $("#test-input")).focus({ preventScroll: true }), 250);
    else fab.focus({ preventScroll: true });
  };
  fab.addEventListener("click", () => setTesting(true));
  $$("[data-close-test]").forEach((b) => b.addEventListener("click", () => setTesting(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && builder.classList.contains("is-testing") && !P.layers.length) setTesting(false); });
  if (location.hash === "#testar" && matchMedia("(max-width: 1180px)").matches) setTesting(true);

  /* ── Editar ── */
  if (editing) {
    $("[data-form-title]").textContent = "Editar agente";
    document.title = "Editar agente · Asimov Prisma";
    name.value = editing.name;
    desc.value = editing.desc;
    ins.value = "Você é um revisor de propostas comerciais.\nLeia a proposta e devolva:\n1. O texto revisado, mais claro e direto;\n2. Até 3 riscos que o cliente pode apontar;\n3. Perguntas que o cliente provavelmente fará.";
    st.questions = ["Pode revisar esta proposta?", "Quais riscos você vê aqui?"];
    $("[data-publish]").checked = !!editing.published;
    $("[data-save]").disabled = true;
  }

  /* ── Salvar ── */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const publishing = $("[data-publish]").checked;
    const ok = P.validate(form, {
      "#ag-name": [P.rules.required("O nome"), P.rules.max(80)],
      "#ag-ins": [(v) => (v.trim() ? "" : "Escreva as instruções: quem o agente é e como responde."), P.rules.max(20000)],
      "#ag-desc": [(v) => (publishing && !v.trim() ? "Para publicar na galeria, escreva uma descrição." : ""), P.rules.max(200)],
    });
    if (!ok) { P.toast("Revise os campos marcados", { danger: true, icon: "danger" }); return; }
    P.run($("[data-save]"), () => P.api.send(editing ? "PATCH" : "POST", editing ? `/v1/agents/${editing.id}` : "/v1/agents", { name: name.value }), { success: editing ? "Agente atualizado" : "Agente criado" })
      .then(() => { saved = snapshot(); syncState(); setTimeout(() => (location.href = "agentes.html"), 1100); })
      .catch(() => {});
  });

  body.innerHTML = introHtml();
  renderModel();
  renderCats();
  renderFiles();
  renderQs();
  syncSkills();
  P.ready();
  syncPreview();
  saved = snapshot();
  syncState();
})();
