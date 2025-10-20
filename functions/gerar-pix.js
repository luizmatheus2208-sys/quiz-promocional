// functions/gerar-pix.js
exports.handler = async (event, context) => {
  try {
    // Lê o corpo da requisição (JSON)
    const data = event.body ? JSON.parse(event.body) : {};

    // Valor fixo do Pix
    const valor = 36.60;

    // Você pode receber CPF ou outros dados se quiser
    const cpf = data.cpf || "00000000000";

    // Aqui você chamaria sua API do Pix
    // Exemplo fictício de retorno
    const pixResponse = {
      qrCode: "00020126580014BR.GOV.BCB.PIX0114+5561999999995204000053039865802BR5925Nome do Beneficiário6009Cidade6009BR6304ABCD",
      valor,
      cpf
    };

    return {
      statusCode: 200,
      body: JSON.stringify(pixResponse)
    };

  } catch (error) {
    console.error("Erro função:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```E0F

---

### Observações importantes:

1. **Não precisa do `req.body`**, use sempre `event.body`.
2. O valor está fixo em **36,60**.
3. Se o frontend não enviar JSON, o código não quebra: `data` será um objeto vazio.
4. Lembre de **atualizar o fetch do frontend** para o caminho correto:  

```js
fetch("/.netlify/functions/gerar-pix", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ cpf: "12345678900" })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
