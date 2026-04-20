const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const ZAPI_INSTANCE = "3F1CADC0A881C1ED5919AAE399BC1248";
const ZAPI_TOKEN = "B0FF5F1805A034784BFBB247";
const ZAPI_CLIENT_TOKEN = "Fe37f170edb7f48a295f2f126c0fcee90S";
const ZAPI_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}`;
const HYPERBOX_URL = "https://hyperbox.sigma.st";
const HYPERBOX_USER = "mago77";
const HYPERBOX_PASS = "Mago77@77";
const TESTE_HORAS = 2;
const userState = {};
const H = { "Content-Type": "application/json", "Client-Token": ZAPI_CLIENT_TOKEN };

async function txt(phone, message) {
  try {
    await axios.post(`${ZAPI_URL}/send-text`, { phone, message }, { headers: H });
    console.log("✅ txt OK");
  } catch (e) {
    console.error("❌ txt ERRO:", e.response?.status, JSON.stringify(e.response?.data));
  }
}

async function img(phone, image, caption) {
  try {
    await axios.post(`${ZAPI_URL}/send-image`, { phone, image, caption }, { headers: H });
    console.log("✅ img OK");
  } catch (e) {
    console.error("❌ img ERRO:", e.response?.status, JSON.stringify(e.response?.data));
  }
}

async function lista(phone, message, title, buttonLabel, options) {
  try {
    await axios.post(`${ZAPI_URL}/send-option-list`, {
      phone, message, optionList: { title, buttonLabel, options }
    }, { headers: H });
    console.log("✅ lista OK");
  } catch (e) {
    console.error("❌ lista ERRO:", e.response?.status, JSON.stringify(e.response?.data));
  }
}

async function login() {
  const r = await axios.post(`${HYPERBOX_URL}/api/auth/login`, { username: HYPERBOX_USER, password: HYPERBOX_PASS });
  return r.data.token || r.data.access_token;
}

async function gerarTeste(nome, phone) {
  const token = await login();
  const username = "teste_" + phone.replace(/\D/g, "").slice(-8);
  const password = "T" + Math.random().toString(36).slice(-6).toUpperCase();
  const exp = new Date();
  exp.setHours(exp.getHours() + TESTE_HORAS);
  await axios.post(`${HYPERBOX_URL}/api/clients`,
    { username, password, name: nome, expiration: exp.toISOString(), max_connections: 1, is_trial: true },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return { username, password };
}

const APPS = {
  "TV BOX":          { img: "https://play-lh.googleusercontent.com/n4wrAVSNBMnQtoSEIuRSNqBJfbwFxU5OBpxSkFCJNMYT1jHLvpD1T0VbMZoREXAEgXM=w240-h480-rw", link: "https://play.google.com/store/search?q=cn+player+iptv&c=apps", passos: "1️⃣ Baixe o *CN Player* na Play Store\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*" },
  "CELULAR ANDROID": { img: "https://play-lh.googleusercontent.com/n4wrAVSNBMnQtoSEIuRSNqBJfbwFxU5OBpxSkFCJNMYT1jHLvpD1T0VbMZoREXAEgXM=w240-h480-rw", link: "https://play.google.com/store/search?q=cn+player+iptv&c=apps", passos: "1️⃣ Baixe o *CN Player* na Play Store\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*" },
  "CELULAR IPHONE":  { img: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/cb/d3/cf/cbd3cf0b-e87d-73c4-f504-35f39b4a6f93/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/230x0w.webp", link: "https://apps.apple.com/us/app/vu-iptv-player/id6526480705", passos: "1️⃣ Baixe o *VU IPTV Player* na App Store\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*" },
  "SMART TV SAMSUNG":{ img: "https://ottplayer.es/img/logo.png", link: null, passos: "1️⃣ Busque *Play Sim* ou *Assist Plus* na Smart Hub\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*" },
  "SMART TV LG":     { img: "https://ottplayer.es/img/logo.png", link: null, passos: "1️⃣ Busque *Play Sim* ou *Assist Plus* na LG Content Store\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*" },
  "SMART TV OUTRAS": { img: "https://ottplayer.es/img/logo.png", link: null, passos: "1️⃣ Busque *Play Sim* ou *Assist Plus* na loja de apps da sua TV\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*" },
  "PC OU NOTEBOOK":  { img: "https://play-lh.googleusercontent.com/n4wrAVSNBMnQtoSEIuRSNqBJfbwFxU5OBpxSkFCJNMYT1jHLvpD1T0VbMZoREXAEgXM=w240-h480-rw", link: "https://www.microsoft.com/store/apps", passos: "1️⃣ Baixe o *Smarts Player* no link abaixo\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*" },
  "FIRE STICK":      { img: "https://ottplayer.es/img/logo.png", link: null, passos: "1️⃣ Baixe o *Downloader* na Amazon Store (código: *382330*)\n2️⃣ Abra e baixe o XCIPTV pelo código *15633*\n3️⃣ Abra o XCIPTV e selecione *Xtream Codes*\n4️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*" },
  "ROKU":            { img: "https://ottplayer.es/img/logo.png", link: null, passos: "1️⃣ Busque *Play Sim* ou *Assist Plus* no Roku Channel Store\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*" },
};

async function enviarApp(phone, dispositivo) {
  const app = APPS[dispositivo];
  if (!app) { await txt(phone, "⏳ Preparando..."); return; }
  await img(phone, app.img, "");
  await txt(phone, app.passos + (app.link ? `\n\n🔗 *Baixar:* ${app.link}` : ""));
  await lista(phone,
    "Conseguiu baixar o app e acessar a tela de usuário e senha?",
    "🚀 Etapa Final - Liberar Teste",
    "LIBERAR TESTE 🚀",
    [
      { id: "liberar_teste", title: "✅ Sim, LIBERAR TESTE 🚀", description: "Estou pronto!" },
      { id: "preciso_ajuda", title: "❌ Preciso de Ajuda", description: "Não consegui instalar" },
    ]
  );
}

async function menuAparelhos(phone) {
  await lista(phone,
    "Para começar, me informe em qual aparelho deseja instalar:",
    "SELECIONE SEU DISPOSITIVO 📱",
    "VER APARELHOS 📋",
    [
      { id: "dev_tvbox",     title: "📦 TV BOX",         description: "Box Android TV" },
      { id: "dev_android",   title: "📱 Celular Android", description: "Smartphone Android" },
      { id: "dev_iphone",    title: "🍎 Celular iPhone",  description: "iPhone ou iPad (iOS)" },
      { id: "dev_smarttv",   title: "📺 Smart TV",        description: "Samsung, LG e outras" },
      { id: "dev_pc",        title: "🖥️ PC ou Notebook",  description: "Windows ou Mac" },
      { id: "dev_firestick", title: "🔥 Fire Stick",      description: "Amazon Fire Stick" },
      { id: "dev_roku",      title: "📡 Roku",            description: "Dispositivo Roku" },
    ]
  );
}

async function menuMarca(phone) {
  await lista(phone,
    "Selecione a marca da sua TV:",
    "QUAL A MARCA DA SUA TV? 📺",
    "VER MARCAS 📋",
    [
      { id: "marca_samsung", title: "Samsung",       description: "Smart TV Samsung" },
      { id: "marca_lg",      title: "LG",            description: "Smart TV LG" },
      { id: "marca_outras",  title: "Outras marcas", description: "Sony, Philips, TCL..." },
    ]
  );
}

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  try {
    const body = req.body;
    console.log("📦 BODY:", JSON.stringify(body).slice(0, 500));

    if (body.fromMe) return;

    const phone = body.phone;
    if (!phone) return;

    // Captura texto de qualquer formato
  const text = (
    body.text?.message ||
    body.listResponseMessage?.singleSelectReply?.selectedRowId ||
    body.listResponseMessage?.selectedRowId ||
    body.listReplyMessage?.singleSelectReply?.selectedRowId ||
    body.listReplyMessage?.selectedRowId ||
    body?.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    body.buttonsResponseMessage?.selectedButtonId ||
    body.responseList?.selectedRowId ||
    ""
  ).trim().toLowerCase();
    console.log(`📱 ${phone} | "${text}" | step: ${userState[phone]?.step || "inicio"}`);
    if (!text) return;

    const state = userState[phone] || { step: "inicio" };

    const SAUDACOES = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "menu", "start", "0", "hello", "hi"];

    if (state.step === "inicio" || SAUDACOES.includes(text)) {
      userState[phone] = { step: "aparelho" };
      await txt(phone, "Olá, bom dia! 👋\n\nMe chamo Paulo e darei continuidade ao seu atendimento. 👨‍💻\nSeja bem-vindo(a) à *Mago TV* 🚀\n\n🎁 Faça seu teste grátis agora mesmo!\nPara começar, me informe em qual aparelho deseja instalar:");
      await menuAparelhos(phone);

    } else if (state.step === "aparelho") {
      const devMap = { "dev_tvbox": "TV BOX", "dev_android": "CELULAR ANDROID", "dev_iphone": "CELULAR IPHONE", "dev_smarttv": "SMART TV", "dev_pc": "PC OU NOTEBOOK", "dev_firestick": "FIRE STICK", "dev_roku": "ROKU" };
      const dev = devMap[text];
      if (dev === "SMART TV") {
        userState[phone] = { step: "marca" };
        await menuMarca(phone);
      } else if (dev) {
        userState[phone] = { step: "nome", dispositivo: dev };
        await txt(phone, `✅ *${dev}* selecionado!\n\nMe diga seu *nome completo* para continuar:`);
      } else {
        await menuAparelhos(phone);
      }

    } else if (state.step === "marca") {
      const marcaMap = { "marca_samsung": "SAMSUNG", "marca_lg": "LG", "marca_outras": "OUTRAS" };
      const marca = marcaMap[text];
      if (marca) {
        userState[phone] = { step: "nome", dispositivo: `SMART TV ${marca}` };
        await txt(phone, `✅ *Smart TV ${marca}* selecionada!\n\nMe diga seu *nome completo* para continuar:`);
      } else {
        await menuMarca(phone);
      }

    } else if (state.step === "nome") {
      userState[phone] = { ...state, step: "liberar", nome: text };
      await enviarApp(phone, state.dispositivo);

    } else if (state.step === "liberar") {
      if (text === "liberar_teste" || text.includes("liberar") || text.includes("sim")) {
        const { dispositivo, nome } = state;
        userState[phone] = { step: "inicio" };
        await txt(phone, "⏳ Gerando seu teste, aguarde...");
        try {
          const { username, password } = await gerarTeste(nome || "Cliente", phone);
          await txt(phone, `✅ *Teste Liberado!* 🎉\n\n👤 *Usuário:* ${username}\n🔑 *Senha:* ${password}\n⏱️ *Validade:* ${TESTE_HORAS}h\n🔗 *Portal:* ${HYPERBOX_URL}\n\nInsira as credenciais no app e aproveite! 🎬\n\nGostou? Entre em contato para assinar um plano! 😊\nDigite *oi* para voltar ao menu.`);
        } catch (e) {
          console.error("❌ gerarTeste:", e.message);
          await txt(phone, "❌ Erro ao gerar o teste. Tente novamente digitando *oi*.");
          userState[phone] = { step: "inicio" };
        }
      } else if (text === "preciso_ajuda" || text === "ajuda") {
        await txt(phone, "🛠️ Sem problema! Um atendente irá te ajudar em breve. 👨‍💼");
      } else {
        await enviarApp(phone, state.dispositivo);
      }

    } else {
      userState[phone] = { step: "aparelho" };
      await txt(phone, "Olá, bom dia! 👋\n\nMe chamo Paulo e darei continuidade ao seu atendimento. 👨‍💻\nSeja bem-vindo(a) à *Mago TV* 🚀\n\n🎁 Faça seu teste grátis agora mesmo!\nPara começar, me informe em qual aparelho deseja instalar:");
      await menuAparelhos(phone);
    }

  } catch (e) {
    console.error("❌ Erro geral:", e.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Bot Mago TV rodando na porta ${PORT}`));
