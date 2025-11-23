const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Set up
const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is listening on port ${PORT}`);
});

// Middlewares
app.use(
  cors({
    origin: ["https://dimarauto.com"],
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const emailLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 requests per window per key
  message: {
    error: "Too many emails sent, please try again after 30 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || "";
    const email = (req.body && req.body.email) || "";
    return `${ip}-${email}`;
  },
});

function validateContactPayload(req, res, next) {
  const rawName = req.body?.name ?? "";
  const rawEmail = req.body?.email ?? "";
  const rawPhone = req.body?.phone ?? "";
  const rawMessage = req.body?.message ?? "";

  const name = String(rawName).trim();
  const email = String(rawEmail).trim();
  const phone = String(rawPhone).trim();
  const message = String(rawMessage).trim();

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Име, имейл и съобщение са задължителни полета.",
    });
  }

  if (name.length > 100) {
    return res.status(400).json({ error: "Името е твърде дълго." });
  }

  if (email.length > 320) {
    return res.status(400).json({ error: "Имейлът е твърде дълъг." });
  }

  if (phone.length > 50) {
    return res.status(400).json({ error: "Телефонният номер е твърде дълъг." });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: "Съобщението е твърде дълго." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Невалиден имейл адрес." });
  }

  req.contact = { name, email, phone, message };
  next();
}

// Transporter data
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER,
    pass: process.env.PASSWORD,
  },
});

// Route
app.post("/", emailLimiter, validateContactPayload, async (req, res) => {
  try {
    const { name, email, phone, message } = req.contact;

    const mailOptions = {
      from: email,
      to: process.env.USER,
      subject: `Ди-Мар Ауто - съобщение от ${name}`,
      text: [
        `Име: ${name}`,
        `Имейл: ${email}`,
        `Телефон: ${phone || "няма посочен"}`,
        "",
        "Съобщение:",
        message,
      ].join("\n"),
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res
      .status(500)
      .json({ error: "Възникна проблем при изпращането на съобщението." });
  }
});

