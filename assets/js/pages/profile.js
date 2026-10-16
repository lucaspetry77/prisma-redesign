/* Asimov Prisma · Configurações (perfil.html)
 * Seções que salvam sozinhas (salvar só com mudança), créditos, atalhos de teclado, exportar dados e
 * apagar conta digitando APAGAR. Referências: B.6 (Claude, Langdock, StackAI, Chatbase).
 * Regras: apelido 40, "sobre você" 2.000, foto PNG/JPG/GIF/WebP até 5 MB (vale depois de salvar). */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, $$, esc, fmt, store } = P;
  const icon = (n, c) => P.icon(n, c);
  const u = D.user;
  const prof = store.get("profile", { nickname: u.nickname || "", about: "", photo: null });

  /* Perfil */
  const photoBox = $("[data-photo]");
  let photo = prof.photo;
  const paintPhoto = () => { photoBox.innerHTML = photo ? `<img src="${esc(photo)}" alt="">` : esc(u.initials); $("[data-rm-photo]").hidden = !photo; };
  $("#pf-name").textContent = u.name;
  $("#pf-mail").textContent = u.email;
  $("#pf-nick").value = prof.nickname;
  $("#pf-about").value = prof.about;
  paintPhoto();

  const section = (form, fields, save) => {
    const snap = () => fields().join("\u0000");
    let saved = snap();
    const btn = $("[data-save]", form);
    const sync = () => (btn.disabled = snap() === saved);
    form.addEventListener("input", sync);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (btn.disabled) return;
      P.run(btn, save, { success: "Salvo" }).then(() => { saved = snap(); setTimeout(sync, 1400); }).catch(() => {});
    });
    sync();
    return { sync, reset: () => { saved = snap(); sync(); } };
  };
  const profileForm = $("[data-profile]");
  const ps = section(profileForm, () => [$("#pf-nick").value.trim(), photo || ""], () => P.api.send("PATCH", "/v1/me", { nickname: $("#pf-nick").value.trim() }).then(() => {
    prof.nickname = $("#pf-nick").value.trim(); prof.photo = photo; store.set("profile", prof);
    $$(".account__name").forEach((el) => (el.textContent = prof.nickname || u.name));
  }));
  $("[data-pick-photo]").addEventListener("click", () => $("[data-photo-input]").click());
  $("[data-photo-input]").addEventListener("change", (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (!/^image\/(png|jpeg|gif|webp)$/.test(f.type)) { P.toast("Use PNG, JPG, GIF ou WebP", { danger: true }); return; }
    if (f.size > 5 * 1048576) { P.toast("A foto precisa ter até 5 MB", { danger: true }); return; }
    const r = new FileReader();
    r.onload = () => { photo = r.result; paintPhoto(); ps.sync(); };
    r.readAsDataURL(f);
  });
  $("[data-rm-photo]").addEventListener("click", () => { photo = null; paintPhoto(); ps.sync(); });

  section($("[data-about]"), () => [$("#pf-about").value.trim()], () => P.api.send("PATCH", "/v1/me", { about: $("#pf-about").value.trim() }).then(() => { prof.about = $("#pf-about").value.trim(); store.set("profile", prof); }));

  /* Créditos */
  const pct = Math.min(100, (u.credits.used / u.credits.limit) * 100);
  $("[data-credits]").innerHTML = `
    <div class="row row--between"><div><p class="kpi__value" data-tick style="font-size:var(--text-5xl)">${Math.round(pct)}%</p><p class="hint">da semana usados · ${fmt(u.credits.used)} de ${fmt(u.credits.limit)} créditos</p></div><span class="badge">Renova ${esc(u.credits.renews)}</span></div>
    <div class="meter mt-4 ${pct > 90 ? "meter--danger" : pct > 70 ? "meter--warn" : ""}" role="meter" aria-label="Uso semanal" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}"><span class="meter__fill" style="--v:${Math.max(pct, 1)}%"></span></div>
    <dl class="facts mt-6"><div><dt>Limite diário</dt><dd>${fmt(u.credits.dailyLimit)} créditos</dd></div><div><dt>Limite semanal</dt><dd>${fmt(u.credits.limit)} créditos</dd></div></dl>
    <p class="hint mt-4">Cada mensagem gasta créditos de acordo com o modelo e o tamanho. O Asimov Basic escolhe o modelo mais econômico que resolve o pedido.</p>`;
  P.ticker($("[data-credits] [data-tick]"));

  /* Atalhos */
  const rows = [["Buscar e ir para qualquer lugar", "mod+k"], ["Novo chat", "mod+shift+o"], ["Recolher a barra lateral", "mod+\\"], ["Focar o campo de mensagem", "/"], ["Enviar · quebrar linha", "enter"], ["Ver todos os atalhos", "?"]];
  $("[data-kbd]").innerHTML = rows.map(([l, c]) => `<div><span>${l}</span><span class="shortcuts__keys">${c === "enter" ? `${P.keys.kbd("enter")}<span class="hint">·</span>${P.keys.kbd("shift+enter")}` : P.keys.kbd(c)}</span></div>`).join("");

  /* Exportar e apagar */
  $("[data-export]").addEventListener("click", (e) => P.run(e.currentTarget, () => P.api.send("POST", "/v1/me/export", {}, { delay: 1200 }), { success: "Exportação pronta. O download começou." }).catch(() => {}));
  $("[data-delete]").addEventListener("click", () => P.confirm({
    title: "Apagar sua conta?",
    desc: "Isso apaga, na hora e sem volta: perfil, conversas, projetos e arquivos, skills, agentes, prompts salvos, memórias, avaliações, favoritos e o que você publicou na galeria.",
    confirm: "Apagar minha conta", typed: "APAGAR",
    onConfirm: () => P.api.send("DELETE", "/v1/me").then(() => { location.href = "login.html"; }),
  }));

  /* Índice lateral acompanha a rolagem */
  const links = $$(".settings__nav a");
  const spy = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) links.forEach((l) => l.setAttribute("aria-current", String(l.getAttribute("href") === "#" + en.target.id))); }), { rootMargin: "-15% 0px -70% 0px" });
  $$(".settings__section").forEach((s) => spy.observe(s));
  links.forEach((l) => l.addEventListener("click", (e) => { e.preventDefault(); const t = $(l.getAttribute("href")); t.scrollIntoView({ behavior: P.reduced ? "auto" : "smooth", block: "start" }); history.replaceState(null, "", l.getAttribute("href")); }));
  P.ready();
  if (location.hash) $(location.hash)?.scrollIntoView();
})();
