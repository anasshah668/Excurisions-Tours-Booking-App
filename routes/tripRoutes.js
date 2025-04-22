import express from "express";
import Trip from "../models/TripModel.js";
import { protect } from "../shared/common.js";
import User from "../models/userModel.js";
const router = express.Router();
import { mongoose } from "mongoose";
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

    // Validate if all required fields are provided
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

    // Create a new trip
    const newTrip = new Trip({
      companyId, // CompanyId is passed directly, no need to look it up
      tripTitle,
      description,
      destination,
      startDate,
      endDate,
      pricePerSeat,
      availableSeats,
      tripImageUrl,
    });

    // Save the new trip in the database
    await newTrip.save();

    // Return success message with the created trip details
    res.status(201).json({
      message: "Trip created successfully",
      trip: {
        companyId: newTrip.companyId,
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
    const { userId } = req.body; // Get the userId from query string
    // Validate if userId is provided
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    // Find the user by _id (MongoDB default primary key)
    const user = await User.findById(userId); // No change here
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Check the userType of the user
    const { userType, id } = user;
    let trips;
    if (userType === "user") {
      // If userType is 0, show all trips
      trips = await Trip.find();
    }
    if (userType === "company") {
      trips = await Trip.find({ companyId: user.id });
    }
    // Return the trips
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
