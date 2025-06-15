import  { Schema, model } from "mongoose";

const customBidSchema = new Schema(
  {
    userId: { type: String, required: true }, 
    companyId: { type: String, required: true },
    customTripId: { type: String, required: true },
    amount: { type: String, required: true },
    companyName: { type: String, required: true },
    customTripName: { type: String, required: true }
  },
  {
    timestamps: true,
  }
);
export default model("CustomBid", customBidSchema);

