/* Asimov Prisma — Criar/editar agente, com teste ao vivo do formulário. */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, $$, esc } = P;
  const form = $("[data-agent-form]");
  const name = $("#ag-name");
  const desc = $("#ag-desc");
  const ins = $("#ag-ins");
  const TONES = ["teal", "cyan", "blue", "violet", "rose", "orange", "amber", "green"];
  const toneVars = (t) => `--tone:var(--tone-${t});--tone-dark:var(--tone-${t}-dark)`;
  const initials = (s) => s.trim().split(/\s+/).filter((w) => w.length > 2 || /^[A-ZÀ-Ú]/.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || s.trim().slice(0, 2).toUpperCase();
  let tone = "teal";

  // “Automático” ainda não existe: o segmento volta para “Manual”
  $(".segmented").addEventListener("tabchange", (e) => {
    if (e.detail.textContent.includes("Automático")) $(".segmented [role='tab']").click();
  });

  /* Categorias: seleção múltipla com criação de novas opções. */
  const categorySelect = $("[data-category-select]");
  const categoryInput = $("#ag-cat");
  const categoryDropdown = $(".category-select__dropdown", categorySelect);
  const categoryList = $("#ag-category-options");
  const categoryTags = $("[data-category-tags]");
  const categoryValues = $("[data-category-values]");
  const categoryStatus = $("[data-category-status]");
  const categoryKey = (value) => value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const categoryOptions = [...new Set(D.gallery.agents.flatMap((a) => a.categories || [a.category]).filter(Boolean))];
  let selectedCategories = [];
  let activeCategory = -1;
  let filteredCategories = [];
  const categoryBadge = (value) => `<span class="category-select__name">${esc(value)}</span>`;
  const setCategoryActive = (index) => {
    const options = $$("[role='option']", categoryList);
    activeCategory = index;
    options.forEach((option, i) => option.classList.toggle("is-active", i === index));
    if (options[index]) {
      categoryInput.setAttribute("aria-activedescendant", options[index].id);
      options[index].scrollIntoView({ block: "nearest" });
    } else categoryInput.removeAttribute("aria-activedescendant");
  };
  const renderCategoryOptions = () => {
    const query = categoryInput.value.trim();
    filteredCategories = categoryOptions.filter((value) => categoryKey(value).includes(categoryKey(query)));
    const canCreate = query && !categoryOptions.some((value) => categoryKey(value) === categoryKey(query));
    categoryList.innerHTML = filteredCategories.map((value, i) => `<button type="button" class="menu__item category-select__option" role="option" id="ag-category-${i}" data-category="${esc(value)}" aria-selected="${selectedCategories.includes(value)}" tabindex="-1">${categoryBadge(value)}${selectedCategories.includes(value) ? P.icon("check", "i--sm") : ""}</button>`).join("")
      + (canCreate ? `<button type="button" class="menu__item category-select__option category-select__create" role="option" aria-selected="false" id="ag-category-create" data-category="${esc(query)}" tabindex="-1">${P.icon("plus", "i--sm")}Criar ${categoryBadge(query)}</button>` : "");
    setCategoryActive(-1);
  };
  const openCategories = () => {
    categoryDropdown.hidden = false;
    categoryInput.setAttribute("aria-expanded", "true");
    renderCategoryOptions();
  };
  const closeCategories = () => {
    categoryDropdown.hidden = true;
    categoryInput.setAttribute("aria-expanded", "false");
    setCategoryActive(-1);
  };
  const renderCategoryTags = () => {
    categoryTags.innerHTML = selectedCategories.map((value, i) => `<span class="badge category-select__tag"><span>${esc(value)}</span><button type="button" data-remove-category="${i}" aria-label="Remover categoria ${esc(value)}">${P.icon("x", "i--xs")}</button></span>`).join("");
    categoryValues.innerHTML = selectedCategories.map((value) => `<input type="hidden" name="categories" value="${esc(value)}">`).join("");
    categoryInput.placeholder = selectedCategories.length ? "Adicionar categoria…" : "Selecione ou crie categorias…";
    renderCategoryOptions();
  };
  const toggleCategory = (value) => {
    const existing = categoryOptions.find((option) => categoryKey(option) === categoryKey(value));
    value = existing || value.trim();
    if (!value) return;
    if (!existing) categoryOptions.push(value);
    const selected = selectedCategories.includes(value);
    selectedCategories = selected ? selectedCategories.filter((option) => option !== value) : [...selectedCategories, value];
    categoryStatus.textContent = `Categoria ${value} ${selected ? "removida" : "adicionada"}. ${selectedCategories.length} selecionadas.`;
    categoryInput.value = "";
    renderCategoryTags();
    categoryInput.focus({ preventScroll: true });
  };
  const setCategories = (values) => {
    selectedCategories = [];
    values.filter(Boolean).forEach((value) => {
      const existing = categoryOptions.find((option) => categoryKey(option) === categoryKey(value));
      const normalized = existing || value.trim().slice(0, 40);
      if (!categoryOptions.includes(normalized)) categoryOptions.push(normalized);
      if (!selectedCategories.includes(normalized)) selectedCategories.push(normalized);
    });
    categoryInput.value = "";
    renderCategoryTags();
    closeCategories();
  };
  categoryInput.addEventListener("focus", openCategories);
  categoryInput.addEventListener("input", openCategories);
  $(".category-select__control", categorySelect).addEventListener("click", (e) => {
    if (e.target.closest("[data-remove-category]")) return;
    categoryInput.focus();
    openCategories();
  });
  categoryList.addEventListener("mousedown", (e) => e.preventDefault());
  categoryList.addEventListener("click", (e) => {
    const option = e.target.closest("[data-category]");
    if (option) toggleCategory(option.dataset.category);
  });
  categoryTags.addEventListener("click", (e) => {
    const button = e.target.closest("[data-remove-category]");
    if (button) toggleCategory(selectedCategories[+button.dataset.removeCategory]);
  });
  categoryInput.addEventListener("keydown", (e) => {
    if (e.isComposing) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (categoryDropdown.hidden) openCategories();
      const count = $$("[role='option']", categoryList).length;
      if (count) setCategoryActive((activeCategory + (e.key === "ArrowDown" ? 1 : -1) + count) % count);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const options = $$("[role='option']", categoryList);
      const option = options[activeCategory] || options.find((o) => o.id === "ag-category-create") || options[0];
      if (!categoryDropdown.hidden && option) toggleCategory(option.dataset.category);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeCategories();
    } else if (e.key === "Backspace" && !categoryInput.value && selectedCategories.length) {
      e.preventDefault();
      toggleCategory(selectedCategories.at(-1));
    }
  });
  categorySelect.addEventListener("focusout", (e) => { if (!categorySelect.contains(e.relatedTarget)) closeCategories(); });
  document.addEventListener("click", (e) => { if (!e.composedPath().includes(categorySelect)) closeCategories(); });
  renderCategoryTags();

  /* Exemplos oficiais */
  $("[data-examples]").innerHTML = D.gallery.agents.map((a) => `
    <button type="button" class="tone-card example" style="${toneVars(a.tone)}" data-ex="${a.id}">
      <span class="row"><span class="avatar avatar--sm avatar--square tone-${a.tone}" style="${toneVars(a.tone)}">${esc(a.initials)}</span><span class="example__title">${esc(a.name)}</span></span>
      <span class="example__desc">${esc(a.desc)}</span>
      <span class="example__use">Usar como base ${P.icon("arrow-right", "i--xs")}</span>
    </button>`).join("");
  $("[data-examples]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-ex]");
    if (!b) return;
    const a = D.gallery.agents.find((x) => x.id === b.dataset.ex);
    const fill = () => {
      $$(".example").forEach((x) => x.classList.toggle("is-used", x === b));
      name.value = a.name;
      desc.value = a.desc;
      ins.value = `Você é o ${a.name}, um agente da Asimov Academy.\n${a.desc}\n\nComo responder:\n- Comece pelo que importa, sem introdução longa.\n- Use listas curtas quando houver mais de duas ideias.\n- Se faltar informação, pergunte antes de supor.\n- Escreva em português do Brasil, com tom de amigo inteligente.`;
      setCategories(a.categories || [a.category]);
      tone = a.tone;
      $$("input, textarea", form).forEach((el) => el.dispatchEvent(new Event("input", { bubbles: true })));
      P.toast(`Formulário preenchido com “${a.name}”`, "check-circle");
    };
    if (name.value.trim() || ins.value.trim()) P.confirm({ title: "Trocar o que você já escreveu?", desc: `O nome, a descrição e as instruções serão substituídos pelos do exemplo “${esc(a.name)}”.`, confirm: "Usar como base", danger: false, onConfirm: fill });
    else fill();
  });

  /* Modelos */
  const models = D.models.filter((m) => m.on && m.visible && m.modality === "text");
  $("[data-models]").innerHTML = `
    <label class="check"><input type="radio" name="model" value="auto" checked><span class="row grow" style="gap:10px">${P.modelIcon(P.model("asimov"))}<span class="check__text"><span class="check__title">Deixar o Asimov Basic escolher</span><span class="check__desc">Usa o modelo mais adequado para cada pedido.</span></span></span></label>
    ${models.filter((m) => !m.featured).map((m) => `<label class="check"><input type="radio" name="model" value="${m.key}"><span class="row grow" style="gap:10px">${P.modelIcon(m)}<span class="check__text"><span class="check__title">${esc(m.name)}</span><span class="check__desc">${esc(m.desc)}</span></span></span></label>`).join("")}`;

  /* Arquivos */
  const files = [];
  const renderFiles = () => {
    $("[data-files-count]").textContent = `${files.length} de 5`;
    $("[data-files-list]").innerHTML = files.map((f, i) => `<div class="file-chip" style="max-width:none"><span class="file-chip__icon">${P.icon("file")}</span><span class="grow"><span class="file-chip__name">${esc(f.name)}</span><span class="file-chip__meta">${esc(f.meta)}</span></span><button type="button" class="icon-btn icon-btn--sm" data-rm="${i}" aria-label="Remover ${esc(f.name)}">${P.icon("x")}</button></div>`).join("");
  };
  $("[data-pick-files]").addEventListener("click", () => $("[data-files-input]").click());
  $("[data-files-input]").addEventListener("change", (e) => {
    for (const f of e.target.files) {
      if (files.length >= 5) { P.toast("Até 5 arquivos por agente", "info"); break; }
      files.push({ name: f.name, meta: `${(f.name.split(".").pop() || "").toUpperCase()} · ${Math.max(1, Math.round(f.size / 1024))} KB` });
    }
    e.target.value = "";
    renderFiles();
  });
  $("[data-files-list]").addEventListener("click", (e) => { const b = e.target.closest("[data-rm]"); if (b) { files.splice(+b.dataset.rm, 1); renderFiles(); } });

  /* Skills */
  const skillRow = (s) => `<label class="check"><input type="checkbox" name="skills" value="${esc(s.name)}"><span class="check__text"><span class="check__title">${esc(s.name)}</span><span class="check__desc">${esc(s.desc)}</span></span></label>`;
  $("[data-skills-mine]").innerHTML = D.mySkills.length ? D.mySkills.map(skillRow).join("") : `<div class="empty"><p class="empty__text">Você ainda não tem skills.</p><a class="btn btn--secondary btn--sm" href="skill-nova.html">Criar skill</a></div>`;
  $("[data-skills-official]").innerHTML = D.gallery.skills.map(skillRow).join("");
  form.addEventListener("change", (e) => {
    if (e.target.name !== "skills") return;
    const on = $$("input[name='skills']:checked", form);
    if (on.length > 5) { e.target.checked = false; P.toast("Até 5 skills por agente", "info"); }
    $("[data-skills-count]").textContent = `${Math.min(on.length, 5)} de 5`;
  });

  /* Perguntas sugeridas */
  const qBox = $("[data-questions]");
  const renderQCount = () => {
    const n = $$("input", qBox).length;
    $("[data-q-count]").textContent = `${n} de 4`;
    $("[data-add-q]").disabled = n >= 4;
    syncPreview();
  };
  const addQ = (v = "") => {
    const row = document.createElement("div");
    row.className = "question-row";
    row.innerHTML = `<input class="input" aria-label="Pergunta sugerida" maxlength="120" placeholder="Ex.: Pode revisar esta proposta?" value="${esc(v)}"><button type="button" class="icon-btn" aria-label="Remover pergunta">${P.icon("trash")}</button>`;
    qBox.append(row);
    $("button", row).addEventListener("click", () => { row.remove(); renderQCount(); });
    $("input", row).addEventListener("input", syncPreview);
    $("input", row).focus();
    renderQCount();
  };
  $("[data-add-q]").addEventListener("click", () => addQ());

  /* Prévia e teste */
  const testBody = $("[data-test-body]");
  const testInput = $("#test-input");
  const testSend = $("[data-test-send]");
  const ready = () => name.value.trim() && ins.value.trim();
  function syncPreview() {
    const n = name.value.trim();
    $$("[data-av-preview]").forEach((av) => {
      av.style.cssText = toneVars(tone);
      av.className = av.className.replace(/tone-\w+/, "tone-" + tone);
      av.innerHTML = n ? esc(initials(n)) : P.icon("bot", "i--lg");
    });
    // A apresentação só existe até a primeira mensagem de teste
    const intro = $("[data-test-intro]");
    if (intro) {
      $("[data-test-name]", intro).textContent = n || "Seu agente";
      $("[data-test-hint]", intro).textContent = ready() ? ($("#ag-first").value.trim() || desc.value.trim() || "Mande uma mensagem para ver como ele responde.") : "Preencha nome e instruções para testar aqui.";
      const qs = $$("input", qBox).map((i) => i.value.trim()).filter(Boolean);
      $("[data-test-questions]", intro).innerHTML = ready() ? qs.map((q) => `<button type="button" class="badge" style="height:28px;cursor:pointer" data-q="${esc(q)}">${esc(q)}</button>`).join("") : "";
    }
    testInput.disabled = !ready();
    testSend.disabled = !ready() || !testInput.value.trim();
    $("[data-save]").disabled = !ready();
  }
  form.addEventListener("input", syncPreview);
  testInput.addEventListener("input", syncPreview);

  const sendTest = (text) => {
    if (!text || !ready()) return;
    $("[data-test-intro]")?.remove();
    testBody.insertAdjacentHTML("beforeend", `<div class="msg msg--user"><div class="msg__bubble">${esc(text)}</div></div>`);
    const art = document.createElement("div");
    art.className = "msg msg--ai";
    art.style.gridTemplateColumns = "26px minmax(0,1fr)";
    art.innerHTML = `<span class="avatar avatar--sm avatar--square tone-${tone}" style="${toneVars(tone)};grid-row:span 2">${esc(initials(name.value))}</span><div class="msg__model" style="min-height:24px"><strong>${esc(name.value.trim())}</strong></div><div class="prose"><span class="typing"><span></span><span></span><span></span></span></div>`;
    testBody.append(art);
    testBody.scrollTop = testBody.scrollHeight;
    testInput.value = "";
    syncPreview();
    setTimeout(() => {
      const first = ins.value.trim().split("\n").find((l) => l.trim() && !l.startsWith("-")) || "";
      $(".prose", art).innerHTML = `<p>Entendi. Seguindo as minhas instruções (<em>${esc(first.slice(0, 90))}${first.length > 90 ? "…" : ""}</em>), eu começaria assim:</p><ul><li>Primeiro, confirmo o que você quer no fim.</li><li>Depois, entrego no formato combinado.</li></ul><p>Pode me mandar o material?</p>`;
      testBody.scrollTop = testBody.scrollHeight;
    }, 900);
  };
  testSend.addEventListener("click", () => sendTest(testInput.value.trim()));
  testInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); sendTest(testInput.value.trim()); } });
  testBody.addEventListener("click", (e) => { const q = e.target.closest("[data-q]"); if (q) sendTest(q.dataset.q); });
  $("[data-clear-test]").addEventListener("click", () => {
    testBody.innerHTML = `<div class="test-panel__intro" data-test-intro><span class="avatar avatar--xl avatar--square" data-av-preview></span><strong data-test-name></strong><p data-test-hint></p><div class="row row--wrap" style="justify-content:center" data-test-questions></div></div>`;
    syncPreview();
  });

  /* Gaveta do teste (telas estreitas) */
  const fab = $("[data-open-test]");
  const setTesting = (on) => {
    document.body.classList.toggle("is-testing", on);
    fab.setAttribute("aria-expanded", on);
    if (on && !testInput.disabled) setTimeout(() => testInput.focus({ preventScroll: true }), 300);
    if (!on) fab.focus({ preventScroll: true });
  };
  fab.addEventListener("click", () => setTesting(true));
  $$("[data-close-test]").forEach((el) => el.addEventListener("click", () => setTesting(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("is-testing")) setTesting(false); });
  // agente-novo.html#testar abre a gaveta direto (útil para links e revisão)
  if (location.hash === "#testar" && matchMedia("(max-width: 1100px)").matches) setTesting(true);

  /* Editar um agente existente */
  const editing = D.myAgents.find((a) => a.id === new URLSearchParams(location.search).get("id"));
  if (editing) {
    $("[data-form-title]").textContent = "Editar agente";
    document.title = "Editar agente · Asimov Prisma";
    name.value = editing.name;
    desc.value = editing.desc;
    tone = editing.tone;
    setCategories(editing.categories || [editing.category]);
    ins.value = "Você é um revisor de propostas comerciais.\nLeia a proposta e devolva:\n1. O texto revisado, mais claro e direto;\n2. Até 3 riscos que o cliente pode apontar;\n3. Perguntas que o cliente provavelmente vai fazer.";
    const r = $(`input[name='model'][value='${editing.model}']`);
    if (r) r.checked = true;
    addQ("Pode revisar esta proposta?");
    addQ("Quais riscos você vê aqui?");
    name.focus({ preventScroll: true });
  } else {
    tone = TONES[Math.floor(Math.random() * TONES.length)];
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!ready()) return;
    if ($("[data-publish]").checked && !desc.value.trim()) { P.toast("Escreva uma descrição para publicar na galeria", "info"); desc.focus(); return; }
    P.toast(editing ? "Agente atualizado" : "Agente criado", "check-circle");
    setTimeout(() => (location.href = "agentes.html"), 700);
  });

  P.ready();
  renderQCount();
  syncPreview();
})();
