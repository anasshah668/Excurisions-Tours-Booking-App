import express from "express";
import { protect } from "../shared/common.js";
import Booking from "../models/BookingModel.js";
import Trip from "../models/TripModel.js"
import Notification from "../models/NotificationModel.js";
import User from "../models/userModel.js";
const router = express.Router();
import ExcelJS from "exceljs";
router.post("/BookTrip", protect, async (req, res) => {
  try {
    const { tripId,userId,noOfSeats, ...data } = req.body;

    const trip = await Trip.findById(tripId);
    const user = await User.findById(userId)
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const booking = new Booking({
      ...data,
      tripId,
      tripInfo: trip,
      userId: userId,
      noOfSeats:parseInt(noOfSeats)
    });

    const savedBooking = await booking.save();

    trip.availableSeats =trip.availableSeats - parseInt(noOfSeats);
    await trip.save();
    const notification = new Notification({
      userId: trip.companyId,
      message: `New booking received for: ${trip.tripTitle}`,
      link: `/trip-bookings`, 
      type: "booking",
      senderId: user._id,
      senderName: user.firstname,
    });

    // Save notification
    await notification.save();

    res.status(201).json({
      message: "Booking created successfully",
      bookingId: savedBooking._id,
      data: savedBooking,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// router.post("/BookTrip", protect, async (req, res) => {
//   try {
//     const { tripId, userId, noOfSeats, ...data } = req.body;

//     const trip = await Trip.findById(tripId);
//     const user = await User.findById(userId);

//     if (!trip) {
//       return res.status(404).json({ message: "Trip not found" });
//     }

//     // Check if enough seats are available
//     if (trip.availableSeats < parseInt(noOfSeats)) {
//       return res.status(400).json({ message: "Not enough seats available" });
//     }

//     // Proceed with booking
//     const booking = new Booking({
//       ...data,
//       tripId,
//       tripInfo: trip,
//       userId: userId,
//       noOfSeats,
//     });

//     const savedBooking = await booking.save();

//     // Deduct seats from the trip
//     trip.availableSeats -= parseInt(noOfSeats);
//     await trip.save();

//     // Create a notification
//     const notification = new Notification({
//       userId: trip.companyId,
//       message: `New booking received for: ${trip.tripTitle}`,
//       link: `/trip-bookings`,
//       type: "booking",
//       senderId: user._id,
//       senderName: user.firstname,
//     });

//     await notification.save();

//     res.status(201).json({
//       message: "Booking created successfully",
//       bookingId: savedBooking._id,
//       data: savedBooking,
//     });
//   } catch (error) {
//     console.error("Booking error:", error);
//     res.status(400).json({ message: error.message });
//   }
// });

router.get("/BookTrip/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const bookings = await Booking.find({ userId });
    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }
    const today = new Date();
    const pastBookings = bookings.filter((booking) => {
      const startDate = new Date(booking.tripInfo.startDate);
      return startDate > today;
    });
    if (!pastBookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }
    res.json({ success: true, bookings: pastBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/pastTrips/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const bookings = await Booking.find({ userId });
    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }
    const today = new Date();
    const pastBookings = bookings.filter((booking) => {
      const startDate = new Date(booking.tripInfo.startDate);
      return startDate < today;
    });
    if (!pastBookings.length) {
      return res.status(404).json({ message: "No Past bookings found" });
    }
    res.json({ success: true, bookings: pastBookings });
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
router.get("/bookings/company/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ success: false, message: "Company ID is required" });
    }
    const bookings = await Booking.find({ companyId }).sort({ createdAt: -1 });
    if (!bookings.length) {
      return res.status(404).json({ success: false, message: "No bookings found for this company" });
    }
    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});


router.get("/bookings/download-excel/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ success: false, message: "Company ID is required" });
    }

    const bookings = await Booking.find({ companyId });

    if (!bookings.length) {
      return res.status(404).json({ success: false, message: "No bookings found for this company" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Company Bookings");

    worksheet.columns = [
      // Booking Info
      { header: "Booking ID", key: "bookingid", width: 30 },
      { header: "User ID", key: "userId", width: 25 },
      { header: "No. of Seats", key: "noOfSeats", width: 15 },
      { header: "Total Bill", key: "totalBill", width: 15 },
      { header: "Status", key: "status", width: 10 },

      // Trip Info
      { header: "Trip Title", key: "tripTitle", width: 25 },
      { header: "Destination", key: "destination", width: 20 },
      { header: "Start Date", key: "startDate", width: 15 },
      { header: "End Date", key: "endDate", width: 15 },
      { header: "Price Per Seat", key: "pricePerSeat", width: 15 },

      // Billing Contact (first entry)
      { header: "Billing Address", key: "address", width: 25 },
      { header: "City", key: "city", width: 15 },
      { header: "Province", key: "province", width: 15 },
      { header: "Country", key: "country", width: 15 },
      { header: "Zip Code", key: "zipCode", width: 10 },
      { header: "Contact No.", key: "contactNumber", width: 20 },
      { header: "Emergency Contact", key: "emergencyContactNumber", width: 20 },
      { header: "Billing Email", key: "confirmEmail", width: 25 },

      // First Traveler Info (optional)
      { header: "Traveler Name", key: "travelerName", width: 25 },
      { header: "DOB", key: "dob", width: 15 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Phone", key: "phone", width: 20 },
    ];

    bookings.forEach((booking) => {
      const billing = booking.BillingContact[0] || {};
      const traveler = booking.travelers[0] || {};

      worksheet.addRow({
        bookingid: booking.bookingid.toString(),
        userId: booking.userId,
        noOfSeats: booking.noOfSeats,
        totalBill: booking.totalBill,
        status: booking.status ? "Confirmed" : "Pending",

        tripTitle: booking.tripInfo?.tripTitle || "",
        destination: booking.tripInfo?.destination || "",
        startDate: booking.tripInfo?.startDate || "",
        endDate: booking.tripInfo?.endDate || "",
        pricePerSeat: booking.tripInfo?.pricePerSeat || "",

        address: billing.address || "",
        city: billing.city || "",
        province: billing.province || "",
        country: billing.country || "",
        zipCode: billing.zipCode || "",
        contactNumber: billing.contactNumber || "",
        emergencyContactNumber: billing.emergencyContactNumber || "",
        confirmEmail: billing.confirmEmail || "",

        travelerName: `${traveler.firstName || ""} ${traveler.middleName || ""} ${traveler.lastName || ""}`.trim(),
        dob: traveler.dob || "",
        gender: traveler.gender || "",
        phone: traveler.phone || "",
      });
    });

    // Set headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Company_Bookings_${companyId}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel export error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});


export default router;
