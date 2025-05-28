import User from "../models/userModel.js";
import web_token from "jsonwebtoken";
import nodemailer from "nodemailer";
import { config } from "dotenv";
import PendingCompany from "../models/PendingCompany.js";

const { verify } = web_token;
config();
export const protect = async (req, res, next) => {
  let token;
  // Check if the authorization header is present and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token from the header
      token = req.headers.authorization.split(" ")[1];

      // Verify the token and decode the user ID
      const decoded = verify(token, process.env.JWT_SECRET);
      // Attach the user to the request object (optional, for future use)
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const protectCompany = async (req, res, next) => {
  let token;
  // Check if the authorization header is present and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token from the header
      token = req.headers.authorization.split(" ")[1];

      // Verify the token and decode the user ID
      const decoded = verify(token, process.env.JWT_SECRET);
      // Attach the user to the request object (optional, for future use)
      req.user = await PendingCompany.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
export const generateRefNo = () => {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // Random 6-character string
  const timestampPart = Date.now().toString(36).toUpperCase(); // Current timestamp in base 36
  return `${randomPart}-${timestampPart}`; // Combine for a unique refno
};
// utils/sendEmail.js

export const sendEmail = async (to, subject, resetCode) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eaeaea;">
      <h2 style="color: #4CAF50;">Password Reset Request</h2>
      <p></p>
      <p>You recently requested to reset your password. Use the code below to reset it:</p>
      <h3 style="background: #f4f4f4; padding: 10px; border-radius: 4px; text-align: center;">
        ${resetCode}
      </h3>
      <p>If you didn't request this, you can ignore this email.</p>
      <p style="margin-top: 20px;">Thanks,<br/>Excursions Team</p>
    </div>
  `;

  return transporter.sendMail({
    from: `"Excursions Trips" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlTemplate,
  });
};

export const convertToPaise = (amount, currency) => {
  if (currency.toLowerCase() === "pkr") {
    return amount;
  }
  return amount;
};
export const convertPKRtoUSDCents = (amountInPKR, exchangeRate = 278) => {
  const amountInUSD = amountInPKR / exchangeRate;
  return Math.round(amountInUSD * 100); // Stripe needs cents
};
