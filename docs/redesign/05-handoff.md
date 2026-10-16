# 05 · Handoff

Redesenho completo do front do Asimov Prisma no tema claro do Asimov Design System, na branch `redesign/v2` (local; não enviada).
As 16 telas foram refeitas (estrutura, fluxos e interações, não só visual), mais o índice `telas.html` e a vitrine `componentes.html`.

## Como revisar

```bash
python3 -m http.server 4180
```

Abra `http://localhost:4180/telas.html`. Cada tela tem atalhos para os estados ("Carregando", "Vazio", "Erro", "Erro ao salvar").
Em qualquer URL: `?estado=carregando|vazio|erro|erro-salvar` e `?movimento=reduzido`. Também funciona via `file://` e em subpasta.

## QA (fase 6): o que foi verificado e como

A verificação final foi refeita inteira **depois da última mudança de cor e de movimento**, com os scripts versionados em `qa/`
(como rodar: README, seção QA). Evidências brutas: [`qa/relatorio-qa.json`](qa/relatorio-qa.json) e
[`qa/foco-teclado.json`](qa/foco-teclado.json).

| Verificação | Método | Resultado |
|---|---|---|
| **Contraste AA** | `qa/?auto`: todo texto visível de cada tela contra o fundo real (inclui degradê e placeholder; desabilitado é isento pelo WCAG 1.4.3), 17 telas em 375, 390 e 1280px | **3.619 textos medidos, 0 abaixo de 4,5:1**. Corrigidos ao longo do QA: secundário sobre o zinco (4,4 → 5,2:1), placeholder (2,6 → 4,8:1), texto do login, segmentos (4,4 → 5,2:1), iniciais dos avatares (1,9–4,0 → ≥ 5,5:1), descrição do cartão de opção marcado (4,45 → 7,1:1) |
| **Foco visível** | Foco real do teclado (Tab pela ferramenta do navegador, `document.hasFocus()` verdadeiro) e depois `qa/focus-check.js`, que foca cada elemento com transições desligadas e exige anel de 2px ou mudança de sombra/borda no elemento ou no contêiner visual. 17 telas em 375, 390 e 1280px | **51 combinações, 1.869 elementos focáveis, 0 sem anel**. Anel: 2px em `--accent-dark` (3,7:1 contra o branco, acima dos 3:1 do WCAG 1.4.11), afastado 3px |
| **Movimento reduzido, por tela** | `?movimento=reduzido` liga o mesmo ramo de `prefers-reduced-motion`. `getAnimations()` procura qualquer `transform` ou desfoque rodando, com a tela parada e depois com modal e toast abertos | **17 de 17 telas sem nada se deslocando**. Modal `dialog-in 650ms` → `fade-in 160ms`; toast sem `transform`; molas 650 ms → 0 ms; saudação sem palavras animadas; KPI mostra o valor final; esqueleto sem brilho. O indicador de carregamento só gira enquanto carrega (1,6 s) e fica parado quando escondido no botão: exceção deliberada, é a informação de progresso (WCAG 2.3.3) |
| **Formulários inválidos e válidos** | 12 cenários automáticos em 10 telas (relatório, `formularios`) | **12 de 12**. Skill e agente: enviar vazio marca cada campo com `aria-invalid` e mensagem, preencher conclui; agente: publicar sem descrição é barrado. Projetos: criar só com nome. Contexto do projeto e perfil: salvar só com mudança. Apagar conta: só com "APAGAR" completo. Modelo: vazio e valores inválidos (chave com espaço, preço negativo, JSON quebrado) barrados, válido cria. Teto: negativo e semana maior que o mês barrados; origem muda para "Teto próprio". Política: vazio barrado, válido cria. Uso: período invertido barrado. Chat: enviar só com texto. NPS: enviar só com nota. Galeria: filtro sem resultado mostra o vazio com "Limpar" |
| **Estouro lateral** | `scrollWidth` contra a largura, 17 telas em 375, 390 e 1280px; mais 7 telas em 768px | **0 estouros** |
| **Erros de console** | Capturados nas 51 combinações e nos 12 cenários; antes, 20 URLs (criar e editar incluídos) | **0 erros**; todas as telas com `h1` |
| Estados | 27 URLs com `?estado=` e `?vazio=1`, mais "não encontrado" (`projeto.html?id=nao-existe`, `galeria-item.html?id=x`) | Esqueleto, vazio de primeira vez, vazio por filtro, erro com "Tentar de novo" e 404 renderizam |
| Teclado (fluxos) | Primeiro Tab mostra "Pular para o conteúdo"; ⌘K (evento real) → digitar "black" → Enter abre o projeto; gaveta do celular (foco entra, Esc fecha, foco volta, conteúdo atrás `inert`); menus com setas, Home, End e Esc; abas com setas | OK |
| Erros recuperáveis | `?estado=erro-salvar`: chat (faixa no composer, texto mantido), perfil (botão volta, toast, valor mantido) | OK |
| Subdiretório (pedido do `AGENTS.md` do DS) | App servido em `/apps/prisma/` | 7 folhas, 3 fontes e todas as imagens carregam; links relativos |
| Referências por tela | `search_screens`, `search_flows` e `search_sections` (web) para cada tela | [02-referencias.md](02-referencias.md): 264 links do Mobbin; Partes A–C (telas) e D (fluxos e seções) |
| Consistência com as referências | Item a item contra o "Padrão adotado" de cada tela | [06-verificacao-referencias.md](06-verificacao-referencias.md): 116 itens, 88 feitos, 12 parciais, 16 fora (15 por falta de dado no contrato, 1 por decisão registrada) |
| Fidelidade ao DS | Regras do `AGENTS.md` do pacote conferidas uma a uma | [01-design-system.md](01-design-system.md) §2–§4 |

## Commits (pequenos, por camada ou tela)

Fase 0 em `main` (`6de25af`). O resto em `redesign/v2`, uma tela por commit; nenhum commit mistura telas.

| Commit | Camada ou tela |
|---|---|
| `f78a515` | DS: tokens, componentes base, shell |
| `7941745` | Fase 2: referências do Mobbin |
| `53a6e62` | Fases 3 e 4: interações (UI Arc), arquitetura e fluxos |
| `aee11ff` | Composer |
| `27bb345` | Início |
| `b872cc2` | Conversa |
| `6f26bb9` | Projetos e projeto |
| `9c19c4b` | Skills (lista e editor) |
| `f6c1800` | Agentes (lista e criador) |
| `aa3a300` | Galeria e item |
| `21c55dc` | Shell: barra lateral do admin |
| `b2a7ae5` | Admin: modelos |
| `868090b` | Admin: uso |
| `1009ca5` | Admin: usuários |
| `6f34784` | Configurações |
| `7c64af1` | Login |
| `1c16899` | Índice de telas e vitrine |
| `feb92bb` | Correção: seletor `[data-title]` |
| `b47bf26` | QA: contraste no zinco, celular, mensagens de erro |
| `d860316` | Handoff, README, gerador de ícones |
| `4917042` | Login: imagem de fundo |
| `a587eb3` | DS: alinhamento ao pacote oficial |
| `c4a48da` | Conversa: Mostrar mais |
| `3f3aabd` | Shell e início: Administração, Criar imagem, grupos do admin |
| `edf9ce9` | Skills: toast com Usar numa conversa |
| `ebb46af` | Agentes: faixa Baseado em exemplo |
| `39331df` | Admin: modelos (Desfazer, linha esmaecida, link direto) |
| `e6c993a` | Admin: usuários (Perto do teto) |
| `39c81ea` | QA: avatares, segmentos, verificação item a item |
| `96490cf` | Componentes: contraste do cartão de opção marcado |
| `1c5468e` | Componentes: indicador de carregamento só gira enquanto carrega |
| `013100e` | Shell: Ver todas as conversas |
| `ac8fb4a` | Referências: Parte D (fluxos e seções) |
| `aa815d0` | QA: verificação automática em `qa/` |
| (este) | Evidências do QA final e documentação |

## Pendências

### Para integrar no app de produção
1. **API real.** Tudo passa por `Prisma.api.get/send` (`assets/js/core.js`). Trocar o `resolve()` por `fetch`, mantendo os endpoints `/v1/...` e o formato de `data.js`.
2. **Streaming.** `streamReply()` em `assets/js/pages/chat.js` simula o stream; trocar pelo da API mantendo `.prose` e `.tok`.
3. **Persistência.** O que se cria no protótipo vive só na página aberta; com a API real isso some.
4. **Campos que o contrato ainda não tem** e que destravam itens "parciais" ou "fora" da verificação: duração do raciocínio (`reasoningMs`), gasto do dia nos créditos, trecho da última mensagem da conversa, data de criação do projeto, conversas fixadas, avaliações por nota, custo por dia e por modelo; e, da Parte D, sugestões de continuação depois da resposta, versões de resposta ao refazer, projeto de exemplo e status de processamento de arquivo.
5. **Componentes React.** Ordem sugerida: tokens → `Button`/`IconButton` → `Field` → `Popover`/`Menu` → `Dialog`/`Sheet`/`Toast` → `Composer` → `ModelPicker` → shell.

### Dados de exemplo (do staging)
6. Projetos dizem "14" e "5 conversas", mas só uma conversa está ligada a projeto (`p1`). O detalhe mostra o que a lista tem.
7. O fio de conversa é sempre o mesmo (`thread`); `chat.html?id=nova` recarregada mostra esse fio.

### Decisões tomadas com autonomia (registradas para quem quiser revisar; nenhuma bloqueia nada)
8. Tema de acento **Ciano** (um dos oito do DS) em vez do Teal padrão, por casar com o cristal do logo. Trocar = quatro variáveis.
9. Admin como contexto próprio, com barra lateral agrupada (Visão geral, Catálogo, Pessoas) e "Voltar ao Prisma".
10. "Atalhos" no perfil virou "Atalhos de teclado" (os links rápidos já estão na barra lateral e no menu da conta).
11. Custo relativo ($ a $$$) no seletor de modelo, a partir do `priceOut`.
12. Selo de créditos no composer acima de 70% da semana; medidor âmbar em 70% e vermelho em 90%.
13. Criar projeto pede nome e contexto; arquivos entram dentro do projeto.
14. Ícones Solar (do repositório do DS) em vez dos traços próprios do pacote, pelo tamanho do conjunto.
15. "Ver todas as conversas" abre a paleta só com conversas, em vez de uma página nova de histórico: mesma busca, mesmo teclado.
16. Editor de skill sem barra de formatação: instruções são texto corrido; Markdown funciona e "Visualizar" mostra o resultado.
17. Indicador de carregamento continua girando com movimento reduzido (mais devagar), por ser a única pista de progresso.

### Técnico
18. Molas em `linear()`: Chrome 113+, Firefox 112+, Safari 17.2+; abaixo disso, as curvas do DS assumem.
19. View Transitions entre páginas: Chrome e Safari 18+; nos outros, troca direta.
20. Ícone novo: `scripts/vendor-icons.py` (tem o mapa de nomes) ou desenho no mesmo traço.

## Documentos

| Documento | Conteúdo |
|---|---|
| [00-inventario.md](00-inventario.md) | Domínio, rotas, contratos, regras de negócio, fluxos, componentes e problemas do front anterior |
| [01-design-system.md](01-design-system.md) | Onde estão os arquivos do DS, regras do `AGENTS.md`, tokens e componentes portados, contraste |
| [02-referencias.md](02-referencias.md) | 264 links do Mobbin por tela (telas, fluxos e seções), com o padrão adotado |
| [03-interacoes.md](03-interacoes.md) | Componentes e movimento do UI Arc adotados, com os números |
| [03b-ui-arc-pesquisa.md](03b-ui-arc-pesquisa.md) | Pesquisa completa no MCP do UI Arc |
| [04-ia-fluxos.md](04-ia-fluxos.md) | Navegação, hierarquia, fluxos antes/depois, estados, busca, atalhos, responsividade |
| [06-verificacao-referencias.md](06-verificacao-referencias.md) | Verificação item a item contra as referências |
| [qa/](qa/) | Relatório do QA automático e do foco com teclado real |
