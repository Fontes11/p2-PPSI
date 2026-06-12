# E-Compras
## link para video sobre o site

https://youtu.be/zSsH-XDYedQ?is=QbHWbWETt8t2sKAU

E-commerce simples desenvolvido em **JavaScript puro (vanilla)**, sem frameworks com foco em consumo de API e uso do CRUD

## Funcionalidades principais

- **Vitrine de produtos** (`home.js`): lista os produtos vindos da API, com busca por nome, descrição ou categoria.
- **Detalhes do produto** (`produto.js`): exibe informações completas de um produto selecionado.
- **Autenticação** (`login.js` / `register.js`): login e cadastro de usuários, com fallback local (localStorage) caso a API esteja indisponível.
- **Painel administrativo**: visível apenas para usuários com papel `administrador`, permite gerenciar produtos e usuários.
- **Notificações (toasts)**: feedback visual de sucesso, erro e informação (`notificar` em `utils.js`).
- **Roteamento via hash**: navegação entre páginas sem recarregar o site (`router.js`), com histórico do navegador


## CRUD

### Produtos (`js/pages/admin-produtos.js`)

Disponível apenas para administradores, permite:

- **Listar**: `GET` — carrega a tabela de produtos.
- **Criar**: `POST` — cadastra um novo produto (nome, descrição, preço, estoque, categoria e imagem).
- **Atualizar**: `PUT` — edita um produto existente.
- **Excluir**: `DELETE` — remove um produto.


### Usuários (`js/pages/admin-usuarios.js`)

Disponível apenas para administradores

- **Listar**: `GET` — carrega a tabela de usuários.
- **Criar**: `POST` — cadastra um novo usuário nome, e-mail, senha, papel.
- **Atualizar**: `PATCH` — edita nome, e-mail, papel e, opcionalmente, a senha.
- **Excluir**: `DELETE` — remove um usuário.


## Armazenamento de imagens (Cloudinary)

O upload das fotos de produto é feito por meio do **Cloudinary**, um serviço externo de armazenamento de imagens