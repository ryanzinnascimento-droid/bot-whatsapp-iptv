const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

// ─── CONFIGURAÇÕES ───────────────────────────────────────────
const ZAPI_INSTANCE = "3F1CADC0A881C1ED5919AAE399BC1248";
const ZAPI_TOKEN = "B0FF5F1805A034784BFBB247";
const ZAPI_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}`;

const HYPERBOX_URL = "https://hyperbox.sigma.st";
const HYPERBOX_USER = "mago77";
const HYPERBOX_PASS = "Mago77@77";
const TESTE_HORAS = 2;

// ─── ESTADO DOS USUÁRIOS ──────────────────────────────────────
const userState = {};

// ─── FUNÇÕES Z-API ────────────────────────────────────────────
async function sendText(phone, message) {
  await axios.post(`${ZAPI_URL}/send-text`, { phone, message });
}

async function sendOptionList(phone, message, title, buttonLabel, options) {
  await axios.post(`${ZAPI_URL}/send-option-list`, {
    phone,
    message,
    optionList: {
      title,
      buttonLabel,
      options, // [{ id, title, description }]
    },
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
    "TV BOX":         `📦 *Passo a passo TV BOX:*\n1. Baixe o app *Tivimate* ou *IPTV Smarters Pro* na Play Store\n2. Abra o app e selecione "Adicionar conta"\n3. Insira as credenciais acima\n4. Aproveite! 🎬`,
    "CELULAR ANDROID":`📱 *Passo a passo Android:*\n1. Baixe o app *IPTV Smarters Pro* na Play Store\n2. Abra e toque em "Adicionar usuário"\n3. Preencha com as credenciais acima\n4. Aproveite! 🎬`,
    "CELULAR IPHONE": `🍎 *Passo a passo iPhone:*\n1. Baixe o app *GSE Smart IPTV* na App Store\n2. Vá em "Remote Playlists" → "Add M3U URL"\n3. Use as credenciais no portal para gerar a URL M3U\n4. Aproveite! 🎬`,
    "PC OU NOTEBOOK": `🖥️ *Passo a passo PC/Notebook:*\n1. Baixe o *VLC Media Player* (gratuito)\n2. Abra o VLC → Mídia → Abrir fluxo de rede\n3. Cole a URL M3U gerada no portal\n4. Aproveite! 🎬`,
    "ROKU":           `📡 *Passo a passo Roku:*\n1. No Roku Channel Store, busque *IPTV Smarters*\n2. Instale e configure com as credenciais acima\n3. Aproveite! 🎬`,
    "FIRE STICK":     `🔥 *Passo a passo Fire Stick:*\n1. Instale o app *Downloader* na Fire Stick\n2. Baixe o *IPTV Smarters Pro* via APK\n3. Configure com as credenciais acima\n4. Aproveite! 🎬`,
  };
  return instrucoes[dispositivo] || `📺 Use as credenciais acima no seu app de IPTV preferido!\n\nPortal: ${HYPERBOX_URL}`;
}

// ─── MENUS ────────────────────────────────────────────────────
async function enviarMenuAparelhos(phone) {
  await sendOptionList(
    phone,
    "Para começar, me informe em qual aparelho deseja instalar:",
    "SELECIONE SEU DISPOSITIVO 📱",
    "VER APARELHOS 📋",
    [
      { id: "dev_tvbox",     title: "📦 TV BOX",          description: "Box Android TV" },
      { id: "dev_android",   title: "📱 Celular Android",  description: "Smartphone Android" },
      { id: "dev_iphone",    title: "🍎 Celular iPhone",   description: "iPhone ou iPad (iOS)" },
      { id: "dev_smarttv",   title: "📺 Smart TV",         description: "Samsung, LG e outras" },
      { id: "dev_pc",        title: "🖥️ PC ou Notebook",   description: "Windows ou Mac" },
      { id: "dev_roku",      title: "📡 Roku",             description: "Dispositivo Roku" },
      { id: "dev_firestick", title: "🔥 Fire Stick",       description: "Amazon Fire Stick" },
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
      { id: "marca_outras",  title: "Outras marcas", description: "Sony, Philips, TCL, Roku TV..." },
    ]
  );
}

// ─── WEBHOOK PRINCIPAL ────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const body = req.body;
  if (body.fromMe) return;

  const phone = body.phone;

  // Captura texto de mensagem normal ou seleção de lista (optionList)
  const text = (
    body.text?.message ||
    body.listResponseMessage?.singleSelectReply?.selectedRowId ||
    body.optionListResponseMessage?.selectedOptionId ||
    body.buttonsResponseMessage?.selectedButtonId ||
    ""
  ).trim().toLowerCase();

  if (!phone || !text) return;

  const state = userState[phone] || { step: "inicio" };

  try {

    // ── QUALQUER mensagem inicial → boas-vindas + menu ────────
    if (
      state.step === "inicio" ||
      ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "menu", "start", "0"].includes(text)
    ) {
      userState[phone] = { step: "aguardando_aparelho" };

      await sendText(phone,
        `Olá, bom dia! 👋\n\n` +
        `Me chamo Paulo e darei continuidade ao seu atendimento. 👨‍💻\n` +
        `Seja bem-vindo(a) à *Mago TV* 🚀\n\n` +
        `🎁 Faça seu teste grátis agora mesmo!\n` +
        `Para começar, me informe em qual aparelho deseja instalar:`
      );

      await enviarMenuAparelhos(phone);

    // ── Seleção de aparelho ───────────────────────────────────
    } else if (state.step === "aguardando_aparelho" && text.startsWith("dev_")) {
      const devMap = {
        "dev_tvbox":     "TV BOX",
        "dev_android":   "CELULAR ANDROID",
        "dev_iphone":    "CELULAR IPHONE",
        "dev_smarttv":   "SMART TV",
        "dev_pc":        "PC OU NOTEBOOK",
        "dev_roku":      "ROKU",
        "dev_firestick": "FIRE STICK",
      };

      const dispositivo = devMap[text];

      if (dispositivo === "SMART TV") {
        userState[phone] = { step: "aguardando_marca", dispositivo };
        await enviarMenuMarcaTV(phone);
      } else if (dispositivo) {
        userState[phone] = { step: "aguardando_nome", dispositivo, marca: null };
        await sendText(phone, `✅ Ótimo! *${dispositivo}* selecionado!\n\nAgora me diga seu *nome completo* para gerar o teste:`);
      } else {
        await enviarMenuAparelhos(phone);
      }

    // ── Seleção de marca TV ───────────────────────────────────
    } else if (state.step === "aguardando_marca" && text.startsWith("marca_")) {
      const marcaMap = {
        "marca_samsung": "SAMSUNG",
        "marca_lg":      "LG",
        "marca_outras":  "OUTRAS",
      };

      const marca = marcaMap[text];
      if (marca) {
        userState[phone] = { step: "aguardando_nome", dispositivo: state.dispositivo, marca };
        await sendText(phone, `✅ *Smart TV ${marca}* selecionada!\n\nAgora me diga seu *nome completo* para gerar o teste:`);
      } else {
        await enviarMenuMarcaTV(phone);
      }

    // ── Recebe nome e gera o teste ────────────────────────────
    } else if (state.step === "aguardando_nome") {
      const nome = text;
      const { dispositivo, marca } = state;
      userState[phone] = { step: "inicio" };

      await sendText(phone, "⏳ Gerando seu teste, aguarde um momento...");

      try {
        const { username, password } = await gerarTeste(nome, phone);
        const instrucoes = getInstrucoes(dispositivo, marca);

        await sendText(phone,
          `✅ *Teste gerado com sucesso!*\n\n` +
          `👤 *Usuário:* ${username}\n` +
          `🔑 *Senha:* ${password}\n` +
          `⏱️ *Validade:* ${TESTE_HORAS} horas\n` +
          `🔗 *Portal:* ${HYPERBOX_URL}\n\n` +
          `━━━━━━━━━━━━━━━━━\n\n` +
          instrucoes +
          `\n\n━━━━━━━━━━━━━━━━━\n\n` +
          `Gostou do teste? Entre em contato para assinar um plano! 😊\n` +
          `Digite *oi* para voltar ao menu.`
        );
      } catch (err) {
        console.error("Erro ao gerar teste:", err.message);
        await sendText(phone, "❌ Erro ao gerar o teste. Por favor, tente novamente digitando *oi*.");
        userState[phone] = { step: "inicio" };
      }

    // ── Mensagem não reconhecida → reinicia ───────────────────
    } else {
      userState[phone] = { step: "aguardando_aparelho" };
      await sendText(phone,
        `Olá, bom dia! 👋\n\n` +
        `Me chamo Paulo e darei continuidade ao seu atendimento. 👨‍💻\n` +
        `Seja bem-vindo(a) à *Mago TV* 🚀\n\n` +
        `🎁 Faça seu teste grátis agora mesmo!\n` +
        `Para começar, me informe em qual aparelho deseja instalar:`
      );
      await enviarMenuAparelhos(phone);
    }

  } catch (err) {
    console.error("Erro geral:", err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Bot Mago TV rodando na porta ${PORT}`));
