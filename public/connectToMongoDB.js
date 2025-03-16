const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config(); // Load environment variables from .env

const uri = process.env.uri;

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

module.exports = connectToMongoDB;