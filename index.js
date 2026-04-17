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

// ─── ESTADO DOS USUÁRIOS (memória simples) ────────────────────
const userState = {};

// ─── FUNÇÃO: Enviar mensagem de texto ─────────────────────────
async function sendText(telefone, messagem) {
  await axios.post(`${ZAPI_URL}/send-text`, {
    phone,
    message,
  });
}

// ─── FUNÇÃO: Login no HyperBox e obter token ──────────────────
async function hyperboxLogin() {
  const res = await axios.post(`${HYPERBOX_URL}/api/auth/login`, {
    username: HYPERBOX_USER,
    password: HYPERBOX_PASS,
  });
  return res.data.token || res.data.access_token;
}

// ─── FUNÇÃO: Gerar teste no HyperBox ─────────────────────────
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
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return { username, password };
}

// ─── MENU PRINCIPAL ───────────────────────────────────────────
const menuPrincipal = `👋 Olá! Bem-vindo à *Mago IPTV* 🎬

Escolha uma opção abaixo:

1️⃣ - Solicitar Teste Grátis (2h)
2️⃣ - Ver Planos e Preços
3️⃣ - Suporte
4️⃣ - Falar com Atendente

_Digite o número da opção desejada._`;

const menuPlanos = `💎 *Nossos Planos:*

📦 *Mensal* - R$ 25,00
📦 *Trimestral* - R$ 60,00
📦 *Semestral* - R$ 100,00
📦 *Anual* - R$ 180,00

✅ Canais HD/FHD/4K
✅ Filmes e Séries
✅ Esportes ao vivo

Para contratar, fale com nosso atendente! Digite *4* para ser atendido.`;

// ─── WEBHOOK PRINCIPAL ────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  const body = req.body;

  // Ignora mensagens enviadas pelo próprio bot
  if (body.fromMe) return;

  const phone = body.phone;
  const text = (body.text?.message || "").trim();

  if (!phone || !text) return;

  const state = userState[phone] || { step: "menu" };

  try {
    // ── STEP: Menu principal ──────────────────────────────────
    if (state.step === "menu" || text === "0" || text.toLowerCase() === "menu") {
      userState[phone] = { step: "aguardando_opcao" };
      await sendText(phone, menuPrincipal);

    // ── STEP: Aguardando opção do menu ────────────────────────
    } else if (state.step === "aguardando_opcao") {

      if (text === "1") {
        userState[phone] = { step: "aguardando_nome" };
        await sendText(phone, "✍️ Ótimo! Para gerar seu teste, me diga seu *nome completo*:");

      } else if (text === "2") {
        await sendText(phone, menuPlanos);

      } else if (text === "3") {
        await sendText(phone, "🛠️ *Suporte*\n\nDescreva seu problema e um atendente irá te ajudar em breve.\n\nOu acesse: https://hyperbox.sigma.st\n\nDigite *0* para voltar ao menu.");

      } else if (text === "4") {
        userState[phone] = { step: "menu" };
        await sendText(phone, "👨‍💼 Aguarde, um atendente irá te chamar em breve!\n\nDigite *0* para voltar ao menu.");

      } else {
        await sendText(phone, "❌ Opção inválida. " + menuPrincipal);
      }

    // ── STEP: Aguardando nome para gerar teste ────────────────
    } else if (state.step === "aguardando_nome") {
      const nome = text;
      userState[phone] = { step: "gerando_teste" };

      await sendText(phone, "⏳ Gerando seu teste, aguarde um momento...");

      try {
        const { username, password } = await gerarTeste(nome, phone);

        await sendText(phone,
          `✅ *Teste gerado com sucesso!*\n\n` +
          `👤 *Usuário:* ${username}\n` +
          `🔑 *Senha:* ${password}\n` +
          `⏱️ *Validade:* ${TESTE_HORAS} horas\n` +
          `🔗 *Portal:* http://hyperbox.sigma.st\n\n` +
          `📱 Instale o app *TiviMate* ou *IPTV Smarters* e use as credenciais acima.\n\n` +
          `Gostou? Digite *2* para ver nossos planos ou *4* para falar com um atendente!`
        );

        userState[phone] = { step: "aguardando_opcao" };

      } catch (err) {
        console.error("Erro ao gerar teste:", err.message);
        await sendText(phone, "❌ Erro ao gerar o teste. Por favor, tente novamente ou digite *4* para falar com um atendente.");
        userState[phone] = { step: "aguardando_opcao" };
      }

    } else {
      userState[phone] = { step: "aguardando_opcao" };
      await sendText(phone, menuPrincipal);
    }

  } catch (err) {
    console.error("Erro geral:", err.message);
  }
});

// ─── START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Bot rodando na porta ${PORT}`);
});
