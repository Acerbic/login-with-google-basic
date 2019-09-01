"use strict";
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pino = require("pino");
const pinoHttp = require("pino-http");
const routes = require("./routes");

// Create the express app
const app = express();

const logger = pino();
app.use(pinoHttp({ logger }));

app.use(cors());

const apiserver_url =
    process.env.APISERVER_URL || "http://backend.localhost.com:1234";

app.get("/api/google_auth", routes.google_auth);
app.get("/api/validate_auth", routes.validate_auth);
app.get("/api/create_session", routes.create_session);

// Error handlers
app.use(function fourOhFourHandler(req, res) {
    res.status(404).send();
});
app.use(function fiveHundredHandler(err, req, res, next) {
    console.error(err);
    res.status(500).send();
});

// Start server
app.listen(1234, function(err) {
    if (err) {
        return console.error(err);
    }

    console.log(`Started at ${apiserver_url}`);
});
