const axios = require("axios");
const config = require("../config/config"); // Ensure this file contains your config details

// Define the states
const states = {
    INITIAL: 'INITIAL',
    HELP: 'HELP',
    SELECT_SERVICE: 'SELECT_SERVICE',
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
                    // Display the list of available services
                    return this.getHelpMessage();
                } else if (intent === 'BALANCE') {
                    this.state = states.BALANCE;
                    return "Fetching your balance...";
                }
                break;

            case states.HELP:
                if (intent === 'SELECT_SERVICE') {
                    this.state = states.SELECT_SERVICE;
                    return "Please select one of the services from the list.";
                }
                break;

            case states.BALANCE:
                // Logic to fetch and return the balance
                return this.fetchBalance();

            // Add more cases for other states...

            default:
                return "I'm not sure how to help with that. Try asking about your balance or say 'help'.";
        }
    }

    getHelpMessage() {
        // Help message with a list of available services formatted as button-like options
        return {
            text: "Here's what I can help you with. Please select an option:",
            buttons: [
                { label: "View Account Balances", action: "BALANCE" },
                { label: "Bill Payment", action: "BILL_PAYMENT" },
                { label: "Money Transfer", action: "MONEY_TRANSFER" },
                { label: "Find a Bank Branch or ATM", action: "FIND_BRANCH" },
                { label: "View Recent Transactions", action: "RECENT_TRANSACTIONS" },
                { label: "Inquire Your Spends", action: "INQUIRE_SPENDS" },
                { label: "Know Your Upcoming Payments", action: "UPCOMING_PAYMENTS" },
                { label: "Inquire About Dues on Credit Card", action: "DUES_CREDIT_CARD" },
                { label: "Inquire About Credit Card Limit", action: "CREDIT_CARD_LIMIT" },
                { label: "Outstanding Balance on Loan Account", action: "LOAN_BALANCE" },
                { label: "Next Installment Date and Amount", action: "INSTALLMENT_INFO" },
                { label: "Information About Banking Products", action: "BANK_PRODUCTS" },
                { label: "New Account Opening Info", action: "NEW_ACCOUNT" }
            ]
        };
    }

    handleServiceSelection(selection) {
        switch (selection) {
            case 'BALANCE':
                this.state = states.BALANCE;
                return "Fetching your balance...";
            case 'BILL_PAYMENT':
                this.state = states.BILL_PAYMENT;
                return "Redirecting to Bill Payment...";
            case 'MONEY_TRANSFER':
                this.state = states.MONEY_TRANSFER;
                return "Redirecting to Money Transfer...";
            // Add more cases for each service...
            default:
                return "Invalid selection. Please choose a valid option from the list.";
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
