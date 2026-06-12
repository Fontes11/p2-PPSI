export function paginaLogin() {
  return `
  <div class="area-auth">
    <div class="cartao-auth">
      <h1>Bem-vindo de volta</h1>
      <p class="subtitulo">Entre na sua conta</p>
      <form id="formulario-login">
        <div class="grupo-campo"><label>Usuário ou e-mail</label>
          <input type="text" name="email" placeholder="seu@email.com ou admin" required /></div>
        <div class="grupo-campo"><label>Senha</label>
          <input type="password" name="senha" placeholder="••••••••" required /></div>
        <button type="submit" class="btn btn-primario" id="botao-login">Entrar</button>
      </form>
      <div class="alternar-auth">Não tem conta? <a data-nav="cadastro">Cadastre-se</a></div>
    </div>
  </div>`;
}
