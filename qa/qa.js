/* Asimov Prisma · QA automatizado (qa/index.html)
 * Abre cada tela num iframe e mede, em 375px, 390px e 1280px:
 *  - contraste AA de todo texto visível contra o fundo real (inclui fundo em degradê e placeholder);
 *  - foco visível em todos os elementos focáveis (anel, sombra ou borda mudam ao focar);
 *  - estouro horizontal da página;
 *  - movimento reduzido (?movimento=reduzido): nenhuma animação com deslocamento ou escala rodando,
 *    nem na página, nem num modal, nem num toast.
 * Depois roda os cenários de formulário inválido → válido. Resultado em window.__report (JSON).
 */
(() => {
  const PAGES = [
    "index.html", "chat.html?id=d5c5bdf1", "projetos.html", "projeto.html?id=p2", "skills.html", "skill-nova.html",
    "agentes.html", "agente-novo.html", "galeria.html", "galeria-item.html?id=g-a1", "perfil.html",
    "admin-modelos.html", "admin-uso.html", "admin-usuarios.html", "login.html", "telas.html", "componentes.html",
  ];
  const WIDTHS = [375, 390, 1280];
  const out = document.querySelector("[data-out]");
  const log = (t) => { out.textContent += t + "\n"; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const parse = (c) => {
    if (!c) return null;
    const m = c.match(/[\d.]+/g);
    if (!m) return null;
    const n = m.map(Number);
    if (c.startsWith("color(srgb")) return { rgb: n.slice(0, 3).map((v) => v * 255), a: n.length > 3 ? n[3] : 1 };
    return { rgb: n.slice(0, 3), a: n.length > 3 ? n[3] : 1 };
  };
  const lum = (rgb) => { const [r, g, b] = rgb.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a, b) => { const L1 = lum(a), L2 = lum(b); return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); };

  const open = (url, width) => new Promise((res) => {
    const f = document.createElement("iframe");
    f.style.cssText = `position:fixed;left:-4000px;top:0;width:${width}px;height:820px;border:0`;
    document.body.append(f);
    const errs = [];
    f.onload = () => { f.contentWindow.addEventListener("error", (e) => errs.push(e.message)); setTimeout(() => res({ f, errs }), 1300); };
    f.src = "../" + url + (url.includes("?") ? "&" : "?") + "latencia=10&r=" + Math.random();
  });
  const bgOf = (w, el) => {
    let a = el;
    while (a) {
      const st = w.getComputedStyle(a);
      if (st.backgroundImage && st.backgroundImage.includes("gradient")) {
        const cols = st.backgroundImage.match(/(rgba?\([^)]*\)|color\([^)]*\))/g);
        if (cols && !a.classList.contains("t-silver") && !a.matches(".page-title,.home__title,.detail__name,.login__title,.w")) return parse(cols[0]).rgb;
      }
      const b = parse(st.backgroundColor);
      if (b && b.a > 0.6) return b.rgb;
      a = a.parentElement;
    }
    return [244, 244, 245];
  };

  const contrast = (f) => {
    const d = f.contentDocument, w = f.contentWindow, bad = new Map();
    let checked = 0;
    d.querySelectorAll("body *").forEach((el) => {
      const txt = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(" ");
      if (!txt) return;
      if (el.closest(".sr-only, [hidden], [aria-hidden='true'], .login__art, script, style, template")) return;
      const cs = w.getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) return;
      if (el.closest(":disabled, [aria-disabled='true']")) return; // componentes inativos são isentos (WCAG 1.4.3)
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const fg = parse(cs.color);
      if (!fg) return;
      checked++;
      const size = parseFloat(cs.fontSize), wt = +cs.fontWeight;
      const need = size >= 24 || (size >= 18.66 && wt >= 700) ? 3 : 4.5;
      const rt = ratio(fg.rgb, bgOf(w, el));
      if (rt < need - 0.05) { const k = cs.color + "|" + el.className; if (!bad.has(k)) bad.set(k, { ratio: +rt.toFixed(2), need, text: txt.slice(0, 30), cls: String(el.className).slice(0, 40) }); }
    });
    d.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((el) => {
      if (!el.offsetParent || el.disabled) return;
      checked++;
      const pc = parse(w.getComputedStyle(el, "::placeholder").color);
      const rt = ratio(pc.rgb, bgOf(w, el));
      if (rt < 4.45) bad.set("ph|" + el.id, { ratio: +rt.toFixed(2), need: 4.5, text: "placeholder " + (el.id || el.name || ""), cls: el.className });
    });
    return { checked, failures: [...bad.values()] };
  };

  const focusCheck = async (f) => {
    const d = f.contentDocument, w = f.contentWindow;
    const els = [...d.querySelectorAll("a[href], button:not(:disabled), input:not(:disabled):not([type=hidden]), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex='-1'])")]
      .filter((el) => el.offsetParent !== null && !el.closest("[inert], [hidden], [aria-hidden='true']") && w.getComputedStyle(el).visibility !== "hidden");
    const missing = [];
    for (const el of els) {
      const before = w.getComputedStyle(el);
      const b = { o: before.outlineStyle + before.outlineWidth, s: before.boxShadow, bc: before.borderColor };
      el.focus({ preventScroll: true });
      const st = w.getComputedStyle(el);
      const visible = (st.outlineStyle !== "none" && parseFloat(st.outlineWidth) >= 2) || st.boxShadow !== b.s || st.borderColor !== b.bc;
      // Switch e caixas: o anel fica no irmão visual
      const proxy = el.matches(".switch input") ? el.nextElementSibling : el.matches(".choice input, .nps input") ? el.parentElement : null;
      const proxyOk = proxy && (w.getComputedStyle(proxy).outlineStyle !== "none" || w.getComputedStyle(proxy.querySelector?.("span") || proxy).outlineStyle !== "none");
      if (!visible && !proxyOk) missing.push((el.tagName + "." + String(el.className).split(" ")[0] + " " + (el.getAttribute("aria-label") || el.textContent || "").trim()).slice(0, 60));
      el.blur();
    }
    return { checked: els.length, missing: [...new Set(missing)] };
  };

  const motionCheck = async (f) => {
    const d = f.contentDocument, w = f.contentWindow;
    const moving = (anims) => anims.filter((a) => a.playState === "running").map((a) => {
      const kf = a.effect?.getKeyframes?.() || [];
      const moves = kf.some((k) => (k.transform && k.transform !== "none") || (k.filter && k.filter !== "none" && k.filter.includes("blur")));
      return moves ? (a.animationName || a.transitionProperty || "anim") + "@" + String(a.effect?.target?.className || "").slice(0, 30) : null;
    }).filter(Boolean);
    const page = moving(d.getAnimations());
    w.Prisma?.modal?.({ title: "QA", buttons: [{ label: "Ok" }] });
    w.Prisma?.toast?.("QA");
    await sleep(60);
    const overlay = moving(d.getAnimations());
    const dialog = d.querySelector(".dialog"), toast = d.querySelector(".toast");
    return {
      reducedFlag: !!w.Prisma?.reduced, htmlClass: d.documentElement.classList.contains("reduce-motion"),
      movingOnPage: page, movingWithOverlay: overlay,
      dialogAnim: dialog ? w.getComputedStyle(dialog).animationName + " " + w.getComputedStyle(dialog).animationDuration : "n/a",
      toastAnim: toast ? w.getComputedStyle(toast).animationName + " " + w.getComputedStyle(toast).transform : "n/a",
      springMorph: w.getComputedStyle(d.documentElement).getPropertyValue("--dur-spring-morph").trim(),
    };
  };

  /* Cenários de formulário: inválido → válido */
  const set = (w, el, v) => { el.value = v; el.dispatchEvent(new w.Event("input", { bubbles: true })); };
  const FORMS = [
    ["skill-nova.html", async (d, w) => {
      d.querySelector("[data-save]").click(); await sleep(150);
      const invalid = [...d.querySelectorAll("[aria-invalid=true]")].map((e) => e.id);
      set(w, d.querySelector("#sk-name"), "Tópicos curtos"); set(w, d.querySelector("#sk-desc"), "Responde em tópicos."); set(w, d.querySelector("#sk-ins"), "Use até 5 tópicos.");
      d.querySelector("[data-save]").click(); await sleep(700);
      return { invalid, afterValid: [...d.querySelectorAll("[aria-invalid=true]")].length, done: d.querySelector("[data-save]").classList.contains("is-done") };
    }],
    ["agente-novo.html", async (d, w) => {
      d.querySelector("[data-save]").click(); await sleep(150);
      const invalid = [...d.querySelectorAll("[aria-invalid=true]")].map((e) => e.id);
      d.querySelector("[data-publish]").click(); set(w, d.querySelector("#ag-name"), "Revisor"); set(w, d.querySelector("#ag-ins"), "Você revisa textos.");
      d.querySelector("[data-save]").click(); await sleep(200);
      const publishRule = [...d.querySelectorAll("[aria-invalid=true]")].map((e) => e.id);
      set(w, d.querySelector("#ag-desc"), "Revisa textos com clareza.");
      d.querySelector("[data-save]").click(); await sleep(700);
      return { invalid, publishRule, afterValid: [...d.querySelectorAll("[aria-invalid=true]")].length, done: d.querySelector("[data-save]").classList.contains("is-done") };
    }],
    ["projetos.html", async (d, w) => {
      d.querySelector("[data-new]").click(); await sleep(200);
      const ok = d.querySelector("#np-ok"); const disabledEmpty = ok.disabled;
      set(w, d.querySelector("#np-name"), "Projeto QA"); const enabled = !ok.disabled;
      ok.click(); await sleep(900);
      return { disabledEmpty, enabledWithName: enabled, created: [...d.querySelectorAll(".item-card__title")].some((t) => t.textContent.includes("Projeto QA")) };
    }],
    ["projeto.html?id=p2", async (d, w) => {
      d.querySelector("[data-edit-ctx]").click(); await sleep(200);
      const ok = d.querySelector("#ctx-ok"); const disabledUnchanged = ok.disabled;
      set(w, d.querySelector("#ctx-ta"), "Contexto novo de QA."); const enabled = !ok.disabled;
      ok.click(); await sleep(900);
      return { disabledUnchanged, enabledWhenChanged: enabled, saved: d.querySelector("[data-ctx]").textContent.includes("Contexto novo de QA") };
    }],
    ["perfil.html", async (d, w) => {
      // O perfil salvo fica no localStorage: o teste muda para um valor diferente do atual e devolve o original no fim
      const before = w.localStorage.getItem("prisma:profile");
      const btn = d.querySelector("[data-profile] [data-save]"); const disabledUnchanged = btn.disabled;
      const nick = d.querySelector("#pf-nick");
      set(w, nick, nick.value === "QA" ? "QA 2" : "QA"); const enabled = !btn.disabled;
      btn.click(); await sleep(700);
      const saved = btn.classList.contains("is-done");
      if (before === null) w.localStorage.removeItem("prisma:profile"); else w.localStorage.setItem("prisma:profile", before);
      d.querySelector("[data-delete]").click(); await sleep(200);
      const cf = d.querySelector("#cf-ok"); const delDisabled = cf.disabled;
      set(w, d.querySelector("#cf-typed"), "APAG"); const partial = cf.disabled;
      set(w, d.querySelector("#cf-typed"), "APAGAR"); const full = !cf.disabled;
      return { disabledUnchanged, enabledWhenChanged: enabled, saved, deleteDisabled: delDisabled, partialStillDisabled: partial, typedEnables: full };
    }],
    ["admin-modelos.html", async (d, w) => {
      d.querySelector("[data-new]").click(); await sleep(400);
      d.querySelector("#m-ok").click(); await sleep(150);
      const invalid = [...d.querySelectorAll(".sheet [aria-invalid=true]")].map((e) => e.id);
      set(w, d.querySelector("#m-name"), "Modelo QA"); set(w, d.querySelector("#m-key"), "modelo qa"); set(w, d.querySelector("#m-prov"), "qa/modelo");
      set(w, d.querySelector("#m-in"), "-1"); d.querySelector(".disclosure__trigger").click(); set(w, d.querySelector("#m-prefs"), "{ quebrado");
      d.querySelector("#m-ok").click(); await sleep(150);
      const invalid2 = [...d.querySelectorAll(".sheet [aria-invalid=true]")].map((e) => e.id);
      set(w, d.querySelector("#m-key"), "modelo-qa"); set(w, d.querySelector("#m-in"), "1.5"); set(w, d.querySelector("#m-prefs"), '{"order":["qa"]}');
      const rows = d.querySelectorAll("[data-rows] tr").length;
      d.querySelector("#m-ok").click(); await sleep(1100);
      return { invalidEmpty: invalid, invalidValues: invalid2, rowsBefore: rows, rowsAfter: d.querySelectorAll("[data-rows] tr").length };
    }],
    ["admin-usuarios.html", async (d, w) => {
      d.querySelector("[data-cap]").click(); await sleep(400);
      set(w, d.querySelector("#cap-w"), "-5"); d.querySelector("#cap-ok").click(); await sleep(150);
      const negative = [...d.querySelectorAll(".sheet [aria-invalid=true]")].map((e) => e.id);
      set(w, d.querySelector("#cap-w"), "50"); set(w, d.querySelector("#cap-m"), "20"); d.querySelector("#cap-ok").click(); await sleep(150);
      const weekOverMonth = [...d.querySelectorAll(".sheet [aria-invalid=true]")].map((e) => e.id);
      set(w, d.querySelector("#cap-w"), "15"); set(w, d.querySelector("#cap-m"), "50"); d.querySelector("#cap-ok").click(); await sleep(1100);
      const src = d.querySelector("[data-users] tr .badge:last-of-type")?.textContent;
      return { negative, weekOverMonth, savedSource: [...d.querySelectorAll("[data-users] td[data-label='Origem do teto']")].map((t) => t.textContent.trim()) };
    }],
    ["admin-usuarios.html#politicas", async (d, w) => {
      d.querySelector("[data-new-policy]").click(); await sleep(250);
      [...d.querySelectorAll(".dialog .btn--primary")].at(-1).click(); await sleep(150);
      const invalid = [...d.querySelectorAll(".dialog [aria-invalid=true]")].map((e) => e.id);
      set(w, d.querySelector("#pol-w"), "12"); set(w, d.querySelector("#pol-m"), "48");
      const before = d.querySelectorAll("[data-policies] tr").length;
      [...d.querySelectorAll(".dialog .btn--primary")].at(-1).click(); await sleep(1000);
      return { invalidEmpty: invalid, rowsBefore: before, rowsAfter: d.querySelectorAll("[data-policies] tr").length };
    }],
    ["admin-uso.html", async (d, w) => {
      set(w, d.querySelector("#u-from"), "2026-10-10"); d.querySelector("[data-apply]").click(); await sleep(150);
      const invalid = [...d.querySelectorAll("[aria-invalid=true]")].map((e) => e.id);
      set(w, d.querySelector("#u-from"), "2026-09-30"); d.querySelector("[data-apply]").click(); await sleep(900);
      return { invalidRange: invalid, appliedToast: [...d.querySelectorAll(".toast__msg")].map((t) => t.textContent) };
    }],
    ["chat.html?id=d5c5bdf1", async (d, w) => {
      const send = d.querySelector("[data-act=send]"); const disabledEmpty = send.disabled;
      set(w, d.querySelector(".composer__input"), "Olá"); const enabled = !send.disabled;
      return { disabledEmpty, enabledWithText: enabled };
    }],
    ["index.html", async (d, w) => {
      d.querySelector("[data-account]").click(); await sleep(150);
      [...d.querySelectorAll(".menu__item")].find((b) => b.textContent.includes("Avaliar"))?.click(); await sleep(250);
      const ok = d.querySelector("#nps-ok"); const disabledNoScore = ok.disabled;
      d.querySelector("input[name=nps][value='9']").click(); d.querySelector("input[name=nps][value='9']").dispatchEvent(new w.Event("change", { bubbles: true }));
      return { npsDisabledWithoutScore: disabledNoScore, npsEnabledWithScore: !ok.disabled };
    }],
    ["galeria.html", async (d, w) => {
      set(w, d.querySelector("[data-search]"), "zzzz"); await sleep(250);
      return { noResultsTitle: d.querySelector(".empty__title")?.textContent, activeChips: d.querySelectorAll(".filter-chip").length, clearButton: !!d.querySelector("[data-unset='all']") };
    }],
  ];

  const run = async () => {
    const report = { date: new Date().toISOString(), pages: {}, forms: {} };
    for (const p of PAGES) {
      report.pages[p] = {};
      for (const width of WIDTHS) {
        log(`${p} @ ${width}px…`);
        const { f, errs } = await open(p, width);
        const c = contrast(f);
        // Foco só é medível com foco do sistema; sem ele, :focus não casa (ver focus-check.js)
        const fc = document.hasFocus() ? await focusCheck(f) : { checked: 0, missing: [], skipped: "sem foco do sistema: medido com focus-check.js" };
        const d = f.contentDocument;
        report.pages[p][width] = { errors: errs, contrastChecked: c.checked, contrastFailures: c.failures, focusChecked: fc.checked, focusMissing: fc.missing, focusSkipped: fc.skipped || null, overflow: d.documentElement.scrollWidth - d.documentElement.clientWidth };
        f.remove();
      }
      const { f } = await open(p + (p.includes("?") ? "&" : "?") + "movimento=reduzido", 1280);
      report.pages[p].reducedMotion = await motionCheck(f);
      f.remove();
    }
    for (const [p, fn] of FORMS) {
      log(`form ${p}…`);
      const { f, errs } = await open(p, 1280);
      try { report.forms[p] = { ...(await fn(f.contentDocument, f.contentWindow)), errors: errs }; }
      catch (e) { report.forms[p] = { exception: String(e) }; }
      f.remove();
    }
    window.__report = report;
    const sum = Object.entries(report.pages).map(([p, r]) => `${p}: contraste ${WIDTHS.map((w) => r[w].contrastFailures.length).join("/")} falhas · foco ${WIDTHS.map((w) => r[w].focusMissing.length).join("/")} sem anel · estouro ${WIDTHS.map((w) => r[w].overflow).join("/")} · movimento ${r.reducedMotion.movingOnPage.length + r.reducedMotion.movingWithOverlay.length}`).join("\n");
    log("\n" + sum + "\n\nPronto. Relatório completo em window.__report.");
    document.querySelector("[data-json]").textContent = JSON.stringify(report, null, 2);
  };
  document.querySelector("[data-run]").addEventListener("click", run);
  if (new URLSearchParams(location.search).has("auto")) run();
})();
