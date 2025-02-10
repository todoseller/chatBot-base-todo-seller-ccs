const axios = require("axios")
require('dotenv').config();
const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
// const { delay } = require('@whiskeysockets/baileys')


const enviarMensaje = async (datosEntrantes) => {
    try {
        const url = process.env.WEBHOOK_URL; // Access URL from environment variable

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
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error en enviarMensaje:', error.message); // Print entire error message
        throw error;
    }
};




const flowPrincipal = addKeyword(['Hola', 'Alo', 'Buenas', 'información'])
    .addAnswer('Bienvenido a Todo Seller, soy un asistente virtual',
        { capture: true },
        async (ctx, { flowDynamic, fallBack }) => {
            try {
                // Convertimos el objeto ctx a una cadena JSON para enviarlo
                const body = JSON.stringify(ctx);
                console.log("Datos enviados al webhook:", body);

                // Envía el objeto ctx completo al webhook
                const respuesta = await enviarMensaje(body);
                console.log("Respuesta del webhook:", respuesta);

                // Maneja la respuesta del webhook
                let mensaje;
                if (respuesta && respuesta.body) {
                    // Si la respuesta tiene un campo 'body', usamos ese mensaje
                    mensaje = respuesta.body;
                } else if (respuesta && respuesta.message && respuesta.message.extendedTextMessage) {
                    // Si la respuesta tiene un mensaje extendido, usamos el texto
                    mensaje = respuesta.message.extendedTextMessage.text;
                } else {
                    // Si no hay un campo válido, mostramos un mensaje de error
                    mensaje = "Error: Respuesta no válida";
                }

                // Enviamos el mensaje al usuario
                if (mensaje) {
                    return fallBack(mensaje);
                }
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
