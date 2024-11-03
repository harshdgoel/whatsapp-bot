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
            // Add more cases for other intents
            default:
                return "I'm not sure how to help with that. Try asking about your balance or say 'help'.";
        }
    }

    handleHelpState(intent) {
        switch (intent) {
            case 'BALANCE':
                this.state = states.BALANCE;
                return this.fetchBalance();
            // Repeat similar handling for other states
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
        }
    }
    async fetchBalance() {
        try {
            const response = await axios.get(`${config.apiUrl}/balance`, {
                headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` }
            });
            return `Your balance is ${response.data.balance}`;
        } catch (error) {
            console.error("Error fetching balance:", error);
            return "Error fetching balance.";
        }
    }

    async fetchRecentTransactions() {
        try {
            const response = await axios.get(`${config.apiUrl}/recent-transactions`, {
                headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` }
            });
            return `Recent transactions: ${JSON.stringify(response.data.transactions)}`;
        } catch (error) {
            console.error("Error fetching recent transactions:", error);
            return "Error fetching recent transactions.";
        }
    }

    async fetchSpends() {
        try {
            const response = await axios.get(`${config.apiUrl}/spends`, {
                headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` }
            });
            return `Total spends: ${response.data.totalSpends}`;
        } catch (error) {
            console.error("Error fetching spends:", error);
            return "Error fetching spends.";
        }
    }

    async fetchUpcomingPayments() {
        try {
            const response = await axios.get(`${config.apiUrl}/upcoming-payments`, {
                headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` }
            });
            return `Upcoming payments: ${JSON.stringify(response.data.payments)}`;
        } catch (error) {
            console.error("Error fetching upcoming payments:", error);
            return "Error fetching upcoming payments.";
        }
    }

    async fetchCreditDues() {
        try {
            const response = await axios.get(`${config.apiUrl}/credit-dues`, {
                headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` }
            });
            return `Credit dues: ${response.data.dues}`;
        } catch (error) {
            console.error("Error fetching credit dues:", error);
            return "Error fetching credit dues.";
        }
    }

    async fetchOutstandingLoan() {
        try {
            const response = await axios.get(`${config.apiUrl}/outstanding-loan`, {
                headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` }
            });
            return `Outstanding loan: ${response.data.amount}`;
        } catch (error) {
            console.error("Error fetching outstanding loan:", error);
            return "Error fetching outstanding loan.";
        }
    }

    async fetchNextLoan() {
        try {
            const response = await axios.get(`${config.apiUrl}/next-loan`, {
                headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` }
            });
            return `Next loan details: ${JSON.stringify(response.data)}`;
        } catch (error) {
            console.error("Error fetching next loan:", error);
            return "Error fetching next loan.";
        }
    }

    async locateATM() {
        try {
            const response = await axios.get(`${config.apiUrl}/locate-atm`, {
                headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` }
            });
            return `Nearest ATM: ${response.data.atmLocation}`;
        } catch (error) {
            console.error("Error locating ATM:", error);
            return "Error locating ATM.";
        }
    }

    async locateBranch() {
        try {
            const response = await axios.get(`${config.apiUrl}/locate-branch`, {
                headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` }
            });
            return `Nearest branch: ${response.data.branchLocation}`;
        } catch (error) {
            console.error("Error locating branch:", error);
            return "Error locating branch.";
        }
    }

    async financeInquiry() {
        try {
            const response = await axios.get(`${config.apiUrl}/finance-inquiry`, {
                headers: { 'Authorization': `Bearer ${process.env.API_TOKEN}` }
            });
            return `Finance inquiry details: ${JSON.stringify(response.data)}`;
        } catch (error) {
            console.error("Error with finance inquiry:", error);
            return "Error with finance inquiry.";
        }
    }
}

module.exports = StateMachine;
