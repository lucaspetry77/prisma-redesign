# 06 · Verificação contra as referências (item a item)

Cada linha é um item do "Padrão adotado no Prisma" de [02-referencias.md](02-referencias.md), conferido no código e no navegador
em 15/10/2026. **Feito** = implementado como descrito. **Parcial** = implementado com a diferença indicada. **Fora** = não
implementado, com o motivo (quase sempre: o contrato de dados não tem o campo, e inventar o dado seria métrica decorativa).

## Parte A · Chat

| Tela | Item adotado | Status | Onde / por quê |
|---|---|---|---|
| Início | Coluna central, saudação de uma linha com o símbolo do Prisma | Feito | `index.html`, `.home__center` (720px). Saudação em **Inter prata** e não em Instrument Serif: o `AGENTS.md` do DS diz que a serifa é legado |
| Início | Composer em card com toolbar `[+] [pills] … [modelo] [enviar]` | Feito | `composer.js` |
| Início | Placeholder que ensina "@ agentes · / prompts" | Fora | Não existe comando "@" nem "/" no produto. O placeholder escreve exemplos de pedido |
| Início | Até 6 chips que preenchem ou ativam, sem enviar | Feito | 3 sugestões do produto + "Criar imagem" (ativa o modo) |
| Início | Duas listas leves: "Continuar de onde parou" e "Seus agentes" | Feito | `home.js`; data relativa vem do grupo da conversa ("Ontem", "02/10") |
| Início | Cota no composer só perto do limite; aviso de 1 linha no rodapé | Feito | Selo acima de 70% da semana; "A IA pode errar…" |
| Início | Vazio com sugestões mantidas; checklist de primeiro acesso | Parcial | Vazio feito (`?estado=vazio`); checklist fora (sem dado de onboarding) |
| Conversa | Bubble do usuário à direita (até ~75%), anexos acima; IA em prosa | Feito | `chat.css` `.msg--user`, `.msg__files` |
| Conversa | Raciocínio colapsado; "Pensando…" durante o streaming | Parcial | Rótulo "Raciocínio" (o contrato não traz a duração para "Pensou por 42s") |
| Conversa | Modelo que respondeu visível; ações copiar · 👍 · 👎 · refazer | Feito | Modelo no topo da resposta (avatar + nome); ações sempre visíveis na última |
| Conversa | Menu ⋯ da resposta (regenerar com outro modelo, ramificar, detalhes) | Fora | Não existe no produto nem no contrato |
| Conversa | Botão ↓ para voltar ao fim, visível só fora do fim | Feito | `.scroll-down` |
| Conversa | Enviar vira parar no mesmo lugar; status textual | Feito | `send-btn.is-stop`; "Pensando…" com brilho |
| Conversa | Eventos do sistema como divisor centralizado | Feito | "Modelo trocado para …" |
| Conversa | Limite de créditos como evento no fio | Fora | Nenhum usuário perto do limite nos dados; o medidor e o selo do composer cobrem o aviso |
| Conversa | Erro em faixa no composer, sem perder a mensagem | Feito | `composer.showError`, verificado com `?estado=erro-salvar` |
| Conversa | Cabeçalho com breadcrumb do projeto + título ▾ com menu | Feito | `chat-head`; renomear no lugar, mover, baixar, copiar link, apagar |
| Conversa | ★ fixar e detalhes da conversa | Fora | Fixar não existe no contrato |
| Conversa | Mensagens longas do usuário recolhem acima de ~12 linhas | Feito | `clampLong()` com "Mostrar mais" |
| Composer | Menu + agrupado; painéis com busca e rodapé de gestão | Feito | Agentes, Skills, Prompts com busca; links "Ver todos na galeria", "Criar" |
| Composer | Skills com contador "2 de 5" e desabilitar no limite com dica | Feito | `skillsPanel` |
| Composer | Atalho e regras de anexo no item | Parcial | Dica "Anexar arquivo"; o contrato não define limites para anexo no chat |
| Seletor de modelo | Gatilho com nome + ▾; grupos; busca só acima de 8 | Feito | `modelPicker`: "Automático" + "Outros modelos" (regra preservada) |
| Seletor de modelo | Custo relativo por modelo | Feito | 1 a 3 cifrões a partir do `priceOut` |
| Seletor de modelo | Raciocínio estendido; card de detalhes no hover | Fora | Não existe no contrato |
| Seletor de modelo | Em modo imagem, só modelos de imagem | Feito | `modality` |
| Contexto | Anexos em fila de cartões; pílulas na ordem Agente → Projeto → Skills | Feito | `renderCtx` |
| Contexto | Modo imagem com pílula "Imagem ×" e placeholder próprio | Feito | `.composer__mode` |
| Contexto | Resultado de imagem com ações | Fora | O protótipo não gera imagem (aviso explícito na resposta) |
| Login | Página com símbolo, título, subtítulo e um único botão | Feito | `login.html` (com a paisagem de dia do DS ao lado no desktop) |
| Login | Estados: redirecionando, sem acesso, sessão expirada | Feito | "Entrando com a conta Asimov…", `?erro=acesso`, `?erro=sessao` |
| Barra lateral | 264px, recolhe para trilho; Novo chat e Buscar no topo | Feito | `shell.js` |
| Barra lateral | Projetos · Agentes · Skills · Galeria; Recentes por dia | Feito | |
| Barra lateral | Seção "Fixados" e projetos aninhados | Fora | Fixar não existe no contrato |
| Barra lateral | ⋯ por conversa: renomear, mover, apagar | Feito | Mais "Baixar" e "Copiar link" (regras do produto) |
| Barra lateral | Créditos no rodapé abrindo popover | Parcial | Uma barra (semana). O contrato não traz o gasto do dia, só o limite diário |
| Barra lateral | Conta: nome, e-mail, Configurações, Ajuda, Admin (staff), Sair | Feito | "Administração" no menu da conta e no rodapé |
| ⌘K | Modal no terço superior; ações sem consulta; grupos com consulta | Feito | Ações incluem "Criar imagem" |
| ⌘K | Termo destacado; rodapé com teclas; sem resultado oferece chat | Feito | "Novo chat com “termo”" |

## Parte B · Organizar e criar

| Tela | Item adotado | Status | Onde / por quê |
|---|---|---|---|
| Projetos | Título, subtítulo e "Novo projeto" | Feito | |
| Projetos | Busca ao digitar; ordenar; cartões ou lista lembrado | Parcial | Ordens "Atividade recente", "Nome", "Mais conversas". "Mais antigos" exige data de criação, que não está no contrato |
| Projetos | Cartão com ícone, contexto em 3 linhas e rodapé de números; ⋯ | Feito | |
| Projetos | Lista com cabeçalho ordenável | Parcial | Lista feita; ordenação pelo seletor, não pelo cabeçalho |
| Projetos | Criar pedindo só o nome (+ contexto) e abrir o projeto | Parcial | Modal com nome e contexto. Abrir o projeto criado depende de persistência (API) |
| Projetos | Projeto de exemplo | Fora | Sem dado |
| Projetos | Esqueleto no mesmo grid; vazios distintos | Feito | |
| Projeto | Duas colunas; abas no celular | Feito | |
| Projeto | Cabeçalho com voltar, nome e ⋯ | Feito | |
| Projeto | Composer no topo, conversa já no projeto | Feito | Projeto travado no composer |
| Projeto | Lista de conversas com trecho e ⋯ | Parcial | Título e data; o trecho da última mensagem não está no contrato |
| Projeto | Contexto: prévia + editar em modal grande com contador e salvar só com mudança | Feito | |
| Projeto | Arquivos: contador, arrastar, estados por arquivo, limite de 20 | Feito | Enviando, pronto, erro com "Tentar de novo"; desfazer ao remover |
| Skills | Título, subtítulo, "Criar skill" + "Skills oficiais" | Feito | |
| Skills | Busca e categorias | Feito | Ordenação fora (poucos itens) |
| Skills | Cartão com ícone, descrição, categoria, ⋯ | Feito | "Duplicar" fora (não existe no produto) |
| Skills | Sem liga/desliga na lista | Feito | |
| Skills | Toast "Skill criada" com "Usar numa conversa" | Feito | Abre o início com a skill ligada (`index.html?skills=`) |
| Editor de skill | Página inteira; dicas fixas; Escrever/Visualizar; inserir modelo | Feito | |
| Editor de skill | Salvar desabilitado até ter os obrigatórios | Parcial | Salvar fica habilitado e valida no envio, dizendo o que falta (mais claro do que um botão desligado) |
| Editor de skill | Erros por campo, contador em alerta, aviso ao sair, toast | Feito | |
| Agentes | Título, subtítulo, "Criar agente" + secundário | Feito | |
| Agentes | Busca e categorias | Fora | Um agente nos dados; entra quando a lista crescer |
| Agentes | Cartão com avatar, modelo, "Conversar" e ⋯ | Feito | |
| Agentes | Exemplos da Asimov com até 3 agentes | Feito | |
| Criador | Barra com voltar, avatar + nome, estado de salvamento, salvar | Feito | |
| Criador | Formulário por seções + teste fixo; índice de seções | Feito | |
| Criador | Teste mostra avatar, nome, primeira mensagem e perguntas clicáveis | Feito | |
| Criador | "Baseado em <exemplo>" com "Limpar tudo" | Feito | |
| Criador | Celular com Editar/Testar | Parcial | Teste em gaveta por botão flutuante (`#testar` abre direto) |
| Criador | Limites desabilitam "adicionar" com dica | Feito | |
| Galeria | Explorar/Favoritos; Agentes/Skills; busca; categorias com contagem; origem; ordem | Feito | |
| Galeria | Filtros ativos em chips removíveis + "Limpar filtros" | Feito | |
| Galeria | "Oficiais da Asimov" em destaque | Feito | Todos os itens atuais são oficiais |
| Galeria | Favorito otimista com "Desfazer" | Feito | |
| Item | Página própria com voltar; autor com selo; ações principal e secundária | Feito | |
| Item | Instruções em bloco com "Ver tudo" e copiar | Feito | |
| Item | Estrelas com prévia ao passar o ponteiro | Feito | Também pelas setas |
| Item | Histograma, "Também deste autor", perguntas do agente | Fora | Sem dados |
| Item | Remover da galeria (admin) com confirmação; 404 | Feito | |
| Configurações | Navegação lateral; perfil com foto, apelido, nome e e-mail com cadeado | Feito | |
| Configurações | Salvar por seção, só com mudança | Feito | |
| Configurações | Exportar com o que inclui; zona de perigo no fim | Feito | |
| Configurações | Apagar: lista do que some, digitar APAGAR | Feito | |
| Vazios | Primeira vez ≠ sem resultado; passos e ações | Feito | Projetos, skills, agentes, favoritos, galeria, admin |

## Parte C · Admin e transversais

| Tela | Item adotado | Status | Onde / por quê |
|---|---|---|---|
| Modelos | Modelo padrão fora da tabela; "Padrão" como selo | Feito | |
| Modelos | Busca e modalidade | Feito | Filtro de fornecedor e de status fora (10 modelos) |
| Modelos | Tabela compacta com nome + chave em mono | Feito | |
| Modelos | Interruptores na hora, com "Desfazer"; linha desligada esmaecida; padrão não desliga | Feito | |
| Modelos | Linha abre a folha lateral por seções; criar nasce desligado | Feito | |
| Modelos | Link direto para a folha | Feito | `admin-modelos.html?modelo=gpt-5` |
| Modelos | Reordenar arrastando; duplicar | Fora | Ordem editada na folha |
| Uso | Período fixo com atalhos; agrupar | Parcial | De/Até + 7/30 dias. Popover com presets, comparar e exportar CSV fora |
| Uso | KPIs em duas camadas | Feito | |
| Uso | Custo por dia com dica; alternar para tabela | Feito | A dica não detalha por modelo (o contrato não traz custo por dia e por modelo) |
| Uso | Custo por modelo com barra de participação | Feito | |
| Uso | Alertas com vazio positivo; eventos com filtro por tipo | Feito | |
| Usuários | NPS e ativos; "Perto do teto" | Feito | Filtro "Perto do teto (≥ 80%)" |
| Usuários | Barras com cor em 80% e 100% | Feito | |
| Usuários | Editar teto em folha lateral com cadeia de precedência | Feito | |
| Usuários | Políticas em aba própria com a regra no topo | Feito | Usuários afetados por política fora (sem dado) |
| Navegação admin | Contexto separado com "Voltar ao Prisma" e grupos rotulados | Feito | Visão geral, Catálogo, Pessoas |
| Navegação admin | Abas no cabeçalho da página | Feito | Usuários / Políticas |
| Transversais | Tabelas com cabeçalho fixo, `aria-sort` disponível, densidade | Feito | |
| Transversais | Toast com "Desfazer" | Feito | Favoritar, remover arquivo, interruptores, trocar padrão |
| Transversais | Esqueleto no formato real; erro no menor escopo com "Tentar de novo" | Feito | |
| Transversais | Confirmação destrutiva em três níveis | Feito | Desfazer, confirmação, digitar APAGAR |

**Resumo:** 106 itens: 84 feitos, 11 parciais (com a diferença dita na linha) e 11 fora, todos por falta de dado ou de recurso no contrato atual. Nenhum ficou de fora por esforço.
