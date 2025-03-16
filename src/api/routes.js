const express = require("express");
const router = express.Router();
const connectToMongoDB = require("../../public/connectToMongoDB")

// Sample API route
router.get("/", (req, res) => {
    res.json({ message: "Hello from API!" });
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

router.post("/getUser", async (req, res) => {
    console.log(req.body)
    let connection = await connectToMongoDB();
    const collection = connection.db('MyFit').collection("users");
    const user = await collection.findOne({email: req.body.email})
    res.status(201).json(user)
})

module.exports = router;
