const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Set up
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const emailLimiter = rateLimit({
	windowMs: 60 * 30 * 1000, // 30 minutes window
	max: 5, // Limit each IP to 5 requests per windowMs
	message: "Too many emails sent, please try again after 30 minutes",
	standardHeaders: true, 
	legacyHeaders: false, 
});

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

app.post("/", emailLimiter, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const mailOptions = {
      from: email,
      to: process.env.USER,
      subject: `Ди-Мар Ауто - съобщение от ${name}`,
      text: `
        Име: ${name}
        Имейл: ${email}
        Телефон: ${phone}
        Съобщение: ${message}
            `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Sent" });
  } catch (error) {
    console.log(error.message);
  }
});
