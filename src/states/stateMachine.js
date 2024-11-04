const axios = require("axios");
const config = require("../config/config");
require('dotenv').config();

const states = {
    INITIAL: 'INITIAL',
    OTP_VERIFICATION: 'OTP_VERIFICATION',
    LOGGED_IN: 'LOGGED_IN',
    FETCH_BALANCE: 'FETCH_BALANCE',
    // Other states...
};

class StateMachine {
    constructor() {
        this.state = states.INITIAL;
        this.mobileNumber = '';
        this.interactionId = '';
        this.registrationId = ''; // Store registrationId
        this.auth = this.createAuthModule(); // Create an instance of the auth module
        this.intent = ''; // Store the user's intent
    }

    createAuthModule() {
        let anonymousToken = '';
        let sessionToken = '';

        return {
            setAnonymousToken: (value) => {
                anonymousToken = value;
            },
            setSessionToken: (value) => {
                sessionToken = value;
            },
            fetch: async (resource, options = {}) => {
                if (sessionToken) {
                    options.headers = {
                        ...options.headers,
                        'Authorization': `Bearer ${sessionToken}`,
                    };
                }
                return axios.post(resource, options.data, options);
            },
            getAnonymousToken: () => anonymousToken,
            getSessionToken: () => sessionToken,
        };
    }

    async handleMessage(from, messageBody, intent) {
        if (this.state === states.OTP_VERIFICATION) {
            const responseMessage = await this.verifyOTP(messageBody); // Call verifyOTP if in OTP_VERIFICATION state
            console.log("Message to send:", responseMessage); // Log the message to be sent
            await this.sendResponse(from, responseMessage); // Send the response to WhatsApp
            return; // Exit to avoid processing further
        }

        const responseMessage = await this.transition(intent, from);
        await this.sendResponse(from, responseMessage);
    }

    async transition(intent, from) {
        switch (this.state) {
            case states.INITIAL:
                return this.handleInitialState(intent, from);
            case states.LOGGED_IN:
                return this.handlePostLoginIntent(intent, from);
            // Handle other states...
            default:
                return "I'm not sure how to help with that.";
        }
    }

    async handleInitialState(intent, from) {
        if (['BALANCE', 'RECENT_TRANSACTIONS', 'BILL_PAYMENT', 'MONEY_TRANSFER'].includes(intent)) {
            this.mobileNumber = '916378582419'; // Use the sender's number directly
            this.state = states.OTP_VERIFICATION; // Transition to OTP verification state
            this.intent = intent; // Save the user's intent
            return "An OTP has been sent to your mobile number. Please enter the OTP to verify.";
        }
        return "I can help you with balance, transactions, bill payments, and money transfers. Please enter your request.";
    }

    async handlePostLoginIntent(intent, from) {
        switch (intent) {
            case 'BALANCE':
                return await this.fetchBalance(from);
            case 'RECENT_TRANSACTIONS':
                return await this.fetchRecentTransactions(from);
            case 'BILL_PAYMENT':
                return await this.processBillPayment(from);
            case 'MONEY_TRANSFER':
                return await this.processMoneyTransfer(from);
            default:
                return "I'm not sure how to help with that.";
        }
    }

    async verifyOTP(otp) {
        try {
            console.log("First API call to get an anonymous token");
            const tokenResponse = await axios.post('https://rnpfu-148-87-23-5.a.free.pinggy.link/digx-infra/login/v1/anonymousToken', {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-authentication-type': 'JWT'
                }
            });

            if (tokenResponse.data.status.result === "SUCCESSFUL") {
                console.log("First API call to get an anonymous token is success");
                this.interactionId = tokenResponse.data.interactionId;
                this.auth.setAnonymousToken(tokenResponse.data.token); // Set the anonymous token

                // Second API call to verify the OTP
                const otpResponse = await axios.post('https://rnpfu-148-87-23-5.a.free.pinggy.link/digx-infra/login/v1/login?locale=en', {
                    mobileNumber: this.mobileNumber
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-authentication-type': 'CHATBOT',
                        'TOKEN_ID': otp,
                        'Authorization': `Bearer ${this.auth.getAnonymousToken()}`,
                        'X-Token-Type': 'JWT',
                        'X-Target-Unit': 'OBDX_BU',
                        'Cookie': 'secretKey=i0gWjmcjtQlaXniQ7yA3sObMhIY1Z3Ap'
                    }
                });

                if (otpResponse.data.status.result === "SUCCESSFUL") {
                    console.log("Second login call successful");
                    this.registrationId = otpResponse.data.registrationId; // Store registrationId
                    
                    // Final API call to login with registrationId
                    const finalLoginResponse = await axios.post('https://rnpfu-148-87-23-5.a.free.pinggy.link/digx-infra/login/v1/login?locale=en', {
                        mobileNumber: this.mobileNumber,
                        registrationId: this.registrationId // Use the registrationId here
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-authentication-type': 'CHATBOT',
                            'TOKEN_ID': otp,
                            'Authorization': `Bearer ${this.auth.getAnonymousToken()}`,
                            'X-Token-Type': 'JWT',
                            'X-Target-Unit': 'OBDX_BU',
                            'Cookie': 'secretKey=i0gWjmcjtQlaXniQ7yA3sObMhIY1Z3Ap'
                        }
                    });

                    console.log("finalLoginResponse:", finalLoginResponse);
                    if (finalLoginResponse.data.status.result === "SUCCESSFUL") {
                        this.auth.setSessionToken(finalLoginResponse.data.token); // Save session token
                        this.state = states.LOGGED_IN; // Transition to logged-in state
                        console.log("login now success and token saved successfully");
                        // After logging in, call the appropriate function based on the intent
                        return await this.handlePostLoginIntent(this.intent, from);
                    } else {
                        console.error("Final login failed:", finalLoginResponse.data); // Log the failure response
                        return "Final login failed. Please try again.";
                    }
                } else {
                    console.error("OTP verification failed:", otpResponse.data); // Log the OTP failure response
                    return "OTP verification failed. Please try again.";
                }
            } else {
                console.error("Failed to initiate login:", tokenResponse.data); // Log the token initiation failure
                return "Failed to initiate login. Please try again.";
            }
        } catch (error) {
            console.error("Error during login process:", error.message, error.stack); // Enhanced logging
            return "An error occurred during verification. Please try again.";
        }
    }

   async fetchBalance(from) {
    try {
        const url = 'http://rnpfu-148-87-23-5.a.free.pinggy.link/digx-common/dda/v1/demandDeposit?accountType=CURRENT%2CSAVING&status=ACTIVE&status=DORMANT&status=CLOSED&expand=DEBITCARDS&locale=en';

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${this.auth.getSessionToken()}`,
                'X-Token-Type': 'JWT',
                'X-Target-Unit': 'OBDX_BU',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        // Assuming the response contains the balance information in a certain format
        const balanceData = response.data; // Adjust this based on the actual response structure
        console.log("Balance response:", balanceData);

        // Example response message, adjust according to the actual data you receive
        if (balanceData && balanceData.accounts) {
            const balanceMessage = balanceData.accounts.map(account => 
                `Account: ${account.accountNumber}, Balance: ${account.balance}`
            ).join('\n');
            return `Here are your balances:\n${balanceMessage}`;
        } else {
            return "No balance information available.";
        }
    } catch (error) {
        console.error("Error fetching balance:", error.message, error.stack);
        return "An error occurred while fetching your balance. Please try again later.";
    }
}
    async fetchRecentTransactions(from) {
        // Implement the logic to fetch recent transactions here
        return "Your recent transactions: ..."; // Placeholder response
    }

    async processBillPayment(from) {
        // Implement the logic for bill payment here
        return "Bill payment processed successfully."; // Placeholder response
    }

    async processMoneyTransfer(from) {
        // Implement the logic for money transfer here
        return "Money transfer completed successfully."; // Placeholder response
    }

    async sendResponse(to, message) {
        const responseMessage = {
            messaging_product: "whatsapp",
            to: to,
            text: {
                body: message
            }
        };
        const url = `https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages?access_token=${config.whatsappToken}`;
        try {
            const result = await axios.post(url, responseMessage);
            console.log("Response sent successfully:", result.data);
        } catch (error) {
            console.error("Error sending response:", error.response ? error.response.data : error.message);
        }
    }

    // Additional methods for other states...
}

module.exports = StateMachine;
