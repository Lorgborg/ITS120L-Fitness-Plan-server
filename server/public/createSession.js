const crypto = require("crypto");

async function createSession(db, email) {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1-hour expiration

    await db.query("INSERT INTO sessions (id, email, expires_at) VALUES (?, ?, ?)", 
                   [sessionId, email, expiresAt]);

    return sessionId;
}


module.exports = createSession;