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
                    return "🤖 *Here's what I can help you with:* 1️⃣ *View Account Balances* | 2️⃣ *Bill Payment* | 3️⃣ *Money Transfer* | 4️⃣ *Find a Bank Branch or ATM* | 5️⃣ *View Recent Transactions* | 6️⃣ *Inquire Your Spends* | 7️⃣ *Know Your Upcoming Payments* | 8️⃣ *Inquire About Dues on Credit Card* | 9️⃣ *Inquire About Credit Card Limit* | 🔟 *Inquire Your Outstanding Balance on Loan Account* | 1️⃣1️⃣ *Inquire About Next Installment Date and Amount* | 1️⃣2️⃣ *Get More Information About Banking Products and Services* | 1️⃣3️⃣ *New Account Opening Info* | Please type the number or name of the service you're interested in!";
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
