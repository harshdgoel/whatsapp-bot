const express = require("express");
const axios = require("axios");
const natural = require("natural");
const { WordTokenizer } = natural;
const stateMachine = require('../states/stateMachine');
const config = require('../config/config');
const router = express.Router();

// Define intents and keywords
const intents = {
    INITIAL: ["start", "begin", "initiate", "initial"],
    HELP: ["help", "assist", "support", "guidance", "how to"],
    BALANCE: ["balance", "check balance", "my balance", "account balance"],
    BILL_PAYMENT: ["pay bill", "bill payment", "utility payment", "pay my bill"],
    RECENT_TRANSACTIONS: ["recent transactions", "latest transactions", "recent activity", "transaction history"],
    MONEY_TRANSFER: ["transfer money", "send money", "money transfer", "pay someone"],
    SPENDS: ["spends", "expenditure", "how much did I spend", "spending summary"],
    UPCOMING_PAYMENTS: ["upcoming payments", "future payments", "scheduled payments", "due payments"],
    CREDIT_DUES: ["credit dues", "credit card payment", "outstanding credit", "due amount"],
    OUTSTANDING_LOAN: ["outstanding loan", "loan balance", "remaining loan", "loan amount due"],
    NEXT_LOAN: ["next loan", "future loan", "new loan options", "loan inquiry"],
    LOCATE_ATM: ["locate atm", "nearest atm", "find atm", "atm nearby"],
    LOCATE_BRANCH: ["locate branch", "nearest branch", "find bank branch", "bank location"],
    FINANCE_INQUIRY: ["finance inquiry", "financial query", "financial information", "investment inquiry"]
};

// Initialize tokenizer
const tokenizer = new WordTokenizer();

// Identify intent from user message
const identifyIntent = (message) => {
    const tokens = tokenizer.tokenize(message.toLowerCase());
    for (const [intent, keywords] of Object.entries(intents)) {
        if (keywords.some(keyword => tokens.includes(keyword))) {
            return intent;
        }
    }
    return "UNKNOWN"; // Return 'UNKNOWN' if no intent is matched
};

// Function to send a message to WhatsApp using the API
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

// Webhook route to handle incoming messages
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

        // Identify user intent
        const intent = identifyIntent(messageBody);

        // Transition state based on the identified intent
        let responseMessage;
        try {
            responseMessage = await stateMachine.transition(intent);
        } catch (error) {
            console.error("Error transitioning state:", error);
            responseMessage = "Sorry, I couldn't understand your request. Please try again or ask for help.";
        }

        // Send the response message using WhatsApp
        await sendMessageToWhatsApp(from, responseMessage);

        return res.sendStatus(200);
    }

    return res.sendStatus(404);
});

module.exports = router;
