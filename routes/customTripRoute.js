
import { Router } from "express";
import CustomTripModel from "../models/CustomTripModel.js";
import { generateCustomTripPDF } from "../shared/common.js";
import PendingCompany from "../models/PendingCompany.js";

const router = Router();
router.post('/saveCustomtripForm', async (req, res) => {
  try {
    const tripData = req.body;
    const newTrip = new CustomTripModel(tripData);
    await newTrip.save();
    res.status(201).json({ success: true, message: 'Custom trip saved successfully', data: newTrip });
  } catch (error) {
    console.error('Error saving custom trip:', error);
    res.status(500).json({ success: false, message: 'Server error. Could not save trip.' });
  }
});
router.post('/pdfCustomReport/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const pdfBuffer = await generateCustomTripPDF(tripId);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=custom_trip_${tripId}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
});

// router.post('/pdfCustomReport/:tripId', async (req, res) => {
//   try {
//     const { tripId } = req.params;
//     console.log(tripId)
//     const pdfBuffer = await generateCustomTripPDF(tripId);
//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename=custom_trip_${tripId}.pdf`,
//       "Content-Length": pdfBuffer.length,
//     });

//     res.send(pdfBuffer);
//   } catch (error) {
//     res.status(500).json({ message: "Error generating PDF", error });
//   }
// });

router.get("/custom-trips/:companyId", async (req, res) => {
  const { companyId } = req.params;
  try {
    const companyExists = await PendingCompany.findById({_id : companyId});
    if (!companyExists) {
      return res.status(404).json({ message: "Company not found" });
    }
    const trips = await CustomTripModel.find();
    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    console.error("Error fetching custom trips:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.get("/getCustomTrips/:tripId", async (req, res) => {
  const { tripId } = req.params;
  try {
    const customTripExist = await CustomTripModel.findById({_id : tripId});
    res.status(200).json({ success: true, data: customTripExist });
  } catch (error) {
    console.error("Error fetching custom trips:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
export default router;
