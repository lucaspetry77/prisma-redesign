/* Asimov Prisma · Entrar (login.html)
 * Um botão só: a conta da Asimov (SSO do Hub). Estados: entrando, conta sem acesso (?erro=acesso) e
 * sessão expirada (?erro=sessao). Referências: A.4 (Plain, Quicken, WorkOS). */
(() => {
  const P = window.Prisma;
  const { $ } = P;
  const icon = (n, c) => P.icon(n, c);
  $("[data-mark]").innerHTML = P.crystal({ hero: true });
  const err = P.params.get("erro");
  const box = $("[data-alert]");
  if (err === "acesso") box.innerHTML = `<div class="alert alert--warning" role="alert">${icon("lock")}<div class="alert__body"><p><strong>Sua conta ainda não tem acesso ao Prisma.</strong> O beta está aberto para alunos com assinatura ativa. Se você acabou de assinar, tente de novo em alguns minutos.</p><p><a class="link" href="https://link.asimov.academy/transferencia-CS" target="_blank" rel="noopener">Falar com o suporte</a></p></div></div>`;
  if (err === "sessao") box.innerHTML = `<div class="alert" role="status">${icon("clock")}<div class="alert__body"><p><strong>Sua sessão expirou.</strong> Entre de novo para continuar de onde parou.</p></div></div>`;
  $("[data-sso]").addEventListener("click", (e) => {
    e.preventDefault();
    const b = e.currentTarget;
    b.setAttribute("aria-busy", "true");
    b.querySelector("[data-label]").textContent = "Entrando com a conta Asimov…";
    $("[data-live]").textContent = "Redirecionando para a conta Asimov.";
    setTimeout(() => (location.href = b.href), 700);
  });
  P.hydrateIcons();
  P.motion.init();
  P.motion.words($("[data-tagline]"), 300);
})();
