# 02 · Referências (Mobbin)

Pesquisa feita com o MCP do Mobbin (`search_screens` e `search_flows`, plataforma web) em 15/10/2026, olhando as imagens de verdade:
cada descrição abaixo diz o que aparece na tela, não o que os metadados dizem. Daqui saem **estrutura e decisão**; o visual é o do
Asimov Design System (01-design-system.md). 159 links de telas, todos copiados dos resultados (`mobbin_url`).

## Índice: tela do Prisma → referências

| Tela do Prisma | Arquivo | Seção |
|---|---|---|
| Início (novo chat) | `index.html` | A.1 Home |
| Conversa | `chat.html` | A.2 Tela de conversa (thread, streaming e erros, header) |
| Composer, seletor de modelo, menu + | (todas as telas com campo de mensagem) | A.3 Composer |
| Login | `login.html` | A.4 Login com SSO |
| Barra lateral e busca ⌘K | (shell) | A.5 Sidebar e busca global · C.5.3 |
| Projetos | `projetos.html` | B.1 Lista de projetos |
| Projeto | `projeto.html` | B.2 Detalhe do projeto |
| Skills e editor de skill | `skills.html`, `skill-nova.html` | B.3 Skills |
| Agentes e criador de agente | `agentes.html`, `agente-novo.html` | B.4 Agentes |
| Galeria e item | `galeria.html`, `galeria-item.html` | B.5 Galeria |
| Perfil e configurações | `perfil.html` | B.6 Configurações |
| Estados vazios | (todas) | B.7 Empty states · C.5.5 a C.5.7 |
| Admin: modelos | `admin-modelos.html` | C.1 Catálogo de modelos |
| Admin: uso e custo | `admin-uso.html` | C.2 Dashboard de uso |
| Admin: usuários e tetos | `admin-usuarios.html` | C.3 Usuários e limites |
| Navegação do admin | (shell admin) | C.4 Navegação do admin |
| Tabelas, filtros, toasts, carregamento, erro, confirmação | (transversal) | C.5 Padrões transversais |

## Onde o Prisma diverge das referências (e por quê)

- **Saudação:** as referências usam saudação por horário ("Boa tarde"). Mantive "O que vamos criar hoje, *nome*?", que já é a voz do Prisma, com o nome em Instrument Serif.
- **Admin como contexto separado (C.4):** adotado só em parte. Em `/admin/*` a barra lateral troca para a navegação do admin, com "Voltar ao Prisma" no topo, mas continua sendo o mesmo shell, com a mesma conta e os mesmos atalhos.
- **Custo relativo no seletor de modelo (A.3.2):** adotado como 1 a 3 cifrões calculados do preço de saída real (`priceOut`). Modelos sem preço (roteador Asimov) não mostram selo.
- **Duração do raciocínio ("Pensou por 42s"):** o contrato atual não traz a duração. O rótulo fica "Raciocínio" e passa a mostrar a duração quando a API enviar `reasoningMs`.
- **Ramificar conversa, regenerar com outro modelo, comparar períodos, exportar CSV, colunas configuráveis:** não existem no produto nem no contrato. Ficaram fora para não inventar recursos; estão listados no handoff como oportunidades.
- **Projeto de exemplo, checklist de primeiro acesso, distribuição de notas 5→1:** fora pelo mesmo motivo (sem dados reais para sustentar).

## Parte A · Núcleo do chat
Escopo: home/novo chat, tela de conversa, composer (menu "+", seletor de modelo, pills, modo imagem), login SSO, sidebar e ⌘K.
Daqui sai só **estrutura e comportamento** (hierarquia, layout, affordances, estados). Cor, marca e estilo vêm do Asimov Design System (tema claro, Inter + acentos em Instrument Serif, neutros zinc, acento cyan).
Todas as descrições abaixo vêm das telas vistas no Mobbin (web).

---

### 1. Home / início de novo chat

- **Claude — boas-vindas com saudação e composer compacto** · [link](https://mobbin.com/screens/e8c0af18-6e3a-4273-93c1-935e958ff8b3) — Saudação de uma linha em serifa ("Welcome, Sam") com o símbolo da marca e, logo abaixo, um composer em card: "+" à esquerda, modelo ("Sonnet 4.6 Extended ▾") e enviar à direita. Nada mais na tela: foco total no input.
- **Langdock — saudação + composer + chips de tarefa** · [link](https://mobbin.com/screens/fdd8e6dc-5f56-4236-acf1-95fae4203b4f) — O placeholder ensina o atalho ("Ask anything, @ for context and skills"). Na toolbar ficam "+", "Tools", modelo e mic. Abaixo, 7 chips com ícone em 2 linhas centralizadas (Create document, Generate image, Deep research…). É o análogo mais próximo do Prisma (Agents, Skills e Prompts na sidebar).
- **Notion AI — composer + "Recent chats" e "Suggested" em duas colunas** · [link](https://mobbin.com/screens/176a7fae-1de4-4d50-a28b-cb14eef8b18b) — Abaixo do composer há duas colunas leves (lista com ícone e título, sem cards): chats recentes à esquerda e ações sugeridas à direita ("Create custom agent", "Analyze PDFs or images"). Retomar e começar ficam no mesmo lugar.
- **Microsoft Copilot — anexos no composer + chips em 2 linhas + disclaimer** · [link](https://mobbin.com/screens/2ff3d94d-adb2-4937-818d-de633b9757c3) — Os anexos aparecem como cards (ícone do tipo, nome, tipo do arquivo, ×) acima do texto. Os chips curtos de sugestão ficam centralizados e o aviso legal vai em texto pequeno no rodapé da página.
- **Apollo — cota restante dentro do composer + "Start with a preset"** · [link](https://mobbin.com/screens/d365d8bf-344d-482d-88fa-d14564386be8) — Um chip discreto "5 CHATS LEFT" dentro do composer mostra o limite no momento da ação, sem banner. Os presets com ícone vêm abaixo, sob o rótulo "Start with a preset".

**Padrão adotado no Prisma:**
- Coluna central de ~680px, posicionada um pouco acima do centro vertical. Saudação de uma linha em **Instrument Serif** ("Boa tarde, Lucas") com o símbolo do Prisma (Claude).
- Composer em card, com no mínimo 2 linhas. Placeholder que ensina atalhos: "Pergunte qualquer coisa · @ agentes e skills · / prompts" (Langdock). Toolbar: `[+] [pills ativas] ······ [modelo ▾] [enviar]`.
- Até 6 chips de sugestão com ícone, em 1 ou 2 linhas centralizadas (Langdock/Copilot), ligados a recursos do Prisma: Gerar imagem (ativa o modo imagem), Usar um agente, Analisar planilha, Resumir PDF, Escrever e-mail, Explicar um conceito. Clicar **preenche ou ativa** o chip, mas não envia.
- Abaixo dos chips, duas colunas de listas leves (Notion): "Continuar de onde parou" (3 chats recentes, com tempo relativo) e "Seus agentes" (favoritos da Galeria + "Explorar Galeria").
- Cota: chip inline no composer ("8 mensagens restantes hoje") **só** perto do limite (Apollo). Disclaimer de 1 linha no rodapé (Copilot).
- Estados: vazio com "Nenhuma conversa ainda" no lugar dos recentes e as sugestões mantidas ([Notion — vazio](https://mobbin.com/screens/e4b33dac-a24d-4886-bd95-db57821c97d7)). Primeiro acesso: card de checklist dispensável no canto, com barra de progresso ([WRITER](https://mobbin.com/screens/5c0d7553-bec2-44a9-91f4-12f15487b7de)).

---

### 2. Tela de conversa

#### 2.1 Thread: mensagens, raciocínio e ações

- **Claude — bubble do usuário com imagem + resumo do raciocínio colapsado + scroll-to-bottom** · [link](https://mobbin.com/screens/98255484-f7b1-43c3-b9a1-1c6f971de3bd) — A mensagem do usuário fica num bubble pequeno à direita, com a miniatura da imagem anexada **acima** dele. O raciocínio vira uma linha-resumo cinza clicável acima da resposta ("Examined aerial beach scene… ›"). A resposta é prosa sem bubble, com tabela. Um botão circular ↓ flutua sobre o composer quando a tela não está no fim.
- **ChatGPT — "Thought for 42s ›" + resposta longa com fontes inline** · [link](https://mobbin.com/screens/d41feba8-464c-4353-839f-dc10efdfe392) — O raciocínio colapsado mostra só a duração, numa linha. O bubble do usuário (cinza) ocupa no máximo ~metade da largura. A resposta usa H2, bullets com negrito e pills de fonte pequenas no fim das frases.
- **Mistral Le Chat — timestamp à esquerda e ações à direita no rodapé da resposta** · [link](https://mobbin.com/screens/b523f618-8bba-49ff-80dd-436c3a5faa78) — No rodapé da resposta, a hora ("12:54pm") fica à esquerda e 👍 👎 / regenerar / copiar / ler em voz alta à direita. "Thought for 1s" aparece ao lado do avatar da IA. Quando o usuário responde a um trecho, o bubble mostra a citação ("massive star ↩") acima.
- **Gemini — menu ⋯ da resposta** · [link](https://mobbin.com/screens/a53ebb7d-9c80-42c8-bf34-2371411844c0) — A barra de ações tem 👍 👎 regenerar copiar ⋯. O ⋯ guarda ações raras: Branch in new chat, Listen, Export to Docs, View sources, "See response details".
- **ChatGPT — ⋯ com data/hora + "Branch in new chat"** · [link](https://mobbin.com/screens/0729631b-f0f3-423c-8eff-5903dc2d0ca9) — O topo do menu traz o timestamp em texto cinza ("Yesterday, 2:37 PM") e logo abaixo as ações. Com isso a barra de ações fica limpa, sem hora visível.

**Padrão adotado no Prisma:**
- Coluna de leitura de ~720px. **Usuário:** bubble zinc-100 alinhado à direita, com no máximo ~75% da largura. Anexos do usuário ficam acima do bubble, como miniatura ou card (Claude). **IA:** sem bubble, prosa na largura toda, markdown completo (títulos, listas, tabelas, código, pills de fonte).
- **Raciocínio:** linha colapsada acima da resposta, "Pensou por 42s ›" (ChatGPT/Mistral). Durante o streaming ela vira "Pensando…" animado. Expandido, mostra o texto em zinc-500 com régua à esquerda.
- **Rodapé da resposta** (Mistral): à esquerda, o **modelo que respondeu** ("Claude Sonnet", essencial num produto multimodelo); à direita, copiar · 👍 · 👎 · regenerar · ⋯. Fica sempre visível na última resposta e aparece no hover nas anteriores.
- **⋯** (Gemini/ChatGPT): no cabeçalho, data/hora + créditos gastos; abaixo, "Regenerar com outro modelo ›", "Ramificar em novo chat", "Ver detalhes da resposta".
- **Scroll-to-bottom:** botão circular ↓ centralizado, 16px acima do composer, visível só fora do fim (Claude/ChatGPT).

#### 2.2 Streaming, eventos no fio e erros

- **ChatGPT — status de etapa + botão parar no lugar do enviar** · [link](https://mobbin.com/screens/4ec1caa0-3d3e-4997-9c5b-b78eea9d9687) — Enquanto gera, um rótulo de etapa ("Gathering requirements") aparece acima do conteúdo, e o botão de enviar vira ■ (parar) na mesma posição.
- **Sana AI — "Reasoning ›" animado + ■ + pill de modo ativo** · [link](https://mobbin.com/screens/b432987b-57ff-4acd-84e8-e65bef26d3c6) — Logo após o envio, só aparece um indicador "Reasoning ›" com ícone animado. O composer mostra ■ e o modo ativo como pill removível ("Image ×") abaixo do input.
- **Emergent — aviso inline de troca de modelo** · [link](https://mobbin.com/screens/683d48f6-329f-4332-be90-828ffb2276f3) — Faixa de aviso numa linha só: "Switched to Claude 4.8 Opus for superior reasoning and accuracy", com ícone e motivo. Explica a troca de modelo sem precisar de modal.
- **Emergent — evento "Credit Exhausted" como divisor no fio** · [link](https://mobbin.com/screens/821ee5aa-8dbc-4885-ac84-265a17a7cc9b) — O evento do sistema aparece centralizado, com título e timestamp, separado das mensagens. Em seguida vem uma explicação curta e os CTAs ("Buy Credits", "Preview"). Acima do composer, o status "Agent is waiting…".
- **Obvious — barra de erro presa ao composer + divisor de data** · [link](https://mobbin.com/screens/0f5a43f5-12a4-4bab-b79a-2c90f83a7ce8) — "⚠ Something went wrong. Try again." numa faixa logo acima do input, com botão "Retry" à direita. O divisor de dia ("Thursday") é uma linha fina com o rótulo centralizado. A hora aparece sob cada mensagem do usuário.

**Padrão adotado no Prisma:**
- **Streaming:** o botão de enviar vira ■ parar (mesma posição e tamanho). Acima da resposta, um status textual por etapa: "Pensando…", "Lendo planilha.xlsx…", "Gerando imagem…" (ChatGPT/Sana). Parar mantém o texto parcial e adiciona "Resposta interrompida" em zinc-500.
- **Eventos do sistema no fio** (Emergent): divisor centralizado em texto pequeno, com a hora. Ex.: "Modelo alterado para GPT-5 · 14:32", "Asimov Plus escolheu Claude Sonnet para esta resposta", "Skill 'Revisor ABNT' ativada". Os divisores de data "Hoje / Ontem / qui." seguem o mesmo componente (Obvious).
- **Limite de créditos:** evento no fio ("Limite semanal atingido · renova seg., 08:00") + CTA "Ver meu uso" e, se a política permitir, "Continuar com Asimov Basic" (Emergent). O composer fica desabilitado com o motivo visível.
- **Erro:** faixa colada ao topo do composer com mensagem curta + "Tentar novamente" (Obvious). A mensagem do usuário não se perde.

#### 2.3 Header da conversa

- **Mistral Le Chat — título ▾ com menu de gestão** · [link](https://mobbin.com/screens/f14a0caf-fa0b-4ca5-8f72-5b5448b953d4) — Clicar no título abre: Edit, "Move to project ›" (submenu com "+ Create" e a lista de projetos), Archive, Delete. À direita do header, só ★ e compartilhar.
- **Claude — header mínimo: título ▾ + Share** · [link](https://mobbin.com/screens/66d10150-9b13-4062-b96f-84e50ec10fc1) — Header sem borda: título com chevron à esquerda, um único botão "Share" à direita. Depois da resposta, o símbolo da marca marca o fim do turno.
- **Obvious — menu ⋯ do header com ações agrupadas** · [link](https://mobbin.com/screens/24657951-845e-42d9-8907-bbacf252c8ab) — Ações agrupadas por divisores (contexto/atividade · baixar/duplicar/renomear · arquivar · **Excluir em vermelho, isolado**). As etapas de ferramenta ficam colapsadas no fio ("Ran through 5 things ›"), e uma mensagem longa do usuário vem truncada com "Show more".

**Padrão adotado no Prisma:**
- Header de 52px sem borda (no scroll, ganha borda sutil). À esquerda: breadcrumb "Projeto /" quando houver + **título ▾**. O menu do título traz Renomear, Mover para projeto › (com "+ Novo projeto"), Fixar, Arquivar, Excluir (vermelho, separado) (Mistral/Obvious).
- À direita: ★ fixar + ⋯ (detalhes da conversa: modelo atual, skills ativas, créditos gastos). Sem "Compartilhar" na v1.
- Mensagens longas do usuário colapsam acima de ~12 linhas, com "Mostrar mais" (Obvious).

---

### 3. Composer

#### 3.1 Menu "+" (ferramentas)

- **Claude — "+" com grupos e submenus** · [link](https://mobbin.com/screens/be54eee2-7dce-401c-87f7-05decb33155c) — Popover compacto com ícone + rótulo, agrupado por divisores: anexar/screenshot/"Add to project ›" · connectors · Research / Web search (✓ e texto em azul quando ativo) / "Use style ›".
- **Claude — submenu "Use style" com seleção e rodapé de gestão** · [link](https://mobbin.com/screens/16cc5d91-2f00-4a92-9777-6dd57a63a6a4) — O submenu abre ao lado. Mostra a opção ativa com ✓ (Normal, Learning, Concise…) e, no rodapé, "+ Create & edit styles" leva à tela de gestão.
- **ChatGPT — "+" enxuto** · [link](https://mobbin.com/screens/18548847-534b-4263-9ffb-3f6cfdda7582) — "Add photos & files" fica separado por divisor dos modos (Create image, Thinking, Deep research, Shopping research). O resto vai para "More ›".
- **Sana AI — "+" com busca, seções com contador e toggles** · [link](https://mobbin.com/screens/de93d140-02df-4fff-bb9d-99e40aa722ed) — A busca fica no topo ("Search for any file or meeting"). A seção "Apps" tem contador "2 · Use all", itens com ✓ e "Search web" com toggle. As fontes ativas viram uma pill sob o composer ("Meetings, Webpages ×").
- **Perplexity — "+" com atalho de teclado e tooltip de política** · [link](https://mobbin.com/screens/c958df0d-640c-487b-a58c-2c96c8a3e93a) — "Upload files or images ⌘U" tem tooltip lateral ("Files attached… retained for 7 days"). Connectors e Spaces ficam em submenus. Os modos aparecem como pills na toolbar ("Search ▾", "Computer").

**Padrão adotado no Prisma:**
- Popover de ~260px ancorado no "+", com itens de ícone 16px + rótulo, em grupos: **[Anexar arquivos ou fotos ⌘U]** — **[Prompts salvos ›] [Agente ›] [Skills ›] [Projeto ›]** — **[Criar imagem]** (toggle com ✓) (Claude/ChatGPT).
- Submenus abrem ao lado, com busca no topo quando a lista passa de ~6 itens (Sana) e rodapé de gestão: "Explorar na Galeria", "Gerenciar skills" (Claude).
- **Skills ›:** toggle por item + contador "2 de 5" no cabeçalho (Sana). Com 5 ativas, as demais ficam desabilitadas com tooltip "Máximo de 5 skills por conversa".
- Atalhos visíveis à direita do item e tooltip com regras de anexo (formatos e tamanho) (Perplexity).

#### 3.2 Seletor de modelo

- **Claude — dropdown com descrição de 1 linha + toggle de raciocínio** · [link](https://mobbin.com/screens/a584de73-9ae1-4c5c-851d-73c1131e0a21) — Cada modelo tem nome e uma linha de "para quê" ("Most capable for ambitious work", "Fastest for quick answers"), com ✓ no selecionado. Depois do divisor, "Extended thinking" com toggle e, por último, "More models ›".
- **Notion AI — "Auto" no topo + grupo "Chat directly with models"** · [link](https://mobbin.com/screens/58188761-2d93-43a2-be51-df5fee96707a) — "Auto ✓" vem primeiro, seguido dos modelos com logo do provedor e badge "Beta". Um cabeçalho de seção separa a escolha direta de modelo. É o mesmo modelo mental do Asimov Basic/Plus contra os modelos diretos.
- **Gumloop — busca + atalhos por intenção + provedores em submenu + card de detalhes** · [link](https://mobbin.com/screens/a3f8b130-cfc5-4ddc-8fd9-b95a4a6927bf) — O dropdown tem busca no topo e atalhos por intenção ("Recommended / Smartest / Fastest", com o modelo e uma justificativa). Os provedores ficam em submenus. No hover, um card lateral mostra velocidade, inteligência, provedor, contexto, Tool Calling e Vision.
- **Grok — modos com Auto + itens bloqueados + upsell no rodapé** · [link](https://mobbin.com/screens/5df7b658-498f-4145-b78d-0fe9d6460441) — "Auto (Chooses Fast or Expert) ✓", Fast, Expert. "Heavy" e a versão beta aparecem esmaecidos (fora do plano) e o rodapé tem o upsell com botão.
- **Chatbase — lista com busca + popover de custo em créditos** · [link](https://mobbin.com/screens/684403d5-e539-49c5-b554-e28d382734cc) — No hover do modelo, um card lateral mostra "OpenAI / GPT-5", **"Credits cost: 1"** e a descrição. O custo aparece antes da escolha.

**Padrão adotado no Prisma:**
- Gatilho no composer: nome curto do modelo + ▾ ("Asimov Plus ▾"). O modo raciocínio aparece como sufixo cinza (Claude).
- Dropdown de ~320px, com estes grupos:
  1. **Automático:** Asimov Basic / Asimov Plus, cada um com uma linha ("Escolhe o melhor modelo para cada pergunta") (Notion/Grok).
  2. **Converse direto com um modelo:** agrupado por provedor com logo (GPT, Claude, Gemini, DeepSeek). Cada item traz nome + uma linha de uso (Claude) + **badge de custo relativo** ("1×", "3×") (Chatbase).
- Busca no topo só quando houver mais de 8 modelos (Gumloop). Modelos fora do plano ou desativados pelo admin ficam esmaecidos com o motivo no tooltip (Grok).
- Toggle "Raciocínio estendido" dentro do dropdown, só para modelos compatíveis (Claude). Card lateral de detalhes no hover, só no desktop: contexto, visão, custo (Gumloop/Chatbase).
- Em modo imagem, a lista mostra só os modelos de imagem.

#### 3.3 Pills de contexto, anexos e modo imagem

- **ChatGPT — fila de anexos no composer** · [link](https://mobbin.com/screens/44b29d9d-a4dc-4a4b-aee3-520332c67284) — Na linha horizontal acima do input, imagens viram miniaturas quadradas com × e documentos viram cards (ícone colorido por tipo, nome, "PDF"/"File", ×).
- **Gemini — ferramenta ativa como chip + atalhos sob o composer** · [link](https://mobbin.com/screens/057d8ba8-d787-4612-b7ce-ea3595a984ed) — "Deep research" aparece como chip removível na toolbar, junto do "+". Embaixo, dois botões grudados ao composer ("Sources", "Files"). Um ícone de expandir no canto abre o composer em tela cheia.
- **v0 — pill de contexto removível + seletor de projeto** · [link](https://mobbin.com/screens/f5d76ed6-98ce-403c-bcab-65c93c3070d8) — Uma pill "material-3 ×" separada por divisor do modelo ("v0 Pro ▾"), com "Project ▾" à direita. O contexto anexado fica sempre à vista e pode ser removido num clique.
- **ChatGPT — modo imagem com pill + galeria de estilos** · [link](https://mobbin.com/screens/3d313ec0-2fe2-4c46-9a61-0f7e9122d61d) — A pill "Image" fica ativa no composer. Abaixo, um tile "Edit an image" (upload) e um carrossel horizontal de estilos com miniatura e rótulo (Caricature, Gold, Crayon…), com setas.
- **ChatGPT — resultado de imagem no fio** · [link](https://mobbin.com/screens/c3fcaa72-dc5c-42e8-8ed0-e28c487ab6ab) — Um rótulo "Image created • Iced matcha latte with oat milk" vem acima da imagem de cantos arredondados. As ações (copiar, compartilhar, ⋯) ficam abaixo.

**Padrão adotado no Prisma:**
- **Anexos:** fila horizontal acima do texto, dentro do card do composer. Imagem = miniatura de 56px com ×. Documento = card com ícone do tipo, nome truncado, tipo e × (ChatGPT). Rolagem horizontal quando passa da largura.
- **Pills de contexto** na toolbar, na ordem fixa **Agente → Projeto → Skills**, cada uma com ícone + nome + × (v0/Gemini). Com mais de 2 skills, agregam em "3 skills ▾", que abre a lista com os toggles. Agente ativo troca o placeholder ("Pergunte ao Tutor de Python…").
- **Modo imagem:** pill "Imagem ×" com acento cyan e placeholder "Descreva a imagem que você quer criar". O modelo troca para os modelos de imagem. Abaixo do composer: tile "Editar uma imagem" + carrossel de estilos (ChatGPT). Sair do modo = × na pill.
- **Resultado:** rótulo "Imagem criada · {resumo do prompt}" + imagem de até ~420px + ações baixar · copiar · regenerar · ⋯ (ChatGPT).

---

### 4. Login com SSO ("continuar com sua conta Asimov")

- **Plain — card com "Continue with SSO" como ação primária** · [link](https://mobbin.com/screens/b9ff7441-defd-4155-a73e-ec088c14eff3) — Logo e "Welcome back to Plain" ficam **fora** do card. Dentro dele vai um único botão primário escuro em largura total, e o rodapé da página traz Terms/Privacy. Mostra o mínimo necessário para um login SSO.
- **Claude — headline em serifa + card de ações + painel de produto** · [link](https://mobbin.com/screens/feff4766-fde6-4ba3-9e2c-9821e5c17bc4) — Split em duas colunas: à esquerda, headline grande em serifa + subtítulo + card ("Continue with Google" / "Continue with email") + texto de consentimento. À direita, um painel ilustrando o produto.
- **Quicken — conta-mãe que dá acesso a vários produtos** · [link](https://mobbin.com/screens/b4b9be03-2066-4e4b-8ec4-4fd46d33b000) — O texto explica o porquê da conta ("Sign in to your Quicken account to access all Quicken products, including Simplifi"), e o consentimento fica logo sob o botão. É o mesmo caso do login Asimov compartilhado com a plataforma de cursos.
- **Perplexity — tela centrada, headline em serifa, consentimento antes dos botões** · [link](https://mobbin.com/screens/94116bee-b475-4b0f-818c-e2739984d6ef) — Headline de 2 linhas em serifa, "By continuing, you agree…" acima dos botões empilhados, e "Single sign-on (SSO)" como link discreto.
- **WorkOS — fluxo de teste de SSO com tela intermediária do provedor** · [link](https://mobbin.com/flows/dba285e0-22b1-4ce6-94af-cc62e59e5980) — Entre o clique e a volta ao app aparece uma tela neutra do provedor de identidade: marca pequena, título e um card "Signing in test user / sam@example.com". O redirecionamento ganha feedback visível.

**Padrão adotado no Prisma:**
- Página centrada, sem nav. Desktop ≥1024px: split opcional com painel à direita mostrando o produto (Claude). Mobile: coluna única, sem painel.
- Bloco principal: símbolo do Prisma → headline em **Instrument Serif** (2 linhas no máximo) → subtítulo de 1 linha → **um único botão primário** largo "Continuar com sua conta Asimov" (Plain) → linha de apoio "Use o mesmo login da plataforma de cursos da Asimov" (Quicken) → consentimento em texto pequeno (Perplexity/Claude). Rodapé da página: Termos · Privacidade.
- **Estados:** ao clicar, o botão mostra spinner + "Redirecionando…" e fica desabilitado. Na volta, uma tela intermediária "Entrando como lucas@…" antes da home (WorkOS). A espera em card com texto de ajuda segue o mesmo padrão ([Claude — aguardando verificação](https://mobbin.com/screens/648ed1c9-4c58-496b-92e1-999873985450)). Nenhuma das refs mostrou erro de acesso; o Prisma precisa de "Sua conta não tem acesso ao Prisma" e "Sessão expirada, entre novamente", no mesmo card, com link de suporte.

---

### 5. Sidebar e busca global (⌘K)

#### 5.1 Sidebar de navegação

- **Langdock — navegação por recurso + projetos + progresso de onboarding** · [link](https://mobbin.com/screens/b66870ae-8d47-493d-b1b6-e6c01173ad96) — Topo: New chat, Search chats, Inbox. Depois, os recursos (Library, Agents, Skills, Workflows, Prompts, Integrations), a seção "Projects" com "+ New project" e, no rodapé, o card "Get started 12% done" com barra.
- **Gumloop — medidor de créditos no rodapé da sidebar** · [link](https://mobbin.com/screens/65cb1580-111a-4390-94f8-646b8d7d84b6) — "Credits Remaining · 13.2k of 20.0k", com barra de progresso e botão "Add More Credits", fica fixo acima da linha da conta. A home também lista "Recent Chats" com "yesterday" à direita.
- **Klaviyo — popover de uso: % gasto + "How credits work"** · [link](https://mobbin.com/screens/16a19718-2429-4873-b583-0d473e84ce94) — O item "Usage" da sidebar abre um popover com o período, a barra "5% of credits used · 493 of 10,000 credits" e uma tabela de custo por tipo de ação (Free, 4–25 credits…).
- **ChatGPT — menu da conta a partir do rodapé** · [link](https://mobbin.com/screens/7eb619eb-3da0-47f8-a7a5-6061b1d6becb) — O popover abre para cima a partir de avatar + nome + plano: cabeçalho com nome/handle, Upgrade plan, Personalization, Settings, divisor, "Help ›", Log out.
- **X (Grok) — histórico agrupado por data com busca e ações por item** · [link](https://mobbin.com/screens/26328eef-4a26-42e5-9513-b57cb1a091ec) — Busca no topo e grupos "Today / Yesterday / Wednesday". Cada item tem 🔖 e ⋯, e as abas filtram por tipo (Chats / Bookmarks / Images).

**Padrão adotado no Prisma:**
- Sidebar de 260px, recolhível para um trilho de ícones (como o trilho do Gemini na home). **Topo:** logo + botão recolher. **Ações primárias:** "Novo chat" (⌘⇧O) e "Buscar" (⌘K, atalho visível no hover).
- **Navegação:** Projetos · Agentes · Skills · Galeria (Langdock). **Seções:** "Fixados" (chats e agentes), "Projetos" (expansível, com os chats aninhados) e **Recentes** agrupados em Hoje / Ontem / 7 dias / 30 dias (X/Notion), com tempo relativo à direita no hover.
- Item com ⋯ no hover: Renomear, Fixar, Mover para projeto ›, Excluir (vermelho, separado). Um ponto indica resposta não lida que terminou em segundo plano (ChatGPT).
- **Rodapé:** card de créditos com duas barras finas, "Semana · 62%" e "Hoje · 30%", e o texto "renova seg., 08:00" (Gumloop). Clicar abre um popover de uso com custo por modelo/ação e link para "Meu uso" (Klaviyo).
- Abaixo do card, a linha da conta: avatar + nome + plano. Clicar abre o popover (ChatGPT) com nome e e-mail, Configurações, Ajuda ›, **Admin** (só para admins), Sair.
- **Estado de limite:** a barra fica cheia em cor de alerta e a mensagem diz quando renova ([Elicit — limite atingido](https://mobbin.com/screens/3a0f60e0-0ed9-46b0-bd0e-5b1b5e13e690)).

#### 5.2 Busca global / command palette (⌘K)

- **ChatGPT — busca de chats com destaque do termo** · [link](https://mobbin.com/screens/169c1c0e-8ed0-486e-ac7b-ba18036558d8) — Modal centrado: input com × no topo e resultados com ícone de chat, título com o termo em **negrito** e snippet da conversa com o termo. A data aparece à direita do item em foco.
- **Claude — busca unificada de chats e projetos** · [link](https://mobbin.com/screens/34fc112f-9de9-44ed-9f79-0808c005fca0) — "Search chats and projects", com ícone distinto por tipo (pasta vs. balão). À direita, metadados (↵ no item ativo, dono, "Yesterday"). Na sidebar, o item "Search" mostra "⌘K".
- **Gumloop — palette com ações de criação + entidades** · [link](https://mobbin.com/screens/e9e0911a-09a4-4c72-bb98-6ac9357fa590) — "Type a command or search… ⌘K". No topo vêm as ações: New Chat (Open ↵), Create Agent…, "Create Skill… Use AI to create a new skill". Depois, grupos "Agents" e "Teams". É praticamente o conjunto de entidades do Prisma.
- **Devin — ações, navegação e atalhos + rodapé de teclado** · [link](https://mobbin.com/screens/274435b9-f420-4a7c-ab68-82514c1419f9) — Grupos Actions / Navigation / Settings, com o atalho à direita ("⌘ shift O"). O rodapé mostra "↑↓ Navigate · esc Close · ↵ Select".
- **Whop — filtros por tipo em abas + contagem de resultados** · [link](https://mobbin.com/screens/021acfd1-2648-4390-973d-6f9fea2aa9fe) — Abas All / People / Chats / DMs logo abaixo do input. O rodapé traz "4 results found" e as dicas de teclado.

**Padrão adotado no Prisma:**
- Modal de ~600px no terço superior da tela, com overlay leve. Input: "Buscar chats, projetos, agentes ou digitar um comando…".
- **Sem consulta:** "Ações" (Novo chat ↵, Novo projeto, Criar agente, Criar skill, Gerar imagem) + "Recentes" (Gumloop/Devin), com os atalhos à direita.
- **Com consulta:** resultados agrupados por tipo (Chats · Projetos · Agentes · Skills), cada um com seu ícone. Termo em negrito no título e no snippet. Meta à direita: data relativa ou ↵ no item ativo (ChatGPT/Claude). Abas de tipo opcionais (Whop).
- Rodapé fixo: "↑↓ navegar · ↵ abrir · esc fechar" (Devin/Whop).
- **Sem resultados:** "Nenhum resultado para 'x'" + ação "Perguntar ao Prisma: 'x'", que abre um novo chat com o termo ([Klaviyo — busca com "New chat"](https://mobbin.com/screens/be790ff7-482b-4ab8-8a3c-f47e2b7321f3)).

---

## Parte B · Organizar e criar
Escopo: Projetos, Skills, Agentes, Galeria, Configurações/Perfil e empty states.
Plataforma: web. O que vale aqui é estrutura (hierarquia, layout, affordances, estados). Cores e marca das referências foram ignoradas: o produto final usa o Asimov Design System em tema claro.
Todas as descrições vêm do que aparece nas telas, não dos metadados.

---

### 1. Lista de Projetos

- **Claude — Projetos em grid com busca e ordenação** · [link](https://mobbin.com/screens/dead4fcc-8a71-4718-b231-40bd8477d088) — Título "Projects" com "+ New project" à direita, busca de largura total, "Sort by: Activity" alinhado à direita e cards em 2 colunas (título, descrição de 3 linhas, "Updated 1 day ago"). Um projeto-exemplo leva o badge "Example project" e funciona como tutorial.
- **Hex — Projetos em linhas (tabela)** · [link](https://mobbin.com/screens/dcc0cd26-0ff5-41cf-a01a-fdcfe8b3ded6) — Colunas Title (com estrela de favorito inline), Status, Owner e "Last viewed by you" ordenável. Tem toggle lista/grid no canto e uma barra flutuante de ação em massa ("3 items selected", Archive, Trash).
- **ChatGPT — Fluxo "Create project"** · [link](https://mobbin.com/flows/8c981757-e9a1-42d5-bd4c-065f50a1c3c7) — Modal curto: nome, seletor de ícone + cor em popover (paleta de cores + grade de ícones), chips sugeridos ("Writing", "Travel") e botão "Create project" desabilitado até o nome ser preenchido. Ao criar, abre direto o detalhe do projeto.
- **ChatGPT — Modal "Project name" com explicação** · [link](https://mobbin.com/flows/48f02d90-8549-4704-9b72-f707cfe24960) — Só um campo, mais um bloco "What's a project?" explicando o conceito ("keep chats, files, and custom instructions in one place"). Botões Cancel / Create project.

**Padrão adotado no Prisma:**
- **Header:** título "Projetos" + subtítulo de 1 linha ("Agrupe conversas com um contexto e arquivos em comum"), com botão primário "Novo projeto" à direita.
- **Toolbar:** busca que filtra enquanto digita; dropdown "Ordenar" (Atividade recente como padrão, Nome A–Z, Mais antigos); toggle Cards/Lista lembrado em `localStorage` (Claude + Hex).
- **Card (padrão):** ícone/cor do projeto, nome, trecho do contexto (2–3 linhas com reticências) e rodapé "N conversas · N arquivos · Atualizado há X". O card inteiro é clicável e tem kebab no hover (Renomear, Excluir).
- **Lista:** linhas com nome, nº de conversas, nº de arquivos e "Atualizado". O header da coluna ordena ao clicar (Hex). Ação em massa fica fora do MVP.
- **Criação:** modal leve só com nome (obrigatório) + ícone/cor opcional + bloco "O que é um projeto?". O botão fica desabilitado sem nome. Depois de criar, o usuário vai direto para o detalhe, onde adiciona contexto e arquivos (ChatGPT).
- **Projeto-exemplo** "Como usar o Prisma" com badge "Exemplo", que ensina o recurso por dentro (Claude).
- **Estados:** carregamento com skeleton de cards no mesmo grid. Vazio e busca sem resultado estão na §7.

---

### 2. Detalhe do Projeto

- **Claude — Detalhe com instruções e arquivos à direita** · [link](https://mobbin.com/screens/7d26fef6-61bd-41bd-a559-e8fe7d5bd049) — "← All projects", título com kebab e estrela, composer no topo e lista de conversas logo abaixo ("Last message 4 seconds ago"). Na coluna direita ficam o card "Instructions" (lápis + preview do texto) e o card "Files" (+ e uma dropzone vazia ilustrada: "Add PDFs, documents, or other text to reference in this project").
- **Claude — Modal "Set project instructions"** · [link](https://mobbin.com/screens/8019b0e4-e247-49cc-bae7-6394d5bdaa76) — Explica que as instruções funcionam junto com as preferências do usuário (com link), usa um placeholder de exemplo concreto e deixa "Save instructions" desabilitado enquanto o campo está vazio.
- **ChatGPT — Projeto recém-criado + upload** · [link](https://mobbin.com/flows/48f02d90-8549-4704-9b72-f707cfe24960) / [upload](https://mobbin.com/flows/4a2cf78a-9dfc-43a7-8943-f79c6b9e663f) — Ícone grande + título, composer "New chat in this project" e dois cards de ação ("Add files — Chats in this project can access file content" / "Add instructions — Tailor the way ChatGPT responds"). O vazio diz "Start a new chat, or drag an old one in". Depois do upload, o card vira "Project files · 1 file" com miniatura, e um modal "Project files" lista os arquivos com "Add files".
- **ChatGPT — Abas Chats / Sources** · [link](https://mobbin.com/flows/8c981757-e9a1-42d5-bd4c-065f50a1c3c7) — Abas "Chats | Sources". Em Sources, cada linha tem ícone do tipo, nome e "PDF · Mar 1, 2026"; no topo, "Add sources" e filtros "Newest / All". Sources vazio mostra "Give ChatGPT more context" + "Add". Chats vazio mostra "No chats yet — Ask anything about <projeto>".
- **Langdock — Cards de configuração no topo do projeto** · [link](https://mobbin.com/screens/bb78eee2-6f0e-48eb-a7e0-9d5ec4855b5a) — Três cards (Instructions / Attached files / Skills) com "Click to add…". A edição abre em popover inline com botão "Optimize" (IA melhora o texto), microfone e expandir. O composer fica ancorado embaixo ("Start a new chat in ASMobbin Design…").

**Padrão adotado no Prisma:**
- **Layout desktop:** 2 colunas. À esquerda, header + composer + lista de conversas; à direita, coluna de ~320px com os cards "Contexto do projeto" e "Arquivos (n/20)" (Claude). No mobile, a coluna lateral vira abas "Conversas | Contexto | Arquivos" (ChatGPT).
- **Header:** "← Projetos", nome do projeto e kebab (Renomear, Excluir projeto, com confirmação).
- **Composer no topo:** placeholder "Nova conversa em <Projeto>…". Enviar cria a conversa já vinculada ao projeto.
- **Lista de conversas:** título + trecho da última mensagem + data relativa, com kebab (Renomear, Remover do projeto, Excluir).
- **Card Contexto:** preview de ~4 linhas + "Editar". A edição abre em modal grande com:
  - subtítulo "Vale para todas as conversas deste projeto, junto com o 'Sobre você' do seu perfil";
  - placeholder com exemplo real;
  - contador de caracteres;
  - "Salvar" desabilitado enquanto nada mudou (Claude).
- **Card Arquivos:**
  - contador "3/20" e dropzone com arrastar-e-soltar + "Adicionar arquivos";
  - cada linha mostra ícone do tipo, nome, "tipo · data" e um "x" de remover no hover;
  - estados por arquivo: enviando (barra de progresso), pronto, erro ("Falha ao processar · Tentar de novo");
  - com 20 arquivos, a dropzone fica desabilitada com "Limite de 20 arquivos atingido".
- **Projeto novo:** no lugar dos cards preenchidos aparecem cards de ação ("Adicionar contexto", "Adicionar arquivos"), e a lista vazia diz "Comece uma conversa acima" (ChatGPT).

---

### 3. Skills

#### 3a. Lista de Skills

- **Langdock — Skills com abas e pacotes por categoria** · [link](https://mobbin.com/screens/59e7a5b2-1ee1-48cb-992e-316a8a79ae1d) — Abas All / Installed / Skill packs, busca à direita e "+ Add Skill" com dropdown. Cards com toggle on/off, descrição de 2 linhas, autor "By Langdock ✓" e contador de uso. A seção "Skill packs" agrupa por categoria ("Data · 6 skills").
- **Perplexity — Skills com filtros rápidos e dois modos de criação** · [link](https://mobbin.com/screens/5819cd2f-997b-4d6f-aa36-1bac8b0c491b) — Subtítulo "Extend what Computer can do with reusable capabilities. Learn more", chips All / My skills / Example skills e dropdown "Create skill" com duas opções: "Create with Computer — Create skills by chatting" e "Upload a skill". Cards em 2 colunas com nome, descrição e kebab.
- **Gumloop — Skills em tabela** · [link](https://mobbin.com/screens/7f42ef20-2eb4-417d-948a-a0dc377c0706) — Segmented Mine / Shared with me / Organization + busca + filtro + "Create Skill". Colunas: nome + descrição, atividade (sparkline 14d), uso, "Last Edited", kebab. Tem paginação "Showing 1-3 of 3".
- **Claude — Lista + detalhe em painéis** · [link](https://mobbin.com/screens/e8a8536b-42e6-4cda-811e-ab9bd1566783) — Lista de skills à esquerda (busca e "+") e detalhe à direita com "Added by", "Trigger", "Description" e o conteúdo markdown renderizado, com toggle de visualização/código (olho e `</>`). Toast "Created summarize" confirma a criação.
- **LangChain Fleet — Skills com biblioteca separada** · [link](https://mobbin.com/screens/b92a4519-ae3d-487c-ae3a-511eb21e0e0c) — "Browse Library" (secundário) ao lado de "Create Skill" (primário), filtro "All Skills" e toggle grid/lista. Card mínimo com ícone, nome e dono "You". Toast "Skill 'uiux' created".

**Padrão adotado no Prisma:**
- **Header:** "Skills" + subtítulo "Instruções que você liga numa conversa (até 5 por vez)". Primário "Nova skill"; secundário "Explorar na galeria" (LangChain).
- **Toolbar:** busca, chips de categoria ("Todas" + categorias) e "Ordenar" (Recentes, Nome A–Z), seguindo a anatomia de Projetos.
- **Card:**
  - ícone da categoria, nome, descrição de 2 linhas e chip de categoria;
  - badge "Na galeria" quando publicada, e origem "Copiada de <autor>" quando veio da galeria;
  - kebab com Editar, Duplicar, Excluir.
- **Sem toggle on/off na lista** (diferente do Langdock), porque a ativação é por conversa. A lista é só biblioteca.
- **Clique no card:** abre o detalhe/edição. A visualização das instruções usa markdown renderizado com alternância "Visualizar | Markdown" (Claude).
- **Feedback:** toast "Skill criada" com a ação "Usar numa conversa".

#### 3b. Editor de Skill

- **Langdock — "Write skill instructions" com contadores e IA** · [link](https://mobbin.com/screens/95f05f24-22ed-4c3b-b4d7-559a96adb988) — Ícone selecionável, nome com contador "19/64" e descrição "942/1024" com a dica "The AI decides whether to use this skill based on the description — make it specific and clear." Os textareas têm "Optimize", "Undo" e expandir; as instruções têm contador "667/50000".
- **LangChain — Editor com abas Preview / Source** · [link](https://mobbin.com/screens/71eb3b49-4e4b-4fd6-8301-75d490addd5c) — Nome, "Brief description…" e área de instruções com numeração de linhas e toggle "Preview | Source" para ver o markdown renderizado. Botão "Create" de largura total.
- **Klaviyo — Editor em página inteira, estilo documento** · [link](https://mobbin.com/screens/96b6f857-4b5b-4d3e-b246-f3441d63a8cf) — Breadcrumb "Skills / New skill", ações "Save as draft / Set live / Preview" e título grande "Enter skill name" com dica. As seções "When to use this skill" e "How to respond" trazem uma frase explicando o que escrever em cada uma.
- **Cofounder — Helpers explicando cada campo** · [link](https://mobbin.com/screens/83023026-3120-4b57-bf08-9e542c2ab958) — Um helper sob cada campo ("Tells the agent when to activate this skill"), instruções em textarea monoespaçada já com estrutura (parágrafos + bullets) e "Create Skill / Cancel" no rodapé do card.
- **MagicPath — Placeholders-exemplo e limites visíveis** · [link](https://mobbin.com/screens/4e5ccd96-e6e2-4672-bd0c-5e88bc7408a4) — Placeholders com exemplos reais ("weekly-status-report", "Summarize my recent work in three sections…"), contadores "0 / 20,000" e "0 / 200,000" e "Create" desabilitado até preencher.

**Padrão adotado no Prisma:**
- **Página inteira, não modal** (Klaviyo): instruções são longas e o público não programa, então precisa de espaço e dicas por perto.
- **Coluna esquerda (formulário):**
  - Nome (contador);
  - Categoria (select);
  - Descrição (1 frase, com a dica "Diga quando esta skill deve ser usada");
  - Instruções em markdown com abas "Escrever | Visualizar" (LangChain), contador e botão de expandir em tela cheia.
- **Coluna direita (dicas, sticky):** "Como escrever boas instruções" em checklist (papel, passo a passo, formato da resposta, o que evitar) e um botão "Inserir modelo". O modelo preenche o editor com as seções `## Quando usar` e `## Como responder` (Klaviyo).
- **Microcopy:** placeholders com exemplo concreto e um helper por campo (MagicPath, Cofounder).
- **Rodapé sticky:** "Cancelar" / "Salvar skill". Salvar fica desabilitado até ter nome + instruções.
- **Estados:**
  - erro inline por campo;
  - contador fica em cor de alerta perto do limite;
  - aviso "Você tem alterações não salvas" ao sair;
  - toast de sucesso.
- **Opcional (fase 2):** "Melhorar com IA" com "Desfazer" dentro do campo (Langdock).

---

### 4. Agentes

#### 4a. Lista de Agentes

- **Mistral — Meus agentes + vitrine oficial na mesma página** · [link](https://mobbin.com/screens/91a956f3-2594-47fe-af83-5b4d4238dec1) — Título "My Agents" com abas All / Mine / Shared, subtítulo e "Create an Agent". Abaixo vem a seção "Browse Agents" com agentes oficiais "By Mistral". Card com capa/avatar, nome, descrição e "By me".
- **Gumloop — Cards ricos com filtros em popover** · [link](https://mobbin.com/screens/5c4079a4-106e-4fab-a696-0097eccdbc5e) — Card com avatar grande, nome, descrição, ícones das ferramentas conectadas, "Alex · 9 hours ago" e kebab. A toolbar tem Mine / Shared with me, busca, popover de filtros (Creator, Tool, Workflow, toggle "Has Trigger"), toggle grid/lista, "Folder" e "Create Agent".
- **Langdock — Header com atalho para templates** · [link](https://mobbin.com/screens/43a7f175-9cb3-4434-bd95-6bb73022db08) — Subtítulo "Specialized chatbots you can configure for specific use cases or documents", "Browse templates" (secundário) + "Create agent" (primário) e um banner "Looking for inspiration?" que leva à biblioteca. A seção "All agents" tem sort "Most popular".
- **SchoolAI — Botão "Chat" direto no card (edtech)** · [link](https://mobbin.com/screens/e54daeb5-9ea0-4acd-8092-b4eda3f1ab7c) — Grid de 3 colunas com ícone, nome e descrição de 1 linha. Cada card tem um botão "Chat", então dá para usar o assistente sem abrir o detalhe.
- **LangChain Fleet — Três caminhos para criar** · [link](https://mobbin.com/screens/765f1a2a-350b-40d0-8f1a-7d88f088a570) — Bloco "Get started" na sidebar com "Create agent with AI", "Start from a template" e "Create agent manually". Os templates aparecem em cards com ícone, nome, descrição e "by LangChain ✓".

**Padrão adotado no Prisma:**
- **Header:** "Agentes" + subtítulo explicando o que é um agente. Primário "Criar agente"; secundário "Ver exemplos oficiais" (Langdock).
- **Toolbar:** busca + chips de categoria + "Ordenar" (Recentes, Nome). O toggle grid/lista é opcional (Gumloop).
- **Card:**
  - avatar (imagem ou iniciais), nome, descrição de 2 linhas e chips de categoria;
  - rodapé com modelo + badge "Publicado" quando está na galeria;
  - botão "Conversar" no próprio card (SchoolAI) e kebab (Editar, Duplicar, Excluir).
- **Criar:** abre a escolha "Começar do zero" ou "Usar um exemplo oficial" (LangChain). O exemplo abre o builder já preenchido.
- **Vitrine oficial:** com poucos agentes (≤3), aparece abaixo a seção "Exemplos da Asimov" com 3–4 agentes oficiais (Mistral).

#### 4b. Builder de Agente com teste ao vivo

- **ChatGPT — Configurar GPT (form + Preview)** · [link](https://mobbin.com/flows/b25aff28-7e8c-4030-aa06-3aaf8635ee77) — Tela dividida. À esquerda, aba "Configure" com Instructions (expandir), "Conversation starters" como lista de inputs com "x" e uma linha vazia no fim, Knowledge (helper + "Upload files" + miniaturas) e Capabilities em checkbox. À direita, "Preview" mostra avatar, nome, descrição e os starters em cards, com composer funcional. A top bar tem "Draft" e o botão "Create".
- **ChatGPT — Criar GPT conversando** · [link](https://mobbin.com/flows/6e8f0823-7698-4850-bb22-9100eff40163) — A aba "Create" é um assistente conversacional ("Hi! I'll help you build a new GPT. You can say something like…") que sugere nome e preenche os campos. No estado inicial "New GPT", o "Create" fica desabilitado e o Preview vazio. Em Configure, o helper avisa que "Conversations with your GPT can potentially include part or all of the instructions provided".
- **Google Gemini — Editor de Gem** · [link](https://mobbin.com/screens/a5e09d2f-4f9a-458b-8b95-9a1034625b36) — Header com status "Gem not saved" + "Save". O form tem Name, Description, Instructions (com undo/redo e varinha de reescrita dentro do campo), "Default tool" em dropdown e Knowledge "Add files for your Gem to reference". O Preview à direita usa a inicial do nome como avatar placeholder.
- **Langdock — Novo agente com placeholders que ensinam** · [novo](https://mobbin.com/screens/c93daa93-b2f1-4b8f-95aa-c2d74ff15e47) / [edição](https://mobbin.com/screens/4aec5428-eb61-4fd8-aa77-4aed2863e920) — Avatar no topo, Name ("Name your agent"), Description ("displayed in the chat") e Instructions com placeholder em perguntas ("What does this agent do? How should it behave? What should it avoid doing?") + "Optimize". Na edição aparecem "Files (2)" com erro inline por arquivo ("Refresh failed…"), Actions removíveis e seletor de Model. O Preview fica à direita; breadcrumb, "Share" e "Use agent" no topo.
- **PlayAI — Identidade e privacidade em cards** · [link](https://mobbin.com/screens/6bed95da-6a62-445c-8330-e31644351bb0) — Avatares pré-gerados para escolher + "Upload Image". Privacidade em radio cards (Public "Anyone can talk to and clone this agent" / Unlisted / Private), cada um descrevendo a consequência. O painel "Agent preview" fica fixo à direita.

**Padrão adotado no Prisma:**
- **Página full-width** em `/agentes/novo` e `/agentes/:id/editar`.
- **Top bar:**
  - "← Agentes" e avatar + nome do agente;
  - status de salvamento ("Rascunho" / "Alterações não salvas" / "Salvo"), como no Gemini;
  - "Salvar" (primário, desabilitado sem mudanças) e kebab (Duplicar, Excluir).
- **Coluna esquerda (~55%), formulário rolável em seções:**
  1. **Identidade:** avatar (iniciais geradas por padrão + upload), nome, descrição.
  2. **Comportamento:** instruções (expandir, placeholder em perguntas como no Langdock), modelo (select) e estilo de resposta em segmented "Preciso | Equilibrado | Criativo", com 1 linha explicando a opção ativa.
  3. **Conhecimento:** até 5 arquivos, com contador "2/5" e estados por arquivo.
  4. **Skills:** multi-select com busca, até 5, mostradas como chips removíveis.
  5. **Início da conversa:** primeira mensagem + até 4 perguntas sugeridas como lista de inputs com "x" e "+ Adicionar pergunta" (ChatGPT). O "+" some ao chegar em 4.
  6. **Categorias:** chips multi-seleção.
  7. **Publicação:** toggle "Publicar na galeria" com o aviso "Outros alunos verão o nome, a descrição e as instruções deste agente" (ChatGPT, PlayAI).
- **Coluna direita (~45%), painel "Testar" sticky:**
  - antes da primeira mensagem, mostra avatar, nome, descrição, primeira mensagem e as perguntas sugeridas em cards clicáveis (ChatGPT);
  - o composer funciona e o botão "Reiniciar conversa" fica no header do painel;
  - nota "Testando a versão atual (ainda não salva)";
  - o painel acompanha as mudanças do formulário em tempo real.
- **Começar de exemplo:** o builder abre pré-preenchido, com banner "Baseado em <exemplo oficial>" e opção "Limpar tudo".
- **Mobile:** abas "Editar | Testar".
- **Estados:**
  - "Salvar" desabilitado sem mudança;
  - confirmação ao sair com alterações;
  - erro inline por arquivo;
  - limites atingidos (5 arquivos, 5 skills, 4 perguntas) desabilitam o "adicionar" com tooltip explicando.
- **Fase 2:** "Criar conversando" (ChatGPT Create).

---

### 5. Galeria

#### 5a. Explorar

- **ChatGPT — Loja de GPTs** · [link](https://mobbin.com/flows/9a28009a-6664-4c0f-90ba-d1b4f1007158) — Hero com título, subtítulo e busca grande, seguido de abas de categoria (Top Picks, Writing, Productivity, Research & Analysis, Education…). A seção "Featured — Curated top picks" vem em 2×2 e "Trending" em ranking numerado. Na busca, um dropdown mostra resultados com avatar, nome, descrição e "By … · 6M+".
- **Langdock — Templates com chips contados** · [link](https://mobbin.com/screens/4a6e485e-bb13-4a43-b128-e09f29f670ab) — Busca de largura total, chips de categoria com contagem ("Productivity 9", "Marketing 4"…) e dropdown de idioma à direita. Grid de 4 colunas com capa, ícone, nome, descrição de 2 linhas e "By Langdock".
- **Relevance AI — Barra de filtros com chip ativo** · [link](https://mobbin.com/screens/6d8257ce-2e80-4400-9283-cb0987be1161) — Filtros em dropdown (o filtro de tipo ativo vira chip com "x", All categories, "Free + Paid", All builders) e sort "Recently updated" à direita. O card mostra badge de tipo, nome, ícones de integração, categoria e contador de clones.
- **Confluence Marketplace — Cards com nota e selo de confiança** · [link](https://mobbin.com/screens/fb06119c-69cb-4b2e-8f38-6fb0d9b27948) — "Showing over 1,000 apps" + "Sort by: Relevance" e filtros em dropdown (Pricing, Trust signals, Categories…). O card tem logo, nome, "by vendor" com selo, descrição, "3.8/4 ★★★★ (1177)", instalações e ribbons "Spotlight"/"Bestseller".
- **Claude — Diretório com filtro agrupado e sort** · [filtro](https://mobbin.com/screens/9e3b6d1f-70ac-4549-ab07-c3a358b3f734) / [sort](https://mobbin.com/screens/554f7cf4-4a3a-416f-ba5a-988b162344b7) — "Filter by" abre checkboxes agrupados por "Type" e "Category". "Sort by" lista Default / Popular / Trending / New / Alphabetical com check na opção ativa. Os cards têm ícone, nome, badge e "+" para adicionar.

**Padrão adotado no Prisma:**
- **Header:** "Galeria" + subtítulo, com abas "Explorar | Favoritos" e segmented "Agentes | Skills".
- **Toolbar:**
  - busca + chips de categoria com scroll horizontal ("Todas" + categorias, com contagem como no Langdock);
  - dropdown "Origem" (Todas / Oficial Asimov / Comunidade);
  - dropdown "Ordenar" (Recentes / Mais bem avaliados / Nome A–Z, check na ativa, como no Claude).
- **Filtros ativos:** viram chips removíveis numa linha abaixo, com "Limpar filtros" (Relevance).
- **Explorar sem filtro:** seção "Oficiais Asimov" em destaque no topo (Featured, como no ChatGPT) e depois o grid "Comunidade". Com busca ou filtro ativo, vira um grid único com "N resultados".
- **Card de agente:**
  - avatar/iniciais, nome e autor ("Asimov" com selo oficial, como no Confluence, ou o apelido do aluno);
  - descrição de 2 linhas, "★ 4,6 (32)" e até 2 chips de categoria + "+N";
  - botão de favorito no canto: toggle otimista com toast "Adicionado aos favoritos · Desfazer".
- **Card de skill:** mesma anatomia, com ícone da categoria no lugar do avatar.
- **Estados:** skeleton de cards; erro "Não foi possível carregar a galeria · Tentar de novo". Vazios estão na §7.

#### 5b. Detalhe do item da galeria

- **ChatGPT — Detalhe de GPT** · [link](https://mobbin.com/flows/9a28009a-6664-4c0f-90ba-d1b4f1007158) — Modal com avatar, nome, "By futuretech.ninja", descrição e linha de stats ("★ 4.2 Ratings (500+)" · "Other / Category" · "25K+ Conversations"). Depois vêm "Conversation Starters" como chips, "Capabilities" com checks, histograma de "Ratings" de 5 a 1, "More by <criador>" em carrossel e o CTA fixo "Start Chat" no rodapé.
- **Higgsfield — Bloco de prompt copiável** · [link](https://mobbin.com/screens/9da1563f-3d30-4e01-bfa3-41bcf3460f3d) — Painel lateral com autor, bloco "PROMPT" truncado com botão "Copy" e "See all" para expandir, tabela "Information" e CTA primário "Recreate". O toast "Link copied" confirma a cópia.
- **Runway — "Reusar" a partir do item** · [link](https://mobbin.com/screens/52431829-f1cd-487d-a154-c488377fcb1e) — Título, "By alexsmith123 · 14 hours ago", prompt com ícone de copiar, "Settings" e o botão "Reuse prompt and settings". É o análogo direto de "Usar como base".
- **GitBook — Selo de mantenedor oficial + metadados laterais** · [link](https://mobbin.com/screens/431254e3-9be9-4945-8e49-6eb1eb8f42c1) — Header com ícone, nome, descrição e "Install". Na coluna lateral ficam o card "Maintained by GitBook" com check, Author, Permissions e Links.
- **Cal.com — Publicador, categoria e "Report"** · [link](https://mobbin.com/screens/b4157574-b0f3-4adf-a3fb-f4a8f6f48feb) — Chip de categoria + "Published by Cal.com" sob o nome, CTA "Install App", seções Pricing e Contact e, no rodapé, um aviso de responsabilidade com o link "Report app".

**Padrão adotado no Prisma:**
- **Página própria** com URL compartilhável (`/galeria/agentes/:id`, `/galeria/skills/:id`) e "← Galeria".
- **Header:** avatar, nome, autor com selo "Oficial Asimov" quando aplicável (GitBook) e linha de stats "★ média · N avaliações · categoria(s) · origem" (ChatGPT). Favorito fica ao lado do nome.
- **CTAs:**
  - agente: primário "Conversar agora", secundário "Usar como base" (Runway);
  - skill: primário "Copiar skill", secundário "Usar como base".
- **Bloco "Instruções":** code block monoespaçado com altura limitada, "Ver tudo" e botão copiar no canto, com toast "Instruções copiadas" (Higgsfield).
- **Agente com perguntas sugeridas:** chips clicáveis que já abrem a conversa com a pergunta (ChatGPT).
- **Avaliação:**
  - "Sua avaliação" com 5 estrelas clicáveis (hover pré-visualiza; o clique salva e mostra toast);
  - ao lado, histograma 5→1 com média (ChatGPT).
- **Também deste autor:** carrossel com até 4 itens.
- **Admin:** kebab com "Remover da galeria" (destrutivo), que abre confirmação com motivo opcional. Fica só para admin, no espírito do "Report app" do Cal.com.
- **Estados:** skeleton do header + bloco; 404 "Este item não está mais na galeria" com volta para Explorar.

---

### 6. Configurações / Perfil

#### 6a. Perfil, personalização e dados

- **Claude — Settings com subnav e "como te chamar"** · [link](https://mobbin.com/screens/b239803a-1629-463b-95d8-46854d6d8679) — Subnav à esquerda (General, Account, Privacy, Billing…). O bloco "Profile" tem Full name com avatar, "What should Claude call you?", "What best describes your work?" e "What personal preferences should Claude consider in responses?", com o helper "Your preferences will apply to all conversations".
- **ChatGPT — Personalização com "About you"** · [link](https://mobbin.com/screens/fe169df1-f811-4c85-b28e-7dc0dad115e3) — Modal de settings com nav (General, Personalization, Data controls, Account…). Personalization traz "Base style and tone", características em dropdown, "Custom instructions" e a seção "About you" com "Nickname".
- **StackAI — Cards por grupo com e-mail somente leitura** · [link](https://mobbin.com/screens/b9f9cbaa-ec7f-4c25-b4b2-2ebf3db1a03f) — Card "Profile picture" (placeholder com inicial + "Upload picture", "PNG, JPEG under 2MB"), "Basic profile details" com Full name e "Save" inline, e-mail desabilitado com helper "This is your profile email" e User ID copiável. O card "Delete account" tem botão vermelho e há um toast "Changed full name".
- **Claude — Exportar dados + toast** · [link](https://mobbin.com/screens/cbdae8ff-ad61-4e7d-8ba6-767a5337c317) / [toast](https://mobbin.com/screens/31eb665f-deeb-4165-82d5-1870acb15075) — Em "Privacy settings", a linha "Export data" tem botão à direita, junto de "Memory preferences · Manage". Ao clicar, aparece o toast "Export started".
- **Langdock — Memória e instruções como itens de menu** · [link](https://mobbin.com/screens/168b6c90-c578-4835-8d04-a736ca8fdaec) — A nav tem "Custom Instructions" e "Memory" como itens próprios. O perfil mostra a imagem centralizada com "Replace" e os tipos aceitos, e "Change email" fica desabilitado com botão "Contact us".

**Padrão adotado no Prisma:**
- **Estrutura:** `/configuracoes` com subnav à esquerda (desktop) e lista de seções no mobile. Três seções: "Perfil", "Sobre você" e "Dados e conta" (Claude, Langdock).
- **Perfil:**
  - card de foto: avatar de 72px com iniciais como fallback, "Enviar foto" / "Remover" e helper de tipos/tamanho (StackAI);
  - "Apelido — como o Prisma deve te chamar" (Claude);
  - Nome e E-mail somente leitura: input desabilitado + ícone de cadeado + helper "Vem da sua conta Asimov Academy" (StackAI, Langdock);
  - "Salvar" só aparece ou habilita quando há mudança, e confirma com toast.
- **Sobre você:**
  - textarea grande com helper "Vale para todas as conversas, projetos e agentes" (Claude);
  - placeholder com exemplo (área de atuação, nível técnico, como prefere as respostas) e contador;
  - "Salvar" desabilitado sem mudança.
- **Dados e conta:** linha "Exportar meus dados", com o que vem incluído e botão secundário. Ao clicar, toast "Exportação iniciada" e download/aviso (Claude).

#### 6b. Zona de perigo: excluir conta com confirmação digitada

- **Greptile — Danger Zone + "Type DELETE"** · [link](https://mobbin.com/flows/c970a2bf-d5e0-4311-9ee3-0baaebf411ed) — "Danger Zone" é a última seção, num card com borda vermelha e ícone de alerta. O modal diz "This action is permanent and cannot be undone. All your data… will be deleted", pede "Type DELETE to confirm" e tem os botões "Cancel" / "Permanently Delete Account" (vermelho).
- **Chatbase — Divisor "DANGER ZONE" e lista do que será apagado** · [link](https://mobbin.com/flows/dcd75900-91bc-4fe2-a173-b1ae5d31cb92) — Divisor rotulado separa a zona. O card explica as consequências ("All your uploaded data and trained agents will be deleted. This action is not reversible"). O modal lista o que será excluído e pede para digitar o e-mail.
- **Supabase — Botão bloqueado até digitar + sucesso** · [link](https://mobbin.com/flows/17f8272b-c855-407a-8567-6a7ce4c73c66) — Card com ícone de alerta e prazo da exclusão. No modal ("Please type <email> to confirm"), o botão só ativa depois de digitar. Ao concluir, aparece um toast de sucesso.
- **mymind — Exportar ao lado de excluir** · [link](https://mobbin.com/flows/84c253e9-09b0-44fa-a482-0d2e33c6635a) — "DANGER ZONE: Close & delete my account" fica ao lado de "Export my mind". O modal tem título "Deleting is permanent", "please type DELETE below", botão "Delete account" e saída "Nevermind".
- **Claude — Exclusão bloqueada com motivo** · [link](https://mobbin.com/screens/d25e68ff-d225-4841-9377-d2b81bad9927) — "To delete your account, please cancel your Claude Pro subscription first." aparece ao lado do botão "Delete account" desabilitado, junto de "Log out of all devices".

**Padrão adotado no Prisma:**
- **Zona de perigo:** última seção de "Dados e conta", separada por divisor com rótulo "Zona de perigo" (Chatbase). Card com borda e ícone de alerta (tokens de erro do DS) e o texto "Exclui permanentemente sua conta e tudo que você criou no Prisma." Ao lado, o atalho "Exporte seus dados antes" (mymind) e o botão "Excluir conta" (destrutivo outline).
- **Modal de confirmação:**
  - título "Excluir sua conta?";
  - lista do que será apagado: conversas, projetos e arquivos, agentes, skills, avaliações e itens publicados na galeria (Chatbase);
  - campo "Digite APAGAR para confirmar", que aceita só o texto exato;
  - "Excluir conta" fica desabilitado até bater com APAGAR (Supabase, Greptile);
  - "Cancelar" com foco padrão e Esc para fechar.
- **Após confirmar:** spinner no botão, depois logout e tela "Conta excluída". Se houver um impedimento, o botão fica desabilitado e o motivo aparece em linha (Claude).

---

### 7. Empty states que ensinam

#### 7a. Primeiro uso (primeiro projeto, agente ou skill)

- **Mistral — Vazio com vitrine logo abaixo** · [link](https://mobbin.com/screens/52ccaeed-c7a0-4886-86e1-13e104166a50) — "No agents yet — Create an agent to get started" + "Create an Agent", e logo abaixo "Browse Agents" com agentes oficiais. A página nunca fica em branco.
- **Snowflake — Ilustração + 1 frase de valor + 2 CTAs** · [link](https://mobbin.com/screens/2c166356-23ad-461f-af4f-00776b8b535a) — "Get started with agents" + "Use agents to build chat experiences, automate routine tasks…" + "Learn more" (secundário) / "Create agent" (primário).
- **ChatGPT Codex — Exemplos clicáveis no vazio** · [link](https://mobbin.com/screens/ce38ca22-4439-40a6-8777-0eb2d6318530) — "Start your first task" com 3 cards de exemplo em texto, cada um com botão "Start".
- **ChatGPT — Linhas-fantasma mostram o formato futuro** · [link](https://mobbin.com/flows/d5ce91cb-ab14-4772-8cdf-c723b1c4561c) — Em um projeto novo, "Chats will show up here" sobre linhas-esqueleto esmaecidas, com os cards "Add files" / "Add instructions" acima.
- **Juicebox — Ilustração que explica o conceito** · [link](https://mobbin.com/screens/6091ee41-c0c5-4261-98c6-b96f5dd88219) — "Welcome to Agents on Juicebox" + "Learn more about agents here", com uma ilustração mostrando agentes trabalhando ("35 profiles ready for review") e o CTA "Create Your First Agent".

#### 7b. Favoritos vazios

- **Microsoft Loop — Ensina o gesto** · [link](https://mobbin.com/screens/0c5c7f79-25ca-454a-be8c-1d7823fcbc20) — "Access your favorites here — Click the star icon in workspaces, on pages, or in components to add them to your favorites."
- **Turo — Título motivador + CTA de busca** · [link](https://mobbin.com/screens/af052f0c-e46d-4e6a-beb1-816468d4cd75) — "Get started with Favorites — Tap the heart icon to save your favorite vehicles to a list" + "Find new favorites".
- **Zillow — Ícone dentro do texto + desfazer** · [link](https://mobbin.com/screens/7c2e98fa-96f6-4fe1-8daf-7b0ff2dfb03b) — "Whenever you find homes you like, select the ♡ to save them here." traz o próprio ícone no texto e o CTA "Search for homes". O toast "All saved homes removed. Undo" permite desfazer.

#### 7c. Busca/filtro sem resultados

- **Pinterest — Remover filtro por filtro** · [link](https://mobbin.com/screens/45560b08-b73e-4f7e-8a82-878c035ddd68) — "Tweak your search — Try editing or removing filters", com um botão por filtro ativo ("Remove price", "Remove brands"…) + "Clear all filters".
- **Canny — Ecoa o termo e oferece criar** · [link](https://mobbin.com/screens/983517a9-4e00-4d4f-91e9-a52927f7b5a8) — "We couldn't find any changelog entries matching 'mobbin'. Try searching for other keywords or create a new entry instead."
- **OpenSea — Chips de filtros ativos + limpar** · [link](https://mobbin.com/screens/45a834a8-d95b-43fe-8420-7f0660bb528b) — Linha de chips com "x" para cada filtro e "Clear", mais o vazio "No results found — Try removing some filters" + "Clear filters".
- **Heidi — Sem resultado, mas com relacionados** · [link](https://mobbin.com/screens/1b68f1f1-6023-420d-a799-0c21cf57daa9) — "There are no templates from mental health counselors in United Kingdom yet." seguido de "Showing related results:" e um grid de alternativas.

**Padrão adotado no Prisma:**
- **Anatomia comum:** ícone/ilustração pequena do DS, título que diz o que é, 1 frase de benefício, CTA primário e CTA secundário (exemplo oficial ou galeria) (Snowflake). Quando cabe, 2–3 exemplos clicáveis (Codex).
- **Projetos (vazio):** "Organize suas conversas por assunto. Cada projeto guarda um contexto e até 20 arquivos usados em todas as conversas dele." CTA "Criar projeto". Exemplos clicáveis que preenchem o nome ("Estudos de Python", "TCC", "Relatórios do trabalho").
- **Projeto novo (detalhe):** cards "Adicionar contexto" / "Adicionar arquivos" + linhas-fantasma "Suas conversas vão aparecer aqui" (ChatGPT).
- **Agentes (vazio):** "Crie um assistente que já sabe o que fazer." CTA "Criar agente" + "Começar de um exemplo". Abaixo, 3 agentes oficiais da Asimov (Mistral).
- **Skills (vazio):** "Ensine o Prisma a fazer algo do seu jeito e ligue em qualquer conversa." CTA "Criar skill" + "Ver skills da galeria". Um card de exemplo mostra o formato.
- **Favoritos (vazio):** "Nenhum favorito ainda", com "Toque no ♡ em qualquer agente ou skill da galeria para guardar aqui" (ícone inline, como no Zillow) e CTA "Explorar galeria" (Turo).
- **Sem resultados:**
  - "Nada encontrado para "<termo>"";
  - um chip removível por filtro ativo + "Limpar filtros" (Pinterest, OpenSea);
  - na galeria, depois do vazio vem "Veja também" com relacionados da mesma categoria (Heidi);
  - nas listas próprias, link "Criar '<termo>'" (Canny).
- **Vazio de verdade vs. vazio por filtro:** o primeiro usa o empty de primeiro uso; o segundo usa o empty de busca. Nunca usar o mesmo componente para os dois.

---

### Padrões transversais (resumo)

- **Página de lista** (Projetos, Skills, Agentes, Galeria), sempre com a mesma anatomia:
  - header com título + subtítulo e CTA primário à direita;
  - toolbar com busca, chips de categoria, dropdown de origem quando houver, "Ordenar" e toggle cards/lista;
  - grid de cards clicáveis com kebab no hover;
  - skeleton no carregamento; empty de primeiro uso ≠ empty de busca.
- **Editores** (Contexto de projeto, Skill, Agente, Sobre você):
  - "Salvar" desabilitado sem mudança e indicador de estado ("Rascunho / Alterações não salvas / Salvo");
  - confirmação ao sair com alterações;
  - helper + placeholder com exemplo em cada campo e contadores de caracteres e de limites (20 arquivos, 5 skills, 4 perguntas, 5 arquivos do agente).
- **Feedback:** toasts curtos para criar, copiar, favoritar, exportar e salvar, com "Desfazer" nas ações reversíveis (favoritar, remover). Ações destrutivas têm confirmação, e excluir conta exige digitar APAGAR.

---

## Parte C · Admin e padrões transversais
Escopo: área administrativa do Asimov Prisma (catálogo de modelos, uso e custos, usuários e limites de gasto, navegação do admin) e padrões transversais (tabelas, filtros, ⌘K, toasts, skeletons, erros, confirmações destrutivas).
Método: buscas no Mobbin (web), descrevendo só o que aparece nas imagens. Extraímos **estrutura e decisões**; o visual final segue o Asimov Design System (tema claro).

---

### 1. Catálogo de modelos (tabela de configurações + side sheet)

- **Vercel: Browse Models (catálogo do AI Gateway)** · [link](https://mobbin.com/screens/b6917f9e-6d5a-4237-82c9-a2b96b7e7a82): busca, chips de modalidade (All/Text/Code/Image/Video/Embed/Rerank), dropdown de provedor, "Sort by" e um botão **"Columns (13)"** para escolher colunas. Os números ficam alinhados à direita e abreviados (1M, 128K, $3.00/M), e a célula "Cache" junta Read/Write em duas linhas, o que economiza uma coluna.
- **Twenty: Settings > AI** · [link](https://mobbin.com/screens/e5487bf5-41e5-4b52-971b-1dde01a5228a): o modelo padrão ("Fast Model") é escolhido num **select acima** da lista, separado da seção "Available: models available in the chat model picker", que tem busca, coluna Provider e um checkbox por linha. É exatamente o nosso "visível no picker".
- **Langdock: Workspace > Models** · [link](https://mobbin.com/screens/3255e6bd-ff69-477f-9762-ef14f56b35cc): "Default chat model" e "Image generation model" ficam como selects no topo, com texto explicando o override. Abaixo vêm tabs All/Completion/Image/Custom, busca, "+ Add custom model" e linhas com "Edit" e lixeira. Ao salvar aparece o toast "Model saved successfully" no canto superior direito.
- **Braintrust: AI providers** · [link](https://mobbin.com/screens/e4d603f8-78bc-439b-ad77-721850970ead): linha compacta com nome e a **chave técnica em mono logo abaixo** (OPENAI_API_KEY), status textual ("Not configured" / "✓ Configured"), "Last updated" e ações em ícone no fim da linha. A lixeira só aparece quando faz sentido.
- **Time2book: Edit coupon (side sheet sobre a tabela)** · [link](https://mobbin.com/screens/f0ae41ce-665d-45c8-bf2a-f89c36a136bb): o sheet à direita mantém a tabela visível ao fundo. O **status ("Inactive ▾") fica no cabeçalho do sheet** e o conteúdo é dividido em seções (General / Type / Products / Settings), com toggle e helper text ("Applies to all if left off").

Também vale ver: [Supabase: Update row](https://mobbin.com/screens/d90069ad-64e5-4492-b8e0-c25bd2ba88bd), com o tipo técnico sob cada label, um helper "Default: now()" e o footer fixo "Cancel / Save ⌘↵"; e [Stripe: Add a product](https://mobbin.com/screens/89eec555-5039-4d61-b011-ec0222d65fae), com "More options ⌄" recolhido e o badge "Default" no preço, ao lado de um menu ⋯.

**Padrão adotado no Prisma:**
- **Padrão fora da tabela** (Twenty/Langdock): um card "Padrões" no topo com o select "Modelo padrão do chat". Na tabela, o padrão aparece só como badge "Padrão" na linha. Isso resolve o "default único" sem radio por linha.
- **Toolbar** (Vercel/Langdock): busca por nome ou key, segmentado de modalidade (Todos · Texto · Imagem), filtros Provedor e Status (Ativo/Inativo), e o botão "Colunas". O CTA "Novo modelo" fica no header da página.
- **Tabela compacta com prioridade de colunas.** As colunas P1 estão sempre visíveis: alça de ordem · Nome + `key` em mono abaixo (Braintrust) · Provedor · Modalidade (badge) · Entrada e Saída US$/1M, alinhadas à direita e abreviadas (Vercel) · Contexto (128K/1M) · switch **Ativo** · switch **No picker** (Twenty) · ⋯. As P2 ficam ocultas por padrão e entram pelo menu "Colunas": máx. output, cache mínimo, ícones de arquivos/imagens, badge, ordem. As P3 só existem no sheet: o JSON de preferências do provedor.
- **Switches inline** aplicam na hora, com update otimista e toast "GPT-X desativado · Desfazer" (ver 5.4). A linha inativa fica esmaecida. Não é permitido desativar o modelo padrão: o switch fica desabilitado com o tooltip "Defina outro padrão antes".
- **Clicar na linha abre o side sheet** (~480px, Time2book). No cabeçalho ficam nome, `key` e o select de status. As seções são **Geral** (nome, key, provedor, modalidade, badge), **Preços** (entrada/saída com prefixo US$ e sufixo "/1M"), **Limites** (contexto, máx. output, cache mínimo), **Capacidades** (switches "Aceita arquivos" / "Aceita imagens" com helper) e **Avançado** recolhido (editor JSON mono com validação inline). O footer é fixo, com Cancelar e Salvar (⌘↵); Salvar só habilita com alterações (ver Melio em 5.6).
- **Menu ⋯ da linha:** Editar · Tornar padrão · Duplicar · Ativar/Desativar. Para ordenar, existe um modo "Reordenar" com alças de arrasto (Gorgias, tópico 3).
- **Criar** abre o mesmo sheet em modo criação, com o status travado em "Inativo" e a nota "Modelos nascem desativados. Revise preços e limites antes de ativar."
- **Estados:** carregamento com linhas skeleton (Neon, 5.5); busca sem resultado com "Limpar filtros" (Unify, 5.2); erro na tabela com "Tentar novamente" dentro do card (Revolut, 5.6).

---

### 2. Dashboard de uso e custos

- **OpenAI Platform: Usage** · [link](https://mobbin.com/screens/823e5612-9a3c-4730-b39c-406a66b583b8) · [presets](https://mobbin.com/screens/67941c7b-6c9b-4ec2-bb3b-815958902b76) · [export](https://mobbin.com/screens/f225daa5-e92d-4a8a-8e27-1d545c9325d2): o header tem um chip de filtro removível, o botão de período ("02/16/26 – 03/03/26") e "Export". O gráfico "Total Spend" tem uma linha tracejada de máximo com rótulo, "Group by" e granularidade "1d". Na lateral ficam um budget com barra e marcas de limite ("Resets in 28 days · Edit budget"), além de sparklines de tokens e requests. O tooltip mostra a data, o total e o detalhamento Input/Output. O popover de período combina presets (Week to date, Month to date, Last 7/14/30 days) com um calendário de 2 meses. O export é um modal com Activity/Cost data, Group by, formato CSV e intervalo.
- **Vercel: Usage** · [link](https://mobbin.com/screens/fd0e54a5-45cc-4a47-be0d-3fdb7e804ec7): a barra de filtros traz ciclo de cobrança, período, produtos, projetos e agrupamento ("By Product"). O card "Included Credit $1.25 / $20.00" tem barra. "Consumption Breakdown" tem o segmentado Daily/Weekly/Monthly e o checkbox "Cumulative". O tooltip lista cada série com cor, valor e o total do dia. Abaixo, uma tabela agrupada por categoria com sparkline por linha e "Charge" à direita.
- **Stripe: Your overview** · [link](https://mobbin.com/screens/02176a39-e453-4570-af73-6af00fbe681b): "Last 7 days" + **"compared to Previous period"** + "Daily". Cada card mostra o valor, o valor do período anterior em texto secundário, um badge de variação e o rodapé "View more · Updated 06:23". O card de status usa uma barra empilhada com legenda e valores.
- **Grok (xAI): Usage explorer** · [link](https://mobbin.com/screens/3712e4c5-f433-484b-bedc-5d3037e75217): toolbar com Options, Filters e período com setas ‹ ›. Os KPIs **Total / Average / Peak** aparecem em linha, com os decimais menos destacados ($0.12**78**). No hover, as barras ganham uma faixa de destaque na coluna e um tooltip. Abaixo, "Usage breakdown" repete os dados do gráfico em tabela (grupo × dia).
- **Profound: Overview (ranking com barras inline)** · [link](https://mobbin.com/screens/d57bdc92-62da-427b-bf02-cfdd36cd6c3e): lista numerada 1–10 com nome, valor abreviado (3.4M, 560.3k) e barra horizontal proporcional, controlada por "Last 6 Days" e "Daily" no header. Dá para comparar a participação de cada item sem precisar de um gráfico separado.

Também vale ver: [Cohere: date range](https://mobbin.com/screens/fa7c258d-540e-4a63-8389-2ca24b7c1f44), com presets à esquerda (Today…Last year) e 2 meses à direita, além de "Last updated"; e [Gumloop: Usage & Limits](https://mobbin.com/screens/705f77a8-8ac2-4cc0-a6c4-d4dd12af5148), com período ‹ › e botão de refresh, tooltip com breakdown e "Total", e uma tabela de logs expansível com "Filters".

**Padrão adotado no Prisma:**
- **Barra de período fixa no topo:** botão "01/10/26 – 15/10/26" que abre um popover com presets à esquerda (Hoje, Últimos 7 dias, Últimos 30 dias, Este mês, Mês passado) e um calendário de 2 meses, com Cancelar/Aplicar (OpenAI/Cohere). Ao lado ficam os atalhos segmentados **7d · 30d**, "Agrupar por: Dia / Usuário / Modelo" (OpenAI "Group by"), "Comparar com período anterior" (Stripe), o toggle **R$ / US$** e "Exportar CSV" (modal, OpenAI). O período vai para a URL (query string, sem dados pessoais).
- **KPIs em duas camadas:** 4 cards grandes (**Custo real** em R$ com US$ secundário, **Créditos**, **Mensagens**, **Tokens**) e uma faixa compacta com 3 números (**Economia de cache** em positivo, **Overhead**, **Respostas truncadas** em aviso se > 0). Cada card traz label com tooltip (i), valor, badge de variação e "anterior: R$ X" (Stripe). Os decimais ficam menos destacados (Grok).
- **Gráfico "Custo por dia":** barras, com faixa de hover na coluna e tooltip mostrando data, total e breakdown por modelo com a cor da série (Vercel/OpenAI). Há uma linha tracejada opcional de média ou orçamento diário (OpenAI). O toggle **Gráfico | Tabela** mostra a tabela equivalente (Grok), o que também resolve a acessibilidade.
- **Custo por modelo:** tabela ordenável (Modelo · Mensagens · Tokens · Custo · % do total), com barra inline proporcional na última coluna (Profound). Clicar no modelo filtra o dashboard.
- **Alertas de custo:** card próprio. Sem alertas, o estado vazio é positivo ("Nenhum alerta no período", com ícone de check). Com alertas, cada linha mostra limiar, quando ocorreu e um link para os usuários envolvidos (limiares 80%/100% como no OpenAI Limits, tópico 3).
- **Log de eventos:** tabela com chips de tipo (Login negado · Rate limit) e "+ Filtro" (PlanetScale/Dropbox, 5.2). O tipo aparece como código mono (`login.denied`), seguido de usuário, IP e data com a hora em destaque. As linhas expandem para mostrar os detalhes (Okta/WorkOS).
- **Estados:** KPIs mostram "—" ou skeleton enquanto carregam (Greptile, 5.5). Cada painel tem seu próprio vazio ("Sem dados neste período", Shopify/Assembly) e seu próprio erro com "Tentar novamente" (Revolut), sem derrubar a página. No rodapé, "Atualizado às 14:32" (Stripe).

---

### 3. Usuários e limites de gasto (tabela + drawer + políticas)

- **Unify: Usage > Usage by seat** · [link](https://mobbin.com/screens/34bc05a5-e664-4772-9308-462fde6a7c01): tabela com Seat (ordenável), Role, **"Used / allocation" (385 / 500)** e **barra + "77%"**. Acima ficam cards de consumo agregado com barra e a frase de regra "Each seat uses its own plan credits first, then draws from shared extra credits", que explica a precedência em uma linha.
- **Coda: Workspace settings > AI usage** · [link](https://mobbin.com/screens/022566aa-2500-4f5e-8370-3564023e0633): toggle "Enforce daily cap" com input + "Save" e um texto que explica a consequência. Abaixo, a tabela por membro (Member · **Daily cap** · **AI usage this month** com barra e valor), com tabs "By Doc Maker / Top docs" e busca de membro. O limite e o consumo ficam lado a lado na mesma linha.
- **Dropbox: Admin console > Members** · [link](https://mobbin.com/screens/7d5b1fa6-d118-4215-a7c1-3c39268c7b08): os filtros de status são **chips com contagem** (Active 2 · Invited 0 · Suspended 0 · Removed 0 ▾), com Group ▾ e busca por ícone. A tabela tem Name ordenável com avatar e email, Role e "Manage access ✎" inline. As ações em massa ficam no menu "More options" (Import CSV / Export).
- **Krea AI: Updating usage limits (flow)** · [link](https://mobbin.com/flows/63799fd3-bc18-4e62-8ebd-f21f130d679e): o menu ⋯ da linha traz Manage Feature Access, **Set Usage Limit** e Remove Member (em vermelho). Isso abre "Set Monthly Usage Limit", com contexto ("Setting usage limit for: email" · "This limit applies to the current month (August 2025)"). Depois a coluna "Usage Limit" passa de "No limit" para "20".
- **Navan: Política padrão + exceções** · [link](https://mobbin.com/screens/916b1f74-9f86-47f3-b028-3437258c64fc): cada regra é um card com a linha "Default policy" e o link **"+ Add exception for specific groups or users"**, além de "Learn more" e "Reset" no header. O modelo é herança com overrides explícitos.

Também vale ver: [Gorgias: SLAs](https://mobbin.com/screens/9c18a62e-1c61-4dab-8050-dfd96551ffd2), onde a frase "The first policy that matches… will apply" aparece com alças de ordenação e switch ON; e [OpenAI: Limits](https://mobbin.com/screens/8c5d3afa-a720-4106-8296-df1568229801), com budget $0.00 / $120.00 em barra, alertas "80% usage / 100% usage" editáveis e um modal enxuto "Edit budget".

**Padrão adotado no Prisma:**
- **Topo:** cards NPS e Usuários ativos, e um card clicável "**Perto do limite (≥80%)**" que aplica o filtro.
- **Toolbar:** busca por nome ou email, chips de status com contagem (Dropbox) e os filtros Papel, Plano e Origem do limite.
- **Colunas da tabela:** Usuário (avatar, nome, email) · Papel · Plano · Status · Último acesso ("há 2 h", com tooltip da data absoluta) · **Gasto semanal** e **Gasto mensal**, cada uma com barra + "R$ 12,40 / R$ 20,00" + % (Unify/Coda) · **Origem do limite** (badge: Usuário · Plano Pro · Papel Staff · Política geral · Padrão do sistema).
- **Cor da barra por limiar:** < 80% neutra, 80–99% aviso, ≥ 100% perigo, seguindo os alertas 80/100 do OpenAI. Sem limite, a coluna mostra o texto "Sem limite" em vez de barra (Krea).
- **Editar limite em drawer** (não em modal), aberto pelo clique na linha ou por ⋯ > "Editar limite" (Krea). O conteúdo segue esta ordem:
  1. Consumo atual (semanal e mensal, barras somente leitura).
  2. **"Limite efetivo: R$ 20/semana, herdado de Plano Pro"**, com a cadeia de precedência (Usuário → Plano → Papel → Política geral → Padrão do sistema) e o nível vencedor destacado (Navan/Gorgias).
  3. Switch "Definir limite próprio para este usuário", que revela os inputs R$ semanal e mensal.
  4. Nota de vigência ("Vale a partir de agora; a semana reinicia na segunda", como o "applies to the current month" do Krea) e a caixa de consequência ("Ao atingir o limite, novas mensagens são bloqueadas até o reinício").
  5. Footer com o link "Remover limite próprio" (volta a herdar) + Cancelar / Salvar.
  6. Toast "Limite atualizado" e a linha atualizada, com a origem passando a "Usuário".
- **Políticas de limite:** tabela na tab "Políticas", agrupada **na ordem fixa de precedência**, com níveis numerados e a frase-regra no topo: "Vale a regra mais específica: usuário > plano > papel > política geral > padrão do sistema" (Gorgias/Unify).
  - "Padrão do sistema" é uma linha somente leitura.
  - Cada nível tem o link "+ Adicionar exceção para plano / papel" (Navan).
  - Colunas: Escopo · Alvo · Limite semanal · Limite mensal · **Usuários afetados** (link para a tabela já filtrada) · Atualizado em · ⋯.
  - Excluir uma política mostra quantos usuários passam a herdar do nível de baixo (ver 5.7).
- **Estados:** "Nenhum usuário encontrado" com "Limpar filtros"; usuário bloqueado por limite recebe badge de status "Bloqueado (limite)" e um alerta no drawer (como o "Credit limit reached" do HubSpot).

---

### 4. Navegação do admin (separação do produto principal)

- **Dropbox: Admin console** · [link](https://mobbin.com/screens/fabb9a08-2585-4e05-8fad-cc158b24ac48): o admin tem uma **sidebar própria**, com o título "Admin console" (Dashboard, Members, Groups, Content, Security, Billing, Settings, Help) e **"← Back to Dropbox"** fixo no rodapé. Dentro das páginas, sub-tabs (Activity / External sharing).
- **Slack: Workspace settings** · [link](https://mobbin.com/screens/dffa5e88-3773-4e0c-8c0d-f37498390fef): a sidebar é dividida em grupos rotulados **ACCOUNT** e **ADMINISTRATION**, com "Back to Slack" no topo do primeiro grupo. A home do admin é um hub de cards que leva às seções.
- **Langdock: Settings** · [link](https://mobbin.com/screens/bbde540f-a255-4566-bda1-7f455791a952): "‹ Back to app" no topo e grupos com rótulo (pessoais / Workspace: Overview, Models, Analytics, Usage / User management: Members, Groups, Roles / Products). Configurações pessoais e de admin convivem na mesma navegação, mas em blocos separados.
- **Asana: Admin console > Users** · [link](https://mobbin.com/screens/5c8ac940-052c-4e8b-8598-52686804cbbd): o logo leva o selo **"ADMIN"**, a navegação é curta (Insights, Users, Billing, Settings, Resources) e há o link "Launch Asana ↗" para voltar ao produto. A página tem tabs All/Members/Guests/Invited.
- **Twingate: navegação em dois níveis no header** · [link](https://mobbin.com/screens/15aa55cd-c36d-4887-9733-a87fbaeeb993): seções principais no topo (Network, Team, Devices, Policies, Settings) e uma sub-nav de segundo nível (Overview, Resources, Remote Networks, Connectors) logo abaixo, com o título grande da página ("2 Resources").

Também vale ver: a sidebar contextual da Vercel ([AI Gateway](https://mobbin.com/screens/b6917f9e-6d5a-4237-82c9-a2b96b7e7a82)), em que a sidebar inteira troca para o contexto "‹ AI Gateway" com um item ativo destacado.

**Padrão adotado no Prisma:**
- **Contexto separado:** o item "Admin" (ícone de escudo) aparece só para staff, no menu do usuário e no rodapé da sidebar do chat. Ao entrar em `/admin`, **a sidebar do chat é substituída** pela sidebar do admin (Dropbox/Vercel). O logo leva o selo "Admin" (Asana) e "← Voltar ao Prisma" fica fixo no topo (Langdock/Slack).
- **Grupos rotulados na sidebar** (Slack/Langdock): **Visão geral** → Uso e custos · **Catálogo** → Modelos · **Pessoas** → Usuários e limites · **Segurança** → Eventos. Itens de configuração pessoal não entram aqui.
- **Sub-tabs no header da página** para subseções da mesma entidade (Dropbox/Twingate/Asana): Usuários e limites → "Usuários | Políticas de limite"; Uso e custos → "Visão geral | Eventos" (se o log crescer). Cada tab tem URL própria.
- **Breadcrumb** curto quando há drill-in ("Admin / Modelos / GPT-5"), e o side sheet não muda a rota principal: usa `?model=key` para permitir deep link.
- Em telas estreitas, a sidebar do admin vira sheet e as sub-tabs rolam horizontalmente.

---

### 5. Padrões transversais

#### 5.1 Tabelas (ordenação, colunas, densidade, rodapé)
- **Vanta: Policies** · [link](https://mobbin.com/screens/28969a86-3647-434b-af2a-3962e51d35d3): toolbar com busca, facetas (Framework ▾, Status ▾, Type ▾), "Sort by" + direção e um popover de visualização com **Density (Dense / Regular / Comfortable)** e **Columns** (switch + alça de arrasto) + "Reset to default". O status usa pill "OK" e cada linha tem ⋯.
- **Remote: Edit table (painel lateral)** · [link](https://mobbin.com/screens/2db7ddae-80ef-4bbd-aa0e-f4a13da800e9): gerenciador de colunas em painel, com "Search columns", seção "Shown in table" (arrastável, olho) e seção "Hidden".
- **Twenty: Companies** · [link](https://mobbin.com/screens/c4089aab-6ec1-4507-b53f-19abd7dbf459): ícone de tipo em cada header, chips de filtro acima e **rodapé com agregação por coluna** ("Count all 3", "Max of…").
- **StackAI: Members** · [link](https://mobbin.com/screens/419b612e-ac84-4c84-8b75-abffd20bed05): paginação simples (Prev/Next) com seletor de linhas por página (10 / 20 / 30) e badge de papel ("Admin") na célula.

**Padrão adotado:** header **sticky** com ordenação por clique (seta ↑↓ só na coluna ativa); números tabulares alinhados à direita; densidade padrão "Compacta" (40px) com opção "Confortável" (Vanta); menu "Colunas" com toggles, reordenação e "Restaurar padrão" (Vanta/Remote); rodapé com totais quando fizer sentido (Twenty), como gasto total da página; paginação com "1–25 de 312" + linhas por página (StackAI). A preferência de colunas e densidade fica em `localStorage`.

#### 5.2 Barra de filtros e chips
- **Twenty** · [link](https://mobbin.com/screens/c4089aab-6ec1-4507-b53f-19abd7dbf459): chips "Campo: valores ×" ("Company Stages: New, In discussion"), "+ Add filter", "Save as new view" e um popover com operador ("Is") e multi-seleção.
- **PlanetScale: Audit log** · [link](https://mobbin.com/screens/d7448333-6400-49dd-b11f-e48e4e229200): "Add filter ▾" abre um popover em dois passos (campo → busca de valores → "Add filter"). A ação aparece como código mono (`deploy_request.queued`).
- **Klaviyo: Campaigns** · [link](https://mobbin.com/screens/d8f89a3b-4e1e-4553-8a49-905cc8cbd0dc): chips com rótulo acima (Date range / Channels "Email, +1" / Status "Sent") e "Clear". O vazio diz "No data available · Refresh the page to try again".
- **Unify: Tasks** · [link](https://mobbin.com/screens/c4b23ce7-b83a-4f89-99a5-ca874425e715): chips removíveis com Reset/Save e o vazio "No tasks matching these filters" + botão **"Clear filters"**.

**Padrão adotado:** atalhos de filtro frequentes visíveis como chips (Status, Tipo) e o resto atrás de "+ Filtro" (campo → valor), como PlanetScale/Twenty. Filtro aplicado vira chip "Campo: valor ×", com "+N" quando há vários valores (Klaviyo) e "Limpar" no fim. Os filtros vão para a URL. Sem resultados, o vazio explica o motivo e oferece "Limpar filtros" (Unify).

#### 5.3 Busca global / command palette (⌘K)
- **Vapi** · [link](https://mobbin.com/screens/593d7acd-2e16-4365-bcd6-02ce52f48f3b): grupos **Actions** (com atalho ⌘O), **Recent** e **All Pages**, com breadcrumb da seção ("Monitors — Observe / Issues"). O rodapé mostra ↑↓ navegar, ↵ selecionar e a contagem "14 results".
- **Juicebox** · [link](https://mobbin.com/screens/2af813bf-0129-45d1-81ed-069edee76e16): grupos ACCOUNT / ORGANIZATION com itens "Go to …" e ícone ↗. O rodapé explica ↵, ↑↓, **Tab para pular seções** e ⌘K para alternar.
- **Magnific** · [link](https://mobbin.com/screens/e22e26e2-f813-4f1e-beda-43c9ecf26419): "Recents" + "Quick actions", cada ação com seu atalho, e o rodapé Navigate / Select / ESC Close / ⇧ Open in new tab.

**Padrão adotado:** ⌘K global (também no admin, para staff) com grupos **Ações** ("Novo modelo", "Exportar uso"), **Recentes** e **Ir para** (páginas do admin com breadcrumb), além de resultados de entidades (modelos por nome/key, usuários por nome/email). O rodapé mostra os atalhos (Vapi/Juicebox) e o campo de busca já abre focado. O palette entra pelo atalho, sem botão grande na tela.

#### 5.4 Toasts e notificações
- **Asana** · [link](https://mobbin.com/screens/36cb9092-004d-4cfa-abc7-930e4a7ff931): toast no canto inferior esquerdo, "Product Demo - A was deleted", com **Undo**, × e uma barra de tempo no topo. A página mostra ainda "Restore Project" como segunda saída.
- **Coda** · [link](https://mobbin.com/screens/580abcac-fdb0-4c72-b6ea-b529d42bfa1e): "1 doc moved to Work." + link "Undo" + ×, em uma linha curta.
- **Retool: Deleting a row (flow)** · [link](https://mobbin.com/flows/1fc22da4-664c-4e85-9b74-ea463fab41c8): a seleção mostra uma barra flutuante "1 selected · Delete rows". Depois vem o toast "Successfully deleted 1 row · Done" e o contador muda de "51 records" para "50".

**Padrão adotado:** toasts no canto inferior direito, até 3 empilhados, com ~5 s para sucesso e sem auto-fechar em erro. Ações reversíveis (desativar modelo, tirar do picker, remover limite próprio) **não pedem confirmação**: mostram o toast com "Desfazer" (Asana/Coda). O texto nomeia o objeto ("Limite de Ana atualizado"). Erros de rede viram toast com "Tentar novamente".

#### 5.5 Skeletons de carregamento
- **Square** · [link](https://mobbin.com/screens/09371ef3-f0d0-4fc9-8ab1-607ab3d0e4ab): skeleton da página inteira na forma real (título, barra de filtros, bloco do gráfico, header + 6 linhas de tabela).
- **Neon** · [link](https://mobbin.com/screens/9b5b1374-c015-495b-abcb-9cce659c741b): o título real ("Computes") já renderiza, e só as linhas da tabela são skeleton, com larguras por coluna.
- **Greptile: Analytics** · [link](https://mobbin.com/screens/2ff59491-3f93-41e8-8b25-beab8cd5c2b0): os KPIs mostram "…", os selects mostram "Loading…" e os eixos do gráfico aparecem vazios. O layout não pula quando os dados chegam.

**Padrão adotado:** o chrome (header, toolbar, títulos) renderiza na hora e os skeletons ocupam só as áreas de dados, com a forma final (Neon/Square): linhas de tabela com larguras por coluna, cards de KPI com bloco de valor e gráfico com eixos. O carregamento é independente por painel no dashboard. Refetch de filtro mantém os dados antigos esmaecidos, sem voltar ao skeleton.

#### 5.6 Estados de erro com retry
- **Revolut Business: Cards** · [link](https://mobbin.com/screens/b719158e-0a19-4b2e-8cc0-5217648ea20a): o erro fica **dentro do painel** ("Connection issue" + "Try again"), e os chips de filtro e a navegação continuam funcionando. No topo, um banner "Back online".
- **Remote: Talent insights** · [link](https://mobbin.com/screens/ac946a89-0a9f-45b6-b75d-6797bee210a1): "Sorry, something went wrong on our end · This page failed to load. Please retry or contact…" + "Retry", com a sidebar e as tabs preservadas.
- **PayPal** · [link](https://mobbin.com/screens/71044211-2f4a-4b72-a66f-867a5ea94b35): mensagem humana + **"Debug ID"** visível + Retry.
- **Melio: Edit vendor details** · [link](https://mobbin.com/screens/94a08524-e20b-4b25-a4a2-af0f07548564): validação inline no campo ("The routing number must have 9 digits"), "Save" desabilitado e um aviso informativo acima do campo irreversível.

**Padrão adotado:** o erro fica no menor escopo possível. Num painel, aparece no próprio painel com "Tentar novamente" (Revolut). Na página, aparece no conteúdo com a navegação intacta (Remote), e o texto inclui o ID da requisição copiável para o suporte (PayPal). Formulários do sheet validam inline e só habilitam Salvar quando o form está válido e alterado (Melio). JSON inválido mostra a linha e a coluna do erro.

#### 5.7 Confirmações destrutivas
- **Cloudflare: Delete Worker** · [link](https://mobbin.com/screens/aa928ac1-4a1d-4b8c-9ccb-be35211cdca8): explica a consequência ("permanent… also deletes all associated deployments") e pede "Type in `asm` ⧉ to confirm", com botão de copiar o nome. O "Delete" é vermelho.
- **Clerk: Delete application** · [link](https://mobbin.com/screens/71516c8f-ca28-4b68-bca8-01b6ea6e46ec): "Type 'ASMobbin App' to confirm", seguido de um aviso com ícone ("irreversible") e um botão que nomeia a ação ("Delete application").
- **AirOps: Delete selected items** · [link](https://mobbin.com/screens/f4e2bee1-3cf3-4c30-b20a-95a192688ed1): lista **"These items will be deleted"**, cita o impacto em dependências ("may break Workflows…") e mantém o botão "Yes, Delete 2 items" desabilitado até a pessoa digitar "Delete".
- **Supabase: Deleting rows (flow)** · [link](https://mobbin.com/flows/01efde30-0e98-47a0-8653-514fc0ebd367): seleção → "Delete 3 rows" na toolbar → modal curto "Are you sure… 3 rows? This action cannot be undone." (Cancel / Delete) → toast "Successfully deleted selected row(s)" e o contador atualizado.

**Padrão adotado:** três níveis.
1. **Reversível:** sem diálogo, com toast "Desfazer" (5.4).
2. **Impacto médio:** modal curto que nomeia o objeto e a consequência concreta, com botão nomeado ("Excluir política") e Cancelar com foco inicial (Supabase). Exemplos: excluir uma política de limite (mostra "38 usuários passarão a herdar de Plano Pro", como o impacto do AirOps) ou desativar um modelo com uso ativo.
3. **Irreversível ou em massa:** digitar o nome para confirmar, com botão de copiar, e botão desabilitado até bater (Cloudflare/Clerk/AirOps).

Itens destrutivos ficam por último no menu ⋯, em vermelho e separados por divisor. O pós-ação é sempre um toast e a contagem atualizada.

---

**Estados vistos nas referências (resumo):**
- **Vazio por painel:** [Shopify](https://mobbin.com/screens/2a263161-8c84-4bc8-a954-e0b43944222e) ("No data for this date range"), [Assembly](https://mobbin.com/screens/12f4a386-4b3c-4575-a9af-038529f01aec) ("No link click data during this time period"), [Stripe](https://mobbin.com/screens/34394dc8-01f0-4557-ba9e-f0d3bb0a891a) ("Start by adding a feature" + CTA).
- **Vazio por filtro:** Unify, [Pinterest](https://mobbin.com/screens/45560b08-b73e-4f7e-8a82-878c035ddd68) (botões "Remove price", "Remove brands"… + "Clear all filters").
- **Carregamento:** Square, Neon, Greptile, [Lovable](https://mobbin.com/screens/8e03e592-d510-4804-a6ce-d998c7c115bc) (tabela skeleton com paginação).
- **Erro:** Revolut (no painel), Remote (na página), PayPal (Debug ID).
- **Limite estourado:** [Rox](https://mobbin.com/screens/c259bb12-d530-49cb-8eb9-ccf9bf520221) (barra vermelha 1.535 / 1.000) e [HubSpot](https://mobbin.com/screens/87475a17-3412-413a-b933-1842718c0e78) ("Credit limit reached" + "Buy Credits").

---

**Your Mobbin AI usage is high this month**

Usage is unlimited during beta. If your usage stays at this level, you may need to purchase more credits once limits take effect. [View usage and plan options](https://mobbin.com/settings/billing-and-usage)
