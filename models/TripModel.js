import { Schema, model, mongoose } from "mongoose";

const tripSchema = new Schema({
  tripId: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    unique: true, // Unique tripId remains to ensure each trip has a unique identifier
  },
  companyId: {
    type: String, // Store companyId as a string (or ObjectId)
    required: true, // CompanyId is required but not unique (can have multiple trips from the same company)
  },
  companyName: {
    type: String, // Store companyId as a string (or ObjectId)
    required: false, // CompanyId is required but not unique (can have multiple trips from the same company)
  },
  tripTitle: {
    type: String,
    required: true, // Trip title is required but not unique, allowing duplicates for the same company
  },
  description: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  pricePerSeat: {
    type: Number,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
  tripImageUrl: {
    type: String,
    required: true,
  },
  accommodation: {
    type: String,
    required: false,
  },
  transport: {
    type: String,
    required: false,
  },
  itinerary: {
    type: String,
    required: false,
  },
  features: {
    type: String,
    required: false,
  },
  meals: {
    type: String,
    required: false,
  },
  pickup: {
    type: String,
    required: false,
  },
  dropoff: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Sync indexes to ensure no old unique constraints are in place

// Create and export the Trip model
export default model("Trip", tripSchema);
