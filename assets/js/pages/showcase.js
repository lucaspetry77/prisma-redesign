/* Asimov Prisma · Vitrine de componentes (componentes.html): tokens e componentes vivos, no tema claro. */
(() => {
  const P = window.Prisma;
  const { $, $$, esc } = P;
  const icon = (n, c) => P.icon(n, c);
  const sw = (name, v, note = "") => `<div class="swatch"><span style="background:var(${v})"></span><div><strong>${name}</strong><br><code>${v}</code>${note ? `<br><span class="hint">${note}</span>` : ""}</div></div>`;
  $("[data-colors]").innerHTML = [
    ["Página", "--page", "zinco do DS claro"], ["Superfície", "--surface"], ["Superfície 2", "--surface-2"], ["Afundado", "--sunken"],
    ["Tinta", "--ink", "títulos"], ["Corpo", "--body", "texto"], ["Secundário", "--muted", "4,8:1"], ["Linha", "--line"],
    ["Acento", "--accent", "cyan_asimov"], ["Acento escuro", "--accent-dark"], ["Acento p/ texto", "--accent-ink", "5,6:1"], ["Acento lavado", "--accent-wash"],
    ["Sucesso", "--success"], ["Aviso", "--warning"], ["Perigo", "--danger"], ["Perigo sólido", "--danger-solid"],
  ].map((x) => sw(...x)).join("");
  $("[data-tones]").innerHTML = ["cyan", "teal", "blue", "violet", "rose", "orange", "amber", "green"].map((t) => `<span class="avatar avatar--lg avatar--square tone-${t}" title="--tone-${t}">${t.slice(0, 2).toUpperCase()}</span>`).join("");
  $("[data-shadows]").innerHTML = ["--shadow-xs", "--shadow-sm", "--shadow-md", "--shadow-lg"].map((s) => `<div class="card card--pad" style="box-shadow:var(${s});text-align:center"><code>${s}</code></div>`).join("");
  $("[data-icons]").innerHTML = ["new-chat", "search", "folder", "agent", "skill", "gallery", "chat", "paperclip", "image", "copy", "thumb-up", "refresh", "pencil", "trash", "heart", "star", "settings", "cpu", "chart", "users", "lock", "info", "danger", "check-circle", "sparkles", "keyboard", "download", "link", "wand", "notebook"].map((n) => `<span class="icon-chip" title="${n}">${icon(n)}</span>`).join("");

  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-demo]");
    if (!a) return;
    const k = a.dataset.demo;
    if (k === "toast") P.toast("Projeto salvo");
    if (k === "toast-undo") P.toast("Skill apagada", { icon: "trash", action: { label: "Desfazer", onClick: () => P.toast("Desfeito") } });
    if (k === "toast-err") P.toast("Não foi possível salvar agora. Nada foi perdido: tente de novo.", { danger: true });
    if (k === "modal") P.modal({ title: "Renomear projeto", body: `<div class="field"><div class="field__top"><label class="label" for="d-n">Nome</label><span class="counter"></span></div><input id="d-n" class="input" maxlength="80" value="Black Friday 2026"></div>`, buttons: [{ label: "Cancelar" }, { label: "Salvar", variant: "primary", onClick: () => P.sleep(700).then(() => P.toast("Salvo")) }] });
    if (k === "confirm") P.confirm({ title: "Apagar esta conversa?", desc: "A conversa e as mensagens dela somem para sempre.", onConfirm: () => P.sleep(600) });
    if (k === "typed") P.confirm({ title: "Apagar sua conta?", desc: "Isso apaga tudo, na hora e sem volta.", confirm: "Apagar minha conta", typed: "APAGAR", onConfirm: () => P.sleep(600) });
    if (k === "sheet") P.sheet({ title: "Editar modelo", desc: "Folha lateral: a lista continua visível atrás.", body: `<div class="field"><label class="label" for="d-o">Ordem</label><input id="d-o" class="input" type="number" value="3"></div>`, buttons: [{ label: "Cancelar" }, { label: "Salvar", variant: "primary", onClick: () => P.sleep(700) }] });
    if (k === "menu") P.menu(a, [{ label: "Renomear", icon: "pencil", kbd: "mod+k" }, { label: "Mover para projeto", icon: "folder" }, { label: "Publicar", icon: "gallery", soon: true }, { sep: true }, { label: "Apagar", icon: "trash", danger: true }], { label: "Exemplo" });
    if (k === "model") P.modelPicker(a, "asimov", (key) => P.toast(`Modelo: ${P.model(key).name}`), { align: "start" });
    if (k === "busy") P.run(a, () => P.sleep(900), { success: "Salvo" });
    if (k === "cmdk") P.cmdk();
    if (k === "ticker") $$("[data-tick]").forEach((el) => P.ticker(el, el.dataset.tick));
  });
  $("[data-empty]").innerHTML = P.empty({ icon: "folder", title: "Organize por assunto com projetos", text: "Vazio que ensina: o que é, por que usar e o primeiro passo.", steps: ["Dê um nome.", "Escreva o contexto.", "Converse."], actions: [{ label: "Criar projeto", variant: "primary", icon: "plus" }] });
  $("[data-err]").innerHTML = P.errorState("Verifique a conexão e tente de novo.");
  P.ready();
  $$("[data-tick]").forEach((el) => P.ticker(el, el.dataset.tick));
})();
