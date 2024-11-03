const axios = require("axios");

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
                    return "Here's what I can help you with:\n" +
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
                return "I'm not sure how to help with that. Try asking about your balance or say 'help'.";
        }
    }

    async fetchBalance() {
        try {
            const response = await axios.get('http://example.com/api/balance'); // Replace with your actual API endpoint
            const balanceData = response.data; // Process response accordingly
            return `Your balance is $${balanceData.balance}.`; // Modify based on actual response structure
        } catch (error) {
            console.error("Error fetching balance:", error);
            return "There was an error fetching your balance. Please try again later.";
        }
    }
}

module.exports = new StateMachine();
