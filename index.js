const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para carregar logins
function carregarLogins() {
  if (!fs.existsSync('logins.json')) return [];
  return JSON.parse(fs.readFileSync('logins.json', 'utf-8'));
}

// Rota de login via GET
// Exemplo: /login/pedro/1234
app.get('/login/:usuario/:senha', (req, res) => {
  const { usuario, senha } = req.params;
  const logins = carregarLogins();

  const valido = logins.find(u => u.usuario === usuario && u.senha === senha);
  if (valido) return res.send('Login OK');
  else return res.status(401).send('Login inválido');
});

// Rota de cadastro via GET
// Exemplo: /cadastrar/pedro/1234
app.get('/cadastrar/:usuario/:senha', (req, res) => {
  const { usuario, senha } = req.params;
  let logins = carregarLogins();

  if (logins.find(u => u.usuario === usuario)) {
    return res.status(409).send('Usuário já existe');
  }

  logins.push({ usuario, senha });
  fs.writeFileSync('logins.json', JSON.stringify(logins, null, 2));
  return res.send('Usuário cadastrado com sucesso');
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
