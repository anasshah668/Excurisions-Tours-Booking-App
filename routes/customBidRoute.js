import express from "express";
import Custom from "../models/customTripBidModel.js";
import Notification from "../models/NotificationModel.js";
const router = express.Router();
router.post("/placeBid", async (req, res) => {
  try {
    const {
      userId,
      companyId,
      customTripId,
      amount,
      companyName,
      customTripName,
      startDate,
      endDate,
      companyPhoneNo
    } = req.body;
    if (
      !userId ||
      !companyId ||
      !customTripId ||
      !amount ||
      !companyName ||
      !customTripName||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const existingBid = await Custom.findOne({ companyId, customTripId });
    if (existingBid) {
      return res
        .status(409)
        .json({ message: "You have already placed a bid for this trip." });
    }
    const newBid = new Custom({
      userId,
      companyId,
      customTripId,
      amount,
      companyName,
      customTripName,
      startDate,
      endDate
    });
    await newBid.save();
    const message = `${companyName} has bid $${amount} on your trip "${customTripName} phone ${companyPhoneNo}.`;
    await Notification.findOneAndUpdate(
      {
        userId,
        senderId: companyId,
        link: `/custom-trip/${customTripId}`,
        type: "bid",
      },
      {
        $set: {
          message,
          senderName: companyName,
          isRead: false,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
    res.status(201).json({
      success: true,
      message: "Bid placed and notification sent successfully.",
      data: newBid,
    });
  } catch (error) {
    console.error("Error placing bid or sending notification:", error);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
