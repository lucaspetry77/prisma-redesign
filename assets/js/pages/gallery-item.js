/* Asimov Prisma · Item da galeria (galeria-item.html?id=; g-a* agente, g-s* skill)
 * Nome, autor e ação principal no topo; instruções copiáveis; avaliação; detalhes e moderação ao lado.
 * Referências: B.5b (ChatGPT, GitBook, Runway, Higgsfield). */
(() => {
  const P = window.Prisma;
  const D = window.PrismaData;
  const { $, $$, esc, fmt } = P;
  const icon = (n, c) => P.icon(n, c);
  const root = $("[data-item]");
  const id = P.params.get("id") || "g-s1";
  const isAdmin = D.user.role === "ADMIN";

  const mount = (it) => {
    if (!it) {
      root.innerHTML = `<a class="back page-head__back" href="galeria.html">${icon("chevron-left")}Galeria</a>${P.empty({ icon: "gallery", title: "Este item não está mais na galeria", heading: true, text: "Ele pode ter sido removido. Quem já tinha copiado continua com a cópia.", actions: [{ label: "Explorar a galeria", href: "galeria.html", variant: "primary" }], center: true })}`;
      P.hydrateIcons(root);
      return;
    }
    const isAgent = id.startsWith("g-a");
    const type = isAgent ? "Agente" : "Skill";
    const instructions = it.instructions || `---\nname: ${it.name}\ndescription: ${it.desc}\n---\n${isAgent ? `Você é o ${it.name}, um agente oficial da Asimov Academy.\n${it.desc}\n\n` : ""}Como responder:\n\n- Comece pelo que importa, sem introdução longa.\n- Use listas curtas quando houver mais de duas ideias.\n- Se faltar informação, pergunte antes de supor.\n- Escreva em português do Brasil, com frases curtas.`;
    document.title = `${it.name} · Galeria · Asimov Prisma`;
    const tb = $(".topbar__title"); if (tb) tb.textContent = it.name;
    const mark = isAgent ? `<span class="avatar avatar--xl avatar--square tone-${it.tone}">${esc(it.initials)}</span>` : `<span class="icon-chip" style="width:64px;height:64px;border-radius:18px">${icon(P.SKILL_ICON[it.category] || "skill", "i--xl")}</span>`;
    root.innerHTML = `
      <a class="back page-head__back" href="galeria.html${isAgent ? "" : "?tipo=skills"}">${icon("chevron-left")}Galeria</a>
      <div class="detail">
        <div>
          <div class="detail__hero">
            ${mark}
            <div class="grow">
              <div class="row row--top" style="gap:10px"><h1 class="detail__name grow">${esc(it.name)}</h1>
                <button type="button" class="btn btn--secondary btn--sm fav" data-fav="${it.id}" aria-pressed="${!!it.fav}" aria-label="${it.fav ? "Tirar dos favoritos" : "Favoritar"}: ${esc(it.name)}">${icon("heart")}<span data-fav-label>${it.fav ? "Favoritado" : "Favoritar"}</span></button></div>
              <div class="detail__stats"><span class="by" style="font-size:var(--text-sm)">por <strong>Asimov</strong>${P.verified()}</span><span class="dot"></span><span>${type}</span><span class="dot"></span><span>${esc(it.category)}</span><span class="dot"></span><span>${it.rating ? `${icon("star-fill", "i--xs")} ${esc(it.rating)}` : "Sem avaliações ainda"}</span></div>
            </div>
          </div>
          <p class="detail__desc">${esc(it.desc)}</p>
          ${isAgent ? "" : `<div class="alert alert--accent mt-6">${icon("check-circle")}<span>Esta skill oficial já está no painel de skills das suas conversas. Ligue pelo <strong>+</strong> do campo de mensagem, em “Skills”.</span></div>`}

          <div class="section-title"><h2>Instruções</h2><p>${fmt(instructions.length)} caracteres</p></div>
          <div class="codeblock is-clamped" data-code>
            <div class="codeblock__bar"><span>${isAgent ? "agente" : "skill"}.md</span><button type="button" class="btn btn--ghost btn--sm" data-copy-ins>${icon("copy")}Copiar</button></div>
            <pre>${esc(instructions)}</pre>
          </div>
          <button type="button" class="btn btn--ghost btn--sm mt-2" data-expand aria-expanded="false">${icon("chevron-down")}<span>Ver tudo</span></button>

          <div class="section-title"><h2>Avaliações</h2><p>${it.rating ? `Média ${esc(it.rating)}` : "Sem avaliações ainda"}</p></div>
          <div class="card card--pad">
            <p class="label" id="rate-l">Sua avaliação</p>
            <div class="stars mt-2" role="radiogroup" aria-labelledby="rate-l" data-stars>${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="star" role="radio" aria-checked="false" aria-label="${n} ${n === 1 ? "estrela" : "estrelas"}" data-star="${n}" tabindex="${n === 1 ? 0 : -1}">${icon("star-fill")}</button>`).join("")}</div>
            <p class="hint mt-2" data-star-hint aria-live="polite">Toque numa estrela para avaliar.</p>
          </div>
        </div>

        <aside class="detail__aside">
          <div class="card card--pad stack">
            ${isAgent
              ? `<a class="btn btn--primary btn--lg btn--block" href="${P.chatWith(it)}">${icon("chat")}Conversar agora</a><a class="btn btn--secondary btn--block" href="agente-novo.html">${icon("copy")}Usar como base</a>`
              : `<button type="button" class="btn btn--primary btn--lg btn--block" data-copy-skill>${icon("copy")}Copiar skill</button><a class="btn btn--secondary btn--block" href="skill-nova.html">${icon("pencil")}Usar como base</a>`}
            <dl class="facts" style="padding-top:14px;border-top:1px solid var(--line)">
              <div><dt>Autor</dt><dd><span class="by" style="font-size:inherit"><strong style="color:var(--ink)">Asimov</strong>${P.verified()}</span></dd></div>
              <div><dt>Tipo</dt><dd>${type}</dd></div>
              <div><dt>Categoria</dt><dd>${esc(it.category)}</dd></div>
              <div><dt>Publicado em</dt><dd>${esc(it.date)}</dd></div>
            </dl>
          </div>
          ${isAdmin ? `<div class="card card--pad stack" style="--gap:10px"><p class="label">Moderação</p><p class="hint">Só administradores veem esta área.</p><button type="button" class="btn btn--danger-outline btn--sm" data-remove>${icon("trash")}Remover da galeria</button></div>` : ""}
        </aside>
      </div>`;

    const code = $("[data-code]", root);
    $("[data-expand]", root).addEventListener("click", (e) => {
      const open = code.classList.toggle("is-clamped") === false;
      e.currentTarget.setAttribute("aria-expanded", String(open));
      $("span", e.currentTarget).textContent = open ? "Mostrar menos" : "Ver tudo";
      $(".i", e.currentTarget).style.transform = open ? "rotate(180deg)" : "";
    });
    $("[data-copy-ins]", root).addEventListener("click", (e) => {
      navigator.clipboard?.writeText(instructions).catch(() => {});
      const b = e.currentTarget;
      b.innerHTML = `${icon("check")}Copiado`;
      setTimeout(() => (b.innerHTML = `${icon("copy")}Copiar`), 1400);
    });
    $("[data-fav]", root).addEventListener("click", (e) => P.favToggle(e.currentTarget, it));
    $("[data-copy-skill]", root)?.addEventListener("click", (e) => P.run(e.currentTarget, () => P.api.send("POST", "/v1/skills/copy", { id: it.id }), { success: `“${it.name}” copiada para Suas skills` }).catch(() => {}));
    // Estrelas: passar o ponteiro pré-visualiza; clicar fixa; setas mudam
    const stars = $$("[data-star]", root);
    let rating = 0;
    const paint = (n, cls = "is-on") => stars.forEach((s) => s.classList.toggle(cls, +s.dataset.star <= n));
    const setRating = (n) => {
      rating = n;
      paint(n);
      stars.forEach((s) => { s.setAttribute("aria-checked", String(+s.dataset.star === n)); s.tabIndex = +s.dataset.star === n ? 0 : -1; });
      $("[data-star-hint]", root).textContent = `Você deu ${n} ${n === 1 ? "estrela" : "estrelas"}. Obrigado!`;
      P.api.send("POST", `/v1/gallery/${it.id}/rating`, { n }).catch(() => P.toast("Não foi possível salvar a avaliação", { danger: true }));
    };
    const box = $("[data-stars]", root);
    box.addEventListener("pointerover", (e) => { const s = e.target.closest("[data-star]"); if (s) paint(+s.dataset.star, "is-hover"); });
    box.addEventListener("pointerleave", () => paint(0, "is-hover"));
    box.addEventListener("click", (e) => { const s = e.target.closest("[data-star]"); if (s) setRating(+s.dataset.star); });
    box.addEventListener("keydown", (e) => {
      if (!["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      e.preventDefault();
      const n = Math.min(5, Math.max(1, (rating || 0) + (/Right|Up/.test(e.key) ? 1 : -1)));
      setRating(n);
      stars[n - 1].focus();
    });
    $("[data-remove]", root)?.addEventListener("click", () => P.confirm({
      title: "Remover da galeria?", desc: `“${esc(it.name)}” deixa de aparecer para todos. Quem já copiou continua com a cópia.`, confirm: "Remover",
      onConfirm: () => P.api.send("DELETE", `/v1/gallery/${it.id}`).then(() => { location.href = "galeria.html" + (isAgent ? "" : "?tipo=skills"); }),
    }));
    P.ready(root);
  };

  root.innerHTML = `<div class="skel skel--line" style="width:80px;margin-bottom:20px"></div><div class="detail"><div><div class="row" style="gap:18px"><div class="skel" style="width:64px;height:64px;border-radius:18px"></div><div class="grow stack"><div class="skel skel--title" style="width:50%;height:30px"></div><div class="skel skel--line" style="width:40%"></div></div></div><div class="stack mt-6">${P.skeleton.lines(3)}</div></div><div class="card skel-card">${P.skeleton.lines(4)}</div></div>${P.loading("Carregando item")}`;
  P.ready();
  P.api.get(`/v1/gallery/${id}`).then(mount).catch((err) => {
    root.innerHTML = P.errorState(err?.message);
    P.hydrateIcons(root);
    $("[data-retry]", root).addEventListener("click", () => location.reload());
  });
})();
