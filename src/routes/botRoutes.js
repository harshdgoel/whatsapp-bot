const express = require("express");
const natural = require("natural");
const { WordTokenizer } = natural;
const StateMachine = require('../states/stateMachine');
const router = express.Router();
const stateMachine = new StateMachine();

const intents = {
    INITIAL: ["start", "begin", "hello", "hi", "greetings"],
    HELP: ["help", "assist", "support", "what can you do"],
    BALANCE: ["balance", "check balance", "my balance", "account balance"],
    BILL_PAYMENT: ["pay bill", "bill payment", "utility payment", "pay my bill"],
    RECENT_TRANSACTIONS: ["recent transactions", "latest transactions", "transaction history"],
    MONEY_TRANSFER: ["money transfer", "send money", "transfer funds"],
    SPENDS: ["spends", "expenses", "spending"],
    UPCOMING_PAYMENTS: ["upcoming payments", "due payments"],
    CREDIT_DUES: ["credit dues", "credit card due", "credit card payment"],
    OUTSTANDING_LOAN: ["outstanding loan", "loan balance", "loan payment"],
    NEXT_LOAN: ["next loan", "next installment", "loan due date"],
    LOCATE_ATM: ["locate atm", "find atm", "nearest atm"],
    LOCATE_BRANCH: ["locate branch", "find branch", "nearest branch"],
    FINANCE_INQUIRY: ["finance inquiry", "financial products", "banking services"]
};

router.post("/webhook", async (req, res) => {
    const { entry } = req.body;
    let messagingEvent;

    // Check the structure of the incoming request
    if (entry && entry[0] && entry[0].changes && entry[0].changes[0].value && entry[0].changes[0].value.messages) {
        messagingEvent = entry[0].changes[0].value.messages[0];
    } else {
        console.error("Received unexpected structure:", JSON.stringify(entry, null, 2));
        return res.status(400).send("No messaging event received.");
    }

    const { from, text } = messagingEvent;
    const messageBody = text.body;
    console.log('Mobile number:',from)
    // Tokenize the incoming message
    const tokenizer = new WordTokenizer();
    const tokens = tokenizer.tokenize(messageBody.toLowerCase());
    
    // Determine intent
    let intent = identifyIntent(tokens);
    
    // Handle message
    await stateMachine.handleMessage(from, messageBody, intent);

    return res.sendStatus(200);
});

function identifyIntent(tokens) {
    for (const [intent, keywords] of Object.entries(intents)) {
        if (keywords.some(keyword => tokens.includes(keyword))) {
            return intent;
        }
    }
    return 'UNKNOWN';
}

module.exports = router;
