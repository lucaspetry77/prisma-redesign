/* Asimov Prisma · Índice de telas (telas.html): cada tela, a rota no app e atalhos para os estados. */
(() => {
  const P = window.Prisma;
  const { $, esc } = P;
  const icon = (n, c) => P.icon(n, c);
  const STATES = [["carregando", "Carregando"], ["vazio", "Vazio"], ["erro", "Erro"], ["erro-salvar", "Erro ao salvar"]];
  const groups = [
    { title: "Conversar", items: [
      ["index.html", "/", "Início", "Saudação, composer e atalhos, centralizados.", []],
      ["chat.html?id=d5c5bdf1", "/chat/:id", "Conversa", "Fio com raciocínio, ações, eventos de modelo e anexos.", ["carregando", "erro", "erro-salvar"]],
      ["chat.html?q=Quero%20analisar%20uma%20planilha", "conversa nova", "Conversa nova", "Resposta em streaming, com parar.", []],
    ] },
    { title: "Organizar e criar", items: [
      ["projetos.html", "/projects", "Projetos", "Busca, ordenação, cartões ou lista, criar.", ["carregando", "vazio", "erro", "erro-salvar"]],
      ["projeto.html?id=p2", "/projects/:id", "Projeto", "Composer no topo, conversas, contexto e arquivos.", ["carregando", "erro", "erro-salvar"]],
      ["skills.html", "/skills", "Skills", "Biblioteca com busca e categorias.", ["carregando", "vazio", "erro"]],
      ["skill-nova.html", "/skills/new", "Criar skill", "Escrever e visualizar, modelo, validação.", ["erro-salvar"]],
      ["agentes.html", "/agents", "Agentes", "Seus agentes, favoritos e exemplos.", ["carregando", "vazio", "erro"]],
      ["agente-novo.html", "/agents/new", "Criar agente", "Índice de seções e teste ao vivo.", ["erro-salvar"]],
      ["galeria.html", "/gallery", "Galeria", "Explorar e favoritos, busca, filtros removíveis.", ["carregando", "vazio", "erro"]],
      ["galeria-item.html?id=g-s1", "/gallery/skills/:id", "Item da galeria", "Ação no topo, instruções, avaliação, moderação.", ["carregando", "erro"]],
      ["perfil.html", "/profile", "Configurações", "Perfil, sobre você, créditos, dados, apagar conta.", ["erro-salvar"]],
    ] },
    { title: "Administração", items: [
      ["admin-modelos.html", "/admin/models", "Modelos", "Padrão, tabela compacta e folha lateral.", ["carregando", "erro", "erro-salvar"]],
      ["admin-uso.html", "/admin/usage", "Uso e custo", "Período, KPIs, gráfico, por modelo, eventos.", ["carregando", "vazio", "erro"]],
      ["admin-usuarios.html", "/admin/users", "Usuários e tetos", "Barras de gasto, cadeia de precedência, políticas.", ["carregando", "vazio", "erro", "erro-salvar"]],
    ] },
    { title: "Entrada e referência", items: [
      ["login.html", "/login", "Entrar", "Conta Asimov. Também: ?erro=acesso e ?erro=sessao.", []],
      ["componentes.html", "(protótipo)", "Componentes", "Vitrine viva do design system no tema claro.", []],
    ] },
  ];
  const withState = (href, s) => href + (href.includes("?") ? "&" : "?") + "estado=" + s;
  $("[data-screens]").innerHTML = groups.map((g) => `
    <section class="mt-8"><div class="section-title"><h2>${esc(g.title)}</h2></div>
      <div class="screens">${g.items.map(([href, route, title, desc, states]) => `
        <article class="card card--interactive screen-link">
          <a class="screen-link__title card__link" href="${href}">${esc(title)}</a>
          <span class="screen-link__route">${esc(route)}</span>
          <span class="screen-link__desc">${esc(desc)}</span>
          ${states.length ? `<span class="screen-link__states above">${states.map((s) => `<a class="badge" href="${withState(href, s)}">${STATES.find((x) => x[0] === s)[1]}</a>`).join("")}</span>` : ""}
        </article>`).join("")}</div></section>`).join("");
  P.ready();
})();
