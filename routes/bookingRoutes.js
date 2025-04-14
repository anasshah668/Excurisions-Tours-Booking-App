import express from "express";
import { protect } from "../shared/common.js";
import Booking from "../models/BookingModel.js";
const router = express.Router();
import { mongoose } from "mongoose";
router.post("/bookTrip", protect, async (req, res) => {
  // #swagger.tags = ['Booking Routes']
  try {
    const { bookingid, tripId, userId, companyId, noOfSeats, seatPerSeat } =
      req.body;

    if (!tripId || !userId || !companyId || !noOfSeats || !seatPerSeat) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const seats = parseInt(noOfSeats);
    const seatPrice = parseFloat(seatPerSeat);
    const totalBill = seats * seatPrice;

    let booking;

    if (!bookingid || bookingid === "0") {
      // 🔹 New Booking
      booking = new Booking({
        tripId,
        userId,
        companyId,
        noOfSeats: seats,
        seatPerSeat: seatPrice,
        totalBill: totalBill.toFixed(2),
        status: true,
      });

      await booking.save();
      res.status(201).json({ message: "New booking created", booking });
    } else {
      // 🔹 Update Booking (only if bookingid + userId match)
      booking = await Booking.findOne({ bookingid, userId });

      if (!booking) {
        return res.status(404).json({
          message: "No booking found with given bookingid and userId",
        });
      }

      booking.tripId = tripId;
      booking.companyId = companyId;
      booking.noOfSeats = seats;
      booking.seatPerSeat = seatPrice;
      booking.totalBill = totalBill.toFixed(2);

      await booking.save();
      res
        .status(200)
        .json({ message: "Booking updated successfully", booking });
    }
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/getBookingsByUser", protect, async (req, res) => {
  // #swagger.tags = ['Booking Routes']
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required." });
    }

    const bookings = await Booking.find({ userId });

    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this user." });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
