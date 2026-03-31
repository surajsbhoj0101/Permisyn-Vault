import nodemailer from "nodemailer";
import "dotenv/config";

type MailDetails = {
  to: string;
  subject: string;
  text: string;
};

export const sendMail = async (mailDetails: MailDetails) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const res = await transporter.sendMail(mailDetails);
    console.log(res);
    return true;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
};
