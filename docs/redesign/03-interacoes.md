# 03 · Componentes e movimento (UI Arc)

Pesquisa feita com o MCP do UI Arc (`list_components`, `search_components`, `get_component`, `get_skill`) em 15/10/2026:
256 itens no catálogo (111 componentes e 22 blocos gratuitos, 123 itens Pro). A pesquisa completa, com os números de
cada componente, está em [`03b-ui-arc-pesquisa.md`](03b-ui-arc-pesquisa.md). Este documento registra **o que o Prisma adotou,
onde, e como ficou adaptado aos tokens do Asimov DS e ao tema claro**.

O Arc é React. O Prisma é HTML, CSS e JS puros, sem build. Por isso o Prisma porta **a especificação** de cada componente
(tempos, curvas, estados, teclado, ARIA, movimento reduzido), não o código. Nenhum item Pro foi lido nem reconstruído.

## 1. Regras de movimento (valem para tudo)

1. **Só `transform` e `opacity`** se movem, com uma exceção: largura e altura quando o tamanho é a própria informação (medidor, barra de gasto).
2. **Feedback na hora:** pressionar encolhe em 100 ms (0,97 nos botões, 0,92 nos de ícone, 0,96 nas pílulas); no hover, o botão sobe 1px em 250 ms (`.btn:hover` do pacote do DS). Gatilhos que abrem popover respondem com cor, não com escala.
3. **Interrompível:** estado muda por `transition`, não por timeline. Reabrir um menu no meio do fechamento volta de onde está.
4. **Sair é mais rápido que entrar:** popover entra em 240 ms e sai em 140 ms; modal entra na mola `smooth` e sai em 180 ms.
5. **Um efeito pesado por página, no máximo:** o cristal animado no início, a paisagem no login. Nada de fundo animado nas outras telas.
6. **Movimento reduzido:** sem deslocamento, escala, laço ou desfoque. Ficam fades de 120 a 160 ms; números e barras pulam direto para o valor final. Única exceção: o indicador de carregamento continua girando, mais devagar (1,6 s), e só enquanto algo carrega, porque é a informação de progresso (o WCAG 2.3.3 isenta movimento essencial); escondido dentro do botão, ele fica parado. `?movimento=reduzido` liga o mesmo ramo para verificar sem mudar a preferência do sistema (resultado em 05-handoff.md).

## 2. Tokens de movimento

Os presets do Arc (`components/arc/lib/motion-tokens.ts`) viraram tokens em `tokens.css`, ao lado das curvas do DS:

| Token | Valor | Uso no Prisma |
|---|---|---|
| `--spring-morph` / `--dur-spring-morph` | mola 0,42 s, bounce 0,16 → `linear()` de 650 ms (0,8% de passagem) | Indicador que desliza: segmentos e abas |
| `--spring-smooth` / `--dur-spring-smooth` | mola 0,4 s, bounce 0 → `linear()` de 650 ms (sem passagem) | Modal, folha lateral, gaveta do celular, medidor, toast, paleta de busca |
| `--spring-snappy` / `--dur-spring-snappy` | mola 0,26 s, bounce 0,12 → `linear()` de 380 ms | Interruptor, soltar o clique |
| `--dur-instant/fast/exit/standard/considered` | 120 / 160 / 180 / 240 / 480 ms | Cor e opacidade; saídas; entradas pequenas |
| `--ease-out` (DS) | `cubic-bezier(.23,1,.32,1)` | Cor, borda, sombra; reserva das molas sem `linear()` |
| `--ease-spring` | passa 4,3% do alvo | **Só lúdico** (coração ao favoritar, check que estala). Nunca em indicador de estado |

Sem suporte a `linear()`, as molas caem nas curvas do DS (`--ease-drawer` e `--ease-out`).

## 3. Componentes adotados

| Componente Arc | Onde no Prisma | Adaptação (tokens do DS, tema claro) |
|---|---|---|
| **Morph select** | Seletor de modelo no composer e no criador de agente | Popover que abre a partir do gatilho e, no composer, **para cima** (o gatilho fica embaixo). Destaque segue o ponteiro; teclado completo (↑↓, Home/End, PageUp/PageDown de 8, type-ahead, Esc devolve o foco). Busca só acima de 8 modelos. Grupos "Automático" e "Outros modelos" (o grupo lembra se estava aberto). Selo de custo relativo (1 a 3 $) calculado do `priceOut` real |
| **Morph select de campo** | Todo `<select class="select">`: filtros da galeria (origem, ordem), ordem de projetos, agrupar no admin de uso, modelo padrão e modalidade no admin de modelos, "Aplica a" no admin de usuários | Entra sozinho (`ui.js`), inclusive em modais e gavetas; o `<select>` nativo fica escondido e segue dono do valor (`change` sai dele; `.value = x` por código atualiza o gatilho). O gatilho cresce até virar a lista (largura, altura e raio 8 → 12 em `--spring-morph`), cobrindo o próprio gatilho; sem espaço embaixo, cresce para cima; perto da borda direita, para a esquerda. Destaque único desliza entre as opções; o valor novo rola no gatilho na direção da lista. Teclado de combobox: o foco fica no gatilho com `aria-activedescendant`; ↑↓, PageUp/PageDown de 8, Home/End, type-ahead (também com a lista fechada), Enter/Espaço escolhe, Alt+↑ escolhe e fecha, Esc fecha sem fechar o modal, Tab fecha e segue. Linhas de 44 px no toque. Movimento reduzido: só opacidade |
| **Seletor de data** | Todo `<input type="date" class="input">`: período "De" e "Até" no admin de uso | Entra sozinho (`ui.js`), como o morph select de campo; o input nativo fica escondido e segue dono do valor (`AAAA-MM-DD`; `change` sai dele; `.value = x` por código atualiza o gatilho; `min`/`max` riscam os dias de fora). Gatilho com a cara do `.input` (ícone de calendário + "30 set. 2026"), que espelha `aria-invalid` e a mensagem de erro do campo. O painel `.mselect-pop` nasce do gatilho e cresce até o calendário logo abaixo (raio 8 → 12 em `--spring-morph`; sem espaço, acima) e volta para ele ao fechar. Mês de 6 semanas fixas, de domingo a sábado, em pt-BR; o título do mês rola e os dias entram pelo lado da troca. Destaque único (`.mselect__hl`) desliza em duas dimensões até o dia ativo ou o dia sob o ponteiro; escolhido em `--cta-from` com texto branco (5,6:1), hoje com um ponto. Teclado de grade (APG date picker): o foco entra no dia; setas movem o dia (e trocam o mês na borda), PageUp/PageDown trocam o mês (Shift: o ano), Home/End vão ao domingo e ao sábado da semana, Enter/Espaço escolhe, Esc fecha sem fechar o modal e devolve o foco, Tab circula entre as setas do mês, o dia e "Hoje". Dias de 44 px no toque. Movimento reduzido: só opacidade |
| **Sugestões de campo** | Categorias do agente e da skill (`<input list>`) | Troca a lista do navegador por um painel do DS na largura do campo, com o mesmo destaque. Abre no foco e filtra pelo que foi digitado; ↑↓ navegam, Enter usa a ativa (no agente, vira etiqueta), Esc fecha |
| **Segmented control** + **Tabs** | Agentes/Skills na galeria, Explorar/Favoritos, atalhos de período no admin, abas do admin de usuários | Indicador único que desliza em `--spring-morph`. O ativo é **superfície branca com sombra** (regra do DS claro), não cor. Setas, Home e End trocam de aba |
| **Seção que recolhe** (receita de movimento e ARIA do Accordion do Arc, mas independentes) | Projetos e Recentes na barra lateral | Título é um botão com `aria-expanded`; a seta gira −90° em 160 ms; o corpo fecha por `grid-template-rows` 1fr → 0fr em 240 ms `--ease-out`, interrompível, e fica `inert` fechado. Estado lembrado. Sem animação ao carregar. Substituiu o destaque que deslizava entre os itens: nenhuma referência de chat usa, e o hover estático é mais sóbrio |
| **Scroll area com borda que some** (Arc) | Fim da lista da barra lateral | Véu de 56px com degradê até o zinco e desfoque de 5px, com opacidade presa à rolagem que falta (`--more-below`); some no fim da lista. No topo, véu curto sem desfoque. Sem desfoque com transparência reduzida; com cores forçadas vira borda |
| **Toast stack** | Todas as confirmações | Posição e aparência do `.toast` do pacote do DS (embaixo no centro, escuro com borda do acento); empilhamento do Arc: os de trás sobem 14px e encolhem 5% cada; 3 visíveis. 5 s padrão, 8 s para erro e para toast com ação ("Desfazer"). Pausa ao passar o ponteiro. Todo toast tem × para fechar na hora. Ícone de sucesso desenha o check |
| **Action button** (pendente → sucesso no botão) | Salvar perfil, skill, agente, projeto, modelo, teto; enviar NPS | O rótulo some por opacidade e o indicador entra no lugar, **sem mudar a largura**. Sucesso desenha o check e volta em 1,4 s. Erro devolve o botão e mostra toast vermelho com a causa |
| **Dialog** | Confirmações, criar projeto, renomear, NPS | Sobe 8px a partir da escala 0,96 na mola `smooth`; fundo `rgb(24 24 27 / .45)` (o do DS claro) com desfoque de 4px; foco preso; Esc fecha; o foco volta ao gatilho |
| **Drawer** | Editar modelo e criar modelo (admin), editar teto de usuário, editar contexto do projeto no celular | Folha lateral de 520px que entra na mola `smooth` e sai em 250 ms. A lista continua visível atrás: edita-se sem perder o lugar |
| **Popover** e **Dropdown menu** | Menus de ação, créditos, conta, menu + do composer | Assenta de 5px a 0,97; sai em 140 ms. Setas, Home e End; Tab fecha; clique fora fecha |
| **Tooltip** | Botões de ícone, barra recolhida | Abre em 250 ms; se outra dica abriu há menos de 300 ms, abre na hora |
| **Command palette** | Buscar (nova busca global) | Grupos Ações, Conversas, Projetos, Seus agentes, Suas skills, Galeria, Páginas; termo destacado; vazio oferece "Novo chat com o termo" |
| **Skeleton** + **Text shimmer** | Toda lista e tabela enquanto carrega; "Pensando…" no chat | Esqueleto com o formato real do conteúdo; brilho que varre em 1,4 s. "Pensando…" com brilho de 1,8 s |
| **Usage meter** | Créditos no popover da conta; gasto contra teto no admin | Barra que cresce da esquerda na mola `smooth`; âmbar acima de 70% e vermelho acima de 90% (regra do Prisma, mais cedo que os 90% do Arc); número que rola |
| **Slot text / Animated counter** | KPIs do admin, % de créditos | Cada dígito é uma coluna 0–9 que rola até o valor em 0,9 s, 70 ms entre dígitos |
| **Sortable data table** | Admin: modelos, usuários, custo por modelo | Cabeçalho fixo, `aria-sort`, seta que gira; linha clicável abre a folha lateral |
| **Expanding button group** (versão sóbria: `floating-button-group`) | Ações de cada resposta da IA | Barra de ícones com dica e `role="toolbar"`; copiar vira check por 1,4 s. Não usei rótulos que crescem: no chat, eles disputariam atenção com a resposta |
| **Copy button / Icon morph** | Copiar mensagem, copiar instruções, copiar link | O ícone troca para check com escala e volta em 1,4 s |
| **Inline edit** | Renomear conversa ou projeto na barra lateral e o título do chat | Enter salva, Esc cancela, perder o foco salva |
| **Accordion** | Raciocínio da IA, seções avançadas do editor de modelo | A mecânica do `.faq-item` do DS (`grid-template-rows` 0fr → 1fr em 350 ms) |
| **Switch** | Ligar e visível no admin, publicar agente | Bolinha anda na mola `snappy` e se alarga ao pressionar |
| **Chip group** | Categorias na galeria, filtros de status no admin | Pílulas que rolam para o lado no celular; selecionada em tinta |
| **Multi-select** (máx. 5) | Skills no composer e no agente | Contador "2 de 5"; ao chegar no limite, as outras ficam desabilitadas com a dica do porquê |
| **File dropzone** | Arquivos do projeto e do agente | Borda tracejada que vira acento ao arrastar por cima; estados enviando, pronto e erro por arquivo |
| **Chat thread + Composer** | Conversa | Mensagem nova sobe 8px do seu lado; composer cresce até ~10 linhas; anexos em cartões acima do texto |

## 4. O que é nosso (sem componente gratuito equivalente)

- **Streaming de texto:** palavras entram por opacidade (80 ms cada), sem desfoque, para não cansar em respostas longas.
- **Estrelas de avaliação:** passar o ponteiro pré-visualiza a nota; clicar fixa; setas mudam; anúncio em região viva.
- **Enviar / parar:** o mesmo botão troca o ícone (seta → quadrado) com troca cruzada de 160 ms, sem mudar de lugar.
- **Coração ao favoritar:** pulso de 1,28× em `--ease-spring` e seis partículas curtas. É o único uso lúdico de mola com passagem.
- **Ícone que se desenha no clique** (`motion.js` · `draw`, regras em `motion.css`): ao clicar num item com ícone (barra lateral, botões, menus), o ícone se constrói traço a traço, como uma caneta, sobre um contorno fraco dele mesmo (20%), para não piscar vazio. Cada traço leva 420 ms em `cubic-bezier(.65, 0, .35, 1)`, com 70 ms entre traços e no máximo 640 ms no total. Formas preenchidas aparecem por opacidade. Só movimento, sem cor. Dispara com mouse e toque (teclado não anima) e não recomeça enquanto desenha. Na navegação da barra lateral, a página nova desenha o ícone do item ativo, porque a troca de página corta o desenho. **Pressionar:** o ícone encolhe para 0,88 em 90 ms e volta em 160 ms; onde o botão inteiro já encolhe (`.icon-btn`, `.btn`, atalhos, chips) o ícone fica parado. O + do composer gira 135° e vira × enquanto o menu está aberto. Chevrons de abrir/fechar, enviar e favorito mantêm o movimento próprio; não se desenham os utilitários: buscar e recolher no topo da barra lateral, o + de Projetos e Recentes e as ferramentas do composer (adicionar, anexar, modelo). Com movimento reduzido, nada disso roda.

## 5. Itens Pro (não usados)

Vistos só pela descrição pública do catálogo, sem ler nem reconstruir código: `ai-chat` (bloco), `prompt-input` avançado,
`model-picker` Pro e blocos de dashboard. Nada no Prisma depende deles.
