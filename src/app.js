const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import API routes
const apiRoutes = require("./api/routes");
app.use("/api", apiRoutes);

// Default route
app.get("/", (req, res) => {
    res.send("Server is running!");
});

module.exports = app;
