const pgp = require('pg-promise')();

class DatabaseConnector {
  constructor() {
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT;
    const database = process.env.DB_DATABASE;
    const user = process.env.DB_USERNAME;
    const password = process.env.DB_PASSWORD;

    const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;

    this.dbConnection = pgp(connectionString);
  }

  getConnection() {
    return this.dbConnection;
  }
}

module.exports = DatabaseConnector;
