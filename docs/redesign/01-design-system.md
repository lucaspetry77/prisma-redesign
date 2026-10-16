# 01 · Design system do Prisma (tema claro)

Implementação: `assets/css/tokens.css`, `base.css`, `components.css`, `shell.css`, `motion.css`, `assets/js/icons.js`, `ui.js`.
Vitrine viva: `componentes.html`.

## 1. Fonte de verdade: onde estão os arquivos do briefing

O briefing aponta `github.com/asimov-academy/asimov-design-system` e pede `AGENTS.md`, `tokens.json`, `assets/css/tokens.css`,
`components.html` e `starter.html`. Busca feita em 15/10/2026:

| Onde procurei | Resultado |
|---|---|
| `asimov-design-system`, branch `main` e as outras 9 branches (`git ls-remote` + árvore de cada uma) | Só `AGENTS.md` (sobre emails). Tem `assets/modo-claro.css`, `themes.js`, `components/index.html`, `overview/index.html` e ícones Solar |
| Site publicado `asimov-design-system.vercel.app` (`/tokens.json`, `/starter.html`, `/components.html`, `/assets/css/tokens.css`) | 404 em todos |
| Busca de código na organização (`gh search code --owner asimov-academy --filename …`) | **Encontrados** em `asimov-academy/asimov-mkt-dashboard`, pasta `design/asimov-academy-ds/`: `AGENTS.md`, `README.md`, `tokens.json`, `assets/css/tokens.css`, `assets/css/design-system.css`, `components.html`, `starter.html` (commit "DS oficial da Asimov no lugar do snapshot da LP", 19/09/2026) |

Esse pacote é o Asimov Design System completo, no formato que o briefing descreve, e o `README` dele manda ler exatamente
`AGENTS.md`, `tokens.json` e `assets/css/tokens.css` e partir de `starter.html`. **Ele é a fonte principal.** Só tem tema escuro
(`color-scheme: dark`). Por isso, como pede o briefing, o claro é derivado, e a derivação usada é a **oficial**:
`assets/modo-claro.css` do repositório `asimov-design-system` (mesma marca, mesmos componentes, camada clara documentada).

| Peça | Vem de |
|---|---|
| Fonte, escala de espaço, raios, curvas, botões, campos, abas, tabela, métrica, medidor, alerta, toast, dialog, tema de acento | Pacote: `AGENTS.md`, `tokens.json`, `tokens.css`, `design-system.css` |
| Superfícies, tinta, linhas, sombras, vidro claro, acento escurecido para texto, título prata no claro | `asimov-design-system/assets/modo-claro.css` |
| Ícones (família Solar linear) | `asimov-design-system/assets/icons/solar` (o pacote usa traços próprios no mesmo estilo; ver §6) |
| Movimento de interação (molas, toast empilhado, indicadores) | UI Arc (ver 03-interacoes.md), sobre as curvas do pacote |

## 2. Regras do `AGENTS.md` do pacote e como o Prisma cumpre

| Regra | No Prisma |
|---|---|
| "Inter é a fonte de títulos e interface. Pesos 400, 500, 600 e 700." "Instrument Serif é legado e não deve ser apresentada como parte da identidade." | Só Inter. A serifa foi removida da marca, da saudação, do login e os arquivos saíram do repositório |
| H1 peso 500, tracking negativo; `text-gradient-silver` vertical, nunca horizontal | Títulos de página, saudação e login em prata vertical (versão clara do `modo-claro.css`: tinta → `#18181b` → `#3f3f46`); `h1–h3 { letter-spacing: -.035em }` |
| Accent sinaliza interação; mude os quatro tons juntos e o RGB | `--accent`, `--accent-dark`, `--accent-light`, `--accent-glow` + `--accent-rgb-space` |
| Escala 4/8/12/16/24/32/48/64/96; mobile 20–24px de margem | `--s-1…--s-24`; `--gutter-mobile: 20px` |
| Raios: 8 controles, 16 painéis, 24 cards, pill em CTAs | `--r-control 8`, `--r-panel 16`, `--r-card 24`, `--r-pill`; extensões de app do `design-system.css`: métrica/tabela/toast 12, alerta 10, botão quadrado 10, dialog 20 |
| Vidro = fill translúcido + blur + borda fina + highlight superior | `.card`, topo do celular e cabeçalhos fixos (no claro: branco translúcido + `rgb(9 9 11/.08)` + `inset 0 1px` branco) |
| Textos sóbrios, diretos e descritivos | Toda a copy (verbo nos botões, sem superlativo) |
| No máximo um fundo animado por página; nada intenso atrás de formulários e tabelas | Só o cristal no início e a paisagem estática no login |
| Labels, erros ligados ao campo, `aria-invalid`, tabs com setas, Escape, `:focus-visible` | Ver 05-handoff.md (QA) |
| Testar 390 e 1280px, movimento reduzido, teclado, formulário válido e inválido, abas, subdiretório | Feito; resultados em 05-handoff.md |

## 3. Tokens: do pacote para o Prisma

| Pacote (`tokens.json` / `tokens.css`) | Prisma (`tokens.css`) | Nota |
|---|---|---|
| `themes.cyan_asimov` `#06b6d4 / #0891b2 / #22d3ee / #67e8f9` | `--accent*` | O padrão do DS é Teal; o Prisma usa **Ciano**, um dos oito temas nomeados, porque casa com o cristal azul do logo. Trocar = as quatro variáveis + RGB |
| `--ui-accent-rgb-space` | `--accent-rgb-space: 6 182 212` | |
| `--radius-sm 8 / -md 16 / -card 24 / -pill` | `--r-control / --r-panel / --r-card / --r-pill` | |
| `--space-1…24` | `--s-1…--s-24` | |
| `--ease-out cubic-bezier(.2,.8,.2,1)`; `motion.reveal 1s`; `motion.card .5s (.4,0,.2,1)`; `motion.buttonSpin 3s` | `--ease-out`, `--ease-entry`, `--d-entry`, `--d-card`, `--ease-in-out`, `--d-spin` | |
| `type.copy 18 / card 16 / meta 12` | `--text-xl 18 / --text-lg 16 / --text-xs 12` | App usa 13–15 para densidade (passos `app:`) |
| `--success #4ade80 / --warning #fbbf24 / --danger #fb7185 / --info #60a5fa` (escuro) | `--success #15803d`, `--warning #b45309`, `--danger #be123c`, `--info #1d4ed8` | Mesma família de cor, escurecida para texto AA no branco |
| `surface #050505`, `copy #b4b4b4`, `border-subtle/strong` (escuro) | `--page #f4f4f5`, `--surface #fff`, `--body #52525b`, `--line #e4e4e7`, `--line-strong #d4d4d8` | Do `modo-claro.css` |

## 4. Componentes do pacote portados

| Pacote (`design-system.css` / `components.html`) | Prisma | Adaptação para o claro |
|---|---|---|
| `.btn`: pílula, borda forte, hover borda no acento + 8% do acento + sobe 1px (.25s) | `.btn` | Fundo branco; hover `--accent-wash` |
| `.btn--solid`: degradê 135° accent-dark → accent, brilho do acento | `.btn--primary` / `.btn--solid` | As pontas escurecem até o texto branco passar AA: `--cta-from` (5,6:1) e `--cta-to` (4,7:1) |
| `.btn--ghost`, `.btn--danger`, `.btn--small` (34px), `.btn--square` (40px, raio 10) | `.btn--ghost`, `.btn--danger-outline`, `.btn--sm`, `.icon-btn--outline` | |
| `.button-glow` (3 camadas, borda cônica 3s, scale 1.05) | `.btn--glow` (só no login) | Vidro claro e halo do acento, como no `modo-claro.css` |
| Campos: raio 8, padding 12px 14px, label 12px/500, ajuda e erro pequenos | `.input`, `.textarea`, `.select`, `.label`, `.hint`, `.field-error` | Fundo branco, borda `--line-strong`, anel do acento no foco |
| `.tabs`: gap 24px, sublinhado e texto no acento | `.tabs` | Texto `--accent-ink`; sublinhado que desliza (UI Arc) |
| `.segmented`: raio 8, interno 5 | `.seg` | Selecionado em superfície branca com sombra |
| `.badge`: pílula, 10–11px, 500, tracking .04em | `.badge` | |
| `.table-wrap` (raio 12) e `.data-table` | `.table-wrap`, `.table` | Cabeçalho fixo e `aria-sort` (app) |
| `.metric` (padding 18, raio 12, valor 28px −.05em) | `.kpi` | Valor com número que rola (UI Arc) |
| `.progress` (5px, degradê accent-dark → accent-light) | `.meter` | Degradê até o `accent` (o light some no branco) |
| `.bar-chart` (degradê do acento a 20% até o acento, borda do light a 40%, raio 4 4 0 0) | `.chart__bar` | |
| `.alert` (borda do acento a 25%, fundo a 6%, raio 10) | `.alert` + variantes semânticas | |
| `.switch` 36×21 | `.switch` | Ligado com o degradê do CTA |
| `.skeleton` (brilho 2s) | `.skel` | |
| `.toast` (embaixo no centro, raio 12, fundo accent-dark 18% sobre `#101010`, borda do acento 35%) | `.toast` | Mantido escuro, como no pacote (contrasta com o claro); empilhado como no UI Arc |
| `dialog` (raio 20, 480px) | `.dialog` | |
| `.dashboard-side button[aria-selected]` (acento a 10%, texto no acento) | `.nav-item[aria-current]`, `.conv.is-active` | `--accent-wash` + `--accent-ink` |
| `.eyebrow` | Não usado | Ruído em toda página (problema 12 do inventário) e contrário à regra de copy do UI Arc |
| Aurora (WebGL) + paisagem | Paisagem de dia só no login | "Evite animação intensa atrás de formulários e tabelas" (`AGENTS.md`) |

Componentes de app que nem o pacote nem a camada clara têm (menu, popover, folha lateral, paleta ⌘K, número que rola,
cartão de opção, migalha, zona de arquivo, estrelas) foram derivados só com estes tokens e com a interação do UI Arc.

## 5. Decisões de derivação (claro) e contraste AA

1. **Foco** em `--accent-dark` (3,7:1 no branco), 2px, afastamento de 3px. O pacote usa `accent-light` (1,8:1 no branco) com 5px.
2. **CTA sólido** do pacote com as duas pontas escurecidas (texto branco 5,6:1 e 4,7:1).
3. **Texto secundário sobre o zinco** (barra lateral, login) usa `--muted-on-page` (5,2:1); `--muted` dá 4,4:1 ali.
4. **Placeholder** em `--muted` (4,8:1); o `--faint` do `modo-claro.css` dá 2,6:1.
5. **Selecionado na barra lateral** tingido de acento (como no pacote); **selecionado em segmentos** em superfície branca (sombra, regra do claro).

| Par | Razão |
|---|---|
| `--ink` sobre branco | 19,6:1 |
| `--body` sobre branco | 7,7:1 |
| `--muted` sobre branco | 4,8:1 |
| `--muted-on-page` sobre `--page` | 5,2:1 |
| `--accent-ink` sobre branco · sobre `--accent-wash` | 5,6:1 · 5,1:1 |
| Branco sobre `--cta-from` · `--cta-to` | 5,6:1 · 4,7:1 |
| Branco sobre `--danger-solid` | 4,7:1 |
| Anel de foco `--focus` sobre branco | 3,7:1 |
| Ícone branco sobre o degradê do botão enviar (não texto, 3:1) | 3,7:1 no `accent-dark` |

O contraste foi medido no navegador, texto por texto, em 9 telas (05-handoff.md).

## 6. Ícones

O pacote usa SVGs próprios de traço ("adaptações locais, não cópias do Solar"); o repositório do DS usa Solar linear. O Prisma usa
**Solar linear** (95 ícones, vendorizados em `icons.js`, sem chamada remota), porque o conjunto do pacote tem poucos ícones e o
mesmo estilo de traço. Licença em `assets/icons/LICENSE.md`; gerador em `scripts/vendor-icons.py`.

## 7. Como usar

```html
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/components.css">
<link rel="stylesheet" href="assets/css/shell.css">
<!-- chat.css e pages.css quando a tela precisar -->
<link rel="stylesheet" href="assets/css/motion.css">
<script src="assets/js/icons.js"></script> … <script src="assets/js/pages/<tela>.js"></script>
```

- Cor, raio, sombra, espaço, duração e curva **sempre por token**. Faltou um? Crie em `tokens.css` com a origem em comentário.
- Antes de criar um componente, veja `componentes.html`.
- Copy em pt-BR, sóbria e descritiva. Botões com verbo. Sem eyebrow, sem travessão, sem degradê decorativo além do CTA, das barras e do brilho do login.
