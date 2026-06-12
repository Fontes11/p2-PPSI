export function paginaCadastro() {
  return `
  <div class="area-auth">
    <div class="cartao-auth">
      <h1>Criar conta</h1>
      <p class="subtitulo">Junte-se à E-Compras hoje</p>
      <form id="formulario-cadastro">
        <div class="grupo-campo"><label>Nome completo</label>
          <input type="text" name="nome" placeholder="João Silva" required /></div>
        <div class="grupo-campo"><label>E-mail</label>
          <input type="email" name="email" placeholder="seu@email.com" required /></div>
        <div class="grupo-campo"><label>Senha</label>
          <input type="password" name="senha" placeholder="Mínimo 6 caracteres" minlength="6" required /></div>
        <div class="grupo-campo"><label>Confirmar senha</label>
          <input type="password" name="senha2" placeholder="Repita a senha" required /></div>
        <button type="submit" class="btn btn-primario" id="botao-cadastro">Criar conta</button>
      </form>
      <div class="alternar-auth">Já tem conta? <a data-nav="acesso">Entrar</a></div>
    </div>
  </div>`;
}
