# 05 · Handoff

Redesenho completo do front do Asimov Prisma no tema claro do Asimov Design System. Branch `redesign/v2`.
Todas as 16 telas foram refeitas (estrutura, fluxos e interações, não só visual), mais a vitrine `componentes.html`.

## Como revisar

```bash
python3 -m http.server 4180
```

Abra `http://localhost:4180/telas.html`. Cada tela tem atalhos para os estados (selos "Carregando", "Vazio", "Erro", "Erro ao salvar").
Também funciona via `file://`, sem build, sem dependências e sem CDN.

## O que foi verificado (fase 6)

| Verificação | Como | Resultado |
|---|---|---|
| Console sem erros | 27 URLs (todas as telas e estados) abertas em sequência | Nenhum erro |
| 1280px | Captura de cada tela | OK. Tabelas do admin cabem sem rolagem lateral (modelos e usuários foram compactados) |
| 768px | Largura de rolagem de 7 telas | Nenhum estouro |
| 390px (375px emulado) | Captura das telas principais + varredura de elementos que passam da borda | Corrigidos: listas do início, descrição do cartão de skills oficiais, dica do gráfico, cartão do modelo padrão, busca da galeria, barra do editor |
| Teclado | Tab inicial (link "Pular para o conteúdo"), ⌘K → digitar → Enter, gaveta do celular (foco entra, Esc fecha e devolve o foco), menus (setas, Home/End, Esc), abas (setas) | OK |
| Formulários válidos e inválidos | Skill e agente: enviar vazio → erros embaixo dos campos, `aria-invalid`, foco no primeiro; preencher → carregando → concluído + toast. Agente: publicar sem descrição é barrado | OK |
| Erros recuperáveis | `?estado=erro-salvar` no chat (faixa no composer, texto mantido) e no perfil (botão volta, toast, valor mantido); `?estado=erro` nas listas (painel de erro com "Tentar de novo") | OK |
| Contraste AA | Script que mede cada texto visível contra o fundo real, em 9 telas | Corrigido `--muted` sobre o zinco (4,4 → 5,2:1), placeholder (2,6 → 4,8:1) e o texto branco do login (véu escuro). Tabela de pares em 01-design-system.md §5 |
| Foco visível | `:focus-visible` com anel de 2px no acento; campos com anel de 3px | OK |
| Movimento reduzido | Regras carregadas (11) nas três folhas | **Não emulado no navegador** (a ferramenta de teste não força `prefers-reduced-motion`). Revisado no código: sem deslocamento, escala, laço ou desfoque; ficam fades curtos |
| Referências | Cada tela segue o "Padrão adotado" de 02-referencias.md; divergências registradas no topo daquele documento | OK |

## Pendências

### Para integrar no app de produção
1. **API real.** Tudo passa por `Prisma.api.get/send` em `assets/js/core.js`. Trocar o `resolve()` por `fetch` mantendo os endpoints `/v1/...` e o formato de `data.js`. As gravações (`send`) hoje só simulam sucesso.
2. **Streaming.** `streamReply()` em `assets/js/pages/chat.js` simula o stream palavra a palavra. Trocar pelo stream da API mantendo `.prose` e `.tok`.
3. **Persistência entre páginas.** O que é criado no protótipo (projeto, skill, agente, renomear) vive só na página aberta. Ao navegar, volta ao `data.js`. Com a API real, isso some.
4. **Duração do raciocínio** ("Pensou por 42s", padrão das referências): exige `reasoningMs` na mensagem. Hoje o rótulo é "Raciocínio".
5. **Componentes React.** As classes não dependem de tela. Ordem sugerida para virar componentes no Next.js: tokens → `Button`/`IconButton` → `Field` → `Popover`/`Menu` → `Dialog`/`Sheet`/`Toast` → `Composer` → `ModelPicker` → shell.

### Dados de exemplo inconsistentes (do staging)
6. Os projetos dizem "14 conversas" e "5 conversas", mas a lista de conversas só tem uma conversa ligada a projeto (`p1`). O detalhe do projeto mostra o que a lista tem. Na API real, os números batem.
7. O título da conversa vem de `conversations[].title`, mas o fio é sempre o mesmo (`thread`). `chat.html?id=nova` recarregada mostra esse fio de exemplo.

### Decisões que pedem validação de produto
8. **Admin como contexto próprio:** em `/admin/*` a barra lateral troca para a navegação do admin (02-referencias.md, C.4). Confirmar com quem usa o admin no dia a dia.
9. **"Atalhos" no perfil** virou "Atalhos de teclado". Os links rápidos de antes (cursos, projetos, agentes) já estão na barra lateral e no menu da conta.
10. **Custo relativo no seletor de modelo** (1 a 3 cifrões a partir do `priceOut`). Confirmar se o aluno deve ver custo relativo.
11. **Selo de créditos no composer** só acima de 70% da semana. Confirmar o limiar.
12. **Criar projeto** pede só nome e contexto; arquivos vão dentro do projeto (antes, o modal tinha a zona de arquivo e a cor Pós-MVP).

### Oportunidades vistas nas referências (fora do escopo, sem dados hoje)
13. Ramificar conversa, regenerar com outro modelo, "Perguntar ao Prisma" no ⌘K sem resultado.
14. Admin: comparar com o período anterior, exportar CSV, colunas configuráveis, paginação.
15. Galeria: distribuição de notas 5→1, "Também deste autor", itens da comunidade (hoje só existem oficiais).
16. Primeiro acesso: checklist de onboarding e projeto de exemplo.
17. Modo escuro: os tokens já estão organizados para receber a camada escura do DS (`modo-claro.css` é a inversa); não foi pedido.

### Técnico
18. A família Solar foi vendorizada por lista fixa (95 ícones). Para um ícone novo, rodar de novo o gerador (`scripts/vendor-icons.py`, que tem o mapa de nomes) ou desenhar no mesmo traço.
19. `linear()` (molas do Arc) tem suporte em Chrome 113+, Firefox 112+ e Safari 17.2+. Abaixo disso, as curvas do DS assumem.
20. View Transitions entre páginas só no Chrome e no Safari 18+; nos outros, a troca é direta.

## Documentos

| Documento | Conteúdo |
|---|---|
| [00-inventario.md](00-inventario.md) | Domínio, rotas, contratos, regras de negócio, fluxos, componentes e problemas do front anterior |
| [01-design-system.md](01-design-system.md) | O que veio do DS, o que foi derivado, contraste, como usar |
| [02-referencias.md](02-referencias.md) | 159 referências do Mobbin por tela, com o padrão adotado |
| [03-interacoes.md](03-interacoes.md) | Componentes e movimento adotados do UI Arc, com os números |
| [03b-ui-arc-pesquisa.md](03b-ui-arc-pesquisa.md) | Pesquisa completa no MCP do UI Arc |
| [04-ia-fluxos.md](04-ia-fluxos.md) | Navegação, hierarquia, fluxos antes/depois, estados, busca, atalhos, responsividade |
