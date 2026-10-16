# Asimov Prisma: front no tema claro

Redesenho completo do front do [Asimov Prisma](https://staging.prisma.asimov.academy), a plataforma de chat de IA da Asimov,
no **tema claro do Asimov Design System**: tokens, regras e componentes do pacote oficial (`AGENTS.md`, `tokens.json`,
`assets/css/tokens.css`, `components.html`, `starter.html`) e a derivação clara oficial (`modo-claro.css` do
[repositório do DS](https://github.com/asimov-academy/asimov-design-system)). Inter é a única fonte. São só as telas: HTML,
CSS e JavaScript puros, sem build, sem dependências e sem CDN. Os dados são de exemplo e vêm do staging em 06/10/2026.

## Como abrir

```bash
python3 -m http.server 4180
```

Depois acesse `http://localhost:4180/telas.html`. Também funciona direto via `file://`. A raiz (`index.html`) é o início do chat.

## Telas

| Arquivo | Rota no app | O que tem |
|---|---|---|
| `login.html` | `/login` | Conta da Asimov; estados `?erro=acesso` e `?erro=sessao` |
| `index.html` | `/` | Saudação, composer, atalhos que preenchem, "Continuar de onde parou", "Seus agentes" |
| `chat.html?id=…` | `/chat/:id` | Fio com raciocínio, ações por resposta, eventos de modelo, título editável, rolar para o fim |
| `chat.html?q=…` | conversa nova | Resposta em streaming com parar (`model`, `agent`, `skills`, `project`, `attachments`) |
| `projetos.html` | `/projects` | Busca, ordenação, cartões ou lista, criar (`?novo=1`), renomear, apagar |
| `projeto.html?id=…` | `/projects/:id` | Composer no topo, conversas, contexto e arquivos ao lado (abas no celular) |
| `skills.html` | `/skills` | Biblioteca com busca e categorias (`?vazio=1`) |
| `skill-nova.html` | `/skills/new` | Editor de página inteira, Escrever/Visualizar, modelo (`?id=` edita) |
| `agentes.html` | `/agents` | Seus agentes, favoritos e exemplos oficiais (`?vazio=1`) |
| `agente-novo.html` | `/agents/new` | Índice de seções e teste ao vivo (`?id=` edita, `#testar` no celular) |
| `galeria.html` | `/gallery` | Explorar e favoritos, busca, categorias, origem, ordem (`?tipo=skills`, `?vista=favoritos`) |
| `galeria-item.html?id=…` | `/gallery/skills/:id` | Ação no topo, instruções, avaliação, moderação (admin) |
| `perfil.html` | `/profile` | Perfil, sobre você, créditos, atalhos de teclado, exportar, apagar conta |
| `admin-modelos.html` | `/admin/models` | Modelo padrão, tabela compacta, folha lateral de edição |
| `admin-uso.html` | `/admin/usage` | Período, KPIs, custo por dia (gráfico ou tabela), por modelo, alertas, eventos |
| `admin-usuarios.html` | `/admin/users` | Gasto contra o teto, cadeia de precedência, políticas de teto |
| `telas.html` | (protótipo) | Índice das telas com atalhos para os estados |
| `componentes.html` | (protótipo) | Vitrine viva do design system |

Em qualquer tela: `?estado=carregando`, `?estado=vazio`, `?estado=erro` ou `?estado=erro-salvar` mostram o estado, e
`?movimento=reduzido` liga o mesmo ramo de `prefers-reduced-motion` para revisar sem mudar a preferência do sistema.

## Atalhos

⌘K (Ctrl K) busca qualquer coisa · ⌘⇧O novo chat · ⌘\ recolhe a barra lateral · `/` foca o campo · `?` lista os atalhos.

## Estrutura

```
assets/
  css/
    tokens.css      Tokens do pacote do DS + derivação clara oficial + molas do UI Arc. Cada token diz de onde veio.
    base.css        Reset, tipografia, foco, utilitários
    components.css  Botões, campos, menus, modal, folha lateral, toast, abas, tabela, estados…
    shell.css       Barra lateral, painel principal, topo do celular, paleta ⌘K
    chat.css        Início, conversa, composer, seletor de modelo
    pages.css       Layouts das demais telas
    motion.css      Animações (fadeSlideIn, pco-enter e giro de 3s do DS) e movimento reduzido
  js/
    icons.js        Ícones Solar (a família do DS), embutidos
    data.js         Dados de exemplo no formato da API (/v1/...)
    core.js         Utilitários, preferências locais, camada de API, atalhos
    ui.js           Componentes: toast, menu, dica, modal, folha, estados, validação, número que rola…
    shell.js        Barra lateral (e a do admin), paleta ⌘K, NPS, mover para projeto
    composer.js     Campo de mensagem, seletor de modelo, painéis do +
    motion.js       Saudação em sequência, cristal que inclina, placeholder que se escreve
    pages/          Um script por tela
  fonts/ img/ icons/
docs/redesign/      Inventário, design system, referências (Mobbin), interações (UI Arc), fluxos e handoff
scripts/            Gerador dos ícones (não roda no app)
```

Cada página tem `<div class="app" data-page data-nav>` com um `<main class="main">`. Os scripts ficam no fim do `<body>`:
`icons.js`, `data.js`, `core.js`, `ui.js`, `motion.js`, `shell.js`, (`composer.js`) e o script da tela, que termina com `Prisma.ready()`.

## Para integrar no app

- **Dados:** toda leitura e gravação passa por `Prisma.api` (`assets/js/core.js`). Troque o `resolve()` por `fetch`, mantendo os endpoints e o formato de `data.js`.
- **Resposta da IA:** troque `streamReply()` em `assets/js/pages/chat.js` pelo stream da API, mantendo `.prose` e `.tok`.
- **Componentes:** as classes não dependem de tela e podem virar componentes React um a um. Ordem sugerida no handoff.

A documentação completa está em [`docs/redesign/`](docs/redesign/); comece pelo [handoff](docs/redesign/05-handoff.md).

## Publicação na Vercel

Site estático, sem build. **Framework:** Other · **Build command:** vazio · **Output directory:** a raiz.
O `vercel.json` marca o site como `noindex`. Para deixar visível só para o time, ative **Deployment Protection**.

## Acessibilidade

Link para pular ao conteúdo, foco visível só pelo teclado, menus e listas com setas, Home, End e Esc, modais e folhas com foco preso
e retorno ao gatilho, gaveta do celular com o resto da página inerte, `aria-current`, `aria-sort`, `aria-invalid` com a mensagem
ligada ao campo, regiões vivas para streaming e toasts, contraste AA (medido) e `prefers-reduced-motion` respeitado.
