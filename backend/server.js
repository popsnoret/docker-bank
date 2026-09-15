import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Generera engångslösenord
function generateOTP() {
  // Generera en sexsiffrig numerisk OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

const db = new Database("bank.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    amount REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    token TEXT NOT NULL
  );
`);

app.post("/users", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const results = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(username, password);

  const userId = results.lastInsertRowid;

  db.prepare("INSERT INTO accounts (userId, amount) VALUES (?, ?)").run(userId, 0);

  res.status(201).json({
    id: userId,
    username: username,
    password: password,
  });
});

app.post("/sessions", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);

  if (!user) {
    return res.status(401).json({
      message: "Fel användarnamn eller lösenord",
    });
  }

  const token = generateOTP();

  db.prepare("INSERT INTO sessions (userId, token) VALUES (?, ?)").run(user.id, token);

  res.json({ token: token });
});

app.post("/me/accounts", (req, res) => {
  const token = req.body.token;

  const session = db.prepare("SELECT * FROM sessions WHERE token = ?").get(token);

  if (!session) {
    return res.status(401).json({
      message: "Ogiltig token",
    });
  }

  const account = db.prepare("SELECT * FROM accounts WHERE userId = ?").get(session.userId);

  res.json({
    amount: account.amount,
  });
});

app.post("/me/accounts/transactions", (req, res) => {
  const token = req.body.token;
  const amount = req.body.amount;

  const session = db.prepare("SELECT * FROM sessions WHERE token = ?").get(token);

  if (!session) {
    return res.status(401).json({
      message: "Ogiltig token",
    });
  }

  db.prepare("UPDATE accounts SET amount = amount + ? WHERE userId = ?").run(Number(amount), session.userId);

  const account = db.prepare("SELECT * FROM accounts WHERE userId = ?").get(session.userId);

  res.json({
    amount: account.amount,
  });
});

// Starta servern
app.listen(port, () => {
  console.log(`Bankens backend körs på http://localhost:${port}`);
});
