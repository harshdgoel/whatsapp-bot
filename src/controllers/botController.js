const { sendResponseToWhatsApp } = require("../services/apiHandler");
const stateMachine = require("../states/stateMachine");

const handleIncomingMessage = async (phoneNumberId, from, message) => {
    const responseMessage = stateMachine.handleMessage(from, message);
    await sendResponseToWhatsApp(phoneNumberId, from, responseMessage);
};

module.exports = { handleIncomingMessage };
