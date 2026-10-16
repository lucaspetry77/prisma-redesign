/* Asimov Prisma · componentes de interface (window.Prisma)
 * toast · menu/popover · tooltip · modal · confirm · sheet · indicadores de abas ·
 * número que conta · estados (carregando, vazio, erro) · validação · botão com estado.
 * Especificação de cada interação: docs/redesign/03-interacoes.md.
 */
(() => {
  const P = window.Prisma;
  const { $, $$, esc, fmt, reduced, store } = P;
  const icon = (n, c) => P.icon(n, c);

  /* ───────────────────────── Toast ─────────────────────────
   * toast(msg, { icon, action: { label, onClick }, danger, duration }) — até 3 visíveis, o novo na frente; todos têm × para fechar. */
  const toast = (msg, opts = {}) => {
    if (typeof opts === "string") opts = { icon: opts };
    let host = $(".toasts");
    if (!host) {
      host = document.createElement("section");
      host.className = "toasts";
      host.setAttribute("aria-label", "Notificações");
      host.setAttribute("aria-live", "polite");
      document.body.append(host);
    }
    const t = document.createElement("div");
    t.className = "toast" + (opts.danger ? " toast--danger" : "");
    t.setAttribute("role", opts.danger ? "alert" : "status");
    const ic = opts.icon || (opts.danger ? "danger" : "check-circle");
    t.innerHTML = `${ic === "check-circle" ? `<svg class="i check-draw" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35"/><path d="M8.5 12.5l2.5 2.5 4.5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>` : icon(ic)}<span class="toast__msg">${esc(msg)}</span>${opts.action ? `<button type="button" class="toast__action">${esc(opts.action.label)}</button>` : ""}<button type="button" class="toast__close" aria-label="Fechar notificação">${icon("x")}</button>`;
    host.append(t);
    const restack = () => [...host.children].filter((x) => !x.classList.contains("is-leaving")).reverse().forEach((x, k) => { x.style.setProperty("--k", k); x.dataset.k = k; });
    restack();
    let timer;
    const leave = () => {
      clearTimeout(timer);
      if (t.classList.contains("is-leaving")) return;
      t.classList.add("is-leaving");
      setTimeout(() => { t.remove(); restack(); }, 200);
      restack();
    };
    const arm = () => { timer = setTimeout(leave, opts.duration || (opts.danger || opts.action ? 8000 : 5000)); }; // Arc · toast: 5 s, 8 s para erro e ação
    t.addEventListener("pointerenter", () => clearTimeout(timer));
    t.addEventListener("pointerleave", arm);
    t.querySelector(".toast__action")?.addEventListener("click", () => { opts.action.onClick?.(); leave(); });
    t.querySelector(".toast__close").addEventListener("click", leave);
    arm();
    return { close: leave };
  };

  /* ───────────────────────── Popover e menu ───────────────────────── */

  let open = null;
  const place = (el, anchor, { align = "start", side = "auto", gap = 6 } = {}) => {
    const r = anchor.getBoundingClientRect();
    const { width: w, height: h } = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
    let left = align === "end" ? r.right - w : align === "center" ? r.left + r.width / 2 - w / 2 : r.left;
    left = Math.max(12, Math.min(left, vw - w - 12));
    const up = side === "top" || (side === "auto" && r.bottom + gap + h > vh - 12 && r.top - gap - h > 12);
    let top = up ? r.top - gap - h : r.bottom + gap;
    top = Math.max(12, Math.min(top, vh - h - 12));
    el.style.left = left + "px";
    el.style.top = top + "px";
    el.style.setProperty("--origin", `${align === "end" ? "right" : align === "center" ? "center" : "left"} ${up ? "bottom" : "top"}`);
  };
  const close = (focusBack = true) => {
    if (!open) return;
    const { el, anchor, onClose } = open;
    open = null;
    el.classList.add("is-leaving");
    setTimeout(() => el.remove(), 110);
    anchor?.setAttribute("aria-expanded", "false");
    onClose?.();
    if (focusBack && anchor?.isConnected) anchor.focus({ preventScroll: true });
  };
  const focusables = (root) => $$("button:not(:disabled), [href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex='-1'])", root).filter((x) => x.offsetParent !== null || x === document.activeElement);

  /** popover(anchor, html | Node, opts) — painel genérico ancorado. Devolve o elemento. */
  const popover = (anchor, content, opts = {}) => {
    if (open?.anchor === anchor) { close(); return null; }
    close(false);
    const el = document.createElement("div");
    el.className = "pop " + (opts.className || "");
    el.setAttribute("role", opts.role || "dialog");
    if (opts.label) el.setAttribute("aria-label", opts.label);
    if (typeof content === "string") el.innerHTML = content; else el.append(content);
    if (opts.width) el.style.width = opts.width + "px"; // antes de posicionar, para calcular com a largura final
    P.hydrateIcons(el);
    document.body.append(el);
    place(el, anchor, opts);
    anchor.setAttribute("aria-expanded", "true");
    open = { el, anchor, onClose: opts.onClose, at: performance.now(), opts };
    el._reposition = () => place(el, anchor, opts);
    if (opts.focus !== false) requestAnimationFrame(() => (opts.initialFocus ? $(opts.initialFocus, el) : focusables(el)[0])?.focus({ preventScroll: true }));
    return el;
  };

  /** menu(anchor, items, opts) — items: { label, icon, onClick, danger, disabled, soon, meta, ext, checked, sep, heading, identity }
   *  identity: { name, email } vira o cabeçalho que dá nome ao menu; meta: texto curto à direita; ext: abre em nova aba */
  const menu = (anchor, items, opts = {}) => {
    const idId = "menu-id-" + P.uid();
    const body = items.map((it, i) => {
      if (it.sep) return `<div class="menu__sep" role="separator"></div>`;
      if (it.identity) return `<div class="menu__id" id="${idId}"><span class="menu__id-name">${esc(it.identity.name)}</span><span class="menu__id-mail">${esc(it.identity.email)}</span></div>`;
      if (it.heading) return `<div class="menu__head">${esc(it.heading)}</div>`;
      if (it.label2) return `<div class="menu__label">${esc(it.label2)}</div>`;
      const role = it.checked === undefined ? "menuitem" : "menuitemradio";
      return `<button type="button" role="${role}" class="menu__item ${it.danger ? "menu__item--danger" : ""}" data-i="${i}" ${it.disabled ? "disabled" : ""} ${it.checked !== undefined ? `aria-checked="${!!it.checked}"` : ""}>${it.icon ? icon(it.icon) : ""}<span class="grow">${esc(it.label)}</span>${it.soon ? `<span class="badge badge--soon">Pós-MVP</span>` : ""}${it.meta ? `<span class="menu__meta">${esc(it.meta)}</span>` : ""}${it.ext ? `${icon("external", "menu__ext")}<span class="sr-only"> (abre em nova aba)</span>` : ""}${it.checked !== undefined ? icon("check", "menu__check i--sm") : ""}</button>`;
    }).join("");
    const el = popover(anchor, body, { ...opts, role: "menu", className: "menu " + (opts.className || "") });
    if (!el) return null;
    if (items.some((it) => it.identity)) { el.removeAttribute("aria-label"); el.setAttribute("aria-labelledby", idId); }
    anchor.setAttribute("aria-haspopup", "menu");
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-i]");
      if (!b) return;
      const it = items[+b.dataset.i];
      close(!it.keepFocus);
      it.onClick?.(anchor);
    });
    return el;
  };

  // Teclado dentro de qualquer popover: setas, Home/End, Tab fecha
  document.addEventListener("keydown", (e) => {
    if (!open) return;
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); return; }
    if (!open.el.contains(document.activeElement)) return;
    const isMenu = open.el.getAttribute("role") === "menu";
    if (e.key === "Tab") { if (isMenu) close(false); else trapIn(open.el, e); return; }
    const items = $$(".menu__item:not(:disabled), [data-nav-item]:not([hidden])", open.el).filter((x) => x.offsetParent);
    if (!items.length) return;
    const i = items.indexOf(document.activeElement);
    const inText = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && document.activeElement.type !== "checkbox";
    const go = (n) => { e.preventDefault(); items[(n + items.length) % items.length]?.focus(); };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp" && !(inText && i < 0)) go(i < 0 ? items.length - 1 : i - 1);
    else if (e.key === "Home" && !inText) go(0);
    else if (e.key === "End" && !inText) go(items.length - 1);
  }, true);
  const trapIn = (root, e) => {
    const f = focusables(root);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  };
  document.addEventListener("pointerdown", (e) => {
    if (open && !open.el.contains(e.target) && !open.anchor.contains(e.target)) close(false);
  });
  addEventListener("resize", () => close(false));
  document.addEventListener("scroll", (e) => {
    if (open && !open.el.contains(e.target) && performance.now() - open.at > 300) close(false);
  }, true);

  /* ───────────────────────── Dica (tooltip) ─────────────────────────
   * Qualquer elemento com data-tip="Texto" . Aparece após 250 ms;
   * entre dicas vizinhas, na hora. Também no foco por teclado. */
  let tipEl = null, tipTimer = 0, tipWarm = 0;
  const showTip = (target) => {
    hideTip();
    const text = target.dataset.tip;
    if (!text) return;
    tipEl = document.createElement("div");
    tipEl.className = "tooltip";
    tipEl.setAttribute("role", "tooltip");
    tipEl.innerHTML = `<span>${esc(text)}</span>`;
    document.body.append(tipEl);
    const r = target.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    const side = target.dataset.tipSide || "bottom";
    let left, top;
    if (side === "right") { left = r.right + 8; top = r.top + r.height / 2 - h / 2; }
    else { left = r.left + r.width / 2 - w / 2; top = side === "top" ? r.top - h - 8 : r.bottom + 8; }
    tipEl.style.left = Math.max(8, Math.min(left, innerWidth - w - 8)) + "px";
    tipEl.style.top = Math.max(8, Math.min(top, innerHeight - h - 8)) + "px";
    tipWarm = performance.now();
  };
  const hideTip = () => { clearTimeout(tipTimer); tipEl?.remove(); tipEl = null; };
  const tipTarget = (e) => e.target.closest?.("[data-tip]");
  document.addEventListener("pointerover", (e) => {
    const t = tipTarget(e);
    if (!t || !P.fine) return;
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => t.matches(":hover") && showTip(t), performance.now() - tipWarm < 300 ? 0 : 250); // Arc · tooltip: 250 ms, na hora se outra abriu há < 300 ms
  });
  document.addEventListener("pointerout", (e) => { if (tipTarget(e)) { if (tipEl) tipWarm = performance.now(); hideTip(); } });
  document.addEventListener("focusin", (e) => { const t = tipTarget(e); if (t && t.matches(":focus-visible")) showTip(t); });
  document.addEventListener("focusout", hideTip);
  document.addEventListener("pointerdown", hideTip);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hideTip(); });

  /* ───────────────────────── Modal ───────────────────────── */

  const layers = [];
  const trap = (root, e) => {
    if (e.key !== "Tab") return;
    const f = focusables(root);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  };
  document.addEventListener("keydown", (e) => {
    const top = layers.at(-1);
    if (!top) return;
    if (e.key === "Escape" && !open) { e.preventDefault(); top.close(); }
    else trap(top.el, e);
  });
  const lockScroll = (on) => { document.documentElement.style.overflow = on ? "hidden" : ""; };

  /** modal({ title, desc, body, buttons:[{label, variant, onClick(m) → false|Promise, id, disabled, icon}], wide, footLeft, onOpen, icon }) */
  const modal = ({ title, desc = "", body = "", buttons = [], wide = false, footLeft = "", onOpen, onClose, iconName, danger } = {}) => {
    const last = document.activeElement;
    const id = "dlg-" + P.uid();
    const el = document.createElement("div");
    el.className = "overlay";
    el.innerHTML = `
      <div class="overlay__scrim" data-close></div>
      <div class="dialog ${wide ? "dialog--wide" : ""}" role="${danger ? "alertdialog" : "dialog"}" aria-modal="true" aria-labelledby="${id}-t" ${desc ? `aria-describedby="${id}-d"` : ""}>
        <div class="dialog__head">
          ${iconName ? `<span class="icon-chip ${danger ? "" : "icon-chip--accent"} dialog__icon" ${danger ? 'style="color:var(--danger);background:var(--danger-wash);border-color:var(--danger-line);box-shadow:none"' : ""}>${icon(iconName)}</span>` : ""}
          <div class="grow"><h2 class="dialog__title" id="${id}-t">${esc(title)}</h2>${desc ? `<p class="dialog__desc" id="${id}-d">${desc}</p>` : ""}</div>
          <button type="button" class="icon-btn icon-btn--sm" data-close aria-label="Fechar">${icon("x")}</button>
        </div>
        ${body ? `<div class="dialog__body">${body}</div>` : ""}
        ${buttons.length ? `<div class="dialog__foot ${footLeft ? "dialog__foot--split" : ""}">${footLeft ? `<div class="hint">${footLeft}</div><div class="row">` : ""}${buttons.map((b, i) => btnHtml(b, i)).join("")}${footLeft ? "</div>" : ""}</div>` : ""}
      </div>`;
    document.body.append(el);
    P.hydrateIcons(el);
    lockScroll(true);
    const layer = { el, close: () => {} };
    const doClose = () => {
      if (el.classList.contains("is-leaving")) return;
      el.classList.add("is-leaving");
      layers.splice(layers.indexOf(layer), 1);
      if (!layers.length) lockScroll(false);
      setTimeout(() => el.remove(), 160);
      onClose?.();
      if (last?.isConnected) last.focus({ preventScroll: true });
    };
    layer.close = doClose;
    el._close = doClose;
    layers.push(layer);
    el.addEventListener("click", async (e) => {
      if (e.target.closest("[data-close]")) { doClose(); return; }
      const b = e.target.closest("[data-b]");
      if (!b) return;
      const r = buttons[+b.dataset.b].onClick?.(el, b);
      if (r instanceof Promise) {
        busy(b, true);
        try { const v = await r; if (v === false) { busy(b, false); return; } busy(b, "done"); setTimeout(doClose, 380); }
        catch (err) { busy(b, false); toast(err?.message || "Algo deu errado. Tente de novo.", { danger: true }); }
        return;
      }
      if (r !== false) doClose();
    });
    bindFields(el);
    onOpen?.(el);
    requestAnimationFrame(() => ($("[autofocus]", el) || $(".dialog__body input, .dialog__body textarea, .dialog__body select", el) || $(".dialog__foot .btn:last-child", el))?.focus());
    return el;
  };
  const btnHtml = (b, i) => `<button type="button" class="btn btn--${b.variant || "secondary"}" data-b="${i}" ${b.id ? `id="${b.id}"` : ""} ${b.disabled ? "disabled" : ""}><span class="btn__label">${b.icon ? icon(b.icon) : ""}${esc(b.label)}</span><span class="btn__state btn__state--loading"><span class="spinner"></span></span><span class="btn__state btn__state--done">${icon("check")}</span></button>`;

  /** confirm({ title, desc, confirm, onConfirm, danger = true, typed }) — `typed` exige digitar a palavra */
  const confirm = ({ title, desc, confirm: label = "Apagar", onConfirm, danger = true, typed, cancel = "Cancelar" }) =>
    modal({
      title, desc, danger, iconName: danger ? "trash" : null,
      body: typed ? `<div class="field"><label class="label" for="cf-typed">Para confirmar, digite <strong>${esc(typed)}</strong></label><input id="cf-typed" class="input" autocomplete="off" autocapitalize="characters" spellcheck="false"></div>` : "",
      buttons: [{ label: cancel }, { label, variant: danger ? "danger" : "primary", id: "cf-ok", disabled: !!typed, onClick: onConfirm }],
      onOpen: (m) => {
        if (!typed) return;
        $("#cf-typed", m).addEventListener("input", (e) => ($("#cf-ok", m).disabled = e.target.value.trim().toUpperCase() !== typed.toUpperCase()));
      },
    });

  /* ───────────────────────── Folha lateral (sheet) ───────────────────────── */

  /** sheet({ title, desc, body, buttons, onOpen, width }) — editar sem perder o contexto da lista */
  const sheet = ({ title, desc = "", body = "", buttons = [], onOpen, onClose, footLeft = "" } = {}) => {
    const last = document.activeElement;
    const id = "sh-" + P.uid();
    const el = document.createElement("div");
    el.className = "sheet-layer";
    el.innerHTML = `
      <div class="sheet-layer__scrim" data-close></div>
      <aside class="sheet" role="dialog" aria-modal="true" aria-labelledby="${id}-t">
        <div class="sheet__head">
          <div class="grow"><h2 class="sheet__title" id="${id}-t">${esc(title)}</h2>${desc ? `<p class="sheet__desc">${desc}</p>` : ""}</div>
          <button type="button" class="icon-btn icon-btn--sm" data-close aria-label="Fechar">${icon("x")}</button>
        </div>
        <div class="sheet__body">${body}</div>
        ${buttons.length ? `<div class="sheet__foot">${footLeft ? `<div class="grow">${footLeft}</div>` : ""}${buttons.map((b, i) => btnHtml(b, i)).join("")}</div>` : ""}
      </aside>`;
    document.body.append(el);
    P.hydrateIcons(el);
    lockScroll(true);
    const layer = { el, close: () => {} };
    const doClose = () => {
      if (el.classList.contains("is-leaving")) return;
      el.classList.add("is-leaving");
      layers.splice(layers.indexOf(layer), 1);
      if (!layers.length) lockScroll(false);
      setTimeout(() => el.remove(), 260);
      onClose?.();
      if (last?.isConnected) last.focus({ preventScroll: true });
    };
    layer.close = doClose;
    el._close = doClose;
    layers.push(layer);
    el.addEventListener("click", async (e) => {
      if (e.target.closest("[data-close]")) { doClose(); return; }
      const b = e.target.closest("[data-b]");
      if (!b) return;
      const r = buttons[+b.dataset.b].onClick?.(el, b);
      if (r instanceof Promise) {
        busy(b, true);
        try { const v = await r; if (v === false) { busy(b, false); return; } busy(b, "done"); setTimeout(doClose, 380); }
        catch (err) { busy(b, false); toast(err?.message || "Algo deu errado. Tente de novo.", { danger: true }); }
        return;
      }
      if (r !== false) doClose();
    });
    bindFields(el);
    onOpen?.(el);
    requestAnimationFrame(() => ($("[autofocus]", el) || $(".sheet__body input, .sheet__body textarea", el) || $("[data-close]", el))?.focus({ preventScroll: true }));
    return el;
  };

  /* ───────────────────────── Botão com estado ───────────────────────── */

  /** busy(btn, true | false | "done") — mantém a largura, troca o rótulo por indicador */
  const busy = (btn, s) => {
    if (!btn) return;
    if (!btn.querySelector(".btn__label")) {
      btn.innerHTML = `<span class="btn__label">${btn.innerHTML}</span><span class="btn__state btn__state--loading"><span class="spinner"></span></span><span class="btn__state btn__state--done">${icon("check")}</span>`;
    }
    btn.classList.toggle("is-loading", s === true);
    btn.classList.toggle("is-done", s === "done");
    btn.setAttribute("aria-busy", String(s === true));
    if (s === "done") setTimeout(() => btn.classList.remove("is-done"), 1400);
  };
  /** run(btn, promiseFactory, { success }) — clique que grava: carregando → concluído ou erro com toast */
  const run = async (btn, fn, { success, error } = {}) => {
    busy(btn, true);
    try { const r = await fn(); busy(btn, "done"); if (success) toast(success); return r; }
    catch (err) { busy(btn, false); toast(error || err?.message || "Algo deu errado. Tente de novo.", { danger: true }); throw err; }
  };

  /* ───────────────────────── Abas e segmentos ─────────────────────────
   * [role=tablist] com [role=tab][aria-controls]: clique e setas trocam; um indicador único desliza. */

  const moveInd = (list) => {
    const ind = list._indEl;
    if (!ind) return;
    // Pílulas que a página re-renderiza (innerHTML) perdem o indicador: devolve o mesmo nó e
    // força um estilo com a posição antiga, para ele deslizar até a nova em vez de surgir nela.
    if (ind.parentNode !== list) { list.prepend(ind); void getComputedStyle(ind).transform; }
    const on = list.querySelector('[aria-selected="true"], [aria-current="page"], [aria-pressed="true"]');
    if (!on) { ind.style.opacity = "0"; return; }
    // Saindo do "nenhum ativo" (ou da lista ainda vazia): aparece no lugar, sem deslizar do zero
    const appear = ind.style.opacity !== "1";
    if (appear) ind.style.transition = "none";
    ind.style.opacity = "1";
    list.style.setProperty("--ind-x", on.offsetLeft + "px");
    list.style.setProperty("--ind-w", on.offsetWidth + "px");
    if (appear) { void getComputedStyle(ind).transform; ind.style.transition = ""; }
  };
  const indicators = (root = document) => {
    $$(".seg, .tabs, .chips", root).forEach((list) => {
      if (!list._ind) {
        list._ind = true;
        const cls = list.classList.contains("tabs") ? "tabs__ind" : list.classList.contains("chips") ? "chips__ind" : "seg__ind";
        const ind = document.createElement("span");
        ind.className = cls;
        ind.setAttribute("aria-hidden", "true");
        list._indEl = ind;
        list.prepend(ind);
        // Pílulas de filtro: cada página troca aria-pressed ou re-renderiza a lista; o indicador acompanha sozinho
        if (cls === "chips__ind") new MutationObserver(() => moveInd(list)).observe(list, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-pressed"] });
        list.classList.add("has-ind");
        moveInd(list); // primeira medida sem transição (ver "appear" em moveInd)
        new ResizeObserver(() => moveInd(list)).observe(list);
      } else moveInd(list);
    });
  };
  const selectTab = (list, tab, focus = false) => {
    $$("[role='tab']", list).forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      const p = t.getAttribute("aria-controls");
      if (p) document.getElementById(p)?.toggleAttribute("hidden", !on);
    });
    if (focus) tab.focus();
    moveInd(list);
    list.dispatchEvent(new CustomEvent("tabchange", { detail: tab, bubbles: true }));
  };

  /* ───────────────────────── Campos ───────────────────────── */

  const counter = (input) => {
    const c = input.closest(".field")?.querySelector(".counter");
    if (!c) return;
    const max = +input.getAttribute("maxlength") || +input.dataset.max || 0;
    const n = input.value.length;
    c.textContent = `${fmt(n)} / ${fmt(max)}`;
    c.classList.toggle("is-near", !!max && n > max * 0.9 && n <= max);
    c.classList.toggle("is-over", !!max && n > max);
  };
  const autoresize = (ta) => { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, +(ta.dataset.max || 260)) + "px"; };

  function bindFields(root = document) {
    $$("input[maxlength], textarea[maxlength]", root).forEach((el) => {
      if (el._counted) return;
      el._counted = true;
      counter(el);
      el.addEventListener("input", () => counter(el));
    });
    $$("textarea[data-autoresize]", root).forEach((ta) => {
      if (ta._ar) return;
      ta._ar = true;
      ta.addEventListener("input", () => autoresize(ta));
      autoresize(ta);
    });
    $$("[role='tablist']", root).forEach((list) => {
      if (list._tabs) return;
      list._tabs = true;
      list.addEventListener("click", (e) => {
        const tab = e.target.closest("[role='tab']");
        if (tab && list.contains(tab) && !tab.hasAttribute("data-soon")) selectTab(list, tab);
      });
      list.addEventListener("keydown", (e) => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        const tabs = $$("[role='tab']:not([data-soon])", list);
        const i = tabs.indexOf(document.activeElement);
        const n = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        selectTab(list, tabs[n], true);
      });
    });
    $$(".dropzone", root).forEach((dz) => {
      if (dz._dz) return;
      dz._dz = true;
      ["dragenter", "dragover"].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.add("is-over"); }));
      ["dragleave", "drop"].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.remove("is-over"); }));
    });
    $$(".disclosure", root).forEach((d) => {
      if (d._disc) return;
      d._disc = true;
      const trg = $(".disclosure__trigger", d);
      trg?.addEventListener("click", () => { const o = d.classList.toggle("is-open"); trg.setAttribute("aria-expanded", o); });
    });
    indicators(root);
  }

  /* Validação: rules = { "#id": [(v, el) => mensagem | "", …] }. Mostra o erro embaixo do campo,
   * marca aria-invalid, foca o primeiro com erro. Depois do primeiro envio, revalida ao digitar. */
  const validate = (form, rules) => {
    let first = null;
    const check = (sel) => {
      const el = $(sel, form);
      if (!el) return true;
      const msg = rules[sel].map((fn) => fn(el.value, el)).find(Boolean) || "";
      const field = el.closest(".field");
      let err = field?.querySelector(".field-error");
      if (msg) {
        if (!err && field) { err = document.createElement("p"); err.className = "field-error"; err.id = (el.id || P.uid()) + "-err"; field.append(err); }
        if (err) { err.innerHTML = `${icon("danger")}<span>${esc(msg)}</span>`; el.setAttribute("aria-describedby", [el.getAttribute("aria-describedby"), err.id].filter((x, i, a) => x && a.indexOf(x) === i).join(" ")); }
        el.setAttribute("aria-invalid", "true");
      } else {
        el.removeAttribute("aria-invalid");
        if (err) { el.setAttribute("aria-describedby", (el.getAttribute("aria-describedby") || "").replace(err.id, "").trim()); err.remove(); }
      }
      return !msg;
    };
    let ok = true;
    Object.keys(rules).forEach((sel) => { const v = check(sel); if (!v && !first) first = $(sel, form); ok = ok && v; });
    if (!form._live) {
      form._live = true;
      Object.keys(rules).forEach((sel) => $(sel, form)?.addEventListener("input", () => form._validated && check(sel)));
    }
    form._validated = true;
    first?.focus();
    return ok;
  };
  const rules = {
    required: (label) => (v) => (v.trim() ? "" : `${label} é obrigatório.`),
    requiredF: (label) => (v) => (v.trim() ? "" : `${label} é obrigatória.`),
    max: (n) => (v) => (v.length > n ? `Use no máximo ${fmt(n)} caracteres.` : ""),
  };

  /* ───────────────────────── Estados ───────────────────────── */

  const skeleton = {
    lines: (n = 3) => Array.from({ length: n }, (_, i) => `<div class="skel skel--line" style="width:${[92, 78, 64, 85, 70][i % 5]}%"></div>`).join(""),
    cards: (n = 6, cls = "") => Array.from({ length: n }, () => `<div class="card skel-card ${cls}" aria-hidden="true"><div class="row" style="gap:var(--s-3)"><div class="skel skel--circle" style="width:40px;height:40px;border-radius:var(--r-square)"></div><div class="grow stack" style="--gap:var(--s-2)"><div class="skel skel--title" style="width:55%"></div><div class="skel skel--line" style="width:35%;height:10px"></div></div></div>${skeleton.lines(2)}</div>`).join(""),
    rows: (n = 5) => Array.from({ length: n }, () => `<div class="list-item" aria-hidden="true"><div class="skel" style="width:28px;height:28px;border-radius:var(--r-control)"></div><div class="grow stack" style="--gap:var(--s-2)"><div class="skel skel--line" style="width:45%"></div><div class="skel skel--line" style="width:25%;height:9px"></div></div><div class="skel skel--line" style="width:60px"></div></div>`).join(""),
    table: (cols = 5, n = 5) => Array.from({ length: n }, () => `<tr aria-hidden="true">${Array.from({ length: cols }, (_, i) => `<td><div class="skel skel--line" style="width:${i === 0 ? 70 : 50}%"></div></td>`).join("")}</tr>`).join(""),
  };
  const loading = (label = "Carregando") => `<span class="sr-only" role="status">${esc(label)}…</span>`;

  /** empty({ icon, title, text, actions:[{label, href|act, variant, icon}], steps:[], center, plain }) */
  const empty = ({ icon: ic, title, text = "", actions = [], steps = [], center = false, plain = false, cls = "", heading = false }) => `
    <div class="empty ${center ? "empty--center" : ""} ${plain ? "empty--plain" : ""} ${cls}">
      ${ic ? `<span class="icon-chip icon-chip--lg">${icon(ic)}</span>` : ""}
      ${heading ? `<h1 class="empty__title">${esc(title)}</h1>` : `<p class="empty__title">${esc(title)}</p>`}
      ${text ? `<p class="empty__text">${text}</p>` : ""}
      ${steps.length ? `<ol class="empty__steps">${steps.map((s) => `<li>${s}</li>`).join("")}</ol>` : ""}
      ${actions.length ? `<div class="empty__actions">${actions.map((a) => a.href ? `<a class="btn btn--${a.variant || "secondary"}" href="${a.href}">${a.icon ? icon(a.icon) : ""}${esc(a.label)}</a>` : `<button type="button" class="btn btn--${a.variant || "secondary"}" data-act="${a.act || ""}">${a.icon ? icon(a.icon) : ""}${esc(a.label)}</button>`).join("")}</div>` : ""}
    </div>`;

  /** errorState(message, { retry: "data-act" }) — erro recuperável com tentar de novo */
  const errorState = (message, { title = "Não deu para carregar", compact = false } = {}) => `
    <div class="alert alert--danger" role="alert" ${compact ? "" : 'style="padding:var(--s-4) var(--s-5)"'}>
      ${icon("danger")}
      <div class="alert__body">
        <p><strong>${esc(title)}</strong><br>${esc(message || "Verifique a conexão e tente de novo.")}</p>
        <div><button type="button" class="btn btn--sm" data-retry>${icon("refresh")}Tentar de novo</button></div>
      </div>
    </div>`;

  /** load(container, fetcher, render, { skeleton, onError }) — carregando → conteúdo | erro com tentar de novo */
  const load = async (box, fetcher, render, opts = {}) => {
    box.setAttribute("aria-busy", "true");
    box.innerHTML = (opts.skeleton ?? skeleton.rows()) + loading(opts.label);
    try {
      const data = await fetcher();
      box.removeAttribute("aria-busy");
      render(data);
      P.hydrateIcons(box);
      bindFields(box);
      reveal(box);
      return data;
    } catch (err) {
      box.removeAttribute("aria-busy");
      box.innerHTML = errorState(err?.message);
      P.hydrateIcons(box);
      $("[data-retry]", box)?.addEventListener("click", () => load(box, fetcher, render, opts), { once: true });
      opts.onError?.(err);
    }
  };

  /* ───────────────────────── Número que conta ─────────────────────────
   * ticker(el, "R$ 1,83") — cada dígito é uma coluna 0–9 que rola até o valor (UI Arc · number ticker). */
  const ticker = (el, text = el.textContent) => {
    text = String(text);
    el.setAttribute("aria-label", text);
    if (reduced) { el.textContent = text; return; }
    el.classList.add("ticker");
    el.innerHTML = [...text].map((ch, i) => /\d/.test(ch)
      ? `<span class="ticker__d" aria-hidden="true"><span class="ticker__col" style="--i:${i}">${"0123456789".split("").map((d) => `<span>${d}</span>`).join("")}</span></span>`
      : `<span aria-hidden="true">${ch === " " ? "&nbsp;" : esc(ch)}</span>`).join("");
    const cols = $$(".ticker__col", el);
    const digits = text.replace(/\D/g, "");
    requestAnimationFrame(() => requestAnimationFrame(() => cols.forEach((c, i) => (c.style.transform = `translateY(-${+digits[i] * 10}%)`))));
  };

  /* ───────────────────────── Revelar ao rolar ───────────────────────── */
  const io = "IntersectionObserver" in window && !reduced
    ? new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -4% 0px" })
    : null;
  const reveal = (root = document) => {
    if (!io) return;
    $$("[data-reveal-group]", root).forEach((g) => {
      [...g.children].forEach((el, i) => {
        if (el.dataset.reveal !== undefined) return;
        el.dataset.reveal = "";
        el.style.setProperty("--i", Math.min(i, 8));
        io.observe(el);
      });
    });
  };

  /* ───────────────────────── Marca e modelos ───────────────────────── */

  const crystal = ({ hero = false, still = false, small = false } = {}) =>
    `<span class="crystal ${hero ? "crystal--hero" : ""} ${still ? "crystal--still" : ""}" aria-hidden="true"><span class="crystal__float"><span class="crystal__body"><img class="crystal__img" src="assets/img/prisma-logo-${small ? 128 : 512}.webp" alt="" decoding="async"><span class="crystal__iris"></span><span class="crystal__shine"></span></span></span>${hero && !still ? `<span class="crystal__shadow"></span>` : ""}</span>`;
  const crystalBadge = (cls = "") => `<span class="crystal-badge ${cls}" aria-hidden="true">${crystal({ small: true })}</span>`;
  const verified = (label = "Oficial da Asimov") => `<span class="verified" role="img" aria-label="${esc(label)}" title="${esc(label)}">${icon("verified")}</span>`;

  const models = () => window.PrismaData.models;
  const model = (key) => models().find((m) => m.key === key) || models()[0];
  const modelIcon = (m, cls = "") => {
    if (m.icon === "prisma" || m.icon === "prisma-plus") {
      const plus = m.icon === "prisma-plus";
      return `<span class="model-icon model-icon--crystal ${cls}" aria-hidden="true">${crystal({ small: true })}${plus ? '<span class="model-icon__plus">+</span>' : ""}</span>`;
    }
    if (m.logo) return `<span class="model-icon ${cls}" aria-hidden="true"><img src="assets/img/${esc(m.logo)}" alt="" width="16" height="16"></span>`;
    return `<span class="model-icon ${cls}" aria-hidden="true">${esc((m.name || "?")[0])}</span>`;
  };
  const agentAvatar = (a, size = "lg") => `<span class="avatar avatar--${size} avatar--square tone-${a.tone || "teal"}" aria-hidden="true">${a.initials ? esc(a.initials) : icon("agent", "i--sm")}</span>`;


  /* ───────────────────────── Cartão de item da galeria e favoritar ───────────────────────── */

  const SKILL_ICON = { Produtividade: "check-circle", Escrita: "pencil", Automação: "workflow", Design: "wand", Estudos: "course", Reuniões: "users", Programação: "code", Dados: "chart" };
  const chatWith = (a) => "chat.html?" + new URLSearchParams({ q: "Oi! Vamos começar?", agent: a.id });
  /** galleryCard(item, "agents" | "skills", { mine, h }) — o card da galeria é a referência; os seus seguem igual:
   * marca · título + autoria ("Asimov ✓ · categoria" / "Você · categoria") · descrição em 2 linhas ·
   * rodapé com a nota (ou "Só você · data" / "Na galeria") à esquerda e um botão de ícone à direita:
   * ♥ favoritar na galeria, ⋯ ações nos seus (Conversar, Usar, Editar, Apagar ficam no menu). */
  const galleryCard = (it, type, { mine = false, h = 3 } = {}) => {
    const isAgent = type === "agents";
    const mark = isAgent ? agentAvatar(it, "lg") : `<span class="icon-chip icon-chip--lg">${icon(SKILL_ICON[it.category] || "skill")}</span>`;
    const href = mine ? (isAgent ? "agente-novo.html" : "skill-nova.html") + `?id=${it.id}` : `galeria-item.html?id=${it.id}`;
    const author = mine ? `<span class="by"><strong>Você</strong></span>` : `<span class="by"><strong>Asimov</strong>${verified()}</span>`;
    const tail = it.category ? `<span>${esc(it.category)}</span>`
      : mine && isAgent && it.model ? `${modelIcon(model(it.model))}<span>${esc(model(it.model).name)}</span>` : "";
    const meta = !mine ? rating(it)
      : it.published ? `<span class="badge badge--success">${icon("globe")}Na galeria</span>`
      : `<span>${icon("lock")}Só você${it.updated ? ` · ${esc(it.updated)}` : ""}</span>`;
    const btn = mine
      ? `<button type="button" class="icon-btn icon-btn--sm item-card__act" data-more="${it.id}" aria-label="Ações de “${esc(it.name)}”">${icon("more")}</button>`
      : `<button type="button" class="icon-btn icon-btn--sm fav item-card__act" data-fav="${it.id}" aria-pressed="${!!it.fav}" aria-label="${it.fav ? "Tirar dos favoritos" : "Favoritar"}: ${esc(it.name)}">${icon("heart")}</button>`;
    return `
      <article class="card card--interactive item-card" ${isAgent ? `style="--card-tone:var(--tone-${it.tone || "teal"})"` : ""}>
        <div class="item-card__head">
          ${mark}
          <div class="grow"><h${h} class="item-card__title"><a class="card__link" href="${href}">${esc(it.name)}</a></h${h}><p class="item-card__by">${author}${tail ? `<span aria-hidden="true">·</span>${tail}` : ""}</p></div>
        </div>
        <p class="item-card__desc t-clamp-2">${esc(it.desc)}</p>
        <div class="item-card__foot">
          <span class="item-card__meta">${meta}</span>
          ${btn}
        </div>
      </article>`;
  };
  /** rating(item) — como na Amazon: nota, cinco estrelas preenchidas até a nota (frações inclusive) e a contagem.
   * O leitor de tela ouve a frase inteira; as estrelas são só desenho. */
  const rating = (it, { size = "sm" } = {}) => {
    if (!it.rating || !it.reviews) return `<span class="rating rating--none">Sem avaliações ainda</span>`;
    const nota = P.fmt(it.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const row = Array.from({ length: 5 }, () => icon("star-fill")).join("");
    return `<span class="rating rating--${size}" role="img" aria-label="Nota ${nota} de 5, ${P.plural(it.reviews, "avaliação", "avaliações")}">
      <span class="rating__n" aria-hidden="true">${nota}</span>
      <span class="rating__stars" aria-hidden="true" style="--v:${(it.rating / 5) * 100}%"><span class="rating__base">${row}</span><span class="rating__fill">${row}</span></span>
      <span class="rating__count" aria-hidden="true">(${P.fmt(it.reviews)})</span></span>`;
  };
  /** favToggle(btn, item, onChange) — otimista, com pulso e "Desfazer" */
  const favToggle = (btn, it, onChange) => {
    const set = (v, quiet) => {
      it.fav = v;
      const src = [...window.PrismaData.gallery.agents, ...window.PrismaData.gallery.skills].find((x) => x.id === it.id);
      if (src) src.fav = v;
      document.querySelectorAll(`[data-fav="${it.id}"]`).forEach((b) => {
        b.setAttribute("aria-pressed", String(v));
        b.setAttribute("aria-label", `${v ? "Tirar dos favoritos" : "Favoritar"}: ${it.name}`);
        const lbl = b.querySelector("[data-fav-label]");
        if (lbl) lbl.textContent = v ? "Favoritado" : "Favoritar";
      });
      onChange?.(v);
      if (!quiet) toast(v ? `${it.name} nos favoritos` : `${it.name} saiu dos favoritos`, { icon: "heart", action: { label: "Desfazer", onClick: () => set(!v, true) } });
    };
    const v = !it.fav;
    set(v);
    if (v && !reduced) {
      btn.classList.remove("is-pop"); void btn.offsetWidth; btn.classList.add("is-pop");
      for (let k = 0; k < 6; k++) { const b = document.createElement("span"); b.className = "burst"; b.style.setProperty("--a", `${k * 60}deg`); btn.append(b); setTimeout(() => b.remove(), 500); }
    }
    P.api.send("POST", `/v1/gallery/${it.id}/favorite`, { fav: v }).catch(() => { set(!v, true); toast("Não foi possível salvar o favorito. Tente de novo.", { danger: true }); });
  };

  /* ───────────────────────── Morph select ─────────────────────────
   * Todo <select class="select"> vira um gatilho do DS que cresce até virar a lista (morph select do Arc): um destaque
   * desliza entre as opções, o teclado segue o padrão combobox (o foco fica no gatilho, aria-activedescendant aponta a
   * opção) e o valor novo rola no gatilho. O <select> nativo fica escondido e segue como fonte do valor: `change` sai
   * dele, e `.value = x` por código atualiza o gatilho. Entra sozinho em qualquer <select class="select">, inclusive
   * nos que aparecem depois (modais, gavetas). */
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const ms = { cur: null };
  const SEL_VALUE = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
  const SEL_INDEX = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "selectedIndex");
  const PAGE = 8;

  // Destaque que desliza até a opção ativa (o mesmo nos dois componentes)
  const glide = (hl, el, instant) => {
    if (!el) { hl.style.opacity = "0"; return; }
    hl.style.transition = instant ? "none" : "";
    hl.style.transform = `translateY(${el.offsetTop}px)`;
    hl.style.height = el.offsetHeight + "px";
    hl.style.opacity = "1";
    if (instant) void hl.offsetWidth;
  };
  const keepInView = (box, el) => {
    if (el.offsetTop < box.scrollTop + 4) box.scrollTop = el.offsetTop - 4;
    else if (el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight - 4) box.scrollTop = el.offsetTop + el.offsetHeight - box.clientHeight + 4;
  };

  const morphSelect = (sel) => {
    if (sel._ms || sel.multiple) return;
    const id = sel.id || (sel.id = "sel-" + P.uid());
    const lbl = document.querySelector(`label[for="${id}"]`);
    if (lbl && !lbl.id) lbl.id = id + "-l";
    const trg = document.createElement("button");
    trg.type = "button";
    trg.className = sel.className + " mselect";
    if (sel.getAttribute("style")) trg.setAttribute("style", sel.getAttribute("style"));
    trg.setAttribute("role", "combobox");
    trg.setAttribute("aria-haspopup", "listbox");
    trg.setAttribute("aria-expanded", "false");
    trg.setAttribute("aria-controls", id + "-lb");
    if (lbl) trg.setAttribute("aria-labelledby", lbl.id); else if (sel.getAttribute("aria-label")) trg.setAttribute("aria-label", sel.getAttribute("aria-label"));
    trg.innerHTML = `<span class="mselect__v"><span class="mselect__t"></span></span>`;
    sel.after(trg);
    sel.classList.add("mselect__native");
    sel.tabIndex = -1;
    sel._ms = trg;
    sel.focus = () => trg.focus();
    lbl?.addEventListener("click", (e) => { e.preventDefault(); trg.focus(); });

    // Valor no gatilho; dir (−1 / 1) faz o texto novo rolar de cima ou de baixo, conforme a posição na lista
    const sync = (dir = 0) => {
      trg.disabled = sel.disabled;
      const o = sel.options[SEL_INDEX.get.call(sel)];
      const text = o ? o.textContent.trim() : sel.dataset.placeholder || "Selecionar";
      const v = $(".mselect__v", trg);
      const cur = $(".mselect__t:not(.is-out)", v);
      if (cur.textContent === text) return;
      if (!dir || reduced) { $$(".mselect__t.is-out", v).forEach((x) => x.remove()); cur.textContent = text; return; }
      const nu = document.createElement("span");
      nu.className = "mselect__t is-in";
      nu.textContent = text;
      [cur, nu].forEach((x) => x.style.setProperty("--dir", dir));
      cur.classList.add("is-out");
      v.append(nu);
      setTimeout(() => cur.remove(), 400);
    };
    Object.defineProperty(sel, "value", { configurable: true, get() { return SEL_VALUE.get.call(this); }, set(x) { SEL_VALUE.set.call(this, x); sync(); } });
    Object.defineProperty(sel, "selectedIndex", { configurable: true, get() { return SEL_INDEX.get.call(this); }, set(x) { SEL_INDEX.set.call(this, x); sync(); } });
    new MutationObserver(() => sync()).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["disabled"] });
    sync();

    let api = null, typed = "", typedAt = 0, keyAt = 0;
    const typeahead = (key, list, from) => {
      typed = performance.now() - typedAt > 700 ? key : typed + key;
      typedAt = performance.now();
      const q = P.norm(typed);
      const order = [...list.slice(from + 1), ...list.slice(0, from + 1)];
      return order.find((el) => P.norm(el.textContent).trim().startsWith(q));
    };

    const openList = (start) => {
      ms.cur?.close(false);
      close(false);
      const r = trg.getBoundingClientRect();
      const small = sel.classList.contains("select--sm");
      let g = null;
      const body = [...sel.options].map((o, i) => {
        const grp = o.parentElement.tagName === "OPTGROUP" ? o.parentElement.label : "";
        const head = grp !== g && (g = grp) ? `<div class="menu__label" role="presentation">${esc(grp)}</div>` : "";
        return `${head}<div class="mselect__opt" role="option" id="${id}-o${i}" data-i="${i}" aria-selected="${i === SEL_INDEX.get.call(sel)}"${o.disabled ? ' aria-disabled="true"' : ""}><span class="mselect__label">${esc(o.textContent.trim())}</span>${icon("check", "menu__check i--sm")}</div>`;
      }).join("");
      const pop = document.createElement("div");
      pop.className = "mselect-pop" + (small ? " mselect-pop--sm" : "");
      pop.innerHTML = `<div class="mselect-pop__in"><div class="mselect__hl" aria-hidden="true"></div><div class="mselect__list" role="listbox" id="${id}-lb" ${lbl ? `aria-labelledby="${lbl.id}"` : `aria-label="${esc(sel.getAttribute("aria-label") || "Opções")}"`}>${body}</div></div>`;
      P.hydrateIcons(pop);
      document.body.append(pop);
      const inner = $(".mselect-pop__in", pop), hl = $(".mselect__hl", pop);
      const opts = $$(".mselect__opt", pop);
      const enabled = opts.filter((o) => !o.hasAttribute("aria-disabled"));

      // Tamanho final: nunca mais estreito que o gatilho. Abre logo abaixo dele, alinhado à borda direita (como os menus
      // do ChatGPT); sem espaço à esquerda, alinha à esquerda; sem espaço embaixo, abre para cima
      const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      const GAP = 6;
      const w = Math.min(Math.max(r.width, Math.min(Math.ceil(pop.getBoundingClientRect().width) + 4, 320)), vw - 24); // folga: texto com fração de pixel ganharia "…"
      const below = vh - 12 - (r.bottom + GAP), above = r.top - GAP - 12;
      const up = below < Math.min(pop.offsetHeight, 200) && above > below;
      const h = Math.min(pop.offsetHeight, small ? 264 : 304, up ? above : below);
      let left = r.right - w;
      if (left < 12) left = Math.min(r.left, vw - 12 - w);
      left = Math.max(12, left);
      const top = up ? r.top - GAP - h : r.bottom + GAP;
      Object.assign(pop.style, { left: left + "px", top: top + "px", width: w + "px", height: h + "px" });
      Object.assign(inner.style, { width: w - 2 + "px", height: h - 2 + "px" });

      // Morph: nasce como uma cópia do gatilho colada na borda (mesma largura e canto) e cresce até o painel
      const right = Math.abs(left + w - r.right) < 1; // cresce a partir do lado em que está alinhado
      const sw = Math.min(r.width, w), sh = Math.min(r.height, h);
      const sLeft = right ? left + w - sw : left;
      const sTop = up ? top + h - sh : top;
      const from = { left: sLeft + "px", top: sTop + "px", width: sw + "px", height: sh + "px", borderRadius: cssVar("--r-control"), opacity: 0, transform: `translateY(${up ? 4 : -4}px)` };
      const to = { left: left + "px", top: top + "px", width: w + "px", height: h + "px", borderRadius: cssVar("--r-metric"), opacity: 1, transform: "none" };
      inner.style.position = "absolute";
      inner.style[up ? "bottom" : "top"] = "0";
      inner.style[right ? "right" : "left"] = "0";
      if (reduced) pop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
      else {
        pop.animate([from, { ...from, opacity: 1, offset: 0.08 }, to], { duration: parseFloat(cssVar("--dur-spring-morph")) || 480, easing: cssVar("--spring-morph") || "ease-out" });
        inner.animate([{ opacity: 0, filter: "blur(2px)" }, { opacity: 1, filter: "blur(0)" }], { duration: 200, delay: 60, easing: "ease-out", fill: "backwards" });
      }

      let act = null;
      const setAct = (el, { instant = false, scroll = true } = {}) => {
        if (!el) return;
        act = el;
        opts.forEach((o) => o.classList.toggle("is-active", o === el));
        trg.setAttribute("aria-activedescendant", el.id);
        glide(hl, el, instant);
        if (scroll) keepInView(inner, el);
      };
      const selected = opts[SEL_INDEX.get.call(sel)];
      const first = start === "first" ? enabled[0] : start === "last" ? enabled.at(-1) : typeof start === "number" ? opts[start] : selected && !selected.hasAttribute("aria-disabled") ? selected : enabled[0];
      setAct(first, { instant: true });
      if (act) inner.scrollTop = Math.max(0, act.offsetTop - (inner.clientHeight - act.offsetHeight) / 2);

      const pick = (el) => {
        if (!el || el.hasAttribute("aria-disabled")) return;
        const i = +el.dataset.i, prev = SEL_INDEX.get.call(sel);
        api.close(true);
        if (i === prev) return;
        SEL_INDEX.set.call(sel, i);
        sync(Math.sign(i - prev));
        sel.dispatchEvent(new Event("input", { bubbles: true }));
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      };
      const onKey = (e) => {
        const i = enabled.indexOf(act);
        const go = (n) => { e.preventDefault(); setAct(enabled[Math.max(0, Math.min(enabled.length - 1, n))]); };
        if (e.key === "ArrowDown" && e.altKey) { e.preventDefault(); return; }
        if (e.key === "ArrowUp" && e.altKey) { e.preventDefault(); pick(act); return; }
        if (e.key === "ArrowDown") go(i + 1);
        else if (e.key === "ArrowUp") go(i - 1);
        else if (e.key === "PageDown") go(i + PAGE);
        else if (e.key === "PageUp") go(i - PAGE);
        else if (e.key === "Home") go(0);
        else if (e.key === "End") go(enabled.length - 1);
        else if (e.key === "Enter" || (e.key === " " && performance.now() - typedAt > 700)) { e.preventDefault(); keyAt = performance.now(); pick(act); }
        else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); api.close(true); }
        else if (e.key === "Tab") api.close(false);
        else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) { const hit = typeahead(e.key, enabled, i); if (hit) setAct(hit); }
      };
      const onDown = (e) => { if (!pop.contains(e.target)) api.close(false); };
      const onScroll = (e) => { if (!pop.contains(e.target)) api.close(false); };
      const onBlur = () => api.close(false);
      const vw0 = innerWidth;
      const onResize = (e) => { if (e?.type !== "resize" || innerWidth !== vw0) api.close(false); }; // a barra do navegador no celular muda só a altura
      pop.addEventListener("pointerdown", (e) => e.preventDefault());
      pop.addEventListener("click", (e) => pick(e.target.closest(".mselect__opt")));
      pop.addEventListener("pointermove", (e) => { const o = e.target.closest(".mselect__opt:not([aria-disabled])"); if (o && o !== act && P.fine) setAct(o, { scroll: false }); });
      trg.addEventListener("keydown", onKey);
      trg.addEventListener("blur", onBlur);
      document.addEventListener("pointerdown", onDown, true);
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);
      trg.setAttribute("aria-expanded", "true");

      api = ms.cur = {
        close: (focus = true) => {
          if (ms.cur !== api) return;
          ms.cur = null;
          trg.removeEventListener("keydown", onKey);
          trg.removeEventListener("blur", onBlur);
          document.removeEventListener("pointerdown", onDown, true);
          window.removeEventListener("scroll", onScroll, true);
          window.removeEventListener("resize", onResize);
          trg.setAttribute("aria-expanded", "false");
          trg.removeAttribute("aria-activedescendant");
          pop.style.pointerEvents = "none";
          const a = reduced || !trg.isConnected
            ? pop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100, fill: "forwards" })
            : (inner.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: "forwards" }), pop.animate([to, { ...to, offset: 0.15 }, from], { duration: 200, easing: cssVar("--ease-out") || "ease-out", fill: "forwards" }));
          a.onfinish = () => pop.remove();
          setTimeout(() => pop.remove(), 400); // aba em segundo plano não roda a animação
          if (focus && trg.isConnected) trg.focus({ preventScroll: true });
        },
      };
    };
    const close = (focus) => { if (api && ms.cur === api) api.close(focus); };

    trg.addEventListener("click", (e) => {
      if (performance.now() - keyAt < 400) return; // Enter/Espaço já abriram no keydown; o clique que o botão gera vem junto
      if (ms.cur === api && api) close(true); else openList();
    });
    trg.addEventListener("keydown", (e) => {
      if (ms.cur === api && api) return;
      const opts = [...sel.options];
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); keyAt = performance.now(); openList(); }
      else if (e.key === "Home" || e.key === "End") { e.preventDefault(); openList(e.key === "Home" ? "first" : "last"); }
      else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && opts.length) {
        e.preventDefault();
        const hit = typeahead(e.key, opts.filter((o) => !o.disabled), SEL_INDEX.get.call(sel));
        openList(hit ? opts.indexOf(hit) : undefined);
      }
    });
  };

  /* Sugestões de campo de texto (<input list>): troca a lista do navegador por um painel do DS, com o mesmo destaque
   * que desliza. Filtra pelo que foi digitado; Enter escolhe a ativa e segue para o campo (ex.: vira etiqueta). */
  const suggest = (input) => {
    const dl = document.getElementById(input.getAttribute("list"));
    if (input._sg || !dl) return;
    input._sg = true;
    input.removeAttribute("list");
    const lid = "sg-" + P.uid();
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", lid);
    const anchor = () => input.closest(".tagbox, .input-icon") || input;
    let pop = null, items = [], act = -1, quiet = false;
    const opts = () => (pop ? $$(".mselect__opt", pop) : []);
    const setAct = (k, scroll = true) => {
      act = k;
      const list = opts();
      list.forEach((o, n) => o.classList.toggle("is-active", n === k));
      if (k < 0) { input.removeAttribute("aria-activedescendant"); glide($(".mselect__hl", pop), null); return; }
      input.setAttribute("aria-activedescendant", list[k].id);
      glide($(".mselect__hl", pop), list[k]);
      if (scroll) keepInView(pop, list[k]);
    };
    const close = () => {
      if (!pop) return;
      const p = pop;
      pop = null; act = -1;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      p.classList.add("is-leaving");
      setTimeout(() => p.remove(), 140);
    };
    const choose = (k, commit) => {
      quiet = true;
      input.value = items[k];
      input.dispatchEvent(new Event("input", { bubbles: true }));
      if (commit) input.dispatchEvent(new Event("change", { bubbles: true }));
      quiet = false;
      close();
    };
    const render = () => {
      const q = P.norm(input.value.trim());
      items = [...dl.options].map((o) => o.value || o.textContent.trim()).filter((v) => v && P.norm(v) !== q && (!q || P.norm(v).includes(q)));
      if (!items.length) { close(); return; }
      if (!pop) {
        pop = document.createElement("div");
        pop.className = "pop mselect-suggest";
        pop.addEventListener("pointerdown", (e) => e.preventDefault());
        pop.addEventListener("click", (e) => { const o = e.target.closest(".mselect__opt"); if (o) choose(+o.dataset.k, true); });
        pop.addEventListener("pointermove", (e) => { const o = e.target.closest(".mselect__opt"); if (o && P.fine && +o.dataset.k !== act) setAct(+o.dataset.k, false); });
        document.body.append(pop);
        input.setAttribute("aria-expanded", "true");
      }
      const label = input.getAttribute("aria-label") || (input.id && document.querySelector(`label[for="${input.id}"]`)?.textContent.trim()) || "Sugestões";
      pop.innerHTML = `<div class="mselect__hl" aria-hidden="true"></div><div role="listbox" id="${lid}" aria-label="${esc(label)}">${items.map((v, k) => `<div class="mselect__opt" role="option" id="${lid}-${k}" data-k="${k}" aria-selected="false"><span class="mselect__label">${esc(v)}</span></div>`).join("")}</div>`;
      pop.style.width = anchor().offsetWidth + "px";
      place(pop, anchor(), { gap: 4 });
      act = -1;
    };
    input.addEventListener("keydown", (e) => {
      const n = items.length;
      if (e.key === "ArrowDown") { e.preventDefault(); if (!pop) render(); else setAct((act + 1) % n); }
      else if (e.key === "ArrowUp" && pop) { e.preventDefault(); setAct(act <= 0 ? n - 1 : act - 1); }
      else if (e.key === "Enter" && pop && act >= 0) { e.preventDefault(); choose(act, false); }
      else if (e.key === "Escape" && pop) { e.preventDefault(); e.stopPropagation(); close(); }
      else if (e.key === "Tab") close();
    }, true);
    input.addEventListener("input", () => { if (!quiet) render(); });
    input.addEventListener("focus", render);
    input.addEventListener("blur", close);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", (e) => { if (pop && !pop.contains(e.target)) close(); }, true);
  };

  /* ───────────────────────── Seletor de data ─────────────────────────
   * Todo <input type="date" class="input"> vira um gatilho com a cara do campo e um calendário do DS (mesmo painel e
   * destaque que desliza do morph select). O painel nasce do gatilho e cresce até o calendário logo abaixo dele. O input
   * nativo fica escondido e segue dono do valor (AAAA-MM-DD): `change` sai dele, e `.value = x` por código atualiza o
   * gatilho; `min`/`max` desligam os dias de fora. Teclado de grade (APG date picker): o foco entra no dia; setas movem
   * o dia, PageUp/PageDown trocam o mês (com Shift, o ano), Home/End vão ao início e ao fim da semana, Enter/Espaço
   * escolhe, Esc fecha sem fechar o modal. Semana de domingo a sábado, nomes em pt-BR. */
  const INP_VALUE = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const WEEK = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const pad2 = (n) => String(n).padStart(2, "0");
  const isoOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const parseIso = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const addMonths = (d, n) => { const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate(); return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last)); };
  const shortDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}. ${d.getFullYear()}`.replace("maio.", "maio");
  const longDate = (d) => `${WEEK[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;

  const datePicker = (inp) => {
    if (inp._dp) return;
    const id = inp.id || (inp.id = "dt-" + P.uid());
    const lbl = document.querySelector(`label[for="${id}"]`);
    if (lbl && !lbl.id) lbl.id = id + "-l";
    const name = (lbl?.textContent.trim() || inp.getAttribute("aria-label") || "Data");
    const trg = document.createElement("button");
    trg.type = "button";
    trg.id = id + "-t";
    trg.className = inp.className + " mselect mdate";
    if (inp.getAttribute("style")) trg.setAttribute("style", inp.getAttribute("style"));
    trg.setAttribute("aria-haspopup", "dialog");
    trg.setAttribute("aria-expanded", "false");
    trg.setAttribute("aria-labelledby", `${lbl ? lbl.id : id + "-n"} ${trg.id}`); // "De, 30 set. 2026"
    trg.innerHTML = `${lbl ? "" : `<span class="sr-only" id="${id}-n">${esc(name)}</span>`}${icon("calendar", "mdate__ic")}<span class="mselect__v"><span class="mselect__t"></span></span>`;
    P.hydrateIcons(trg);
    inp.after(trg);
    inp.classList.add("mselect__native");
    inp.tabIndex = -1;
    inp._dp = trg;
    inp.focus = () => trg.focus();
    lbl?.addEventListener("click", (e) => { e.preventDefault(); trg.focus(); });

    const sync = (dir = 0) => {
      trg.disabled = inp.disabled;
      ["aria-invalid", "aria-describedby"].forEach((a) => (inp.hasAttribute(a) ? trg.setAttribute(a, inp.getAttribute(a)) : trg.removeAttribute(a)));
      const d = parseIso(INP_VALUE.get.call(inp));
      const text = d ? shortDate(d) : inp.getAttribute("placeholder") || "dd/mm/aaaa";
      trg.classList.toggle("is-empty", !d);
      const v = $(".mselect__v", trg);
      const cur = $(".mselect__t:not(.is-out)", v);
      if (cur.textContent === text) return;
      if (!dir || reduced) { $$(".mselect__t.is-out", v).forEach((x) => x.remove()); cur.textContent = text; return; }
      const nu = document.createElement("span");
      nu.className = "mselect__t is-in";
      nu.textContent = text;
      [cur, nu].forEach((x) => x.style.setProperty("--dir", dir));
      cur.classList.add("is-out");
      v.append(nu);
      setTimeout(() => cur.remove(), 400);
    };
    Object.defineProperty(inp, "value", { configurable: true, get() { return INP_VALUE.get.call(this); }, set(x) { INP_VALUE.set.call(this, x); sync(); } });
    Object.defineProperty(inp, "valueAsDate", { configurable: true, get() { const d = parseIso(this.value); return d && new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); }, set(x) { this.value = x ? x.toISOString().slice(0, 10) : ""; } });
    new MutationObserver(() => sync()).observe(inp, { attributes: true, attributeFilter: ["disabled", "aria-invalid", "aria-describedby", "min", "max", "value"] });
    sync();

    let api = null, keyAt = 0;
    const openCal = () => {
      ms.cur?.close(false);
      const r = trg.getBoundingClientRect();
      const min = parseIso(inp.min), max = parseIso(inp.max), today = new Date();
      const clamp = (d) => (min && d < min ? min : max && d > max ? max : d);
      const off = (d) => (min && d < min) || (max && d > max);
      const value = () => parseIso(INP_VALUE.get.call(inp));
      let act = clamp(value() || new Date(today.getFullYear(), today.getMonth(), today.getDate()));
      let shown = null; // primeiro dia do mês à vista

      const pop = document.createElement("div");
      pop.className = "mselect-pop mdate-pop";
      pop.setAttribute("role", "dialog");
      pop.setAttribute("aria-label", `${name}: escolher data`);
      pop.innerHTML = `<div class="mselect-pop__in mdate__in">
        <div class="mdate__head">
          <button type="button" class="icon-btn icon-btn--sm" data-m="-1" aria-label="Mês anterior">${icon("chevron-left")}</button>
          <div class="mdate__title mselect__v" id="${id}-cap" aria-live="polite"><span class="mselect__t"></span></div>
          <button type="button" class="icon-btn icon-btn--sm" data-m="1" aria-label="Próximo mês">${icon("chevron-right")}</button>
        </div>
        <div class="mdate__grid" role="grid" aria-labelledby="${id}-cap">
          <div class="mdate__row" role="row">${WEEK.map((w) => `<span class="mdate__wd" role="columnheader" aria-label="${w}">${w[0].toUpperCase()}</span>`).join("")}</div>
          <div class="mdate__body"><div class="mselect__hl" aria-hidden="true"></div><div class="mdate__days" role="rowgroup"></div></div>
        </div>
        <div class="mdate__foot"><button type="button" class="btn btn--ghost btn--sm" data-today${off(today) ? " disabled" : ""}>Hoje</button></div>
      </div>`;
      P.hydrateIcons(pop);
      document.body.append(pop);
      const inner = $(".mdate__in", pop), hl = $(".mselect__hl", pop), daysEl = $(".mdate__days", pop), cap = $(".mdate__title", pop);

      // Destaque em duas dimensões: desliza até o dia ativo (ou o dia sob o ponteiro)
      const glideTo = (el, instant) => {
        if (!el) { hl.style.opacity = "0"; return; }
        hl.style.transition = instant ? "none" : "";
        hl.style.transform = `translate(${el.offsetLeft}px, ${el.offsetTop}px)`;
        hl.style.width = el.offsetWidth + "px";
        hl.style.height = el.offsetHeight + "px";
        hl.style.opacity = "1";
        if (instant) void hl.offsetWidth;
      };
      const cell = (d) => $(`[data-iso="${isoOf(d)}"]`, daysEl);

      // Mês à vista: 6 semanas fixas (a altura não pula); dir faz o título rolar e os dias entrarem pelo lado certo
      const render = (dir = 0) => {
        shown = new Date(act.getFullYear(), act.getMonth(), 1);
        const start = addDays(shown, -shown.getDay()), sel = value(), tIso = isoOf(today);
        let rows = "";
        for (let w = 0; w < 6; w++) {
          rows += `<div class="mdate__row" role="row">`;
          for (let k = 0; k < 7; k++) {
            const d = addDays(start, w * 7 + k), iso = isoOf(d);
            const out = d.getMonth() !== shown.getMonth(), dis = off(d), on = sel && iso === isoOf(sel);
            rows += `<span role="gridcell" aria-selected="${!!on}"><button type="button" class="mdate__day${out ? " is-out" : ""}${iso === tIso ? " is-today" : ""}${on ? " is-sel" : ""}" data-iso="${iso}" tabindex="-1" aria-label="${longDate(d)}${iso === tIso ? ", hoje" : ""}"${dis ? ' aria-disabled="true"' : ""}>${d.getDate()}</button></span>`;
          }
          rows += `</div>`;
        }
        const title = `${MONTHS[shown.getMonth()]} de ${shown.getFullYear()}`;
        const t = $(".mselect__t:not(.is-out)", cap);
        if (!dir || reduced || !t.textContent) { $$(".mselect__t.is-out", cap).forEach((x) => x.remove()); t.textContent = title; }
        else if (t.textContent !== title) {
          const nu = document.createElement("span");
          nu.className = "mselect__t is-in";
          nu.textContent = title;
          [t, nu].forEach((x) => x.style.setProperty("--dir", dir));
          t.classList.add("is-out");
          cap.append(nu);
          setTimeout(() => t.remove(), 400);
        }
        daysEl.innerHTML = rows;
        if (dir) daysEl.animate(reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: `translateX(${dir * 16}px)` }, { opacity: 1, transform: "none" }], { duration: reduced ? 120 : 220, easing: cssVar("--ease-out") || "ease-out" });
        $('[data-m="-1"]', pop).disabled = !!(min && shown <= new Date(min.getFullYear(), min.getMonth(), 1));
        $('[data-m="1"]', pop).disabled = !!(max && shown >= new Date(max.getFullYear(), max.getMonth(), 1));
      };
      const setAct = (d, { focus = true, instant = false } = {}) => {
        d = clamp(d);
        const dir = d.getFullYear() * 12 + d.getMonth() - (act.getFullYear() * 12 + act.getMonth());
        act = d;
        if (dir || !cell(d) || cell(d).classList.contains("is-out")) render(Math.sign(dir));
        $$(".mdate__day", daysEl).forEach((b) => b.setAttribute("tabindex", "-1"));
        const el = cell(d);
        el.setAttribute("tabindex", "0");
        glideTo(el, instant || !!dir);
        if (focus) el.focus({ preventScroll: true });
      };

      // Tamanho final: o calendário logo abaixo do gatilho (ou acima, sem espaço), sem sair da tela
      render();
      const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      const w = Math.min(Math.ceil(pop.getBoundingClientRect().width), vw - 24), h = pop.offsetHeight;
      let left = Math.max(12, Math.min(r.left, vw - 12 - w));
      let top = r.bottom + 6;
      if (top + h > vh - 12) top = r.top - 6 - h >= 12 ? r.top - 6 - h : Math.max(12, vh - 12 - h);
      Object.assign(pop.style, { left: left + "px", top: top + "px", width: w + "px", height: h + "px" });
      inner.style.width = w - 2 + "px";

      const from = { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", borderRadius: cssVar("--r-control") };
      const to = { left: left + "px", top: top + "px", width: w + "px", height: h + "px", borderRadius: cssVar("--r-metric") };
      if (reduced) pop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
      else {
        pop.animate([from, to], { duration: parseFloat(cssVar("--dur-spring-morph")) || 480, easing: cssVar("--spring-morph") || "ease-out" });
        inner.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay: 60, easing: "ease-out", fill: "backwards" });
      }
      setAct(act, { instant: true });

      const pick = (d) => {
        if (!d || off(d)) return;
        const prev = value(), iso = isoOf(d);
        api.close(true);
        if (prev && isoOf(prev) === iso) return;
        INP_VALUE.set.call(inp, iso);
        sync(prev ? Math.sign(d - prev) : 0);
        inp.dispatchEvent(new Event("input", { bubbles: true }));
        inp.dispatchEvent(new Event("change", { bubbles: true }));
      };
      pop.addEventListener("keydown", (e) => {
        const onDay = e.target.classList.contains("mdate__day");
        const go = (d) => { e.preventDefault(); setAct(d); };
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); api.close(true); }
        else if (e.key === "Tab") { // o foco circula dentro do calendário: setas do mês, dia, Hoje
          const ring = [$('[data-m="-1"]', pop), $('[data-m="1"]', pop), cell(act), $("[data-today]", pop)].filter((x) => !x.disabled);
          const i = ring.indexOf(e.target);
          e.preventDefault();
          ring[(i + (e.shiftKey ? -1 : 1) + ring.length) % ring.length].focus();
        }
        else if (e.key === "PageUp") go(e.shiftKey ? addMonths(act, -12) : addMonths(act, -1));
        else if (e.key === "PageDown") go(e.shiftKey ? addMonths(act, 12) : addMonths(act, 1));
        else if (!onDay) return;
        else if (e.key === "ArrowLeft") go(addDays(act, -1));
        else if (e.key === "ArrowRight") go(addDays(act, 1));
        else if (e.key === "ArrowUp") go(addDays(act, -7));
        else if (e.key === "ArrowDown") go(addDays(act, 7));
        else if (e.key === "Home") go(addDays(act, -act.getDay()));
        else if (e.key === "End") go(addDays(act, 6 - act.getDay()));
        else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(act); }
      });
      pop.addEventListener("click", (e) => {
        const m = e.target.closest("[data-m]");
        if (m) { setAct(addMonths(act, +m.dataset.m), { focus: false }); m.disabled ? cell(act).focus() : m.focus(); return; }
        if (e.target.closest("[data-today]")) { pick(new Date(today.getFullYear(), today.getMonth(), today.getDate())); return; }
        const b = e.target.closest(".mdate__day");
        if (b && !b.hasAttribute("aria-disabled")) pick(parseIso(b.dataset.iso));
      });
      pop.addEventListener("pointermove", (e) => { if (!P.fine) return; const b = e.target.closest(".mdate__day:not([aria-disabled])"); glideTo(b || cell(act)); });
      pop.addEventListener("pointerleave", () => glideTo(cell(act)));
      const onDown = (e) => { if (!pop.contains(e.target) && !trg.contains(e.target)) api.close(false); };
      const onScroll = (e) => { if (!pop.contains(e.target)) api.close(false); };
      const onFocus = (e) => { if (!pop.contains(e.target) && e.target !== trg) api.close(false); };
      const vw0 = innerWidth;
      const onResize = () => { if (innerWidth !== vw0) api.close(false); }; // a barra do navegador no celular muda só a altura
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("focusin", onFocus);
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);
      trg.setAttribute("aria-expanded", "true");

      api = ms.cur = {
        close: (focus = true) => {
          if (ms.cur !== api) return;
          ms.cur = null;
          document.removeEventListener("pointerdown", onDown, true);
          document.removeEventListener("focusin", onFocus);
          window.removeEventListener("scroll", onScroll, true);
          window.removeEventListener("resize", onResize);
          trg.setAttribute("aria-expanded", "false");
          pop.style.pointerEvents = "none";
          if (focus && trg.isConnected) trg.focus({ preventScroll: true });
          const a = reduced || !trg.isConnected
            ? pop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100, fill: "forwards" })
            : (inner.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: "forwards" }), pop.animate([to, { ...to, offset: 0.15 }, from], { duration: 200, easing: cssVar("--ease-out") || "ease-out", fill: "forwards" }));
          a.onfinish = () => pop.remove();
          setTimeout(() => pop.remove(), 400); // aba em segundo plano não roda a animação
        },
      };
    };

    trg.addEventListener("click", () => {
      if (performance.now() - keyAt < 400) return;
      if (api && ms.cur === api) api.close(true); else openCal();
    });
    trg.addEventListener("keydown", (e) => {
      if (api && ms.cur === api) return;
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); keyAt = performance.now(); openCal(); }
    });
  };

  /* ───────────────────────── Seletor de período ─────────────────────────
   * rangePicker(fromInp, toInp, { label }) troca dois campos de data por um gatilho só ("30 set. – 6 out. 2026") e um
   * calendário com dois meses lado a lado (um no celular). Primeiro clique marca o início, o segundo marca o fim e
   * fecha; antes do segundo, passar o ponteiro pré-visualiza a faixa. Clicar antes do início recomeça dali. Os inputs
   * seguem donos do valor (AAAA-MM-DD): `input`/`change` saem deles, e `.value = x` por código atualiza o gatilho.
   * Teclado: setas movem o dia, PageUp/PageDown trocam o mês, Enter/Espaço escolhe, Esc fecha sem mudar nada.
   * `max` do campo final (ou hoje) desliga os dias depois dele. */
  const rangeLabel = (a, b) => {
    if (!a || !b) return "Escolha o período";
    const d = (x) => `${x.getDate()} ${MONTHS[x.getMonth()].slice(0, 3)}.`.replace("maio.", "maio");
    return a.getFullYear() === b.getFullYear() ? `${d(a)} – ${d(b)} ${b.getFullYear()}` : `${shortDate(a)} – ${shortDate(b)}`;
  };
  const rangePicker = (fromInp, toInp, { label = "Período" } = {}) => {
    if (fromInp._rp) return fromInp._rp;
    const id = fromInp.id || (fromInp.id = "rg-" + P.uid());
    const trg = document.createElement("button");
    trg.type = "button";
    trg.id = id + "-t";
    trg.className = "input mselect mdate mrange-trg";
    trg.setAttribute("aria-haspopup", "dialog");
    trg.setAttribute("aria-expanded", "false");
    trg.innerHTML = `${icon("calendar", "mdate__ic")}<span class="mselect__v"><span class="mselect__t"></span></span>`;
    P.hydrateIcons(trg);
    fromInp.before(trg);
    [fromInp, toInp].forEach((x) => { x.classList.add("mselect__native"); x.tabIndex = -1; });
    fromInp.focus = toInp.focus = () => trg.focus();
    const get = (x) => parseIso(INP_VALUE.get.call(x));
    const sync = () => {
      const text = rangeLabel(get(fromInp), get(toInp));
      $(".mselect__t", trg).textContent = text;
      trg.setAttribute("aria-label", `${label}: ${text}`);
      ["aria-invalid", "aria-describedby"].forEach((a) => (toInp.hasAttribute(a) ? trg.setAttribute(a, toInp.getAttribute(a)) : trg.removeAttribute(a)));
    };
    [fromInp, toInp].forEach((x) => {
      Object.defineProperty(x, "value", { configurable: true, get() { return INP_VALUE.get.call(this); }, set(v) { INP_VALUE.set.call(this, v); sync(); } });
      new MutationObserver(sync).observe(x, { attributes: true, attributeFilter: ["aria-invalid", "aria-describedby"] });
    });
    sync();

    let api = null, keyAt = 0;
    const openCal = () => {
      ms.cur?.close(false);
      const r = trg.getBoundingClientRect();
      const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
      const count = vw < 640 ? 1 : 2;
      const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const max = parseIso(toInp.max) || today, min = parseIso(fromInp.min);
      const off = (d) => (min && d < min) || (max && d > max);
      const clamp = (d) => (min && d < min ? min : max && d > max ? max : d);
      let start = get(fromInp), end = get(toInp), hover = null;
      if (start && end && start > end) [start, end] = [end, start];
      let act = clamp(end || start || today);
      // O mês da direita mostra o fim do período; o da esquerda, o anterior
      let first = new Date(act.getFullYear(), act.getMonth() - (count - 1), 1);

      const pop = document.createElement("div");
      pop.className = "mselect-pop mdate-pop mrange-pop";
      pop.setAttribute("role", "dialog");
      pop.setAttribute("aria-label", `${label}: escolher datas de início e fim`);
      pop.innerHTML = `<div class="mselect-pop__in mdate__in">
        <div class="mrange__months"></div>
        <button type="button" class="icon-btn icon-btn--sm mrange__nav mrange__nav--prev" data-m="-1" aria-label="Mês anterior">${icon("chevron-left")}</button>
        <button type="button" class="icon-btn icon-btn--sm mrange__nav mrange__nav--next" data-m="1" aria-label="Próximo mês">${icon("chevron-right")}</button>
        <div class="mrange__foot"><span class="mrange__status" aria-live="polite"></span></div>
      </div>`;
      P.hydrateIcons(pop);
      document.body.append(pop);
      const inner = $(".mdate__in", pop), monthsEl = $(".mrange__months", pop), status = $(".mrange__status", pop);
      const cell = (d) => $(`[data-iso="${isoOf(d)}"]:not(.is-out)`, monthsEl);

      const month = (m0) => {
        const s = addDays(m0, -m0.getDay());
        let rows = "";
        for (let w = 0; w < 6; w++) {
          rows += `<div class="mdate__row" role="row">`;
          for (let k = 0; k < 7; k++) {
            const d = addDays(s, w * 7 + k), iso = isoOf(d), out = d.getMonth() !== m0.getMonth();
            rows += out
              ? `<span role="gridcell" class="mrange__cell"><span class="mdate__day is-out" aria-hidden="true"></span></span>`
              : `<span role="gridcell" class="mrange__cell"><button type="button" class="mdate__day${iso === isoOf(today) ? " is-today" : ""}" data-iso="${iso}" tabindex="-1" aria-label="${longDate(d)}${iso === isoOf(today) ? ", hoje" : ""}"${off(d) ? ' aria-disabled="true"' : ""}>${d.getDate()}</button></span>`;
          }
          rows += `</div>`;
        }
        const cap = `${MONTHS[m0.getMonth()]} de ${m0.getFullYear()}`;
        return `<div class="mrange__month"><div class="mdate__title mrange__cap" id="${id}-c${m0.getMonth()}">${cap}</div>
          <div class="mdate__grid" role="grid" aria-labelledby="${id}-c${m0.getMonth()}">
            <div class="mdate__row" role="row">${WEEK.map((w) => `<span class="mdate__wd" role="columnheader" aria-label="${w}">${w[0].toUpperCase()}</span>`).join("")}</div>
            <div class="mdate__days" role="rowgroup">${rows}</div>
          </div></div>`;
      };
      // Pinta a faixa: início e fim cheios, dias do meio com o fundo contínuo; sem fim, o ponteiro faz as vezes dele
      const paint = () => {
        const a = start, b = end || (start && hover && hover >= start ? hover : null);
        const ai = a && isoOf(a), bi = b && isoOf(b);
        $$("button.mdate__day", monthsEl).forEach((el) => {
          const iso = el.dataset.iso, c = el.parentNode;
          const inR = ai && bi && iso > ai && iso < bi;
          const isA = iso === ai, isB = iso === (bi || ai);
          el.classList.toggle("is-sel", isA || (!!bi && iso === bi));
          c.classList.toggle("is-in", !!inR);
          c.classList.toggle("is-start", !!(isA && bi && bi !== ai));
          c.classList.toggle("is-end", !!(bi && iso === bi && bi !== ai));
          c.classList.toggle("is-preview", !end && !!(inR || (bi && iso === bi && bi !== ai)));
          c.setAttribute("aria-selected", String(!!(isA || isB || inR)));
        });
        status.textContent = !start ? "Escolha a data de início" : !end ? `Início em ${shortDate(start)}. Agora escolha o fim.` : rangeLabel(start, end);
      };
      const render = (dir = 0) => {
        let html = "";
        for (let i = 0; i < count; i++) html += month(new Date(first.getFullYear(), first.getMonth() + i, 1));
        monthsEl.innerHTML = html;
        if (dir) monthsEl.animate(reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: `translateX(${dir * 16}px)` }, { opacity: 1, transform: "none" }], { duration: reduced ? 120 : 220, easing: cssVar("--ease-out") || "ease-out" });
        const last = new Date(first.getFullYear(), first.getMonth() + count - 1, 1);
        $('[data-m="-1"]', pop).disabled = !!(min && first <= new Date(min.getFullYear(), min.getMonth(), 1));
        $('[data-m="1"]', pop).disabled = !!(max && last >= new Date(max.getFullYear(), max.getMonth(), 1));
        paint();
      };
      const shift = (n) => { first = new Date(first.getFullYear(), first.getMonth() + n, 1); render(Math.sign(n)); };
      const setAct = (d, { focus = true } = {}) => {
        act = clamp(d);
        const mi = act.getFullYear() * 12 + act.getMonth(), fi = first.getFullYear() * 12 + first.getMonth();
        if (mi < fi) shift(mi - fi); else if (mi > fi + count - 1) shift(mi - fi - count + 1);
        $$("button.mdate__day", monthsEl).forEach((b) => b.setAttribute("tabindex", "-1"));
        const el = cell(act);
        el?.setAttribute("tabindex", "0");
        if (!end && start && !P.fine) { hover = act; paint(); }
        if (focus) el?.focus({ preventScroll: true });
      };

      render();
      const w = Math.min(Math.ceil(pop.getBoundingClientRect().width), vw - 24), h = pop.offsetHeight;
      const left = Math.max(12, Math.min(r.left, vw - 12 - w));
      let top = r.bottom + 6;
      if (top + h > vh - 12) top = r.top - 6 - h >= 12 ? r.top - 6 - h : Math.max(12, vh - 12 - h);
      Object.assign(pop.style, { left: left + "px", top: top + "px", width: w + "px", height: h + "px" });
      inner.style.width = w - 2 + "px";
      const from = { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", borderRadius: cssVar("--r-control") };
      const to = { left: left + "px", top: top + "px", width: w + "px", height: h + "px", borderRadius: cssVar("--r-metric") };
      if (reduced) pop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
      else {
        pop.animate([from, to], { duration: parseFloat(cssVar("--dur-spring-morph")) || 480, easing: cssVar("--spring-morph") || "ease-out" });
        inner.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, delay: 60, easing: "ease-out", fill: "backwards" });
      }
      setAct(act);

      const commit = () => {
        const changed = isoOf(start) !== INP_VALUE.get.call(fromInp) || isoOf(end) !== INP_VALUE.get.call(toInp);
        INP_VALUE.set.call(fromInp, isoOf(start));
        INP_VALUE.set.call(toInp, isoOf(end));
        sync();
        api.close(true);
        if (!changed) return;
        [fromInp, toInp].forEach((x) => ["input", "change"].forEach((t) => x.dispatchEvent(new Event(t, { bubbles: true }))));
      };
      // Primeiro toque abre um período novo; o segundo fecha (se vier antes do início, vira o novo início)
      const pick = (d) => {
        if (!d || off(d)) return;
        if (!start || end || d < start) { start = d; end = null; hover = null; act = d; paint(); return; }
        end = d;
        paint();
        setTimeout(commit, reduced ? 0 : 160);
      };
      pop.addEventListener("keydown", (e) => {
        const onDay = e.target.classList.contains("mdate__day");
        const go = (d) => { e.preventDefault(); setAct(d); };
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); api.close(true); }
        else if (e.key === "Tab") {
          const ring = [$('[data-m="-1"]', pop), $('[data-m="1"]', pop), cell(act)].filter((x) => x && !x.disabled);
          e.preventDefault();
          ring[(ring.indexOf(e.target) + (e.shiftKey ? -1 : 1) + ring.length) % ring.length].focus();
        }
        else if (e.key === "PageUp") go(addMonths(act, -1));
        else if (e.key === "PageDown") go(addMonths(act, 1));
        else if (!onDay) return;
        else if (e.key === "ArrowLeft") go(addDays(act, -1));
        else if (e.key === "ArrowRight") go(addDays(act, 1));
        else if (e.key === "ArrowUp") go(addDays(act, -7));
        else if (e.key === "ArrowDown") go(addDays(act, 7));
        else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(act); }
      });
      pop.addEventListener("click", (e) => {
        const m = e.target.closest("[data-m]");
        if (m) { shift(+m.dataset.m); (m.disabled ? $("button.mdate__day", monthsEl) : m).focus(); return; }
        const b = e.target.closest("button.mdate__day");
        if (b && !b.hasAttribute("aria-disabled")) { act = parseIso(b.dataset.iso); pick(act); }
      });
      pop.addEventListener("pointermove", (e) => {
        if (!start || end) return;
        const b = e.target.closest("button.mdate__day:not([aria-disabled])");
        const d = b ? parseIso(b.dataset.iso) : null;
        if ((d && isoOf(d)) === (hover && isoOf(hover))) return;
        hover = d;
        paint();
      });
      pop.addEventListener("pointerleave", () => { if (hover) { hover = null; paint(); } });
      const onDown = (e) => { if (!pop.contains(e.target) && !trg.contains(e.target)) api.close(false); };
      const onScroll = (e) => { if (!pop.contains(e.target)) api.close(false); };
      const onFocus = (e) => { if (!pop.contains(e.target) && e.target !== trg) api.close(false); };
      const vw0 = innerWidth;
      const onResize = () => { if (innerWidth !== vw0) api.close(false); };
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("focusin", onFocus);
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);
      trg.setAttribute("aria-expanded", "true");

      api = ms.cur = {
        close: (focus = true) => {
          if (ms.cur !== api) return;
          ms.cur = null;
          document.removeEventListener("pointerdown", onDown, true);
          document.removeEventListener("focusin", onFocus);
          window.removeEventListener("scroll", onScroll, true);
          window.removeEventListener("resize", onResize);
          trg.setAttribute("aria-expanded", "false");
          pop.style.pointerEvents = "none";
          if (focus && trg.isConnected) trg.focus({ preventScroll: true });
          const r2 = trg.getBoundingClientRect();
          const end2 = { left: r2.left + "px", top: r2.top + "px", width: r2.width + "px", height: r2.height + "px", borderRadius: cssVar("--r-control"), opacity: 0 };
          const a = reduced || !trg.isConnected
            ? pop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100, fill: "forwards" })
            : (inner.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: "forwards" }), pop.animate([{ ...to, opacity: 1 }, { ...to, opacity: 1, offset: 0.15 }, end2], { duration: 220, easing: cssVar("--ease-out") || "ease-out", fill: "forwards" }));
          a.onfinish = () => pop.remove();
          setTimeout(() => pop.remove(), 400);
        },
      };
    };
    trg.addEventListener("click", () => {
      if (performance.now() - keyAt < 400) return;
      if (api && ms.cur === api) api.close(true); else openCal();
    });
    trg.addEventListener("keydown", (e) => {
      if (api && ms.cur === api) return;
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); keyAt = performance.now(); openCal(); }
    });
    return (fromInp._rp = trg);
  };

  const enhanceFields = (root = document) => {
    if (root.matches?.("select.select")) morphSelect(root);
    if (root.matches?.("input[list]")) suggest(root);
    if (root.matches?.("input[type=date].input")) datePicker(root);
    root.querySelectorAll?.("select.select").forEach(morphSelect);
    root.querySelectorAll?.("input[list]").forEach(suggest);
    root.querySelectorAll?.("input[type=date].input").forEach(datePicker);
  };
  enhanceFields();
  new MutationObserver((list) => list.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && enhanceFields(n)))).observe(document.body, { childList: true, subtree: true });

  /* Liga [data-soon] (Pós-MVP) e [data-toast] */
  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-soon]");
    if (s) { e.preventDefault(); toast(`${s.dataset.soon || "Esse recurso"} chega depois do MVP`, { icon: "clock" }); return; }
    const t = e.target.closest("[data-toast]");
    if (t) toast(t.dataset.toast, { icon: t.dataset.toastIcon || "check-circle" });
  });

  Object.assign(P, {
    toast, popover, menu, closePopover: close, place, modal, confirm, sheet, busy, run,
    selectTab, indicators, moveInd, rangePicker, bindFields, autoresize, validate, rules,
    skeleton, loading, empty, errorState, load, ticker, reveal,
    crystal, crystalBadge, verified, rating, model, modelIcon, agentAvatar, layers, galleryCard, favToggle, chatWith, SKILL_ICON,
  });
})();
