const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Firebase config
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY); // chave como variável
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://loginappbrsos-default-rtdb.firebaseio.com/' // ← Altere isso com seu link do Firebase!
});

const db = admin.database();
const ref = db.ref('logins');

app.use(cors());
app.use(express.json());

// Cadastro
app.get('/cadastrar/:usuario/:senha/:cidade/:status', async (req, res) => {
  const { usuario, senha, cidade, status } = req.params;

  const snapshot = await ref.child(usuario).once('value');
  if (snapshot.exists()) {
    return res.status(409).send('Usuário já existe');
  }

  await ref.child(usuario).set({ senha, cidade, status, pontos: 0 });
  res.send('Usuário cadastrado com sucesso');
});

// Login
app.get('/login/:usuario/:senha', async (req, res) => {
  const { usuario, senha } = req.params;
  const snapshot = await ref.child(usuario).once('value');
  const user = snapshot.val();

  if (!user || user.senha !== senha) {
    return res.status(401).send('Login inválido');
  }

  res.send('Login OK');
});

// Perfil
app.get('/perfil/:usuario', async (req, res) => {
  const snapshot = await ref.child(req.params.usuario).once('value');
  if (!snapshot.exists()) return res.status(404).send('Usuário não encontrado');
  res.json(snapshot.val());
});

// Atualizar campo genérico
app.get('/atualizarCampo/:usuario/:campo/:valor', async (req, res) => {
  const { usuario, campo, valor } = req.params;
  const snapshot = await ref.child(usuario).once('value');
  if (!snapshot.exists()) return res.status(404).send('Usuário não encontrado');

  const dado = isNaN(valor) ? valor : Number(valor);
  await ref.child(usuario).update({ [campo]: dado });
  res.send(`Campo "${campo}" atualizado para "${valor}"`);
});

// Atualizar pontos
app.get('/atualizarPontos/:usuario/:pontos', async (req, res) => {
  const { usuario, pontos } = req.params;
  const snapshot = await ref.child(usuario).once('value');
  if (!snapshot.exists()) return res.status(404).send('Usuário não encontrado');

  await ref.child(usuario).update({ pontos: Number(pontos) });
  res.send('Pontuação atualizada');
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor rodando com Firebase e GitHub Sync');
});

// Função para salvar dados no GitHub
async function salvarNoGitHub(nomeArquivo, conteudoJson) {
  const repo = 'DiegoGitHuub/login-server'; // Altere isso
  const path = nomeArquivo;
  const token = process.env.GH_TOKEN;

  try {
    // Verifica se já existe
    let sha = null;
    try {
      const { data } = await axios.get(`https://api.github.com/repos/${repo}/contents/${path}`, {
        headers: { Authorization: `token ${token}` }
      });
      sha = data.sha;
    } catch {}

    const base64Content = Buffer.from(conteudoJson).toString('base64');

    await axios.put(`https://api.github.com/repos/${repo}/contents/${path}`, {
      message: 'Atualização automática dos logins',
      content: base64Content,
      sha
    }, {
      headers: { Authorization: `token ${token}` }
    });

    console.log(`[✔] Arquivo "${path}" salvo no GitHub`);
  } catch (error) {
    console.error('[✖] Erro ao salvar no GitHub:', error.response?.data || error.message);
  }
}

// Tarefa automática a cada 5 minutos
setInterval(async () => {
  try {
    const snapshot = await ref.once('value');
    const dados = snapshot.val() || {};
    const json = JSON.stringify(dados, null, 2);
    await salvarNoGitHub('logins.json', json);
  } catch (err) {
    console.error('[✖] Erro ao gerar logins.json automático:', err.message);
  }
}, 30 * 1000); // 5 minutos

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
