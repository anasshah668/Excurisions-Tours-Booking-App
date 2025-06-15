import { Schema, model, mongoose } from "mongoose";
const bookingschema = new Schema({
  bookingid: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    unique: true, 
  },
  tripId: {
    type: String,
    required: true,
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
  tripInfo: {
        tripTitle: String,
        destination: String,
        startDate: String,
        endDate: String,
        pricePerSeat: String,
        companyName: String,
        description: String,
        tripImageUrl: String
      },
  totalBill: {
    type: String,
    required: true,
  },
  seatPerSeat: {
    type: Number,
    required: true,
  },
  customerAddress: { type: String, required: true },
},{ timestamps: true });
export default model("Booking", bookingschema);
