const axios = require("axios");
const config = require("../config/config"); // Ensure this file contains your config details

// Define the states
const states = {
    INITIAL: 'INITIAL',
    HELP: 'HELP',
    BALANCE: 'BALANCE',
    BILL_PAYMENT: 'BILL_PAYMENT',
    // Add more states as necessary
};

class StateMachine {
    constructor() {
        this.state = states.INITIAL;
    }

    async transition(intent, from) {
        switch (this.state) {
            case states.INITIAL:
                if (intent === 'HELP') {
                    this.state = states.HELP;

                    const helpMessage ="Here's what I can help you with:\n" +
                           "- View account balances\n" +
                           "- Bill Payment\n" +
                           "- Money Transfer\n" +
                           "- Find a bank branch or ATM\n" +
                           "- View recent transactions\n" +
                           "- Inquire your spends\n" +
                           "- Know your upcoming payments\n" +
                           "- Inquire about dues on credit card\n" +
                           "- Inquire about credit card limit\n" +
                           "- Inquire your outstanding balance on loan account\n" +
                           "- Inquire about next installment date and amount\n" +
                           "- Get more information about banking products and services offered by Futura Bank\n" +
                           "- New Account Opening info";
                    
                    await this.sendMessage(from, helpMessage);

                    const optionsMessage = {
                        messaging_product: "whatsapp",
                        to: from,
                        type: "interactive",
                        interactive: {
                            type: "button",
                            body: {
                                text: "Please choose an option:"
                            },
                            action: {
                                buttons: [
                                    { "type": "reply", "reply": { "id": "BALANCE", "title": "View Account Balances" }},
                                    { "type": "reply", "reply": { "id": "BILL_PAYMENT", "title": "Bill Payment" }},
                                    { "type": "reply", "reply": { "id": "MONEY_TRANSFER", "title": "Money Transfer" }},
                                    { "type": "reply", "reply": { "id": "FIND_BRANCH", "title": "Find a Bank Branch or ATM" }},
                                    { "type": "reply", "reply": { "id": "RECENT_TRANSACTIONS", "title": "View Recent Transactions" }},
                                    { "type": "reply", "reply": { "id": "SPENDS", "title": "Inquire Your Spends" }},
                                    { "type": "reply", "reply": { "id": "UPCOMING_PAYMENTS", "title": "Know Your Upcoming Payments" }},
                                    { "type": "reply", "reply": { "id": "DUES_CC", "title": "Inquire About Dues on Credit Card" }},
                                    { "type": "reply", "reply": { "id": "LIMIT_CC", "title": "Inquire About Credit Card Limit" }},
                                    { "type": "reply", "reply": { "id": "OUTSTANDING_LOAN", "title": "Inquire Your Outstanding Balance on Loan Account" }},
                                    { "type": "reply", "reply": { "id": "NEXT_INSTALLMENT", "title": "Inquire About Next Installment Date and Amount" }},
                                    { "type": "reply", "reply": { "id": "BANKING_PRODUCTS", "title": "Get More Information About Banking Products and Services" }},
                                    { "type": "reply", "reply": { "id": "NEW_ACCOUNT", "title": "New Account Opening Info" }}
                                ]
                            }
                        }
                    };

                    await this.sendMessage(from, optionsMessage);
                    return; // Exit to prevent further processing

                } else if (intent === 'BALANCE') {
                    this.state = states.BALANCE;
                    return "Fetching your balance...";
                }
                break;

            case states.BALANCE:
                // Logic to fetch and return the balance
                return await this.fetchBalance();

            // Handle other states similarly...

            default:
                return "I'm not sure how to help with that. Try asking about your balance or say 'help'.";
        }
    }

    async fetchBalance() {
        const options = {
            // Define any additional options you may want to include
        };

        const config = {
            headers: {
                'Authorization': `Bearer ${config.whatsappToken}`, // If your API requires an auth token
                'Content-Type': 'application/json' // Add any other headers your API requires
            }
        };

        try {
            const response = await axios.get('http://example.com/api/balance', { ...options, ...config });
            const balanceData = response.data; // Process response accordingly
            return `Your balance is $${balanceData.balance}.`; // Modify based on actual response structure
        } catch (error) {
            console.error("Error fetching balance:", error.response ? error.response.data : error.message);
            return "There was an error fetching your balance. Please try again later.";
        }
    }

    async sendMessage(to, message) {
        const messagePayload = {
            messaging_product: "whatsapp",
            to: to,
            ...message // This can be text or the interactive message structure
        };

        try {
            await axios.post(`https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages?access_token=${config.whatsappToken}`, messagePayload);
        } catch (error) {
            console.error("Error sending message:", error.response ? error.response.data : error.message);
        }
    }
}

module.exports = new StateMachine();
