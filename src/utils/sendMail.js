import nodemailer from "nodemailer";

import { SMTP } from "../constants/index.js";
import { getEnvVar } from "./getEnvVar.js";
console.log("SMTP PORT:", getEnvVar(SMTP.SMTP_PORT));
console.log("Secure:", false);
const transporter = nodemailer.createTransport({
    host: getEnvVar(SMTP.SMTP_HOST),
    port: Number(getEnvVar(SMTP.SMTP_PORT)),
    secure: false, // ✅ ОБОВ’ЯЗКОВО!
  auth: {
    user: getEnvVar(SMTP.SMTP_USER),
    pass: getEnvVar(SMTP.SMTP_PASSWORD),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendEmail = async (options) => {
    return await transporter.sendMail(options);
};
