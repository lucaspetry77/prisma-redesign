/* Asimov Prisma · Admin · Uso e custo (admin-uso.html)
 * Período fixo no topo (De/Até, 7 e 30 dias, agrupar), KPIs em duas camadas, custo por dia com dica e
 * alternância Gráfico | Tabela, custo por modelo com barra de participação, alertas e eventos filtráveis.
 * Referências: C.2 (Vercel, OpenAI, Stripe, Profound). Valores com ≈ são convertidos de US$ (regra preservada). */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, $$, esc, brl } = P;
  const icon = (n, c) => P.icon(n, c);
  const body = $("[data-body]");

  const mount = (U) => {
    const T = U.totals;
    $("[data-period-note]").textContent = `Período: ${U.period} (dias de São Paulo).`;
    const kpi = (label, value, sub) => `<div class="card kpi"><span class="kpi__label">${label}</span><span class="kpi__value" data-tick>${esc(value)}</span><span class="kpi__sub">${sub}</span></div>`;
    const maxDay = Math.max(1.5, ...U.days.map((d) => d.brl));
    const ticks = [0, maxDay / 3, (maxDay / 3) * 2, maxDay];
    const models = D.models.filter((m) => m.conversations).sort((a, b) => b.cost - a.cost);
    const maxCost = Math.max(...models.map((m) => m.cost), 0);
    const totalCost = models.reduce((s, m) => s + m.cost, 0);
    const types = [...new Set(U.events.map((e) => e.type))];

    body.innerHTML = `
      <section aria-labelledby="t-tot">
        <h2 class="sr-only" id="t-tot">Totais do período</h2>
        <div class="kpis" data-reveal-group>
          ${kpi("Custo real", T.costBRL, `${esc(T.costUSD)}`)}
          ${kpi("Créditos", T.credits, "consumidos pelos usuários")}
          ${kpi("Mensagens", T.messages, `Intervalo médio ${esc(T.interval)}`)}
          ${kpi("Tokens", T.tokens, `${esc(T.cachedTokens)} em cache`)}
        </div>
        <div class="card kpis-strip">
          <div><strong>${esc(T.cacheSaving)}</strong><span>Economia de cache · taxa ${esc(T.cacheRate)}</span></div>
          <div><strong>${esc(T.overhead)}</strong><span>Overhead · ${esc(T.overheadSub)}</span></div>
          <div><strong>${esc(T.truncated)}</strong><span>Respostas truncadas · ${esc(T.gated)} barradas no portão</span></div>
        </div>
        <p class="hint mt-3">${esc(U.fx)}</p>
      </section>

      <div class="split mt-8">
        <section class="card chart" aria-labelledby="t-day">
          <div class="chart__head"><div><h2 class="t-h3" id="t-day">Custo real por dia</h2><p class="hint">R$ · passe o mouse ou o foco nas barras</p></div>
            <div class="seg seg--sm" role="tablist" aria-label="Exibir como"><button type="button" role="tab" class="seg__btn" aria-selected="true" aria-controls="v-chart">Gráfico</button><button type="button" role="tab" class="seg__btn" aria-selected="false" aria-controls="v-table" tabindex="-1">Tabela</button></div></div>
          ${U.days.length ? `
          <div id="v-chart">
            <div class="chart__plot" role="img" aria-label="Custo real por dia: ${U.days.map((d) => `${d.day} ${brl(d.brl)}`).join(", ")}">
              <div class="chart__grid" aria-hidden="true">${ticks.map((t) => `<span style="bottom:${(t / maxDay) * 100}%"><b>${t.toLocaleString("pt-BR", { minimumFractionDigits: t ? 2 : 0, maximumFractionDigits: 2 })}</b></span>`).join("")}</div>
              ${U.days.map((d, i) => `<div class="chart__col" tabindex="0" aria-label="${d.full}: ${brl(d.brl)}, ${d.messages} mensagens" style="--h:${d.brl ? Math.max(2, (d.brl / maxDay) * 100) : 1}%"><span class="chart__bar ${d.brl ? "" : "is-zero"}" style="--i:${i}"></span><span class="chart__tip" role="tooltip"><strong>${d.full}</strong>${brl(d.brl)} · ${esc(d.usd)}<br>${d.messages} mensagens · ${P.plural(d.users, "usuário", "usuários")}</span></div>`).join("")}
            </div>
            <div class="chart__x" aria-hidden="true">${U.days.map((d) => `<span>${d.day}</span>`).join("")}</div>
          </div>
          <div id="v-table" hidden><div class="table-wrap" style="box-shadow:none"><table class="table"><thead><tr><th>Dia</th><th class="num">Custo real</th><th class="num">US$</th><th class="num">Créditos</th><th class="num">Mensagens</th><th class="num">Usuários</th></tr></thead>
            <tbody>${U.days.map((d) => `<tr><td class="strong">${d.full}</td><td class="num">${brl(d.brl)}</td><td class="num">${esc(d.usd)}</td><td class="num">${esc(d.credits)}</td><td class="num">${d.messages}</td><td class="num">${d.users}</td></tr>`).join("")}</tbody></table></div></div>`
          : P.empty({ icon: "chart", title: "Sem uso neste período", text: "Nenhuma mensagem foi enviada entre essas datas.", actions: [{ label: "Ver últimos 30 dias", act: "r30" }], center: true, plain: true })}
        </section>

        <section aria-labelledby="t-mod">
          <div class="section-title" style="margin-top:0"><h2 id="t-mod">Custo por modelo</h2><p>≈ R$ · por conversa</p></div>
          <div class="table-wrap table-wrap--cards"><table class="table"><thead><tr><th>Modelo</th><th class="num">Conversas</th><th>Participação</th><th class="num">Médio</th></tr></thead>
            <tbody>${models.length ? models.map((m) => `<tr><td class="cell-main"><span class="cell-name">${P.modelIcon(m)}<span class="strong">${esc(m.name)}</span></span></td><td class="num" data-label="Conversas">${m.conversations}</td>
              <td data-label="Custo"><div class="share-bar"><span class="meter meter--thin"><span class="meter__fill" style="--v:${maxCost ? Math.max(2, (m.cost / maxCost) * 100) : 0}%"></span></span><span>≈ ${brl(m.cost)}</span></div></td>
              <td class="num" data-label="Médio">≈ ${brl(m.conversations ? m.cost / m.conversations : 0)}</td></tr>`).join("") : `<tr class="table-empty"><td colspan="4">Sem custo por modelo no período.</td></tr>`}</tbody></table></div>
          ${totalCost ? `<p class="hint mt-2">Total por modelo ≈ ${brl(totalCost)}.</p>` : ""}
        </section>
      </div>

      <section class="mt-8" aria-labelledby="t-alert">
        <div class="section-title"><h2 id="t-alert">Alertas de custo</h2></div>
        <div class="alert alert--success">${icon("check-circle")}<div class="alert__body"><p><strong>Nenhum dia passou do limiar diário.</strong> O alerta sai quando o custo real de um dia passa do limiar.</p></div></div>
      </section>

      <section class="mt-8" aria-labelledby="t-ev">
        <div class="section-title"><h2 id="t-ev">Eventos</h2><p data-ev-count></p></div>
        <div class="chips" role="group" aria-label="Filtrar eventos por tipo" style="margin-bottom:12px" data-ev-types>
          ${[["", "Todos", U.events.length], ...types.map((t) => [t, t, U.events.filter((e) => e.type === t).length])].map(([v, l, n]) => `<button type="button" class="chip" data-ev="${esc(v)}" aria-pressed="${!v}">${esc(l)}<span class="count">${n}</span></button>`).join("")}
        </div>
        <div class="table-wrap table-wrap--cards"><table class="table"><thead><tr><th>Tipo</th><th>Quando</th><th>Usuário</th><th>Resumo</th></tr></thead><tbody data-events></tbody></table></div>
      </section>`;

    const renderEvents = (type = "") => {
      const rows = U.events.filter((e) => !type || e.type === type);
      $("[data-ev-count]").textContent = P.plural(rows.length, "evento", "eventos");
      $("[data-events]").innerHTML = rows.length ? rows.map((e) => `<tr><td class="cell-main"><span class="badge ${e.kind === "danger" ? "badge--danger" : "badge--warning"}">${esc(e.type)}</span></td><td class="tnum nowrap" data-label="Quando">${esc(e.when)}</td><td class="mono" data-label="Usuário">${esc(e.user)}</td><td data-label="Resumo">${esc(e.summary)}</td></tr>`).join("")
        : `<tr class="table-empty"><td colspan="4">Nenhum evento ${type ? "deste tipo " : ""}no período.</td></tr>`;
    };
    renderEvents();
    $("[data-ev-types]").addEventListener("click", (e) => { const b = e.target.closest("[data-ev]"); if (!b) return; $$("[data-ev]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); renderEvents(b.dataset.ev); });
    P.ready(body);
    $$(".kpi [data-tick]", body).forEach((el) => P.ticker(el));
  };

  /* Período */
  const setRange = (days) => {
    const to = new Date("2026-10-06T12:00:00");
    const from = new Date(to);
    from.setDate(to.getDate() - days + 1);
    $("#u-from").value = from.toISOString().slice(0, 10);
    $("#u-to").value = to.toISOString().slice(0, 10);
  };
  const rangeSeg = $("[data-range]");
  rangeSeg.addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (!b) return; $$("[data-d]", rangeSeg).forEach((x) => x.setAttribute("aria-pressed", String(x === b))); P.moveInd(rangeSeg); setRange(+b.dataset.d); });
  ["#u-from", "#u-to"].forEach((s) => $(s).addEventListener("input", () => { $$("[data-d]", rangeSeg).forEach((x) => x.setAttribute("aria-pressed", "false")); P.moveInd(rangeSeg); }));
  $("[data-filters]").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("#u-from").value > $("#u-to").value) { P.validate(e.currentTarget, { "#u-to": [() => "A data final vem depois da inicial."] }); return; }
    P.run($("[data-apply]"), () => P.api.send("GET", "/v1/admin/usage", {}, { delay: 500 }), { success: "Período aplicado" }).catch(() => {});
  });
  document.addEventListener("click", (e) => { if (e.target.closest('[data-act="r30"]')) { $('[data-d="30"]').click(); } });

  P.ready();
  P.load(body, () => P.api.get("/v1/admin/usage"), mount, {
    skeleton: `<div class="kpis">${Array.from({ length: 4 }, () => `<div class="card kpi"><div class="skel skel--line" style="width:40%"></div><div class="skel" style="height:30px;width:70%"></div><div class="skel skel--line" style="width:55%"></div></div>`).join("")}</div><div class="split mt-8"><div class="card" style="height:280px"><div class="skel" style="height:100%;border-radius:16px"></div></div><div class="table-wrap"><table class="table"><tbody>${P.skeleton.table(4, 5)}</tbody></table></div></div>`,
    label: "Carregando uso",
  });
})();
