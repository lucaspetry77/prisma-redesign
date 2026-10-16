/* Asimov Prisma · verificação de foco visível com teclado real.
 * Por que separado do qa.js: sem foco do sistema (aba em segundo plano, iframe oculto), :focus não casa e o
 * teste daria falso negativo. Como usar: abra uma tela, aperte Tab uma vez (dá foco de teclado à página) e
 * rode este arquivo no console. Ele foca cada elemento com transições desligadas e confere se aparece o anel
 * de 2px ou se a sombra/borda muda, no elemento ou no contêiner visual. Resultados acumulam em
 * localStorage["qa-focus"]. Resultado de 15/10/2026: docs/redesign/qa/foco-teclado.json. */
(() => {
  const els = [...document.querySelectorAll("a[href], button:not(:disabled), input:not(:disabled):not([type=hidden]), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex='-1'])")]
    .filter((el) => el.getClientRects().length && !el.closest("[inert], [hidden], [aria-hidden='true']") && getComputedStyle(el).visibility !== "hidden");
  const proxyOf = (el) => el.matches(".switch input") ? el.nextElementSibling : el.matches(".choice input") ? el.closest(".choice") : el.matches(".nps input") ? el.nextElementSibling : el.matches(".composer__input") ? el.closest(".composer") : el.matches(".mini-composer input") ? el.closest(".mini-composer") : el.matches(".tagbox input") ? el.closest(".tagbox") : null;
  const snap = (t, pe) => { const s = getComputedStyle(t, pe); return [s.outlineStyle, s.outlineWidth, s.boxShadow, s.borderColor].join("|"); };
  const missing = [];
  const noT = document.createElement("style");
  noT.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.append(noT);
  for (const el of els) {
    const t = proxyOf(el) || el;
    const pe = el.matches(".card__link") ? "::after" : null;
    const before = snap(t, pe);
    el.focus({ preventScroll: true });
    const s = getComputedStyle(t, pe);
    const ok = document.activeElement === el && ((s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2) || snap(t, pe) !== before);
    if (!ok) missing.push((el.tagName + "." + String(el.className).split(" ")[0] + " " + (el.getAttribute("aria-label") || el.textContent || el.id || "").trim()).slice(0, 50));
  }
  document.activeElement?.blur();
  noT.remove();
  const key = (location.pathname.split("/").pop() || "index.html") + location.search.replace(/[?&](latencia|movimento|r)=[^&]*/g, "") + "@" + innerWidth;
  const all = JSON.parse(localStorage.getItem("qa-focus") || "{}");
  all[key] = { n: els.length, missing, hasFocus: document.hasFocus() };
  localStorage.setItem("qa-focus", JSON.stringify(all));
  return key + " " + els.length + " focáveis, sem anel: " + missing.length + (missing.length ? " → " + missing.join("; ") : "");
})();
