const express = require("express");
const bodyParser = require("body-parser");
require('dotenv').config(); // Load environment variables from .env
const app = express();
const cors  = require("cors");


const { MongoClient, ServerApiVersion } = require('mongodb');

const getDailyCalorie = require("../public/getDailyCalorie");
const createSession = require("../public/createSession");
const getDocumentsByDay = require("../public/getDocumentsByDay");

const origin = process.env.origin;

 
const corsOptions = {
  origin: origin
}
const openai = new OpenAI({
  apiKey: process.env.openAiKey,
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())
app.use()

app.get("/api", ( req, res) => {
    console.log("I enter this lmao")
    res.json({account: "do this skibidi"});
})


app.listen(8080, () => {
    console.log("started on 8080");
})

module.exports = app;