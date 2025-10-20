const fetch = require("node-fetch");

const WOOVI_APPID = "COLOQUE_SEU_APPID_AQUI";

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);
    const { cpf, valor } = body;

    if (!cpf || !valor) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "CPF ou valor ausente" }),
      };
    }

    const payload = {
      amount: parseFloat(valor),
      type: "DYNAMIC",
      payer: { document: cpf },
      expires_in: 3600
    };

    const response = await fetch("https://api.woovi.com/api/v1/charge", {
      method: "POST",
      headers: {
        "Authorization": WOOVI_APPID,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Woovi:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data.errors || "Erro desconhecido da Woovi" })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ woovi: data })
    };

  } catch (err) {
    console.error("Erro função:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno da função" })
    };
  }
};
