const axios = require("axios");
const config = require("../config/config");
require('dotenv').config();

const states = {
    INITIAL: 'INITIAL',
    OTP_VERIFICATION: 'OTP_VERIFICATION',
    LOGGED_IN: 'LOGGED_IN',
    BALANCE: 'BALANCE',
};

class StateMachine {
    constructor() {
        this.state = states.INITIAL;
        this.mobileNumber = '';
        this.interactionId = '';
        this.registrationId = ''; 
        this.auth = this.createAuthModule();
        this.lastIntent = ''; 
        this.cookies = ''; 
    }

    // Auth module to manage token securely
 createAuthModule() {
    let anonymousToken = '';
    let sessionToken = '';
    let cookies = ''; 
    return {
        setAnonymousToken: (value) => {
            anonymousToken = value;
        },
        setSessionToken: (value) => {
            sessionToken = value;
        },
        setCookies: (value) => {
            cookies = value;
        },
        fetch: async (resource, options = {}) => {
            if (sessionToken) {
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${sessionToken}`,
                };
            }
            if (cookies) {
                options.headers = {
                    ...options.headers,
                    'Cookie': cookies,
                };
            }
            return axios.post(resource, options.data, options);
        },
        getAnonymousToken: () => anonymousToken,
        getSessionToken: () => sessionToken,
        getCookies: () => cookies,
    };
}


    async handleMessage(from, messageBody, intent) {
        this.lastIntent = intent; 

        if (this.state === states.OTP_VERIFICATION) {
            const responseMessage = await this.verifyOTP(messageBody, from, intent);
            await this.sendResponse(from, responseMessage);
            return;
        }

        if (this.state === states.LOGGED_IN) {
            // Handle last intent if already logged in
            const responseMessage = await this.handleIntentAfterLogin(from);
            await this.sendResponse(from, responseMessage);
        } else {
            const responseMessage = await this.transition(intent, from);
            await this.sendResponse(from, responseMessage);
        }
    }

    async transition(intent, from) {
        switch (this.state) {
            case states.INITIAL:
                return this.handleInitialState(intent, from);
            default:
                return "I'm not sure how to help with that.";
        }
    }

    async handleInitialState(intent, from) {
        if (['BALANCE', 'RECENT_TRANSACTIONS', 'BILL_PAYMENT', 'MONEY_TRANSFER'].includes(intent)) {
            this.mobileNumber = '916378582419'; // Use the sender's number directly to be changed
            this.state = states.OTP_VERIFICATION;
            return "An OTP has been sent to your mobile number. Please enter the OTP to verify.";
        }
        return "I can help you with balance, transactions, bill payments, and money transfers. Please enter your request.";
    }

    async verifyOTP(otp, from, intent) {
        try {
            console.log("First API call to get an anonymous token");
            const tokenResponse = await axios.post('https://rneha-148-87-23-5.a.free.pinggy.link/digx-infra/login/v1/anonymousToken', {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-authentication-type': 'JWT'
                }
            });

            if (tokenResponse.data.status.result === "SUCCESSFUL") {
                console.log("First API call to get an anonymous token is success");
                this.interactionId = tokenResponse.data.interactionId;
                this.auth.setAnonymousToken(tokenResponse.data.token); // Set the anonymous token

                const otpResponse = await axios.post('https://rneha-148-87-23-5.a.free.pinggy.link/digx-infra/login/v1/login?locale=en', {
                    mobileNumber: this.mobileNumber
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-authentication-type': 'CHATBOT',
                        'TOKEN_ID': otp,
                        'Authorization': `Bearer ${this.auth.getAnonymousToken()}`,
                        'X-Token-Type': 'JWT',
                        'X-Target-Unit': 'OBDX_BU',
                    }
                });

                if (otpResponse.data.status.result === "SUCCESSFUL") {
                    console.log('FINAL LOGIN SUCS');
                    this.registrationId = otpResponse.data.registrationId; // Store registrationId
                    const finalLoginResponse = await axios.post('https://rneha-148-87-23-5.a.free.pinggy.link/digx-infra/login/v1/login?locale=en', {
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
                        }
                    });
                    console.log('FINAL LOGIN RES:',finalLoginResponse);
                    console.log('FINAL LOGIN COOKIE:',finalLoginResponse.headers['set-cookie']);


                    // Extract cookies from the response headers
                    const setCookie = finalLoginResponse.headers['set-cookie'];
                    if (setCookie) {
                        this.auth.setCookies(setCookie); // Store cookies
                        console.log("set cookie is", this.auth.getCookies());
                    }

                    if (finalLoginResponse.data.status.result === "SUCCESSFUL") {
                        console.log("Login success");
                        this.auth.setSessionToken(finalLoginResponse.data.token); // Save session token
                        this.state = states.BALANCE; // Transition to BALANCE state

                        // Call the intent handler after successful login
                        return await this.handleIntentAfterLogin(from);
                    } else {
                        console.error("Final login failed:", finalLoginResponse.data);
                        return "Final login failed. Please try again.";
                    }
                } else {
                    console.error("OTP verification failed:", otpResponse.data);
                    return "OTP verification failed. Please try again.";
                }
            } else {
                console.error("Failed to initiate login:", tokenResponse.data);
                return "Failed to initiate login. Please try again.";
            }
        } catch (error) {
            console.error("Error during login process:", error.message, error.stack);
            return "An error occurred during verification. Please try again.";
        }
    }

    async handleIntentAfterLogin(from) {
        console.log("Entering handleIntentAfterLogin");

        // Now we transition to the appropriate state based on the lastIntent
        switch (this.lastIntent) {
            case 'BALANCE':
                this.state = states.BALANCE; // Transition to BALANCE state
                return await this.fetchBalance(from);
            // Handle other intents here...
            default:
                return await this.fetchBalance(from); // Provide a prompt for further action
        }
    }

    async fetchBalance(from) {
    console.log("Entering fetchBalance");
    console.log("cookie:", this.auth.getCookies());
    try {
        const response = await axios.get('https://rneha-148-87-23-5.a.free.pinggy.link/digx-common/dda/v1/demandDeposit?accountType=CURRENT%2CSAVING&status=ACTIVE&status=DORMANT&status=CLOSED&expand=DEBITCARDS&locale=en', {
            headers: {
                'Authorization': `Bearer ${this.auth.getSessionToken()}`,
                'X-Token-Type': 'JWT',
                'X-Target-Unit': 'OBDX_BU',
                'Content-Type': 'application/json',
                'Cookie': this.auth.getCookies()
            }
        });

        console.log("balance api success", response.data);

        // Extract the first account
        const firstAccount = response.data.accounts[0];

        if (firstAccount) {
            // Access the account number (displayValue), currency, and balance amount
            const accountNumber = firstAccount.id.displayValue; // Display value of account ID
            const currency = firstAccount.currentBalance.currency; // Currency code from current balance
            const balanceAmount = firstAccount.currentBalance.amount; // Amount from current balance

            // Return the formatted message
            return `Your balance for account number: ${accountNumber} is ${currency} ${balanceAmount}`;
        } else {
            return "No accounts found.";
        }
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
}

module.exports = StateMachine;
