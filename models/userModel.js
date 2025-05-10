import { Schema, model } from "mongoose";
import pkg from "bcryptjs";
import web_token from "jsonwebtoken";
const { compare, genSalt, hash } = pkg;
const { sign } = web_token;
const userSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  pastTrips: {
    type: String,
    required: false,
  },
  bookedTrips: {
    type: String,
    required: false,
  },
  bio: {
    type: String,
    required: false,
  },
  profileImage: {
    type: String,
    required: false,
  },
  WalletBalance: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  userType: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  gender: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  resetOTP: { type: String },
  resetOTPExpires: { type: Date },
  googleId: { type: String, unique: true, sparse: true },
});

// Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await compare(enteredPassword, this.password);
};

//Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default model("User", userSchema);
