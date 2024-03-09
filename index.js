const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bodyParser = require("body-parser");
const MYSQLStore = require("express-mysql-session")(session);

const db = require("./db");

app = express();

app.use(cors());
app.use(express.json());

const sessionStore = new MYSQLStore({
  expiration: 1800000,
  createDatabaseTable: true,
  schema: {
    tableName: "sessions",
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, db.promise());

app.use(
  session({
    secret: process.env.SESSIONS_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 60 * 60 * 1000,
    },
  })
);

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

app.get("/getUsers", (req, res) => {
  db.query("SELECT * FROM users", (error, result) => {
    if (error) {
      console.error(error);
    } else {
      res.send(result.data)
    }
  })
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const logSql = "SELECT * FROM users WHERE username = ? AND password = ?";

    const [users] = await db.promise().query(logSql, [username, password]);

    if (users.length > 0) {
      user = users[0];

      const [userProfile] = await db.promise().query('SELECT * FROM user_profile WHERE user_id = ?', [user.id]);

      req.session.user = { ...user, profile: userProfile[0] };
      res.json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login failed: ", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logout successful' });
});

app.get("/checkAuth", (req, res) => {
  const isAuthenticated = req.session.user ? true : false;
  res.json({ isAuthenticated });
})

app.get("/userData", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const userId = req.session.user.id;

    const [userProfile] = await db.promise().query("SELECT * FROM user_profie WHERE user_id =?", [userId]);

    if (userProfile.length > 0) {
      const userData = {
        ...req.session.user, profile: userProfile[0],
      };

      return res.json(userData);
    } else {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }
  } catch (error) {
    console.error("Error fetching user profile data: ", error.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
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
      // res.json({
      //   success: true,
      //   message: "Your blog was published successfully",
      // });
    }
  });
});

app.get('/get-blogs', async (req, res) => {
  db.query('SELECT * FROM blogs', (error, result) => {
    if (error) {
      res.json({ succes: false, message: "Error fetching blogs blogs" });
    } else {
      res.send(result);
    }
  });
} )

app.listen(8000, () => {
  console.log("Server running at http://localhost:8000");
});