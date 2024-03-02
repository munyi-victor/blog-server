const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const db = mysql.createConnection(config);

db.connect((error) => {
  if (error) {
    console.log("Error connecting to database");
  } else {
    console.log("Connected to database successfully");
  }
})

module.exports = db;