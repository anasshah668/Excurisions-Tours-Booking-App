import { Message } from "../models/MessagesModel.js";
import { Router } from "express";
const router = Router();
router.get("/:roomId", async (req, res) => {
  const { roomId } = req.params;
  try {
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});
router.post("/send", async (req, res) => {
  const { roomId, senderId, senderType, message } = req.body;

  // Extract userId and companyId from roomId
  const [userId, companyId] = roomId.split("_");
  const receiverId = senderType === "user" ? companyId : userId;
  const receiverType = senderType === "user" ? "company" : "user";

  try {
    const newMessage = new Message({
      roomId,
      senderId,
      senderType,
      receiverId,
      receiverType,
      message,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: "Message not sent" });
  }
});
export default router;
