const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

// ─── CONFIGURAÇÕES ───────────────────────────────────────────
const ZAPI_INSTANCE = "3F1CADC0A881C1ED5919AAE399BC1248";
const ZAPI_TOKEN = "B0FF5F1805A034784BFBB247";
const ZAPI_CLIENT_TOKEN = "Fe37f170edb7f48a295f2f126c0fcee90S";
const ZAPI_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}`;

const HYPERBOX_URL = "https://hyperbox.sigma.st";
const HYPERBOX_USER = "mago77";
const HYPERBOX_PASS = "Mago77@77";
const TESTE_HORAS = 2;

const userState = {};

// ─── HEADERS Z-API ────────────────────────────────────────────
const zapiHeaders = {
  "Content-Type": "application/json",
  "Client-Token": ZAPI_CLIENT_TOKEN,
};

// ─── FUNÇÕES Z-API ────────────────────────────────────────────
async function sendText(phone, message) {
  try {
    const res = await axios.post(`${ZAPI_URL}/send-text`, { phone, message }, { headers: zapiHeaders });
    console.log("✅ sendText OK:", res.status);
  } catch (err) {
    console.error("❌ sendText ERRO:", err.response?.status, JSON.stringify(err.response?.data));
    throw err;
  }
}

async function sendOptionList(phone, message, title, buttonLabel, options) {
  try {
    const payload = { phone, message, optionList: { title, buttonLabel, options } };
    console.log("📤 sendOptionList payload:", JSON.stringify(payload));
    const res = await axios.post(`${ZAPI_URL}/send-option-list`, payload, { headers: zapiHeaders });
    console.log("✅ sendOptionList OK:", res.status, JSON.stringify(res.data));
  } catch (err) {
    console.error("❌ sendOptionList ERRO:", err.response?.status, JSON.stringify(err.response?.data));
    throw err;
  }
}

// ─── HYPERBOX ────────────────────────────────────────────────
async function hyperboxLogin() {
  const res = await axios.post(`${HYPERBOX_URL}/api/auth/login`, {
    username: HYPERBOX_USER,
    password: HYPERBOX_PASS,
  });
  return res.data.token || res.data.access_token;
}

async function gerarTeste(nome, phone) {
  const token = await hyperboxLogin();
  const username = "teste_" + phone.replace(/\D/g, "").slice(-8);
  const password = "T" + Math.random().toString(36).slice(-6).toUpperCase();
  const expiracao = new Date();
  expiracao.setHours(expiracao.getHours() + TESTE_HORAS);

  await axios.post(
    `${HYPERBOX_URL}/api/clients`,
    { username, password, name: nome, expiration: expiracao.toISOString(), max_connections: 1, is_trial: true },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return { username, password };
}

// ─── INSTRUÇÕES ───────────────────────────────────────────────
function getInstrucoes(dispositivo, marca) {
  if (dispositivo === "SMART TV") {
    if (marca === "SAMSUNG") return `📺 *Smart TV Samsung:*\n1. Smart Hub → busque *Smart IPTV*\n2. Instale e anote o MAC\n3. Acesse o portal e cadastre o MAC`;
    if (marca === "LG") return `📺 *Smart TV LG:*\n1. LG Content Store → busque *SS IPTV*\n2. Instale e anote o MAC\n3. Acesse o portal e cadastre o MAC`;
    return `📺 *Smart TV:*\n1. Busque *IPTV Smarters* na loja de apps\n2. Instale e adicione as credenciais`;
  }
  const map = {
    "TV BOX":          `📦 *TV BOX:*\n1. Baixe *Tivimate* ou *IPTV Smarters Pro* na Play Store\n2. Adicione as credenciais acima`,
    "CELULAR ANDROID": `📱 *Android:*\n1. Baixe *IPTV Smarters Pro* na Play Store\n2. Adicione as credenciais acima`,
    "CELULAR IPHONE":  `🍎 *iPhone:*\n1. Baixe *GSE Smart IPTV* na App Store\n2. Use as credenciais no portal para gerar a URL M3U`,
    "PC OU NOTEBOOK":  `🖥️ *PC/Notebook:*\n1. Baixe o *VLC Media Player*\n2. Mídia → Abrir fluxo de rede → cole a URL M3U`,
    "ROKU":            `📡 *Roku:*\n1. Channel Store → busque *IPTV Smarters*\n2. Configure com as credenciais acima`,
    "FIRE STICK":      `🔥 *Fire Stick:*\n1. Instale *Downloader*\n2. Baixe *IPTV Smarters Pro* via APK\n3. Configure com as credenciais`,
  };
  return map[dispositivo] || `Use as credenciais no seu app de IPTV. Portal: ${HYPERBOX_URL}`;
}

// ─── MENUS ────────────────────────────────────────────────────
async function enviarMenuAparelhos(phone) {
  await sendOptionList(
    phone,
    "Para começar, me informe em qual aparelho deseja instalar:",
    "SELECIONE SEU DISPOSITIVO 📱",
    "VER APARELHOS 📋",
    [
      { id: "dev_tvbox",     title: "📦 TV BOX",         description: "Box Android TV" },
      { id: "dev_android",   title: "📱 Celular Android", description: "Smartphone Android" },
      { id: "dev_iphone",    title: "🍎 Celular iPhone",  description: "iPhone ou iPad (iOS)" },
      { id: "dev_smarttv",   title: "📺 Smart TV",        description: "Samsung, LG e outras" },
      { id: "dev_pc",        title: "🖥️ PC ou Notebook",  description: "Windows ou Mac" },
      { id: "dev_roku",      title: "📡 Roku",            description: "Dispositivo Roku" },
      { id: "dev_firestick", title: "🔥 Fire Stick",      description: "Amazon Fire Stick" },
    ]
  );
}

async function enviarMenuMarcaTV(phone) {
  await sendOptionList(
    phone,
    "Selecione a marca para receber o passo a passo correto:",
    "QUAL A MARCA DA SUA TV? 📺",
    "VER MARCAS 📋",
    [
      { id: "marca_samsung", title: "Samsung",       description: "Smart TV Samsung" },
      { id: "marca_lg",      title: "LG",            description: "Smart TV LG" },
      { id: "marca_outras",  title: "Outras marcas", description: "Sony, Philips, TCL..." },
    ]
  );
}

// ─── WEBHOOK ──────────────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  const body = req.body;

  console.log("📩 Webhook recebido:", JSON.stringify(body).slice(0, 300));

  if (body.fromMe) {
    console.log("⏩ Ignorando mensagem própria");
    return;
  }

  const phone = body.phone;
  const text = (
    body.text?.message ||
    body.listResponseMessage?.singleSelectReply?.selectedRowId ||
    body.optionListResponseMessage?.selectedOptionId ||
    body.buttonsResponseMessage?.selectedButtonId ||
    ""
  ).trim().toLowerCase();

  console.log(`📱 Phone: ${phone} | Texto: "${text}" | Step: ${userState[phone]?.step || "inicio"}`);

  if (!phone || !text) {
    console.log("⚠️ Phone ou texto vazio, ignorando");
    return;
  }

  const state = userState[phone] || { step: "inicio" };

  try {
    if (
      state.step === "inicio" ||
      ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "menu", "start", "0"].includes(text)
    ) {
      userState[phone] = { step: "aguardando_aparelho" };
      await sendText(phone,
        `Olá, bom dia! 👋\n\nMe chamo Paulo e darei continuidade ao seu atendimento. 👨‍💻\nSeja bem-vindo(a) à *Mago TV* 🚀\n\n🎁 Faça seu teste grátis agora mesmo!\nPara começar, me informe em qual aparelho deseja instalar:`
      );
      await enviarMenuAparelhos(phone);

    } else if (state.step === "aguardando_aparelho" && text.startsWith("dev_")) {
      const devMap = {
        "dev_tvbox": "TV BOX", "dev_android": "CELULAR ANDROID",
        "dev_iphone": "CELULAR IPHONE", "dev_smarttv": "SMART TV",
        "dev_pc": "PC OU NOTEBOOK", "dev_roku": "ROKU", "dev_firestick": "FIRE STICK",
      };
      const dispositivo = devMap[text];
      if (dispositivo === "SMART TV") {
        userState[phone] = { step: "aguardando_marca", dispositivo };
        await enviarMenuMarcaTV(phone);
      } else if (dispositivo) {
        userState[phone] = { step: "aguardando_nome", dispositivo, marca: null };
        await sendText(phone, `✅ *${dispositivo}* selecionado!\n\nMe diga seu *nome completo* para gerar o teste:`);
      } else {
        await enviarMenuAparelhos(phone);
      }

    } else if (state.step === "aguardando_marca" && text.startsWith("marca_")) {
      const marcaMap = { "marca_samsung": "SAMSUNG", "marca_lg": "LG", "marca_outras": "OUTRAS" };
      const marca = marcaMap[text];
      if (marca) {
        userState[phone] = { step: "aguardando_nome", dispositivo: state.dispositivo, marca };
        await sendText(phone, `✅ *Smart TV ${marca}* selecionada!\n\nMe diga seu *nome completo* para gerar o teste:`);
      } else {
        await enviarMenuMarcaTV(phone);
      }

    } else if (state.step === "aguardando_nome") {
      const { dispositivo, marca } = state;
      userState[phone] = { step: "inicio" };
      await sendText(phone, "⏳ Gerando seu teste, aguarde...");
      try {
        const { username, password } = await gerarTeste(text, phone);
        const instrucoes = getInstrucoes(dispositivo, marca);
        await sendText(phone,
          `✅ *Teste gerado!*\n\n👤 *Usuário:* ${username}\n🔑 *Senha:* ${password}\n⏱️ *Validade:* ${TESTE_HORAS}h\n🔗 *Portal:* ${HYPERBOX_URL}\n\n━━━━━━━━━━━━━━━━━\n\n${instrucoes}\n\n━━━━━━━━━━━━━━━━━\n\nGostou? Digite *oi* para ver nossos planos! 😊`
        );
      } catch (err) {
        console.error("❌ Erro ao gerar teste:", err.message);
        await sendText(phone, "❌ Erro ao gerar o teste. Tente novamente digitando *oi*.");
        userState[phone] = { step: "inicio" };
      }

    } else {
      userState[phone] = { step: "aguardando_aparelho" };
      await sendText(phone,
        `Olá, bom dia! 👋\n\nMe chamo Paulo e darei continuidade ao seu atendimento. 👨‍💻\nSeja bem-vindo(a) à *Mago TV* 🚀\n\n🎁 Faça seu teste grátis agora mesmo!\nPara começar, me informe em qual aparelho deseja instalar:`
      );
      await enviarMenuAparelhos(phone);
    }

  } catch (err) {
    console.error("❌ Erro geral:", err.message, JSON.stringify(err.response?.data));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Bot Mago TV rodando na porta ${PORT}`));
