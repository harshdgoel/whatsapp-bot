const cluster = require("cluster");
const express = require("express");
const bodyParser = require("body-parser");
const os = require("os");
const botRoutes = require("./routes/botRoutes");
const config = require("./config/config");
const errorHandler = require("./middlewares/errorHandler");

const numCPUs = os.cpus().length; // Get the number of CPU cores

if (cluster.isMaster) {
    console.log(`Master process is running. Spawning ${numCPUs} workers...`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork(); // Replace the worker
    });
} else {
    const app = express();

    app.use(bodyParser.json()); // Body parser middleware
    app.use("/api", botRoutes); // Routes for your chatbot API
    app.use(errorHandler); // Error handling middleware

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} is listening on port ${PORT}`);
    });
}
