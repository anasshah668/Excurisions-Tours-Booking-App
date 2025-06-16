import User from "../models/userModel.js";
import web_token from "jsonwebtoken";
import nodemailer from "nodemailer";
import { config } from "dotenv";
import PendingCompany from "../models/PendingCompany.js";
import CustomTripModel from "../models/CustomTripModel.js";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
// export const generateCustomTripPDF = async (_id) => {
//   const trip = await CustomTripModel.findById(_id).lean();
//   if (!trip) throw new Error('Trip not found');

//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([595, 842]); 
//   const { width, height } = page.getSize();

//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

//   const margin = 50;
//   let y = height - margin;

//   const drawText = (label, value) => {
//     y -= 20;
//     page.drawText(`${label}: ${value}`, {
//       x: margin,
//       y,
//       size: 12,
//       font,
//       color: rgb(0, 0, 0),
//     });
//   };

//   // Draw title
//   page.drawText('Custom Trip Report', {
//     x: margin,
//     y,
//     size: 20,
//     font,
//     color: rgb(0, 0.2, 0.6),
//   });

//   y -= 30;

//   // Draw fields
//   drawText('Traveler Name', trip.travelerName);
//   drawText('Email', trip.email);
//   drawText('Phone', trip.phone);
//   drawText('Destination', trip.destination);
//   drawText('Travel Dates', `${trip.startDate?.toDateString()} to ${trip.endDate?.toDateString()}`);
//   drawText('Pickup Location', trip.pickupLocation);
//   drawText('Accommodation Type', trip.accommodationType);
//   drawText('Meal Preferences', trip.mealPreferences.join(', '));
//   drawText('Transport Modes', trip.transportModes.join(', '));
//   drawText('Travel Interests', trip.travelInterests.join(', '));
//   drawText('Specific Places to Visit', trip.specificPlacesToVisit);
//   drawText('Other Requests', trip.otherRequests);
//   drawText('Submitted At', new Date(trip.submittedAt).toLocaleString());

//   // ✅ Add watermark logo
//   const logoPath = path.join(__dirname, 'logo.png'); // Use transparent PNG
//   const logoImageBytes = fs.readFileSync(logoPath);
//   const logoImage = await pdfDoc.embedPng(logoImageBytes);

//   const logoDims = logoImage.scale(0.5);
//   page.drawImage(logoImage, {
//     x: (width - logoDims.width) / 2,
//     y: (height - logoDims.height) / 2,
//     width: logoDims.width,
//     height: logoDims.height,
//     opacity: 0.1, // watermark effect
//   });

//   const pdfBytes = await pdfDoc.save();

//   // Write to file (optional)
//   const outputPath = path.join(__dirname, `trip-report-${_id}.pdf`);
//   fs.writeFileSync(outputPath, pdfBytes);

//   return outputPath;
// };


// export const generateCustomTripPDF = async (_id) => {
//   const trip = await CustomTripModel.findById(_id).lean();
//   if (!trip) throw new Error('Trip not found');

//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([595, 842]);
//   const { width, height } = page.getSize();
//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

//   const margin = 50;
//   let y = height - margin;

//   const drawText = (label, value) => {
//     y -= 20;
//     page.drawText(`${label}: ${value}`, {
//       x: margin,
//       y,
//       size: 12,
//       font,
//       color: rgb(0, 0, 0),
//     });
//   };

//   page.drawText('Custom Trip Report', {
//     x: margin,
//     y,
//     size: 20,
//     font,
//     color: rgb(0, 0.2, 0.6),
//   });

//   y -= 30;

//   drawText('Traveler Name', trip.travelerName);
//   drawText('Email', trip.email);
//   drawText('Phone', trip.phone);
//   drawText('Destination', trip.destination);
//   drawText('Travel Dates', `${trip.startDate?.toDateString()} to ${trip.endDate?.toDateString()}`);
//   drawText('Pickup Location', trip.pickupLocation);
//   drawText('Accommodation Type', trip.accommodationType);
//   drawText('Meal Preferences', trip.mealPreferences?.join(', '));
//   drawText('Transport Modes', trip.transportModes?.join(', '));
//   drawText('Travel Interests', trip.travelInterests?.join(', '));
//   drawText('Specific Places to Visit', trip.specificPlacesToVisit);
//   drawText('Other Requests', trip.otherRequests);
//   drawText('Submitted At', new Date(trip.submittedAt).toLocaleString());
//   const pdfBytes = await pdfDoc.save();
//   return pdfBytes; // <-- Return bytes instead of saving to file
// };


export const generateCustomTripPDF = async (_id) => {
  const trip = await CustomTripModel.findById(_id).lean();
  if (!trip) throw new Error('Trip not found');

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size in points
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const margin = 50;
  let y = height - margin;

  const drawText = (label, value) => {
    y -= 20;
    page.drawText(`${label}: ${value || 'N/A'}`, {
      x: margin,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  };

  page.drawText('Custom Trip Report', {
    x: margin,
    y,
    size: 20,
    font,
    color: rgb(0, 0.2, 0.6),
  });

  y -= 30;

  drawText('Traveler Name', trip.travelerName);
  drawText('Email', trip.email);
  drawText('Phone', trip.phone);
  drawText('Destination', trip.destination);
  drawText('Travel Dates', `${new Date(trip.startDate).toDateString()} to ${new Date(trip.endDate).toDateString()}`);
  drawText('Pickup Location', trip.pickupLocation);
  drawText('Accommodation Type', trip.accommodationType);
  drawText('Meal Preferences', trip.mealPreferences?.join(', '));
  drawText('Transport Modes', trip.transportModes?.join(', '));
  drawText('Travel Interests', trip.travelInterests?.join(', '));
  drawText('Specific Places to Visit', trip.specificPlacesToVisit);
  drawText('Other Requests', trip.otherRequests);
  drawText('Submitted At', new Date(trip.submittedAt).toLocaleString());

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
