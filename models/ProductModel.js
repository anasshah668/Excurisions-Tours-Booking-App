import mongoose, { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    productName: { type: String, required: false },
    productPrice: { type: String, required: false },
    productUrl: { type: String, required: false },
    productId: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Product", productSchema);
