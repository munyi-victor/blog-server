const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const db = require("./db");

app = express();

app.use(cors());
app.use(express.json());

app.use(bodyParser.json());

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  const regSql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

  db.query(regSql, [username, email, password], (error, result) => {
    if (result) {
      res.send(result);
    } else if(error){
      res.send({ message: "Enter the correct details" });
    }
  })
})

app.get(`/getUsers/:id`, (req, res) => {
  const userId = req.params.id;

  db.query("SELECT * FROM users WHERE id = ?",  userId, (error, results) => {
    if (error) {
      console.error(error);
    } 

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send("User not found!");
    }
  })
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const logSql = "SELECT * FROM users WHERE username = ? AND password = ?";

    const [users] = await db.promise().query(logSql, [username, password]);

    if (users.length > 0) {
      const loggedInUser = users[0];
      res.json({ loggedInUser: loggedInUser, success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login failed: ", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/logout", (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

// create blog route
app.post("/create-blog", (req, res) => {
  const { title, body } = req.body;

  const blogSql = 'INSERT INTO blogs (title, body) VALUES (?, ?)';

  db.query(blogSql, [title, body], (error, result) => {
    if (error) {
      res.json({ success: false, message: "Couldn't publish your blog" });
    } else {
      res.send(result); 
    }
  });
});

app.get('/get-blogs', async (req, res) => {
  db.query('SELECT * FROM blogs', (error, result) => {
    if (error) {
      res.json({ succes: false, message: "Error fetching blogs" });
    } else {
      res.send(result);
    }
  });
} )

app.listen(8000, () => {
  console.log("Server running at http://localhost:8000");
});