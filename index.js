const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function carregarLogins() {
  if (!fs.existsSync('logins.json')) return [];
  return JSON.parse(fs.readFileSync('logins.json', 'utf-8'));
}

app.get('/', (req, res) => {
  res.send('Servidor está funcionando!');
});

app.get('/login/:usuario/:senha', (req, res) => {
  const { usuario, senha } = req.params;
  const logins = carregarLogins();

  const valido = logins.find(u => u.usuario === usuario && u.senha === senha);
  if (valido) return res.send('Login OK');
  else return res.status(401).send('Login inválido');
});

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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
