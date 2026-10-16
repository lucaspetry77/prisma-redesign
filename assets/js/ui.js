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
   * toast(msg, { icon, action: { label, onClick }, danger, duration }) — até 3 visíveis, o novo na frente. */
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
    t.innerHTML = `${ic === "check-circle" ? `<svg class="i check-draw" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35"/><path d="M8.5 12.5l2.5 2.5 4.5-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>` : icon(ic)}<span class="toast__msg">${esc(msg)}</span>${opts.action ? `<button type="button" class="toast__action">${esc(opts.action.label)}</button>` : ""}`;
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
    P.hydrateIcons(el);
    document.body.append(el);
    place(el, anchor, opts);
    anchor.setAttribute("aria-expanded", "true");
    open = { el, anchor, onClose: opts.onClose, at: performance.now(), opts };
    el._reposition = () => place(el, anchor, opts);
    if (opts.focus !== false) requestAnimationFrame(() => (opts.initialFocus ? $(opts.initialFocus, el) : focusables(el)[0])?.focus({ preventScroll: true }));
    return el;
  };

  /** menu(anchor, items, opts) — items: { label, icon, onClick, danger, disabled, soon, kbd, checked, sep, heading } */
  const menu = (anchor, items, opts = {}) => {
    const body = items.map((it, i) => {
      if (it.sep) return `<div class="menu__sep" role="separator"></div>`;
      if (it.heading) return `<div class="menu__head">${esc(it.heading)}</div>`;
      if (it.label2) return `<div class="menu__label">${esc(it.label2)}</div>`;
      const role = it.checked === undefined ? "menuitem" : "menuitemradio";
      return `<button type="button" role="${role}" class="menu__item ${it.danger ? "menu__item--danger" : ""}" data-i="${i}" ${it.disabled ? "disabled" : ""} ${it.checked !== undefined ? `aria-checked="${!!it.checked}"` : ""}>${it.icon ? icon(it.icon) : ""}<span class="grow">${esc(it.label)}</span>${it.soon ? `<span class="badge badge--soon">Pós-MVP</span>` : ""}${it.kbd ? `<span class="row" style="gap:2px">${P.keys.kbd(it.kbd)}</span>` : ""}${it.checked !== undefined ? icon("check", "menu__check i--sm") : ""}</button>`;
    }).join("");
    const el = popover(anchor, body, { ...opts, role: "menu", className: "menu " + (opts.className || "") });
    if (!el) return null;
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
    const items = $$(".menu__item:not(:disabled), [data-nav-item]", open.el);
    if (!items.length) { if (e.key === "Tab" && open.opts.trapTab !== true) close(false); return; }
    const i = items.indexOf(document.activeElement);
    const go = (n) => { e.preventDefault(); items[(n + items.length) % items.length]?.focus(); };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
    else if (e.key === "Tab") close(false);
  }, true);
  document.addEventListener("pointerdown", (e) => {
    if (open && !open.el.contains(e.target) && !open.anchor.contains(e.target)) close(false);
  });
  addEventListener("resize", () => close(false));
  document.addEventListener("scroll", (e) => {
    if (open && !open.el.contains(e.target) && performance.now() - open.at > 300) close(false);
  }, true);

  /* ───────────────────────── Dica (tooltip) ─────────────────────────
   * Qualquer elemento com data-tip="Texto" (e data-tip-kbd="mod+k"). Aparece após 250 ms;
   * entre dicas vizinhas, na hora. Também no foco por teclado. */
  let tipEl = null, tipTimer = 0, tipWarm = 0;
  const showTip = (target) => {
    hideTip();
    const text = target.dataset.tip;
    if (!text) return;
    tipEl = document.createElement("div");
    tipEl.className = "tooltip";
    tipEl.setAttribute("role", "tooltip");
    tipEl.innerHTML = `<span>${esc(text)}</span>${target.dataset.tipKbd ? `<span class="row" style="gap:2px">${P.keys.kbd(target.dataset.tipKbd)}</span>` : ""}`;
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
    const ind = list.querySelector(":scope > .seg__ind, :scope > .tabs__ind");
    if (!ind) return;
    const on = list.querySelector('[aria-selected="true"], [aria-current="page"], [aria-pressed="true"]');
    if (!on) { ind.style.opacity = "0"; return; }
    ind.style.opacity = "1";
    list.style.setProperty("--ind-x", on.offsetLeft + "px");
    list.style.setProperty("--ind-w", on.offsetWidth + "px");
  };
  const indicators = (root = document) => {
    $$(".seg, .tabs", root).forEach((list) => {
      if (!list._ind) {
        list._ind = true;
        const cls = list.classList.contains("tabs") ? "tabs__ind" : "seg__ind";
        const ind = document.createElement("span");
        ind.className = cls;
        ind.setAttribute("aria-hidden", "true");
        list.prepend(ind);
        // Primeira medida sem transição, para não "deslizar" do zero
        ind.style.transition = "none";
        list.classList.add("has-ind");
        moveInd(list);
        requestAnimationFrame(() => requestAnimationFrame(() => (ind.style.transition = "")));
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
    cards: (n = 6, cls = "") => Array.from({ length: n }, () => `<div class="card skel-card ${cls}" aria-hidden="true"><div class="row" style="gap:12px"><div class="skel skel--circle" style="width:40px;height:40px;border-radius:10px"></div><div class="grow stack" style="--gap:8px"><div class="skel skel--title" style="width:55%"></div><div class="skel skel--line" style="width:35%;height:10px"></div></div></div>${skeleton.lines(2)}</div>`).join(""),
    rows: (n = 5) => Array.from({ length: n }, () => `<div class="list-item" aria-hidden="true"><div class="skel" style="width:28px;height:28px;border-radius:8px"></div><div class="grow stack" style="--gap:6px"><div class="skel skel--line" style="width:45%"></div><div class="skel skel--line" style="width:25%;height:9px"></div></div><div class="skel skel--line" style="width:60px"></div></div>`).join(""),
    table: (cols = 5, n = 5) => Array.from({ length: n }, () => `<tr aria-hidden="true">${Array.from({ length: cols }, (_, i) => `<td><div class="skel skel--line" style="width:${i === 0 ? 70 : 50}%"></div></td>`).join("")}</tr>`).join(""),
  };
  const loading = (label = "Carregando") => `<span class="sr-only" role="status">${esc(label)}…</span>`;

  /** empty({ icon, title, text, actions:[{label, href|act, variant, icon}], steps:[], center, plain }) */
  const empty = ({ icon: ic, title, text = "", actions = [], steps = [], center = false, plain = false, cls = "" }) => `
    <div class="empty ${center ? "empty--center" : ""} ${plain ? "empty--plain" : ""} ${cls}">
      ${ic ? `<span class="icon-chip icon-chip--lg">${icon(ic)}</span>` : ""}
      <p class="empty__title">${esc(title)}</p>
      ${text ? `<p class="empty__text">${text}</p>` : ""}
      ${steps.length ? `<ol class="empty__steps">${steps.map((s) => `<li>${s}</li>`).join("")}</ol>` : ""}
      ${actions.length ? `<div class="empty__actions">${actions.map((a) => a.href ? `<a class="btn btn--${a.variant || "secondary"}" href="${a.href}">${a.icon ? icon(a.icon) : ""}${esc(a.label)}</a>` : `<button type="button" class="btn btn--${a.variant || "secondary"}" data-act="${a.act || ""}">${a.icon ? icon(a.icon) : ""}${esc(a.label)}</button>`).join("")}</div>` : ""}
    </div>`;

  /** errorState(message, { retry: "data-act" }) — erro recuperável com tentar de novo */
  const errorState = (message, { title = "Não deu para carregar", compact = false } = {}) => `
    <div class="alert alert--danger" role="alert" ${compact ? "" : 'style="padding:16px 18px"'}>
      ${icon("danger")}
      <div class="alert__body">
        <p><strong>${esc(title)}</strong><br>${esc(message || "Verifique a conexão e tente de novo.")}</p>
        <div><button type="button" class="btn btn--secondary btn--sm" data-retry>${icon("refresh")}Tentar de novo</button></div>
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
      : `<span aria-hidden="true">${esc(ch)}</span>`).join("");
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

  /* Liga [data-soon] (Pós-MVP) e [data-toast] */
  document.addEventListener("click", (e) => {
    const s = e.target.closest("[data-soon]");
    if (s) { e.preventDefault(); toast(`${s.dataset.soon || "Esse recurso"} chega depois do MVP`, { icon: "clock" }); return; }
    const t = e.target.closest("[data-toast]");
    if (t) toast(t.dataset.toast, { icon: t.dataset.toastIcon || "check-circle" });
  });

  Object.assign(P, {
    toast, popover, menu, closePopover: close, place, modal, confirm, sheet, busy, run,
    selectTab, indicators, moveInd, bindFields, autoresize, validate, rules,
    skeleton, loading, empty, errorState, load, ticker, reveal,
    crystal, crystalBadge, verified, model, modelIcon, agentAvatar, layers,
  });
})();
