import { Schema, model, mongoose } from "mongoose";

const bookingschema = new Schema({
  bookingid: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    unique: true, // bookingId
  },
  tripId: {
    type: String, // Store tripid as a string (or ObjectId)
    required: true, // CompanyId is required but not unique (can have multiple trips from the same company)
  },
  userId: {
    type: String,
    required: true, // Trip title is required but not unique, allowing duplicates for the same company
  },
  companyId: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
  },
  noOfSeats: {
    type: String,
    required: true,
  },
  totalBill: {
    type: String,
    required: true,
  },
  seatPerSeat: {
    type: Number,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerAddress: { type: String, required: true },
});

// Sync indexes to ensure no old unique constraints are in place

// Create and export the Trip model
export default model("Booking", bookingschema);
