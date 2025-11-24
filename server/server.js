require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;

// ---------------- LOGGING --------------------
function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

// ---------------- CORS -----------------------
app.use(
  cors({
    origin: ["https://dimarauto.com"],
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// OPTIONS preflight
app.options("*", cors());

// ---------------- BODY PARSING ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------- REQUEST LOGGER ---------------
app.use((req, res, next) => {
  log(`Incoming request: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// --------------- RATE LIMITING ----------------
const emailLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 min
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
    log(
      "Rate limit triggered for IP:",
      req.ip,
      "Email:",
      req.body?.email || "none"
    );
    res.status(429).json({
      error: "Too many emails sent, please try again after 30 minutes.",
    });
  },
});

// --------------- VALIDATION -------------------
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

// --------------- SEND EMAIL (RESEND) -------------
async function sendEmail({ name, email, phone, message }) {
  return resend.emails.send({
    from: "no-reply@dimarauto.com",
    to: process.env.USER, // Gmail inbox
    subject: `Ди-Мар Ауто - съобщение от ${name}`,
    text: `
Име: ${name}
Имейл: ${email}
Телефон: ${phone || "няма посочен"}

Съобщение:
${message}
    `,
  });
}

// --------------- MAIN ROUTE --------------------
app.post("/", emailLimiter, validateContact, async (req, res) => {
  try {
    const { name, email } = req.contact;

    log("Sending email from:", email, "IP:", req.ip);

    await sendEmail(req.contact);

    log("Email SENT successfully:", { name, email });

    return res.status(200).json({ message: "Sent" });
  } catch (error) {
    log("Email FAILED:", error);

    return res.status(500).json({
      error: "Възникна проблем при изпращането на съобщението.",
    });
  }
});

// ---------------- START SERVER -----------------
app.listen(PORT, "0.0.0.0", () =>
  log(`Server is listening on port ${PORT}`)
);
