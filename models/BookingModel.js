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
    required: true,
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
  BillingContact: [
    {
      address: String,
      country: String,
      province: String,
      city: String,
      contactNumber: String,
      emergencyContactNumber: String,
      zipCode: String,
      confirmEmail: String,
    },
  ],
  travelers: [
    {
      firstName: String,
      middleName: String,
      lastName: String,
      dob: String,
      gender: String,
      phone: String,
    },
  ],
  totalBill: {
    type: String,
    required: true,
  },
  seatPerSeat: {
    type: Number,
    required: true,
  },

  customerAddress: { type: String, required: true },
});

// Sync indexes to ensure no old unique constraints are in place

// Create and export the Trip model
export default model("Booking", bookingschema);
