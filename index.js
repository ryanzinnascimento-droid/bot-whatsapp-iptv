const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const ZAPI_INSTANCE = "3F1CADC0A881C1ED5919AAE399BC1248";
const ZAPI_TOKEN = "B0FF5F1805A034784BFBB247";
const ZAPI_URL = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}`;

const HYPERBOX_URL = "https://hyperbox.sigma.st";
const HYPERBOX_USER = "mago77";
const HYPERBOX_PASS = "Mago77@77";
const TESTE_HORAS = 2;

const userState = {};

async function sendText(phone, message) {
  try {
    await axios.post(`${ZAPI_URL}/send-text`, {
      phone: phone,
      message: message,
    }, {
      headers: { "Client-Token": ZAPI_TOKEN }
    });
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err.message, err.response?.data);
  }
}

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
  await axios.post(`${HYPERBOX_URL}/api/clients`, {
    username, password, name: nome,
    expiration: expiracao.toISOString(),
    max_connections: 1, is_trial: true,
  }, { headers: { Authorization: `Bearer ${token}` } });
  return { username, password };
}

const menuPrincipal = `
