const axios = require("axios");

exports.handler = async function (event, context) {
  try {
    // Variáveis de ambiente definidas no Netlify
    const WOOVI_APPID = process.env.WOOVI_APPID;
    const WOOVI_CLIENTID = process.env.WOOVI_CLIENTID;

    // Valor fixo do Pix
    const valorPix = 36.60;

    // Criar payload para gerar Pix
    const payload = {
      amount: valorPix,
      clientId: WOOVI_CLIENTID,
      // Aqui você pode adicionar mais campos necessários pela API Woovi
      description: "Pagamento Quiz Promocional",
    };

    // Chamada à API Woovi
    const response = await axios.post(
      "https://api.woovi.com.br/v1/pix", // Endpoint Woovi
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-WOOVI-APPID": WOOVI_APPID,
        },
      }
    );

    // Retorna dados do Pix (como QR Code)
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error("Erro ao gerar Pix:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro ao gerar Pix. Consulte o console." }),
    };
  }
};
