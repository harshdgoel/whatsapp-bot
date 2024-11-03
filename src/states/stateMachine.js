const axios = require("axios");
const config = require("../config/config");
require('dotenv').config();

const states = {
    INITIAL: 'INITIAL',
    HELP: 'HELP',
    BALANCE: 'BALANCE',
    BILL_PAYMENT: 'BILL_PAYMENT',
    RECENT_TRANSACTIONS: 'RECENT_TRANSACTIONS',
    MONEY_TRANSFER: 'MONEY_TRANSFER',
    SPENDS: 'SPENDS',
    UPCOMING_PAYMENTS: 'UPCOMING_PAYMENTS',
    CREDIT_DUES: 'CREDIT_DUES',
    OUTSTANDING_LOAN: 'OUTSTANDING_LOAN',
    NEXT_LOAN: 'NEXT_LOAN',
    LOCATE_ATM: 'LOCATE_ATM',
    LOCATE_BRANCH: 'LOCATE_BRANCH',
    FINANCE_INQUIRY: 'FINANCE_INQUIRY'
};

class StateMachine {
    constructor() {
        this.state = states.INITIAL;
    }

    async handleMessage(from, messageBody, intent) {
        // Transition the state based on the intent
        const responseMessage = await this.transition(intent);
        
        // Optionally, send the response back to the user
        await this.sendResponse(from, responseMessage);
    }

    async transition(intent) {
        switch (this.state) {
            case states.INITIAL:
                return this.handleInitialState(intent);
            case states.BALANCE:
                return await this.fetchBalance();
            case states.HELP:
                return this.handleHelpState(intent);
            case states.BILL_PAYMENT:
                return "Navigating to Bill Payment...";
            case states.RECENT_TRANSACTIONS:
                return await this.fetchRecentTransactions();
            case states.MONEY_TRANSFER:
                return "Navigating to Money Transfer...";
            case states.SPENDS:
                return await this.fetchSpends();
            case states.UPCOMING_PAYMENTS:
                return await this.fetchUpcomingPayments();
            case states.CREDIT_DUES:
                return await this.fetchCreditDues();
            case states.OUTSTANDING_LOAN:
                return await this.fetchOutstandingLoan();
            case states.NEXT_LOAN:
                return await this.fetchNextLoan();
            case states.LOCATE_ATM:
                return await this.locateATM();
            case states.LOCATE_BRANCH:
                return await this.locateBranch();
            case states.FINANCE_INQUIRY:
                return await this.financeInquiry();
            default:
                return "I'm not sure how to help with that. Try asking about your balance or say 'help'.";
        }
    }

    handleInitialState(intent) {
        switch (intent) {
            case 'HELP':
                this.state = states.HELP;
                return this.sendHelpOptions();
            case 'BALANCE':
                this.state = states.BALANCE;
                return "Fetching your balance...";
            case 'BILL_PAYMENT':
                this.state = states.BILL_PAYMENT;
                return "Navigating to Bill Payment...";
            case 'RECENT_TRANSACTIONS':
                this.state = states.RECENT_TRANSACTIONS;
                return "Fetching recent transactions...";
            case 'MONEY_TRANSFER':
                this.state = states.MONEY_TRANSFER;
                return "Navigating to Money Transfer...";
            default:
                return "I'm not sure how to help with that. Try asking about your balance or say 'help'.";
        }
    }

    handleHelpState(intent) {
        switch (intent) {
            case 'BALANCE':
                this.state = states.BALANCE;
                return await this.fetchBalance();
            case 'BILL_PAYMENT':
                this.state = states.BILL_PAYMENT;
                return "Navigating to Bill Payment...";
            case 'RECENT_TRANSACTIONS':
                this.state = states.RECENT_TRANSACTIONS;
                return await this.fetchRecentTransactions();
            case 'MONEY_TRANSFER':
                this.state = states.MONEY_TRANSFER;
                return "Navigating to Money Transfer...";
            default:
                return "I'm not sure how to help with that. Try asking about your balance or say 'help'.";
        }
    }

    async sendHelpOptions() {
        const helpMessage = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: "+916378582419", // Replace with the actual user ID dynamically
            type: "interactive",
            interactive: {
                type: "button",
                header: {
                    type: "text",
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
                        { type: "reply", reply: { id: "BALANCE", title: "Balance" } },
                        { type: "reply", reply: { id: "BILL_PAYMENT", title: "Pay Bill" } },
                        { type: "reply", reply: { id: "RECENT_TRANSACTIONS", title: "Recent Transactions" } },
                        { type: "reply", reply: { id: "MONEY_TRANSFER", title: "Money Transfer" } },
                        { type: "reply", reply: { id: "SPENDS", title: "Spends" } },
                        { type: "reply", reply: { id: "UPCOMING_PAYMENTS", title: "Upcoming Payments" } },
                        { type: "reply", reply: { id: "CREDIT_DUES", title: "Credit Dues" } },
                        { type: "reply", reply: { id: "OUTSTANDING_LOAN", title: "Outstanding Loan" } },
                        { type: "reply", reply: { id: "NEXT_LOAN", title: "Next Loan" } },
                        { type: "reply", reply: { id: "LOCATE_ATM", title: "Locate ATM" } },
                        { type: "reply", reply: { id: "LOCATE_BRANCH", title: "Locate Branch" } },
                        { type: "reply", reply: { id: "FINANCE_INQUIRY", title: "Finance Inquiry" } }
                    ]
                }
            }
        };

        // Send help message to the user
        await this.sendResponse(helpMessage.to, helpMessage);
    }

    async sendResponse(to, message) {
        const responseMessage = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: to,
            type: "text",
            text: {
                body: message
            }
        };

        try {
            await axios.post(`${config.whatsappApiUrl}/messages`, responseMessage, {
                headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}` }
            });
        } catch (error) {
            console.error("Error sending response:", error);
        }
    }

    // ... [rest of your existing methods like fetchBalance, fetchRecentTransactions, etc.]

}

module.exports = StateMachine;
