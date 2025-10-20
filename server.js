const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serve index.html, script.js, style.css

const PORT = process.env.PORT || 3000;
// AppID da Woovi (substitua por variável de ambiente em produção)
const WOOVI_APPID = process.env.WOOVI_APPID || "Q2xpZW50X0lkXzdkMmM3YTU2LTU1ZTktNGYyNC05ZTBlLWJhYTNkNTk5Yzk5ZDpDbGllbnRfU2VjcmV0X2EwN3Rab3lLWHFDVjd6Ni90M05qYy9KR3JXbDU2TkFKWnlUSzJTbXlGanM9";

// Endpoint para gerar Pix
app.post('/gerar-pix', async (req, res) => {
  try {
    const { cpf, valorCentavos } = req.body;
    if (!cpf) return res.status(400).json({ error: 'CPF ausente' });

    // Valor em centavos (padrão 3660)
    const value = (typeof valorCentavos === 'number') ? valorCentavos : 3660;

    const body = {
      value: value,
      type: "DYNAMIC",
      payer: { document: cpf },
      correlationID: uuidv4(),
      expires_in: 3600
    };

    const resp = await fetch('https://api.woovi.com/api/v1/charge', {
      method: 'POST',
      headers: {
        'Authorization': WOOVI_APPID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error('Erro Woovi:', data);
      return res.status(500).json({ error: data.errors || data });
    }

    return res.json({ woovi: data });
  } catch (err) {
    console.error('Erro servidor:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook opcional
app.post('/webhook', (req, res) => {
  console.log('Webhook recebido:', req.body);
  res.status(200).end();
});

// Serve index.html na raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
