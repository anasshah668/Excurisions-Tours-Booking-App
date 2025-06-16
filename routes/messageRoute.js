import { Message } from "../models/MessagesModel.js";
import User from "../models/userModel.js"
import  PendingCompany  from "../models/PendingCompany.js";
import { Router } from "express";
import  Notification  from "../models/NotificationModel.js"
import Notes from "../models/NotesModel.js"; 
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

  // Extract userId and companyId from roomId format like userId_companyId
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

    let senderInfo;
    if (senderType === "user") {
      senderInfo = await User.findById(senderId).select("firstname lastname");
    } else {
      senderInfo = await PendingCompany.findById(senderId).select("companyName");
    }

    const senderName =
      senderType === "user"
        ? `${senderInfo?.firstname || "Unknown"} ${senderInfo?.lastname || ""}`
        : senderInfo?.companyName || "Unknown Company";

    // 3. Upsert (update or insert) the notification
    await Notification.findOneAndUpdate(
      {
        userId: receiverId,
        senderId: senderId,
        link: `/messages/${roomId}`,
        type: "chat",
      },
      {
        message: `New message from ${senderName}`,
        senderName,
        isRead: false,
        $currentDate: { updatedAt: true } // update the timestamp
      },
      {
        upsert: true,                // insert if doesn't exist
        new: true,                   // return the updated doc
        setDefaultsOnInsert: true   // apply schema defaults if inserting
      }
    );

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Send message failed:", err);
    res.status(500).json({ error: "Message not sent" });
  }
});
router.get("/getNotification/:userId", async (req, res) => {
  const { userId } = req.params;
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 20;
  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ userId });
    res.json({ notifications, total });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});
router.get("/contacts/:id", async (req, res) => {
  const { id: userId } = req.params;

  try {
    // 1. Find distinct roomIds involving the user (as sender or receiver)
    const rooms = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).select("roomId senderId receiverId senderType receiverType")
      .sort({ updatedAt: -1 });

    // 2. Create a Set of counterpart IDs
    const contactsMap = new Map();

    for (const msg of rooms) {
      const isSender = msg.senderId === userId;
      const counterpartId = isSender ? msg.receiverId : msg.senderId;
      const counterpartType = isSender ? msg.receiverType : msg.senderType;
      const roomId = msg.roomId;

      if (!contactsMap.has(counterpartId)) {
        contactsMap.set(counterpartId, {
          id: counterpartId,
          type: counterpartType,
          roomId,
        });
      }
    }

    // 3. Fetch user/company data
    const contactList = [];
    for (const contact of contactsMap.values()) {
      if (contact.type === "user") {
        const user = await User.findById(contact.id).select("firstname lastname profileImage");
        if (user) {
          contactList.push({
            id: contact.id,
            type: "user",
            roomId: contact.roomId,
            name: `${user.firstname} ${user.lastname}`,
            avatar: user.profileImage,
          });
        }
      } else {
        const company = await PendingCompany.findById(contact.id).select("companyName companyLogoUrl");
        if (company) {
          contactList.push({
            id: contact.id,
            type: "company",
            roomId: contact.roomId,
            name: company.companyName,
            avatar: company.companyLogoUrl,
          });
        }
      }
    }

    res.json(contactList);
  } catch (err) {
    console.error("Failed to fetch chat contacts", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/upsertNote", async (req, res) => {
  const { noteId, companyId, noteText } = req.body;

  if (!companyId || !noteText) {
    return res.status(400).json({ error: "companyId and noteText are required" });
  }

  try {
    // Case 1: New note (noteId = 0 or null)
    if (!noteId || noteId === "0") {
      const existing = await Notes.findOne({ companyId });

      if (existing) {
        // Append new note to existing notes
        existing.notes.push(noteText);
        await existing.save();
        return res.status(200).json({ message: "Note added to existing company", data: existing });
      } else {
        // Create a new note document
        const newNote = new Notes({
          notes: [noteText],
          companyId
        });
        await newNote.save();
        return res.status(201).json({ message: "New note document created", data: newNote });
      }
    }

    // Case 2: Update existing note by noteId
    const noteDoc = await Notes.findOne({ noteId });
    if (!noteDoc) {
      return res.status(404).json({ error: "Note document not found for given noteId" });
    }

    // Let's say you want to replace the last note or the first one — update logic can vary
    noteDoc.notes[noteDoc.notes.length - 1] = noteText;
    await noteDoc.save();
    return res.status(200).json({ message: "Note updated", data: noteDoc });

  } catch (err) {
    console.error("Error handling notes:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getNotesByCompanyId/:companyId", async (req, res) => {

  const { companyId } = req.params;

  if (!companyId) {
    return res.status(400).json({ error: "companyId is required" });
  }

  try {
    const noteDoc = await Notes.findOne({ companyId });

    if (!noteDoc) {
      return res.status(404).json({ message: "No notes found for this company" });
    }

    return res.status(200).json({ data: noteDoc });
  } catch (err) {
    console.error("Error fetching notes:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/deleteNote", async (req, res) => {
  const { companyId, noteText } = req.body;

  if (!companyId || !noteText) {
    return res.status(400).json({ error: "companyId and noteText are required" });
  }

  try {
    const noteDoc = await Notes.findOne({ companyId });

    if (!noteDoc) {
      return res.status(404).json({ error: "Notes not found for this company" });
    }

    // Remove the specific note
    noteDoc.notes = noteDoc.notes.filter(note => note !== noteText);
    await noteDoc.save();

    return res.status(200).json({ message: "Note deleted", data: noteDoc });
  } catch (err) {
    console.error("Error deleting note:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
