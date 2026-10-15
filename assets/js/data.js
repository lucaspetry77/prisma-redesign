/* Asimov Prisma — dados de exemplo.
 * Espelham o que existe no staging em 06/10/2026 (conversas, galeria, modelos, uso,
 * usuários). Na integração, cada bloco vira uma chamada à API /v1/...; o formato dos
 * objetos é o que as telas esperam. Nada aqui é enviado a lugar nenhum. */
window.PrismaData = {
  user: {
    name: "admin",
    nickname: "",
    email: "admin@asimov.academy",
    role: "ADMIN",
    initials: "A",
    credits: { used: 31.29, dailyLimit: 200, limit: 1000, renews: "12/10 às 00:00" },
  },

  // Conversas da barra lateral, agrupadas por dia (mais recentes primeiro)
  conversations: [
    { group: "Ontem", items: [
      { id: "d5c5bdf1", title: "Quero criar um assistente de IA para me ajudar a organizar a rotina" },
      { id: "f742cf4b", title: "Como priorizar minhas tarefas de hoje" },
    ]},
    { group: "02/10", items: [
      { id: "6002f54e", title: "Assistente de IA para organizar rotina de trabalho", project: "p1" },
      { id: "f6efcc83", title: "Usuário pergunta qual modelo de IA sou" },
      { id: "89fe1512", title: "Pedido de letra de música" },
      { id: "73030d97", title: "Melhore seu francês em 3 passos rápidos" },
      { id: "5e901c99", title: "Nova conversa" },
      { id: "ef7853fc", title: "Para quem ainda não respondi esta semana" },
      { id: "815a2a8f", title: "Teste nova" },
    ]},
    { group: "01/10", items: [
      { id: "fc835210", title: "Como priorizar suas tarefas de hoje" },
      { id: "bd593350", title: "Nova conversa" },
      { id: "d7f50c20", title: "Assistente de IA para organizar rotina de trabalho" },
    ]},
    { group: "30/09", items: [
      { id: "8ddb8c38", title: "Nova conversa" },
      { id: "8f18d1d8", title: "Quais são suas tarefas de hoje?" },
      { id: "734b18e0", title: "Quero criar um assistente de IA para me ajudar a organizar" },
    ]},
  ],

  // Catálogo do seletor de modelo. "featured" fica no topo; o resto em "Outros".
  models: [
    { key: "asimov", name: "Asimov Basic", desc: "Escolhe o melhor modelo para cada pedido", featured: true, icon: "prisma", on: true, visible: true, isDefault: true, order: 1, badge: "", priceIn: null, priceOut: null, ctx: null, maxOut: null, files: false, images: false, cacheMin: null, provider: "@preset/mvp-preset", modality: "text", prefs: "nvidia → modelrun → google-ai-studio (com alternativas)", conversations: 53, cost: 0.00 },
    { key: "asimov-plus", name: "Asimov Plus", desc: "Seleção automática · Asimov Plus", featured: true, icon: "prisma-plus", on: true, visible: true, isDefault: false, order: 2, badge: "", priceIn: null, priceOut: null, ctx: null, maxOut: null, files: false, images: false, cacheMin: null, provider: "@preset/mvp-preset", modality: "text", prefs: "nvidia → modelrun → google-ai-studio (com alternativas)", conversations: 0, cost: 0.00 },
    { key: "gpt-5", name: "GPT-5", desc: "OpenAI · raciocínio geral", logo: "models/openai.svg", on: true, visible: true, isDefault: false, order: 3, badge: "", priceIn: 1.25, priceOut: 10, ctx: 400000, maxOut: 128000, files: true, images: true, cacheMin: null, provider: "openai/gpt-5", modality: "text", prefs: "Padrão do sistema", conversations: 8, cost: 1.01 },
    { key: "claude-sonnet-5", name: "Claude Sonnet 5", desc: "Anthropic · textos longos e código", logo: "models/claude.svg", on: true, visible: true, isDefault: false, order: 4, badge: "", priceIn: 2, priceOut: 10, ctx: 1000000, maxOut: 128000, files: true, images: true, cacheMin: null, provider: "anthropic/claude-sonnet-5", modality: "text", prefs: "Padrão do sistema", conversations: 3, cost: 0.37 },
    { key: "claude-haiku-4.5", name: "Claude Haiku 4.5", desc: "Anthropic · rápido e econômico", logo: "models/claude.svg", on: true, visible: true, isDefault: false, order: 5, badge: "", priceIn: 1, priceOut: 5, ctx: 200000, maxOut: 64000, files: true, images: true, cacheMin: null, provider: "anthropic/claude-haiku-4.5", modality: "text", prefs: "Padrão do sistema", conversations: 4, cost: 0.16 },
    { key: "gemini-3.8-flash", name: "Gemini 3.8 Flash", desc: "Google · contexto de 1M tokens", logo: "models/gemini.svg", on: true, visible: true, isDefault: false, order: 6, badge: "", priceIn: 0.75, priceOut: 3.75, ctx: 1048576, maxOut: 65536, files: true, images: true, cacheMin: null, provider: "google/gemini-3.8-flash", modality: "text", prefs: "Padrão do sistema", conversations: 2, cost: 0.10 },
    { key: "deepseek-v4.1-flash", name: "DeepSeek V4.1 Flash", desc: "DeepSeek · o mais barato", logo: "models/deepseek.svg", on: true, visible: true, isDefault: false, order: 7, badge: "", priceIn: 0.0198, priceOut: 0.396, ctx: 1048576, maxOut: 943718, files: false, images: true, cacheMin: null, provider: "deepseek/deepseek-v4.1-flash", modality: "text", prefs: "Padrão do sistema", conversations: 0, cost: 0 },
    { key: "asimov-image", name: "Asimov Imagem", desc: "Escolhe um modelo para criar sua imagem", icon: "prisma", featured: true, on: true, visible: true, isDefault: false, order: 1, badge: "", priceIn: null, priceOut: null, ctx: null, maxOut: null, files: false, images: true, cacheMin: null, provider: "@preset/image-preset", modality: "image", prefs: "Padrão do sistema", conversations: 0, cost: 0 },
    { key: "gpt-image-1.5", name: "GPT Image 1.5", desc: "OpenAI · criação e edição de imagens", logo: "models/openai.svg", featured: false, on: true, visible: true, isDefault: false, order: 2, badge: "", priceIn: null, priceOut: null, ctx: null, maxOut: null, files: false, images: true, cacheMin: null, provider: "openai/gpt-image-1.5", modality: "image", prefs: "Padrão do sistema", conversations: 0, cost: 0 },
    { key: "gemini-3.1-flash-image", name: "Gemini 3.1 Flash Image", desc: "Google · criação e edição de imagens", logo: "models/gemini.svg", featured: false, on: true, visible: true, isDefault: false, order: 3, badge: "", priceIn: null, priceOut: null, ctx: null, maxOut: null, files: false, images: true, cacheMin: null, provider: "google/gemini-3.1-flash-image", modality: "image", prefs: "Padrão do sistema", conversations: 0, cost: 0 },
  ],

  suggestions: [
    { tone: "cyan", icon: "assistant", title: "Crie seu assistente pessoal", text: "Monte um agente de IA para uma tarefa da sua rotina.", prompt: "Quero criar um assistente de IA para me ajudar a organizar minha rotina de trabalho. Ele deve: revisar minha lista de tarefas do dia e sugerir uma ordem de prioridade, me lembrar de follow-ups pendentes com clientes ou colegas, e resumir reuniões a partir de anotações soltas que eu colar aqui. Comece me perguntando quais são minhas tarefas de hoje." },
    { tone: "orange", icon: "database", title: "Analise uma base de dados", text: "Cole os dados ou descreva a planilha.", prompt: "Quero analisar uma base de dados. Vou colar os dados (ou descrever a planilha) e quero que você aponte tendências, valores fora do padrão e 3 insights que eu consiga usar ainda esta semana." },
    { tone: "rose", icon: "workflow", title: "Descubra o que automatizar", text: "Encontre tarefas repetitivas que a IA pode fazer por você.", prompt: "Quero descobrir quais tarefas do meu trabalho a IA pode automatizar. Me faça perguntas sobre a minha rotina e depois classifique cada tarefa em potencial alto, médio ou baixo, com o primeiro passo prático." },
  ],

  // Conversa d5c5bdf1 do staging, usada em chat.html
  thread: {
    id: "d5c5bdf1",
    title: "Quero criar um assistente de IA para me ajudar a organizar a rotina",
    model: "claude-sonnet-5",
    messages: [
      { role: "user", time: "5 de out.", text: "Quero criar um assistente de IA para me ajudar a organizar minha rotina de trabalho. Ele deve: revisar minha lista de tarefas do dia e sugerir uma ordem de prioridade, me lembrar de follow-ups pendentes com clientes ou colegas, e resumir reuniões a partir de anotações soltas que eu colar aqui. Comece me perguntando quais são minhas tarefas de hoje." },
      { role: "ai", model: "asimov", time: "5 de out.", html: "<p>Quais são as tarefas que você precisa realizar hoje? Liste aqui, uma por linha ou separadas por vírgula, e eu organizo a prioridade.</p>" },
      { role: "user", time: "5 de out.", files: [{ name: "LESSONS.md", kind: "Markdown", size: "30 KB", type: "doc" }], text: "o que entende sobre esse arquivo?" },
      { role: "ai", model: "asimov", time: "5 de out.", html: "<p>O arquivo <code>LESSONS.md</code> é um registro automático de <strong>lições aprendidas</strong> a partir de testes de mutação e análise de cobertura. Ele é mantido pelo script <code>scripts/lessons.py</code> e não deve ser editado à mão: a próxima execução sobrescreve qualquer mudança.</p><p>As lições são separadas em três grupos:</p><ul><li><strong>Confirmed:</strong> validadas em várias features e seguras como orientação.</li><li><strong>Candidates:</strong> vistas poucas vezes, ainda em observação.</li><li><strong>Quarantined:</strong> confirmadas, mas associadas a falhas quando aplicadas.</li></ul><p>Cada entrada traz o sinal (por exemplo <code>surviving_mutant</code>), a recorrência, o escopo, as features afetadas, a evidência e a data da última observação. O objetivo é fechar os pontos cegos mais comuns da suíte de testes.</p>" },
      { role: "event", text: "Modelo trocado para", model: "claude-sonnet-5" },
      { role: "user", time: "5 de out.", text: "o que pode fazer agora?" },
      { role: "ai", model: "claude-sonnet-5", time: "5 de out.", reasoning: "O usuário trocou de modelo e quer saber o que dá para fazer com o arquivo. Vale calcular o que é objetivo (janela de 45 dias, limiar de promoção) e devolver a pergunta sobre a rotina.", html: "<p>Com a data de hoje (2026-10-05) e o conteúdo do <code>LESSONS.md</code>, já dá para fazer algumas análises objetivas:</p><h3>1. Lições confirmadas perto de expirar</h3><p>O cabeçalho diz <code>window_days=45</code>. A confirmada mais antiga é a <strong>L-006</strong> (2026-09-21), de 14 dias atrás. Nenhuma saiu da janela ainda.</p><h3>2. Candidatas perto da promoção</h3><p>O limiar é <code>promote_threshold=2</code>. Todas as candidatas têm recorrência 1, então nenhuma será promovida só pelo tempo.</p><h3>3. Tarefa prática para hoje</h3><p>Revisar as candidatas mais antigas (L-002, L-003, L-008) e ver se já apareceram em outra feature.</p><table><thead><tr><th>Grupo</th><th>Lições</th><th>Ação</th></tr></thead><tbody><tr><td>Confirmed</td><td>4</td><td>Nada a fazer</td></tr><tr><td>Candidates</td><td>6</td><td>Revisar 3 mais antigas</td></tr><tr><td>Quarantined</td><td>0</td><td>Vazia</td></tr></tbody></table><p>Quer que eu trate isso como uma tarefa da sua lista de hoje, ou prefere me passar as tarefas reais do dia?</p>" },
      { role: "user", time: "5 de out.", files: [{ name: "logo-referencia.webp", kind: "Imagem", size: "5 KB", type: "image" }], text: "consegue identificar essa imagem?" },
      { role: "ai", model: "claude-sonnet-5", time: "5 de out.", rated: "up", reasoning: "Imagem pequena, ícone quadrado laranja com uma forma radial branca. Descrever o que se vê e voltar ao fluxo original.", html: "<p>Sim. É o ícone de um aplicativo: fundo laranja-terracota com uma forma radial branca no centro, no estilo “sunburst”. Pelo formato quadrado e o tamanho, parece o ícone de um app de assistente de IA.</p><p>Isso tem a ver com algo da sua rotina de hoje, ou foi só um teste? Se quiser, voltamos ao fluxo original: você me passa as tarefas do dia (ou cola anotações de reunião, ou lista follow-ups pendentes) e eu organizo.</p>", last: true },
    ],
  },

  projects: [
    { id: "p1", name: "teste 1", tone: "teal", context: "", files: 0, conversations: 1, updated: "há 3 dias" },
    { id: "p2", name: "Black Friday 2026", tone: "rose", context: "Campanha de Black Friday da Asimov: e-mails, criativos e roteiros de vídeo. Público: alunos e não-alunos. Tom: amigo inteligente, sem cara de infoproduto.", files: 6, conversations: 14, updated: "ontem" },
    { id: "p3", name: "Relatórios de dados", tone: "orange", context: "Análises semanais de retenção e ativação. Sempre fechar com uma tabela resumo e o que mudou desde a semana anterior.", files: 3, conversations: 5, updated: "02/10" },
  ],

  // Skills criadas pelo usuário (vazio = estado vazio da tela)
  mySkills: [
    { id: "s-u1", name: "Respostas em tópicos curtos", desc: "Responde sempre em até 5 tópicos, com uma frase cada, e termina com o próximo passo.", category: "Produtividade", updated: "03/10", uses: 12 },
    { id: "s-u2", name: "Português sem jargão", desc: "Troca termos técnicos por palavras do dia a dia e explica siglas na primeira vez que aparecem.", category: "Escrita", updated: "01/10", uses: 4 },
  ],

  // Agentes criados pelo usuário (vazio = estado vazio da tela)
  myAgents: [
    { id: "a-u1", name: "Revisor de Propostas", tone: "violet", initials: "RP", desc: "Lê propostas comerciais e devolve o texto mais claro, com riscos e perguntas que o cliente pode fazer.", model: "claude-sonnet-5", skills: 2, files: 1, updated: "04/10", published: false },
  ],

  gallery: {
    agents: [
      { id: "g-a1", name: "Assistente Pessoal", initials: "AP", tone: "cyan", category: "Produtividade", desc: "Organiza o seu dia: prioriza tarefas, lembra follow-ups com clientes e colegas e resume reuniões a partir das suas anotações.", fav: true, rating: null, date: "1 de outubro de 2026" },
      { id: "g-a2", name: "Revisor de Textos", initials: "RT", tone: "blue", category: "Escrita", desc: "Revisa e-mails, posts e relatórios: melhora clareza, gramática e tom, e explica em uma lista curta o que mudou e por quê.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-a3", name: "Caçador de Automações", initials: "CA", tone: "rose", category: "Automação", desc: "Descobre quais tarefas do seu trabalho a IA pode automatizar, com potencial alto, médio ou baixo e o primeiro passo prático de cada.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-a4", name: "Designer de Marca", initials: "DM", tone: "violet", category: "Design", desc: "Cria a identidade da sua marca: paleta com códigos hex, combinação de fontes e tom de voz, cada escolha explicada em uma frase.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-a5", name: "Tutor de IA", initials: "TI", tone: "teal", category: "Estudos", desc: "Explica inteligência artificial para quem está começando, com analogias do dia a dia, uma pergunta de fixação e um exercício curto.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-a6", name: "Resumidor de Reuniões", initials: "RR", tone: "amber", category: "Reuniões", desc: "Transforma anotações ou a transcrição de uma reunião em resumo claro: decisões, pendências com responsável e prazo e próximos passos.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-a7", name: "Mentor de Python", initials: "MP", tone: "green", category: "Programação", desc: "Ensina Python para iniciantes: explica a ideia antes do código, entrega código curto e comentado e ajuda a entender mensagens de erro.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-a8", name: "Analista de Planilhas", initials: "AP", tone: "orange", category: "Dados", desc: "Analisa dados colados ou descritos: aponta tendências, valores fora do padrão e insights acionáveis, com uma tabela resumo no final.", fav: false, rating: null, date: "1 de outubro de 2026" },
    ],
    skills: [
      { id: "g-s1", name: "Paleta com Justificativa", category: "Design", desc: "Sugere cores com código hex, o papel de cada uma e uma frase de porquê.", fav: true, rating: null, date: "1 de outubro de 2026",
        instructions: "---\nname: Paleta com Justificativa\ndescription: Sugere cores com código hex, o papel de cada uma e uma frase de porquê.\n---\nAo sugerir cores, apresente a paleta em lista ou tabela com, para cada cor:\n\n- **Nome** simples (ex.: \"Azul Profundo\");\n- **Código hex** (ex.: #1E3A8A);\n- **Papel** na marca: principal, apoio, fundo, texto ou destaque;\n- **Porquê**: uma frase ligando a cor à sensação ou ao público da marca.\n\nUse de 4 a 6 cores, com pelo menos uma cor clara para fundo e uma escura para texto. Indique, em linguagem simples, quais pares de texto e fundo são fáceis de ler e quais evitar. Se não souber a sensação desejada ou o público, pergunte antes ou diga qual suposição você fez." },
      { id: "g-s2", name: "Priorizar Tarefas do Dia", category: "Produtividade", desc: "Ordena as tarefas por urgência e impacto, com o motivo em uma linha.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-s3", name: "Tom de Voz da Marca", category: "Design", desc: "Define o tom da marca: 3 adjetivos, faça e não faça e 2 exemplos de frase.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-s4", name: "Pergunta de Fixação", category: "Estudos", desc: "Termina a resposta com uma pergunta curta para checar o entendimento.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-s5", name: "Mapa de Automação", category: "Automação", desc: "Classifica tarefas em potencial alto, médio ou baixo, com o primeiro passo.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-s6", name: "Código Python Comentado", category: "Programação", desc: "Código Python curto, comentado em pt-BR, com como rodar e saída esperada.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-s7", name: "Explicar para Iniciante", category: "Estudos", desc: "Explica em linguagem simples, com analogia do dia a dia e sem jargão solto.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-s8", name: "Detectar Outliers", category: "Dados", desc: "Aponta valores fora do padrão, o critério usado e hipóteses a verificar.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-s9", name: "Follow-ups Pendentes", category: "Produtividade", desc: "Fecha a resposta com quem precisa de retorno, sobre o quê e até quando.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-s10", name: "Ata de Reunião", category: "Reuniões", desc: "Organiza a reunião em decisões, pendências, próximos passos e a confirmar.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-s11", name: "Revisão Clara", category: "Escrita", desc: "Devolve o texto revisado e uma lista curta do que mudou e por quê.", fav: false, rating: null, date: "1 de outubro de 2026" },
      { id: "g-s12", name: "Tabela Resumo no Final", category: "Dados", desc: "Fecha toda análise com uma tabela em markdown dos pontos principais.", fav: false, rating: null, date: "1 de outubro de 2026" },
    ],
  },

  usage: {
    period: "30/09/2026 a 06/10/2026",
    from: "2026-09-30",
    to: "2026-10-06",
    totals: {
      costBRL: "R$ 1,83", costUSD: "US$ 0,3584", credits: "182,81", messages: "129",
      cacheSaving: "≈ R$ 0,11 · 6,1%", cacheRate: "4,9%", interval: "9 min 29 s", truncated: "0,0%",
      gated: "0", overhead: "≈ R$ 0,15 · 8,4%", overheadSub: "Títulos ≈ R$ 0,15 · resumos ≈ R$ 0,00 · memórias ≈ R$ 0,00",
      tokens: "229.717", cachedTokens: "17.151",
    },
    fx: "R$ marcados com ≈ foram convertidos de US$ pela cotação de agora: US$ 1 = R$ 5,1000 (tabela de câmbio, desde 30/09/2026, 13:52).",
    days: [
      { day: "30/09", full: "30/09/2026", brl: 0.15, usd: "US$ 0,0292", credits: "14,88", messages: 31, users: 2 },
      { day: "01/10", full: "01/10/2026", brl: 0.05, usd: "US$ 0,0089", credits: "4,51", messages: 9, users: 1 },
      { day: "02/10", full: "02/10/2026", brl: 1.28, usd: "US$ 0,2511", credits: "128,04", messages: 80, users: 2 },
      { day: "03/10", full: "03/10/2026", brl: 0, usd: "US$ 0,0000", credits: "0,00", messages: 0, users: 0 },
      { day: "04/10", full: "04/10/2026", brl: 0, usd: "US$ 0,0000", credits: "0,00", messages: 0, users: 0 },
      { day: "05/10", full: "05/10/2026", brl: 0.35, usd: "US$ 0,0693", credits: "35,36", messages: 9, users: 2 },
      { day: "06/10", full: "06/10/2026", brl: 0, usd: "US$ 0,0000", credits: "0,00", messages: 0, users: 0 },
    ],
    events: [
      { type: "Login negado", kind: "danger", when: "02/10/2026, 19:50", user: "—", summary: "domínio gmail.com · sem conta" },
      { type: "Limite de requisições", kind: "warn", when: "02/10/2026, 00:09", user: "bff797ed", summary: "/v1/skills · balde global · por usuário" },
    ],
  },

  users: [
    { name: "aluno", email: "aluno@asimov.academy", role: "USER", plan: "—", active: true, last: "05/10/2026, 14:38", week: { spent: 0.04, cap: 10, credits: "4,08", source: "política geral" }, month: { spent: 0.17, cap: 40, credits: "17,37", source: "política geral" } },
    { name: "admin", email: "admin@asimov.academy", role: "ADMIN", plan: "—", active: true, last: "06/10/2026, 16:54", week: { spent: 0.31, cap: 10, credits: "31,29", source: "política geral" }, month: { spent: 1.51, cap: 40, credits: "150,55", source: "política geral" } },
  ],
  policies: [
    { name: "Política geral", week: "R$ 10,00", month: "R$ 40,00", updated: "30/09/2026, 13:52" },
  ],
};
