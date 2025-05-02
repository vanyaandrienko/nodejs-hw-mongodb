import nodemailer from "nodemailer";
import { SMTP } from "../constants/index.js";
import { getEnvVar } from "./getEnvVar.js";

const transporter = nodemailer.createTransport({
  host: getEnvVar(SMTP.SMTP_HOST),
  port: Number(getEnvVar(SMTP.SMTP_PORT)),
  secure: false,
  auth: {
    user: getEnvVar(SMTP.SMTP_USER),
    pass: getEnvVar(SMTP.SMTP_PASSWORD),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async (options) => {
  try {
    const result = await transporter.sendMail(options);
    console.log("✅ Email sent:", result);
    return result;
  } catch (err) {
    console.error("❌ Send error:", err); // <-- ось це побачиш у терміналі
    throw err; // дозволяє контролеру обробити помилку (через createHttpError)
  }
};