const axios = require("axios");
const config = require("../config/config");
require('dotenv').config();

const states = {
    INITIAL: 'INITIAL',
    OTP_VERIFICATION: 'OTP_VERIFICATION',
    LOGGED_IN: 'LOGGED_IN',
    // Other states...
};

class StateMachine {
    constructor() {
        this.state = states.INITIAL;
        this.mobileNumber = '';
        this.interactionId = '';
        this.token = '';
        this.registrationId = ''; // Store registrationId
    }

    async handleMessage(from, messageBody, intent) {
        if (this.state === states.OTP_VERIFICATION) {
            return await this.verifyOTP(messageBody); // Call verifyOTP if in OTP_VERIFICATION state
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
            this.mobileNumber = from; // Use the sender's number directly
            this.state = states.OTP_VERIFICATION; // Transition to OTP verification state
            return "An OTP has been sent to your mobile number. Please enter the OTP to verify.";
        }
        return "I can help you with balance, transactions, bill payments, and money transfers. Please enter your request.";
    }

    async verifyOTP(otp) {
        try {
            console.log("First API call to get an anonymous token")
            const tokenResponse = await axios.post('http://ofss-mum-3253.snbomprshared1.gbucdsint02bom.oraclevcn.com:8011/digx-infra/login/v1/anonymousToken', {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-authentication-type': 'JWT',
                    'Cookie': 'secretKey=j9r71DRUORO3NX1j0er8egLx0nWAnoke'
                }
            });

            if (tokenResponse.data.status.result === "SUCCESSFUL") {
                console.log("First API call to get an anonymous token is success")
                this.interactionId = tokenResponse.data.interactionId;
                this.token = tokenResponse.data.token;
                // Second API call to verify the OTP
                const otpResponse = await axios.post('http://ofss-mum-3253.snbomprshared1.gbucdsint02bom.oraclevcn.com:8011/digx-infra/login/v1/login?locale=en', {
                    mobileNumber: this.mobileNumber,
                    otp: otp // Assuming the OTP is passed as part of the request body
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-authentication-type': 'CHATBOT',
                        'TOKEN_ID': otp,
                        'Authorization': `Bearer ${this.token}`,
                        'X-Token-Type': 'JWT',
                        'X-Target-Unit': 'OBDX_BU',
                        'Cookie': 'secretKey=i0gWjmcjtQlaXniQ7yA3sObMhIY1Z3Ap'
                    }
                });

                if (otpResponse.data.status.result === "SUCCESSFUL") {
                                console.log("Second login call")
                    this.registrationId = otpResponse.data.registrationId; // Store registrationId
                    
                    // Final API call to login with registrationId
                    const finalLoginResponse = await axios.post('http://ofss-mum-3253.snbomprshared1.gbucdsint02bom.oraclevcn.com:8011/digx-infra/login/v1/login?locale=en', {
                        mobileNumber: this.mobileNumber,
                        registrationId: this.registrationId // Use the registrationId here
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'x-authentication-type': 'CHATBOT',
                            'TOKEN_ID': otp,
                            'Authorization': `Bearer ${this.token}`,
                            'X-Token-Type': 'JWT',
                            'X-Target-Unit': 'OBDX_BU',
                            'Cookie': 'secretKey=i0gWjmcjtQlaXniQ7yA3sObMhIY1Z3Ap'
                        }
                    });

                    if (finalLoginResponse.data.status.result === "SUCCESSFUL") {
                        this.state = states.LOGGED_IN; // Transition to logged-in state
                        return "You have successfully verified your OTP and logged in. You can now access your account.";
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
