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

                    // Prepare the help text message
                    const helpMessage = {
                        text: {
                            body: "🤖 *Here's what I can help you with:*"
                        }
                    };

                    // Send the text message
                    await this.sendMessage(from, helpMessage);

                    // Prepare the list message
                    const listMessage = {
                        messaging_product: "whatsapp",
                        to: from,
                        type: "interactive",
                        interactive: {
                            type: "list",
                            header: {
                                type: "text",
                                text: "Choose an option"
                            },
                            body: {
                                text: "Select one of the following services:"
                            },
                            footer: {
                                text: "Futura Bank Services"
                            },
                            action: {
                                button: "View Options",
                                sections: [
                                    {
                                        title: "Banking Services",
                                        rows: [
                                            { id: "BALANCE", title: "View Account Balances", description: "Check your current account balances" },
                                            { id: "BILL_PAYMENT", title: "Bill Payment", description: "Pay your bills quickly" },
                                            { id: "MONEY_TRANSFER", title: "Money Transfer", description: "Transfer money to others" },
                                            { id: "TRANSACTIONS", title: "View Recent Transactions", description: "See your latest transactions" }
                                            // Add more rows as necessary
                                        ]
                                    },
                                    {
                                        title: "Information Services",
                                        rows: [
                                            { id: "ATM_LOCATOR", title: "Find a Bank Branch or ATM", description: "Locate nearby ATMs or branches" },
                                            { id: "LOAN_INFO", title: "Loan Information", description: "Inquire about your loan details" },
                                            { id: "CREDIT_CARD", title: "Credit Card Details", description: "Know your credit card limits and dues" }
                                            // Add more rows as necessary
                                        ]
                                    }
                                ]
                            }
                        }
                    };

                    // Send the list message
                    await this.sendMessage(from, listMessage);
                    return; // Exit to prevent further processing
                } else if (intent === 'BALANCE') {
                    this.state = states.BALANCE;
                    return "Fetching your balance...";
                }
                break;

            case states.BALANCE:
                // Logic to fetch and return the balance
                return await this.fetchBalance(from);

            // Handle other states similarly...

            default:
                return "I'm not sure how to help with that. Try asking about your balance or say 'help'.";
        }
    }

    async sendMessage(to, message) {
        // Ensure 'to' is defined
        if (!to) {
            console.error("Recipient phone number is undefined.");
            return;
        }

        // Wrap the message in the correct structure
        const messagePayload = {
            messaging_product: "whatsapp",
            to: to,
            ...message // Include the message object directly
        };

        console.log("Sending message:", messagePayload);

        try {
            const response = await axios.post(
                `https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages?access_token=${config.whatsappToken}`,
                messagePayload
            );
            return response.data; // Return the response for further processing if needed
        } catch (error) {
            console.error("Error sending message:", error.response ? error.response.data : error.message);
        }
    }

    async fetchBalance(from) {
        const options = {
            // Define any additional options you may want to include
        };

        const requestConfig = {
            headers: {
                'Authorization': `Bearer ${config.whatsappToken}`, // If your API requires an auth token
                'Content-Type': 'application/json' // Add any other headers your API requires
            }
        };

        try {
            const response = await axios.get('http://example.com/api/balance', { ...options, ...requestConfig });
            const balanceData = response.data; // Process response accordingly
            return `Your balance is $${balanceData.balance}.`; // Modify based on actual response structure
        } catch (error) {
            console.error("Error fetching balance:", error.response ? error.response.data : error.message);
            return "There was an error fetching your balance. Please try again later.";
        }
    }
}

module.exports = new StateMachine();
