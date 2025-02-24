const axios = require("axios");
require("dotenv").config();
const { createBot, createProvider, createFlow, addKeyword } = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");

const enviarMensaje = async (datosEntrantes) => {
    try {
        const url = process.env.WEBHOOK_URL;
        if (!url) {
            throw new Error("La variable de entorno WEBHOOK_URL no está definida.");
        }

        console.log("URL a la que se envía la petición:", url);

        const username = process.env.USUARIO;
        const password = process.env.PASSWORD;

        const response = await axios.post(
            url,
            { data: datosEntrantes },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error en enviarMensaje:", error.message);
        throw error;
    }
};

const flowPrincipal = addKeyword(["Hola", "Alo", "Buenas", "información"])
    .addAnswer('Hola!', 
        { capture: true }, 
        async (ctx, { flowDynamic, fallBack }) => {
            try {
                // Construir objeto con los datos relevantes
                let datosEntrantes = {
                    from: ctx.from,
                    body: ctx.body.replace(/(\r\n|\n|\r)/gm, " . ") // Elimina saltos de línea
                };

                console.log("Datos enviados al webhook:", datosEntrantes);

                const respuesta = await enviarMensaje(datosEntrantes);
                console.log("Respuesta del webhook:", respuesta);

                // Maneja la respuesta
                const mensaje = respuesta[0]?.output || "Error: Respuesta no válida"; 
                return fallBack(mensaje);

            } catch (error) {
                console.error("Error en el flujo principal:", error.message);
                await flowDynamic("Lo siento, ocurrió un error al procesar tu solicitud.");
            }
    });

const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([flowPrincipal]);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();
};

main();
