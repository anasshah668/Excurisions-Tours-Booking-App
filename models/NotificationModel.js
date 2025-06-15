import mongoose, { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: { type: String, required: true }, 
    message: { type: String, required: true },
    link: { type: String }, 
    isRead: { type: Boolean, default: false },
    type: { type: String, default: "chat" },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true }, 
    senderName: { type: String },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, senderId: 1, link: 1, type: 1 }, { unique: true });

export default model("Notification", notificationSchema);

