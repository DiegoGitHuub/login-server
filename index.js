const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Inicializa o Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://loginappbrsos-default-rtdb.firebaseio.com/" // substitua aqui
});
const db = admin.database();

// Função utilitária para caminho do usuário
function caminho(usuario) {
  return db.ref(`usuarios/${usuario}`);
}

// ROTAS

// Página inicial
app.get('/', (req, res) => {
  res.send('Servidor Firebase funcionando!');
});

// Cadastrar usuário
app.get('/cadastrar/:usuario/:senha/:cidade/:status', async (req, res) => {
  const { usuario, senha, cidade, status } = req.params;

  const snapshot = await caminho(usuario).once('value');
  if (snapshot.exists()) {
    return res.status(409).send('Usuário já existe');
  }

  await caminho(usuario).set({
    usuario,
    senha,
    cidade,
    status,
    pontos: 0
  });

  res.send('Usuário cadastrado com sucesso');
});

// Login
app.get('/login/:usuario/:senha', async (req, res) => {
  const { usuario, senha } = req.params;

  const snapshot = await caminho(usuario).once('value');
  const user = snapshot.val();

  if (user && user.senha === senha) {
    return res.send('Login OK');
  } else {
    return res.status(401).send('Login inválido');
  }
});

// Perfil
app.get('/perfil/:usuario', async (req, res) => {
  const snapshot = await caminho(req.params.usuario).once('value');
  if (!snapshot.exists()) {
    return res.status(404).send('Usuário não encontrado');
  }

  res.json(snapshot.val());
});

// Atualizar campo genérico
app.get('/atualizarCampo/:usuario/:campo/:valor', async (req, res) => {
  const { usuario, campo, valor } = req.params;

  const snapshot = await caminho(usuario).once('value');
  if (!snapshot.exists()) {
    return res.status(404).send('Usuário não encontrado');
  }

  await caminho(usuario).update({
    [campo]: isNaN(valor) ? valor : Number(valor)
  });

  res.send(`Campo "${campo}" atualizado`);
});

// Atualizar pontos
app.get('/atualizarPontos/:usuario/:pontos', async (req, res) => {
  const { usuario, pontos } = req.params;

  const snapshot = await caminho(usuario).once('value');
  if (!snapshot.exists()) {
    return res.status(404).send('Usuário não encontrado');
  }

  await caminho(usuario).update({
    pontos: Number(pontos)
  });

  res.send('Pontos atualizados com sucesso');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
