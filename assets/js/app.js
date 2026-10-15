/* Asimov Prisma — shell do app e componentes de interface.
 *
 * Cada página tem <div class="app" data-page="..."> com um <main class="main">.
 * Este arquivo monta a barra lateral, o topo do mobile e expõe em window.Prisma
 * os componentes usados pelas telas: menu, modal, confirmação, toast, seletor de
 * modelo, composer, contadores e abas. Sem dependências e sem build.
 */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => Number(n).toLocaleString("pt-BR");
  const store = {
    get(k, d) { try { const v = localStorage.getItem("prisma:" + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("prisma:" + k, JSON.stringify(v)); } catch {} },
  };
  const ASSETS = "assets/";

  /* ───────────────────────── Toast ───────────────────────── */

  const toast = (msg, icon = "check-circle") => {
    let host = $(".toasts");
    if (!host) { host = document.createElement("div"); host.className = "toasts"; host.setAttribute("role", "status"); host.setAttribute("aria-live", "polite"); document.body.append(host); }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `${P.icon(icon)}<span>${esc(msg)}</span>`;
    host.append(t);
    setTimeout(() => { t.classList.add("is-leaving"); setTimeout(() => t.remove(), 220); }, 2600);
  };

  /* ───────────────────────── Menu ───────────────────────── */

  let openMenu = null;
  const closeMenu = (focusBack = true) => {
    if (!openMenu) return;
    const { el, anchor, onClose } = openMenu;
    el.classList.add("is-leaving");
    el.style.pointerEvents = "none";
    setTimeout(() => el.remove(), 120);
    anchor?.setAttribute("aria-expanded", "false");
    openMenu = null;
    onClose?.();
    if (focusBack) anchor?.focus({ preventScroll: true });
  };

  // side: "auto" abre embaixo se couber; "top" sempre em cima (ex.: conta, no pé da barra).
  // Em qualquer caso o menu é empurrado para dentro da janela.
  const place = (el, anchor, { align = "start", gap = 6, side = "auto" } = {}) => {
    const r = anchor.getBoundingClientRect();
    const { width: w, height: h } = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    let left = align === "end" ? r.right - w : r.left;
    left = Math.max(12, Math.min(left, vw - w - 12));
    const up = side === "top" || r.bottom + gap + h > vh - 12;
    let top = up ? r.top - gap - h : r.bottom + gap;
    top = Math.max(12, Math.min(top, vh - h - 12));
    el.style.left = left + "px";
    el.style.top = top + "px";
    el.style.setProperty("--origin", `${align === "end" ? "right" : "left"} ${up ? "bottom" : "top"}`);
  };

  /** items: [{ label, icon, onClick, danger, soon, sep, label2 }] */
  const menu = (anchor, items, opts = {}) => {
    if (openMenu?.anchor === anchor) { closeMenu(); return null; }
    closeMenu(false);
    const el = document.createElement("div");
    el.className = "menu " + (opts.className || "");
    el.setAttribute("role", "menu");
    if (opts.label) el.setAttribute("aria-label", opts.label);
    if (opts.html) el.innerHTML = opts.html;
    else el.innerHTML = items.map((it, i) => {
      if (it.sep) return `<div class="menu__sep" role="separator"></div>`;
      if (it.heading) return `<div class="menu__label">${esc(it.heading)}</div>`;
      return `<button type="button" role="menuitem" class="menu__item ${it.danger ? "menu__item--danger" : ""}" data-i="${i}" style="--i:${i}" ${it.disabled ? "disabled" : ""}>${it.icon ? P.icon(it.icon) : ""}<span>${esc(it.label)}</span>${it.soon ? `<span class="badge badge--soon">Pós-MVP</span>` : ""}</button>`;
    }).join("");
    document.body.append(el);
    place(el, anchor, opts);
    anchor.setAttribute("aria-expanded", "true");
    openMenu = { el, anchor, onClose: opts.onClose, at: performance.now() };
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-i]");
      if (!b) return;
      const it = items[+b.dataset.i];
      closeMenu(!it.keepFocus);
      it.onClick?.(anchor);
    });
    el.addEventListener("keydown", (e) => {
      const btns = $$(".menu__item:not(:disabled), .model-option, .model-group__toggle", el);
      const i = btns.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); btns[(i + 1) % btns.length]?.focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); btns[(i - 1 + btns.length) % btns.length]?.focus(); }
      if (e.key === "Tab") closeMenu(false);
    });
    requestAnimationFrame(() => $(".menu__item:not(:disabled), .model-option[aria-selected='true'], .model-option", el)?.focus({ preventScroll: true }));
    return el;
  };

  document.addEventListener("pointerdown", (e) => {
    if (openMenu && !openMenu.el.contains(e.target) && !openMenu.anchor.contains(e.target)) closeMenu(false);
    const panel = $(".panel:not([hidden])");
    if (panel && !panel.contains(e.target) && !e.target.closest("[data-panel-anchor]") && !e.target.closest(".menu")) closePanel();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (openMenu) { closeMenu(); return; }
    if ($(".panel:not([hidden])")) { closePanel(); return; }
    const m = $$(".modal:not([hidden])").pop();
    if (m) m._close?.();
  });
  addEventListener("resize", () => closeMenu(false));
  // Rolar a página fecha o menu, mas não a rolagem que o próprio clique provoca
  // (o navegador rola o painel para mostrar o botão que ganhou foco).
  document.addEventListener("scroll", (e) => {
    if (openMenu && !openMenu.el.contains(e.target) && performance.now() - openMenu.at > 300) closeMenu(false);
  }, true);

  /* ───────────────────────── Painel flutuante ───────────────────────── */

  let openPanelEl = null;
  const closePanel = () => {
    const el = openPanelEl;
    openPanelEl = null;
    if (!el) return;
    el.classList.add("is-leaving");
    setTimeout(() => el.remove(), 120);
  };
  const panel = (anchor, html, { label } = {}) => {
    closePanel();
    const el = document.createElement("div");
    el.className = "panel";
    el.setAttribute("role", "dialog");
    if (label) el.setAttribute("aria-label", label);
    el.innerHTML = html;
    document.body.append(el);
    const r = anchor.getBoundingClientRect();
    const h = el.offsetHeight;
    el.style.left = Math.max(12, Math.min(r.left, innerWidth - el.offsetWidth - 12)) + "px";
    el.style.top = (r.top - h - 10 > 12 ? r.top - h - 10 : r.bottom + 10) + "px";
    P.hydrateIcons(el);
    openPanelEl = el;
    return el;
  };

  /* ───────────────────────── Modal ───────────────────────── */

  /** buttons: [{ label, variant: "primary"|"secondary"|"ghost"|"danger", onClick(modal) => false para manter aberto, id }] */
  const modal = ({ title, desc = "", body = "", buttons = [], wide = false, footLeft = "", onOpen } = {}) => {
    const last = document.activeElement;
    const m = document.createElement("div");
    m.className = "modal";
    const id = "m" + Math.random().toString(36).slice(2, 8);
    m.innerHTML = `
      <div class="modal__backdrop" data-close></div>
      <div class="modal__dialog ${wide ? "modal__dialog--wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="${id}-t" ${desc ? `aria-describedby="${id}-d"` : ""}>
        <div class="modal__head">
          <div><h2 class="modal__title" id="${id}-t">${esc(title)}</h2>${desc ? `<p class="modal__desc" id="${id}-d">${desc}</p>` : ""}</div>
          <button type="button" class="icon-btn" data-close aria-label="Fechar">${P.icon("x")}</button>
        </div>
        ${body ? `<div class="modal__body">${body}</div>` : ""}
        ${buttons.length ? `<div class="modal__foot ${footLeft ? "modal__foot--split" : ""}">${footLeft ? `<div class="hint">${footLeft}</div><div class="row">` : ""}${buttons.map((b, i) => `<button type="button" class="btn btn--${b.variant || "secondary"}" data-b="${i}" ${b.id ? `id="${b.id}"` : ""} ${b.disabled ? "disabled" : ""}>${b.icon ? P.icon(b.icon) : ""}${esc(b.label)}</button>`).join("")}${footLeft ? "</div>" : ""}</div>` : ""}
      </div>`;
    document.body.append(m);
    P.hydrateIcons(m);
    const close = () => {
      if (m.classList.contains("is-leaving")) return;
      m.classList.add("is-leaving");
      setTimeout(() => m.remove(), 180);
      last?.focus?.({ preventScroll: true });
    };
    m._close = close;
    m.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) close();
      const b = e.target.closest("[data-b]");
      if (b) { const r = buttons[+b.dataset.b].onClick?.(m); if (r !== false) close(); }
    });
    m.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const f = $$("button:not(:disabled), input, textarea, select, a[href], [tabindex]:not([tabindex='-1'])", m).filter((x) => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    });
    bindFields(m);
    onOpen?.(m);
    requestAnimationFrame(() => ($("[autofocus]", m) || $(".modal__body input, .modal__body textarea, .modal__foot .btn:last-child", m))?.focus());
    return m;
  };

  const confirmDialog = ({ title, desc, confirm = "Apagar", onConfirm, danger = true }) =>
    modal({ title, desc, buttons: [{ label: "Cancelar", variant: "secondary" }, { label: confirm, variant: danger ? "danger" : "primary", onClick: onConfirm }] });

  /* ───────────────────────── Campos ───────────────────────── */

  const updateCounter = (input) => {
    const field = input.closest(".field");
    const c = field && $(".counter", field);
    if (!c) return;
    const max = +input.getAttribute("maxlength") || +input.dataset.max || 0;
    const n = input.value.length;
    c.textContent = `${fmt(n)} / ${fmt(max)}`;
    c.classList.toggle("is-near", max && n > max * 0.9 && n <= max);
    c.classList.toggle("is-over", max && n > max);
  };
  const autoresize = (ta) => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, +(ta.dataset.max || 240)) + "px"; };

  function bindFields(root = document) {
    $$("input[maxlength], textarea[maxlength]", root).forEach((el) => {
      if (el._counted) return;
      el._counted = true;
      updateCounter(el);
      el.addEventListener("input", () => updateCounter(el));
    });
    $$("textarea[data-autoresize]", root).forEach((ta) => {
      if (ta._ar) return;
      ta._ar = true;
      ta.addEventListener("input", () => autoresize(ta));
    });
    // Abas e segmentos: [role=tablist] > [role=tab][aria-controls]
    $$("[role='tablist']", root).forEach((list) => {
      if (list._tabs) return;
      list._tabs = true;
      list.addEventListener("click", (e) => {
        const tab = e.target.closest("[role='tab']");
        if (!tab || !list.contains(tab)) return;
        selectTab(list, tab);
      });
      list.addEventListener("keydown", (e) => {
        if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
        const tabs = $$("[role='tab']", list);
        const i = tabs.indexOf(document.activeElement);
        const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
        next.focus();
        selectTab(list, next);
      });
    });
    $$(".dropzone", root).forEach((dz) => {
      if (dz._dz) return;
      dz._dz = true;
      ["dragenter", "dragover"].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.add("is-over"); }));
      ["dragleave", "drop"].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.remove("is-over"); }));
      dz.addEventListener("drop", (e) => { const n = e.dataTransfer?.files?.length || 0; if (n) toast(`${n} arquivo(s) prontos para enviar`, "paperclip"); });
    });
  }
  const selectTab = (list, tab) => {
    $$("[role='tab']", list).forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      const p = t.getAttribute("aria-controls");
      if (p) document.getElementById(p)?.toggleAttribute("hidden", !on);
    });
    list.dispatchEvent(new CustomEvent("tabchange", { detail: tab }));
  };

  /* ───────────────────────── Modelos ───────────────────────── */

  const model = (key) => D.models.find((m) => m.key === key) || D.models[0];
  const modelIcon = (m, cls = "") => {
    if (m.icon === "prisma" || m.icon === "prisma-plus") {
      const plus = m.icon === "prisma-plus";
      return `<span class="model-icon model-icon--crystal ${plus ? "model-icon--plus" : ""} ${cls}" aria-hidden="true">${P.crystal({ small: true })}${plus ? '<span class="model-icon__plus">+</span>' : ""}</span>`;
    }
    if (m.logo) return `<span class="model-icon model-icon--brand ${cls}" aria-hidden="true"><img src="${ASSETS}img/${esc(m.logo)}" alt="" width="22" height="22"></span>`;
    return `<span class="model-icon ${cls}" style="--tone:${m.tone}">${esc(m.mono)}</span>`;
  };

  const modelMenu = (anchor, current, onPick, { imagesOnly = false, modality = "text" } = {}) => {
    const vis = D.models.filter((m) => m.on && m.visible && m.modality === modality && (!imagesOnly || m.images)).sort((a, b) => a.order - b.order);
    const featured = vis.filter((m) => m.featured);
    const others = vis.filter((m) => !m.featured);
    const openOthers = imagesOnly || !model(current).featured || store.get("othersOpen", false);
    let oi = 0;
    const opt = (m) => `<button type="button" role="option" class="model-option" style="--i:${oi++}" data-key="${m.key}" aria-selected="${m.key === current}">${modelIcon(m)}<span class="model-option__body"><span class="model-option__name">${esc(m.name)}</span><span class="model-option__desc">${esc(m.desc)}</span></span>${P.icon("check", "model-option__check i--sm")}</button>`;
    const html = `<div role="listbox" aria-label="Modelo">${featured.map(opt).join("")}
      ${featured.length && others.length ? '<div class="menu__sep"></div>' : ""}
      <button type="button" class="model-group__toggle" aria-expanded="${openOthers}">${P.icon("chevron-down")}Outros</button>
      <div class="model-group" ${openOthers ? "" : "hidden"}>${others.map(opt).join("")}</div></div>`;
    const el = menu(anchor, [], { html, className: "model-menu", label: "Modelo", align: "end" });
    if (!el) return;
    el.addEventListener("click", (e) => {
      const t = e.target.closest(".model-group__toggle");
      if (t) {
        const open = t.getAttribute("aria-expanded") !== "true";
        t.setAttribute("aria-expanded", open);
        t.nextElementSibling.hidden = !open;
        store.set("othersOpen", open);
        place(el, anchor, { align: "end" });
        return;
      }
      const o = e.target.closest(".model-option");
      if (o) { closeMenu(); onPick(o.dataset.key); }
    });
  };

  /* ───────────────────────── Composer ───────────────────────── */

  const SOON = "Pós-MVP";
  const composer = (root, { onSend, placeholder, model: startModel = "asimov", project = null, lockedProject = false, skills = [], agent = null } = {}) => {
    const st = { model: startModel, mode: model(startModel).modality === "image" ? "image" : "text", files: [], skills: [...skills], agent, project, busy: false, loading: 0 };
    let lastTextModel = st.mode === "text" ? startModel : "asimov";
    let lastImageModel = st.mode === "image" ? startModel : "asimov-image";
    const textPlaceholder = placeholder || "O que vamos criar hoje?";
    root.classList.add("composer");
    root.innerHTML = `
      <div class="composer__context" aria-live="polite"></div>
      <div class="composer__image-warning" role="status" aria-live="polite" hidden></div>
      <label class="sr-only" for="composer-input">Mensagem para o assistente</label>
      <textarea id="composer-input" class="composer__input" rows="1" placeholder="${esc(placeholder || "O que vamos criar hoje?")}" aria-describedby="composer-hint"></textarea>
      <div class="composer__bar">
        <button type="button" class="composer__tool" data-act="more" aria-haspopup="menu" aria-expanded="false" aria-label="Mais opções" data-panel-anchor>${P.icon("plus")}</button>
        <button type="button" class="icon-btn" data-act="attach" aria-label="Anexar arquivo ou imagem">${P.icon("paperclip")}</button>
        <button type="button" class="icon-btn composer__image-toggle" data-act="image-mode" aria-label="Criar imagem" aria-pressed="false" title="Criar imagem">${P.icon("image")}</button>
        <input type="file" hidden multiple data-file>
        <span class="composer__spacer"></span>
        <button type="button" class="model-btn" data-act="model" aria-haspopup="listbox" aria-expanded="false"></button>
        <button type="submit" class="send-btn" data-act="send" aria-label="Enviar" disabled>${P.icon("arrow-up")}</button>
      </div>`;
    const ta = $(".composer__input", root);
    const send = $("[data-act='send']", root);
    const ctx = $(".composer__context", root);
    const fileInput = $("[data-file]", root);

    const imageToggle = $("[data-act='image-mode']", root);
    const warning = $(".composer__image-warning", root);
    const incompatibleImages = () => st.files.some((f) => f.image) && !model(st.model).images;

    const renderModel = () => {
      const m = model(st.model);
      const b = $("[data-act='model']", root);
      b.innerHTML = `${modelIcon(m)}<span>${esc(m.name)}</span>${P.icon("chevron-down")}`;
      b.setAttribute("aria-label", `Modelo: ${m.name}`);
    };
    const sync = () => {
      const imageMode = st.mode === "image";
      imageToggle.setAttribute("aria-pressed", String(imageMode));
      imageToggle.setAttribute("aria-label", imageMode ? "Sair da criação de imagem" : "Criar imagem");
      imageToggle.title = imageMode ? "Sair da criação de imagem" : "Criar imagem";
      imageToggle.disabled = st.busy;
      ta.placeholder = imageMode ? "Descreva a imagem que você quer criar…" : textPlaceholder;
      root.classList.toggle("is-image-mode", imageMode);
      const blocked = incompatibleImages();
      warning.hidden = !blocked;
      warning.innerHTML = blocked ? `${P.icon("info")}<div class="composer__image-warning-body"><p><strong>${esc(model(st.model).name)} não lê imagens.</strong> Escolha um modelo compatível ou remova a imagem e descreva o conteúdo em texto.</p><button type="button" class="btn btn--secondary btn--sm" data-image-model>Escolher modelo com imagens ${P.icon("arrow-right")}</button></div>` : "";
      ta.setAttribute("aria-describedby", blocked ? "composer-hint composer-image-warning" : "composer-hint");
      warning.id = "composer-image-warning";
      send.disabled = !st.busy && (blocked || st.loading > 0 || (!ta.value.trim() && !st.files.length));
      send.classList.toggle("send-btn--stop", st.busy);
      send.innerHTML = P.icon(st.busy ? "stop" : "arrow-up");
      send.setAttribute("aria-label", st.busy ? "Parar resposta" : imageMode ? "Gerar imagem" : "Enviar");
    };
    const renderCtx = () => {
      const pills = [];
      if (st.project) { const p = D.projects.find((x) => x.id === st.project); if (p) pills.push(`<span class="ctx-pill">${P.icon("folder")}${esc(p.name)}${lockedProject ? "" : `<button type="button" data-rm="project" aria-label="Tirar do projeto">${P.icon("x")}</button>`}</span>`); }
      if (st.agent) pills.push(`<span class="ctx-pill">${P.icon("bot")}${esc(st.agent.name)}<button type="button" data-rm="agent" aria-label="Tirar agente">${P.icon("x")}</button></span>`);
      st.skills.forEach((s, i) => pills.push(`<span class="ctx-pill">${P.icon("skill")}${esc(s)}<button type="button" data-rm="skill" data-i="${i}" aria-label="Desativar skill ${esc(s)}">${P.icon("x")}</button></span>`));
      st.files.forEach((f, i) => pills.push(`<span class="file-chip" title="${esc(f.name)}"><span class="file-chip__icon">${f.image && f.preview ? `<img src="${esc(f.preview)}" alt="Prévia de ${esc(f.name)}">` : P.icon(f.image ? "image" : "file")}</span><span class="file-chip__text"><span class="file-chip__name">${esc(f.name)}</span><span class="file-chip__meta">${esc(f.meta)}</span></span><button type="button" class="icon-btn icon-btn--sm file-chip__remove" data-rm="file" data-i="${i}" aria-label="Remover ${esc(f.name)}">${P.icon("x")}</button></span>`));
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

    const doSend = () => {
      if (st.busy) { api.stop?.(); return; }
      const text = ta.value.trim();
      if (st.loading || incompatibleImages() || (!text && !st.files.length)) return;
      const accepted = onSend?.({ text, files: [...st.files], model: st.model, skills: [...st.skills], agent: st.agent, project: st.project });
      if (accepted === false) return;
      ta.value = "";
      st.files = [];
      autoresize(ta);
      renderCtx();
    };

    ta.addEventListener("input", () => { autoresize(ta); sync(); });
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); doSend(); }
    });
    root.addEventListener("submit", (e) => { e.preventDefault(); doSend(); });
    send.addEventListener("click", (e) => { e.preventDefault(); doSend(); });
    $("[data-act='attach']", root).addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async () => {
      const selected = [...fileInput.files];
      fileInput.value = "";
      st.loading++;
      sync();
      const attachments = await Promise.all(selected.map(async (f) => {
        const image = f.type.startsWith("image/");
        const size = f.size >= 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`
          : `${Math.max(1, Math.round(f.size / 1024))} KB`;
        let preview = null;
        if (image) {
          try {
            preview = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(f);
            });
          } catch {
            toast(`Não foi possível abrir ${f.name}. Tente anexar novamente.`, "info");
            return null;
          }
        }
        return { name: f.name, meta: `${image ? "Imagem" : (f.name.split(".").pop() || "Arquivo").toUpperCase()} · ${size}`, image, preview };
      }));
      st.files.push(...attachments.filter(Boolean));
      st.loading--;
      renderCtx();
    });
    const pickModel = (k) => {
      const prev = st.model;
      st.model = k;
      st.mode = model(k).modality === "image" ? "image" : "text";
      if (st.mode === "image") lastImageModel = k;
      else lastTextModel = k;
      renderModel();
      sync();
      if (k !== prev) api.onModel?.(k);
      ta.focus();
    };
    $("[data-act='model']", root).addEventListener("click", (e) => modelMenu(e.currentTarget, st.model, pickModel, { modality: st.mode }));
    warning.addEventListener("click", (e) => {
      const button = e.target.closest("[data-image-model]");
      if (button) modelMenu(button, st.model, pickModel, { imagesOnly: true, modality: st.mode });
    });

    imageToggle.addEventListener("click", () => {
      if (st.busy) return;
      closeMenu();
      pickModel(st.mode === "image" ? lastTextModel : lastImageModel);
    });

    const moreBtn = $("[data-act='more']", root);
    moreBtn.addEventListener("click", () => {
      if (openPanelEl) { closePanel(); moreBtn.setAttribute("aria-expanded", "false"); return; }
      menu(moreBtn, [
        { label: "Enviar arquivo", icon: "upload", onClick: () => fileInput.click() },
        { label: "Prompts e contextos", icon: "book-open", onClick: () => promptsPanel(moreBtn, ta) },
        { label: "Conversar com um agente", icon: "bot", onClick: () => agentPicker((a) => { st.agent = a; renderCtx(); toast(`${a.name} selecionado`, "bot"); }, { composer: root }) },
        { label: "Skills", icon: "skill", onClick: () => skillsPanel(moreBtn, st, renderCtx) },
        { sep: true },
        { label: "Adicionar ao projeto", icon: "folder-plus", onClick: () => projectPicker((p) => { st.project = p.id; renderCtx(); toast(`Conversa no projeto ${p.name}`, "folder"); }) },
      ], { label: "Mais opções" });
    });

    renderModel();
    renderCtx();
    const api = {
      el: root, input: ta, state: st,
      setBusy(b) { st.busy = b; root.classList.toggle("is-busy", b); sync(); },
      setText(t) { ta.value = t; autoresize(ta); sync(); ta.focus(); ta.setSelectionRange(t.length, t.length); },
      setModel(k) { pickModel(k); },
      stop: null, onModel: null,
    };
    return api;
  };

  /* Painéis do “+” */
  const promptsPanel = (anchor, ta) => {
    const saved = store.get("prompts", []);
    const el = panel(anchor, `
      <div class="panel__head"><div class="segmented" role="tablist" aria-label="Tipo">
        <button type="button" role="tab" class="segmented__btn" aria-selected="true" aria-controls="pp-prompts">Prompts</button>
        <button type="button" role="tab" class="segmented__btn" aria-selected="false" aria-controls="pp-ctx" tabindex="-1">Contextos</button>
      </div><button type="button" class="icon-btn icon-btn--sm" data-x aria-label="Fechar"><i class="i" data-icon="x"></i></button></div>
      <div class="panel__body">
        <div id="pp-prompts">${saved.length ? saved.map((p, i) => `<button type="button" class="pick-row" data-use="${i}"><span class="icon-chip icon-chip--sm"><i class="i" data-icon="bookmark"></i></span><span class="pick-row__body"><span class="pick-row__title">${esc(p.slice(0, 48))}${p.length > 48 ? "…" : ""}</span><span class="pick-row__desc">${esc(p)}</span></span></button>`).join("")
          : `<div class="empty empty--center"><span class="icon-chip empty__icon"><i class="i" data-icon="bookmark"></i></span><p class="empty__title">Nenhum prompt salvo</p><p class="empty__text">Escreva no campo e use “Salvar o texto do campo” para reaproveitar depois.</p></div>`}</div>
        <div id="pp-ctx" hidden><div class="empty empty--center"><span class="icon-chip empty__icon"><i class="i" data-icon="book-open"></i></span><p class="empty__title">Nenhum contexto salvo</p><p class="empty__text">Contextos são textos de apoio (sobre você, a empresa, um cliente) que entram na conversa sem você colar de novo.</p></div></div>
      </div>
      <div class="panel__foot"><button type="button" class="btn btn--secondary btn--sm btn--block" data-save ${ta.value.trim() ? "" : "disabled"}><i class="i" data-icon="bookmark"></i>Salvar o texto do campo</button>${ta.value.trim() ? "" : `<p class="hint mt-8" style="text-align:center">Escreva no campo o texto que você quer salvar.</p>`}</div>`, { label: "Prompts e contextos" });
    bindFields(el);
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-x]")) closePanel();
      const u = e.target.closest("[data-use]");
      if (u) { ta.value = saved[+u.dataset.use]; ta.dispatchEvent(new Event("input")); closePanel(); ta.focus(); }
      if (e.target.closest("[data-save]")) { saved.unshift(ta.value.trim()); store.set("prompts", saved.slice(0, 30)); closePanel(); toast("Prompt salvo", "bookmark"); }
    });
  };

  const skillsPanel = (anchor, st, after) => {
    const official = D.gallery.skills;
    const mine = D.mySkills;
    const row = (s) => `<label class="check" style="padding:9px 8px;border-radius:8px"><input type="checkbox" value="${esc(s.name)}" ${st.skills.includes(s.name) ? "checked" : ""}><span class="check__text"><span class="check__title">${esc(s.name)}</span><span class="check__desc">${esc(s.desc)}</span></span></label>`;
    const el = panel(anchor, `
      <div class="panel__head"><div><p class="panel__title">Skills</p><p class="hint" data-count>${st.skills.length} de 5 ativas</p></div><button type="button" class="icon-btn icon-btn--sm" data-x aria-label="Fechar"><i class="i" data-icon="x"></i></button></div>
      <div class="panel__body">
        <p class="menu__label">Suas skills</p>
        ${mine.length ? mine.map(row).join("") : `<div class="empty"><p class="empty__text">Você ainda não criou nenhuma skill.</p><a class="btn btn--secondary btn--sm" href="skill-nova.html">Criar skill</a></div>`}
        <p class="menu__label" style="margin-top:6px">Oficiais da Asimov</p>
        ${official.map(row).join("")}
      </div>`, { label: "Skills" });
    el.addEventListener("click", (e) => { if (e.target.closest("[data-x]")) closePanel(); });
    el.addEventListener("change", (e) => {
      const cb = e.target;
      if (cb.checked && st.skills.length >= 5) { cb.checked = false; toast("Até 5 skills por conversa", "info"); return; }
      st.skills = cb.checked ? [...st.skills, cb.value] : st.skills.filter((x) => x !== cb.value);
      $("[data-count]", el).textContent = `${st.skills.length} de 5 ativas`;
      after();
    });
  };

  const agentPicker = (onPick, { composer: composerRoot } = {}) => {
    if (!composerRoot) return;
    composerRoot.parentElement.querySelector(".agent-browser")?.remove();
    const el = document.createElement("section");
    el.className = "card agent-browser";
    el.setAttribute("aria-label", "Escolher agente");
    const agents = [...D.myAgents.map((a) => ({ ...a, source: "mine" })), ...D.gallery.agents.map((a) => ({ ...a, source: "asimov" }))];
    const categories = [...new Set(agents.flatMap((a) => a.categories || [a.category]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    let filter = "all";
    el.innerHTML = `
      <div class="panel__head">
        <div class="row" style="gap:8px">${P.icon("bot", "i--sm")}<h2 class="panel__title">Conversar com um agente</h2></div>
        <button type="button" class="icon-btn icon-btn--sm" data-close-agents aria-label="Fechar seleção de agentes">${P.icon("x")}</button>
      </div>
      <div class="agent-browser__tools">
        <div class="agent-browser__search">${P.icon("search", "i--sm")}<input class="input" type="search" data-agent-search aria-label="Buscar agentes" placeholder="Buscar agentes…"></div>
        <div class="agent-browser__filters" role="group" aria-label="Filtrar agentes">
          ${[["all", "Todos"], ["asimov", "Asimov"], ["favorites", "Favoritos"]].map(([value, label]) => `<button type="button" class="btn btn--secondary btn--sm" data-agent-filter="${value}" aria-pressed="${value === "all"}">${label}</button>`).join("")}
        </div>
        <select class="select" data-agent-category aria-label="Filtrar por categoria"><option value="">Todas as categorias</option>${categories.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("")}</select>
      </div>
      <p class="hint agent-browser__count" data-agent-count role="status" aria-live="polite"></p>
      <div class="agent-browser__list" data-agent-list></div>`;
    composerRoot.before(el);
    const search = $("[data-agent-search]", el);
    const category = $("[data-agent-category]", el);
    const key = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
    const render = () => {
      const query = key(search.value.trim());
      const matches = agents.filter((a) => (filter === "all" || a.source === filter || (filter === "favorites" && a.fav))
        && (!category.value || (a.categories || [a.category]).includes(category.value))
        && key(`${a.name} ${a.desc} ${(a.categories || [a.category]).filter(Boolean).join(" ")}`).includes(query));
      $("[data-agent-count]", el).textContent = `${matches.length} ${matches.length === 1 ? "agente disponível" : "agentes disponíveis"}`;
      $("[data-agent-list]", el).innerHTML = matches.length ? matches.map((a) => galleryCard(a, "agents", { inline: true })).join("") : `<div class="empty empty--center"><span class="icon-chip">${P.icon("search")}</span><p class="empty__title">Nenhum agente encontrado</p><p class="empty__text">Tente outra busca ou ajuste os filtros.</p><button type="button" class="btn btn--secondary btn--sm" data-reset-agents>Limpar filtros</button></div>`;
    };
    const events = new AbortController();
    const close = () => { events.abort(); el.remove(); $(".composer__input", composerRoot)?.focus({ preventScroll: true }); };
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-close-agents]")) { close(); return; }
      const selectedFilter = e.target.closest("[data-agent-filter]");
      if (selectedFilter) {
        filter = selectedFilter.dataset.agentFilter;
        $$("[data-agent-filter]", el).forEach((b) => b.setAttribute("aria-pressed", String(b === selectedFilter)));
        render();
      }
      if (e.target.closest("[data-reset-agents]")) {
        search.value = ""; category.value = ""; filter = "all";
        $$("[data-agent-filter]", el).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.agentFilter === "all")));
        render(); search.focus();
      }
      const favorite = e.target.closest("[data-fav]");
      if (favorite) {
        const agent = agents.find((a) => a.id === favorite.dataset.fav);
        agent.fav = !agent.fav;
        const source = [...D.myAgents, ...D.gallery.agents].find((a) => a.id === agent.id);
        if (source) source.fav = agent.fav;
        favorite.setAttribute("aria-pressed", String(agent.fav));
        favorite.setAttribute("aria-label", `${agent.fav ? "Tirar dos favoritos" : "Favoritar"} ${agent.name}`);
        if (filter === "favorites") render();
      }
      const button = e.target.closest("[data-agent]");
      if (button) {
        const agent = [...D.myAgents, ...D.gallery.agents].find((a) => a.id === button.dataset.agent);
        close(); onPick(agent);
      }
    });
    search.addEventListener("input", render);
    category.addEventListener("change", render);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && el.isConnected) { e.preventDefault(); close(); }
    }, { signal: events.signal });
    render();
    search.focus({ preventScroll: true });
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  const projectPicker = (onPick, { title = "Adicionar ao projeto", desc = "Escolha o projeto. O contexto e os arquivos dele passam a valer para esta conversa." } = {}) => {
    const m = modal({
      title, desc,
      body: D.projects.map((p) => `<button type="button" class="pick-row" data-project="${p.id}"><span class="icon-chip icon-chip--sm tone-${p.tone}" style="--tone:var(--tone-${p.tone});--tone-dark:var(--tone-${p.tone}-dark)">${P.icon("folder")}</span><span class="pick-row__body"><span class="pick-row__title">${esc(p.name)}</span><span class="pick-row__desc">${p.conversations} ${p.conversations === 1 ? "conversa" : "conversas"} · ${p.files ? p.files + " arquivos" : "Nenhum arquivo"}</span></span>${P.icon("chevron-right")}</button>`).join("")
        + `<a class="pick-row" href="projetos.html?novo=1"><span class="icon-chip icon-chip--sm">${P.icon("plus")}</span><span class="pick-row__body"><span class="pick-row__title">Novo projeto</span></span></a>`,
      buttons: [{ label: "Cancelar" }],
    });
    m.addEventListener("click", (e) => {
      const b = e.target.closest("[data-project]");
      if (!b) return;
      m._close();
      onPick(D.projects.find((p) => p.id === b.dataset.project));
    });
  };

  /* ───────────────────────── Card da galeria ───────────────────────── */

  // Mesmo padrão do card de “Seus agentes”: avatar ao lado do nome, autor e categoria
  // numa linha, descrição e um rodapé com avaliação e ação.
  const toneVars = (t) => `--tone:var(--tone-${t});--tone-dark:var(--tone-${t}-dark)`;
  const SKILL_TONE = { Produtividade: "cyan", Escrita: "blue", Automação: "rose", Design: "violet", Estudos: "teal", Reuniões: "amber", Programação: "green", Dados: "orange" };
  const galleryCard = (it, type, { inline = false } = {}) => {
    const tone = it.tone || SKILL_TONE[it.category] || "teal";
    const mark = type === "agents"
      ? `<span class="avatar avatar--lg avatar--square tone-${tone}" style="${toneVars(tone)}">${esc(it.initials)}</span>`
      : `<span class="icon-chip" style="width:44px;height:44px;border-radius:10px">${P.icon("skill", "i--lg")}</span>`;
    return `
      <article class="tone-card g-card" style="${toneVars(tone)}">
        <div class="g-card__head">
          ${mark}
          <div class="grow">
            <h3 class="g-card__title">${inline ? `<button type="button" class="agent-browser__choose" data-agent="${esc(it.id)}" aria-label="Conversar com ${esc(it.name)}">${esc(it.name)}</button>` : `<a href="galeria-item.html?id=${it.id}">${esc(it.name)}</a>`}</h3>
            <p class="g-card__by">${inline && it.source === "mine" ? `<span>Seu agente</span>` : `<span class="by" style="font-size:12px">por <strong>Asimov</strong>${P.verified()}</span>`}${it.category || it.categories?.length ? `<span aria-hidden="true">·</span>${esc((it.categories || [it.category]).join(" · "))}` : ""}</p>
          </div>
          <button type="button" class="icon-btn icon-btn--sm fav-btn g-card__action" data-fav="${it.id}" aria-pressed="${Boolean(it.fav)}" aria-label="${it.fav ? "Tirar dos favoritos" : "Favoritar"} ${esc(it.name)}">${P.icon("heart")}</button>
        </div>
        ${inline ? `<div class="g-card__content"><p class="g-card__desc">${esc(it.desc)}</p></div>` : `
        <p class="g-card__desc">${esc(it.desc)}</p>
        <div class="g-card__foot">
          <span class="g-card__rating">${it.rating ? `${P.icon("star")}${it.rating}` : "Sem avaliações ainda"}</span>
          ${type === "agents"
            ? `<a class="btn btn--primary btn--sm" href="chat.html?${new URLSearchParams({ q: "Oi! Vamos começar?", agent: it.id })}">Conversar</a>`
            : `<button type="button" class="btn btn--secondary btn--sm" data-copy-skill="${it.id}">${P.icon("copy")}Copiar</button>`}
        </div>`}
      </article>`;
  };

  const platformReview = () => {
    modal({
      title: "Avaliação da plataforma",
      desc: "De 0 a 10, quanto você recomendaria o Prisma a um colega?",
      body: `<fieldset class="platform-review" style="border:0;padding:0;margin:0"><legend class="sr-only">Nota de recomendação</legend>
        <div class="platform-review__scores">${Array.from({ length: 11 }, (_, score) => `<label class="platform-review__score"><input type="radio" name="platform-score" value="${score}" aria-label="Nota ${score}"><span>${score}</span></label>`).join("")}</div>
        <div class="row row--between mt-8"><span class="hint">Nada provável</span><span class="hint">Muito provável</span></div>
        </fieldset>
        <div class="field mt-24"><label class="label" for="platform-comment">O que podemos melhorar? <small>(opcional)</small></label><textarea id="platform-comment" class="textarea" rows="3" maxlength="2000" placeholder="Conte como foi sua experiência…"></textarea></div>
        <p class="hint mt-16">Neste protótipo, a avaliação fica salva apenas neste navegador.</p>`,
      buttons: [{ label: "Cancelar" }, { label: "Salvar avaliação", variant: "primary", id: "save-platform-review", disabled: true, onClick: (m) => {
        const score = $("input[name='platform-score']:checked", m);
        if (!score) return false;
        store.set("platformReview", { score: Number(score.value), comment: $("#platform-comment", m).value.trim(), date: new Date().toISOString() });
        toast("Avaliação salva neste navegador. Obrigado!", "check-circle");
      } }],
      onOpen: (m) => m.addEventListener("change", () => { $("#save-platform-review", m).disabled = !$("input[name='platform-score']:checked", m); }),
    });
  };

  /* ───────────────────────── Shell ───────────────────────── */

  const NAV = [
    { id: "projetos", label: "Projetos", icon: "folder", href: "projetos.html" },
    { id: "skills", label: "Skills", icon: "skill", href: "skills.html" },
    { id: "agentes", label: "Agentes", icon: "bot", href: "agentes.html" },
    { id: "galeria", label: "Galeria", icon: "gallery", href: "galeria.html" },
    { id: "admin", label: "Admin", icon: "shield", href: "admin-modelos.html", admin: true },
  ];

  const convList = (active) => D.conversations.map((g) => `
    <section class="convs__group" aria-labelledby="cg-${esc(g.group)}">
      <h2 class="convs__label" id="cg-${esc(g.group)}">${esc(g.group)}</h2>
      <ul role="list">${g.items.map((c) => `
        <li class="conv ${c.id === active ? "is-active" : ""}" data-id="${c.id}">
          <a class="conv__link" href="chat.html?id=${c.id}" ${c.id === active ? 'aria-current="page"' : ""} title="${esc(c.title)}">${esc(c.title)}</a>
          <button type="button" class="conv__more" aria-label="Mais ações para “${esc(c.title)}”" aria-haspopup="menu" aria-expanded="false">${P.icon("more", "i--sm")}</button>
        </li>`).join("")}</ul>
    </section>`).join("");

  const shell = () => {
    const app = $(".app");
    if (!app || app.dataset.shell === "off") return;
    const page = app.dataset.page;
    const active = app.dataset.conv || "";
    const u = D.user;
    const pct = Math.min(100, (u.credits.used / u.credits.limit) * 100);
    const aside = document.createElement("aside");
    aside.className = "sidebar";
    aside.id = "sidebar";
    aside.setAttribute("aria-label", "Navegação");
    aside.innerHTML = `
      <div class="sidebar__panel">
        <div class="sidebar__head">
          <a class="brand" href="index.html" aria-label="Asimov Prisma, início">
            <img class="brand__logo" src="${ASSETS}img/asimov-logo.svg" alt="" width="64" height="20">
            <span class="brand__product">Prisma</span>
            <span class="brand__mark">${P.crystal({ small: true })}</span>
          </a>
          <button type="button" class="icon-btn sidebar__collapse" data-collapse aria-label="Recolher navegação" aria-controls="sidebar" aria-expanded="true">${P.icon("sidebar")}</button>
        </div>
        <div class="sidebar__new"><a class="new-chat" href="index.html">${P.icon("new-chat")}<span class="new-chat__label">Novo chat</span></a></div>
        <nav class="sidebar__section" aria-label="Seções">
          <ul class="nav-list" role="list">${NAV.filter((n) => !n.admin || u.role === "ADMIN").map((n) => `
            <li><a class="nav-item" href="${n.href}" ${n.id === page ? 'aria-current="page"' : ""} title="${n.label}">${P.icon(n.icon)}<span class="nav-item__label">${n.label}</span></a></li>`).join("")}
          </ul>
        </nav>
        <div class="sidebar__divider"></div>
        <nav class="convs" aria-label="Conversas">${convList(active)}</nav>
        <div class="sidebar__spacer"></div>
        <div class="sidebar__foot">
          <ul class="nav-list" role="list">
            <li><a class="nav-item" href="https://hub.asimov.academy" target="_blank" rel="noopener" title="Cursos (abre em nova aba)">${P.icon("book")}<span class="nav-item__label">Cursos</span>${P.icon("external", "nav-item__ext")}</a></li>
          </ul>
          <button type="button" class="credits" data-credits aria-expanded="false" aria-haspopup="dialog" aria-label="Consumo de créditos: ${Math.round(pct)}% usados na semana. Ver limites">
            <span class="credits__row"><span class="credits__title">Consumo de créditos</span><span class="credits__value">${Math.round(pct)}% usado</span></span>
            <span class="meter meter--thin ${pct > 90 ? "meter--danger" : pct > 70 ? "meter--warn" : ""}" aria-hidden="true"><span class="meter__fill" style="width:${pct}%"></span></span>
          </button>
          <button type="button" class="user-btn ${page === "perfil" ? "is-current" : ""}" data-user aria-haspopup="menu" aria-expanded="false" aria-label="Conta de ${esc(u.name)}">
            <span class="avatar avatar--neutral">${esc(u.initials)}</span>
            <span class="user-btn__text"><span class="user-btn__name">${esc(u.nickname || u.name)}</span><span class="user-btn__mail">${esc(u.email)}</span></span>
            ${P.icon("chevron-up-down", "i--sm")}
          </button>
        </div>
      </div>`;
    app.prepend(aside);

    const top = document.createElement("header");
    top.className = "topbar";
    top.innerHTML = `
      <button type="button" class="icon-btn" data-open-nav aria-label="Abrir menu" aria-controls="sidebar" aria-expanded="false">${P.icon("menu")}</button>
      <a class="brand" href="index.html" aria-label="Asimov Prisma, início"><img class="brand__logo" src="${ASSETS}img/asimov-logo.svg" alt="" width="64" height="20"><span class="brand__product">Prisma</span></a>
      <a class="icon-btn" href="index.html" aria-label="Novo chat">${P.icon("new-chat")}</a>`;
    $(".main", app).prepend(top);

    const scrim = document.createElement("div");
    scrim.className = "scrim";
    app.append(scrim);

    // Recolher (desktop) e abrir (mobile)
    const collapseBtn = $("[data-collapse]", aside);
    const setCollapsed = (c) => {
      app.classList.toggle("is-collapsed", c);
      collapseBtn.setAttribute("aria-expanded", !c);
      collapseBtn.setAttribute("aria-label", c ? "Expandir navegação" : "Recolher navegação");
      store.set("collapsed", c);
    };
    setCollapsed(store.get("collapsed", false));
    collapseBtn.addEventListener("click", () => setCollapsed(!app.classList.contains("is-collapsed")));
    const openBtn = $("[data-open-nav]", top);
    const setNav = (o) => { app.classList.toggle("nav-open", o); openBtn.setAttribute("aria-expanded", o); if (o) $(".new-chat", aside).focus(); };
    openBtn.addEventListener("click", () => setNav(true));
    scrim.addEventListener("click", () => setNav(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && app.classList.contains("nav-open")) setNav(false); });

    $("[data-credits]", aside).addEventListener("click", (e) => {
      const popover = menu(e.currentTarget, [{ onClick: () => {} }], {
        side: "top",
        className: "credits-popover",
        label: "Consumo de créditos",
        html: `<div class="credits-popover__head"><h2>Seus créditos</h2><button type="button" class="icon-btn" data-i="0" aria-label="Fechar">${P.icon("x", "i--sm")}</button></div>
          <div class="credits-popover__usage"><strong>${Math.round(pct)}<span>%</span></strong><span>usado nesta semana</span></div>
          <div class="meter meter--thin" aria-hidden="true"><span class="meter__fill" style="width:${pct}%"></span></div>
          <p class="credits-popover__spent">${fmt(u.credits.used)} de ${fmt(u.credits.limit)} créditos</p>
          <dl class="credits-popover__limits"><div><dt>Limite diário</dt><dd>${fmt(u.credits.dailyLimit)}<span>créditos / dia</span></dd></div><div><dt>Limite semanal</dt><dd>${fmt(u.credits.limit)}<span>créditos / semana</span></dd></div></dl>
          <p class="credits-popover__renewal">Renova em ${esc(u.credits.renews)}</p>`,
      });
      if (popover) {
        popover.setAttribute("role", "dialog");
        $("[data-i]", popover).focus({ preventScroll: true });
      }
    });

    // Conta
    $("[data-user]", aside).addEventListener("click", (e) => menu(e.currentTarget, [
      { heading: u.email },
      { label: "Configurações", icon: "settings", onClick: () => (location.href = "perfil.html") },
      { label: "Ajuda", icon: "info", onClick: () => (location.href = "https://link.asimov.academy/transferencia-CS") },
      { label: "Avaliação da plataforma", icon: "star", onClick: platformReview },
      { sep: true },
      { label: "Sair", icon: "logout", onClick: () => (location.href = "login.html") },
    ], { label: "Conta", side: "top" }));

    // Ações da conversa
    $(".convs", aside).addEventListener("click", (e) => {
      const b = e.target.closest(".conv__more");
      if (!b) return;
      const li = b.closest(".conv");
      const link = $(".conv__link", li);
      menu(b, [
        { label: "Renomear", icon: "pencil", onClick: () => renameConv(li, link) },
        { label: "Mover para projeto", icon: "folder", onClick: () => projectPicker((p) => toast(`Movida para ${p.name}`, "folder"), { title: "Mover para projeto", desc: "A conversa passa a usar o contexto e os arquivos do projeto." }) },
        { label: "Baixar conversa (.md)", icon: "download", onClick: () => toast("Download começou", "download") },
        { label: "Compartilhar por link", icon: "link", onClick: () => toast("Link copiado", "link") },
        { sep: true },
        { label: "Apagar", icon: "trash", danger: true, onClick: () => confirmDialog({
          title: "Apagar conversa?",
          desc: `“${esc(link.textContent)}” e as mensagens dela somem para sempre.`,
          onConfirm: () => { li.remove(); toast("Conversa apagada", "trash"); },
        }) },
      ], { label: "Mais ações" });
    });
  };

  const renameConv = (li, link) => {
    const input = document.createElement("input");
    input.className = "conv__rename";
    input.value = link.textContent;
    input.setAttribute("aria-label", "Novo nome da conversa");
    input.maxLength = 120;
    link.hidden = true;
    li.querySelector(".conv__more").hidden = true;
    li.prepend(input);
    input.focus();
    input.select();
    const done = (save) => {
      if (!input.isConnected) return;
      if (save && input.value.trim()) { link.textContent = input.value.trim(); link.title = link.textContent; toast("Conversa renomeada", "pencil"); }
      input.remove();
      link.hidden = false;
      li.querySelector(".conv__more").hidden = false;
    };
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") done(true); if (e.key === "Escape") { e.stopPropagation(); done(false); } });
    input.addEventListener("blur", () => done(true));
  };

  /* Ações fixas que grudam no topo ganham borda */
  const stickyWatch = () => {
    $$(".sticky-actions").forEach((bar) => {
      const sentinel = document.createElement("div");
      sentinel.style.height = "1px";
      bar.before(sentinel);
      new IntersectionObserver(([e]) => bar.classList.toggle("is-stuck", !e.isIntersecting)).observe(sentinel);
    });
  };

  /* Liga [data-soon] a um aviso; [data-toast] a um toast */
  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-soon]");
    if (s) { e.preventDefault(); toast(`${s.dataset.soon || "Esse recurso"} chega depois do MVP`, "clock"); }
    const t = e.target.closest("[data-toast]");
    if (t) toast(t.dataset.toast, t.dataset.toastIcon || "check-circle");
  });

  Object.assign(P, {
    $, $$, esc, fmt, store, toast, menu, closeMenu, panel, closePanel, modal, confirm: confirmDialog,
    bindFields, model, modelIcon, modelMenu, composer, galleryCard, agentPicker, projectPicker, SOON,
  });

  // Os scripts ficam no fim do <body>: o HTML da página já existe aqui. Cada
  // página roda o próprio script depois deste e chama Prisma.ready() no fim.
  shell();
  P.ready = (root = document) => { P.hydrateIcons(root); bindFields(root); stickyWatch(); P.motion?.init(); };
})();
