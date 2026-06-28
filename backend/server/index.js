import express from "express";
import webhookRoute from "./webhook.js";

const app = express();

// Webhook precisa vir antes do express.json()
app.use("/webhook", webhookRoute);

app.use(express.json());

// Porta do servidor
const PORT = 4242;

app.listen(PORT, () => {
  console.log(`🚀 Servidor online em http://localhost:${PORT}`);
});
