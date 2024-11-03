const axios = require("axios");
const config = require("../config/config");
require('dotenv').config();

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

    async transition(intent) {
        switch (this.state) {
            case states.INITIAL:
                if (intent === 'HELP') {
                    this.state = states.HELP;
                    return await this.sendHelpOptions();
                } else if (intent === 'BALANCE') {
                    this.state = states.BALANCE;
                    return "Fetching your balance...";
                }
                break;

            case states.BALANCE:
                return await this.fetchBalance();

            // Handle other states similarly...

            default:
                return "I'm not sure how to help with that. Try asking about your balance or say 'help'.";
        }
    }

    async sendHelpOptions() {
        const helpMessage = {
            messaging_product: "whatsapp",
            to: "user_id", // Replace with the actual user ID dynamically
            interactive: {
                type: "button",
                header: {
                    type: "text",
                    text: "How can I assist you today?"
                },
                body: {
                    text: "Here are some options I can help you with:"
                },
                footer: {
                    text: "Please select one of the options below."
                },
                action: {
                    buttons: [
                        {
                            type: "reply",
                            reply: {
                                id: "BALANCE",
                                title: "View Account Balances"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "BILL_PAYMENT",
                                title: "Bill Payment"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "MONEY_TRANSFER",
                                title: "Money Transfer"
                            }
                        }
                    ]
                }
            }
        };

        try {
            const response = await axios.post(`https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages?access_token=${config.whatsappToken}`, helpMessage, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log("Help options sent successfully:", response.data);
            return "I've sent you the options. Please select one.";
        } catch (error) {
            console.error("Error sending help options:", error.response ? error.response.data : error.message);
            return "There was an error sending the help options. Please try again later.";
        }
    }

    async fetchBalance() {
        try {
            const response = await axios.get('http://example.com/api/balance', {
                headers: {
                    'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            const balanceData = response.data; // Adjust based on your actual response structure
            console.log("Balance fetched successfully:", balanceData);
            return `Your balance is $${balanceData.balance}.`;
        } catch (error) {
            console.error("Error fetching balance:", error.response ? error.response.data : error.message);
            return "There was an error fetching your balance. Please try again later.";
        }
    }
}

module.exports = new StateMachine();
