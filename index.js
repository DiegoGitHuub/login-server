const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function carregarLogins() {
  try {
    if (!fs.existsSync('logins.json')) return [];
    return JSON.parse(fs.readFileSync('logins.json', 'utf-8'));
  } catch {
    return [];
  }
}

app.get('/', (req, res) => {
  res.send('Servidor está funcionando!');
});

app.get('/cadastrar/:usuario/:senha/:cidade/:status', (req, res) => {
  const { usuario, senha, cidade, status } = req.params;
  let logins = carregarLogins();

  if (logins.find(u => u.usuario === usuario)) {
    return res.status(409).send('Usuário já existe');
  }

  logins.push({ usuario, senha, cidade, status, pontos: 0 });
  fs.writeFileSync('logins.json', JSON.stringify(logins, null, 2));
  return res.send('Usuário cadastrado com sucesso');
});

app.get('/login/:usuario/:senha', (req, res) => {
  const { usuario, senha } = req.params;
  const logins = carregarLogins();

  const valido = logins.find(u => u.usuario === usuario && u.senha === senha);
  if (valido) return res.send('Login OK');
  else return res.status(401).send('Login inválido');
});

app.get('/perfil/:usuario', (req, res) => {
  const { usuario } = req.params;
  const logins = carregarLogins();

  const user = logins.find(u => u.usuario === usuario);
  if (!user) return res.status(404).send('Usuário não encontrado');

  res.json(user);
});

app.get('/atualizarCampo/:usuario/:campo/:valor', (req, res) => {
  const { usuario, campo, valor } = req.params;
  let logins = carregarLogins();

  const userIndex = logins.findIndex(u => u.usuario === usuario);
  if (userIndex === -1) {
    return res.status(404).send('Usuário não encontrado');
  }

  logins[userIndex][campo] = isNaN(valor) ? valor : Number(valor);
  fs.writeFileSync('logins.json', JSON.stringify(logins, null, 2));
  res.send(`Campo "${campo}" atualizado para "${valor}"`);
});

app.get('/atualizarPontos/:usuario/:pontos', (req, res) => {
  const { usuario, pontos } = req.params;
  let logins = carregarLogins();

  const userIndex = logins.findIndex(u => u.usuario === usuario);
  if (userIndex === -1) {
    return res.status(404).send('Usuário não encontrado');
  }

  logins[userIndex].pontos = Number(pontos);
  fs.writeFileSync('logins.json', JSON.stringify(logins, null, 2));
  res.send('Pontuação atualizada');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
