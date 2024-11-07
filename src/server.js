const cluster = require("cluster");
const express = require("express");
const bodyParser = require("body-parser");
const os = require("os");
const botRoutes = require("./routes/botRoutes");
const config = require("./config/config");
const errorHandler = require("./middlewares/errorHandler");

const numCPUs = Math.min(os.cpus().length, 2); // Limit the number of workers to 2 (based on 512MB memory limit)

if (cluster.isMaster) {
    console.log(`Master process is running. Spawning ${numCPUs} workers...`);

    // Fork the worker processes
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork(); 
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died, forking a new one...`);
        cluster.fork(); 
    });
} else {
    const app = express();

    app.use(bodyParser.json());

    app.use("/api", botRoutes);

    app.use(errorHandler);

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} is listening on port ${PORT}`);
    });
}
