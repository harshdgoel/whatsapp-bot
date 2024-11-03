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

            case states.HELP:
                if (intent === 'BALANCE') {
                    this.state = states.BALANCE;
                    return await this.fetchBalance();
                } else if (intent === 'BILL_PAYMENT') {
                    this.state = states.BILL_PAYMENT;
                    return "Navigating to Bill Payment...";
                }
                // Handle other button responses...
                break;

            // Handle other states similarly...

            default:
                return "I'm not sure how to help with that. Try asking about your balance or say 'help'.";
        }
    }

    async sendHelpOptions() {
        const helpMessage = {
            messaging_product: "whatsapp",
            recipient_type: "individual", // Specify recipient type
            to: "+916378582419", // Replace with the actual user ID dynamically
            type: "interactive",
            interactive: {
                type: "button",
                header: {
                    type: "text", // Changed from "image" to "text" for the header
                    text: "How can I assist you today?"
                },
                body: {
                    text: "Here's what I can help you with:\n" +
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
                           "- New Account Opening info"
                },
                action: {
                    buttons: [
                        {
                            type: "reply",
                            reply: {
                                id: "BALANCE",
                                title: "Balance"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "BILL_PAYMENT",
                                title: "Pay Bill"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "RECENT_TRANSACTIONS",
                                title: "Recent Transactions"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "MONEY_TRANSFER",
                                title: "Money Transfer"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "SPENDS",
                                title: "Spends"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "UPCOMING_PAYMENTS",
                                title: "Upcoming Payments"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "CREDIT_DUES",
                                title: "Credit Card Dues"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "OUTSTANDING_LOAN",
                                title: "Outstanding Loan"
                            }
                        }, 
                        {
                            type: "reply",
                            reply: {
                                id: "NEXT_LOAN",
                                title: "Next Loan"
                            }
                        },
                        {
                            type: "reply",
                            reply: {
                                id: "LOCATE_ATM",
                                title: "Locate ATM"
                            }
                        },
                         {
                            type: "reply",
                            reply: {
                                id: "LOCATE_BRANCH",
                                title: "Locate Branch"
                            }
                        },
                           {
                            type: "reply",
                            reply: {
                                id: "FINANCE_INQUIRY",
                                title: "Finance Inquiry"
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
