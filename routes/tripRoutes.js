import express from "express";
import Trip from "../models/TripModel.js";
import Company from "../models/CompanyModel.js";
import { protect } from "../shared/common.js";
import User from "../models/userModel.js";
const router = express.Router();
router.post("/create-trip", protect, async (req, res) => {
  // #swagger.tags = ['Trip Routes']
  try {
    const {
      companyId,
      tripTitle,
      description,
      destination,
      startDate,
      endDate,
      pricePerSeat,
      availableSeats,
      tripImageUrl,
    } = req.body;

    if (
      !companyId ||
      !tripTitle ||
      !description ||
      !destination ||
      !startDate ||
      !endDate ||
      !pricePerSeat ||
      !availableSeats ||
      !tripImageUrl
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const company = await Company.findOne({ companyId });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    const companyName = company.companyName;
    const newTrip = new Trip({
      companyId,
      companyName,
      tripTitle,
      description,
      destination,
      startDate,
      endDate,
      pricePerSeat,
      availableSeats,
      tripImageUrl,
    });
    await newTrip.save();
    res.status(201).json({
      message: "Trip created successfully",
      trip: {
        companyId: newTrip.companyId,
        companyName: newTrip.companyName,
        tripTitle: newTrip.tripTitle,
        description: newTrip.description,
        destination: newTrip.destination,
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        pricePerSeat: newTrip.pricePerSeat,
        availableSeats: newTrip.availableSeats,
        tripImageUrl: newTrip.tripImageUrl,
        createdAt: newTrip.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.post("/get-trips", protect, async (req, res) => {
  // #swagger.tags = ['Trip Routes']
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { userType, id } = user;
    let trips;
    if (userType === "user") {
      trips = await Trip.find();
    }
    if (userType === "company") {
      trips = await Trip.find({ companyId: user.id });
    }
    res.status(200).json({
      message: "Trips fetched successfully",
      trips,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.post("/getUnAuthTrips", async (req, res) => {
  // #swagger.tags = ['Trip Routes']
  try {
    const { query } = req.body;

    const filter = query
      ? {
          $or: [
            { tripTitle: { $regex: query, $options: "i" } },
            { destination: { $regex: query, $options: "i" } },
          ],
        }
      : {}; // Empty filter returns all documents

    const trips = await Trip.find(filter);

    res.status(200).json({
      message: "Trips fetched successfully",
      trips,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

export default router;
