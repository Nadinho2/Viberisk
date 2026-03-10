import nodemailer from "nodemailer";
import { env } from "./env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.emailUser,
    pass: env.emailPass
  }
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: `"VibeRisk" <${env.emailUser}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  });
};

