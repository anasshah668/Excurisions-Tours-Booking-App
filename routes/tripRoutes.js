import express from "express";
import Trip from "../models/TripModel.js";
import Company from "../models/CompanyModel.js";
import { protect, protectCompany } from "../shared/common.js";
import User from "../models/userModel.js";
import PendingCompany from "../models/PendingCompany.js";
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
      accommodation,
      transport,
      itinerary,
      features,
      meals,
      pickup,
      dropoff,
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
    const company = await PendingCompany.findOne({ _id: companyId });
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
      accommodation,
      transport,
      itinerary,
      features,
      meals,
      pickup,
      dropoff,
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
        accommodation: newTrip.accommodation,
        transport: newTrip.transport,
        itinerary: newTrip.itinerary,
        features: newTrip.features,
        meals: newTrip.meals,
        pickup: newTrip.pickup,
        dropoff: newTrip.dropoff,
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
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const allTrips = await Trip.find();

    // Filter trips whose startDate string is in the future
    const upcomingTrips = allTrips.filter(trip => {
      const tripDate = new Date(trip.startDate);
      return tripDate >= today;
    });

    // Optional: sort by startDate ascending
    upcomingTrips.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    res.status(200).json({
      success: true,
      trips: upcomingTrips,
    });
  } catch (error) {
    console.error("Error fetching upcoming trips:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/RecentPostedTrips", async (req, res) => {
  const { companyId, count } = req.body;
  try {
    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }
    const trips = await Trip.find({ companyId: companyId })
      .sort({ createdAt: -1 })
      .limit(count);

    res.status(200).json({
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/calendar/:companyId", protectCompany, async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res
        .status(400)
        .json({ success: false, message: "Company ID is required" });
    }

    const trips = await Trip.find({ companyId });

    const formattedTrips = trips.map((trip) => ({
      title: trip.tripTitle,
      start: new Date(trip.startDate),
      end: new Date(trip.endDate),
    }));
    return res.status(200).json({ success: true, data: formattedTrips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
});
router.get("/tripById/:tripId", protectCompany, async (req, res) => {
  try {
    const { tripId } = req.params;
    if (!tripId) {
      return res
        .status(400)
        .json({ success: false, message: "trip ID is required" });
    }
    const trips = await Trip.find({ _id: tripId });
    return res.status(200).json({ success: true, data: trips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
});
router.get("/monthly-count", protectCompany, async (req, res) => {
  try {
    const monthlyData = await Trip.aggregate([
      {
        $addFields: {
          parsedDate: {
            $dateFromString: {
              dateString: "$startDate",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $match: {
          parsedDate: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$parsedDate" },
            month: { $month: "$parsedDate" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          count: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    res.status(200).json({monthlyData:monthlyData,status:200});
  } catch (error) {
    console.error("Failed to fetch monthly trip count:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// router.get("/topDealsTrips", async (req, res) => {
//   try {
//     let { minPrice, maxPrice, sort, query } = req.query;

//     // Parse query values safely
//     minPrice = minPrice !== undefined && minPrice !== "null" ? Number(minPrice) : null;
//     maxPrice = maxPrice !== undefined && maxPrice !== "null" ? Number(maxPrice) : null;

//     const filter = {};

//     // Handle price filter
//     if (minPrice !== null && maxPrice !== null && minPrice === maxPrice) {
//       // Exact price match
//       filter.pricePerSeat = minPrice;
//     } else if (minPrice !== null || maxPrice !== null) {
//       filter.pricePerSeat = {};
//       if (minPrice !== null) filter.pricePerSeat.$gte = minPrice;
//       if (maxPrice !== null) filter.pricePerSeat.$lte = maxPrice;
//     }

//     // Handle search
//     if (query && query.trim() !== "") {
//       filter.tripTitle = { $regex: query, $options: "i" };
//     }

//     // Handle sorting
//     let sortOption = {};
//     switch (sort) {
//       case "price-low":
//         sortOption.pricePerSeat = 1; // ascending (min to max)
//         break;
//       case "price-high":
//         sortOption.pricePerSeat = -1; // descending
//         break;
//       case "featured":
//       default:
//         sortOption.createdAt = -1;
//         break;
//     }

//     const trips = await Trip.find(filter).sort(sortOption);

//     res.status(200).json({ success: true, trips });
//   } catch (error) {
//     console.error("Error fetching trips:", error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// });

router.get("/topDealsTrips", async (req, res) => {
  try {
    let { minPrice, maxPrice, sort, query } = req.query;

    // Safely parse query values
    minPrice = minPrice !== undefined && minPrice !== "null" ? Number(minPrice) : null;
    maxPrice = maxPrice !== undefined && maxPrice !== "null" ? Number(maxPrice) : null;

    const filter = {};

    // Price filtering
    if (minPrice !== null && maxPrice !== null && minPrice === maxPrice) {
      filter.pricePerSeat = minPrice;
    } else if (minPrice !== null || maxPrice !== null) {
      filter.pricePerSeat = {};
      if (minPrice !== null) filter.pricePerSeat.$gte = minPrice;
      if (maxPrice !== null) filter.pricePerSeat.$lte = maxPrice;
    }

    // Search query filtering
    if (query && query.trim() !== "") {
      filter.tripTitle = { $regex: query, $options: "i" };
    }

    // Base query
    let trips = await Trip.find(filter);

    // Filter out past trips
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    trips = trips.filter(trip => {
      const tripDate = new Date(trip.startDate);
      return tripDate >= today;
    });

    // Sorting logic
    switch (sort) {
      case "price-low":
        trips.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
        break;
      case "price-high":
        trips.sort((a, b) => b.pricePerSeat - a.pricePerSeat);
        break;
      case "featured":
      default:
        trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    res.status(200).json({ success: true, trips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export default router;
