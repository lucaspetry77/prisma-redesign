# 04 · Arquitetura de informação e fluxos

As rotas não mudam (ver 00-inventario.md, seção 3). O que muda é como se chega a elas, o que cada tela prioriza e quantos passos cada tarefa leva.

## 1. Navegação

### Barra lateral do Prisma (aluno e admin)

```
[Asimov · Prisma]                  [recolher ⌘\]
✎ Novo chat                        ⌘⇧O
⌕ Buscar                           ⌘K
───────────
▢ Projetos
☺ Agentes
ϟ Skills
▦ Galeria
───────────
Recentes
  Ontem
    Quero criar um assistente…   ⋯
  02/10
    …
───────────
⛨ Administração                    (só ADMIN)
🎓 Cursos da Asimov ↗
Créditos da semana   3% usado ▁▁▁
(A) admin · admin@asimov.academy   ⇅
```

Decisões, com origem:
- **"Buscar" vira item de primeiro nível** (A.5, Langdock/ChatGPT). Abre a paleta ⌘K, que acha conversas, projetos, agentes, skills, itens da galeria e páginas. Resolve o problema 1 do inventário.
- **Ordem por frequência:** Projetos e Agentes antes de Skills; Galeria por último (descoberta, não uso diário).
- **Admin sai do meio da navegação** e vai para o rodapé, como "Administração" (C.4). Dentro de `/admin/*`, a barra lateral troca para a navegação do admin.
- **Recentes com cabeçalho fixo por dia** e menu ⋯ por conversa (renomear no lugar, mover para projeto, baixar, copiar link, apagar).
- **Créditos no rodapé**, compactos (barra + %), abrindo o detalhe (limite diário, semanal, renovação). A cor da barra muda em 70% e 90%.
- **Recolher** vira trilho de ícones com dicas à direita (⌘\). No celular, gaveta com fundo escurecido.

### Barra lateral do admin

```
← Voltar ao Prisma
Administração
  ▣ Modelos
  ▤ Uso e custo
  ◎ Usuários e tetos
```
Uma única troca de contexto, com volta explícita (C.4). Abas de "Usuários e tetos": **Usuários** | **Políticas de teto**, na mesma rota.

### Topo
- **Desktop:** sem barra de topo global. Cada tela tem cabeçalho próprio (título, ações).
- **Celular (< 900px):** topo fixo em vidro (o `.cadence-header__nav` claro do DS) com menu, título da tela e novo chat.

## 2. Hierarquia das telas

| Tela | Pergunta que responde | Primeiro na tela | Depois |
|---|---|---|---|
| Início | "O que eu quero fazer agora?" | Saudação + composer | Sugestões; "Continuar de onde parou" e "Seus agentes" |
| Conversa | "O que a IA respondeu?" | Fio de mensagens | Composer fixo embaixo; título e ações no topo |
| Projetos | "Onde está aquele assunto?" | Busca e ordenação | Cartões com contexto, conversas, arquivos e data |
| Projeto | "Vou conversar já com o contexto" | Composer do projeto + conversas | Coluna lateral: contexto e arquivos |
| Agentes | "Com quem eu converso?" | Seus agentes com "Conversar" | Favoritos da galeria; criar |
| Criar agente | "Como deixo o agente bom?" | Formulário por seções com índice | Teste ao vivo fixo à direita |
| Skills | "Quais instruções eu tenho?" | Suas skills | Atalho para as oficiais na galeria |
| Editor de skill | "O que a IA deve seguir?" | Instruções (o campo grande) | Dicas fixas à direita |
| Galeria | "Tem algo pronto para isso?" | Busca + tipo + categorias | Grade; favoritos em aba |
| Item | "Isso serve para mim?" | Nome, autor, ação principal | Instruções, avaliações, detalhes |
| Configurações | "Como o Prisma me trata?" | Sobre você (apelido e contexto) | Dados; zona de perigo no fim |
| Admin · Modelos | "O que o seletor oferece?" | Modelo padrão + tabela compacta | Folha lateral com todos os campos |
| Admin · Uso | "Quanto estamos gastando?" | Período + KPIs | Gráfico por dia, por modelo, alertas, eventos |
| Admin · Usuários | "Quem está perto do teto?" | Busca + filtro + tabela com barras | Folha lateral do teto; aba Políticas |

## 3. Fluxos críticos: antes e depois

| Fluxo | Antes | Depois | Como |
|---|---|---|---|
| Achar uma conversa antiga | Rolar a barra lateral (sem busca) | ⌘K + 2 letras + Enter | Paleta de comandos |
| Começar a conversar com um agente | Agentes → card → "Conversar" (3), ou + → agente → buscar → escolher (4) | Início → "Seus agentes" → agente (2), ou ⌘K → nome → Enter (2) | Atalhos no início e na paleta |
| Conversar dentro de um projeto | Projetos → projeto → rolar até o rodapé → digitar (4) | Projetos → projeto → digitar no composer do topo (3) | Composer no topo do projeto (B.2) |
| Criar projeto | Modal com 4 campos (nome, contexto, arquivos, cor Pós-MVP) | Modal só com nome e contexto → abre o projeto (arquivos lá dentro) | Pedir o mínimo e levar ao lugar certo (B.1) |
| Editar o modelo de IA (admin) | Rolar tabela de 18 colunas → Editar → modal cobre a lista | Clicar na linha → folha lateral com seções | Tabela compacta + drawer (C.1) |
| Trocar o modelo padrão (admin) | Achar a coluna "Padrão" → "Tornar padrão" na linha | Seletor "Modelo padrão" acima da tabela | C.1 (Twenty, Langdock) |
| Editar teto de um usuário | Botão na 12ª coluna → modal | Clicar na linha → folha com uso atual, teto efetivo e a cadeia de precedência | C.3 |
| Copiar uma skill da galeria | Galeria → filtro Skills → card → Copiar (3+) | ⌘K → nome → Enter → Copiar (2 após abrir) | Paleta + detalhe |
| Voltar ao último assunto | Barra lateral → procurar | Início → "Continuar de onde parou" | A.1 (Notion) |

## 4. Estados que ensinam

Regra: **"ainda não criou nada"** e **"nada combina com o filtro"** são estados diferentes (B.7).

| Lugar | Vazio de primeira vez | Vazio por filtro/busca |
|---|---|---|
| Projetos | O que é um projeto, em uma frase + "Criar projeto" + exemplo de contexto | "Nada encontrado para “x”" + Limpar busca |
| Projeto (conversas) | "Escreva acima para começar a primeira conversa deste projeto" | n/a |
| Projeto (arquivos) | O que entra aqui e os limites (20 arquivos, 30 MB, texto) + Adicionar | n/a |
| Agentes | Passos: 1. escolha um exemplo oficial, 2. ajuste as instruções, 3. teste antes de salvar + "Criar agente" e "Ver na galeria" | n/a |
| Skills | Três exemplos de regra que se repete ("responda em tópicos"…) + "Criar skill" | n/a |
| Galeria · Favoritos | "Toque no ♥ de um agente ou skill para guardar aqui" + Explorar | n/a |
| Galeria · Explorar | n/a | Termo buscado + um chip por filtro ativo para remover + "Limpar filtros" |
| Recentes (barra lateral) | "Suas conversas aparecem aqui" + link para novo chat | n/a |
| Admin · Uso | "Sem uso neste período" + atalho para 30 dias | n/a |
| Admin · Eventos | "Nenhum evento deste tipo no período" + Todos os eventos | idem |
| Admin · Usuários | n/a | "Ninguém encontrado com “x”" + Limpar |

## 5. Erros recuperáveis

- **Carregar falhou:** o erro aparece **no menor escopo possível** (o painel ou a lista, não a página), com a causa em uma frase e "Tentar de novo" (C.5.6). O resto da tela continua utilizável.
- **Gravar falhou:** o botão volta ao estado normal, o que foi digitado **não se perde**, e um toast vermelho diz o que fazer (8 s).
- **Enviar mensagem falhou:** faixa presa ao composer com "Tentar de novo"; a mensagem fica no campo (A.2.2).
- **Validação:** no envio (não enquanto a pessoa digita pela primeira vez), com a mensagem embaixo do campo, `aria-invalid` e foco no primeiro erro; depois do primeiro envio, revalida ao digitar.
- **Ação destrutiva:** três níveis (C.5.7): reversível → toast com "Desfazer" (favoritar); irreversível → confirmação que diz o impacto (apagar conversa, projeto, skill); irreversível e ampla → digitar a palavra (apagar conta: **APAGAR**).
- **Imagem + modelo que não lê imagens:** aviso no composer com o motivo e "Escolher modelo com imagens" (regra preservada).

Para revisar os estados sem backend: `?estado=carregando`, `?estado=vazio`, `?estado=erro`, `?estado=erro-salvar` em qualquer tela.

## 6. Busca

| Onde | O que busca | Comportamento |
|---|---|---|
| ⌘K (global) | Ações, conversas, projetos, agentes, skills, galeria, páginas | Sem acento e sem caixa; termo destacado; ↑↓ e Enter; vazio oferece "Novo chat com o termo" |
| Projetos | Nome e contexto | Filtra ao digitar; contador de resultados anunciado |
| Galeria | Nome, descrição e categoria (**nova**) | Combina com tipo, origem, categoria e ordem; filtros ativos viram chips removíveis |
| Admin · Usuários | Nome e e-mail | Filtra ao digitar + chips de situação com contagem |
| Menu + → agentes / skills | Nome e descrição | Busca no próprio painel |

## 7. Atalhos

| Atalho | Ação |
|---|---|
| ⌘K / Ctrl K | Buscar e ir para qualquer lugar |
| ⌘⇧O / Ctrl ⇧ O | Novo chat |
| ⌘\ / Ctrl \ | Recolher ou abrir a barra lateral |
| / | Focar o campo de mensagem (ou a busca da tela) |
| Enter · ⇧Enter | Enviar · quebrar linha |
| Esc | Fechar menu, janela, folha ou paleta (o de cima primeiro) |
| ? | Ver todos os atalhos |
| ↑ ↓ Home End | Navegar em menus, listas, paleta |
| ← → | Trocar de aba ou segmento |

Os atalhos aparecem nas dicas dos botões e nos itens de menu, para serem aprendidos no uso. A lista completa fica em "Atalhos de teclado", no menu da conta.

## 8. Responsividade

| Largura | Shell | Telas |
|---|---|---|
| **390px** (celular) | Topo fixo em vidro; barra lateral vira gaveta; painel sem margem | Uma coluna; filtros viram pílulas que rolam para o lado; tabelas do admin viram lista de cartões quando a coluna principal não cabe; teste do agente vira gaveta por um botão flutuante; composer ocupa a largura toda |
| **768px** (tablet) | Igual ao celular (gaveta) | Grades em 2 colunas; projeto com a coluna lateral abaixo do conteúdo |
| **≥ 900px** | Barra lateral fixa de 264px (ou trilho de 60px) | |
| **≥ 1280px** | | Grades em 3 colunas; projeto e item da galeria com coluna lateral; criar agente em duas colunas (formulário + teste) a partir de 1180px |

Alvos de toque de no mínimo 32px no desktop e 40px no celular. Nada de rolagem horizontal na página; só dentro de tabelas e de linhas de pílulas.
