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

async function sendImage(phone, imageUrl, caption) {
  try {
    const res = await axios.post(`${ZAPI_URL}/send-image`, { phone, image: imageUrl, caption }, { headers: zapiHeaders });
    console.log("✅ sendImage OK:", res.status);
  } catch (err) {
    console.error("❌ sendImage ERRO:", err.response?.status, JSON.stringify(err.response?.data));
  }
}

async function sendOptionList(phone, message, title, buttonLabel, options) {
  try {
    const payload = { phone, message, optionList: { title, buttonLabel, options } };
    const res = await axios.post(`${ZAPI_URL}/send-option-list`, payload, { headers: zapiHeaders });
    console.log("✅ sendOptionList OK:", res.status);
  } catch (err) {
    console.error("❌ sendOptionList ERRO:", err.response?.status, JSON.stringify(err.response?.data));
    throw err;
  }
}

async function sendButtonList(phone, message, buttons) {
  try {
    const payload = {
      phone,
      message,
      buttonList: {
        buttons: buttons.map((b, i) => ({ id: `btn_${i}`, label: b }))
      }
    };
    const res = await axios.post(`${ZAPI_URL}/send-button-list`, payload, { headers: zapiHeaders });
    console.log("✅ sendButtonList OK:", res.status);
  } catch (err) {
    console.error("❌ sendButtonList ERRO:", err.response?.status, JSON.stringify(err.response?.data));
    // Fallback: envia como texto
    await sendText(phone, message + "\n\nDigite *LIBERAR* para receber seu teste!");
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

// ─── INFO DOS APPS POR DISPOSITIVO ───────────────────────────
const appsInfo = {
  "TV BOX": {
    imagem: "https://play-lh.googleusercontent.com/n4wrAVSNBMnQtoSEIuRSNqBJfbwFxU5OBpxSkFCJNMYT1jHLvpD1T0VbMZoREXAEgXM=w240-h480-rw",
    passos: `1️⃣ Baixe o app *CN Player* diretamente na Play Store da sua TV BOX.\n\n2️⃣ Após concluir o download, abra o aplicativo e selecione *Adicionar Playlist* ou *Xtream Codes*.\n\n3️⃣ Clique na opção *Xtream Account* e insira suas credenciais.\n\n🔴 Se não encontrar o app ou tiver qualquer dificuldade, envie *AJUDA* que te passo outra opção imediatamente.`,
    link: "https://play.google.com/store/search?q=cn+player+iptv&c=apps",
  },
  "CELULAR ANDROID": {
    imagem: "https://play-lh.googleusercontent.com/n4wrAVSNBMnQtoSEIuRSNqBJfbwFxU5OBpxSkFCJNMYT1jHLvpD1T0VbMZoREXAEgXM=w240-h480-rw",
    passos: `1️⃣ Baixe o app *CN Player* diretamente na Play Store do seu celular.\n\n2️⃣ Após concluir o download, abra o aplicativo e selecione *Adicionar Playlist* ou *Xtream Codes*.\n\n3️⃣ Clique na opção *Xtream Account* e insira suas credenciais.\n\n🔴 Se não encontrar o app ou tiver qualquer dificuldade, envie *AJUDA* que te passo outra opção imediatamente.`,
    link: "https://play.google.com/store/search?q=cn+player+iptv&c=apps",
  },
  "CELULAR IPHONE": {
    imagem: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/cb/d3/cf/cbd3cf0b-e87d-73c4-f504-35f39b4a6f93/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/230x0w.webp",
    passos: `1️⃣ Baixe o app *VU IPTV Player* diretamente na App Store do seu iPhone.\n\n2️⃣ Após concluir o download, abra o aplicativo e selecione *Add Playlist*.\n\n3️⃣ Clique na opção *Xtream Codes* e insira suas credenciais.\n\n🔴 Se não encontrar o app ou tiver qualquer dificuldade, envie *AJUDA* que te passo outra opção imediatamente.`,
    link: "https://apps.apple.com/us/app/vu-iptv-player/id6526480705",
  },
  "SMART TV SAMSUNG": {
    imagem: "https://play-lh.googleusercontent.com/hJGHtbYBnHzPDpxJXuYvKMPx7DJKdMIf5AjLKVWzMzlYfmZBPi-xMFYPMJVSw4eTg=w240-h480-rw",
    passos: `1️⃣ Baixe o app *Play Sim* ou *Assist Plus* diretamente na Smart Hub da sua Samsung.\n\n2️⃣ Após concluir o download, abra o aplicativo e selecione *Lista* ou *Playlist*.\n\n3️⃣ Clique na opção *Xtream Account* e insira suas credenciais.\n\n🔴 Se não encontrar o app ou tiver qualquer dificuldade, envie *AJUDA* que te passo outra opção imediatamente.`,
    link: "https://www.samsung.com/br/smarttv/",
  },
  "SMART TV LG": {
    imagem: "https://play-lh.googleusercontent.com/hJGHtbYBnHzPDpxJXuYvKMPx7DJKdMIf5AjLKVWzMzlYfmZBPi-xMFYPMJVSw4eTg=w240-h480-rw",
    passos: `1️⃣ Baixe o app *Play Sim* ou *Assist Plus* diretamente na LG Content Store da sua TV.\n\n2️⃣ Após concluir o download, abra o aplicativo e selecione *Lista* ou *Playlist*.\n\n3️⃣ Clique na opção *Xtream Account* e insira suas credenciais.\n\n🔴 Se não encontrar o app ou tiver qualquer dificuldade, envie *AJUDA* que te passo outra opção imediatamente.`,
    link: "https://www.lg.com/br/suporte/",
  },
  "SMART TV OUTRAS": {
    imagem: "https://play-lh.googleusercontent.com/hJGHtbYBnHzPDpxJXuYvKMPx7DJKdMIf5AjLKVWzMzlYfmZBPi-xMFYPMJVSw4eTg=w240-h480-rw",
    passos: `1️⃣ Busque o app *Play Sim* ou *Assist Plus* na loja de aplicativos da sua Smart TV.\n\n2️⃣ Após concluir o download, abra o aplicativo e selecione *Lista* ou *Playlist*.\n\n3️⃣ Clique na opção *Xtream Account* e insira suas credenciais.\n\n🔴 Se não encontrar o app ou tiver qualquer dificuldade, envie *AJUDA* que te passo outra opção imediatamente.`,
    link: null,
  },
  "PC OU NOTEBOOK": {
    imagem: "https://play-lh.googleusercontent.com/n4wrAVSNBMnQtoSEIuRSNqBJfbwFxU5OBpxSkFCJNMYT1jHLvpD1T0VbMZoREXAEgXM=w240-h480-rw",
    passos: `1️⃣ Baixe o app *Smarts Player* no seu PC ou Notebook pelo link abaixo.\n\n2️⃣ Após instalar, abra o aplicativo e selecione *Adicionar Conta*.\n\n3️⃣ Clique na opção *Xtream Codes* e insira suas credenciais.\n\n🔴 Se tiver qualquer dificuldade, envie *AJUDA* que te passo outra opção imediatamente.`,
    link: "https://www.microsoft.com/store/apps",
  },
  "FIRE STICK": {
    imagem: "https://m.media-amazon.com/images/I/71+o5+nrSXL.png",
    passos: `1️⃣ No seu Fire Stick, vá em *Configurações → Meu Fire TV → Opções do desenvolvedor* e ative *Apps de fontes desconhecidas*.\n\n2️⃣ Baixe o app *Downloader* na Amazon Store (código: *382330*).\n\n3️⃣ Abra o Downloader e baixe o *XCIPTV* pelo código *15633*.\n\n4️⃣ Instale e abra o XCIPTV, selecione *Xtream Codes* e insira suas credenciais.\n\n🔴 Se tiver qualquer dificuldade, envie *AJUDA* que te passo outra opção imediatamente.`,
    link: null,
  },
  "ROKU": {
    imagem: "https://play-lh.googleusercontent.com/hJGHtbYBnHzPDpxJXuYvKMPx7DJKdMIf5AjLKVWzMzlYfmZBPi-xMFYPMJVSw4eTg=w240-h480-rw",
    passos: `1️⃣ No seu Roku, acesse o *Roku Channel Store* e busque por *Play Sim* ou *Assist Plus*.\n\n2️⃣ Após instalar, abra o aplicativo e selecione *Adicionar Playlist*.\n\n3️⃣ Clique na opção *Xtream Codes* e insira suas credenciais.\n\n🔴 Se não encontrar o app ou tiver qualquer dificuldade, envie *AJUDA* que te passo outra opção imediatamente.`,
    link: null,
  },
};

// ─── ENVIAR INFO DO APP ───────────────────────────────────────
async function enviarInfoApp(phone, dispositivo, marca) {
  const key = marca ? `SMART TV ${marca}` : dispositivo;
  const info = appsInfo[key] || appsInfo[dispositivo];

  if (!info) {
    await sendText(phone, "⏳ Preparando suas informações...");
    return;
  }

  // 1. Envia imagem do app
  await sendImage(phone, info.imagem, "");

  // 2. Envia passo a passo + link
  let mensagem = info.passos;
  if (info.link) {
    mensagem += `\n\n🔗 *Baixar agora:* ${info.link}`;
  }
  await sendText(phone, mensagem);

  // 3. Envia botão para liberar o teste
  await sendOptionList(
    phone,
    "Conseguiu baixar o aplicativo e acessar a tela de usuário e senha?",
    "🚀 Etapa Final para Liberar Seu Teste",
    "LIBERAR TESTE 🚀",
    [
      { id: "liberar_teste", title: "✅ LIBERAR TESTE 🚀", description: "Sim, estou pronto para receber!" },
      { id: "preciso_ajuda", title: "❌ Preciso de Ajuda", description: "Não consegui instalar o app" },
    ]
  );
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
      { id: "dev_firestick", title: "🔥 Fire Stick",      description: "Amazon Fire Stick" },
      { id: "dev_roku",      title: "📡 Roku",            description: "Dispositivo Roku" },
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

  if (body.fromMe) return;

  const phone = body.phone;
  const text = (
    body.text?.message ||
    body.listResponseMessage?.singleSelectReply?.selectedRowId ||
    body.optionListResponseMessage?.selectedOptionId ||
    body.buttonsResponseMessage?.selectedButtonId ||
    ""
  ).trim().toLowerCase();

  console.log(`📱 Phone: ${phone} | Texto: "${text}" | Step: ${userState[phone]?.step || "inicio"}`);

  if (!phone || !text) return;

  const state = userState[phone] || { step: "inicio" };

  try {
    // ── Boas-vindas ───────────────────────────────────────────
    if (
      state.step === "inicio" ||
      ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "menu", "start", "0"].includes(text)
    ) {
      userState[phone] = { step: "aguardando_aparelho" };
      await sendText(phone,
        `Olá, bom dia! 👋\n\nMe chamo Paulo e darei continuidade ao seu atendimento. 👨‍💻\nSeja bem-vindo(a) à *Mago TV* 🚀\n\n🎁 Faça seu teste grátis agora mesmo!\nPara começar, me informe em qual aparelho deseja instalar:`
      );
      await enviarMenuAparelhos(phone);

    // ── Seleção de aparelho ───────────────────────────────────
    } else if (state.step === "aguardando_aparelho" && text.startsWith("dev_")) {
      const devMap = {
        "dev_tvbox": "TV BOX", "dev_android": "CELULAR ANDROID",
        "dev_iphone": "CELULAR IPHONE", "dev_smarttv": "SMART TV",
        "dev_pc": "PC OU NOTEBOOK", "dev_firestick": "FIRE STICK", "dev_roku": "ROKU",
      };
      const dispositivo = devMap[text];
      if (dispositivo === "SMART TV") {
        userState[phone] = { step: "aguardando_marca", dispositivo };
        await enviarMenuMarcaTV(phone);
      } else if (dispositivo) {
        userState[phone] = { step: "aguardando_nome", dispositivo, marca: null };
        await sendText(phone, `✅ *${dispositivo}* selecionado!\n\nMe diga seu *nome completo* para continuar:`);
      } else {
        await enviarMenuAparelhos(phone);
      }

    // ── Seleção de marca TV ───────────────────────────────────
    } else if (state.step === "aguardando_marca" && text.startsWith("marca_")) {
      const marcaMap = { "marca_samsung": "SAMSUNG", "marca_lg": "LG", "marca_outras": "OUTRAS" };
      const marca = marcaMap[text];
      if (marca) {
        userState[phone] = { step: "aguardando_nome", dispositivo: state.dispositivo, marca };
        await sendText(phone, `✅ *Smart TV ${marca}* selecionada!\n\nMe diga seu *nome completo* para continuar:`);
      } else {
        await enviarMenuMarcaTV(phone);
      }

    // ── Recebe nome → envia info do app ───────────────────────
    } else if (state.step === "aguardando_nome") {
      const { dispositivo, marca } = state;
      userState[phone] = { step: "aguardando_liberar", dispositivo, marca, nome: text };
      await enviarInfoApp(phone, dispositivo, marca);

    // ── Cliente clicou em LIBERAR TESTE ──────────────────────
    } else if (state.step === "aguardando_liberar" && text === "liberar_teste") {
      const { dispositivo, marca, nome } = state;
      userState[phone] = { step: "inicio" };

      await sendText(phone, "⏳ Gerando seu teste, aguarde um momento...");

      try {
        const { username, password } = await gerarTeste(nome || "Cliente", phone);
        await sendText(phone,
          `✅ *Teste Liberado com Sucesso!* 🎉\n\n` +
          `👤 *Usuário:* ${username}\n` +
          `🔑 *Senha:* ${password}\n` +
          `⏱️ *Validade:* ${TESTE_HORAS} horas\n` +
          `🔗 *Portal:* ${HYPERBOX_URL}\n\n` +
          `Insira essas credenciais no app que você instalou e aproveite! 🎬\n\n` +
          `Gostou? Entre em contato para assinar um plano! 😊\n` +
          `Digite *oi* para voltar ao menu.`
        );
      } catch (err) {
        console.error("❌ Erro ao gerar teste:", err.message);
        await sendText(phone, "❌ Erro ao gerar o teste. Tente novamente digitando *oi*.");
        userState[phone] = { step: "inicio" };
      }

    // ── Cliente pediu ajuda ───────────────────────────────────
    } else if (text === "preciso_ajuda" || text === "ajuda") {
      await sendText(phone,
        `🛠️ *Sem problema! Vou te ajudar!*\n\nUm atendente irá te chamar em breve com outra opção de app.\n\nAguarde... 👨‍💼`
      );

    // ── Fallback ──────────────────────────────────────────────
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
