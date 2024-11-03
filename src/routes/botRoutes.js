const express = require("express");
const axios = require("axios");
const natural = require("natural");
const { WordTokenizer } = natural;
const stateMachine = require('../states/stateMachine'); // Correct path to stateMachine.js
const config = require('../config/config'); // Import the config to access environment variables
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

const sendMessageToWhatsApp = async (to, message) => {
    try {
        // Use the phone number ID from the .env file
        await axios.post(`https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages?access_token=${config.whatsappToken}`, {
            messaging_product: "whatsapp",
            to: to,
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
        const from = message.from; // Sender's number
        const messageBody = message.text.body;

        // Identify user intent
        const intent = identifyIntent(messageBody);

        // Transition state based on the identified intent
        const responseMessage = stateMachine.transition(intent);

        // Send the message using the configured phone number ID
        await sendMessageToWhatsApp(from, responseMessage);
        
        return res.sendStatus(200);
    }

    return res.sendStatus(404);
});

module.exports = router;
