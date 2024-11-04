const axios = require("axios");
const config = require("../config/config");
require('dotenv').config();

const states = {
    INITIAL: 'INITIAL',
    OTP_VERIFICATION: 'OTP_VERIFICATION',
    LOGGED_IN: 'LOGGED_IN',
    BALANCE: 'BALANCE',
    // Other states...
};

class StateMachine {
    constructor() {
        this.state = states.INITIAL;
        this.mobileNumber = '';
        this.interactionId = '';
        this.registrationId = ''; // Store registrationId
        this.auth = this.createAuthModule(); // Create an instance of the auth module
    }

    // Auth module to manage token securely
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
            const responseMessage = await this.verifyOTP(messageBody, from, intent); // Pass intent to verifyOTP
            await this.sendResponse(from, responseMessage);
            return; // Exit to avoid processing further
        }

        const responseMessage = await this.transition(intent, from);
        await this.sendResponse(from, responseMessage);
    }

    async transition(intent, from) {
        switch (this.state) {
            case states.INITIAL:
                return this.handleInitialState(intent, from);
            // Handle other states...
            default:
                return "I'm not sure how to help with that.";
        }
    }

    async handleInitialState(intent, from) {
        if (['BALANCE', 'RECENT_TRANSACTIONS', 'BILL_PAYMENT', 'MONEY_TRANSFER'].includes(intent)) {
            this.mobileNumber = '916378582419'; // Use the sender's number directly
            this.state = states.OTP_VERIFICATION; // Transition to OTP verification state
            return "An OTP has been sent to your mobile number. Please enter the OTP to verify.";
        }
        return "I can help you with balance, transactions, bill payments, and money transfers. Please enter your request.";
    }

    async verifyOTP(otp, from, intent) {
        try {
            console.log("First API call to get an anonymous token");
            const tokenResponse = await axios.post('https://rnohv-148-87-23-5.a.free.pinggy.link/digx-infra/login/v1/anonymousToken', {}, {
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
                const otpResponse = await axios.post('https://rnohv-148-87-23-5.a.free.pinggy.link/digx-infra/login/v1/login?locale=en', {
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
                    this.registrationId = otpResponse.data.registrationId; // Store registrationId
                    const finalLoginResponse = await axios.post('https://rnohv-148-87-23-5.a.free.pinggy.link/digx-infra/login/v1/login?locale=en', {
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

                    if (finalLoginResponse.data.status.result === "SUCCESSFUL") {
                        console.log("login success");
                        this.auth.setSessionToken(finalLoginResponse.data.token); // Save session token
                        this.state = states.LOGGED_IN; // Transition to logged-in state

                        // Call the method based on the intent after login
                        return await this.handleIntentAfterLogin(from, intent);
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

    async handleIntentAfterLogin(from, intent) {
        console.log("entering handleIntentAfterLogin");
        switch (intent) {
            case 'BALANCE':
                return await this.fetchBalance(from);
            // Handle other intents (e.g., 'RECENT_TRANSACTIONS', 'BILL_PAYMENT', 'MONEY_TRANSFER') here
            default:
                return "You are logged in. What would you like to do next?";
        }
    }

    async fetchBalance(from) {
        console.log("entering fetch balance");
        try {
            const response = await axios.get('https://rnohv-148-87-23-5.a.free.pinggy.link/digx-common/dda/v1/demandDeposit?accountType=CURRENT%2CSAVING&status=ACTIVE&status=DORMANT&status=CLOSED&expand=DEBITCARDS&locale=en', {
                headers: {
                    'Authorization': `Bearer ${this.auth.getSessionToken()}`,
                    'X-Token-Type': 'JWT',
                    'X-Target-Unit': 'OBDX_BU',
                    'Content-Type': 'application/json'
                }
            });

            // Process response to extract balance information
            const balanceInfo = response.data; // Adapt this as needed based on API response structure
            // Return balance info to user
            return `Your balance is: ${balanceInfo.balance}`; // Adapt this to the actual response format
        } catch (error) {
            console.error("Error fetching balance:", error.message, error.stack);
            return "An error occurred while fetching your balance. Please try again.";
        }
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
