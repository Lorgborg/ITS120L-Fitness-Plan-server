const express = require("express");
const router = express.Router();

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

module.exports = router;
