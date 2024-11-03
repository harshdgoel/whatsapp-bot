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
        // Help message with a list of available services
        return "Here's what I can help you with:\n" +
               "1. View account balances\n" +
               "2. Bill Payment\n" +
               "3. Money Transfer\n" +
               "4. Find a bank branch or ATM\n" +
               "5. View recent transactions\n" +
               "6. Inquire your spends\n" +
               "7. Know your upcoming payments\n" +
               "8. Inquire about dues on credit card\n" +
               "9. Inquire about credit card limit\n" +
               "10. Inquire your outstanding balance on loan account\n" +
               "11. Inquire about next installment date and amount\n" +
               "12. Get more information about banking products and services offered by Futura Bank\n" +
               "13. New Account Opening info\n" +
               "\nPlease respond with the number corresponding to the service you need.";
    }

    handleServiceSelection(selection) {
        switch (selection) {
            case '1':
                this.state = states.BALANCE;
                return "Fetching your balance...";
            case '2':
                this.state = states.BILL_PAYMENT;
                return "Redirecting to Bill Payment...";
            case '3':
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
