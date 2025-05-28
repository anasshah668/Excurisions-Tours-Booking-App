import express from "express";
import { protect } from "../shared/common.js";
import Booking from "../models/BookingModel.js";
const router = express.Router();
router.post("/BookTrip", protect, async (req, res) => {
  try {
    const { status, ...data } = req.body;
    const booking = new Booking(data);
    const saved = await booking.save();
    res.status(201).json({
      message: "Booking created successfully",
      bookingid: saved._id,
      data: saved,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all bookings
router.get("/BookTrip", protect, async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a booking by ID
router.get("/BookTrip/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/BookTrip/:id/status", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = req.body.status;
    const updated = await booking.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a booking
router.delete("/BookTrip/:id", protect, async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
