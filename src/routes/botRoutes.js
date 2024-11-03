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

    // Check if the object key exists in the body
    if (bodyParam.object) {
        const changes = bodyParam.entry[0].changes[0].value;

        // Check for incoming messages
        if (changes.messages && changes.messages.length > 0) {
            const message = changes.messages[0];
            const phoneNumberId = changes.metadata.phone_number_id;
            const from = message.from;

            // Handle the incoming message
            await handleIncomingMessage(phoneNumberId, from, message);
            res.sendStatus(200);
        } 
        // Check for status updates
        else if (changes.statuses && changes.statuses.length > 0) {
            const statusUpdate = changes.statuses[0];
            console.log(`Status update received: ${statusUpdate.status} for message ID: ${statusUpdate.id}`);
            res.sendStatus(200); // Respond with 200 for status updates
        } 
        // Handle other cases or no messages
        else {
            console.log("No messages or statuses found.");
            res.sendStatus(404); // Not found, no messages or statuses to process
        }
    } else {
        res.sendStatus(404); // Not found, invalid object
    }
});

module.exports = router;
