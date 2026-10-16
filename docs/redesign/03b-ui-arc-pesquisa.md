# Referência: UI Arc (uiarc.dev)

Pesquisa feita pelo MCP do Arc em 15/10/2026 para o redesenho do Asimov Prisma.

**Restrição que governa tudo aqui.** O Arc é React + CSS Modules + Motion. O Prisma é HTML + CSS + JS puros, sem build, sem npm, sem CDN, sem React. Deste documento só se porta **design de interação** (tempos, curvas, transformações, estados, teclado, ARIA, ramo de reduced motion), reescrito com os nossos tokens. Nenhum código React foi copiado nem deve ser. Itens **Pro** são licenciados: aparecem só com nome e descrição pública, e não devem ser reconstruídos.

**Como ler os números.** Valor sem marca = vem da documentação do Arc (`get_component` / `get_skill`). Valor marcado *(derivado)* = cálculo ou proposta minha para fechar uma lacuna da doc (por exemplo, a curva `linear()` de uma mola, ou um limiar que a doc não informa).

Nossos tokens de movimento (Asimov DS / Prisma atual):

```css
--ease-out:      cubic-bezier(.23, 1, .32, 1);
--ease-in-out:   cubic-bezier(.77, 0, .175, 1);
--ease-drawer:   cubic-bezier(.32, .72, 0, 1);
--ease-spring:   cubic-bezier(.34, 1.36, .64, 1);   /* pico de 1.043: overshoot de 4,3% (derivado) */
```

---

## 1. Ferramentas do MCP

| Ferramenta | O que faz | Observação de uso |
|---|---|---|
| `mcp__arc__list_components` | Lista itens com nome, descrição, tier e links. Filtros: `category` (Actions, Inputs, Disclosure, Feedback, Data, Text, Special, Blocks), `tag`, `tier` (free/pro), `kind` (component/block) | Sem filtro devolve ~150 KB de JSON (256 itens). Salve e use `jq` |
| `mcp__arc__search_components` | Busca por intenção ("confirm destructive action", "date range") e devolve os melhores primeiro, com score | Aceita `tier` e `kind` |
| `mcp__arc__get_component` | Doc completa de um item: whenToUse, whenNotToUse, props, keyboard, accessibility, motion, responsive, performance, aiNotes, related, comando de instalação | Em item Pro com conta Pro conectada devolve o **código fonte**. Por isso não chamei `get_component` em nenhum Pro |
| `mcp__arc__get_skill` | Devolve um arquivo de regras em markdown. Free: `SKILL`, `INSTRUCTIONS`, `checklist`, `components`, `composition`, `copy`, `design`, `motion`, `accessibility`, `responsive`, `example-settings`, `example-pricing`, `example-dashboard`. Pro: `arc-pro`, `full-page-generation`, `design-system-generation`, `refactor-to-arc`, `motion-recommendations`, `responsive-optimization`, `accessibility-audit` | Li: SKILL, INSTRUCTIONS, motion, components, accessibility, composition, design, checklist, example-dashboard |
| `mcp__arc__get_install_command` | Gera o comando `npx shadcn@latest add …` | Irrelevante para o Prisma (sem npm) |

**Catálogo em 15/10/2026:** 256 itens = 111 componentes free, 54 componentes Pro, 22 blocos free, 69 blocos Pro.

---

## 2. Princípios e presets de motion do Arc

### 2.1 Tokens (`components/arc/lib/motion-tokens.ts`)

| Token | Valor | Uso no Arc |
|---|---|---|
| `spring.smooth` | 0.4 s, bounce 0 | Painéis, altura, drawers, progresso, mudanças de layout. **Nunca passa do alvo** |
| `spring.snappy` | 0.26 s, bounce 0.12 | Feedback de press, indicadores pequenos, troca de ícone |
| `spring.morph` | 0.42 s, bounce 0.16 | Destaque compartilhado (`layoutId`), largura que segue conteúdo novo, morph de forma |
| `duration.instant` | 0.12 s | Tweens de cor e opacidade |
| `duration.fast` | 0.16 s | Idem (padrão para hover/cor) |
| `duration.exit` | 0.18 s | Saídas (sempre mais rápidas que entradas) |
| `duration.standard` | 0.24 s | Fades e trocas pequenas |
| `duration.considered` | 0.48 s | Movimentos deliberados |
| `ease.enter`, `ease.exit`, `ease.standard`, `ease.inOut` | arrays cubic-bezier | Entradas, saídas, cor, movimento na tela. **Os valores não estão expostos na doc** |
| `stagger.item` / `line` / `word` / `char` | 0.035 / 0.08 / 0.04 / 0.016 s | Listas e texto, **total abaixo de ~0.4 s** |
| `blur.subtle` / `soft` / `text` | 2 / 4 / 8 px | Só em crossfades breves |

No CSS do Arc (`foundation.css`): `--duration-instant`, `--duration-fast`, `--duration-standard`, `--duration-considered`, `--duration-spring` (**580 ms**), `--ease-standard`, `--ease-spring`. Não existe `--duration-exit` em CSS. Receita: cor e opacidade com `var(--duration-fast) var(--ease-standard)`; transform com `var(--duration-spring) var(--ease-spring)`.

### 2.2 Como o Arc escolhe a mola

- **Tudo que reporta estado pousa sem overshoot**: thumb de switch, borda de drawer, altura de painel, preenchimento de progresso, um valor. Usa `smooth` (bounce 0). Overshoot ali mostra por um instante um estado que não é verdade.
- **"Vida" pequena é para feedback**: `snappy` no press, `morph` no destaque que desliza entre opções.
- **Bounce visível só em momentos lúdicos**: reação, comemoração, brinquedo físico. Nunca em UI de rotina.

### 2.3 As 9 regras de motion

1. Animar `transform` e `opacity` (e `filter: blur` breve). `width`/`height` só quando a mudança de tamanho é a informação, e então em mola.
2. **Um gesto contínuo por interação.** Uma mudança de estado é um movimento espacial, não fade + slide + scale em tempos separados.
3. Tudo interrompível: molas em tudo que o usuário pode reverter, para que reverter no meio nunca dê salto.
4. Nada muda de tamanho em um frame. Anima o tamanho ou reserva o espaço.
5. Números contam até o novo valor com `font-variant-numeric: tabular-nums` e largura estável.
6. Press escala para ~0.97, **exceto** elemento que ancora popover/menu: esse responde com cor, porque o popup se posiciona contra o tamanho pressionado.
7. Saídas mais rápidas que entradas (`duration.exit`, `ease.exit`).
8. No máximo uma entrada orquestrada por página. Sem scroll reveal em toda seção, sem loop a menos que mostre status ao vivo.
9. Manter o elemento animado montado. Trocar `key` ou o tipo do elemento reinicia a animação e perde foco (no vanilla: não recriar o nó com `innerHTML` a cada estado; mutar atributos/texto).

### 2.4 Reduced motion (regra geral)

Toda animação tem ramo. Mantém estado final, foco e feedback. Remove deslocamento, loops, parallax e autoplay. Contador pula direto ao valor; painel aparece em altura cheia. Na prática, os componentes trocam travel/scale/blur por **fade curto** (tooltip: 90 ms; demais: "short fade").

### 2.5 Regras transversais de interação e a11y (valem para todo componente)

- **Foco:** nenhum anel no foco por ponteiro. Teclado (`:focus-visible`) recebe um anel único: **contorno 2 px de accent suavizado, offset 2 px**, igual em todo componente. Campos de texto mostram foco por borda e caret; itens de menu/listbox por preenchimento de destaque (`[data-highlighted]` com o mesmo fundo do hover).
- **Hover só em ponteiro fino:** estilos de hover dentro de `@media (hover: hover) and (pointer: fine)`, para não "grudar" no toque.
- **`prefers-reduced-transparency`:** menus com `backdrop-filter` viram superfície sólida.
- **Composite widgets** (tabs, segmented, radio, menus, listbox, toolbars): uma parada de Tab e setas dentro (roving tabindex).
- **Overlays** levam o foco para dentro, prendem, fecham no Escape e devolvem o foco ao gatilho.
- **Status que muda sem foco do usuário** vai para `role="status"` / `aria-live="polite"`; erros bloqueantes `role="alert"`. Regiões carregando: `aria-busy="true"`.
- **Cópia animada é `aria-hidden`** e há um espelho em texto plano visualmente oculto.
- **Timers** (toasts, confirmações) **pausam** em hover, foco e aba oculta (`visibilitychange`).
- **Confirmação de ação em primeiro plano acontece no lugar** (o botão vira "Salvo"). Toast só para trabalho em segundo plano.
- **Estado nunca só por cor:** cor + rótulo, ícone ou texto.
- Sombras só em camadas flutuantes (menus, popovers, dialogs, sheets); cards ficam numa borda de 1 px. Sem gradientes decorativos ou glows em componentes.
- Alvos de toque ≥ 44 px; alturas de controle 36 / 44 / 50 px.

### 2.6 Tradução para os tokens do Prisma

As molas do Arc são físicas (Motion). Em CSS puro, a aproximação mais fiel é a função `linear()` (Chrome 113+, Firefox 112+, Safari 17.2+), com fallback para os nossos cubic-bezier. Calculei as curvas *(derivado)* com a fórmula de `visualDuration` do Motion (rigidez = (2π / (d × 1.2))², ζ = 1 − bounce, massa 1). O "visual" chega a ~97% em `d`; o assentamento completo (erro < 0,2%) é mais longo, e é essa a duração CSS.

| Preset Arc | Rigidez / amortecimento / ζ *(derivado)* | Assenta em | Pico | Fallback com nossos tokens |
|---|---|---|---|---|
| `smooth` 0.4 s, b 0 | 171 / 26.2 / 1.00 | 646 ms | 0.998 (sem overshoot) | `--ease-drawer` 480 ms |
| `snappy` 0.26 s, b 0.12 | 406 / 35.4 / 0.88 | 383 ms | 1.003 (0,3%) | `--ease-out` 260 ms |
| `morph` 0.42 s, b 0.16 | 155 / 20.9 / 0.84 | 648 ms | 1.008 (0,8%) | `--ease-out` 480 ms |

**Conclusão importante:** o nosso `--ease-spring` passa 4,3% do alvo, **5 a 14 vezes mais que as molas do Arc**. Pela regra 2.2, ele fica reservado para momentos lúdicos (favoritar, reação, check que "estala") e **nunca** vai em indicador de estado (switch, progresso, medidor de créditos, drawer, altura).

Mapa de uso:

| Situação | Prisma (CSS) |
|---|---|
| Cor, borda, fundo, opacidade de hover | `var(--dur-fast) var(--ease-out)` |
| Entrada de algo pequeno (tooltip, popover, menu) | `transform`/`opacity` em `var(--spring-smooth)` ou `--ease-out`; saída `var(--dur-exit)` (popover: 140 ms) |
| Press | entrada imediata `transform: scale(.97)` em `var(--dur-instant) var(--ease-out)`; soltar em `var(--spring-snappy)` |
| Destaque deslizante (nav, tabs, segmented, highlight de lista) | `var(--dur-spring-morph) var(--spring-morph)` |
| Painel, drawer, altura, progresso, medidor | `var(--dur-spring-smooth) var(--spring-smooth)` (ou `--ease-drawer`) |
| Movimento de algo já visível de um ponto a outro (carrossel, reorder) | `--ease-in-out` com `--dur-considered`, ou `--spring-smooth` |
| Lúdico (coração, reação, check pop) | `--ease-spring` |

Bloco de tokens proposto para `assets/css/motion.css`:

```css
:root {
  /* durações: mesmas do Arc */
  --dur-instant: 120ms;
  --dur-fast: 160ms;
  --dur-exit: 180ms;
  --dur-standard: 240ms;
  --dur-considered: 480ms;

  /* molas: fallback sem linear() */
  --spring-smooth: var(--ease-drawer); --dur-spring-smooth: 480ms;
  --spring-snappy: var(--ease-out);    --dur-spring-snappy: 260ms;
  --spring-morph:  var(--ease-out);    --dur-spring-morph: 480ms;

  --stagger-item: 35ms; --stagger-line: 80ms; --stagger-word: 40ms; --stagger-char: 16ms;
  --blur-subtle: 2px; --blur-soft: 4px; --blur-text: 8px;
}

/* Custom property com valor inválido não cai no fallback anterior (vira "invalid at computed time"),
   por isso as curvas linear() entram só dentro de @supports. */
@supports (transition-timing-function: linear(0, 1)) {
  :root {
    --spring-smooth: linear(0, .049, .157, .285, .411, .526, .624, .706, .772, .825, .867, .899, .924, .943, .957, .968, .976, .982, .987, .99, .993, .995, .996, .997, 1);
    --dur-spring-smooth: 650ms;
    --spring-snappy: linear(0, .043, .142, .265, .393, .513, .619, .709, .783, .842, .888, .923, .949, .967, .98, .989, .995, .999, 1.001, 1.002, 1.003, 1.003, 1.003, 1.002, 1);
    --dur-spring-snappy: 380ms;
    --spring-morph: linear(0, .047, .155, .289, .426, .553, .664, .755, .828, .885, .926, .956, .977, .991, 1, 1.005, 1.007, 1.008, 1.007, 1.007, 1.006, 1.005, 1.004, 1.003, 1);
    --dur-spring-morph: 650ms;
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-spring-smooth: 0ms; --dur-spring-snappy: 0ms; --dur-spring-morph: 0ms;
    --stagger-item: 0ms; --stagger-line: 0ms; --stagger-word: 0ms; --stagger-char: 0ms;
    /* --dur-fast / --dur-instant ficam: o ramo reduzido do Arc mantém fades curtos */
  }
}
```

Observação sobre interrupção: transições CSS retomam do valor computado atual quando o alvo muda (por isso o Arc usa **transitions, não keyframes**, no popover: reabrir no meio do fechamento reverte de onde está). Uma transição `linear()` interrompida não herda a velocidade da anterior; para gestos com arremesso (drawer, sheet, swipe de toast) usar o integrador de mola em JS do item 2.7.

### 2.7 Infraestrutura vanilla comum (proposta para `assets/js/motion.js`)

Helpers pequenos que quase todos os componentes abaixo usam:

1. **`Motion.reduced`**: `matchMedia('(prefers-reduced-motion: reduce)')` com listener de `change`; também espelhar em `document.documentElement.dataset.motion = 'reduce'` para o CSS.
2. **`glide(indicator, target, { instant })`**: um único elemento `.indicator` absoluto dentro do container. Mede `target.offsetLeft/Top/Width/Height`, aplica `transform: translate(x, y)` + `width`/`height` com transição `--spring-morph`. `instant` (teclado, resize, primeira aparição) aplica sem transição (classe `.is-instant` por um frame + `requestAnimationFrame`). `ResizeObserver` no container re-mede **sem** replay. Primeira aparição: não desliza de onde estava; nasce no lugar com `scale(.94)→1` em `--spring-snappy` + fade.
3. **`autoHeight(el, open)`**: lê altura atual em px, aplica a altura alvo (`scrollHeight` ou 0) com transição `--spring-smooth`, e no `transitionend` volta para `height: auto`. Retarget no meio: ler `getComputedStyle(el).height` e partir dele. Melhoria progressiva: `interpolate-size: allow-keywords` onde existir.
4. **`flip(container, mutate)`**: First (mede `getBoundingClientRect` dos filhos com `data-key`), muta o DOM, Last, Invert com `transform`, Play com WAAPI `el.animate(..., { duration: 650, easing: 'var(--spring-smooth)' resolvido })`. Se o deslocamento for longo, pular (o command palette do Arc "desliza quando o deslocamento é pequeno, encaixa quando é um salto longo").
5. **`roll(el, value)`**: dígitos em colunas `0–9` empilhadas, `transform: translateY(-n × 1em)` com `--spring-smooth`; direção conforme o número subiu ou desceu; `tabular-nums`; texto real em `.sr-only`, colunas `aria-hidden`.
6. **`presence(el, show)`**: entrada/saída com `data-state="open|closed"` + `@starting-style` e `transition-behavior: allow-discrete` (para `display`/`overlay` em `<dialog>`/`[popover]`), com fallback por classe + `transitionend`. Saída usa `--dur-exit`.
7. **`springDrag`**: integrador de mola (~40 linhas, rAF) para soltar gestos com velocidade: drawer, bottom sheet, swipe de toast. Rubber-band quando arrasta contra a borda.
8. **`announce(msg, { assertive })`**: uma região `aria-live` global (polite) e uma `role="alert"`, reaproveitadas.
9. **`pausableTimer(ms, { el })`**: pausa em `mouseenter`/`focusin` do elemento e em `visibilitychange` (aba oculta), retoma de onde parou.
10. **`roving(container, { orientation, wrap, selectOnFocus })`**: roving tabindex com setas, Home/End.

---

## 3. Componentes a adotar (free)

Formato de cada item: **URL**, tier, o que faz, especificação de interação (entrada, saída, hover, press, foco, interrupção), a11y, reduced motion, **Como portar para o Prisma (vanilla)** e **Onde no Prisma**.

### 3.1 Ações

#### Button (press, loading, label que morfa)
- **Docs:** https://uiarc.dev/components/button · **free**
- **O que faz:** botão nativo com feedback de press e rótulo que morfa a largura quando o conteúdo muda (Salvar → Salvo).
- **Interação:**
  - Press: escala ~**0.97** em mola `snappy`; botões só de ícone afundam um pouco mais.
  - Troca de rótulo: crossfade com **blur curto** enquanto a largura salta em mola (morph) para caber.
  - Loading: spinner, `aria-busy` + `aria-disabled` (não `disabled`), engole cliques **mantendo o foco**.
  - Gatilho de popup: **sem escala** no press (responde com cor).
  - Hover só em ponteiro fino.
- **A11y:** `<button>` nativo; ícone-only exige `aria-label`. Desabilitado primário esmaece inteiro; secundário/danger mantêm borda com fundo e rótulo esmaecidos.
- **Reduced motion:** sem escala; troca de rótulo com fade simples.
- **Como portar:** `.btn { transition: transform var(--dur-spring-snappy) var(--spring-snappy), background-color var(--dur-fast) var(--ease-out); } .btn:active { transform: scale(.97); transition-duration: var(--dur-instant); } .btn--icon:active { transform: scale(.94); }` *(0.94 derivado: a doc só diz "um pouco mais fundo")*. `[aria-haspopup] .btn:active { transform: none }`. Morph de rótulo: dois `<span>` sobrepostos em grid (`grid-area: 1/1`); a largura do botão anima medindo o novo span antes (`width` px → px em `--spring-morph`, depois `auto`). Loading: setar `aria-busy="true"`, `aria-disabled="true"` e bloquear `click` no handler, não usar `disabled`.
- **Onde no Prisma:** todos os botões; "Salvar" de skill/agente/perfil/admin confirmando no lugar ("Salvo"); botão Enviar do composer.

#### Action button (pendente → sucesso no próprio botão)
- **Docs:** https://uiarc.dev/components/action-button · **free**
- **O que faz:** CTA com seta à direita que roda uma ação async e morfa: idle → pendente → sucesso → idle.
- **Interação:** letras alteradas sobem de um blur suave enquanto a largura salta em mola; a seta sai para frente e um **check se desenha** (stroke draw). Press 0.97 `snappy`. Volta ao idle após **2400 ms** (`resetAfterMs`; 0 mantém sucesso). Erro: volta ao idle e chama o handler de erro.
- **A11y:** rótulo visível `aria-hidden` + cópia oculta como nome; pendente com `aria-busy` + `aria-disabled`; `role="status"` anuncia "Salvando" / "Salvo".
- **Reduced motion:** sem escala, sem mola de largura, sem stroke draw; fade instantâneo.
- **Como portar:** máquina de estados em `data-state="idle|pending|done"`; ícone check em SVG com `stroke-dasharray`/`stroke-dashoffset` animado em `--dur-standard var(--ease-out)`; seta sai com `translateX(6px)` + opacity em `--dur-exit` *(6 px derivado)*. Letras: só se o rótulo for curto; senão usar a troca de rótulo do Button.
- **Onde no Prisma:** "Publicar na galeria" (agente/skill), "Exportar dados" (perfil), "Salvar política" (admin usuários).

#### Confirm morph (exclusão inline com Desfazer)
- **Docs:** https://uiarc.dev/components/confirm-morph · **free**
- **O que faz:** botão destrutivo que morfa no lugar para pergunta inline → spinner → resultado com **Desfazer**. Modos: `press`, `hold`, `countdown`.
- **Interação:**
  - Só a **largura da pílula** se move: cresce em mola `morph`, encolhe em mola `smooth`. Cantos e texto nunca escalam.
  - Cada face fica na largura natural colada à borda inicial; a borda que salta revela o resto. A face nova entra em ordem de leitura, cada parte saindo de um blur pequeno; a velha some no lugar (fade). O check de "feito" estala e se desenha. Dígitos da contagem trocam em `tabular-nums`.
  - Modo `hold`: cópia sólida danger revelada da esquerda conforme segura; ao soltar cedo **drena de volta em mola**.
  - Tempos: pergunta sem resposta volta ao repouso em **6000 ms** (`confirmTimeout`); resultado fica **5000 ms** (`resultTimeout`); hold **1000 ms**; countdown **3 s**. Hover pausa os timers; aba oculta também. Clique fora cancela.
  - Proteção: **press nos primeiros 280 ms** após abrir e teclas auto-repetidas são ignorados (duplo clique ou Enter segurado nunca confirmam sem querer).
- **A11y:** face da pergunta é um grupo rotulado pelo prompt; Confirmar recebe foco (Enter = sim). Foco segue o morph: Confirmar → raiz (`aria-busy`) durante contagem/pendente → Desfazer ou Tentar de novo → gatilho no repouso. Escape cancela pergunta/contagem ou dispensa resultado. Live region polite anuncia prompt, pendente, resultado e "Desfazer disponível". No `hold`, Confirmar tem descrição "Pressione e segure"; soltar cedo anuncia que precisa segurar mais.
- **Reduced motion:** sem mola de largura, blur e draw; faces em crossfade; spinner mais lento; preenchimento do hold e anel da contagem continuam mostrando progresso.
- **Como portar:** um `<div class="confirm" data-state>` com 4 faces em grid sobreposto, só a face ativa e a que sai renderizadas (`hidden` nas outras). Largura: medir a face nova (`offsetWidth`) e animar `width` da pílula em px (`--spring-morph` ao crescer, `--spring-smooth` ao encolher), depois travar. Entrada das partes: `transition-delay: calc(var(--i) * var(--stagger-item))` com `filter: blur(var(--blur-subtle))→0` + opacity. Timers com `pausableTimer`. Guarda de 280 ms com `performance.now()` e `event.repeat`.
- **Onde no Prisma:** apagar conversa (menu da conversa e lista), apagar projeto/skill/agente nas listas, remover arquivo do projeto, despublicar da galeria. Substitui o `Prisma.confirm` modal na maioria dos casos (manter `dialog` só quando a consequência precisa de explicação, ver 3.3).

#### Hold to confirm
- **Docs:** https://uiarc.dev/components/hold-to-confirm · **free**
- **O que faz:** só confirma após segurar o botão; o preenchimento acompanha e rebobina se soltar cedo.
- **Interação:** fill em linha do tempo **linear** enquanto segura (padrão **1200 ms**); soltar cedo rebobina em mola `smooth`; re-press rápido retoma de onde estava. Press 0.97. Ao completar: rótulo morfa, largura salta, check se desenha; vibração curta no toque (`navigator.vibrate`). Deslizar **> 24 px** para fora cancela. O rótulo é desenhado duas vezes para trocar de cor exatamente na borda do fill.
- **A11y:** `aria-describedby` com dica oculta "Pressione e segure por N segundos. No teclado, segure Espaço ou Enter."; `role="status"` anuncia o rótulo de concluído; depois `aria-disabled`. Tab para fora cancela.
- **Reduced motion:** sem escala e sem mola de rebobinar; rótulo/ícone em fade; o fill continua acompanhando.
- **Como portar:** `pointerdown` + `setPointerCapture`; progresso por rAF (`(now - start) / duration`) escrito em `--p` → `clip-path: inset(0 calc(100% - var(--p) * 100%) 0 0)` na cópia sólida (rótulo duplo). Rebobinar: animar `--p` até 0 com WAAPI em `--spring-smooth` (registrar `--p` com `@property` para interpolar). `keydown` Space/Enter com `event.repeat` ignorado para iniciar e `keyup` para soltar.
- **Onde no Prisma:** "Apagar conta" (perfil) dentro do dialog de confirmação; admin "remover modelo" do catálogo.

#### Copy button
- **Docs:** https://uiarc.dev/components/copy-button · **free**
- **O que faz:** copia um valor e confirma no lugar (Copiado / Não foi possível copiar).
- **Interação:** ícones trocam através de um blur em mola **lenta, quase criticamente amortecida**; o check desenha o traço. Só as letras alteradas do rótulo se movem; o mesmo movimento ao contrário no reset. O rótulo **reserva a largura do maior dos 3 estados** (nunca empurra vizinhos).
- **A11y:** botão nativo nomeado pelo rótulo (inclusive ícone-only); `role="status"` polite anuncia "<rótulo>: Copiado" ou "<rótulo>: Não foi possível copiar".
- **Reduced motion:** troca de ícone e texto com fade instantâneo; sem stroke draw.
- **Como portar:** `navigator.clipboard.writeText` (contexto seguro; em `file://` pode falhar, então tratar estado de erro). Rótulos em grid sobreposto (reserva de largura sem JS). Ícones: dois SVG sobrepostos com `opacity` + `filter: blur(var(--blur-soft))` em `--spring-smooth`; check com `stroke-dashoffset`. Reset após ~1800 ms *(derivado do exemplo do button-group)*.
- **Onde no Prisma:** "Copiar" em cada resposta da IA, copiar link de compartilhamento, copiar blocos de código.

#### Icon morph
- **Docs:** https://uiarc.dev/components/icon-morph · **free**
- **O que faz:** 8 ícones de dois estados que morfam em vez de trocar: menu→fechar, play→pause, mais→check, copiar→check, sol→lua, chevron que gira, sino, coração.
- **Interação:** linhas giram e deslizam, formas interpolam o `d` do path, tudo em molas interrompíveis (alternar rápido reverte de onde está). Sino toca (badalo atrasado) e coração enche com pop + anel + faíscas, **uma vez por ativação**. Chevron: `turn` padrão 180°, ou 90° para direita→baixo.
- **A11y:** SVG `aria-hidden` + `focusable="false"`; o estado vai no botão (`aria-pressed`, `aria-expanded` ou rótulo que muda).
- **Reduced motion:** morphs instantâneos; sem toque nem estouro.
- **Como portar:** em vanilla, preferir **transform em grupos `<g>`** (rotate/translate com `transform-box: fill-box; transform-origin: center`) em vez de interpolar `d` (interpolação de path via CSS `d: path()` só funciona bem no Chromium). Menu→X: duas linhas giram ±45° e a do meio `scaleX(0)`. Chevron: `rotate` em `--spring-snappy`. Coração: `scale(.8→1)` em `--ease-spring` + anel `scale` com opacity (lúdico permitido).
- **Onde no Prisma:** hambúrguer do topo móvel; chevron do grupo "Outros" e de "Raciocínio"; favoritar na galeria (coração); botão Enviar ↔ Parar no composer (padrão de morph, ícone nosso).

#### Expanding button group (ações da mensagem)
- **Docs:** https://uiarc.dev/components/expanding-button-group · **free**
- **O que faz:** grupo de botões de ícone em que o apontado/focado cresce para revelar o rótulo enquanto os vizinhos deslizam; ações confirmam no lugar ("Arquivado").
- **Interação:**
  - Largura de cada botão salta em mola `morph` entre "só ícone" e "ícone + rótulo medido". Vizinhos deslizam no fluxo e a largura do grupo acompanha.
  - Slot do rótulo reserva o maior entre `label` e `doneLabel` (confirmação nunca muda a largura).
  - O ícone mantém o mesmo recuo à esquerda; o rótulo desliza de trás dele com fade e blur curtos e **recolhe mais rápido do que veio**.
  - Confirmação: check se desenha onde estava o ícone; palavra antiga sobe, nova entra; permanece **1400 ms** (`confirmDuration`).
  - Hover só com movimento real do ponteiro; para passar ao vizinho o ponteiro precisa estar **4 px dentro dele** (evita flip na fronteira).
  - Press encolhe levemente o **ícone**; a caixa nunca escala (a largura já é a animação).
  - Tamanhos: md **36 px**, sm **28 px** (ícones 16/14 px). Cinco ações com um rótulo aberto ≈ 260–280 px.
  - Toque: 1º toque expande, 2º executa; a ação de repouso executa no 1º.
- **A11y:** `role="toolbar"` com rótulo, uma parada de Tab, setas com wrap, Home/End. Cada botão tem o rótulo completo como nome mesmo recolhido; desabilitados com `aria-disabled` (focáveis, revelam rótulo, não fazem nada). Confirmação anunciada em live region polite; promessa em andamento seta `aria-busy`. Só foco de teclado expande.
- **Reduced motion:** rótulos e larguras mudam de uma vez com fade rápido; check aparece sem desenhar.
- **Como portar:** cada botão com `width` animada em px (`--spring-morph`), medida a partir de um "fantasma" invisível do rótulo; alinhar o grupo pela borda inicial e reservar a largura máxima no layout. `pointermove` com teste de 4 px. Roving com `roving()`.
- **Onde no Prisma:** barra de ações de cada resposta da IA (Copiar, Refazer, Avaliar 👍/👎, Compartilhar). Alternativa mais sóbria: `floating-button-group` (3.1 abaixo) se rótulos expansíveis parecerem demais para o chat.

#### Floating button group / Button group (destaque compartilhado em toolbar)
- **Docs:** https://uiarc.dev/components/floating-button-group · https://uiarc.dev/components/button-group · **free**
- **O que faz:** um único destaque que viaja de botão em botão (posição e tamanho) seguindo ponteiro ou foco; press assenta no lugar. Button group une os segmentos numa superfície com divisores finos.
- **Interação:**
  - Floating: destaque viaja em mola `morph`; fica parado ao cruzar gaps/separadores; **aparecendo do nada, nasce no lugar crescendo de 94% em `snappy`** (não desliza de onde estava); some com fade ao sair da bandeja. Press escurece o destaque e o assenta em **96,5%** em `snappy`; os botões nunca escalam. Alturas 30/36 px.
  - Button group: destaque em `snappy`; divisores ao lado do segmento destacado **somem com fade**; press afunda o conteúdo para **0.97** (**0.9** em ícone-only) e volta; o chevron do menu não escala (ancora popup). Menu cresce da borda com offset e escala curtos e sai mais rápido. Alturas 34/42 px.
  - Rótulo que muda (Compartilhar → Copiado): crossfade com subida curta e blur; `reserveLabels` mantém a largura do maior.
- **A11y:** `role="toolbar"` (floating) ou `role="group"` (button group), `aria-orientation`; ícone-only com tooltip mostrando rótulo e atalho; modo ligado com `aria-pressed`. O destaque é o indicador de teclado e só aparece para foco de teclado (clique não deixa destaque para trás).
- **Reduced motion:** destaque pula e faz fade breve; rótulos em crossfade sem deslocamento.
- **Como portar:** `glide()` do item 2.7 com primeira aparição `scale(.94)→1`; listener nativo `pointerleave` na bandeja. Reserva de rótulos com grid de fantasmas.
- **Onde no Prisma:** toolbar do composer (anexar, imagem, skills, agente); controles de visualização da galeria; ações em lote nas tabelas do admin.

### 3.2 Seleção e navegação

#### Morph select (seletor de modelo)
- **Docs:** https://uiarc.dev/components/morph-select · **free**
- **O que faz:** select cujo gatilho cresce e vira a própria lista, com destaque deslizante, type-ahead, grupos, ícones/meta e busca opcional.
- **Interação:**
  - Abrir: a superfície do gatilho cresce até a lista em **mola física com leve bounce** (`morph`), com o **raio do canto morfando** junto. Fechar: dobra de volta **sem overshoot** (`smooth`).
  - Um destaque desliza entre opções (só segue mouse em ponteiro fino; no toque, toque escolhe direto).
  - Ao escolher: o rótulo escolhido sai da lista e **voa até o gatilho** enquanto a largura do gatilho salta.
  - Valor no gatilho rola para cima ou para baixo conforme a nova opção esteja depois ou antes na lista.
  - Medidas: `panelWidth` **272 px** (nunca mais estreito que o gatilho), `maxListHeight` **296 px**, busca automática **acima de 8 opções**. Gatilho fechado até `min(20rem, 100vw − 2rem)`; lista `max(largura do gatilho, min(panelWidth, 100vw − 2rem))`. `align="end"` para gatilhos perto da borda direita.
- **Teclado:** Enter/Espaço/↓/↑ abrem na opção selecionada; ↑/↓ movem pulando desabilitadas; PageUp/PageDown movem **8**; Home/End; **Alt+↑ escolhe e fecha**; caracteres imprimíveis fazem type-ahead ou iniciam a busca; Escape fecha e devolve foco; Tab fecha sem escolher.
- **A11y:** gatilho `role="combobox"` + `aria-haspopup="listbox"` + `aria-expanded` + `aria-activedescendant`. Com busca, o input assume o papel de combobox (`aria-autocomplete="list"`) e o gatilho fica `inert`. Opções `role="option"` com `aria-selected`/`aria-disabled`; grupos `role="group"` rotulados. Status polite com nº de resultados ou "Nenhum resultado".
- **Reduced motion:** tamanho pula; sem voo e sem rolagem; fades curtos.
- **Como portar:** um único `<div class="morph-select">` cujo `width`, `height` e `border-radius` animam (px → px) em `--spring-morph` ao abrir e `--spring-smooth` ao fechar; conteúdo da lista com `opacity` atrasada ~1 `--stagger-item`. Voo do rótulo: FLIP do texto escolhido (mede origem na lista e destino no gatilho, anima `transform` com WAAPI). Rolagem do valor: dois spans, `translateY(±100%)` conforme índice. Focus fica no gatilho/input (`aria-activedescendant`), não nas opções. **No composer, o gatilho fica embaixo:** crescer para cima (âncora inferior, variação nossa).
- **Onde no Prisma:** **seletor de modelo** do início e do chat (grupos "Destaques" e "Outros", ícone/logo do provedor, meta = provedor/preço/contexto, busca acima de 8); seletor de modelo no formulário de agente; filtro de modelo no admin.

#### Select
- **Docs:** https://uiarc.dev/components/select · **free**
- **O que faz:** select compacto (Radix) para lista curta fixa.
- **Interação:** opção posterior sobe de baixo, anterior desce de cima, com blur suave. Gatilho **nunca escala** no press. Menu = largura do gatilho, até `min(24rem, 100vw − 20px)` e **320 px** de altura, depois rola; backdrop blur vira sólido com `prefers-reduced-transparency`.
- **Teclado/A11y:** Enter/Espaço/↓ abre; ↑/↓; Enter/Espaço escolhe; Escape fecha; type-ahead por letra. Label com `for`, descrição por `aria-describedby`; valor real oculto e cópia animada `aria-hidden`.
- **Reduced motion:** crossfade instantâneo.
- **Como portar:** `<select>` nativo estilizado quando o menu nativo bastar (formulários do admin), ou listbox custom reaproveitando a infra do morph select sem o crescimento.
- **Onde no Prisma:** ordenação da galeria, categoria em skill/agente, papel/plano no admin.

#### Segmented control
- **Docs:** https://uiarc.dev/components/segmented-control · **free**
- **O que faz:** 2 a 5 visões curtas do mesmo conteúdo, com uma pílula de seleção que desliza.
- **Interação:** pílula compartilhada desliza em mola `morph`; uma por instância. Linha `max-width: 100%` rola horizontal com scrollbar oculta; segmentos não encolhem nem quebram. `onOptionIntent`: dispara ao ponteiro/foco chegar num segmento **antes** de escolher (pré-carregar).
- **Teclado/A11y:** `role="group"` rotulado, `<button aria-pressed>`; só o selecionado é parada de Tab; setas selecionam e focam com wrap; Home/End. Pílula `aria-hidden`.
- **Reduced motion:** pílula move instantânea; transições dos botões desligadas.
- **Como portar:** `glide()` com `.indicator` absoluto; `aria-pressed` + `roving({ selectOnFocus: true })`; prefetch no `pointerenter`/`focus`.
- **Onde no Prisma:** galeria **Agentes / Skills** e **Explorar / Favoritos**; período do admin uso (**7 / 30 / 90 dias**, como no exemplo de dashboard do Arc); modalidade **Texto / Imagem** no composer.

#### Tabs
- **Docs:** https://uiarc.dev/components/tabs · **free**
- **O que faz:** visões pares do mesmo objeto, cada uma trocando um painel.
- **Interação:** pílula desliza entre gatilhos em mola `morph`; painéis **deslizam 8 px na direção do movimento** enquanto a **altura salta** do painel anterior (`smooth`). Gatilhos com mínimo **5.5rem**; lista rola com botões nas bordas quando transborda; focar uma aba a traz à vista.
- **Teclado/A11y:** `tablist`/`tab`/`tabpanel`, `aria-selected`, `aria-controls`; ←/→ movem e ativam; Home/End; Tab vai para o painel. Painel que sai fica `inert` enquanto some. Botões de rolagem rotulados ("Rolar abas para a esquerda").
- **Reduced motion:** pílula troca instantânea; painéis em crossfade no lugar sem animar altura.
- **Como portar:** `glide()` + `autoHeight()` no container dos painéis + `translateX(±8px)` com opacity no painel que entra; direção = índice novo vs antigo.
- **Onde no Prisma:** detalhe de item da galeria (Visão geral / Instruções / Avaliações), editor de agente (Configurar / Testar), página do projeto (Conversas / Arquivos / Contexto).

#### Destaque de navegação lateral (padrão, sem componente free dedicado)
- **Referências:** pílula compartilhada do segmented-control/tabs e o "gliding active link" do bloco free `site-header` (https://uiarc.dev/components/blocks/site-header). As sidebars de app do Arc (`sidebar-rail`, `workspace-sidebar`) são **Pro** (ver seção 4).
- **Especificação a aplicar:** um único indicador por lista; item ativo com pílula que desliza em `--spring-morph` ao navegar; hover com fundo `--surface-muted` em `--dur-fast` (sem destaque deslizante no hover, para não competir com o ativo); `aria-current="page"` no ativo. Recolher a barra: largura em `--spring-smooth` com rótulos em fade de `--dur-fast` (rótulos somem antes de encolher, voltam depois de abrir, como o expandable-card).
- **Onde no Prisma:** sidebar (Início, Projetos, Skills, Agentes, Galeria, Admin) e item ativo na lista de conversas recentes.

#### Chip group
- **Docs:** https://uiarc.dev/components/chip-group · **free**
- **O que faz:** chips de filtro alternáveis que morfam ao selecionar; conjuntos longos dobram atrás de "+N".
- **Interação:** selecionar faz um check crescer, desliza o rótulo e salta a borda do chip enquanto os vizinhos deslizam para novas posições (inclusive entre linhas); revelados entram em stagger **limitado a 0,3 s no total**; altura do grupo morfa. Selecionados sempre ficam visíveis mesmo além de `maxVisible`.
- **A11y:** `role="group"` rotulado, chips `<button aria-pressed>`, roving tabindex, "+N" com `aria-expanded`.
- **Reduced motion:** fades curtos.
- **Como portar:** `flip()` nos chips + `autoHeight()` no grupo; check com `scale(0→1)` em `--spring-snappy`.
- **Onde no Prisma:** categorias da galeria; filtros Todos / Asimov / Favoritos no "conversar com um agente".

#### Multi-select
- **Docs:** https://uiarc.dev/components/multi-select · **free**
- **O que faz:** escolhe vários valores de uma lista fixa mostrando chips com "+N" rolante.
- **Interação:** chips abrem a largura do slot em `smooth` e crescem de **0.9** com blur; "+N" rola; checks se desenham no menu; menu entra levemente de cima. `maxVisible` padrão **2**; chips até **9rem** com ellipsis.
- **A11y:** gatilho `aria-haspopup="listbox"` + `aria-expanded` + `aria-labelledby` (label + lista oculta dos selecionados); menu `role="listbox"` `aria-multiselectable`.
- **Reduced motion:** crossfade curto sem escala nem largura.
- **Onde no Prisma:** escolher **até 5 skills** na conversa e no agente (com bloqueio no 6º e mensagem); skills do agente no formulário.

#### Combobox
- **Docs:** https://uiarc.dev/components/combobox · **free**
- **O que faz:** busca e escolhe um valor de lista longa sem sair do campo.
- **Interação:** popover entra levemente de cima; altura da lista acompanha o filtro em `smooth`; rótulo escolhido sobe no campo com blur suave; botão limpar entra com escala. Lista até `min(300px, 40vh)`.
- **A11y:** input `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant`; vazio em linha `role="status"`; limpar rotulado.
- **Onde no Prisma:** escolher agente no menu + (busca), mover conversa para projeto.

#### Switch
- **Docs:** https://uiarc.dev/components/switch · **free**
- **O que faz:** liga/desliga que vale na hora.
- **Interação:** ao pressionar, o thumb **estica em direção ao outro lado** (como dedo segurando); ao soltar atravessa em mola `snappy`. Só transições CSS.
- **A11y:** `role="switch"` + `aria-checked`; Espaço/Enter alternam (segurar Espaço estica). Em linha de configurações, `aria-labelledby` no título e `aria-describedby` na descrição.
- **Reduced motion:** sem esticar; thumb move instantâneo.
- **Como portar:** `button[role=switch]`; `:active .thumb { width: calc(var(--thumb) + 6px) }` *(6 px derivado)* com `transform` para o lado oposto ancorado; `transition: transform var(--dur-spring-snappy) var(--spring-snappy), width var(--dur-fast) var(--ease-out)`. Atenção: o thumb reporta estado, então o overshoot de 0,3% do snappy é o máximo aceitável; **não** usar `--ease-spring`.
- **Onde no Prisma:** admin modelos (ligado, visível), perfil (preferências), skills ligadas na conversa.

#### Checkbox e Radio cards
- **Docs:** https://uiarc.dev/components/checkbox · https://uiarc.dev/components/radio-cards · **free**
- **Interação:** checkbox: fundo escala em `snappy` enquanto o path do check se desenha; indeterminado morfa o mesmo path num traço. Radio cards: **um anel** salta para a caixa e o tamanho do card escolhido (resize re-encaixa sem replay); ponto indicador escala em `snappy`. Grid com colunas mínimas de **180 px**.
- **A11y:** checkbox `role="checkbox"` `aria-checked` (inclui `mixed`). Radio cards `role="radiogroup"` + `role="radio"` com `aria-checked`, roving (setas selecionam), `disabledReason` como descrição.
- **Reduced motion:** estados instantâneos.
- **Onde no Prisma:** seleção em lote nas tabelas do admin (checkbox com indeterminado no cabeçalho); "modelo padrão" no admin e estilo de resposta no agente (radio cards); termos no login (checkbox).

### 3.3 Overlays

#### Dialog
- **Docs:** https://uiarc.dev/components/dialog · **free**
- **O que faz:** superfície focada para decisões que precisam interromper.
- **Interação:** overlay faz fade com **backdrop blur de 7 px**; painel sobe **8 px** e escala de **0.96** em mola `smooth`; fechar é **mais curto** e retoma do estado atual. Mudança de título/descrição sobe com blur suave. Largura `min(100vw − 32px, 440px)`, altura limitada à viewport (rola dentro).
- **A11y:** `role="dialog"` + `aria-modal`, foco preso, devolvido ao gatilho; título/descrição em `aria-labelledby`/`aria-describedby`; fechar com `aria-label="Fechar"`. Escape fecha.
- **Reduced motion:** só opacidade.
- **Como portar:** `<dialog>` nativo com `showModal()` (top layer, `inert` no resto, Escape). Entrada com `@starting-style { opacity: 0; transform: translateY(8px) scale(.96) }` e `transition: opacity var(--dur-standard) var(--ease-out), transform var(--dur-spring-smooth) var(--spring-smooth), display var(--dur-spring-smooth) allow-discrete, overlay … allow-discrete`. Saída com `--dur-exit`. `::backdrop { backdrop-filter: blur(7px) }` (e sólido sob `prefers-reduced-transparency`). Guardar o gatilho e focá-lo no `close`.
- **Onde no Prisma:** apagar conta (com digitação de confirmação + hold-to-confirm), compartilhar conversa por link, novo projeto, "Escolher modelo com imagens" quando bloqueia o envio.

#### Drawer
- **Docs:** https://uiarc.dev/components/drawer · **free**
- **O que faz:** painel lateral temporário para trabalho focado (formulário longo, filtros, detalhe de registro).
- **Interação:** entra da borda em mola (`smooth`); **sai mais rápido em tween**; arrastar o cabeçalho **além de 1/3 do painel** ou um flick rápido fecha mantendo a velocidade de soltura; arrastar para longe da borda faz rubber-band; overlay em fade com **backdrop blur de 4 px**. Esquerda/direita `min(30rem, 100vw − gutter)`; abaixo de **40rem** quase largura total. Cabeçalho é a alça (`touch-action: none`), corpo rola normal.
- **A11y:** dialog modal com foco preso e devolvido; título/descrição sempre presentes; fechar rotulado; arrastar nunca é o único jeito de fechar.
- **Reduced motion:** sem arrastar; slide trocado por fade curto.
- **Como portar:** `<dialog class="drawer">` + `transform: translateX(100%) → 0` em `--dur-spring-smooth var(--spring-smooth)` (ou `--ease-drawer` 500 ms); saída `--dur-exit` (tween, `--ease-out`). Arraste com `springDrag`: limiar de flick **480 px/s** *(derivado: a doc não dá número; reaproveitei o do toast)*; rubber-band com fator ~0.2 *(derivado)*.
- **Onde no Prisma:** **editar/novo modelo no admin**, editar política de teto, detalhe de usuário no admin, painel de skills da conversa, detalhe de evento no admin uso.

#### Bottom sheet
- **Docs:** https://uiarc.dev/components/bottom-sheet · **free**
- **O que faz:** sheet modal que repousa em alturas (detents) e segue o dedo.
- **Interação:** detents padrão **[0.45, 0.92]** da altura dinâmica da viewport; arraste 1:1; rubber-band acima do maior detent; soltar projeta a velocidade para escolher detent ou fechar; **o escurecimento do fundo é função da posição** (acompanha o arraste, não um timer). Largura `min(100%, 36rem)`. No toque, arrastar o conteúdo move o sheet até abrir tudo, depois o conteúdo rola.
- **A11y:** dialog com foco no próprio sheet; alça é botão com `aria-expanded` ("Expandir/Recolher"); ↑/↓ mudam detent, Home/End extremos, Enter/Espaço alternam; mudanças anunciadas; tabular para conteúdo abaixo da dobra expande o sheet.
- **Reduced motion:** pula entre detents; fade de entrada e saída.
- **Como portar:** `<dialog>` + `springDrag` com variável `--y` que controla `transform` e `--dim` (opacidade do backdrop) calculada da posição.
- **Onde no Prisma:** no celular: seletor de modelo, menu +, menu da conversa, filtros da galeria.

#### Popover
- **Docs:** https://uiarc.dev/components/popover · **free**
- **O que faz:** superfície pequena ancorada, não modal, com conteúdo interativo.
- **Interação:** **transições CSS puras, sem runtime de motion** (o mais fácil de portar): painel faz fade e assenta a partir de **5 px** em direção ao gatilho em escala **0.97**, em mola; **sai em 140 ms**. Transições em vez de keyframes para que reabrir no meio do fechamento reverta. `sideOffset` **6 px**, `collisionPadding` **10 px**; largura entre **12rem** e `min(22rem, 100vw − 20px)`; inverte o lado perto das bordas. Gatilho **sem escala** no press.
- **A11y:** gatilho `aria-expanded`, `aria-controls`, `aria-haspopup="dialog"`; foco entra no conteúdo e volta ao gatilho; dar heading ou `aria-label` quando tiver controles.
- **Reduced motion:** sem transform, só fade curto.
- **Como portar:** atributo `popover` nativo + `popovertarget` (light dismiss e Escape de graça), `@starting-style` para entrada e `transition-behavior: allow-discrete`. Posicionamento: CSS anchor positioning onde houver; fallback JS (`getBoundingClientRect`, flip, padding 10 px). `transform-origin` no lado do gatilho.
- **Onde no Prisma:** menu + do composer, prompts salvos, "Adicionar ao projeto", NPS.

#### Tooltip
- **Docs:** https://uiarc.dev/components/tooltip · **free**
- **O que faz:** rótulo de uma linha para controles desconhecidos (hover e foco).
- **Interação:** abre após **250 ms** com subida de **3 px** a partir de **0.97**; **até 300 ms depois de outro tooltip, abre instantâneo só com fade** (andar pela toolbar mostra rótulos na hora). Conteúdo que muda com ele aberto sobe com blur e a bolha salta para o novo tamanho. Máx. **15rem**; lado padrão em cima, inverte perto da borda.
- **A11y:** `role="tooltip"` + `aria-describedby` no gatilho; nunca conteúdo interativo; ícone-only ainda precisa do próprio `aria-label`. Escape fecha.
- **Reduced motion:** sem transform, fade de **90 ms**.
- **Como portar:** um único tooltip global reposicionado; timestamp do último fechamento para pular o atraso (< 300 ms); abrir em `focusin` também; esconder em `pointer: coarse`.
- **Onde no Prisma:** sidebar recolhida (rótulos), botões de ícone do composer e das ações da mensagem, modelos com capacidades (lê imagem, arquivos).

#### Hover card
- **Docs:** https://uiarc.dev/components/hover-card · **free**
- **Interação:** `openDelay` **500 ms**, `closeDelay` **140 ms**; cresce da borda do gatilho: escala de **0.96** + **4 px** em `smooth`, fade separado; até 300 ms de outro card, abre após **80 ms** só com fade; linhas de perfil assentam com stagger. Largura **18.5rem**. Teclado: foco abre na hora; Enter abre sem atraso; Escape fecha. No toque, toque alterna.
- **A11y:** `role="tooltip"`, foco nunca entra (conteúdo só leitura).
- **Onde no Prisma:** prévia do autor/agente na galeria; prévia de modelo na lista do admin. Opcional.

#### Dropdown menu
- **Docs:** https://uiarc.dev/components/dropdown-menu · **free**
- **O que faz:** lista de comandos ancorada num gatilho rotulado.
- **Interação:** menu **escala a partir do gatilho**; itens entram com fade em stagger curto (`stagger.item` 35 ms); **destaque desliza em `snappy` para o ponteiro e pula instantâneo para o teclado**; novo rótulo do gatilho sobe enquanto a largura salta. Largura mínima **12rem**, colisão com padding **12 px**; backdrop translúcido vira sólido com `prefers-reduced-transparency`.
- **Teclado/A11y:** Enter/Espaço/↓ abre; ↑/↓ com loop; Home/End; Escape fecha e devolve foco; type-ahead; `menuitem`; desabilitados pulados; destrutivo por último, com separador.
- **Reduced motion:** sem transform e sem deslize do destaque; fade rápido.
- **Como portar:** `[popover]` + `role="menu"`; `glide()` vertical para o destaque (com `instant` em navegação por teclado); `transform-origin` no canto do gatilho; `scale(.96)→1` *(0.96 derivado, alinhado ao dialog/hover card)*.
- **Onde no Prisma:** menu "⋯" da conversa (renomear, mover para projeto, baixar .md, compartilhar, apagar), menu de cada card de projeto/skill/agente, ações de linha no admin.

#### Context menu
- **Docs:** https://uiarc.dev/components/context-menu · **free**
- **Interação:** menu cresce **a partir do ponteiro** em `snappy` (mesmo quando empurrado da borda); reabrir faz o antigo sumir no lugar; destaque desliza para ponteiro e pula para teclado. Preso **8 px** dentro da viewport, altura máx. **300 px**; fecha em scroll/resize. Abre por clique direito, Shift+F10 ou tecla ContextMenu; no toque, um toque abre.
- **A11y:** alvo focável com `aria-haspopup="menu"` + `aria-expanded`; abrir foca o 1º item; fechar devolve o foco.
- **Onde no Prisma:** clique direito em conversas da sidebar e em cards de projeto/agente (sempre com o menu "⋯" visível como caminho principal).

#### User menu
- **Docs:** https://uiarc.dev/components/user-menu · **free**
- **Interação:** painel escala e faz fade **saindo do avatar** em mola **sem overshoot**; linhas entram com stagger curto; fechar é fade rápido; destaque desliza para ponteiro e teclado; thumb do seletor de tema desliza. Largura **17.5rem**; abaixo de **640 px** vira bottom sheet que segue arraste para baixo.
- **A11y:** gatilho "Menu da conta, <nome>", `aria-haspopup="menu"`; linhas `menuitem`; grupos de `menuitemradio`; Escape/Tab fecham e devolvem foco ao avatar; type-ahead.
- **Onde no Prisma:** rodapé da sidebar (avatar, perfil, créditos, admin, sair).

#### Command palette (⌘K)
- **Docs:** https://uiarc.dev/components/blocks/command-palette · **free** (bloco)
- **O que faz:** superfície de busca e execução por teclado com resultados agrupados e atalhos.
- **Interação:** painel **sobe em mola**; o quadro de resultados **salta para a altura da lista** conforme o filtro; linhas restantes deslizam para o lugar quando o deslocamento é pequeno e **encaixam quando é um salto longo**; destaque em mola para o ponteiro e **desliza em 70 ms para as setas**. Resultados com altura máx. **342 px**; abaixo de **480 px** esconde os atalhos; abaixo de **340 px** o rodapé perde a última dica.
- **Teclado:** **Cmd/Ctrl+K** foca de qualquer lugar; ↑/↓; Home/End; Enter executa; **Escape limpa a busca, e com busca vazia fecha**.
- **A11y:** input `role="combobox"` + `aria-controls` + `aria-activedescendant` (foco nunca sai do input); resultados `role="option"` com `aria-selected` em `role="group"` rotulados. É inline: para prender foco, colocar dentro de um dialog.
- **Reduced motion:** sem entrada, sem deslizes, sem viagem do destaque.
- **Como portar:** `<dialog>` + input; `autoHeight()` no quadro; `flip()` só se Δy < ~48 px *(limiar derivado)*; destaque com `glide()` (70 ms `--ease-out` no teclado, `--spring-morph` no ponteiro). Filtro por substring em rótulo, descrição, grupo e palavras-chave. Atalho não deve roubar teclas de campos de texto.
- **Onde no Prisma:** **⌘K global**: nova conversa, ir para projeto/skill/agente, buscar conversas, trocar modelo, abrir galeria, ações de admin.

### 3.4 Feedback

#### Toast stack (estilo Sonner)
- **Docs:** https://uiarc.dev/components/toast-stack · **free** (o `toast` simples: https://uiarc.dev/components/toast)
- **O que faz:** fila app-wide de resultados de trabalho em segundo plano, erros e desfazer; toasts empilham e se abrem em leque.
- **Interação:**
  - Entrada: novos toasts **sobem da própria altura abaixo da borda**.
  - Pilha: os antigos ficam atrás com **espiadas de 14 px** e **degraus de escala de 0.05**; **3 visíveis**, até **12** guardados; abrem em leque no hover ou foco em mola `morph`.
  - Swipe para a direita segue o dedo e arremessa com velocidade; para a esquerda faz rubber-band. (Toast simples: dispensa **além de 80 px ou 480 px/s**; entra subindo **16 px** de **0.96** em `morph` com check se desenhando; fecha afundando **8 px** com fade.)
  - Update no lugar: ícone, texto, altura e largura do botão de ação morfam (carregando → sucesso/erro).
  - Tempo: base **5000 ms**; **avisos e erros 1,6× (8000 ms)**; carregando espera update. Timers pausam em hover, foco, arraste e aba oculta. (Toast simples: 4500 ms, sem pausa.)
  - Largura `min(22.5rem, 100% − 32px)`; abaixo de **30rem** centraliza embaixo; abaixo de **21rem** de toast o botão de ação desce para baixo do texto.
- **Teclado:** **Alt+T** foca o toast da frente e abre o leque; Tab entre ações e fechar; Escape dispensa o focado.
- **A11y:** `section` rotulada com `aria-live="polite"` e `aria-relevant="additions text"`; prefixo oculto por tipo ("Erro:"); toasts ocultos/saindo `inert`; ao fechar o focado, foco vai ao próximo ou volta à origem.
- **Reduced motion:** posições pulam; fades curtos.
- **Como portar:** container fixo; cada toast `position: absolute; bottom: 0` com `transform: translateY(calc(var(--i) * -14px)) scale(calc(1 - var(--i) * .05))` e `opacity: 0` para `--i ≥ 3`; leque: `translateY(-offsetAcumulado)` calculado em JS a partir das alturas (`ResizeObserver`); transição `--spring-morph`. Entrada `@starting-style { transform: translateY(100%) }`. Swipe com `springDrag`. API: `Prisma.toast({ type, title, description, action, duration }) → id`, `Prisma.toast.update(id, patch)`, `Prisma.toast.dismiss(id?)`.
- **Onde no Prisma:** substitui o `Prisma.toast` atual. Usos certos: "Conversa apagada · Desfazer", exportação pronta, falha de upload em segundo plano, link de compartilhamento criado, erro de rede. **Não** usar para "Copiado" ou "Salvo" (confirmam no lugar).

#### Alert
- **Docs:** https://uiarc.dev/components/alert · **free**
- **Interação:** presença colapsa/expande a altura em `smooth` com fade (o conteúdo de baixo fecha o vão); troca de tom morfa o ícone por escala pequena + blur; texto novo sobe enquanto a altura salta.
- **A11y:** `danger` usa `role="alert"`; demais `role="status"`; cópias saindo `aria-hidden`; dispensar rotulado "Dispensar: <título>".
- **Reduced motion:** fades curtos sem altura.
- **Onde no Prisma:** créditos acabando (aviso persistente no início), alertas de custo no admin uso, erro de carregamento com "Tentar de novo", imagem anexada + modelo sem visão (inline acima do composer).

#### Skeleton
- **Docs:** https://uiarc.dev/components/skeleton · **free**
- **O que faz:** reserva espaço enquanto carrega e faz crossfade para o conteúdo.
- **Interação:** blocos pulsam numa **onda em stagger** (cada um um tempo depois do de cima). Ao carregar: placeholder some em fade, conteúdo **sobe 4 px** para o lugar e a altura salta do placeholder para o conteúdo. Linhas em % da largura; 1 a 6 linhas; avatar opcional.
- **A11y:** `role="status"` + `aria-busy` + `aria-label` ("Carregando conteúdo"); formas `aria-hidden`.
- **Reduced motion:** pulso para; troca com fades curtos sem altura.
- **Como portar:** pulso em CSS `@keyframes pulse { 50% { opacity: .55 } }` com `animation-delay: calc(var(--i) * var(--stagger-line))` *(opacidade e delay derivados)*; troca com `autoHeight()` + `translateY(4px)→0`.
- **Onde no Prisma:** listas de conversas, projetos, skills, agentes, galeria (cards), tabelas e KPIs do admin, histórico ao abrir uma conversa.

#### Text shimmer ("Pensando…")
- **Docs:** https://uiarc.dev/components/text-shimmer · **free**
- **O que faz:** luz calma passando pelas palavras para indicar trabalho em andamento.
- **Interação:** faixa de brilho em forma de sino, na cor do texto, varre **linearmente** sobre uma base esmaecida, com **pausa breve entre passadas**; **1.8 s por varredura**. Só roda se ativo, **dentro de 64 px da viewport** e com a página visível; pausada retoma de onde parou. Ao ficar inativo, a faixa sai deslizando e o texto assenta sólido. Rótulo novo sobe com blur suave. Em `forced-colors`, gradiente removido.
- **A11y:** `aria-busy` enquanto ativo; texto real legível; anunciar conclusão na própria live region.
- **Reduced motion:** varredura para; troca de rótulo com fade.
- **Como portar:** `background: linear-gradient(90deg, var(--text-muted) 0 40%, var(--foreground) 50%, var(--text-muted) 60% 100%) ; background-size: 250% 100%; background-clip: text; color: transparent; animation: shimmer 1.8s linear infinite` com a pausa embutida nos keyframes (ex.: varre de 0% a 75% do tempo, parado no resto) *(proporção derivada)*; `IntersectionObserver` com `rootMargin: 64px` e `visibilitychange` para `animation-play-state`. Desligar com `active=false` mudando para cor sólida em `--dur-standard`.
- **Onde no Prisma:** "Pensando…" antes do primeiro token, "Lendo arquivos", "Gerando imagem", "Raciocinando". O texto da resposta em si não usa shimmer.

#### Progress
- **Docs:** https://uiarc.dev/components/progress · **free**
- **Interação:** **uma mola `smooth` move o preenchimento e o número contado**, sempre em acordo. O preenchimento **desliza da esquerda para manter a ponta arredondada** (transform, não width). Em 100% vira cor de sucesso e um check assenta ao lado do número.
- **A11y:** `role="progressbar"` com `aria-valuemin/max/now` e `aria-valuetext` em %; não é live region (anunciar conclusão à parte).
- **Reduced motion:** pula preenchimento e número.
- **Como portar:** trilho com `overflow: hidden`; preenchimento `width: 100%; transform: translateX(calc((var(--p) - 1) * 100%))` em `--spring-smooth`; número via `roll()` ou contagem rAF com a mesma curva.
- **Onde no Prisma:** upload de arquivos (projeto, composer), exportação de dados.

#### Usage meter (medidor de créditos)
- **Docs:** https://uiarc.dev/components/usage-meter · **free**
- **O que faz:** barra segmentada do que ocupa uma franquia e quão perto está do limite, com total rolante, badge de status e legenda interativa.
- **Interação:** segmentos **crescem da esquerda para a direita** ao entrar em vista (**40%** visível), depois refluem **cada um na sua mola** quando os valores mudam; passar do limite faz surgir em fade uma **área hachurada de excesso** e um **marcador de limite**. Dígitos rolam como odômetro na direção da mudança; badge de status salta para a nova largura. `warnAt` **0.9** (90%). Legenda em grid `auto-fit` com colunas mínimas de **108 px**; hover destaca categoria (toque fixa).
- **A11y:** `role="group"` rotulado; barra `role="img"` com resumo textual de todos os segmentos e status; números rolantes `aria-hidden` com texto oculto; mudanças de status (perto do limite, acima do limite) em live region polite; legenda com botões `aria-pressed`, roving por setas, Enter/Espaço fixam, Escape limpa.
- **Reduced motion:** valores pulam; texto com fades curtos.
- **Como portar:** segmentos como `transform: scaleX()` com `transform-origin: left` dentro de flex com `flex-basis` em % *(ou largura em % animada, pois aqui o tamanho é a informação)*; `IntersectionObserver` threshold 0.4; excesso com `repeating-linear-gradient` hachurado (único gradiente permitido, é dado e não decoração); `roll()` nos números.
- **Onde no Prisma:** **créditos do usuário** (`credits.used / dailyLimit / limit / renews`): compacto na sidebar (barra + "x de y hoje"), completo no perfil (diário e semanal); no admin usuários, gasto contra teto semanal/mensal por linha.

#### Empty state
- **Docs:** https://uiarc.dev/components/empty-state · **free** (bloco ilustrado: https://uiarc.dev/components/blocks/empty-states)
- **Interação:** trocar título/descrição rola o texto no lugar enquanto a altura salta; ícone novo estala com blur curto; ícone tem animação ociosa em CSS (para sob reduced motion). Descrição até **18rem**. Bloco ilustrado: formas morfam entre cenas com pequenos atrasos por forma; indicador da aba desliza.
- **A11y:** `section` com `h3`; ícone `aria-hidden`; manter montado e trocar props para morfar (vazio → sucesso).
- **Onde no Prisma:** `skills.html?vazio=1`, `agentes.html?vazio=1`, projetos vazios, busca sem resultado na galeria e no ⌘K, favoritos vazios. Uma ação por estado.

#### Badge
- **Docs:** https://uiarc.dev/components/badge · **free**
- **Interação:** rótulo novo sobe com blur curto enquanto o antigo sai, largura salta; reflow passivo (troca de fonte) redimensiona instantâneo. Tons neutral/success/info/warning/danger.
- **Onde no Prisma:** Publicado / Rascunho, Oficial Asimov, Padrão (modelo), plano do usuário, status no admin.

### 3.5 Números e dados

#### Animated counter
- **Docs:** https://uiarc.dev/components/animated-counter · **free**
- **Interação:** cada coluna de dígito gira na direção em que o número todo andou, dando a volta 9→0; stagger leve na primeira revelação; colunas e separadores entram/saem quando muda a quantidade de dígitos. `animateOnView` espera **60%** de visibilidade.
- **A11y:** cópia oculta com o texto formatado; dígitos `aria-hidden`; não anuncia (envolver em live region se precisar).
- **Reduced motion:** dígitos pulam.
- **Como portar:** `roll()`; `Intl.NumberFormat('pt-BR')` com locale fixo; `tabular-nums`.
- **Onde no Prisma:** contadores de uso, nº de conversas/usos em cards, créditos restantes.

#### Slot text
- **Docs:** https://uiarc.dev/components/slot-text · **free**
- **Interação:** cada caractere é um rolo. Dígitos contam pela roda na direção do número, letras embaralham; rolos param **da esquerda para a direita sem overshoot**: `duration` **0.9 s** no primeiro rolo, `stagger` **0.07 s**, `spins` **1** volta extra (0 = rola direto). Início rápido, pouso longo e suave; **blur proporcional à velocidade** (pousos nítidos). Largura do rolo segue o novo caractere em mola criticamente amortecida. Símbolos iniciais (R$) ficam no próprio rolo; separadores alinhados pelo fim (999 → 1.000 só gira dígitos). Mudar no meio recomeça da célula na tela.
- **Quando não:** valores que mudam várias vezes por segundo (usar `spins=0` ou animated counter).
- **A11y:** valor real oculto; `announce` opcional para live region polite.
- **Reduced motion:** troca instantânea.
- **Como portar:** colunas como no `roll()`, mas com WAAPI por coluna (`delay = i × 70ms`, `easing: var(--spring-smooth)` resolvido ou `cubic-bezier(.22,1,.36,1)` *(derivado)*), `filter: blur()` animado de 2 px → 0 no fim.
- **Onde no Prisma:** **KPIs do admin uso ao trocar período** (custo R$/US$, créditos, mensagens); custo estimado ao trocar de modelo.

#### Metric card
- **Docs:** https://uiarc.dev/components/metric-card · **free**
- **Interação:** número via animated counter (rola do zero ao entrar em vista, depois entre valores); rótulo, contexto e chip de variação rolam vindo da direção em que o número andou; largura do chip salta. Abaixo de **380 px**, padding aperta e o chip desce para baixo do rótulo. Linha de KPIs: `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`, gap 16 px, alturas iguais.
- **A11y:** `article`; número lido como texto oculto; chip com sinal escrito (+/−), nunca só cor.
- **Onde no Prisma:** **KPIs do admin uso** (custo total, créditos, mensagens, economia de cache, taxa de cache) e do admin usuários (ativos, NPS).

#### Sparkline e Gauge
- **Docs:** https://uiarc.dev/components/sparkline · https://uiarc.dev/components/gauge · **free**
- **Interação:** sparkline: linha **se desenha** na primeira vista e o ponto final aparece ao pousar; ao varrer, cursor salta entre pontos em mola, pontos posteriores esmaecem e o texto do título rola; teclado ←/→, PageUp/PageDown (~1/6 da série), Home/End, Escape. Gauge: anel de **270°**, enche uma vez ao ficar **50%** visível, sem overshoot, depois salta para novos valores enquanto a % conta; cor e rótulo da faixa mudam exatamente quando a contagem cruza o limiar.
- **A11y:** sparkline interativo é `role="slider"` com `aria-valuetext` (rótulo do ponto + valor); gauge `role="meter"` com `aria-valuetext` incluindo o rótulo da faixa.
- **Reduced motion:** linha completa de uma vez; anel pousa direto.
- **Onde no Prisma:** sparkline dentro dos KPIs do admin uso (custo por dia); gauge opcional para teto de gasto no detalhe do usuário.

#### Sortable data table
- **Docs:** https://uiarc.dev/components/sortable-data-table · **free**
- **Interação:** linhas **deslizam para as novas posições em mola** ao reordenar (FLIP); seta de ordenação gira; contagem de selecionados rola e "Limpar" entra com blur curto. Abaixo de **620 px** cada linha dobra em duas e o cabeçalho vira faixa rolável de botões de ordenação com "Selecionar tudo" fixo. Tabelas largas rolam dentro do card.
- **Teclado:** ←/→ entre cabeçalhos ordenáveis; ↑/↓ entre checkboxes das linhas; Home/End; Enter/Espaço ordena ou alterna; **Shift+clique** seleciona intervalo; Escape limpa seleção.
- **A11y:** `<table>` nativa com `caption`, `scope`, `aria-sort`; botões "Ordenar por Custo, atualmente crescente"; selecionar tudo com estado misto; mudanças em `role="status"`.
- **Reduced motion:** reordena instantâneo; contagem em fade.
- **Como portar:** `flip()` nas `<tr>` (transform em `tr` funciona; usar `display: block` nas linhas só no layout dobrado).
- **Onde no Prisma:** admin usuários (gasto, último acesso), admin modelos (ordem, preço), admin uso (custo por modelo, eventos).

#### Filter toolbar e Pagination
- **Docs:** https://uiarc.dev/components/filter-toolbar · https://uiarc.dev/components/pagination · **free**
- **Interação:** filtros: chips abrem/fecham o slot em mola para os vizinhos deslizarem; valores morfam no lugar; o gatilho "Adicionar filtro" **morfa na superfície do menu** e os passos deslizam entre campo → valor (→ entra, ← volta). Menu `min(16rem, 100vw − gutter)`, lista até `min(20rem, 55vh)`; abaixo de **520 px** a barra empilha. Paginação: janela fixa de **5 páginas** + setas; marca da página atual salta para o botão; quando a janela anda, números deslizam como esteira.
- **A11y:** remover rotulado "Remover Status: Aberto" e foco vai ao vizinho; paginação em `nav` rotulada, `aria-current="page"`.
- **Onde no Prisma:** filtros e paginação das tabelas do admin; filtros da galeria em telas largas.

#### Date range picker
- **Docs:** https://uiarc.dev/components/date-range-picker · **free**
- **Interação:** gatilho **cresce até o painel** em mola física e encolhe no "Aplicar" enquanto o rótulo formatado voa para o gatilho; destaque do intervalo é **uma barra por semana que estica** no hover e as duas pontas deslizam entre dias; meses deslizam na direção do movimento; palavras do rótulo rolam conforme a direção no tempo. Duas colunas de mês + trilho de presets quando o espaço ≥ **712 px**; senão um mês e presets em linha rolável; células de **32 a 42 px**. Seleção é rascunho até Aplicar; Escape/clique fora descartam.
- **Teclado/A11y:** setas por dia/semana (estendendo prévia), Home/End semana, PageUp/PageDown mês (+Shift ano); cada mês `role="grid"`, `aria-selected` nos dias do intervalo, `aria-current="date"` hoje; roving; live region anuncia início, depois intervalo e duração.
- **Reduced motion:** tamanho pula; sem voo e sem slide; fades curtos.
- **Onde no Prisma:** período personalizado do admin uso (além dos presets 7/30/90 dias no segmented control).

### 3.6 Chat, conteúdo e formulários

#### Chat thread + Composer
- **Docs:** https://uiarc.dev/components/chat-thread · **free**
- **O que faz:** thread com mensagens agrupadas, reações, recibos de leitura, digitação e um composer com anexos; fica preso à mensagem mais nova e mostra uma pílula quando chega algo fora de vista.
- **Interação (thread):** mensagens novas **sobem do próprio lado com escala pequena** em `smooth`, e a **lista desliza para cima pela altura adicionada** em vez de pular; pílula "Ir para o fim" entra de baixo em mola; bandeja de anexos e linha de reações abrem em mola; contadores rolam. Agrupamento por **5 min** (`groupWindow` 300000 ms). Bolhas até `min(78%, 34rem)` (abaixo de 420 px, até 84%).
- **Interação (composer):** textarea que cresce **até 6 linhas**; anexos por botão, colar ou soltar (**até 10** por vez); botão enviar: **a seta sobe e sai e uma nova sobe no lugar** a cada envio.
- **Teclado:** Enter envia (ignorado durante composição IME); Shift+Enter quebra linha.
- **A11y:** lista como `<ol role="log" aria-live="polite" aria-relevant="additions">`; "digitando" anunciado numa região de status separada (pontos `aria-hidden`); `ref.scrollToBottom()` suave, instantâneo com reduced motion.
- **Reduced motion:** fades curtos; pontos de digitação param; rolagem instantânea.
- **Como portar:** já temos `.prose` + `.tok` no stream. Entrada da mensagem do usuário: `translateX(8px) scale(.98)→0/1` *(valores derivados; a doc diz "pequena escala")* + opacity em `--spring-smooth`. "Lista desliza pela altura": antes de inserir, guardar `scrollHeight`; inserir; se estava preso ao fim, aplicar `transform: translateY(Δ)` no conteúdo e animar para 0 enquanto o scroll já está no fim. Composer: `field-sizing: content` com `max-height: calc(6lh + padding)` (fallback JS medindo `scrollHeight`). Tokens do stream: fade de `--dur-fast` por palavra **(decisão nossa; o Arc free não tem componente de streaming, ver lacunas)**.
- **Onde no Prisma:** `chat.html` (thread, eventos "Modelo trocado para X", "Resposta interrompida."), composer do início, do chat e do projeto; pílula "Ir para o fim" durante o streaming.

#### Code block
- **Docs:** https://uiarc.dev/components/code-block · **free**
- **Interação:** expandir/recolher (com `maxLines`) salta a altura do código; código novo sobe em fade; rótulo do toggle rola e o chevron gira. Linhas longas rolam dentro do bloco; abaixo de **420 px** fonte e padding diminuem e o copiar vira só ícone.
- **A11y:** `section` rotulada ("app.py código fonte"); `<pre>` focável para rolar pelo teclado; toggle com `aria-expanded` + `aria-controls`; feedback de cópia vem do copy button.
- **Onde no Prisma:** blocos de código nas respostas da IA (cabeçalho com linguagem + Copiar, recolher acima de ~20 linhas).

#### Inline edit (renomear no lugar)
- **Docs:** https://uiarc.dev/components/inline-edit · **free**
- **Interação:** o texto vira campo **sem mudar de lugar** (mesmas métricas); salva otimista; texto rola entre valores; check se desenha quando o salvamento confirma; falha faz rollback com movimento e oferece tentar de novo. Reserva **66 px** no fim para salvar/cancelar.
- **Teclado:** Enter/Espaço no texto começa a editar; Enter salva (Shift+Enter quebra linha no modo multilinha); Escape cancela; **Tab saindo salva**.
- **A11y:** texto em repouso é `<button>` "Nome do projeto: X"; campo com `aria-label` e `aria-invalid`; erros em live region ligada por `aria-describedby`; progresso em `role="status"`.
- **Reduced motion:** crossfade do texto; check instantâneo; spinner vira marca estática.
- **Onde no Prisma:** **renomear conversa** (até 120 caracteres) no título do chat, renomear projeto (até 80) no cabeçalho do projeto.

#### Accordion / Expandable card (dobra de "Raciocínio")
- **Docs:** https://uiarc.dev/components/accordion · https://uiarc.dev/components/expandable-card · **free**
- **Interação:** accordion: altura do painel salta **sem overshoot**, a resposta desce **6 px** saindo de um blur sutil; chevron gira em `snappy`; alternar no meio **retoma da altura atual**. Expandable card: largura e altura juntas na mola `smooth`; **detalhes entram em fade só depois que a caixa abriu espaço e saem antes de ela encolher**; ficam diagramados na largura aberta o tempo todo (texto nunca reflui); clicar de novo no meio reverte com a velocidade atual. Cabeçalho é o toggle com mínimo de **64 px**.
- **A11y:** gatilho `<button aria-expanded aria-controls>` dentro de heading; painel fechado `visibility: hidden`/`inert`; chevron `aria-hidden`; Escape fecha o card com foco dentro.
- **Reduced motion:** estados finais em um passo.
- **Como portar:** `<details>`/`<summary>` nativo + `autoHeight()` (ou `::details-content` com `interpolate-size` onde houver), conteúdo com `translateY(-6px)` + `filter: blur(var(--blur-subtle))` → 0, chevron com `rotate` em `--spring-snappy`.
- **Onde no Prisma:** bloco "Raciocínio" das respostas, FAQ/ajuda, contexto do projeto (ver mais), detalhes de evento no admin uso.

#### Scroll area
- **Docs:** https://uiarc.dev/components/scroll-area · **free**
- **Interação:** scroll nativo com barras finas sobrepostas que aparecem ao rolar ou no hover e somem após **900 ms** (`hideDelay`); **fades de borda de 28 px** via `mask-image` que crescem com o conteúdo além de cada borda; thumb engrossa sob ponteiro fino; clicar na trilha pagina **90%** da viewport (suave, instantâneo com reduced motion).
- **A11y:** scroll nativo preservado; viewport focável (`tabindex="0"`) e região rotulada; trilhas/thumbs `aria-hidden`.
- **Como portar:** só a parte barata: `mask-image: linear-gradient(to bottom, transparent, #000 28px, #000 calc(100% - 28px), transparent)` ligada/desligada por classes `.at-top`/`.at-bottom` num listener de `scroll` passivo; `scrollbar-width: thin` + `scrollbar-color`. Não reimplementar thumb custom.
- **Onde no Prisma:** lista de conversas da sidebar, lista do seletor de modelo, painel de skills, menu + com agentes.

#### Search field / Expanding search
- **Docs:** https://uiarc.dev/components/search-field · https://uiarc.dev/components/expanding-search · **free**
- **Interação:** search field: botão limpar entra de **0.8** com blur leve em `snappy` e pressiona a **0.96**, num **slot reservado** (largura do campo nunca muda). Expanding search: ícone morfa no campo em mola; resultados abrem embaixo num painel que acompanha a largura; destaque viaja entre opções; `expandedWidth` **360 px**, `maxResults` **6**, painel até `min(22rem, 60vh)`; Escape dobra de volta.
- **A11y:** `input type="search"` com label real; limpar "Limpar busca" devolve foco ao input. Expanding: combobox + listbox agrupado + contagem em live region; campo recolhido `inert`.
- **Onde no Prisma:** busca em projetos/skills/agentes/galeria e no admin usuários (search field); busca de conversas no topo da sidebar (expanding search, se o espaço apertar).

#### Input, Textarea, Tag input
- **Docs:** https://uiarc.dev/components/input · https://uiarc.dev/components/textarea · https://uiarc.dev/components/tag-input · **free**
- **Interação:** linhas de ajuda/erro abrem a altura em `smooth`; palavras alteradas sobem e desfocam; números (contagem de caracteres) **rolam só os dígitos que mudaram**. Textarea com mínimo de **110 px**. Tag input: tags novas entram com blur + escala onde foram digitadas; removidas saem e as demais deslizam em `morph`; altura do campo segue as linhas em `smooth`; anel desliza entre tags escolhidas; duplicata faz **pulsar a existente**; Enter ou vírgula adiciona; Backspace no início escolhe a última e, de novo, remove.
- **A11y:** label real; descrição e erro em `aria-describedby`; erro com `aria-invalid` + `role="alert"`; tag input anuncia adição/remoção/duplicata em live region polite.
- **Onde no Prisma:** formulários de skill, agente, projeto e perfil (contadores 120 / 80 / 2.000 caracteres rolando); perguntas iniciais do agente (tag input).

#### File upload / File dropzone
- **Docs:** https://uiarc.dev/components/blocks/file-upload · https://uiarc.dev/components/file-dropzone · **free**
- **Interação:** dropzone: ícone **levanta** com arquivos sobre o alvo, borda tracejada anima, rótulo troca para "Solte para adicionar"; linhas entram e colapsam em `smooth` com entradas em stagger **até 8 passos**; barras de progresso aceleram até o alvo; **uma mola move barra e % juntos**, a barra se dobra quando o arquivo chega e um check se desenha. `maxFiles` padrão 5; `compactAt` dobra o prompt numa barra fina. Container query: abaixo de **440 px** "tentar de novo" vira ícone; abaixo de **300 px** o ícone do arquivo some. Cola arquivos com **⌘V/Ctrl+V** (fora de campos de texto).
- **Teclado/A11y:** alvo é `<button>` (input oculto fora do Tab); ↑/↓ movem para a mesma ação na linha vizinha; Delete/Backspace remove; linhas enviando com `role="progressbar"`; adições/conclusões/falhas em `role="status"`, rejeições em `role="alert"`; remover move o foco para a linha vizinha.
- **Reduced motion:** sem altura e sem levantar; fades curtos; progresso instantâneo.
- **Onde no Prisma:** arquivos do projeto (**até 20 arquivos de texto, 30 MB cada**), arquivos do agente, anexos do composer (bandeja acima do campo).

#### Reactions (e avaliação)
- **Docs:** https://uiarc.dev/components/reactions · **free**
- **Interação:** pílulas escalam a partir de um blur e refluem em `morph`; o ícone ganha um "chute" de velocidade que acumula em toques rápidos; dígitos rolam na direção da contagem; seletor cresce do botão + com destaque deslizante.
- **A11y:** pílulas `aria-pressed` com rótulo "Curtir, 4 reações, incluindo a sua"; seletor `role="toolbar"` com roving; mudanças em `role="status"`.
- **Onde no Prisma:** referência de movimento para **👍/👎 da resposta** (exclusivos, `aria-pressed`, chute no ícone com `--ease-spring`, lúdico permitido) e favoritar na galeria. **Avaliação por estrelas não existe no catálogo do Arc** (ver lacunas).

---

## 4. Itens Pro (não reconstruir)

Só nome e o que fazem pela descrição pública. Úteis como referência de ambição; a implementação do Prisma deve sair dos componentes free acima e das nossas próprias decisões.

| Item | Tipo | O que faz (descrição pública) |
|---|---|---|
| `ai-chat` | bloco | Chat de IA completo com respostas em markdown em streaming, raciocínio que dobra, chips de ferramenta, citações e troca de modelo. **Não reconstruir** |
| `ai-composer` | bloco | Thread de assistente em que as mensagens saem do composer e as respostas chegam em streaming. **Não reconstruir** |
| `ai-side-panel` | bloco | Assistente acoplado ao lado da página, com streaming, chips de contexto e aplicação de mudanças com destaque. **Não reconstruir** |
| `agent-run` | bloco | Execução de agente ao vivo: passos chegam em stream, chamadas de ferramenta expandem, um diff espera aprovação. **Não reconstruir** |
| `sidebar-rail` | bloco | Shell de app cuja sidebar dobra num trilho de ícones e entra como sheet no celular. **Não reconstruir** |
| `workspace-sidebar` | bloco | Sidebar de produto com troca de workspace, busca ao vivo, favoritos arrastáveis e projetos inline. **Não reconstruir** |
| `skeleton-morph` | componente | Skeletons que crescem até virar o conteúdo real, bloco a bloco, em vez de trocar. **Não reconstruir** |
| `morph-loader` | componente | Loaders pequenos que morfam entre formas e dobram num check ou X ao terminar. **Não reconstruir** |
| `link-unfurl` | componente | Composer em que colar uma URL mostra shimmer e desdobra num card de prévia. **Não reconstruir** |
| `voice-recorder`, `voice-orb` | componentes | Gravação com forma de onda ao vivo; orbe de modo voz que ouve, pensa e fala. **Não reconstruir** |
| `emoji-picker` | componente | Seletor de emoji completo com busca e grade virtualizada navegável. **Não reconstruir** |
| `typewriter-terminal` | componente | Terminal que digita uma sessão de CLI roteirizada. **Não reconstruir** |
| `sheet-stack` | componente | Sheets aninhados com profundidade, arrastar para fechar, viram dialogs empilhados em telas largas. **Não reconstruir** |
| `action-morph`, `share-sheet` | componentes | FAB que morfa em menu e formulário; botão Compartilhar que abre painel com link, acesso e pessoas. **Não reconstruir** |
| `glass-menu`, `glass-tabbar`, `liquid-tab-bar`, `morph-nav`, `mega-menu-morph`, `dock` | componentes | Navegações e menus com morph de superfície, lentes e vidro. **Não reconstruir** |
| `data-grid` | componente | Planilha com seleção de intervalo, edição inline, alça de preenchimento e ordenação animada. **Não reconstruir** |
| `presence-stack`, `avatar-upload`, `split-bar`, `funnel-chart` | componentes | Avatares de presença; upload de avatar com recorte; barra 100% dividida; funil de conversão. **Não reconstruir** |
| `settings-page`, `settings-command` | blocos | Configurações com nav deslizante e barra de salvar que morfa; busca que vira paleta para ir a qualquer ajuste. **Não reconstruir** |
| `search-results`, `help-center` | blocos | Busca facetada com cursor de teclado deslizante e prévia; central de ajuda com busca instantânea. **Não reconstruir** |
| `billing-overview`, `usage-billing`, `usage-forecast`, `metrics-dashboard`, `metric-explorer`, `kpi-drilldown` | blocos | Billing e analytics: plano que morfa em seletor, medidores contra limites, previsão, KPIs que abrem em gráfico. **Não reconstruir** |
| `api-keys`, `env-variables`, `webhooks`, `roles-permissions`, `team-members`, `invite-people`, `cancel-flow` | blocos | Consoles de admin (chaves, segredos, webhooks, permissões, membros, convites, cancelamento). **Não reconstruir** |
| `layout-morph`, `lightbox-gallery`, `photo-grid`, `product-gallery` | blocos/componentes | Galerias que voam entre layouts, lightbox com zoom do slot, grade com pinça. **Não reconstruir** |
| `docs-sidebar`, `inbox-sidebar` | blocos | Sidebar de docs com árvore filtrável; sidebar de e-mail com Compose que vira composer. **Não reconstruir** |

---

## 5. Lacunas e decisões nossas

- **Valores dos `ease.*` do Arc não estão expostos** na doc. Usamos os nossos (`--ease-out` para entrada e cor, `--ease-in-out` para movimento na tela) e `--dur-exit` 180 ms para saídas.
- **Curvas de mola são derivadas** (fórmula `visualDuration` do Motion). Se o Arc usa `duration` em vez de `visualDuration`, o assentamento real é um pouco mais curto; as curvas acima continuam sem overshoot visível e dentro da intenção (smooth sem overshoot, snappy e morph quase imperceptíveis).
- **Sem componente free de streaming de texto** (`text-stream` é citado em docs, mas não existe no catálogo; `ai-chat`/`ai-composer` são Pro). O fade por token do Prisma é decisão nossa: opacidade em `--dur-fast`, sem blur, sem deslocamento, desligado em reduced motion.
- **Sem avaliação por estrelas** no catálogo de 256 itens. Para a galeria: construir como `role="radiogroup"` de 5 `role="radio"` (setas mudam, Home/End), preenchimento em `--dur-fast`, estrela escolhida com `scale(1.15→1)` em `--ease-spring` (lúdico) e média com `tabular-nums`; reduced motion sem escala.
- **Sem ícone free de Enviar ↔ Parar**. Usar o padrão do icon-morph (transform em grupos SVG, mola `snappy`) com ícones nossos de `icons.js`.
- **Limiares de arraste do drawer e fator de rubber-band** não estão na doc; propus 480 px/s (do toast) e 0.2.
- **Uma só animação pesada de fundo por página** (regra do Prisma) está alinhada com o Arc: sem gradientes decorativos, sem glow, uma entrada orquestrada por página.
