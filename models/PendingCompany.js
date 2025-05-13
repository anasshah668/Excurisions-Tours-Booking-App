import { Schema, model, mongoose } from "mongoose";
import pkg from "bcryptjs";
import web_token from "jsonwebtoken";
const { compare, genSalt, hash } = pkg;
const { sign } = web_token;
const pendingcompanySchema = new Schema({
  companyId: {
    type: Schema.Types.ObjectId, // Use MongoDB's ObjectId as companyId
    default: () => new mongoose.Types.ObjectId(), // Automatically generate ObjectId
    unique: true, // Ensure uniqueness
  },
  companyName: { type: String, required: true },
  companyOwnerFirstName: {
    type: String,
    required: true,
  },
  companyOwnerLastName: {
    type: String,
    required: true,
  },
  establishedIn: {
    type: String,
    required: true,
  },
  supportDoocument: {
    type: String,
    required: true,
  },
  companyPhoneNo: {
    type: String,
    required: true,
    unique: true,
  },
  companyAddress: {
    type: String,
    required: true,
  },
  companyEmail: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  companyLogoUrl: {
    type: String,
    required: true,
  },
  emailOtp: {
    type: Number,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
  },
});

pendingcompanySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
pendingcompanySchema.methods.matchPassword = async function (enteredPassword) {
  return await compare(enteredPassword, this.password);
};

//Generate JWT token
pendingcompanySchema.methods.getSignedJwtToken = function () {
  return sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
export default model("PendingCompany", pendingcompanySchema);
