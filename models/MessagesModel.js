import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderType: { type: String, enum: ["user", "company"], required: true },
  receiverId: { type: String, required: true },
  receiverType: { type: String, enum: ["user", "company"], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const Message = mongoose.model("Message", messageSchema);
