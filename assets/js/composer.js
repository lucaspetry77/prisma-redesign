/* Asimov Prisma · composer e seletor de modelo
 * P.composer(form, opts) monta o campo de mensagem usado no início, na conversa e no projeto.
 * Regras preservadas (00-inventario.md §5): modalidade texto/imagem, featured + "Outros",
 * imagem + modelo sem leitura de imagem bloqueia o envio, até 5 skills, Enter envia, Shift+Enter quebra linha.
 */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, $$, esc, store } = P;
  const icon = (n, c) => P.icon(n, c);
  const MAX_SKILLS = 5;

  /* ───────────────────────── Seletor de modelo ───────────────────────── */

  const costTier = (m) => (m.priceOut == null ? 0 : m.priceOut < 1 ? 1 : m.priceOut < 8 ? 2 : 3);
  const costLabel = ["", "baixo", "médio", "alto"];
  const costHtml = (m) => {
    const t = costTier(m);
    if (!t) return "";
    return `<span class="model-row__cost" title="Custo relativo: ${costLabel[t]}" aria-label="Custo ${costLabel[t]}"><b>${"$".repeat(t)}</b>${"$".repeat(3 - t)}</span>`;
  };

  /** modelPicker(anchor, current, onPick, { modality, imagesOnly, side, align }) */
  const modelPicker = (anchor, current, onPick, { modality = "text", imagesOnly = false, side = "auto", align = "end" } = {}) => {
    const vis = D.models.filter((m) => m.on && m.visible && m.modality === modality && (!imagesOnly || m.images)).sort((a, b) => a.order - b.order);
    const featured = vis.filter((m) => m.featured);
    const others = vis.filter((m) => !m.featured);
    const cur = P.model(current);
    let othersOpen = imagesOnly || !cur.featured || store.get("othersOpen", false);
    const row = (m) => `<button type="button" role="option" class="model-row" data-key="${m.key}" data-nav-item aria-selected="${m.key === current}" tabindex="-1">
        ${P.modelIcon(m, "model-icon--lg")}
        <span class="model-row__body"><span class="model-row__name">${esc(m.name)}${m.badge ? `<span class="badge badge--accent">${esc(m.badge)}</span>` : ""}</span><span class="model-row__desc">${esc(m.desc)}</span></span>
        ${costHtml(m)}${icon("check", "menu__check i--sm")}</button>`;
    const searchable = vis.length > 8;
    const html = `${searchable ? `<div class="input-icon model-pop__search">${icon("search")}<input class="input input--sm" type="search" placeholder="Buscar modelo" aria-label="Buscar modelo" data-q></div>` : ""}
      <div role="listbox" aria-label="Modelo" data-list>
        ${featured.length ? `<div role="group" aria-label="Automático">${modality === "text" ? `<div class="model-pop__group-label" aria-hidden="true">Automático</div>` : ""}${featured.map(row).join("")}</div>` : ""}
        ${others.length ? `${featured.length ? `<div class="menu__sep"></div><button type="button" class="model-pop__toggle" data-toggle data-nav-item aria-expanded="${othersOpen}" tabindex="-1">Outros modelos ${icon("chevron-down")}</button>` : ""}
        <div role="group" aria-label="Outros modelos" data-others ${othersOpen || !featured.length ? "" : "hidden"}>${others.map(row).join("")}</div>` : ""}
      </div>`;
    const el = P.popover(anchor, html, { className: "model-pop", role: "dialog", label: "Escolher modelo", align, side, focus: false });
    if (!el) return;
    anchor.setAttribute("aria-haspopup", "listbox");
    const rows = () => $$(".model-row:not([hidden]), [data-toggle]", el).filter((b) => b.offsetParent);
    const focusRow = (b) => { rows().forEach((r) => r.classList.toggle("is-active", r === b)); b?.focus({ preventScroll: false }); };
    requestAnimationFrame(() => (searchable ? $("[data-q]", el).focus() : focusRow($(`.model-row[aria-selected="true"]`, el) || rows()[0])));
    const pick = (key) => { P.closePopover(); onPick(key); };
    el.addEventListener("click", (e) => {
      const t = e.target.closest("[data-toggle]");
      if (t) {
        othersOpen = t.getAttribute("aria-expanded") !== "true";
        t.setAttribute("aria-expanded", othersOpen);
        $("[data-others]", el).hidden = !othersOpen;
        store.set("othersOpen", othersOpen);
        el._reposition();
        return;
      }
      const r = e.target.closest(".model-row");
      if (r) pick(r.dataset.key);
    });
    el.addEventListener("pointermove", (e) => { const r = e.target.closest(".model-row"); if (r && P.fine) rows().forEach((x) => x.classList.toggle("is-active", x === r)); });
    // Teclado extra do morph select: PageUp/PageDown (8), type-ahead, Enter escolhe
    let typed = "", typedAt = 0;
    el.addEventListener("keydown", (e) => {
      const list = rows();
      const i = list.indexOf(document.activeElement);
      if (e.key === "PageDown" || e.key === "PageUp") { e.preventDefault(); focusRow(list[Math.max(0, Math.min(list.length - 1, i + (e.key === "PageDown" ? 8 : -8)))]); return; }
      if (e.key === "ArrowDown" && e.target.matches("[data-q]")) { e.preventDefault(); focusRow(list[0]); return; }
      if (e.key.length === 1 && !e.target.matches("[data-q]") && /\S/.test(e.key)) {
        typed = performance.now() - typedAt > 700 ? e.key : typed + e.key;
        typedAt = performance.now();
        const hit = list.find((r) => P.norm(r.textContent).trim().startsWith(P.norm(typed)));
        if (hit) focusRow(hit);
      }
    });
    el.addEventListener("focusin", (e) => { const r = e.target.closest(".model-row, [data-toggle]"); if (r) rows().forEach((x) => x.classList.toggle("is-active", x === r)); });
    $("[data-q]", el)?.addEventListener("input", (e) => {
      const q = P.norm(e.target.value);
      $$(".model-row", el).forEach((r) => (r.hidden = q && !P.norm(r.textContent).includes(q)));
      if (q) $("[data-others]", el).hidden = false;
    });
    return el;
  };

  /* ───────────────────────── Painéis do "+" ───────────────────────── */

  const panelHead = (title, sub = "") => `<div class="plus-pop__head"><span class="plus-pop__title">${esc(title)}</span>${sub}<button type="button" class="icon-btn icon-btn--xs" data-x aria-label="Fechar">${icon("x")}</button></div>`;

  const agentsPanel = (anchor, onPick) => {
    const mine = D.myAgents.map((a) => ({ ...a, group: "Seus agentes" }));
    const favs = D.gallery.agents.filter((a) => a.fav).map((a) => ({ ...a, group: "Favoritos" }));
    const official = D.gallery.agents.filter((a) => !a.fav).map((a) => ({ ...a, group: "Oficiais da Asimov" }));
    const all = [...mine, ...favs, ...official];
    const el = P.popover(anchor, `${panelHead("Conversar com um agente")}
      <div class="plus-pop__search"><div class="input-icon">${icon("search")}<input class="input input--sm" type="search" placeholder="Buscar agente" aria-label="Buscar agente" data-q></div></div>
      <div class="plus-pop__body" data-list></div>
      <div class="plus-pop__foot row row--between"><a class="link t-xs" href="agentes.html?aba=asimov">Ver agentes da Asimov</a><a class="link t-xs" href="agente-novo.html">Criar agente</a></div>`,
      { className: "plus-pop", label: "Conversar com um agente", side: "top", initialFocus: "[data-q]" });
    if (!el) return;
    const render = () => {
      const q = P.norm($("[data-q]", el).value);
      const items = all.filter((a) => !q || P.norm(`${a.name} ${a.desc} ${a.category || ""}`).includes(q));
      let g = "";
      $("[data-list]", el).innerHTML = items.length ? items.map((a) => {
        const head = a.group !== g ? `<div class="menu__label">${esc((g = a.group))}</div>` : "";
        return `${head}<button type="button" class="pick-agent" data-agent="${a.id}" data-nav-item>${P.agentAvatar(a, "md")}<span class="grow" style="min-width:0"><span class="pick-agent__name">${esc(a.name)}${a.group !== "Seus agentes" ? P.verified() : ""}</span><span class="pick-agent__desc t-clamp-1">${esc(a.desc)}</span></span></button>`;
      }).join("") : `<div class="cmdk__empty"><strong>Nenhum agente encontrado</strong>Tente outro nome ou veja os da Asimov em Agentes.</div>`;
      P.hydrateIcons(el);
    };
    render();
    $("[data-q]", el).addEventListener("input", render);
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-x]")) { P.closePopover(); return; }
      const b = e.target.closest("[data-agent]");
      if (b) { P.closePopover(); onPick([...D.myAgents, ...D.gallery.agents].find((a) => a.id === b.dataset.agent)); }
    });
  };

  const skillsPanel = (anchor, st, after) => {
    const row = (s) => `<label class="check"><input type="checkbox" value="${esc(s.name)}" ${st.skills.includes(s.name) ? "checked" : ""}><span class="check__text"><span class="check__title">${esc(s.name)}</span><span class="check__desc">${esc(s.desc)}</span></span></label>`;
    const el = P.popover(anchor, `${panelHead("Skills nesta conversa", `<span class="badge" data-count>${st.skills.length} de ${MAX_SKILLS}</span>`)}
      <div class="plus-pop__search"><div class="input-icon">${icon("search")}<input class="input input--sm" type="search" placeholder="Buscar skill" aria-label="Buscar skill" data-q></div></div>
      <div class="plus-pop__body" data-list>
        <div class="menu__label">Suas skills</div>
        ${D.mySkills.length ? D.mySkills.map(row).join("") : `<p class="hint" style="padding:var(--s-1) var(--s-3) var(--s-2)">Você ainda não criou skills. <a class="link" href="skill-nova.html">Criar skill</a></p>`}
        <div class="menu__label">Oficiais da Asimov</div>
        ${D.gallery.skills.map(row).join("")}
      </div>
      <div class="plus-pop__foot"><p class="hint">Até ${MAX_SKILLS} por conversa. A IA segue as instruções de cada skill ligada em todas as respostas.</p></div>`,
      { className: "plus-pop", label: "Skills", side: "top", initialFocus: "[data-q]" });
    if (!el) return;
    const sync = () => {
      $("[data-count]", el).textContent = `${st.skills.length} de ${MAX_SKILLS}`;
      $$("input[type=checkbox]", el).forEach((cb) => { cb.disabled = !cb.checked && st.skills.length >= MAX_SKILLS; cb.closest(".check").title = cb.disabled ? `Limite de ${MAX_SKILLS} skills por conversa` : ""; });
    };
    sync();
    el.addEventListener("click", (e) => { if (e.target.closest("[data-x]")) P.closePopover(); });
    el.addEventListener("change", (e) => {
      const cb = e.target;
      st.skills = cb.checked ? [...st.skills, cb.value] : st.skills.filter((x) => x !== cb.value);
      sync();
      after();
    });
    $("[data-q]", el).addEventListener("input", (e) => {
      const q = P.norm(e.target.value);
      $$(".check", el).forEach((l) => (l.hidden = q && !P.norm(l.textContent).includes(q)));
    });
  };

  const promptsPanel = (anchor, ta) => {
    const saved = store.get("prompts", []);
    const el = P.popover(anchor, `${panelHead("Prompts e contextos")}
      <div class="plus-pop__search"><div class="seg seg--sm" role="tablist" aria-label="Tipo"><button type="button" role="tab" class="seg__btn" aria-selected="true" aria-controls="pp-p">Prompts</button><button type="button" role="tab" class="seg__btn" aria-selected="false" aria-controls="pp-c" tabindex="-1">Contextos</button></div></div>
      <div class="plus-pop__body">
        <div id="pp-p">${saved.length ? saved.map((p, i) => `<button type="button" class="pick-agent" data-use="${i}" data-nav-item><span class="icon-chip icon-chip--sm">${icon("bookmark")}</span><span class="grow" style="min-width:0"><span class="pick-agent__name t-clamp-1">${esc(p.slice(0, 60))}</span><span class="pick-agent__desc t-clamp-1">${esc(p)}</span></span></button>`).join("")
          : P.empty({ icon: "bookmark", title: "Nenhum prompt salvo", text: "Escreva no campo e salve aqui para reaproveitar depois, em qualquer conversa.", center: true, plain: true })}</div>
        <div id="pp-c" hidden>${P.empty({ icon: "notebook", title: "Nenhum contexto salvo", text: "Contextos são textos de apoio (sobre você, a empresa, um cliente) que entram na conversa sem você colar de novo.", center: true, plain: true })}</div>
      </div>
      <div class="plus-pop__foot"><button type="button" class="btn btn--sm btn--block" data-save ${ta.value.trim() ? "" : "disabled"}>${icon("bookmark")}Salvar o texto do campo</button>${ta.value.trim() ? "" : `<p class="hint mt-2" style="text-align:center">Escreva no campo o que você quer salvar.</p>`}</div>`,
      { className: "plus-pop", label: "Prompts e contextos", side: "top" });
    if (!el) return;
    P.bindFields(el);
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-x]")) { P.closePopover(); return; }
      const u = e.target.closest("[data-use]");
      if (u) { P.closePopover(); ta.value = saved[+u.dataset.use]; ta.dispatchEvent(new Event("input")); ta.focus(); }
      if (e.target.closest("[data-save]")) { saved.unshift(ta.value.trim()); store.set("prompts", saved.slice(0, 30)); P.closePopover(); P.toast("Prompt salvo", { icon: "bookmark" }); }
    });
  };

  /* ───────────────────────── Composer ───────────────────────── */

  const composer = (root, { onSend, placeholder = "Pergunte, peça ou cole um texto", model: startModel, project = null, lockedProject = false, skills = [], agent = null, phrases = null, label = "Mensagem" } = {}) => {
    const def = (D.models.find((m) => m.isDefault) || D.models[0]).key;
    startModel = startModel || def;
    const st = { model: startModel, mode: P.model(startModel).modality === "image" ? "image" : "text", files: [], skills: [...skills], agent, project, busy: false, loading: 0, error: null };
    let lastText = st.mode === "text" ? startModel : def;
    let lastImage = st.mode === "image" ? startModel : (D.models.find((m) => m.modality === "image" && m.featured) || {}).key;
    const id = "cmp-" + P.uid();
    root.classList.add("composer");
    root.setAttribute("aria-label", label);
    root.innerHTML = `
      <div data-strip aria-live="polite"></div>
      <div class="composer__ctx" data-ctx></div>
      <label class="sr-only" for="${id}">${esc(label)}</label>
      <textarea id="${id}" class="composer__input" rows="1" placeholder="${esc(placeholder)}" data-autoresize data-max="260" enterkeyhint="send"></textarea>
      <div class="composer__bar">
        <button type="button" class="icon-btn composer__tool" data-act="more" aria-haspopup="menu" aria-expanded="false" aria-label="Adicionar: arquivo, agente, skills, prompts, projeto" data-tip="Adicionar">${icon("plus")}</button>
        <span data-mode></span>
        <input type="file" hidden multiple data-file>
        <span class="composer__spacer"></span>
        <span data-quota></span>
        <button type="button" class="model-btn" data-act="model" aria-expanded="false"></button>
        <button type="submit" class="send-btn" data-act="send" aria-label="Enviar" disabled>${icon("arrow-up")}</button>
      </div>`;
    const ta = $(".composer__input", root);
    const send = $("[data-act='send']", root);
    const ctx = $("[data-ctx]", root);
    const strip = $("[data-strip]", root);
    const fileInput = $("[data-file]", root);
    const incompatible = () => st.files.some((f) => f.image) && !P.model(st.model).images;

    const u = D.user;
    const pct = (u.credits.used / u.credits.limit) * 100;
    if (pct > 70) $("[data-quota]", root).innerHTML = `<span class="composer__quota ${pct > 90 ? "is-danger" : ""}" title="Renova ${esc(u.credits.renews)}">${Math.round(100 - pct)}% dos créditos da semana</span>`;

    const renderModel = () => {
      const m = P.model(st.model);
      const b = $("[data-act='model']", root);
      b.innerHTML = `${P.modelIcon(m)}<span class="model-btn__name">${esc(m.name)}</span>${icon("chevron-down")}`;
      b.setAttribute("aria-label", `Modelo: ${m.name}. Trocar modelo`);
      b.dataset.tip = "Trocar modelo";
    };
    const sync = () => {
      const img = st.mode === "image";
      root.classList.toggle("is-image", img);
      ta.placeholder = img ? "Descreva a imagem que você quer criar" : placeholder;
      $("[data-mode]", root).innerHTML = img ? `<span class="composer__mode">${icon("image")}Imagem<button type="button" data-act="exit-image" aria-label="Sair da criação de imagem">${icon("x", "i--xs")}</button></span>` : "";
      // Faixas: erro de envio tem prioridade; depois a incompatibilidade de imagem
      if (st.error) {
        strip.innerHTML = `<div class="composer__strip composer__strip--danger" role="alert">${icon("danger")}<div class="grow"><strong>Não foi possível enviar.</strong> ${esc(st.error.message || "Verifique a conexão.")} Sua mensagem continua no campo.<br><button type="button" class="btn btn--sm" data-act="retry">${icon("refresh")}Tentar de novo</button></div></div>`;
      } else if (incompatible()) {
        strip.innerHTML = `<div class="composer__strip composer__strip--warn" role="status">${icon("alert")}<div class="grow"><strong>${esc(P.model(st.model).name)} não lê imagens.</strong> Escolha um modelo que lê imagens ou remova a imagem e descreva o conteúdo em texto.<br><button type="button" class="btn btn--sm" data-act="image-model">Escolher modelo com imagens${icon("arrow-right")}</button></div></div>`;
      } else strip.innerHTML = "";
      const empty = !ta.value.trim() && !st.files.length;
      send.disabled = !st.busy && (incompatible() || st.loading > 0 || empty);
      const wasStop = send.classList.contains("is-stop");
      send.classList.toggle("is-stop", st.busy);
      if (wasStop !== st.busy) { send.innerHTML = icon(st.busy ? "stop" : "arrow-up"); send.classList.remove("is-swap"); void send.offsetWidth; send.classList.add("is-swap"); }
      send.setAttribute("aria-label", st.busy ? "Parar resposta" : img ? "Criar imagem" : "Enviar");
      send.dataset.tip = st.busy ? "Parar" : img ? "Criar imagem" : "Enviar";
    };
    const renderCtx = () => {
      const pills = [];
      if (st.agent) pills.push(`<span class="ctx-pill">${P.agentAvatar(st.agent, "xs")}<span class="ctx-pill__name">${esc(st.agent.name)}</span><button type="button" class="ctx-pill__x" data-rm="agent" aria-label="Tirar o agente ${esc(st.agent.name)}">${icon("x", "i--xs")}</button></span>`);
      if (st.project) { const p = D.projects.find((x) => x.id === st.project); if (p) pills.push(`<span class="ctx-pill ${lockedProject ? "ctx-pill--lock" : ""}">${icon("folder")}<span class="ctx-pill__name">${esc(p.name)}</span>${lockedProject ? "" : `<button type="button" class="ctx-pill__x" data-rm="project" aria-label="Tirar do projeto ${esc(p.name)}">${icon("x", "i--xs")}</button>`}</span>`); }
      st.skills.forEach((s, i) => pills.push(`<span class="ctx-pill">${icon("skill")}<span class="ctx-pill__name">${esc(s)}</span><button type="button" class="ctx-pill__x" data-rm="skill" data-i="${i}" aria-label="Desligar a skill ${esc(s)}">${icon("x", "i--xs")}</button></span>`));
      st.files.forEach((f, i) => pills.push(`<span class="file-card" title="${esc(f.name)}"><span class="file-card__icon ${f.image ? "file-card__icon--img" : ""}">${f.image && f.preview ? `<img src="${esc(f.preview)}" alt="">` : icon(f.image ? "image" : "file", "i--sm")}</span><span class="file-card__text"><span class="file-card__name">${esc(f.name)}</span><span class="file-card__meta">${esc(f.meta)}</span></span><button type="button" class="icon-btn icon-btn--xs file-card__x" data-rm="file" data-i="${i}" aria-label="Remover ${esc(f.name)}">${icon("x")}</button></span>`));
      if (st.loading) pills.push(`<span class="file-card"><span class="file-card__icon"><span class="spinner"></span></span><span class="file-card__text"><span class="file-card__name">Preparando anexo…</span></span></span>`);
      ctx.innerHTML = pills.join("");
      sync();
    };
    ctx.addEventListener("click", (e) => {
      const b = e.target.closest("[data-rm]");
      if (!b) return;
      const k = b.dataset.rm;
      if (k === "project") st.project = null;
      if (k === "agent") st.agent = null;
      if (k === "skill") st.skills.splice(+b.dataset.i, 1);
      if (k === "file") st.files.splice(+b.dataset.i, 1);
      renderCtx();
      ta.focus();
    });

    const addFiles = async (list) => {
      const selected = [...list];
      if (!selected.length) return;
      st.loading++;
      renderCtx();
      const out = await Promise.all(selected.map(async (f) => {
        const image = f.type.startsWith("image/");
        const size = f.size >= 1048576 ? `${(f.size / 1048576).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`;
        let preview = null;
        if (image) {
          try { preview = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(f); }); }
          catch { P.toast(`Não foi possível abrir ${f.name}. Tente anexar de novo.`, { danger: true }); return null; }
        }
        return { name: f.name, meta: `${image ? "Imagem" : (f.name.split(".").pop() || "Arquivo").toUpperCase()} · ${size}`, image, preview };
      }));
      st.files.push(...out.filter(Boolean));
      st.loading--;
      renderCtx();
    };

    const doSend = () => {
      if (st.busy) { api.stop?.(); return; }
      const text = ta.value.trim();
      if (st.loading || incompatible() || (!text && !st.files.length)) return;
      st.error = null;
      const payload = { text, files: [...st.files], model: st.model, skills: [...st.skills], agent: st.agent, project: st.project };
      const accepted = onSend?.(payload);
      if (accepted === false) return;
      ta.value = "";
      st.files = [];
      P.autoresize(ta);
      renderCtx();
    };

    ta.addEventListener("input", () => { if (st.error) st.error = null; sync(); });
    ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); doSend(); } });
    root.addEventListener("submit", (e) => { e.preventDefault(); doSend(); });
    send.addEventListener("click", (e) => { e.preventDefault(); doSend(); });
    fileInput.addEventListener("change", () => { addFiles(fileInput.files); fileInput.value = ""; });
    ["dragenter", "dragover"].forEach((t) => root.addEventListener(t, (e) => { if (e.dataTransfer?.types?.includes("Files")) { e.preventDefault(); root.classList.add("is-drop"); } }));
    ["dragleave", "drop"].forEach((t) => root.addEventListener(t, () => root.classList.remove("is-drop")));
    root.addEventListener("drop", (e) => { if (e.dataTransfer?.files?.length) { e.preventDefault(); addFiles(e.dataTransfer.files); } });
    ta.addEventListener("paste", (e) => { const fs = [...(e.clipboardData?.files || [])]; if (fs.length) { e.preventDefault(); addFiles(fs); } });

    const pickModel = (k) => {
      const prev = st.model;
      st.model = k;
      st.mode = P.model(k).modality === "image" ? "image" : "text";
      if (st.mode === "image") lastImage = k; else lastText = k;
      renderModel();
      sync();
      if (k !== prev) api.onModel?.(k, prev);
      ta.focus();
    };
    const setImage = (on) => { if (st.busy) return; pickModel(on ? lastImage : lastText); };
    $("[data-act='model']", root).addEventListener("click", (e) => modelPicker(e.currentTarget, st.model, pickModel, { modality: st.mode, side: root.closest(".dock") ? "top" : "auto" }));
    root.addEventListener("click", (e) => {
      const a = e.target.closest("[data-act]");
      if (!a) return;
      if (a.dataset.act === "exit-image") setImage(false);
      if (a.dataset.act === "image-model") modelPicker(a, st.model, pickModel, { imagesOnly: true, modality: st.mode });
      if (a.dataset.act === "retry") { st.error = null; sync(); doSend(); }
    });

    const moreBtn = $("[data-act='more']", root);
    moreBtn.addEventListener("click", () => {
      P.menu(moreBtn, [
        { label: "Anexar arquivo ou imagem", icon: "paperclip", onClick: () => fileInput.click() },
        { label: "Conversar com um agente", icon: "agent", keepFocus: true, onClick: () => agentsPanel(moreBtn, (a) => { st.agent = a; renderCtx(); P.toast(`Conversando com ${a.name}`, { icon: "agent" }); ta.focus(); }) },
        { label: `Skills${st.skills.length ? ` (${st.skills.length} de ${MAX_SKILLS})` : ""}`, icon: "skill", keepFocus: true, onClick: () => skillsPanel(moreBtn, st, renderCtx) },
        { label: "Prompts e contextos", icon: "bookmark", keepFocus: true, onClick: () => promptsPanel(moreBtn, ta) },
        ...(lockedProject ? [] : [{ label: st.project ? "Trocar de projeto" : "Adicionar a um projeto", icon: "folder-plus", onClick: () => P.projectPicker((p) => { st.project = p.id; renderCtx(); P.toast(`Conversa no projeto ${p.name}`, { icon: "folder" }); }, { current: st.project }) }]),
        { sep: true },
        { label: st.mode === "image" ? "Voltar para texto" : "Criar imagem", icon: st.mode === "image" ? "chat" : "image", onClick: () => setImage(st.mode !== "image") },
      ], { label: "Adicionar", side: root.closest(".dock") ? "top" : "auto" });
    });

    renderModel();
    renderCtx();
    P.bindFields(root);
    const stopTyping = phrases ? P.motion?.typewriter?.(ta, phrases) : null;

    const api = {
      el: root, input: ta, state: st,
      setBusy(b) { st.busy = b; root.classList.toggle("is-busy", b); sync(); },
      setText(t) { ta.value = t; P.autoresize(ta); sync(); ta.focus(); ta.setSelectionRange(t.length, t.length); stopTyping?.(); },
      setModel: pickModel, setImage,
      setAgent(a) { st.agent = a; renderCtx(); },
      showError(err, text) { st.error = err || { message: "" }; if (text != null) { ta.value = text; P.autoresize(ta); } sync(); },
      stop: null, onModel: null,
    };
    return api;
  };

  Object.assign(P, { composer, modelPicker, costTier });
})();
