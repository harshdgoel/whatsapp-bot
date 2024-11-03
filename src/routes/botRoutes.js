const express = require("express");
const router = express.Router();
const { handleIncomingMessage } = require("../controllers/botController");

router.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const token = req.query["hub.verify_token"];
    if (mode && token) {
        if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
            res.status(200).send(challenge);
        } else {
            res.status(403).send("Forbidden");
        }
    }
});

router.post("/webhook", async (req, res) => {
    const bodyParam = req.body;
    console.log("Received webhook body:", JSON.stringify(bodyParam));

    if (bodyParam.object) {
        const message = bodyParam.entry[0].changes[0].value.messages[0];
        const phoneNumberId = bodyParam.entry[0].changes[0].value.metadata.phone_number_id;
        const from = message.from;

        await handleIncomingMessage(phoneNumberId, from, message);

        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

module.exports = router;
