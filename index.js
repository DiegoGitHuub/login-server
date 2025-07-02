const express = require('express');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/cadastrar', (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) return res.status(400).send('Campos obrigatórios');

  let logins = [];
  if (fs.existsSync('logins.json')) {
    logins = JSON.parse(fs.readFileSync('logins.json', 'utf-8'));
  }

  const jaExiste = logins.find(u => u.usuario === usuario);
  if (jaExiste) return res.status(409).send('Usuário já existe');

  logins.push({ usuario, senha });
  fs.writeFileSync('logins.json', JSON.stringify(logins, null, 2));
  res.send('Usuário cadastrado com sucesso!');
});

app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) return res.status(400).send('Campos obrigatórios');

  let logins = [];
  if (fs.existsSync('logins.json')) {
    logins = JSON.parse(fs.readFileSync('logins.json', 'utf-8'));
  }

  const valido = logins.find(u => u.usuario === usuario && u.senha === senha);
  if (valido) return res.send('Login OK');
  else return res.status(401).send('Login inválido');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
