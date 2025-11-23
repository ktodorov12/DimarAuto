require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

const app = express();

app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;

// ---------------- CORS --------------------
app.use(
  cors({
    origin: ["https://dimarauto.com"],
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Allow OPTIONS preflight
app.options("*", cors());

// ---------------- LOGGING ---------------
function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

app.use((req, res, next) => {
  log(`Incoming request: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// ---------------- BODY PARSING -----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- RATE LIMIT --------------
const emailLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many emails sent, please try again after 30 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    const email = (req.body?.email || "").toLowerCase();
    return `${ip}-${email}`;
  },

  handler: (req, res, next) => {
    log("Rate limit triggered for IP:", req.ip, "Email:", req.body?.email);
    res.status(429).json({
      error: "Too many emails sent, please try again after 30 minutes.",
    });
  },
});
// --------------- VALIDATION --------------
function validateContact(req, res, next) {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const phone = String(req.body?.phone || "").trim();
  const message = String(req.body?.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Име, имейл и съобщение са задължителни полета.",
    });
  }

  if (message.length > 2000)
    return res.status(400).json({ error: "Съобщението е твърде дълго." });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ error: "Невалиден имейл адрес." });

  req.contact = { name, email, phone, message };
  next();
}

// -------------- NODEMAILER ----------------
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USER,
    pass: process.env.PASSWORD,
  },
  logger: true,   
  debug: true,   
});

// Debug SMTP
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP ERROR:", err);
    process.exit(1); // <-- crash on startup if SMTP broken
  }
  console.log("SMTP OK:", success);
});

// -------------- ROUTE ---------------------
app.post("/", emailLimiter, validateContact, async (req, res) => {
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

    log("Sending email from:", email, "IP:", req.ip);

    await transporter.sendMail(mailOptions);

    log("Email SENT successfully:", { name, email });

    return res.status(200).json({ message: "Sent" });
  } catch (error) {
    console.error("Error sending email:", error);

    if (error.message === "EMAIL_TIMEOUT") {
      return res
        .status(504)
        .json({ error: "Имейлът се забави твърде дълго и беше прекратен." });
    }

    return res
      .status(500)
      .json({ error: "Възникна проблем при изпращането на съобщението." });
  }
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server is listening on port ${PORT}`)
);
