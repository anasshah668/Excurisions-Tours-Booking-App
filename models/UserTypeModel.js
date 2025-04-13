import { Schema, model } from "mongoose";

const UserType = new Schema({
  UserType: { type: String, required: true },
});

export default model("UserType", UserType);
