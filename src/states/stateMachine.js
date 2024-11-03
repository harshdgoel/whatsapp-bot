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

    transition(intent) {
        switch (this.state) {
            case states.INITIAL:
                if (intent === 'HELP') {
                    this.state = states.HELP;
                    return {
                        interactive: {
                            type: "button",
                            header: {
                                type: "text",
                                text: "How can I assist you?"
                            },
                            body: {
                                text: "Here's what I can help you with:"
                            },
                            footer: {
                                text: "Please select an option below."
                            },
                            action: {
                                buttons: [
                                    {
                                        type: "reply",
                                        reply: {
                                            id: "viewBalance",
                                            title: "View Balance"
                                        }
                                    },
                                    {
                                        type: "reply",
                                        reply: {
                                            id: "billPayment",
                                            title: "Bill Payment"
                                        }
                                    },
                                    {
                                        type: "reply",
                                        reply: {
                                            id: "moneyTransfer",
                                            title: "Money Transfer"
                                        }
                                    },
                                    {
                                        type: "reply",
                                        reply: {
                                            id: "findBranch",
                                            title: "Find Branch/ATM"
                                        }
                                    },
                                    {
                                        type: "reply",
                                        reply: {
                                            id: "recentTransactions",
                                            title: "Recent Transactions"
                                        }
                                    }
                                ]
                            }
                        }
                    };
                } else if (intent === 'BALANCE') {
                    this.state = states.BALANCE;
                    return "Fetching your balance...";
                }
                break;

            case states.BALANCE:
                // Logic to fetch and return the balance
                return this.fetchBalance();

            // Handle other states similarly...

            default:
                return {
                    text: "I'm not sure how to help with that. Try asking about your balance or say 'help'."
                };
        }
    }

    async fetchBalance() {
        const options = {
            // Define any additional options you may want to include
        };

        const config = {
            headers: {
                // Include any headers if needed
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
}

module.exports = new StateMachine();
