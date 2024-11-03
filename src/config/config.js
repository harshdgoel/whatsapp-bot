require('dotenv').config();

module.exports = {
    verifyToken: process.env.VERIFY_TOKEN,
    whatsappToken: process.env.MYTOKEN,
    phoneNumberId: process.env.PHONE_NUMBER_ID
};
