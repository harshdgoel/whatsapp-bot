const express = require("express");
const axios = require("axios");
const natural = require("natural");
const { WordTokenizer } = natural;
const StateMachine = require('../states/stateMachine'); // Correctly instantiate StateMachine
const config = require('../config/config');
const router = express.Router();
const stateMachine = new StateMachine(); // Ensure the state machine instance is created

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
        if (keywords.some((keyword) => tokens.includes(keyword))) {
            return intent;
        }
    }
    return null; // Return null if no intent is found
};

router.post("/webhook", async (req, res) => {
    const body = req.body;

    // Validate incoming webhook requests
    if (body.object) {
        // Handle the webhook events
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
            const messageData = body.entry[0].changes[0].value.messages[0];
            const from = messageData.from;
            const messageBody = messageData.text.body;

            // Identify the intent
            const intent = identifyIntent(messageBody);
            await stateMachine.handleMessage(from, messageBody, intent);
        }
        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;
