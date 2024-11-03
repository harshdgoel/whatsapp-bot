const axios = require("axios");
const config = require("../config/config"); // Ensure this file contains your config details
require('dotenv').config(); // Load environment variables from .env file

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

    async transition(intent) {
        switch (this.state) {
            case states.INITIAL:
                if (intent === 'HELP') {
                    this.state = states.HELP;
                    return await this.sendHelpOptions(); // Sending help options with buttons
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

    async sendHelpOptions() {
        const helpMessage = {
            "interactive": {
                "type": "button",
                "header": {
                    "type": "text",
                    "text": "How can I assist you today?"
                },
                "body": {
                    "text": "Here are some options I can help you with:"
                },
                "footer": {
                    "text": "Please select one of the options below."
                },
                "action": {
                    "buttons": [
                        {
                            "type": "reply",
                            "reply": {
                                "id": "BALANCE",
                                "title": "View Account Balances"
                            }
                        },
                        {
                            "type": "reply",
                            "reply": {
                                "id": "BILL_PAYMENT",
                                "title": "Bill Payment"
                            }
                        },
                        {
                            "type": "reply",
                            "reply": {
                                "id": "MONEY_TRANSFER",
                                "title": "Money Transfer"
                            }
                        }
                    ]
                }
            }
        };

        try {
            // Send the help message with buttons to the user
            const response = await axios.post('http://example.com/api/sendMessage', {
                recipient_id: 'user_id', // Replace with the actual user ID
                ...helpMessage
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
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
        const options = {
            // Define any additional options you may want to include
        };

        const config = {
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`, // Fetching token from .env
                'Content-Type': 'application/json' // Add any other headers your API requires
            }
        };

        try {
            console.log("Fetching balance from API...");
            const response = await axios.get('http://example.com/api/balance', { ...options, ...config });
            const balanceData = response.data; // Process response accordingly
            console.log("Balance fetched successfully:", balanceData);
            return `Your balance is $${balanceData.balance}.`; // Modify based on actual response structure
        } catch (error) {
            if (error.response) {
                console.error("Error fetching balance:", {
                    status: error.response.status,
                    data: error.response.data
                });
            } else {
                console.error("Error fetching balance:", error.message);
            }
            return "There was an error fetching your balance. Please try again later.";
        }
    }
}

module.exports = new StateMachine();
