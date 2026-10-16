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

| Verificação | Método | Resultado |
|---|---|---|
| Erros de console | 20 URLs (todas as telas, criar e editar) abertas em sequência, com captura de `error` | 0 erros; todas com `h1` |
| Estados | 27 URLs com `?estado=` e `?vazio=1`, mais "não encontrado" (`projeto.html?id=nao-existe`, `galeria-item.html?id=x`) | Esqueleto, vazio de primeira vez, vazio por filtro, erro com "Tentar de novo" e 404 renderizam |
| 1280px | Captura de cada tela | OK. Tabelas do admin cabem sem rolagem lateral; painéis de uso empilham abaixo de 1400px |
| 768px | Largura de rolagem de 7 telas | 0 estouros |
| 390px (375 emulado) | Captura das telas principais + `scrollWidth` de 17 telas | 0 estouros (depois das correções: listas do início, cartão de skills, dica do gráfico, modelo padrão, busca da galeria, barra do editor) |
| Teclado | Primeiro Tab mostra "Pular para o conteúdo"; ⌘K (evento real) → digitar "black" → Enter abre o projeto; gaveta do celular (foco entra, Esc fecha, foco volta, conteúdo atrás `inert`); menus com setas, Home, End e Esc; abas com setas | OK |
| **Movimento reduzido** | `?movimento=reduzido` liga o mesmo ramo de `prefers-reduced-motion` (CSS duplicado sob `html.reduce-motion` + `Prisma.reduced`). Estilos computados comparados com o modo normal | Modal `dialog-in 650ms` → `fade-in 160ms`; toast sem `transform`; saudação sem palavras animadas (6 → 0); molas `650ms` → `0ms`; barras do gráfico sem animação; KPI mostra o valor final ("R$ 1,83") em vez de rolar; esqueleto sem brilho; indicador dos segmentos `0.65s` → `0s` |
| Formulário inválido e válido | Skill e agente: enviar vazio → erro embaixo de cada campo, `aria-invalid`, foco no primeiro; preencher → carregando → concluído + toast. Agente: publicar sem descrição é barrado | OK |
| Erros recuperáveis | `?estado=erro-salvar`: chat (faixa no composer, texto mantido), perfil (botão volta, toast, valor mantido) | OK |
| Contraste AA | Script que mede cada texto visível contra o fundo real (inclui fundo em degradê) em 9 telas, antes e depois do alinhamento ao DS | Corrigidos: secundário sobre o zinco (4,4 → 5,2:1), placeholder (2,6 → 4,8:1), texto do login (véu escuro), segmentos (4,4 → 5,2:1), iniciais dos avatares (1,9–4,0 → ≥ 5,5:1). Releitura final: 0 pares abaixo de 4,5:1 em avatares, segmentos, botões, abas, navegação, selos e toasts |
| Foco visível | `:focus-visible` com anel de 2px em `--accent-dark` (3,7:1), afastamento de 3px; campos com anel de 3px | OK |
| Subdiretório (pedido do `AGENTS.md` do DS) | App servido em `/apps/prisma/` | 7 folhas, 3 fontes e todas as imagens carregam; links relativos |
| Consistência com as referências | Item a item contra o "Padrão adotado" de cada tela | [06-verificacao-referencias.md](06-verificacao-referencias.md): 106 itens, 84 feitos, 11 parciais e 11 fora por falta de dado no contrato |
| Fidelidade ao DS | Regras do `AGENTS.md` do pacote conferidas uma a uma | [01-design-system.md](01-design-system.md) §2–§4 |

## Commits (pequenos, por camada ou tela)

| Commit | Camada |
|---|---|
| `6de25af` | Fase 0: inventário |
| `f78a515` | Fase 1: tokens, componentes base, shell |
| `7941745` | Fase 2: referências do Mobbin |
| `53a6e62` | Fases 3 e 4: interações (UI Arc), arquitetura e fluxos |
| `7922efc` | Tela: início, conversa, composer |
| `a42b45b` | Tela: projetos e projeto |
| `41ff859` | Telas: agentes e skills (listas e editores) |
| `e707166` | Tela: galeria e item |
| `39ecf08` | Telas: admin (3) e configurações |
| `97cd108` | Login, índice, vitrine; correção de seletor |
| `2f35243` | QA: contraste e celular |
| `617729f` | Handoff, README, gerador de ícones |
| `debebbe` | Correção do login |
| `affa71e` | Alinhamento ao pacote oficial do DS |
| `0602328` | Padrões restantes das referências |
| (este) | QA final: contraste dos avatares e segmentos, verificação item a item, documentação |

## Pendências

### Para integrar no app de produção
1. **API real.** Tudo passa por `Prisma.api.get/send` (`assets/js/core.js`). Trocar o `resolve()` por `fetch`, mantendo os endpoints `/v1/...` e o formato de `data.js`.
2. **Streaming.** `streamReply()` em `assets/js/pages/chat.js` simula o stream; trocar pelo da API mantendo `.prose` e `.tok`.
3. **Persistência.** O que se cria no protótipo vive só na página aberta; com a API real isso some.
4. **Campos que o contrato ainda não tem** e que destravam itens "parciais" ou "fora" da verificação: duração do raciocínio (`reasoningMs`), gasto do dia nos créditos, trecho da última mensagem da conversa, data de criação do projeto, conversas fixadas, avaliações por nota, custo por dia e por modelo.
5. **Componentes React.** Ordem sugerida: tokens → `Button`/`IconButton` → `Field` → `Popover`/`Menu` → `Dialog`/`Sheet`/`Toast` → `Composer` → `ModelPicker` → shell.

### Dados de exemplo (do staging)
6. Projetos dizem "14" e "5 conversas", mas só uma conversa está ligada a projeto (`p1`). O detalhe mostra o que a lista tem.
7. O fio de conversa é sempre o mesmo (`thread`); `chat.html?id=nova` recarregada mostra esse fio.

### Decisões tomadas (registradas para revisão de produto, não bloqueiam nada)
8. Tema de acento **Ciano** (um dos oito do DS) em vez do Teal padrão, por casar com o cristal do logo. Trocar = quatro variáveis.
9. Admin como contexto próprio, com barra lateral agrupada (Visão geral, Catálogo, Pessoas) e "Voltar ao Prisma".
10. "Atalhos" no perfil virou "Atalhos de teclado" (os links rápidos já estão na barra lateral e no menu da conta).
11. Custo relativo ($ a $$$) no seletor de modelo, a partir do `priceOut`.
12. Selo de créditos no composer acima de 70% da semana; medidor âmbar em 70% e vermelho em 90%.
13. Criar projeto pede nome e contexto; arquivos entram dentro do projeto.
14. Ícones Solar (do repositório do DS) em vez dos traços próprios do pacote, pelo tamanho do conjunto.

### Técnico
15. Molas em `linear()`: Chrome 113+, Firefox 112+, Safari 17.2+; abaixo disso, as curvas do DS assumem.
16. View Transitions entre páginas: Chrome e Safari 18+; nos outros, troca direta.
17. Ícone novo: `scripts/vendor-icons.py` (tem o mapa de nomes) ou desenho no mesmo traço.

## Documentos

| Documento | Conteúdo |
|---|---|
| [00-inventario.md](00-inventario.md) | Domínio, rotas, contratos, regras de negócio, fluxos, componentes e problemas do front anterior |
| [01-design-system.md](01-design-system.md) | Onde estão os arquivos do DS, regras do `AGENTS.md`, tokens e componentes portados, contraste |
| [02-referencias.md](02-referencias.md) | 159 referências do Mobbin por tela, com o padrão adotado |
| [03-interacoes.md](03-interacoes.md) | Componentes e movimento do UI Arc adotados, com os números |
| [03b-ui-arc-pesquisa.md](03b-ui-arc-pesquisa.md) | Pesquisa completa no MCP do UI Arc |
| [04-ia-fluxos.md](04-ia-fluxos.md) | Navegação, hierarquia, fluxos antes/depois, estados, busca, atalhos, responsividade |
| [06-verificacao-referencias.md](06-verificacao-referencias.md) | Verificação item a item contra as referências |
