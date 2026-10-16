# 01 · Design system do Prisma (tema claro)

Fonte de verdade: [asimov-academy/asimov-design-system](https://github.com/asimov-academy/asimov-design-system), branch `main`
(lida em 15/10/2026). Implementação: `assets/css/tokens.css`, `base.css`, `components.css`, `shell.css`, `motion.css`,
`assets/js/icons.js`, `ui.js`. Vitrine viva de componentes: `componentes.html`.

## 1. O que existe no repositório do DS (e o que não existe)

O briefing citava `AGENTS.md`, `tokens.json`, `assets/css/tokens.css`, `components.html` e `starter.html`. Conferi `main` e as
outras 9 branches do repositório, e os outros repositórios de design system da organização. **Só o `AGENTS.md` existe.** O
`tokens.json` não existe, e nem `starter.html` nem `components.html` existem com esses nomes. Os equivalentes reais:

| Pedido no briefing | Equivalente real no DS | Como usei |
|---|---|---|
| `AGENTS.md` | `AGENTS.md` (regras: tudo local, sem CDN, pt-BR) | Seguido: fontes, ícones e imagens locais; nenhuma dependência remota |
| `tokens.json` / `tokens.css` | Variáveis CSS em `assets/overview/_astro/global.*.css` (tipografia, espaçamento, raios, curvas, cores Tailwind) + `assets/themes.js` (17 acentos) | Portadas para `tokens.css`, cada uma com o nome de origem em comentário |
| Tema claro | `assets/modo-claro.css` + `assets/modo.js` (o DS **tem** modo claro oficial, como camada sobre o escuro) | É a base do tema: superfícies, tinta, linhas, sombras, vidro e acento escurecido vêm daqui, valor a valor |
| `components.html` | `assets/components/index.html` (catálogo: cards modulares, layouts editoriais, benefícios, planos, acordeão, rodapé, fundos) | Origem das receitas de card, CTA, selo, acordeão, ícone com pedestal |
| `starter.html` | `assets/overview/index.html` (a landing completa usada como base) | Origem do cabeçalho em vidro, do CTA com brilho e das entradas animadas |

Como o modo claro já existe no DS, **não precisei derivar um tema claro do zero**. O que derivei foi o que o DS (feito para
landing pages) não tem: componentes de aplicativo. Cada derivação está marcada com `app:` em `tokens.css` e listada na seção 4.

## 2. Tokens portados

### Cor
- **Superfícies** (`modo-claro.css`): página `#f4f4f5` (`--claro-page`), superfície `#fff`, `surface-2` `#fafafa`, `sunken` `#ececee`.
- **Tinta**: `#09090b` (títulos), `#52525b` (corpo), `#71717a` (secundário, 4,8:1 no branco), `#a1a1aa` (só decorativo).
- **Linhas**: `#e4e4e7` e `#d4d4d8`. Hover `rgb(9 9 11 / .04)` (o hover do dropdown do cabeçalho claro).
- **Vidro claro**: `rgb(255 255 255 / .7)`, borda `rgb(9 9 11 / .08)`, desfoque 10px, luz no topo `inset 0 1px rgb(255 255 255 / .7)`.
- **Acento**: tema `cyan_asimov` (`#06b6d4 / #0891b2 / #22d3ee / #67e8f9`), que já era o do Prisma e casa com o cristal azul.
  Derivadas pela receita do DS claro: `accent-ink = mix(accent-dark 78%, preto)` para texto (5,6:1), `accent-wash = mix(accent 9%, branco)`,
  `accent-line = mix(accent 32%, branco)`. Trocar o tema = trocar as quatro variáveis `--accent*`.
- **Tons de identidade** (`themes.js`, formações e trilhas): só no avatar de agente e no ícone de projeto. Antes, o tom pintava
  cartões inteiros e perdia o sentido.
- **Semânticas** (`app:`): o DS não define sucesso, aviso e erro. Usei a mesma base Tailwind do DS e escureci para texto AA,
  como o DS faz com o acento.

### Profundidade
Regra do DS claro: *"no claro a profundidade vem da sombra, não do brilho"*. As três sombras são as do DS (`--claro-shadow-sm/md/lg`).
O brilho do acento fica restrito a dois lugares: o CTA com brilho do login (`.button-glow`) e o botão de enviar (CTA em degradê).

### Tipografia
- **Inter** (400/500/600/700) e **Instrument Serif itálico**, os mesmos arquivos do DS (`cmp` idêntico).
- Títulos em **peso 500 com tracking −0,025em e entrelinha 1,08** (`.section-title` do DS). Títulos de seção nunca em 600/700.
- Instrument Serif itálico só como acento de marca: "Prisma" no logotipo, o nome da pessoa na saudação e o título do login.
- Escala do DS (12 / 14 / 16 / 18 / 20 / 30 / 36 / 48) mais dois passos de app, 13 e 15, porque aplicativo pede mais densidade que landing page.
- Rótulo em caixa alta com tracking 0,18em (`.trail-overview-v2-card__label`) só em contextos de metadado. Os "eyebrows" em toda página
  saíram (ver inventário, problema 12).

### Espaçamento, raios, movimento
- Escala de 4px (`--spacing .25rem`).
- Raios do DS: 8 (`radius-lg`), 12 (`radius-xl`), 16 (`radius-2xl`), 20 (cards do FAQ), 22 (cards compactos). 10px é `app:` para controles.
- Curvas: `cubic-bezier(.23,1,.32,1)` (cards e FAQ do DS), `(.2,.8,.2,1)` (`fadeSlideIn`), `(.4,0,.2,1)` (padrão). Durações 150 ms
  (padrão do DS), 350 ms (acordeão do DS), 400 ms (transform de card do DS), 1 s (`fadeSlideIn`).
- Animações portadas como estão: `fadeSlideIn` (desfoque 8px + 30px), `pco-enter` (modal), giro da borda de luz do `.button-glow`,
  acordeão por `grid-template-rows 0fr → 1fr`.

### Ícones
Família **Solar linear** (traço 1,5), a mesma do DS (`assets/icons/solar`). O DS vendoriza 20 ícones; o Prisma precisa de 95, que vendorizei
da mesma fonte (API do Iconify, 15/10/2026) em `assets/js/icons.js`, sem chamada remota em tempo de execução. Três desenhos próprios no mesmo
traço: `sidebar`, `stop`, `crystal-plus`. Licença CC BY 4.0 em `assets/icons/LICENSE.md`.

## 3. Componentes portados do DS

| Componente do Prisma | Origem no DS | Adaptação |
|---|---|---|
| `.card` | `.trail-card` claro (vidro + luz no topo + sombra mínima) | Sobre o painel branco, o vidro vira branco opaco; borda de vidro mantida |
| `.card--interactive:hover` | `.formation-card:hover` claro | Borda pega o tom a 34% e a sombra sobe para `md`; transform em 400 ms |
| `.card--dashed` | `.trail-card--more` claro | "Criar novo" dentro de grades |
| `.btn--secondary` | `.index4-pricing-card__cta--outline` claro | Hover: borda `accent-line` + fundo `accent-wash` |
| `.btn--accent` | `.index4-pricing-card__cta--primary` claro (degradê 135° + brilho) | Só em botão de ícone (enviar), onde o contraste exigido é 3:1 |
| `.btn--glow` | `.button-glow` claro (vidro + borda cônica girando + halo) | CTA único do login |
| `.badge--accent` | `.index4-pricing-badge` claro | Selo de destaque (Padrão, Admin) |
| `.icon-chip--accent` | `.platform-row__icon` claro | Ícone de seção |
| `.icon-chip--tone` | `.trail-card__icon` claro | Ícone de projeto com o tom dele |
| `.disclosure` | `.faq-item` / `.faq-body` | Mesma mecânica e tempos (350 ms, ícone gira 180°) |
| `.topbar` (celular) | `.cadence-header__nav` claro (vidro 78% + desfoque 16px) | Topo fixo do celular |
| `.overlay__scrim` | `.pco-backdrop` claro (`rgb(24 24 27 / .45)`) | Fundo de modal |
| `.dialog` | `.pco-dialog` + `pco-enter` | Entrada 12px + escala .99 |
| `.crystal` | Logo do Prisma (ativo do produto) | Mantido; reflexo e refração mascarados pelo próprio logo |

## 4. Componentes derivados para aplicativo (`app:`)

O DS não tem esses componentes. Todos usam só tokens do DS e seguem o padrão de interação do UI Arc (Fase 3):
campo, área de texto, seleção, busca com ícone; caixa, rádio, cartão de opção, interruptor; segmentos e abas com indicador
deslizante; pílulas de filtro; status com ponto; avatar; menu e popover; dica com atalho; modal, confirmação (com palavra digitada),
folha lateral; toast empilhado com ação; esqueleto, vazio que ensina, erro com "Tentar de novo"; medidor; tabela com cabeçalho fixo e
ordenação; bloco de código; zona de arquivo; estrelas; migalha; linha de lista; número que rola; paleta de comandos.

**Decisões que valem para todos:**

1. **Botão primário em tinta, não em acento.** Texto branco sobre `#06b6d4` dá 2,4:1 e não passa AA. Tinta sobre branco dá 19:1. O acento
   fica para foco, seleção, progresso e o CTA de enviar.
2. **Foco só pelo teclado** (`:focus-visible`), anel de 2px no acento com afastamento de 2px. Campos ganham anel de 3px `accent-ring`.
3. **Painel principal elevado.** A página é o zinco do DS; o conteúdo vive num painel branco com borda de vidro, raio 20 e `shadow-sm`.
   A barra lateral fica no zinco, sem caixa. É a tradução direta de "superfícies brancas sobre fundo zinco, profundidade por sombra".
4. **Selecionado = superfície branca com sombra**, não cor. Na barra lateral e nos segmentos o item ativo "sobe" como um cartão.
   O acento não disputa atenção com o conteúdo.
5. **Pressionar encolhe** (botões 0,97, ícones 0,92, pílulas 0,96) em 100 ms: resposta imediata ao toque.
6. **Texto essencial nunca em `--faint`** (`#a1a1aa` dá 2,6:1). `--muted` (4,8:1) é o mínimo para texto.

## 5. Contraste (AA)

| Par | Razão |
|---|---|
| `--ink` sobre branco | 19,6:1 |
| `--body` sobre branco | 7,7:1 |
| `--muted` sobre branco | 4,8:1 |
| `--muted` sobre `--page` (#f4f4f5) | 4,4:1. Na barra lateral, o texto usa `--body`; `--muted` fica só nos ícones e rótulos de grupo (11px, 500, não essenciais) |
| `--accent-ink` sobre branco | 5,6:1 |
| `--accent-ink` sobre `--accent-wash` | 5,1:1 |
| Branco sobre `--ink-2` (botão primário, toast) | 17,7:1 |
| Branco sobre `--danger-solid` (botão perigo) | 4,7:1 |
| Ícone branco sobre `--accent-dark` (enviar, 3:1 para não texto) | 3,7:1 |
| `--danger` sobre `--danger-wash` | 6,0:1 |

## 6. Como usar

```html
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/components.css">
<link rel="stylesheet" href="assets/css/shell.css">
<!-- chat.css e pages.css quando a tela precisar -->
<link rel="stylesheet" href="assets/css/motion.css">
...
<script src="assets/js/icons.js"></script>
<script src="assets/js/data.js"></script>
<script src="assets/js/core.js"></script>
<script src="assets/js/ui.js"></script>
<script src="assets/js/shell.js"></script>
<script src="assets/js/motion.js"></script>
<script src="assets/js/pages/<tela>.js"></script>  <!-- termina com Prisma.ready() -->
```

Regras para quem continuar:
- Cor, raio, sombra, duração e curva **sempre por token**. Se faltar um, crie em `tokens.css` com a origem em comentário.
- Antes de criar um componente, procure em `componentes.html`.
- Copy em pt-BR, sóbria e descritiva: o que a coisa faz, sem adjetivo de marketing. Botões com verbo ("Criar projeto", "Salvar skill").
- Sem eyebrow em caixa alta, sem travessão em copy, sem degradê decorativo fora dos dois lugares acima.
