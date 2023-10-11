// index.js
const dotenv = require('dotenv');
const DatabaseConnector = require('./databaseConnector');

dotenv.config(); // Load environment variables from .env file

const dbConnection = new DatabaseConnector().getConnection();

// Use dbConnection for database operations
