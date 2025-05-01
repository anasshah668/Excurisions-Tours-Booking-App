import mongoose, { Schema, model } from "mongoose";

const faqSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

export default model("Faq", faqSchema);
