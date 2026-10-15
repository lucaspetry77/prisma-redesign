# Asimov Prisma: front no tema claro

Redesenho do front do [Asimov Prisma](https://staging.prisma.asimov.academy), a plataforma de chat de IA da Asimov,
no **modo claro do Asimov Design System**. São só as telas: HTML, CSS e JavaScript puros, sem build, sem dependências
e sem CDN. Os dados são de exemplo e vêm do staging em 06/10/2026.

## Como abrir

Abra `telas.html` no navegador. Ele lista todas as telas, com a rota equivalente no app atual.
A raiz (`/` ou `index.html`) é o início do chat.

Os arquivos funcionam direto via `file://`. Se preferir servir a pasta:

```bash
python3 -m http.server 4180
```

Depois acesse `http://localhost:4180/telas.html`.

## Telas

| Arquivo | Rota no app | O que tem |
|---|---|---|
| `login.html` | `/login` | Entrada com a conta da Asimov |
| `index.html` | `/` | Início do chat: saudação, campo de mensagem, sugestões, seletor de modelo, menu + |
| `chat.html?id=…` | `/chat/:id` | Conversa: anexos, raciocínio, troca de modelo, avaliar, copiar, Refazer |
| `chat.html?q=…` | conversa nova | Resposta simulada em streaming, com parar |
| `projetos.html` | `/projects` | Lista, busca, novo projeto, renomear e apagar |
| `projeto.html?id=…` | `/projects/:id` | Contexto, arquivos, conversas do projeto e campo para nova conversa |
| `skills.html` | `/skills` | Suas skills e atalho para a Galeria |
| `skill-nova.html` | `/skills/new` | Criar e editar skill (`?id=` edita) |
| `agentes.html` | `/agents` | Seus agentes e favoritos da galeria |
| `agente-novo.html` | `/agents/new` | Exemplos oficiais, formulário completo e teste ao vivo (`?id=` edita) |
| `galeria.html` | `/gallery` | Explorar e favoritos, agentes e skills, filtros (`?tipo=skills`) |
| `galeria-item.html?id=…` | `/gallery/skills/:id` | Detalhe de skill ou agente, avaliar, favoritar, moderação |
| `perfil.html` | `/profile` | Perfil, atalhos, exportar dados, apagar conta |
| `admin-modelos.html` | `/admin/models` | Catálogo de modelos com ligar, esconder, padrão e edição |
| `admin-uso.html` | `/admin/usage` | Totais, custo por dia e por modelo, alertas e eventos |
| `admin-usuarios.html` | `/admin/users` | Gasto contra tetos e políticas de teto |

`?vazio=1` em `skills.html` e `agentes.html` mostra o estado vazio.

## O que mudou em relação ao front atual

- **Tema claro do DS:** fundo quase branco e liso (`#fcfcfd`), superfícies brancas e em vidro claro, texto `#09090b`/`#52525b`,
  linhas `#e4e4e7`, profundidade por sombra suave e o Ciano Asimov (tema oficial do DS, escolhido para casar com o azul do logo) escurecido para texto (contraste AA).
- **Tipografia do DS:** Inter com títulos em peso 500 e tracking negativo, rótulos em caixa alta com tracking,
  e Instrument Serif itálico como acento (o “Prisma” da marca e o nome na saudação e no login).
- **Logo novo do Prisma** (o “A” de cristal, `assets/img/prisma-new-logo.png`): grande no início e no login,
  pequeno no avatar das respostas, no seletor de modelo, na barra recolhida e no ícone da aba. As telas usam
  versões leves geradas dele (`prisma-logo-512.webp`, `prisma-logo-128.webp`, `prisma-favicon.png`).
- **Sugestões em pílulas neutras:** padrão único do início, com ícones e títulos; no celular, rolam na horizontal.
- **Início enxuto:** fundo liso e orbe animado, o título, o campo de mensagem
  e três sugestões. A **paisagem de dia** do DS fica só no login, que é a tela de boas-vindas.
- **Navegação lateral única** em todas as telas: novo chat, seções, conversas recentes, créditos e conta.
  Recolhe no desktop e vira gaveta no celular.
- **Composer** com as ações do menu + (arquivo, prompts e contextos, agente, skills, projeto) mostradas como pílulas
  no próprio campo, e o seletor de modelo com o Asimov em destaque e os demais em “Outros”.
- **Criar agente** em duas colunas: formulário à esquerda e teste ao vivo fixo à direita. Abaixo de 1100px o teste
  vira uma gaveta aberta por um botão flutuante (`agente-novo.html#testar` abre direto).
- **Galeria** com um padrão único de card (o mesmo de “Seus agentes”), selo de verificado no autor oficial, filtros
  separados da ordenação e, no celular, filtros em pílulas que rolam para o lado.
- **Admin** com KPIs, gráfico de custo por dia (uma série, com dica ao passar o mouse e tabela equivalente)
  e barras de gasto contra o teto.
- Recursos marcados no app como pós-MVP aparecem com o selo **Pós-MVP** e avisam ao clicar.

## Movimento e efeitos

Tudo fica em `assets/css/motion.css` e `assets/js/motion.js`, por cima dos componentes. Sem essa camada, as telas
funcionam iguais. O fundo é liso; só o login tem a paisagem de dia do design system.

- **Logo:** no login o cristal flutua e inclina na direção do ponteiro; no início o orbe reage ao foco e ao texto do campo. No cristal, um
  reflexo de luz atravessa as faces de tempos em tempos e as refrações mudam de tom devagar. Enquanto a IA responde, o reflexo do avatar passa em loop.
  As camadas de luz usam o próprio logo como máscara (componente `.crystal`, `Prisma.crystal()`).
- **Campo de mensagem:** um halo suave do acento no foco e um placeholder que se escreve sozinho com ideias de pedidos.
- **Resposta da IA:** “Pensando…” com brilho e palavras que aparecem desfocando.
- **Cards:** holofote que segue o ponteiro (com a borda acendendo perto do cursor).
- **Navegação:** transição entre páginas (View Transitions), destaque que desliza entre os itens da barra lateral,
  indicador deslizante em segmentos e abas, entrada em cascata ao rolar.
- **Feedback:** saída animada de menus e modais, check que se desenha no toast, coração que estoura ao favoritar,
  copiar vira check, números do admin que contam e barras que crescem.

`prefers-reduced-motion` desliga o movimento.

## Estrutura

```
assets/
  css/
    tokens.css      Cores, sombras, raios, fontes e tema (troque as variáveis --accent* para mudar o tema)
    base.css        Reset, layout do app e barra lateral
    components.css  Botões, campos, selos, cards, menus, modais, tabelas, toasts…
    chat.css        Início, mensagens e composer
    pages.css       Estilos próprios de cada tela
    motion.css      Animações e efeitos
  js/
    icons.js        Ícones SVG de traço: <i class="i" data-icon="folder"></i>
    data.js         Dados de exemplo (o formato que as telas esperam da API)
    app.js          Barra lateral e componentes em window.Prisma (menu, modal, confirm, toast, composer…)
    motion.js       Efeitos: holofote, inclinação, entradas, indicadores, contagem, placeholder
    pages/          Scripts das telas maiores (chat, projetos, criar agente)
  fonts/            Inter e Instrument Serif, locais (licenças OFL na pasta)
  img/              Logo da Asimov, logo do Prisma (original e versões leves) e paisagem de dia do DS
```

Cada página tem `<div class="app" data-page="…">` com um `<main class="main">`. O `app.js` monta a barra lateral e
o topo do celular em volta dela. Os scripts ficam no fim do `<body>`, nesta ordem: `icons.js`, `data.js`, `app.js`
`motion.js` e o script da página, que termina com `Prisma.ready()`.

## Para integrar no app

- **Dados:** cada bloco de `assets/js/data.js` corresponde a um endpoint (`/v1/conversations`, `/v1/models`,
  `/v1/projects`, `/v1/skills`, `/v1/agents`, `/v1/gallery`, uso e usuários do admin). Os objetos já têm os campos
  que as telas usam.
- **Resposta da IA:** `streamReply()` em `assets/js/pages/chat.js` simula o streaming. Troque pelo stream da API
  mantendo os mesmos elementos (`.prose` e as palavras em `.tok`).
- **Ações:** salvar, apagar, publicar, exportar e enviar arquivos mostram um aviso e mudam só a tela.
  Os pontos de integração são os `onClick`/`onConfirm` de cada modal e os `submit` dos formulários.
- **Componentes:** as classes de `components.css` não dependem de tela e podem virar componentes React no Next.js atual
  um a um (`.btn`, `.field`, `.menu`, `.modal`, `.composer`, `.tone-card`, `.table`…).
- **Preferências locais:** a barra recolhida, o grupo “Outros” aberto, “Pular sugestões” e os prompts salvos ficam
  no `localStorage` com o prefixo `prisma:`.

## Publicação na Vercel

O projeto é um site estático, sem build. Na Vercel, importe o repositório com:

- **Framework:** Other
- **Build command:** vazio
- **Output directory:** a raiz

O `vercel.json` marca o site como `noindex` (é um protótipo interno). Para deixar visível só para o time, ative
**Deployment Protection** nas configurações do projeto na Vercel.

## Acessibilidade

Navegação por teclado em menus (setas, Esc), modais com foco preso e Esc para fechar, abas com setas,
`aria-current` na navegação, rótulos em todos os botões de ícone, foco visível no acento, contraste AA no texto
e `prefers-reduced-motion` respeitado.
