import mongoose, { Schema, model } from "mongoose";

const NotesSchema = new Schema({
  notes: [{ type: String, required: true }],
  companyId: {
    type: String,
    required: true,
    unique: true
  },
  noteId: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    unique: true
  }
});

export default model("Notes", NotesSchema);
