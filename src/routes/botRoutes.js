const express = require("express");
const axios = require("axios");
const natural = require("natural");
const { WordTokenizer } = natural;
const stateMachine = require("./stateMachine");
const router = express.Router();

const intents = {
    HELP: ["help", "assist", "support"],
    BALANCE: ["balance", "check balance", "my balance"],
    // Add more intents as necessary
};

const tokenizer = new WordTokenizer();

const identifyIntent = (message) => {
    const tokens = tokenizer.tokenize(message.toLowerCase());
    for (const [intent, keywords] of Object.entries(intents)) {
        if (keywords.some(keyword => tokens.includes(keyword))) {
            return intent;
        }
    }
    return null; // No matching intent
};

const sendMessageToWhatsApp = async (phoneNumberId, from, message) => {
    try {
        // Replace with your WhatsApp sending logic
        await axios.post(`https://api.whatsapp.com/send?phone=${phoneNumberId}`, {
            messaging_product: "whatsapp",
            to: from,
            text: { body: message }
        });
    } catch (error) {
        console.error("Error sending message:", error);
    }
};

router.post("/webhook", async (req, res) => {
    const bodyParam = req.body;
    console.log("Received webhook body:", JSON.stringify(bodyParam));

    if (!bodyParam.object) {
        return res.sendStatus(404);
    }

    const changes = bodyParam.entry[0].changes[0].value;

    if (changes.messages && changes.messages.length > 0) {
        const message = changes.messages[0];
        const phoneNumberId = changes.metadata.phone_number_id;
        const from = message.from;
        const messageBody = message.text.body;

        // Identify user intent
        const intent = identifyIntent(messageBody);

        // Transition state based on the identified intent
        const responseMessage = stateMachine.transition(intent);

        await sendMessageToWhatsApp(phoneNumberId, from, responseMessage);
        
        return res.sendStatus(200);
    }

    return res.sendStatus(404);
});

module.exports = router;