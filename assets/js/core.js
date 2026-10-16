/* Asimov Prisma · núcleo
 * Utilitários, preferências locais, camada de API.
 *
 * API: cada tela pede os dados a Prisma.api.get("/v1/...") e recebe uma Promise. Hoje a
 * resposta vem de data.js (window.PrismaData), no formato que a API real devolve; na
 * integração, só este arquivo muda (troque `resolve` por fetch). Para revisar estados:
 *   ?estado=carregando  fica carregando      ?estado=vazio  listas vazias
 *   ?estado=erro        a leitura falha       ?estado=erro-salvar  as gravações falham
 * (`?vazio=1` em skills e agentes continua valendo, como antes.)
 */
(() => {
  const P = (window.Prisma = window.Prisma || {});
  const D = window.PrismaData;
  const params = new URLSearchParams(location.search);

  /* ── Utilitários ── */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n, opts) => Number(n).toLocaleString("pt-BR", opts);
  const brl = (v) => "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const plural = (n, one, many) => `${fmt(n)} ${n === 1 ? one : many}`;
  const norm = (s = "") => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  // ?movimento=reduzido força o ramo de movimento reduzido (o mesmo de prefers-reduced-motion), para QA
  const forceReduced = params.get("movimento") === "reduzido";
  if (forceReduced) document.documentElement.classList.add("reduce-motion");
  const reduced = forceReduced || matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const html = (strings, ...vals) => strings.reduce((acc, s, i) => acc + s + (i < vals.length ? (vals[i] ?? "") : ""), "");
  const debounce = (fn, ms = 150) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  const store = {
    get(k, d) { try { const v = localStorage.getItem("prisma:" + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("prisma:" + k, JSON.stringify(v)); } catch {} },
  };

  // Preferências do perfil salvas neste navegador (apelido) valem em todo o app
  const savedProfile = store.get("profile", null);
  if (savedProfile?.nickname && D?.user) D.user.nickname = savedProfile.nickname;

  /* ── API ── */
  const state = params.get("estado") || "";
  const forceEmpty = state === "vazio";
  const latency = params.has("latencia") ? +params.get("latencia") : 260;
  const clone = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));
  const routes = [
    [/^\/v1\/me$/, () => D.user],
    [/^\/v1\/conversations$/, () => (forceEmpty ? [] : D.conversations)],
    [/^\/v1\/conversations\/([\w-]+)$/, () => D.thread],
    [/^\/v1\/models$/, () => D.models],
    [/^\/v1\/suggestions$/, () => D.suggestions],
    [/^\/v1\/projects$/, () => (forceEmpty ? [] : D.projects)],
    [/^\/v1\/projects\/([\w-]+)$/, (id) => D.projects.find((p) => p.id === id) || null],
    [/^\/v1\/skills$/, () => (forceEmpty || params.has("vazio") ? [] : D.mySkills)],
    [/^\/v1\/skills\/([\w-]+)$/, (id) => D.mySkills.find((s) => s.id === id) || null],
    [/^\/v1\/agents$/, () => (forceEmpty || params.has("vazio") ? [] : D.myAgents)],
    [/^\/v1\/agents\/([\w-]+)$/, (id) => D.myAgents.find((a) => a.id === id) || null],
    [/^\/v1\/gallery$/, () => (forceEmpty ? { agents: [], skills: [] } : D.gallery)],
    [/^\/v1\/gallery\/([\w-]+)$/, (id) => [...D.gallery.agents, ...D.gallery.skills].find((x) => x.id === id) || null],
    [/^\/v1\/admin\/usage$/, () => (forceEmpty ? { ...D.usage, days: [], events: [] } : D.usage)],
    [/^\/v1\/admin\/users$/, () => ({ users: forceEmpty ? [] : D.users, policies: D.policies })],
  ];
  const resolve = (path) => {
    const clean = path.split("?")[0];
    for (const [re, fn] of routes) { const m = clean.match(re); if (m) return fn(...m.slice(1)); }
    throw new Error("Rota desconhecida: " + path);
  };
  const api = {
    /** Lê um recurso. Rejeita com { message } quando falha. */
    async get(path, { delay = latency } = {}) {
      if (state === "carregando") return new Promise(() => {});
      await sleep(delay);
      if (state === "erro") throw { message: "Não foi possível carregar. Verifique a conexão e tente de novo.", path };
      return clone(resolve(path));
    },
    /** Grava (POST/PATCH/DELETE). Aqui só simula a ida ao servidor. */
    async send(method, path, body, { delay = 420 } = {}) {
      await sleep(delay);
      if (state === "erro-salvar") throw { message: "Não foi possível salvar agora. Nada foi perdido: tente de novo.", path, method };
      return { ok: true, body };
    },
  };

  const isTyping = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

  /* Iniciais de um nome (para avatar sem imagem) */
  const initials = (s = "") => s.trim().split(/\s+/).filter((w) => w.length > 2 || /^[A-ZÀ-Ú]/.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || s.trim().slice(0, 2).toUpperCase();

  Object.assign(P, { $, $$, esc, fmt, brl, plural, norm, sleep, uid, isMac, reduced, fine, html, debounce, store, api, params, state, initials, isTyping });
})();
