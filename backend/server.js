import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Koppla till databasen
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "bank",
  port: Number(process.env.DB_PORT || 3306),
});

async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Generera engångslösenord
function generateOTP() {
  // Generera en sexsiffrig numerisk OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

app.post("/users", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const results = await query("INSERT INTO users (username, password) VALUES (?, ?)", [username, password]);

  const userId = results.insertId;

  await query("INSERT INTO accounts (userId, amount) VALUES (?, ?)", [userId, 0]);

  res.status(201).json({
    id: userId,
    username: username,
    password: password,
  });
});

app.post("/sessions", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const results = await query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);

  const user = results[0];

  if (!user) {
    return res.status(401).json({
      message: "Fel användarnamn eller lösenord",
    });
  }

  const token = generateOTP();

  await query("INSERT INTO sessions (userId, token) VALUES (?, ?)", [user.id, token]);

  res.json({ token: token });
});

app.post("/me/accounts", async (req, res) => {
  const token = req.body.token;

  const sessions = await query("SELECT * FROM sessions WHERE token = ?", [token]);

  const session = sessions[0];

  if (!session) {
    return res.status(401).json({
      message: "Ogiltig token",
    });
  }

  const accounts = await query("SELECT * FROM accounts WHERE userId = ?", [session.userId]);

  const account = accounts[0];

  res.json({
    amount: account.amount,
  });
});

app.post("/me/accounts/transactions", async (req, res) => {
  const token = req.body.token;
  const amount = req.body.amount;

  const sessions = await query("SELECT * FROM sessions WHERE token = ?", [token]);

  const session = sessions[0];

  if (!session) {
    return res.status(401).json({
      message: "Ogiltig token",
    });
  }

  await query("UPDATE accounts SET amount = amount + ? WHERE userId = ?", [Number(amount), session.userId]);

  const accounts = await query("SELECT * FROM accounts WHERE userId = ?", [session.userId]);

  const account = accounts[0];

  res.json({
    amount: account.amount,
  });
});

// Starta servern
app.listen(port, () => {
  console.log(`Bankens backend körs på http://localhost:${port}`);
});
