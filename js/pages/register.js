export function pageRegister() {
  return `
  <div class="auth-wrap">
    <div class="auth-card">
      <h1>Criar conta</h1>
      <p class="subtitle">Junte-se à E-Compras hoje</p>
      <form id="form-register">
        <div class="fg"><label>Nome completo</label>
          <input type="text" name="nome" placeholder="João Silva" required /></div>
        <div class="fg"><label>E-mail</label>
          <input type="email" name="email" placeholder="seu@email.com" required /></div>
        <div class="fg"><label>Senha</label>
          <input type="password" name="senha" placeholder="Mínimo 6 caracteres" minlength="6" required /></div>
        <div class="fg"><label>Confirmar senha</label>
          <input type="password" name="senha2" placeholder="Repita a senha" required /></div>
        <button type="submit" class="btn btn-primary" id="btn-register">Criar conta</button>
      </form>
      <div class="auth-switch">Já tem conta? <a data-nav="login">Entrar</a></div>
    </div>
  </div>`;
}
