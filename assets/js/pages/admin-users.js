/* Asimov Prisma · Admin · Usuários e tetos (admin-usuarios.html)
 * Abas Usuários | Políticas de teto. Busca + situação com contagem; gasto da semana e do mês contra o teto
 * (âmbar acima de 80%, vermelho acima de 100%); a linha abre a folha do teto com a cadeia de precedência.
 * Referências: C.3 (Unify, Coda, OpenAI, Krea, Navan). Regra preservada: próprio → plano → papel →
 * política geral → padrão do sistema (R$ 10,00/semana, R$ 40,00/mês); vazio = herda. */
(() => {
  const P = window.Prisma;
  const { $, $$, esc, brl, fmt } = P;
  const icon = (n, c) => P.icon(n, c);
  const tbody = $("[data-users]");
  let users = [], policies = [];
  const st = { q: "", status: "" };
  const SYSTEM = { week: 10, month: 40 };

  const spend = (s) => {
    const pct = Math.round((s.spent / s.cap) * 100);
    const cls = pct >= 100 ? "meter--danger" : pct >= 80 ? "meter--warn" : "";
    return `<div class="spend"><div class="spend__row"><strong>${brl(s.spent)}</strong><span>de ${brl(s.cap)} · ${pct}%</span></div><span class="meter meter--thin ${cls}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(pct, 100)}" aria-label="${pct}% do teto"><span class="meter__fill" style="--v:${Math.max(pct, 1)}%"></span></span></div>`;
  };
  const sourceBadge = (src) => `<span class="badge ${/própri/i.test(src) ? "badge--accent" : ""}">${esc(src.charAt(0).toUpperCase() + src.slice(1))}</span>`;

  const render = () => {
    const q = P.norm(st.q);
    const counts = { "": users.length, ativos: users.filter((u) => u.active).length, inativos: users.filter((u) => !u.active).length };
    $("[data-status]").innerHTML = [["", "Todos"], ["ativos", "Ativos"], ["inativos", "Inativos"]].map(([v, l]) => `<button type="button" class="chip" data-st="${v}" aria-pressed="${v === st.status}">${l}<span class="count">${counts[v]}</span></button>`).join("");
    const rows = users.filter((u) => (!st.status || (st.status === "ativos") === u.active) && (!q || P.norm(u.name + " " + u.email).includes(q)));
    $("[data-count]").textContent = P.plural(rows.length, "usuário", "usuários");
    tbody.innerHTML = rows.length ? rows.map((u) => `
      <tr class="is-clickable" data-cap="${esc(u.email)}" tabindex="0" aria-label="Editar teto de ${esc(u.name)}">
        <td class="sticky-col cell-main"><span class="cell-name"><span class="avatar avatar--neutral avatar--md">${esc(u.name[0].toUpperCase())}</span><span><span class="strong row" style="gap:6px">${esc(u.name)}<span class="badge ${u.role === "ADMIN" ? "badge--ink" : ""}">${u.role === "ADMIN" ? "Admin" : "Aluno"}</span></span><span class="cell-sub">${esc(u.email)}</span></span></span></td>
        <td data-label="Situação"><span class="status ${u.active ? "" : "status--off"}">${u.active ? "Ativo" : "Inativo"}</span><span class="cell-sub tnum nowrap" title="Último acesso">${esc(u.last)}</span></td>
        <td data-label="Semana">${spend(u.week)}</td>
        <td data-label="Mês">${spend(u.month)}</td>
        <td data-label="Origem do teto">${sourceBadge(u.week.source)}</td>
        <td class="shrink"><button type="button" class="icon-btn icon-btn--sm" tabindex="-1" aria-hidden="true">${icon("chevron-right")}</button></td>
      </tr>`).join("") : `<tr class="table-empty"><td colspan="6">Ninguém encontrado${st.q ? ` com “${esc(st.q)}”` : ""}. <button type="button" class="link" data-clear>Limpar filtros</button></td></tr>`;
    P.hydrateIcons(tbody);
    P.hydrateIcons($("[data-status]"));
  };

  const editCap = (u) => {
    const general = policies.find((p) => /geral/i.test(p.name));
    const chain = [
      ["Teto próprio do usuário", null, false],
      [`Plano${u.plan && u.plan !== "—" ? `: ${u.plan}` : ""}`, null, false],
      [`Papel: ${u.role === "ADMIN" ? "Admin" : "Aluno"}`, null, false],
      ["Política geral", general ? `${general.week} · ${general.month}` : null, true],
      ["Padrão do sistema", `${brl(SYSTEM.week)} · ${brl(SYSTEM.month)}`, false],
    ];
    const winIdx = /própri/i.test(u.week.source) ? 0 : general ? 3 : 4;
    if (winIdx === 0) chain[0][1] = `${brl(u.week.cap)} · ${brl(u.month.cap)}`;
    P.sheet({
      title: `Teto de ${u.name}`,
      desc: esc(u.email),
      body: `
        <div class="sheet__section"><p class="sheet__section-title">Uso agora</p>
          <div class="grid grid--2"><div><p class="hint" style="margin-bottom:6px">Semana</p>${spend(u.week)}<p class="hint mt-2">${esc(u.week.credits)} créditos</p></div><div><p class="hint" style="margin-bottom:6px">Mês</p>${spend(u.month)}<p class="hint mt-2">${esc(u.month.credits)} créditos</p></div></div>
        </div>
        <div class="sheet__section"><p class="sheet__section-title">De onde vem o teto</p>
          <ol class="chain">${chain.map(([label, val], i) => `<li class="${i === winIdx ? "is-win" : ""}">${icon(i === winIdx ? "check-circle" : "dot")}<span>${i === winIdx ? `<strong>${esc(label)}</strong>` : esc(label)}</span><span>${val ? esc(val) : "sem teto"}</span></li>`).join("")}</ol>
          <p class="hint mt-3">Vale o primeiro nível que tiver teto, de cima para baixo.</p>
        </div>
        <div class="sheet__section"><p class="sheet__section-title">Teto próprio</p>
          <div class="grid grid--2">
            <div class="field"><label class="label" for="cap-w">Semanal (R$)</label><input id="cap-w" class="input t-num" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Herda"></div>
            <div class="field"><label class="label" for="cap-m">Mensal (R$)</label><input id="cap-m" class="input t-num" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Herda"></div>
          </div>
          <p class="hint mt-3">Um teto próprio passa na frente de plano, papel e política geral. Vale na hora. Ao chegar no teto, o usuário recebe aviso e para de enviar mensagens até renovar.</p>
        </div>`,
      buttons: [{ label: "Cancelar" }, { label: "Salvar teto", variant: "primary", id: "cap-ok", disabled: true, onClick: (sh) => {
        const ok = P.validate(sh, Object.fromEntries(["#cap-w", "#cap-m"].map((s) => [s, [(v) => (v !== "" && (isNaN(+v) || +v < 0) ? "Use um valor maior ou igual a zero." : "")]])));
        if (!ok) return false;
        const w = $("#cap-w", sh).value, m = $("#cap-m", sh).value;
        if (w !== "" && m !== "" && +w > +m) { P.validate(sh, { "#cap-w": [() => "O teto semanal não pode passar do mensal."] }); return false; }
        return P.api.send("PATCH", `/v1/admin/users/${encodeURIComponent(u.email)}/cap`, { week: w, month: m }).then(() => {
          if (w !== "") { u.week.cap = +w; u.week.source = "teto próprio"; }
          if (m !== "") { u.month.cap = +m; u.month.source = "teto próprio"; }
          render();
          P.toast(`Teto de ${u.name} salvo`);
        });
      } }],
      onOpen: (sh) => sh.addEventListener("input", () => ($("#cap-ok", sh).disabled = !$("#cap-w", sh).value && !$("#cap-m", sh).value)),
    });
  };

  const renderPolicies = () => {
    $("[data-policies]").innerHTML = policies.map((p, i) => `<tr><td class="strong cell-main">${esc(p.name)}</td><td class="num" data-label="Semanal">${esc(p.week)}</td><td class="num" data-label="Mensal">${esc(p.month)}</td><td class="tnum" data-label="Atualizada">${esc(p.updated)}</td><td class="shrink"><button type="button" class="btn btn--secondary btn--sm" data-policy="${i}">${icon("pencil")}Editar</button></td></tr>`).join("");
    P.hydrateIcons($("[data-policies]"));
  };
  const policyModal = (p) => P.modal({
    title: p ? `Editar ${p.name.toLowerCase()}` : "Nova política",
    desc: p ? "Vale para quem não tem teto próprio, plano ou papel com teto." : "Vale para um plano ou papel. Quem tem teto próprio não é afetado.",
    body: `${p ? "" : `<div class="field"><label class="label" for="pol-scope">Aplica a</label><select id="pol-scope" class="select"><option>Papel: Aluno (USER)</option><option>Papel: Admin (ADMIN)</option></select></div>`}
      <div class="grid grid--2 ${p ? "" : "mt-4"}"><div class="field"><label class="label" for="pol-w">Teto semanal (R$)</label><input id="pol-w" class="input t-num" type="number" min="0" step="0.01" value="${p ? p.week.replace(/[^\d,]/g, "").replace(",", ".") : ""}"></div>
      <div class="field"><label class="label" for="pol-m">Teto mensal (R$)</label><input id="pol-m" class="input t-num" type="number" min="0" step="0.01" value="${p ? p.month.replace(/[^\d,]/g, "").replace(",", ".") : ""}"></div></div>`,
    buttons: [{ label: "Cancelar" }, { label: "Salvar política", variant: "primary", onClick: (m) => {
      const req = (v) => (v === "" ? "Informe um valor." : isNaN(+v) || +v < 0 ? "Use um valor maior ou igual a zero." : "");
      if (!P.validate(m, { "#pol-w": [req], "#pol-m": [req] })) return false;
      return P.api.send(p ? "PATCH" : "POST", "/v1/admin/policies", {}).then(() => {
        const w = brl(+$("#pol-w", m).value), mo = brl(+$("#pol-m", m).value), now = "15/10/2026, " + new Date().toTimeString().slice(0, 5);
        if (p) Object.assign(p, { week: w, month: mo, updated: now }); else policies.push({ name: $("#pol-scope", m).value, week: w, month: mo, updated: now });
        renderPolicies();
        P.toast("Política salva");
      });
    } }],
  });

  tbody.addEventListener("click", (e) => { const r = e.target.closest("[data-cap]"); if (r) editCap(users.find((u) => u.email === r.dataset.cap)); if (e.target.closest("[data-clear]")) { st.q = ""; st.status = ""; $("[data-search]").value = ""; render(); } });
  tbody.addEventListener("keydown", (e) => { const r = e.target.closest("[data-cap]"); if (r && e.target === r && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); editCap(users.find((u) => u.email === r.dataset.cap)); } });
  $("[data-status]").addEventListener("click", (e) => { const b = e.target.closest("[data-st]"); if (b) { st.status = b.dataset.st; render(); } });
  $("[data-search]").addEventListener("input", P.debounce((e) => { st.q = e.target.value.trim(); render(); }, 80));
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-policy]"); if (b) policyModal(policies[+b.dataset.policy]); if (e.target.closest("[data-new-policy]")) policyModal(null); });
  const tabs = $("[data-tabs]");
  if (location.hash === "#politicas") P.selectTab(tabs, $('[aria-controls="tab-pol"]', tabs));
  tabs.addEventListener("tabchange", (e) => history.replaceState(null, "", e.detail.getAttribute("aria-controls") === "tab-pol" ? "#politicas" : location.pathname));

  P.ready();
  tbody.innerHTML = P.skeleton.table(7, 3);
  P.api.get("/v1/admin/users").then((r) => {
    users = r.users; policies = r.policies;
    const active = users.filter((u) => u.active).length;
    $("[data-active]").textContent = fmt(active);
    $("[data-active-sub]").textContent = `${active} de ${P.plural(users.length, "conta", "contas")} com acesso habilitado`;
    P.ticker($("[data-active]"));
    render();
    renderPolicies();
  }).catch((err) => { $("[data-table]").outerHTML = P.errorState(err.message); P.hydrateIcons(document); document.querySelector("[data-retry]")?.addEventListener("click", () => location.reload()); });
})();
