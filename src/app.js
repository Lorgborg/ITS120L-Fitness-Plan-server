const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoDBStore = require('connect-mongodb-session')(session);
require("dotenv").config();

const app = express();

const allowedOrigins = ["http://localhost:5173", "https://myfits.vercel.app", "http://localhost:5174"];

const corsOptions = {
    origin: allowedOrigins,
    credentials: true
};

const store = new MongoDBStore({
    uri: process.env.uri,
    collection: 'sessions', // Collection where sessions will be stored
 });

// Middleware
app.use(cookieParser())
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())
app.use(express.json());
app.use((req, res, next) => {
    console.log("Cookies:", req.cookies);
    console.log("Session:", req.session);
    next();
});
app.set("trust proxy", 1);
app.use(session({
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
    store: store,  // Make sure this store works
    cookie: {
        secure: true, // ✅ Required for HTTPS (disable for local testing)
        httpOnly: true,
        sameSite: "none", // ✅ Required for cross-origin cookies
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        domain: "myfit-server.vercel.app"
    }
}));
app.get("/api/debug-session", (req, res) => {
    console.log("Session ID:", req.sessionID);
    console.log("Session Data:", req.session);
    res.json({
        sessionID: req.sessionID,
        sessionData: req.session
    });
});
app.use((req, res, next) => {
    console.log("🔹 Incoming Request:");
    console.log("🔹 Cookies:", req.cookies);
    console.log("🔹 Session ID:", req.sessionID);
    console.log("🔹 Session Data:", req.session);
    
    if (!req.session.user) {
        console.log("⚠️ No session found, sending 401");
        return res.status(401).json({ error: "Unauthorized - No session found" });
    }
    next();
});

// Import API routes
const apiRoutes = require("./api/routes");
app.use("/api", apiRoutes);

// Default route
app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.listen(8080, () => {
    console.log(`Server running on http://localhost:8080`);
})

module.exports = app;
