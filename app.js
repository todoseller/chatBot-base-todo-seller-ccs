const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario'])

// **************** OPCIONES DE PAGO *******************

const flowEfectivo = addKeyword(['efectivo', 'cash']).addAnswer(
    ['Muchas Gracias, por favor envíanos foto de los billetes para finalizar el pedido y poder verificar si disponemos de cambio.'],
    null,
    null,
)

const flowPagoMovil = addKeyword(['pago móvil', 'pago movil']).addAnswer(
    ['Por favor, realice su Pago Móvil a:',
    'A&B Bookcafé, C.A.',
    'Rif: J-500830300',
    'Tlf.: 0424-4098803',
    'Código: 0191-BNC ',
    '\nLuego de realizar su pago envíenos una foto o capture por esta vía para procesar.'
    ],
    null,
    null,
)

const flowZelle = addKeyword(['zelle']).addAnswer(
    ['Por favor, realice su Zelle a:',
    'aybtotal@gmail.com',
    '\nLuego de realizar su pago envíenos una foto o capture por esta vía para procesar.'
    ],
    null,
    null,
) // >>>>>>>>>>>>>>>>>> FIN OPCIONES DE PAGO 

const flowGracias = addKeyword(['gracias', 'grac']).addAnswer(
    [
        '🚀 Puedes aportar tu granito de arena a este proyecto',
        '[*opencollective*] https://opencollective.com/bot-whatsapp',
        '[*buymeacoffee*] https://www.buymeacoffee.com/leifermendez',
        '[*patreon*] https://www.patreon.com/leifermendez',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)


// **************** RESPUESTA PRINCIAPLES *****************

const flowPickup = addKeyword(['Pickup'])
    .addAnswer('Ok, como le gustaría pagar?')    
    .addAnswer(
    ['*Efectivo*', '*Pago Móvil*', '*Zelle*'],
    null,
    null,
    [flowEfectivo, flowPagoMovil, flowZelle]
)

const flowDelivery = addKeyword(['Delivery'])
    .addAnswer('Por favor, envíenos su ubicación (GPS) para darle el total a pagar')    
    .addAnswer(
    ['*Efectivo*', '*Pago Móvil*', '*Zelle*'],
    null,
    null,
)

const flowPrincipal = addKeyword(['de Orden'])
    .addAnswer('Hola gracias por tu compra en A&B Bookcafe! Soy un ChatBot y voy a asistirte para finalizar el pedido. Ahora escriba la opción de su preferencia')
    .addAnswer(
        [
            '👉 *Delivery* ❓',
            '👉 *Pickup* ❓',
        ],
        null,
        null,
        [flowEfectivo, flowPagoMovil, flowZelle, flowPickup, flowDelivery, flowGracias]
    )

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
