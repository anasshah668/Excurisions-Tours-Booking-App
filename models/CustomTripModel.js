import { Schema, model } from "mongoose";

const customTripSchema = new Schema({
  userId:{type: String, required: true},  
  travelerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  numberOfAdults: { type: Number, required: true },
  numberOfChildren: { type: Number, required: true },
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  pickupLocation: { type: String, required: true },
  accommodationType: { type: String, enum: ['hotel', 'resort', 'camping'], required: true },
  mealPreferences: [{ type: String, enum: ['Vegetarian', 'Non-Vegetarian'] }],
  transportModes: [{ 
    type: String, 
    enum: ['Car', 'Van', 'Jeep', 'Coaster', 'Bus']
  }],
  travelInterests: [{ 
    type: String, 
    enum: ['Nature', 'Adventure', 'Historical Places', 'Photography/Scenic Spots', 'Culture']
  }],
  specificPlacesToVisit: { type: String, required: true },
  otherRequests: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

export default model("CustomTripModel", customTripSchema);
