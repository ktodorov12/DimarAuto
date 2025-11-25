const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const { google } = require("googleapis");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

// ---------- Logging ----------
function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

// ---------- UTF-8 Email Header Encoder ----------
function encodeHeader(str) {
  return `=?UTF-8?B?${Buffer.from(str, "utf8").toString("base64")}?=`;
}

// ---------- Gmail OAuth2 setup ----------
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

// ---------- RFC822 Email Builder ----------
function buildRawMessage({ from, to, replyTo, subject, text }) {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    replyTo ? `Reply-To: ${replyTo}` : "",
    `Subject: ${encodeHeader(subject)}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    text,
  ]
    .filter(Boolean)
    .join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sendGmail({ name, email, phone, message }) {
  const fromAddress = `${encodeHeader("Ди-Мар Ауто Сайт")} <${process.env.GMAIL_USER}>`;
  const toAddress = process.env.GMAIL_USER;
  const subject = `Ди-Мар Ауто - съобщение от ${name}`;

  const text = [
    `Име: ${name}`,
    `Имейл: ${email}`,
    `Телефон: ${phone || "няма посочен"}`,
    "",
    "Съобщение:",
    message,
  ].join("\n");

  const raw = buildRawMessage({
    from: fromAddress,
    to: toAddress,
    replyTo: email,
    subject,
    text,
  });

  return gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}

// ---------- CORS ----------
app.use(
  cors({
    origin: ["https://dimarauto.com"],
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.options("*", cors());

// ---------- Body parsing ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Request logger ----------
app.use((req, res, next) => {
  log(`Incoming request: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// ---------- Rate limiting ----------
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
    const email = (req.body?.email || "").trim().toLowerCase();
    return `${ip}-${email}`;
  },
  handler: (req, res) => {
    log("Rate limit triggered for IP:", req.ip, "Email:", req.body?.email || "none");
    res.status(429).json({
      error: "Too many emails sent, please try again after 30 minutes.",
    });
  },
});

// ---------- Validation ----------
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

// ---------- Route ----------
app.post("/", emailLimiter, validateContact, async (req, res) => {
  try {
    const { name, email } = req.contact;
    log("Sending Gmail from:", email, "IP:", req.ip);

    await sendGmail(req.contact);

    log("Gmail SENT successfully:", { name, email });
    return res.status(200).json({ message: "Sent" });
  } catch (error) {
    console.error("Gmail send FAILED:", error);
    return res.status(500).json({
      error: "Възникна проблем при изпращането на съобщението.",
    });
  }
});

// ---------- Start ----------
app.listen(PORT, "0.0.0.0", () => {
  log(`Server is listening on port ${PORT}`);
});
