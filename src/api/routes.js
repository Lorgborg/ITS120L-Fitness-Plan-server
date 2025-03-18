// import libraries
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const jwtDecode = require("jwt-decode");
require('dotenv').config();

// import utility files from public
const connectToMongoDB = require("../../public/connectToMongoDB")
const getDailyCalorie = require("../../public/getDailyCalorie");
const createSession = require("../../public/createSession");
const getDocumentsByDay = require("../../public/getDocumentsByDay");
const getNationDate = require("../../public/getNationDate");
const getPHTDateString = require("../../public/getPHTDateString")


const openai = new OpenAI({
    apiKey: process.env.openAiKey,
});

// Sample API route
router.get("/", (req, res) => {
    res.json({ message: "Hello from API!" });
});

router.post("/getUser", async (req, res) => {
    console.log(req.body)
    let connection = await connectToMongoDB();
    const collection = connection.db('MyFit').collection("users");
    const user = await collection.findOne({email: req.body.email})
    res.status(201).json(user)
})

router.post("/signup", async (req, res) => { 
    console.log(req.body)
    let connection = await connectToMongoDB();
    const collection = connection.db('MyFit').collection("users");
    if(!await collection.findOne({email: req.body.email})) res.json({message: "account already registered"})
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
        sex: req.body.sex,
        time: req.body.time
    });
    res.status(200).send() 
})
  
router.post("/login", async (req, res) => { 
    console.log(req.body.raw) 
    const decoded = jwtDecode.jwtDecode(req.body.raw);
    let connection = await connectToMongoDB();
    console.log("received mail: " + decoded.email)
    const collection = connection.db('MyFit').collection('users');
    const user = await collection.findOne({ email: decoded.email })
    if(user) { 
        console.log("found")
        req.session.userId = user._id;
        const sessions = connection.db('MyFit').collection('sessions')
        req.session.user = { email: user.email }
        res.status(201).json(({
            status: decoded,
            message: "../dashboard", 
            id: 1,
            user: req.session.user
        }))
    } else if (!user) {
        console.log("sending back signunp: " + decoded)
        res.status(201).json(({
        status: decoded,
        message: "../signup",
        id: 1,
        }))
    }
    
})

router.post('/profile', async (req, res) => {
    if (!req.session.user) {
        // return res.status(401).json({ message: 'Not logged in' });
        const connection = await connectToMongoDB()
        const collection = connection.db('MyFit').collection("users");
        const user = await collection.findOne({email: req.body.email})
        res.status(201).json({ message: 'Profile data', user: user });
    }
 
    res.status(201).json({ message: 'Profile data', user: req.session.user });
 });

 // **Logout Route**
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
       if (err) return res.status(500).json({ message: 'Logout failed' });
 
       res.clearCookie('connect.sid'); // Clear session cookie
       res.status(201).json({ message: 'Logged out successfully' });
    });
});

router.post("/getResponse", async (req, res) => {
    const user = req.body.user
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        store: true,
        messages: [
        {"role": "user", "content": `My name is ${user.username}, My weight is currently ${user.weight} kgs. I am ${user.age}, my height is ${user.height} and I would like to achieve a weight of ${user.idealWeight} and I live in ${user.nationality}. I want to have a daily caloric intake of ${user.dailyIntake} calories. Today I have eaten ${req.body.calorieToday}. If what I'm doing is not good for my targetted weight, please advice me otherwise. please advice me but only when I'm asking for fitness-related advice. Keep the answers short, friendly, consice and take into account my nationality.`},
        {"role": "user", "content": `Remember all my personal information when I ask the next prompts. Respond with no formatting, essay format and personal`},
        {"role": "user", "content": `If my daily calorie goal is already met, advice me against going over it. If it isn't met yet, advice me towards it. If asked on diet and excercise, advice with my nationality in mind. If asking specifically how to add or register meals, say to look at the upper right`},
        {"role": "user", "content": req.body.prompt},
        ],
    });
    // const completion = { choices: [{message: {content: "testing"}}]}
    console.log(completion.choices)
    res.status(201).json(completion.choices[0].message)
})
  
router.post("/addMeal", async (req, res) => {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        store: true,
        messages: [
        {"role": "user", "content": `calories of the meal I am about to send. Return ONLY A NUMBER. RETURN 0 IF NOT A FOOD, be accurate as possible`},
        {"role": "user", "content": req.body.prompt},
        ],
    });
    console.log("adding meal: " + completion.choices[0].message)
    res.status(201).json(completion.choices[0].message)
})
  
router.post("/saveMeal", async (req, res) => {
    let connection = await connectToMongoDB()
    const collection = connection.db('MyFit').collection("meals");
    await collection.insertOne({ email: req.body.email, meal: req.body.meal, calories: req.body.calories, date: getNationDate()})
    console.log({ email: req.body.email, meal: req.body.meal, calories: req.body.calories, date: getNationDate()})
    res.status(201).json()
})
  
router.post("/getDate", async (req, res) => {
    res.status(201).json(getNationDate())
})

router.post("/getMeals", async (req, res) => {
    let connection = await connectToMongoDB()
    const collection = connection.db('MyFit').collection("meals");
    const meals = await getDocumentsByDay(req.body.date, req.body.email, collection)
    res.status(201).json(meals)
})

router.post("/getWeekMeals", async (req, res) => {
    console.log(req.body)
    let connection = await connectToMongoDB()
    const collection = connection.db('MyFit').collection("meals");

    // Get date 7 days ago
    const sevenDaysAgo = getNationDate();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const meals = await collection.find(
        { email: req.body.email, date: { $gte: sevenDaysAgo } }
     ).toArray();

    const today = new Date();
    const past7Days = {};

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateString = getPHTDateString(date);
        past7Days[dateString] = 0;
    }
    
    // Sum up calories for each day, considering PHT timezone
    meals.forEach(({ calories, date }) => {
        const dateObj = new Date(date);
        const dateString = getPHTDateString(dateObj);
        
        if (past7Days.hasOwnProperty(dateString)) {
            past7Days[dateString] += parseInt(calories, 10);
        }
    });
    
    res.json(past7Days);

    ;
})

module.exports = router;
