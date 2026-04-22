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
  try {
    const r = await axios.post(`${HYPERBOX_URL}/api/auth/login`, { username: HYPERBOX_USER, password: HYPERBOX_PASS });
    console.log("HyperBox login:", JSON.stringify(r.data));
    return r.data.token || r.data.access_token || r.data.data?.token;
  } catch (err) {
    console.error("Erro login HyperBox:", err.response?.status, JSON.stringify(err.response?.data));
    throw new Error("Falha login HyperBox");
  }
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
  "TV BOX": {
    img: "https://i.ibb.co/rSghdPX/Whats-App-Image-2026-04-20-at-20-17-18-1.jpg",
    link: "https://play.google.com/store/search?q=cn+player+iptv&c=apps",
    passos: "1️⃣ Baixe o *CN Player* na Play Store\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*"
  },
  "CELULAR ANDROID": {
    img: "https://i.ibb.co/rSghdPX/Whats-App-Image-2026-04-20-at-20-17-18-1.jpg",
    link: "https://play.google.com/store/search?q=cn+player+iptv&c=apps",
    passos: "1️⃣ Baixe o *CN Player* na Play Store\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*"
  },
  "CELULAR IPHONE": {
    img: "https://i.ibb.co/7tnSLGBN/Whats-App-Image-2026-04-21-at-10-13-51.jpg",
    link: "https://apps.apple.com/br/app/iptvplayer-io-m3u-xtream/id6482853350",
    passos: "1️⃣ Baixe o *Vu Player* na App Store\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*"
  },
  "SMART TV SAMSUNG": {
    img: "https://i.postimg.cc/cC92pmh5/3008bfb6-36be-4ba5-b48d-e66c2c3748ab.jpg",
    link: null,
    passos: "1️⃣ Busque *Play Sim* ou *Assist Plus* na Smart Hub\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*"
  },
  "SMART TV LG": {
    img: "https://i.postimg.cc/cC92pmh5/3008bfb6-36be-4ba5-b48d-e66c2c3748ab.jpg",
    link: null,
    passos: "1️⃣ Busque *Play Sim* ou *Assist Plus* na LG Content Store\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*"
  },
  "SMART TV OUTRAS": {
    img: "https://ottpayer.es/img/logo.png",
    link: null,
    passos: "1️⃣ Busque *Play Sim* ou *Assist Plus* na loja de apps da sua TV\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*"
  },
  "PC OU NOTEBOOK": {
    img: "https://m.media-amazon.com/images/I/71taq8SIMLL.png",
    link: "https://iptv-smarters-pro.br.uptodown.com/windows/download",
    passos: "1️⃣ Baixe o *IPTV Smarters Pro* no link abaixo\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*"
  },
  "FIRE STICK": {
    img: "https://m.media-amazon.com/images/I/61QjUxDNMRL.png",
    link: null,
    passos: "1️⃣ Baixe o *Downloader* na Amazon Store (código: *382330*)\n2️⃣ Baixe o XCIPTV pelo código *15633*\n3️⃣ Abra e selecione *Xtream Codes*\n4️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*"
  },
  "ROKU": {
    img: "https://ottpayer.es/img/logo.png",
    link: null,
    passos: "1️⃣ Busque *Play Sim* ou *Assist Plus* no Roku Channel Store\n2️⃣ Abra e selecione *Xtream Codes*\n3️⃣ Insira suas credenciais\n\n🔴 Dificuldades? Digite *AJUDA*"
  },
};

async function enviarApp(phone, dispositivo) {
  const app = APPS[dispositivo];
  if (!app) { await txt(phone, "⚠️ Dispositivo não encontrado."); return; }
  if (app.img) await img(phone, app.img, "");
  await txt(phone, app.passos + (app.link ? `\n\n📥 *Baixar:* ${app.link}` : ""));
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

async function menuMarcaTV(phone) {
  await lista(phone,
    "Selecione a marca da sua Smart TV:",
    "MARCA DA TV 📺",
    "VER MARCAS 📋",
    [
      { id: "marca_samsung", title: "Samsung",       description: "Smart TV Samsung" },
      { id: "marca_lg",      title: "LG",            description: "Smart TV LG" },
      { id: "marca_outras",  title: "Outras marcas", description: "Sony, Philips, TCL..." },
    ]
  );
}

const DEV_MAP = {
  "dev_tvbox":     "TV BOX",
  "dev_android":   "CELULAR ANDROID",
  "dev_iphone":    "CELULAR IPHONE",
  "dev_smarttv":   "SMART TV",
  "dev_pc":        "PC OU NOTEBOOK",
  "dev_firestick": "FIRE STICK",
  "dev_roku":      "ROKU",
};

const MARCA_MAP = {
  "marca_samsung": "SMART TV SAMSUNG",
  "marca_lg":      "SMART TV LG",
  "marca_outras":  "SMART TV OUTRAS",
};

const SAUDACOES = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "menu", "start", "0", "hello", "hi"];

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  const body = req.body;
  if (body.fromMe) return;

  const phone = body.phone || body.telefone;
  const text = (
    body.text?.message ||
    body.texto?.mensagem ||
    body.listResponseMessage?.singleSelectReply?.selectedRowId ||
    body.listResponseMessage?.selectedRowId ||
    body.listReplyMessage?.singleSelectReply?.selectedRowId ||
    body.listReplyMessage?.selectedRowId ||
    body?.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    body.buttonsResponseMessage?.selectedButtonId ||
    body.responseList?.selectedRowId ||
    ""
  ).trim().toLowerCase();

  console.log(`📱 ${phone} | "${text}" | passo: ${userState[phone]?.step || "inicio"}`);
  if (!phone || !text) return;

  const state = userState[phone] || { step: "inicio" };

  try {
    if (state.step === "inicio" || SAUDACOES.includes(text)) {
      userState[phone] = { step: "aguardando_aparelho" };
      await txt(phone,
        `Olá, bom dia! 👋\n\nMe chamo Paulo e darei continuidade ao seu atendimento. 👨‍💻\nSeja bem-vindo(a) à *Mago TV* 🚀\n\n🎁 Faça seu teste grátis agora mesmo!\nPara começar, me informe em qual aparelho deseja instalar:`
      );
      await menuAparelhos(phone);

    } else if (state.step === "aguardando_aparelho" && DEV_MAP[text]) {
      const dispositivo = DEV_MAP[text];
      if (dispositivo === "SMART TV") {
        userState[phone] = { step: "aguardando_marca" };
        await menuMarcaTV(phone);
   } else {
        userState[phone] = { step: "aguardando_liberar", dispositivo, nome: "" };
        await enviarApp(phone, dispositivo);
      }

    } else if (state.step === "aguardando_marca" && MARCA_MAP[text]) {
      const dispositivo = MARCA_MAP[text];
      userState[phone] = { step: "aguardando_liberar", dispositivo, nome: "" };
      await enviarApp(phone, dispositivo);

    } else if (state.step === "aguardando_nome") {
      const { dispositivo } = state;
      userState[phone] = { step: "aguardando_liberar", dispositivo, nome: text };
      await enviarApp(phone, dispositivo);
    } else if (state.step === "aguardando_liberar" && text === "liberar_teste") {
      const { dispositivo, nome } = state;
      userState[phone] = { step: "inicio" };
      await txt(phone, "⏳ Gerando seu teste, aguarde...");
      try {
        const { username, password } = await gerarTeste(nome, phone);
        await txt(phone,
          `✅ *Teste gerado com sucesso!*\n\n` +
          `👤 *Usuário:* ${username}\n` +
          `🔑 *Senha:* ${password}\n` +
          `⏱️ *Validade:* ${TESTE_HORAS} horas\n` +
          `🔗 *Portal:* ${HYPERBOX_URL}\n\n` +
          `Gostou? Entre em contato para assinar um plano! 😊\nDigite *oi* para voltar ao menu.`
        );
      } catch (err) {
        console.error("Erro gerarTeste:", err.message);
        await txt(phone, "❌ Erro ao gerar o teste. Tente novamente ou aguarde um atendente.");
        userState[phone] = { step: "inicio" };
      }

    } else if (state.step === "aguardando_liberar" && text === "preciso_ajuda") {
      userState[phone] = { step: "inicio" };
      await txt(phone, "😊 Sem problema! Um atendente vai te ajudar em breve.\n\nDigite *oi* para recomeçar.");

    } else {
      userState[phone] = { step: "inicio" };
      await txt(phone, `Olá, bom dia! 👋\n\nMe chamo Paulo e darei continuidade ao seu atendimento. 👨‍💻\nSeja bem-vindo(a) à *Mago TV* 🚀\n\n🎁 Faça seu teste grátis agora mesmo!\nPara começar, me informe em qual aparelho deseja instalar:`);
      await menuAparelhos(phone);
    }

  } catch (err) {
    console.error("Erro geral:", err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Bot Mago TV rodando na porta ${PORT}`));
