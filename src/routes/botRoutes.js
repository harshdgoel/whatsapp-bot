const express = require("express");
const axios = require("axios");
const natural = require("natural");
const { WordTokenizer } = natural;
const stateMachine = require('../states/stateMachine'); // Ensure your stateMachine can handle the new states
const config = require('../config/config');
const router = express.Router();
const stateMachine = new StateMachine();
// Updated intents with additional states
const intents = {
    INITIAL: ["start", "begin", "hello", "hi", "greetings"],
    HELP: ["help", "assist", "support", "what can you do"],
    BALANCE: ["balance", "check balance", "my balance", "account balance"],
    BILL_PAYMENT: ["pay bill", "bill payment", "utility payment", "pay my bill"],
    RECENT_TRANSACTIONS: ["recent transactions", "latest transactions", "recent activity", "transaction history"],
    MONEY_TRANSFER: ["transfer money", "send money", "money transfer", "pay someone"],
    SPENDS: ["spends", "spending", "my spends"],
    UPCOMING_PAYMENTS: ["upcoming payments", "next payments", "payments due"],
    CREDIT_DUES: ["credit dues", "credit card dues", "due payments"],
    OUTSTANDING_LOAN: ["outstanding loan", "loan details", "current loan"],
    NEXT_LOAN: ["next loan", "upcoming loan", "future loan"],
    LOCATE_ATM: ["locate atm", "find atm", "nearest atm"],
    LOCATE_BRANCH: ["locate branch", "find branch", "nearest branch"],
    FINANCE_INQUIRY: ["finance inquiry", "financial question", "ask finance"]
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
        await axios.post(`https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages?access_token=${config.whatsappToken}`, {
            messaging_product: "whatsapp",
            to: to,
            text: { body: message }
        });
    } catch (error) {
        console.error("Error sending message:", error.response ? error.response.data : error.message);
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
        const from = message.from;
        const messageBody = message.text.body;

        // Identify user intent and handle state transitions
        const intent = identifyIntent(messageBody);
        const responseMessage = await stateMachine.handleMessage(from, messageBody, intent);

        // Send the response message
        await sendMessageToWhatsApp(from, responseMessage);

        return res.sendStatus(200);
    }

    return res.sendStatus(404);
});

module.exports = router;
