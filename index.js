const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const ZAPI_INSTANCE = "3F1CADC0A881C1ED5919AAE399BC1248";
const ZAPI_TOKEN = "B0FF5F1805A034784BFBB247";
const ZAPI_CLIENT_TOKEN = "F2792570d921441dcb2d4e21a268dee75S";
const ZAPI_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}`;

const userState = {};

async function sendText(phone, message) {
  try {
    await axios.post(`${ZAPI_URL}/send-text`, {
      phone: phone,
      message: message,
    }, {
      headers: { "Client-Token": ZAPI_CLIENT_TOKEN }
    });
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err.message, err.response?.data);
  }
}

const dispositivos = {
  "1": {
    nome: "📺 TV Samsung",
    app: "PLAYSIM",
    url: "https://hyperbox.sigma.st/api/chatbot/YAWREq9Dji/BKADd2n1Ir"
  },
  "2": {
    nome: "📺 TV LG / SEMP VIDAA",
    app: "SMARTERS PLAYER PRO",
    url: "https://hyperbox.sigma.st/api/chatbot/YAWREq9Dji/kg5164DjiQ"
  },
  "3": {
    nome: "📺 TV Samsung / Roku / LG (Blessed)",
    app: "BLESSED",
    url: "https://hyperbox.sigma.st/api/chatbot/YAWREq9Dji/QywDmMRDpR"
  },
  "4": {
    nome: "📦 TV Box / Fire Stick (Core Player)",
    app: "CORE PLAYER",
    url: "https://hyperbox.sigma.st/api/chatbot/YAWREq9Dji/ZVdWXVjL3q"
  },
  "5": {
    nome: "📦 TV Box / Fire Stick (HD Player)",
    app: "HD PLAYER",
    url: "https://hyperbox.sigma.st/api/chatbot/YAWREq9Dji/7IoL7VM1XM"
  },
  "6": {
    nome: "📱 iPhone / iOS",
    app: "SMARTERS / VU PLAYER",
    url: "https://hyperbox.sigma.st/api/chatbot/YAWREq9Dji/XYgD9JWr6V"
  },
  "7": {
    nome: "📱 Celular Android (Vizzion/Superplay)",
    app: "VIZZION PLAY / SUPERPLAY",
    url: "https://hyperbox.sigma.st/api/chatbot/YAWREq9Dji/ayb1BQxWPR"
  },
  "8": {
    nome: "📱 Celular Android (Happer)",
    app: "HAPPER",
    url: "https://hyperbox.sigma.st/api/chatbot/YAWREq9Dji/kmVLlB7WQw"
  },
  "9": {
    nome: "📱 Celular Android (XCIPTV)",
    app: "XCIPTV",
    url: "https://hyperbox.sigma.st/api/chatbot/YAWREq9Dji/kg516V41jI"
  },
  "10": {
    nome: "💻 Windows / PC",
    app: "APLICATIVO WINDOWS",
    url: "https://hyperbox.sigma.st/api/chatbot/YAWREq9Dji/XKjLMPR104"
  },
  "11": {
    nome: "📺 Samsung/Roku/LG (Assist+)",
    app: "ASSIST+",
    url: "https://hyperbox.sigma.st/api/chatbot/YAWREq9Dji/Yen12r91PE"
  },
  "12": {
    nome: "📱 Outros Apps (Usuário e Senha)",
    app: "DEMAIS APPS",
    url: "https://hyperbox.sigma.st/api/chatbot/YAWREq9Dji/80m1Eq91IE"
  }
};

const menuDispositivos = `📺 *Olá! Bem-vindo à Mago IPTV!* 🎬

Sou o Paulo e estou aqui para te ajudar a ter o melhor entretenimento! 😊

Por favor, me informe o seu dispositivo:

1️⃣ - TV Samsung
2️⃣ - TV LG / SEMP VIDAA
3️⃣ - TV Samsung/Roku/LG (Blessed)
4️⃣ - TV Box / Fire Stick (Core Player)
5️⃣ - TV Box / Fire Stick (HD Player)
6️⃣ - iPhone / iOS
7️⃣ - Celular Android (Vizzion/Superplay)
8️⃣ - Celular Android (Happer)
9️⃣ - Celular Android (XCIPTV)
🔟 - Windows / PC
1️⃣1️⃣ - Samsung/Roku/LG (Assist+)
1️⃣2️⃣ - Outros Apps

_Digite o número do seu dispositivo._`;

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  const body = req.body;
  if (body.fromMe) return;
  const phone = body.phone;
  const text = (body.text?.message || "").trim();
  if (!phone || !text) return;

  const state = userState[phone] || { step: "menu" };

  try {
    if (state.step === "menu" || text === "0" || text.toLowerCase() === "menu") {
      userState[phone] = { step: "aguardando_dispositivo" };
      await sendText(phone, menuDispositivos);

    } else if (state.step === "aguardando_dispositivo") {
      const dispositivo = dispositivos[text];

      if (dispositivo) {
        userState[phone] = { step: "aguardando_dispositivo" };
        await sendText(phone,
          `✅ Ótima escolha! Para *${dispositivo.nome}* vamos instalar o *${dispositivo.app}*.\n\n` +
          `👇 Clique no botão abaixo para *liberar seu teste grátis:*\n\n` +
          `🔗 ${dispositivo.url}\n\n` +
          `Após clicar, você receberá suas credenciais de acesso automaticamente! 🚀\n\n` +
          `_Digite *0* para voltar ao menu ou *4* para falar com um atendente._`
        );
      } else if (text === "4") {
        await sendText(phone, "👨‍💼 Aguarde, um atendente irá te chamar em breve!\n\nDigite *0* para voltar ao menu.");
      } else {
        await sendText(phone, "❌ Opção inválida. Por favor escolha um número de 1 a 12.\n\n" + menuDispositivos);
      }

    } else {
      userState[phone] = { step: "aguardando_dispositivo" };
      await sendText(phone, menuDispositivos);
    }

  } catch (err) {
    console.error("Erro geral:", err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Bot rodando na porta ${PORT}`);
});
