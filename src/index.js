const express = require("express");
const bodyParser = require("body-parser");
require('dotenv').config(); // Load environment variables from .env
const app = express();
const cors  = require("cors");
const OpenAI = require("openai");
const getDailyCalorie = require("../server/public/getDailyCalorie")
const createSession = require("../server/public/createSession")
const jwtDecode = require("jwt-decode");


const { MongoClient, ServerApiVersion } = require('mongodb');
const getDocumentsByDay = require("../server/public/getDocumentsByDay");
const uri = process.env.uri;
const origin = process.env.origin;

 
const corsOptions = {
  origin: origin
}
const openai = new OpenAI({
  apiKey: process.env.openAiKey,
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToMongoDB() {
    try {
      // Connect to the MongoDB server
      await client.connect();
      console.log('Connected to MongoDB');
  
      // Return the connected client~
      return client;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error; // Re-throw the error to handle it outside the function
    }
  }


app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())

app.get("/api", ( req, res) => {
    console.log("I enter this lmao")
    res.json({account: "do this skibidi"});
})

app.post("/api/signup", async (req, res) => {
  console.log(req.body)
  let connection = await connectToMongoDB();
  const collection = connection.db('MyFit').collection("users");
  const calculation = getDailyCalorie(req.body.weight, req.body.height, req.body.age, req.body.gender, req.body.idealWeight, req.body.time)
  console.log(calculation)
  await collection.insertOne({
    email: req.body.email,
    username: req.body.username,
    weight: req.body.weight,
    height: req.body.height,
    age: req.body.age,
    nationality: req.body.nationality,
    idealWeight: req.body.idealWeight,
    dailyIntake: calculation.dailyCalorieIntake,
    time: req.body.time
  });
  res.status(200).send()
})

app.post("/api/login", async (req, res) => { 
  const decoded = jwtDecode.jwtDecode(req.body.raw);
  let connection = await connectToMongoDB();
  console.log("received mail: " + decoded.email)
  const collection = connection.db('MyFit').collection('users');
  const exists = await collection.findOne({ email: decoded.email })
  if(exists) {
    console.log("found")
    res.status(201).json(({
      status: decoded,
      message: "../dashboard", 
      id: 1,
    }))
  } else if (!exists) {
    console.log("sending back signunp: " + decoded)
    res.status(201).json(({
      status: decoded,
      message: "../signup",
      id: 1,
    }))
  }
})

app.post("/api/getUser", async (req, res) => {
  console.log(req.body)
  let connection = await connectToMongoDB();
  const collection = connection.db('MyFit').collection("users");
  const user = await collection.findOne({email: req.body.email})
  res.status(201).json(user)
})

app.post("/api/getResponse", async (req, res) => {
  const user = req.body.user
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    store: true,
    messages: [
      {"role": "user", "content": `My name is ${user.username}, My weight is currently ${user.weight} kgs. I am ${user.age}, my height is ${user.height} and I would like to achieve a weight of ${user.idealWeight} and I live in ${user.nationality}. I want to have a daily caloric intake of ${user.dailyIntake} calories. Today I have eaten ${req.body.calorieToday}. If what I'm doing is not good for my targetted weight, please advice me otherwise. please advice me but only when I'm asking for fitness-related advice. Keep the answers short, friendly, consice and take into account my nationality.`},
      {"role": "user", "content": `Remember all my personal information when I ask the next prompts. Respond with no formatting, essay format and personal`},
      {"role": "user", "content": `If my daily calorie goal is already met, advice me against going over it. If it isn't met yet, advice me towards it. If asked on diet and excercise, advice with my nationality in mind`},
      {"role": "user", "content": req.body.prompt},
    ],
  });
  // const completion = { choices: [{message: {content: "testing"}}]}
  console.log(completion.choices)
  res.status(201).json(completion.choices[0].message)
})

app.post("/api/addMeal", async (req, res) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    store: true,
    messages: [
      {"role": "user", "content": `calories of the meal I am about to send. Return ONLY A NUMBER. RETURN 0 IF NOT A FOOD`},
      {"role": "user", "content": req.body.prompt},
    ],
  });
  console.log("adding meal: " + completion.choices[0].message)
  res.status(201).json(completion.choices[0].message)
})

app.post("/api/saveMeal", async (req, res) => {
  let connection = await connectToMongoDB()
  const collection = connection.db('MyFit').collection("meals");
  await collection.insertOne({ email: req.body.email, meal: req.body.meal, calories: req.body.calories, date: new Date()})
  console.log({ email: req.body.email, meal: req.body.meal, calories: req.body.calories, date: new Date()})
  res.status(201).json()
})

app.post("/api/getMeals", async (req, res) => {
  let connection = await connectToMongoDB()
  const collection = connection.db('MyFit').collection("meals");
  const meals = await getDocumentsByDay(req.body.date, req.body.email, collection)
  res.status(201).json(meals)
})

app.listen(8080, () => {
    console.log("started on 8080");
})

module.exports = app;