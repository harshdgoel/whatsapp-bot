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
    // Add more states as necessary
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
                return "Navigating to Bill Payment..."; // Add the actual bill payment logic here

            case states.RECENT_TRANSACTIONS:
                return await this.fetchRecentTransactions(); // Implement this method

            case states.MONEY_TRANSFER:
                return "Navigating to Money Transfer..."; // Add the actual money transfer logic here

            case states.SPENDS:
                return await this.fetchSpends(); // Implement this method

            case states.UPCOMING_PAYMENTS:
                return await this.fetchUpcomingPayments(); // Implement this method

            case states.CREDIT_DUES:
                return await this.fetchCreditDues(); // Implement this method

            case states.OUTSTANDING_LOAN:
                return await this.fetchOutstandingLoan(); // Implement this method

            case states.NEXT_LOAN:
                return await this.fetchNextLoan(); // Implement this method

            case states.LOCATE_ATM:
                return await this.locateATM(); // Implement this method

            case states.LOCATE_BRANCH:
                return await this.locateBranch(); // Implement this method

            case states.FINANCE_INQUIRY:
                return await this.financeInquiry(); // Implement this method

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
            // Handle other initial intents...
            default:
                return "I'm not sure how to help with that. Try asking about your balance or say 'help'.";
        }
    }

    handleHelpState(intent) {
        switch (intent) {
            case 'BALANCE':
                this.state = states.BALANCE;
                return this.fetchBalance();
            case 'BILL_PAYMENT':
                this.state = states.BILL_PAYMENT;
                return "Navigating to Bill Payment...";
            case 'RECENT_TRANSACTIONS':
                this.state = states.RECENT_TRANSACTIONS;
                return "Fetching recent transactions...";
            case 'MONEY_TRANSFER':
                this.state = states.MONEY_TRANSFER;
                return "Navigating to Money Transfer...";
            case 'SPENDS':
                this.state = states.SPENDS;
                return this.fetchSpends();
            case 'UPCOMING_PAYMENTS':
                this.state = states.UPCOMING_PAYMENTS;
                return this.fetchUpcomingPayments();
            case 'CREDIT_DUES':
                this.state = states.CREDIT_DUES;
                return this.fetchCreditDues();
            case 'OUTSTANDING_LOAN':
                this.state = states.OUTSTANDING_LOAN;
                return this.fetchOutstandingLoan();
            case 'NEXT_LOAN':
                this.state = states.NEXT_LOAN;
                return this.fetchNextLoan();
            case 'LOCATE_ATM':
                this.state = states.LOCATE_ATM;
                return this.locateATM();
            case 'LOCATE_BRANCH':
                this.state = states.LOCATE_BRANCH;
                return this.locateBranch();
            case 'FINANCE_INQUIRY':
                this.state = states.FINANCE_INQUIRY;
                return this.financeInquiry();
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

        try {
            const response = await axios.post(`https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages?access_token=${config.whatsappToken}`, helpMessage, {
                headers: { 'Content-Type': 'application/json' }
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

    // Define additional methods for other intents
    async fetchRecentTransactions() {
        // Implement your logic here
    }

    async fetchSpends() {
        // Implement your logic here
    }

    async fetchUpcomingPayments() {
        // Implement your logic here
    }

    async fetchCreditDues() {
        // Implement your logic here
    }

    async fetchOutstandingLoan() {
        // Implement your logic here
    }

    async fetchNextLoan() {
        // Implement your logic here
    }

    async locateATM() {
        // Implement your logic here
    }

    async locateBranch() {
        // Implement your logic here
    }

    async financeInquiry() {
        // Implement your logic here
    }
}

module.exports = StateMachine;
