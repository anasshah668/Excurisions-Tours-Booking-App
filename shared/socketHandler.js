import { Message } from "../models/MessagesModel.js";
function parseRoomId(roomId) {
  const [userId, companyId] = roomId.split("_");
  return { userId, companyId };
}
export default function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("🟢 New client connected");

    socket.on("joinRoom", ({ roomId }) => {
      socket.join(roomId);
      console.log(`Client joined room: ${roomId}`);
    });

    socket.on(
      "sendMessage",
      async ({ roomId, message, senderId, senderType }) => {
        const { userId, companyId } = parseRoomId(roomId);

        const receiverId = senderType === "user" ? companyId : userId;
        const receiverType = senderType === "user" ? "company" : "user";

        const newMessage = new Message({
          roomId,
          message,
          senderId,
          senderType,
          receiverId,
          receiverType,
        });

        await newMessage.save();

        io.to(roomId).emit("receiveMessage", {
          roomId,
          message,
          senderId,
          senderType,
          receiverId,
          receiverType,
          timestamp: newMessage.timestamp,
        });
      }
    );

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected");
    });
  });
}
