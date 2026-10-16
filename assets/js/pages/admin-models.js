/* Asimov Prisma · Admin · Modelos (admin-modelos.html)
 * Modelo padrão num seletor acima da tabela; tabela compacta (nome + chave, fornecedor, preços, contexto,
 * aceita, ligado, no seletor); linha abre a folha lateral com todos os campos. Referências: C.1 (Twenty,
 * Langdock, Braintrust, Vercel). Regras: um único padrão; o padrão não pode ser desligado nem escondido;
 * novo modelo nasce desligado; nome, chave, fornecedor e modalidade não mudam depois de criados. */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, $$, esc, fmt } = P;
  const icon = (n, c) => P.icon(n, c);
  const tbody = $("[data-rows]");
  let models = [];
  const st = { q: "", modality: "" };
  const usd = (v) => (v == null ? "—" : "US$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 }));
  const tok = (v) => (v == null ? "—" : v >= 1e6 ? `${(v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} M` : v >= 1e3 ? `${Math.round(v / 1e3)} mil` : fmt(v));
  const sw = (m, k, label) => `<label class="switch" onclick="event.stopPropagation()"><input type="checkbox" data-k="${k}" data-m="${m.key}" ${m[k] ? "checked" : ""} aria-label="${label}: ${esc(m.name)}"><span class="switch__track"></span></label>`;

  const renderDefault = () => {
    const sel = $("#default-model");
    sel.innerHTML = models.filter((m) => m.modality === "text" && m.on).sort((a, b) => a.order - b.order).map((m) => `<option value="${m.key}" ${m.isDefault ? "selected" : ""}>${esc(m.name)}</option>`).join("");
  };
  const render = () => {
    const q = P.norm(st.q);
    const rows = models.filter((m) => (!st.modality || m.modality === st.modality) && (!q || P.norm(`${m.name} ${m.key} ${m.provider}`).includes(q))).sort((a, b) => (a.modality === b.modality ? a.order - b.order : a.modality === "text" ? -1 : 1));
    $("[data-count]").textContent = P.plural(rows.length, "modelo", "modelos");
    tbody.innerHTML = rows.length ? rows.map((m) => `
      <tr class="is-clickable ${m.on ? "" : "is-off"}" data-edit="${m.key}" tabindex="0" aria-label="Editar ${esc(m.name)}">
        <td class="sticky-col cell-main"><span class="cell-name">${P.modelIcon(m, "model-icon--lg")}<span><span class="strong row" style="gap:6px">${esc(m.name)}${m.isDefault ? `<span class="badge badge--accent">Padrão</span>` : ""}${m.badge ? `<span class="badge">${esc(m.badge)}</span>` : ""}</span><span class="cell-sub t-mono">${esc(m.key)} · ${m.modality === "image" ? "imagem" : "texto"}</span></span></span></td>
        <td data-label="Fornecedor" class="mono"><span class="t-clamp-1" style="display:block;max-width:190px" title="${esc(m.provider)}">${esc(m.provider)}</span></td>
        <td data-label="Entrada · US$/1M" class="num">${usd(m.priceIn)}</td>
        <td data-label="Saída · US$/1M" class="num">${usd(m.priceOut)}</td>
        <td data-label="Contexto" class="num">${tok(m.ctx)}</td>
        <td data-label="Aceita"><span class="caps"><span class="cap ${m.files ? "is-on" : ""}" title="${m.files ? "Aceita" : "Não aceita"} arquivos">${icon("file")}</span><span class="cap ${m.images ? "is-on" : ""}" title="${m.images ? "Lê" : "Não lê"} imagens">${icon("image")}</span></span></td>
        <td data-label="Ligado">${sw(m, "on", "Ligado")}</td>
        <td data-label="No seletor">${sw(m, "visible", "Visível no seletor")}</td>
        <td class="shrink"><button type="button" class="icon-btn icon-btn--sm" data-edit-btn="${m.key}" aria-label="Editar ${esc(m.name)}" tabindex="-1">${icon("chevron-right")}</button></td>
      </tr>`).join("") : `<tr class="table-empty"><td colspan="9">Nenhum modelo com “${esc(st.q)}”. <button type="button" class="link" data-clear>Limpar busca</button></td></tr>`;
    P.hydrateIcons(tbody);
  };

  const field = (id, label, value, { hint = "", type = "text", ro = false, max, suffix } = {}) => `
    <div class="field"><div class="field__top"><label class="label" for="${id}">${label}</label>${max ? `<span class="counter"></span>` : ""}</div>
      <input id="${id}" class="input ${type === "number" ? "t-num" : ""}" type="${type}" ${type === "number" ? 'step="any" min="0" inputmode="decimal"' : ""} value="${value ?? ""}" ${ro ? "disabled" : ""} ${max ? `maxlength="${max}"` : ""} ${suffix ? `aria-describedby="${id}-s"` : ""}>
      ${hint ? `<p class="hint" ${suffix ? `id="${id}-s"` : ""}>${hint}</p>` : ""}</div>`;

  const edit = (m) => {
    const isNew = !m;
    history.replaceState(null, "", m ? `admin-modelos.html?modelo=${encodeURIComponent(m.key)}` : "admin-modelos.html");
    const v = m || { name: "", key: "", provider: "", modality: "text", order: models.length + 1, badge: "", priceIn: null, priceOut: null, ctx: null, maxOut: null, cacheMin: null, files: false, images: false, prefs: "" };
    const el = P.sheet({
      title: isNew ? "Novo modelo" : v.name,
      desc: isNew ? "Nasce desligado. Ligue depois de conferir preço e limites." : `<span class="t-mono">${esc(v.key)}</span> · ${esc(v.provider)}${v.isDefault ? " · modelo padrão do chat" : ""}`,
      body: `
        <div class="sheet__section"><p class="sheet__section-title">Identificação</p>
          ${isNew ? `<div class="grid grid--2">${field("m-name", "Nome", "", { max: 60, hint: "Como aparece no seletor." })}${field("m-key", "Chave", "", { hint: "Única, sem espaços. Ex.: gpt-5" })}</div>
            <div class="grid grid--2 mt-4">${field("m-prov", "Fornecedor", "", { hint: "Ex.: openai/gpt-5" })}<div class="field"><label class="label" for="m-mod">Modalidade</label><select id="m-mod" class="select"><option value="text">Texto</option><option value="image">Imagem</option></select></div></div>`
          : `<dl class="facts"><div><dt>Chave</dt><dd class="t-mono">${esc(v.key)}</dd></div><div><dt>Fornecedor</dt><dd class="t-mono">${esc(v.provider)}</dd></div><div><dt>Modalidade</dt><dd>${v.modality === "image" ? "Imagem" : "Texto"}</dd></div><div><dt>Conversas</dt><dd>${fmt(v.conversations || 0)}</dd></div></dl>
            <p class="hint mt-4">Nome, chave, fornecedor e modalidade não mudam depois de criados.</p>`}
        </div>
        <div class="sheet__section"><p class="sheet__section-title">No seletor</p>
          <div class="grid grid--2">${field("m-order", "Ordem", v.order, { type: "number" })}${field("m-badge", "Selo", v.badge, { max: 40, hint: "Vazio tira o selo." })}</div>
        </div>
        <div class="sheet__section"><p class="sheet__section-title">Preço por 1 milhão de tokens (US$)</p>
          <div class="grid grid--2">${field("m-in", "Entrada", v.priceIn, { type: "number", hint: "Vazio = sem valor." })}${field("m-out", "Saída", v.priceOut, { type: "number", hint: "Vazio = sem valor." })}</div>
        </div>
        <div class="sheet__section"><p class="sheet__section-title">Limites (tokens)</p>
          <div class="grid grid--2">${field("m-ctx", "Contexto máximo", v.ctx, { type: "number" })}${field("m-max", "Saída máxima", v.maxOut, { type: "number" })}</div>
          <div class="grid grid--2 mt-4">${field("m-cache", "Mínimo para cache", v.cacheMin, { type: "number", hint: "Vazio = sem valor." })}</div>
        </div>
        <div class="sheet__section"><p class="sheet__section-title">Aceita</p>
          <label class="check"><input type="checkbox" id="m-files" ${v.files ? "checked" : ""}><span class="check__text"><span class="check__title">Arquivos</span><span class="check__desc">PDF, documentos e planilhas anexados.</span></span></label>
          <label class="check"><input type="checkbox" id="m-images" ${v.images ? "checked" : ""}><span class="check__text"><span class="check__title">Imagens</span><span class="check__desc">Sem isso, o composer bloqueia o envio com imagem anexada.</span></span></label>
        </div>
        <div class="disclosure mt-6"><button type="button" class="disclosure__trigger" aria-expanded="false">Avançado: preferências de fornecedor ${icon("chevron-down", "chev")}</button>
          <div class="disclosure__body"><div class="disclosure__inner"><div class="disclosure__content">
            <div class="field"><label class="label" for="m-prefs">Preferências (JSON)</label><textarea id="m-prefs" class="textarea textarea--code" style="min-height:110px" placeholder='{ "order": ["nvidia", "google-ai-studio"], "allow_fallbacks": true }'></textarea>
            <p class="hint">Hoje: ${esc(v.prefs || "padrão do sistema")}. Vazio mantém o padrão.</p></div>
          </div></div></div></div>`,
      buttons: [{ label: "Cancelar" }, { label: isNew ? "Criar modelo" : "Salvar", variant: "primary", id: "m-ok", onClick: (sh) => {
        const rules = { "#m-badge": [P.rules.max(40)], "#m-prefs": [(t) => { if (!t.trim()) return ""; try { JSON.parse(t); return ""; } catch { return "JSON inválido. Confira aspas e vírgulas."; } }] };
        ["#m-order", "#m-in", "#m-out", "#m-ctx", "#m-max", "#m-cache"].forEach((s) => (rules[s] = [(t) => (t !== "" && (isNaN(+t) || +t < 0) ? "Use um número maior ou igual a zero." : "")]));
        if (isNew) Object.assign(rules, { "#m-name": [P.rules.required("O nome")], "#m-key": [P.rules.requiredF("A chave"), (t) => (/\s/.test(t) ? "A chave não pode ter espaços." : models.some((x) => x.key === t.trim()) ? "Já existe um modelo com essa chave." : "")], "#m-prov": [P.rules.required("O fornecedor")] });
        if (!P.validate(sh, rules)) return false;
        const num = (s) => ($(s, sh).value === "" ? null : +$(s, sh).value);
        const patch = { order: num("#m-order") ?? v.order, badge: $("#m-badge", sh).value.trim(), priceIn: num("#m-in"), priceOut: num("#m-out"), ctx: num("#m-ctx"), maxOut: num("#m-max"), cacheMin: num("#m-cache"), files: $("#m-files", sh).checked, images: $("#m-images", sh).checked };
        return P.api.send(isNew ? "POST" : "PATCH", isNew ? "/v1/models" : `/v1/models/${v.key}`, patch).then(() => {
          if (isNew) { const nm = { ...v, ...patch, name: $("#m-name", sh).value.trim(), key: $("#m-key", sh).value.trim(), provider: $("#m-prov", sh).value.trim(), modality: $("#m-mod", sh).value, on: false, visible: false, isDefault: false, featured: false, desc: "", conversations: 0, cost: 0 }; models.push(nm); D.models.push(nm); P.toast(`${nm.name} criado, ainda desligado`); }
          else { Object.assign(m, patch); P.toast(`${m.name} atualizado`); }
          render(); renderDefault();
        });
      } }],
      onOpen: (sh) => { P.bindFields(sh); },
      onClose: () => history.replaceState(null, "", "admin-modelos.html"),
    });
    return el;
  };

  tbody.addEventListener("click", (e) => { if (e.target.closest(".switch")) return; const r = e.target.closest("[data-edit]"); if (r) edit(models.find((m) => m.key === r.dataset.edit)); if (e.target.closest("[data-clear]")) { st.q = ""; $("[data-search]").value = ""; render(); } });
  tbody.addEventListener("keydown", (e) => { const r = e.target.closest("[data-edit]"); if (r && (e.key === "Enter" || e.key === " ") && e.target === r) { e.preventDefault(); edit(models.find((m) => m.key === r.dataset.edit)); } });
  tbody.addEventListener("change", (e) => {
    const i = e.target.closest("[data-k]");
    if (!i) return;
    const m = models.find((x) => x.key === i.dataset.m);
    if (m.isDefault && !i.checked) { i.checked = true; P.toast(`${m.name} é o modelo padrão. Escolha outro padrão antes de ${i.dataset.k === "on" ? "desligar" : "esconder"}.`, { icon: "info" }); return; }
    m[i.dataset.k] = i.checked;
    P.api.send("PATCH", `/v1/models/${m.key}`, { [i.dataset.k]: i.checked })
      .then(() => {
        const k = i.dataset.k, v = m[k];
        const sync = () => { const row = i.closest("tr"); row?.classList.toggle("is-off", !m.on); const inp = tbody.querySelector(`[data-k="${k}"][data-m="${m.key}"]`); if (inp) inp.checked = m[k]; renderDefault(); };
        sync();
        P.toast(`${m.name}: ${k === "on" ? (v ? "ligado" : "desligado") : (v ? "visível no seletor" : "escondido do seletor")}`, { action: { label: "Desfazer", onClick: () => { m[k] = !v; sync(); P.api.send("PATCH", `/v1/models/${m.key}`, { [k]: !v }); } } });
      })
      .catch((err) => { m[i.dataset.k] = !i.checked; i.checked = !i.checked; P.toast(err.message, { danger: true }); });
  });
  $("#default-model").addEventListener("change", (e) => {
    const k = e.target.value;
    const prev = models.find((m) => m.isDefault);
    models.forEach((m) => (m.isDefault = m.key === k));
    const next = models.find((m) => m.key === k);
    next.visible = true;
    render();
    P.api.send("PATCH", "/v1/models/default", { key: k }).then(() => P.toast(`${next.name} agora é o modelo padrão`, { action: prev ? { label: "Desfazer", onClick: () => { models.forEach((m) => (m.isDefault = m === prev)); e.target.value = prev.key; render(); } } : null })).catch((err) => P.toast(err.message, { danger: true }));
  });
  $("[data-new]").addEventListener("click", () => edit(null));
  $("[data-search]").addEventListener("input", P.debounce((e) => { st.q = e.target.value.trim(); render(); }, 80));
  $("[data-mod]").addEventListener("click", (e) => { const b = e.target.closest("[data-v]"); if (!b) return; st.modality = b.dataset.v; $$("[data-v]", e.currentTarget).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); render(); });

  P.ready();
  tbody.innerHTML = P.skeleton.table(9, 6);
  P.api.get("/v1/models").then((list) => { models = list; D.models = models; renderDefault(); render(); const k = P.params.get("modelo"); const m = k && models.find((x) => x.key === k); if (m) edit(m); })
    .catch((err) => { $("[data-table]").outerHTML = P.errorState(err.message); P.hydrateIcons(document); document.querySelector("[data-retry]")?.addEventListener("click", () => location.reload()); });
})();
