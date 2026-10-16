# 00 · Inventário do Asimov Prisma

Levantamento do front que existia antes do redesenho (commit `df285aa`, importado de `asimov_prisma_design`).
Este é o ponto de partida: o que o produto faz, para quem, quais telas, fluxos, componentes, contratos e regras
precisam continuar valendo depois do redesenho.

## 1. Domínio: o que é e para quem

**Asimov Prisma** é a plataforma de chat de IA da Asimov Academy (edtech brasileira de IA, dados e automação).
É o "ChatGPT da Asimov": uma só interface para conversar com vários modelos (roteador próprio "Asimov Basic/Plus"
e modelos da OpenAI, Anthropic, Google e DeepSeek), organizada em torno de três ideias de reaproveitamento:

| Conceito | O que é | Analogia de mercado |
|---|---|---|
| **Projeto** | Pasta de conversas com contexto (texto) e arquivos que valem para todas as conversas dela | Claude Projects, ChatGPT Projects |
| **Skill** | Conjunto de instruções que a IA segue enquanto está ligada na conversa (até 5) | Claude Skills, "custom instructions" por conversa |
| **Agente** | Assistente salvo: instruções + modelo + estilo + arquivos + skills + perguntas iniciais | GPTs, Gems, Poe bots |
| **Galeria** | Vitrine de agentes e skills oficiais (Asimov) e da comunidade, com favoritos e avaliação | GPT Store, Poe Explore |

**Para quem**

- **Aluno (papel `USER`)**: profissional que está aprendendo IA nos cursos da Asimov (contadores, analistas,
  gestores, criadores). Majoritariamente não programa. Quer resultado prático: organizar rotina, analisar planilha,
  descobrir automações, escrever melhor. Entra com a mesma conta dos cursos (SSO do Hub), tem créditos semanais e
  diários. Usa no desktop do trabalho e no celular.
- **Administrador (papel `ADMIN`)**: time da Asimov. Mantém o catálogo de modelos (preço, contexto, visibilidade,
  padrão), acompanha custo real em R$/US$/créditos/tokens, define tetos de gasto por usuário e políticas, e modera a galeria.

**Tom do produto:** "amigo inteligente", sóbrio, direto, sem cara de infoproduto. Copy em pt-BR.

Esse domínio guia as referências (Fase 2): apps de chat de IA (ChatGPT, Claude, Gemini, Perplexity, Poe, Mistral),
construtores de assistentes, vitrines/marketplaces, e consoles de admin/billing de produtos de ponta (Vercel,
Stripe, Linear, OpenAI Platform, Anthropic Console).

## 2. Stack

- **Site estático sem build**: HTML + CSS + JavaScript puros, sem dependências, sem CDN. Abre via `file://` ou
  `python3 -m http.server 4180`. Publicado na Vercel como estático (`vercel.json` com `noindex`).
- **Fontes locais**: Inter 400/500/600/700 e Instrument Serif itálico (OFL).
- **Ícones**: SVG de traço próprio em `assets/js/icons.js` (`<i class="i" data-icon="…">`).
- **Dados**: `assets/js/data.js` (`window.PrismaData`), espelho do staging em 06/10/2026. Cada bloco corresponde a um endpoint `/v1/...`.
- **Shell**: `assets/js/app.js` monta barra lateral e topo móvel em volta de `<div class="app" data-page>` + `<main class="main">`, e expõe `window.Prisma` (menu, modal, confirm, toast, composer, seletor de modelo…).
- **Movimento**: `assets/css/motion.css` + `assets/js/motion.js` (camada opcional por cima; respeita `prefers-reduced-motion`).
- **Estado local**: `localStorage` com prefixo `prisma:` (barra recolhida, grupo "Outros", prompts salvos, avaliação NPS).

## 3. Telas e rotas (contrato a preservar)

O nome do arquivo é a rota do protótipo; a coluna "Rota no app" é a rota do Next.js de produção. **Ambas ficam iguais.**

| Arquivo | Rota no app | Parâmetros | Conteúdo |
|---|---|---|---|
| `login.html` | `/login` | | Entrada com a conta da Asimov (SSO), termos |
| `index.html` | `/` | | Início do chat: saudação, composer, sugestões, seletor de modelo, menu + |
| `chat.html` | `/chat/:id` | `?id=` conversa; `?q=` nova conversa (+ `model`, `agent`, `skills` separadas por `|`, `project`, `attachments` chave do sessionStorage); `?topo` | Conversa: mensagens, anexos, raciocínio, troca de modelo, avaliar, copiar, Refazer, parar streaming |
| `projetos.html` | `/projects` | `?novo=1` abre "Novo projeto" | Lista, busca, novo, renomear, apagar |
| `projeto.html` | `/projects/:id` | `?id=` | Contexto, arquivos, conversas do projeto, composer para conversa nova no projeto |
| `skills.html` | `/skills` | `?vazio=1` | Suas skills, atalho para a Galeria |
| `skill-nova.html` | `/skills/new` | `?id=` edita | Formulário de skill |
| `agentes.html` | `/agents` | `?vazio=1` | Seus agentes, favoritos da galeria |
| `agente-novo.html` | `/agents/new` | `?id=` edita; `#testar` abre o teste no celular | Exemplos, formulário completo, teste ao vivo |
| `galeria.html` | `/gallery` | `?tipo=skills` | Explorar / favoritos, agentes / skills, filtros, ordenação |
| `galeria-item.html` | `/gallery/skills/:id` (e agentes) | `?id=` (`g-a*` agente, `g-s*` skill) | Detalhe, instruções, avaliar, favoritar, usar como base, moderação |
| `perfil.html` | `/profile` | | Sobre você, atalhos, exportar dados, apagar conta |
| `admin-modelos.html` | `/admin/models` | | Catálogo de modelos: ligar, visível, padrão, editar, novo |
| `admin-uso.html` | `/admin/usage` | | Período, totais, custo por dia e por modelo, alertas, eventos |
| `admin-usuarios.html` | `/admin/users` | | NPS, ativos, busca, gasto contra tetos, políticas de teto |
| `telas.html` | (só do protótipo) | | Índice de telas com a rota equivalente |

## 4. Contratos de dados (formato que as telas esperam da API)

| Bloco em `data.js` | Endpoint | Campos usados |
|---|---|---|
| `user` | sessão / `/v1/me` | `name, nickname, email, role (USER/ADMIN), initials, credits{used, dailyLimit, limit, renews}` |
| `conversations` | `/v1/conversations` | grupos `{group, items[{id, title, project?}]}` |
| `models` | `/v1/models` | `key, name, desc, featured, icon (prisma/prisma-plus) ou logo, on, visible, isDefault, order, badge, priceIn, priceOut, ctx, maxOut, files, images, cacheMin, provider, modality (text/image), prefs, conversations, cost` |
| `suggestions` | (config) | `tone, icon, title, text, prompt` |
| `thread` | `/v1/conversations/:id` | `id, title, model, messages[{role user/ai/event, time, text, html, files[{name, kind, size, type}], model, reasoning, rated up/down, last}]` |
| `projects` | `/v1/projects` | `id, name, tone, context, files, conversations, updated` |
| `mySkills` | `/v1/skills` | `id, name, desc, category, updated, uses` |
| `myAgents` | `/v1/agents` | `id, name, tone, initials, desc, model, skills, files, updated, published` |
| `gallery.agents` / `gallery.skills` | `/v1/gallery` | `id, name, initials?, tone?, category, desc, fav, rating, date, instructions?` |
| `usage` | `/v1/admin/usage` | `period, from, to, totals{costBRL, costUSD, credits, messages, cacheSaving, cacheRate, interval, truncated, gated, overhead, overheadSub, tokens, cachedTokens}, fx, days[{day, full, brl, usd, credits, messages, users}], events[{type, kind, when, user, summary}]` |
| `users` | `/v1/admin/users` | `name, email, role, plan, active, last, week{spent, cap, credits, source}, month{…}` |
| `policies` | `/v1/admin/policies` | `name, week, month, updated` |

Streaming: `streamReply()` em `assets/js/pages/chat.js` simula o stream; na integração, troca-se pelo stream da API mantendo `.prose` e as palavras em `.tok`.

## 5. Regras de negócio (todas preservadas)

**Chat e composer**
- Enter envia; Shift+Enter quebra linha; não envia vazio (sem texto e sem arquivo); bloqueia enquanto anexos carregam.
- Modelos por **modalidade** (`text` / `image`). O botão de imagem alterna para o último modelo de imagem usado e volta ao último de texto.
- Seletor de modelo: só `on && visible` da modalidade atual, ordenados por `order`; `featured` no topo, demais em "Outros" (aberto se o modelo atual não é destaque; lembra a escolha).
- **Imagem anexada + modelo que não lê imagens** bloqueia o envio e oferece "Escolher modelo com imagens".
- Trocar de modelo no meio da conversa insere o evento "Modelo trocado para X".
- **Até 5 skills por conversa** (suas + oficiais). Skills oficiais já aparecem no painel de skills.
- Menu +: enviar arquivo, prompts e contextos (prompts salvos localmente, até 30), conversar com um agente (busca, filtros Todos/Asimov/Favoritos, categoria), skills, adicionar ao projeto.
- Durante a resposta: botão vira **Parar**; ao parar, mostra "Resposta interrompida."
- **Refazer** só na última resposta da IA (gera nova resposta e usa créditos). Avaliar positiva/negativa (exclusivas). Copiar.
- Conversa: renomear (até 120), mover para projeto, baixar (.md), compartilhar por link, apagar (confirmação).
- Nova conversa a partir do início leva `q, model, agent, skills, project, attachments` para `chat.html`; o título é o começo da mensagem (60 caracteres) ou "Conversa com imagem".

**Projetos**
- Nome obrigatório (até 80); contexto opcional (até 2.000); **até 20 arquivos de texto, até 30 MB cada**.
- Conversa nova dentro do projeto já entra com o contexto e os arquivos (projeto travado no composer).
- Apagar projeto: contexto e arquivos somem; **as conversas continuam** na lista.
- Cor do projeto: Pós-MVP.

**Skills**
- Nome (60), descrição (160) e instruções (19.967) obrigatórios; categoria opcional (40) com sugestões.
- Instruções aceitam markdown como texto (sem pré-visualização formatada).
- Apagar: sai de todas as conversas e agentes. Publicar na galeria: Pós-MVP.

**Agentes**
- Nome (80) e instruções (20.000) obrigatórios; descrição (200) obrigatória **para publicar**.
- Imagem PNG/JPG/GIF/WebP até 5 MB; sem imagem usa iniciais do nome.
- Modelo; jeito de responder: Preciso / Equilibrado (padrão) / Criativo; categorias múltiplas (cria nova digitando, até 40).
- **Até 5 arquivos (30 MB cada)** e **até 5 skills** por agente (suas + oficiais; da comunidade só copiando antes).
- Até **4 perguntas sugeridas** (120 cada); primeira mensagem opcional (1.000), não gasta créditos.
- "Usar como base" de exemplo oficial pede confirmação se já houver nome ou instruções.
- Teste ao vivo usa a versão do formulário (antes de salvar), gasta créditos e não entra nas conversas.
- Criação automática, "Melhorar instrução" e link de compartilhamento: Pós-MVP.

**Galeria**
- Tipos agentes/skills; origem oficial/comunidade; categoria; ordem: recentes, melhor avaliados, nome.
- Favoritar (aparece em "Meus favoritos" e em Agentes). Avaliar 1 a 5 estrelas.
- Agente: Conversar, Usar como base. Skill: Copiar skill (vai para Suas skills), Usar como base.
- Moderação (só admin): remover da galeria; quem copiou mantém a cópia.

**Perfil**
- Nome no Hub e e-mail somente leitura. Apelido (40) e "sobre você" (2.000) valem para todas as conversas.
- Foto PNG/JPG/GIF/WebP até 5 MB, vale depois de salvar. Salvar só habilita com mudança.
- Exportar dados (perfil, conversas, skills, agentes, projetos, salvos, memórias, avaliações, favoritos), sem créditos.
- Apagar conta: imediato e sem volta; exige digitar **APAGAR**.

**Créditos**
- Limite diário e semanal; % usado na semana; renovação com data. Barra fica âmbar acima de 70% e vermelha acima de 90%.

**Admin**
- Modelos: ligar/desligar, visível no seletor, **um único padrão**, ordem, selo (até 40), preços US$/1M (entrada/saída), contexto e saída máx., aceita arquivos/imagens, mínimo de cache, fornecedor, modalidade, preferências de fornecedor (JSON). Novo modelo nasce desligado. Nome, chave, fornecedor e modalidade não mudam depois de criados.
- Uso: período (De/Até, atalhos 7 e 30 dias), agrupar por dia/usuário/modelo; totais; R$ com ≈ convertidos pela cotação; custo por dia (uma série) com tabela equivalente; custo por modelo; alertas quando o custo do dia passa do limiar; eventos filtráveis por tipo.
- Usuários: busca por nome/e-mail; gasto da semana e do mês contra o teto; origem do teto. **Precedência do teto: próprio do usuário → plano → papel → política geral → padrão do sistema (R$ 10,00/semana, R$ 40,00/mês).** Vazio = herda.
- NPS 0 a 10 com comentário opcional (avaliação da plataforma no menu da conta).

**Pós-MVP** aparecem com selo e avisam ao clicar.

## 6. Fluxos críticos

1. **Começar a conversar** (o fluxo nº 1): início → digitar ou escolher sugestão → (opcional: modelo, arquivo, agente, skills, projeto) → enviar → conversa nova com resposta em streaming.
2. **Continuar uma conversa**: barra lateral → conversa → ler, copiar, avaliar, refazer, trocar modelo, anexar, parar.
3. **Trabalhar num projeto**: criar projeto (nome + contexto + arquivos) → abrir → conversar já com contexto → mover conversas antigas para ele.
4. **Reaproveitar instruções**: criar skill → ligar no composer (até 5) ou anexar a um agente.
5. **Criar um agente**: começar de exemplo ou do zero → identidade → instruções → modelo/estilo → conhecimento → perguntas iniciais → testar ao vivo → salvar (opcional publicar).
6. **Descobrir na galeria**: explorar → filtrar → abrir detalhe → conversar com agente / copiar skill / favoritar / avaliar.
7. **Ajustar o perfil**: apelido, sobre você, foto; exportar dados; apagar conta.
8. **Acompanhar créditos**: medidor na barra → popover com limites e renovação.
9. **Admin: catálogo** → ligar/esconder/padrão/editar/novo modelo.
10. **Admin: custo** → escolher período → ler totais, gráfico, por modelo, alertas, eventos.
11. **Admin: tetos** → buscar usuário → editar teto próprio → gerenciar políticas.
12. **Entrar** → login com conta Asimov → início.

## 7. Componentes existentes

**Shell:** barra lateral (marca, recolher, novo chat, seções, conversas por dia com menu, cursos, créditos, conta), topo móvel com gaveta, scrim.

**Base:** `btn` (primary, secondary, ghost, ink, danger, danger-outline, sm, lg, block, glow), `icon-btn`, `input`, `textarea` (+ code), `select`, `input-icon`, `field` + `label` + `counter` + `hint`, `check`, `choice` (cartão de rádio), `switch`, `segmented`, `tabs`, `badge` (accent, success, danger, muted, soon, official), `status`, `avatar` (tons, quadrado, tamanhos), `icon-chip`, `meter`, `card` (glass, link, pad), `tone-card`, `menu`, `panel`, `modal`, `toast`, `table`, `codeblock`, `dropzone`, `empty`, `note`, `crumb`, `stars`, `verified`, `crystal` (logo animado), `orb`.

**Chat:** `composer` (contexto em pílulas, aviso de imagem, barra com +, anexar, imagem, modelo, enviar/parar), `model-menu`, `msg` (user, ai, event), `reasoning`, `prose`, `file-chip`, `pill-suggestion`, `thinking`, `agent-browser`, `pick-row`.

**Páginas:** `project-card`, `project-panel`, `g-card`, `example`, `form-section`, `form-layout`, `tips`, `test-panel` (+ gaveta e FAB), `category-select` (combobox multi), `question-list`, `detail`, `settings` (nav lateral com âncoras), `kpi`, `bars` (gráfico), `inline-bar`, `filterbar`, `results-bar`, `sort`, `login`.

## 8. Problemas do front atual (o que o redesenho precisa resolver)

1. **Sem busca global.** Não há como achar uma conversa antiga, um agente ou uma skill sem rolar. A galeria nem tem busca por texto.
2. **Navegação sem prioridade.** "Admin" disputa espaço com Projetos/Skills/Agentes; a lista de conversas não tem fim nem "ver todas"; o atalho "Cursos" fica no meio do rodapé.
3. **Início vazio de propósito, mas sem ponto de partida.** Orbe decorativo grande, três sugestões genéricas; nada leva a projetos ou agentes recentes.
4. **Projeto como página de formulário.** Contexto e arquivos ocupam o topo; o que a pessoa quer (conversar no projeto) fica no rodapé.
5. **Construtor de agente longo e sem mapa.** Sete seções empilhadas, sem índice; exemplos tomam a primeira dobra mesmo para quem edita.
6. **Admin de modelos com 18 colunas** e rolagem horizontal; editar abre um modal enorme que cobre a tabela.
7. **Admin dentro do app de aluno**: subnavegação como segmented dentro da página, sem identidade de "área de administração".
8. **Sem estados de carregamento e erro.** Tudo aparece pronto; não há skeleton, erro recuperável ou "tentar de novo".
9. **Poucos atalhos de teclado** (só menus e abas). Nada de ⌘K, novo chat, focar o campo, alternar barra.
10. **"Atalhos" no perfil** repete links da navegação em vez de ensinar algo útil.
11. **Cards com tons fortes em tudo** (projetos, agentes, skills, painéis): o tom deixa de significar algo.
12. **Rótulos "eyebrow" em caixa alta em toda página** viram ruído; títulos de página longos e explicativos ("Conversas com contexto", "Instruções que você liga e desliga").
