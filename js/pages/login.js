export function pageLogin() {
  return `
  <div class="auth-wrap">
    <div class="auth-card">
      <h1>Bem-vindo de volta</h1>
      <p class="subtitle">Entre na sua conta</p>
      <form id="form-login">
        <div class="fg"><label>Usuário ou e-mail</label>
          <input type="text" name="email" placeholder="seu@email.com ou admin" required /></div>
        <div class="fg"><label>Senha</label>
          <input type="password" name="senha" placeholder="••••••••" required /></div>
        <button type="submit" class="btn btn-primary" id="btn-login">Entrar</button>
      </form>
      <div class="auth-switch">Não tem conta? <a data-nav="register">Cadastre-se</a></div>
    </div>
  </div>`;
}
