const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

// ─── CONFIGURAÇÕES ───────────────────────────────────────────
const ZAPI_INSTANCE = "3F1CADC0A881C1ED5919AAE399BC1248";
const ZAPI_TOKEN = "B0FF5F1805A034784BFBB247";
const ZAPI_CLIENT_TOKEN = "Fedf2f37cd5ce45b3a89373f76a97ac36S";
const ZAPI_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}`;

const HYPERBOX_URL = "https://hyperbox.sigma.st";
const HYPERBOX_USER = "mago77";
const HYPERBOX_PASS = "Mago77@77";
const TESTE_HORAS = 2;

// ─── ESTADO DOS USUÁRIOS ──────────────────────────────────────
const userState = {};

// ─── FUNÇÕES Z-API ────────────────────────────────────────────
async function sendText(phone, message) {
  await axios.post(`${ZAPI_URL}/send-text`, {
    phone,
    message
  }, {
    headers: { "Client-Token": ZAPI_CLIENT_TOKEN }
  });
}

async function sendList(phone, title, body, buttonLabel, sections) {
  await axios.post(`${ZAPI_URL}/send-list-message`, {
    phone,
    message: body,
    title,
    buttonLabel,
    sections,
  }, {
    headers: { "Client-Token": ZAPI_CLIENT_TOKEN }
  });
}

// ─── HYPERBOX: Login ──────────────────────────────────────────
async function hyperboxLogin() {
  const res = await axios.post(`${HYPERBOX_URL}/api/auth/login`, {
    username: HYPERBOX_USER,
    password: HYPERBOX_PASS,
  });
  return res.data.token || res.data.access_token;
}

// ─── HYPERBOX: Gerar Teste ────────────────────────────────────
async function gerarTeste(nome, phone) {
  const token = await hyperboxLogin();
  const username = "teste_" + phone.replace(/\D/g, "").slice(-8);
  const password = "T" + Math.random().toString(36).slice(-6).toUpperCase();
  const expiracao = new Date();
  expiracao.setHours(expiracao.getHours() + TESTE_HORAS);

  await axios.post(
    `${HYPERBOX_URL}/api/clients`,
    {
      username,
      password,
      name: nome,
      expiration: expiracao.toISOString(),
      max_connections: 1,
      is_trial: true,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return { username, password };
}

// ─── INSTRUÇÕES POR DISPOSITIVO ───────────────────────────────
function getInstrucoes(dispositivo, marca) {
  if (dispositivo === "SMART TV") {
    if (marca === "SAMSUNG") {
      return `📺 *Passo a passo Smart TV Samsung:*\n1. Acesse a Smart Hub e busque *Smart IPTV*\n2. Instale e abra o app\n3. Anote o MAC que aparece na tela\n4. Acesse o portal com suas credenciais e cadastre o MAC\n5. Aproveite! 🎬`;
    } else if (marca === "LG") {
      return `📺 *Passo a passo Smart TV LG:*\n1. Acesse a LG Content Store e busque *SS IPTV*\n2. Instale e abra o app\n3. Anote o MAC que aparece\n4. Acesse o portal e cadastre o MAC\n5. Aproveite! 🎬`;
    } else {
      return `📺 *Passo a passo Smart TV:*\n1. Busque na sua loja de apps por *IPTV Smarters* ou *SS IPTV*\n2. Instale, abra e adicione as credenciais acima\n3. Aproveite! 🎬`;
    }
  }

  const instrucoes = {
    "TV BOX": `📦 *Passo a passo TV BOX:*\n1. Baixe o app *Tivimate* ou *IPTV Smarters Pro* na Play Store\n2. Abra o app e selecione "Adicionar conta"\n3. Insira as credenciais acima\n4. Aproveite! 🎬`,
    "CELULAR ANDROID": `📱 *Passo a passo Android:*\n1. Baixe o app *IPTV Smarters Pro* na Play Store\n2. Abra e toque em "Adicionar usuário"\n3. Preencha com as credenciais acima\n4. Aproveite! 🎬`,
    "CELULAR IPHONE": `🍎 *Passo a passo iPhone:*\n1. Baixe o app *GSE Smart IPTV* na App Store\n2. Vá em "Remote Playlists" → "Add M3U URL"\n3. Use as credenciais no portal para gerar a URL M3U\n4. Aproveite! 🎬`,
    "PC OU NOTEBOOK": `🖥️ *Passo a passo PC/Notebook:*\n1. Baixe o *VLC Media Player* (gratuito)\n2. Abra o VLC → Mídia → Abrir fluxo de rede\n3. Cole a URL M3U gerada no portal\n4. Aproveite! 🎬`,
    "ROKU": `📡 *Passo a passo Roku:*\n1. No Roku Channel Store, busque *IPTV Smarters*\n2. Instale e configure com as credenciais acima\n3. Aproveite! 🎬`,
    "FIRE STICK": `🔥 *Passo a passo Fire Stick:*\n1. Instale o app *Downloader* na Fire Stick\n2. Baixe o *IPTV Smarters Pro* via APK\n3. Configure com as credenciais acima\n4. Aproveite! 🎬`,
  };

  return instrucoes[dispositivo] || `📺 Use as credenci
