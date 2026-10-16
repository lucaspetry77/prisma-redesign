/* Asimov Prisma · Criar e editar skill (skill-nova.html, ?id= edita)
 * Página inteira: instruções com Escrever | Visualizar e modelo pronto; dicas fixas ao lado;
 * validação no envio; aviso de alterações não salvas. Referências: B.3b (Langdock, LangChain, Klaviyo).
 * Regras: nome 60, descrição 160, instruções 19.967 (obrigatórios); categoria 40 (opcional). */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, esc } = P;
  const form = $("[data-form]");
  const state = $("[data-save-state]");
  const editing = D.mySkills.find((s) => s.id === P.params.get("id"));
  const TEMPLATE = "## Quando usar\nDescreva em uma frase quando a IA deve seguir esta skill.\n\n## Como responder\n- Formato: lista, tabela ou parágrafo curto.\n- Tamanho: quantos itens ou frases.\n- Sempre: o que não pode faltar (ex.: o próximo passo).\n\n## Se faltar informação\nPergunte antes de supor.";

  if (editing) {
    $("[data-form-title]").textContent = "Editar skill";
    document.title = "Editar skill · Asimov Prisma";
    $("#sk-name").value = editing.name;
    $("#sk-desc").value = editing.desc;
    $("#sk-cat").value = editing.category || "";
    $("#sk-ins").value = "Responda sempre em até 5 tópicos, com uma frase cada.\nTermine com o próximo passo prático.";
  }
  const snapshot = () => ["#sk-name", "#sk-desc", "#sk-cat", "#sk-ins"].map((s) => $(s).value).join("\u0000");
  let saved = snapshot();
  const dirty = () => snapshot() !== saved;
  const sync = () => {
    const d = dirty();
    state.textContent = d ? "Alterações não salvas" : editing ? "Salva" : "Rascunho";
    state.className = "save-state " + (d ? "is-dirty" : editing ? "is-saved" : "");
  };
  form.addEventListener("input", sync);
  addEventListener("beforeunload", (e) => { if (dirty()) { e.preventDefault(); e.returnValue = ""; } });

  // Escrever | Visualizar (markdown simples, só para conferir a estrutura)
  const md = (src) => {
    const lines = esc(src).split("\n");
    let out = "", list = null;
    const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code>$1</code>");
    const close = () => { if (list) { out += `</${list}>`; list = null; } };
    lines.forEach((l) => {
      let m;
      if ((m = l.match(/^#{1,3}\s+(.*)/))) { close(); out += `<h3>${inline(m[1])}</h3>`; }
      else if ((m = l.match(/^\s*[-*]\s+(.*)/))) { if (list !== "ul") { close(); out += "<ul>"; list = "ul"; } out += `<li>${inline(m[1])}</li>`; }
      else if ((m = l.match(/^\s*\d+\.\s+(.*)/))) { if (list !== "ol") { close(); out += "<ol>"; list = "ol"; } out += `<li>${inline(m[1])}</li>`; }
      else if (l.trim()) { close(); out += `<p>${inline(l)}</p>`; }
      else close();
    });
    close();
    return out || `<p class="t-muted">Nada para visualizar ainda.</p>`;
  };
  form.addEventListener("tabchange", (e) => { if (e.detail.dataset.t === "preview") $("[data-preview]").innerHTML = md($("#sk-ins").value); });
  $("[data-template]").addEventListener("click", () => {
    const ta = $("#sk-ins");
    const apply = () => { ta.value = TEMPLATE; ta.dispatchEvent(new Event("input", { bubbles: true })); ta.focus(); };
    if (ta.value.trim()) P.confirm({ title: "Trocar as instruções pelo modelo?", desc: "O que você escreveu nas instruções será substituído.", confirm: "Usar modelo", danger: false, onConfirm: apply });
    else apply();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = P.validate(form, {
      "#sk-name": [P.rules.required("O nome"), P.rules.max(60)],
      "#sk-desc": [P.rules.requiredF("A descrição"), P.rules.max(160)],
      "#sk-ins": [(v) => (v.trim() ? "" : "Escreva as instruções que a IA deve seguir."), P.rules.max(19967)],
      "#sk-cat": [P.rules.max(40)],
    });
    if (!ok) { P.toast("Revise os campos marcados", { danger: true, icon: "danger" }); return; }
    const btn = $("[data-save]");
    P.run(btn, () => P.api.send(editing ? "PATCH" : "POST", editing ? `/v1/skills/${editing.id}` : "/v1/skills", { name: $("#sk-name").value }), { success: editing ? "Skill atualizada" : "Skill criada. Ligue pelo + do campo de mensagem." })
      .then(() => { saved = snapshot(); sync(); setTimeout(() => (location.href = "skills.html"), 1100); })
      .catch(() => {});
  });
  P.ready();
  sync();
})();
