const axios = require("axios");
const config = require("../config/config");
require('dotenv').config();

const states = {
    INITIAL: 'INITIAL',
    LOGIN: 'LOGIN',
    OTP_VERIFICATION: 'OTP_VERIFICATION',
    // Other states...
};

class StateMachine {
    constructor() {
        this.state = states.INITIAL;
        this.mobileNumber = '';
        this.interactionId = '';
        this.token = '';
    }

    async handleMessage(from, messageBody, intent) {
        if (this.state === states.LOGIN) {
            return await this.handleLogin(messageBody); // Call handleLogin if in LOGIN state
        }

        const responseMessage = await this.transition(intent);
        await this.sendResponse(from, responseMessage);
    }

    async transition(intent) {
        switch (this.state) {
            case states.INITIAL:
                return this.handleInitialState(intent);
            case states.OTP_VERIFICATION:
                return await this.verifyOTP(intent); // Handle OTP verification
            // Handle other states...
            default:
                return "I'm not sure how to help with that.";
        }
    }

    async handleInitialState(intent) {
        if (['BALANCE', 'RECENT_TRANSACTIONS', 'BILL_PAYMENT', 'MONEY_TRANSFER'].includes(intent)) {
            this.state = states.LOGIN;
            return "Please provide your mobile number to proceed.";
        }
        return "I can help you with balance, transactions, bill payments, and money transfers. Please start by providing your mobile number.";
    }

    async handleLogin(mobileNumber) {
        // Validate mobile number
        if (!/^\d{10}$/.test(mobileNumber)) {
            return "Please enter a valid 10-digit mobile number.";
        }

        this.mobileNumber = mobileNumber; // Store the mobile number
        try {
            const response = await axios.post('http://ofss-mum-3253.snbomprshared1.gbucdsint02bom.oraclevcn.com:8011/digx-infra/login/v1/anonymousToken', {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-authentication-type': 'JWT',
                    'Cookie': 'secretKey=j9r71DRUORO3NX1j0er8egLx0nWAnoke'
                }
            });

            if (response.data.status.result === "SUCCESSFUL") {
                this.interactionId = response.data.interactionId;
                this.token = response.data.token;
                this.state = states.OTP_VERIFICATION; // Transition to OTP verification state
                return "An OTP has been sent to your mobile number. Please enter the OTP to verify.";
            } else {
                return "Failed to initiate login. Please try again.";
            }
        } catch (error) {
            console.error("Login API error:", error.message);
            return "Failed to send OTP. Please try again.";
        }
    }

    async verifyOTP(otp) {
        // Logic for verifying the OTP goes here
        // This is where you would call the second API with the OTP provided
        // For now, just returning a placeholder message
        return "Please enter the verification code (OTP) sent to your mobile number.";
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
