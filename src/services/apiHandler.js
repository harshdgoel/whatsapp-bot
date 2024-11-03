const axios = require("axios");
const config = require("../config/config");

const sendMessageToWhatsApp = async (phoneNumberId, from, message) => {
    try {
        const response = await axios.post(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages?access_token=${config.whatsappToken}`, {
            messaging_product: "whatsapp",
            to: from,
            text: { body: message }
        }, {
            headers: { "Content-Type": "application/json" }
        });

        console.log("Message sent:", response.data);
    } catch (error) {
        console.error("Error sending message:", error.response ? error.response.data : error.message);
    }
};


module.exports = { sendResponseToWhatsApp };
