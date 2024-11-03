const express = require("express");
const bodyParser = require("body-parser");
const botRoutes = require("./routes/botRoutes");
const config = require("./config/config");
const errorHandler = require("./middlewares/errorHandler");

const app = express().use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.use("/api", botRoutes);
app.use(errorHandler); // Error handling middleware

app.listen(PORT, () => {
    console.log(`Webhook is listening on port ${PORT}`);
});
