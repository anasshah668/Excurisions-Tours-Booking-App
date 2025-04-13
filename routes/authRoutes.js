import { Router } from "express";
import User from "../models/userModel.js";
import Company from "../models/CompanyModel.js";
import pkg from "bcryptjs";
const { compare, genSalt, hash } = pkg;
import { sendEmail } from "../shared/common.js";
const router = Router();

// Register a new user

router.post("/register", async (req, res) => {
  // #swagger.tags = ['Auth']
  try {
    const { firstname, lastname, username, password, email, userType } =
      req.body;
    // Check if all required fields are provided
    if (
      !firstname ||
      !lastname ||
      !username ||
      !password ||
      !userType ||
      !email
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }
    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Create a new user instance
    const newUser = new User({
      firstname,
      lastname,
      username,
      password, // Password will be hashed by the pre-save hook in the model
      userType,
      email,
    });

    // Save the user to the database
    await newUser.save();

    // Return success message
    res.status(201).json({
      message: "User registered successfully",
      user: {
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        username: newUser.username,
        userType: newUser.userType,
        email: newUser.email,
        userId: newUser.id,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error.message); // Log detailed error
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Register as Company
router.post("/register-company", async (req, res) => {
  try {
    const {
      companyName,
      companyOwnerFirstName,
      companyOwnerLastName,
      companyPhoneNo,
      companyAddress,
      companyEmail,
      password,
      companyLogoUrl,
    } = req.body;

    // Step 1: Check if the company phone number or email already exists
    const existingCompany = await Company.findOne({
      $or: [{ companyPhoneNo }, { companyEmail }],
    });
    if (existingCompany) {
      return res.status(400).json({
        message: "Company with this phone number or email already exists",
      });
    }

    // Step 2: Create a new company
    const newCompany = new Company({
      companyName,
      companyOwnerFirstName,
      companyOwnerLastName,
      companyPhoneNo,
      companyAddress,
      companyEmail,
      password,
      companyLogoUrl,
    });

    // Hash the company password
    const salt = await genSalt(10);
    newCompany.password = await hash(password, salt);

    // Save the company to the database
    await newCompany.save();

    // Step 3: Create the corresponding user
    const newUser = new User({
      _id: newCompany._id, // Set the user _id to be the same as the company _id
      firstname: companyOwnerFirstName,
      lastname: companyOwnerLastName,
      username: companyEmail, // Using the email as the username (you can change this as needed)
      password, // The password should already be hashed as we did for the company
      email: companyEmail,
      userType: "company", // Setting the userType to 'company' for company admin
    });

    // Save the user to the database
    await newUser.save();

    // Step 4: Generate JWT for the company (optional)
    const token = newCompany.getSignedJwtToken(); // Assuming the method exists in company model

    // Step 5: Return success response with token and company details
    res.status(201).json({
      message: "Company and user registered successfully",
      token,
      company: {
        companyName: newCompany.companyName,
        companyEmail: newCompany.companyEmail,
        companyPhoneNo: newCompany.companyPhoneNo,
        companyLogoUrl: newCompany.companyLogoUrl,
      },
      user: {
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        username: newUser.username,
        email: newUser.email,
        userType: newUser.userType,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Login a user

router.post("/login", async (req, res) => {
  // #swagger.tags = ['Auth']
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = user.getSignedJwtToken();
    // Include the userId in the response
    res.status(200).json({
      token,
      userId: user._id,
      username: user.username,
      message: "Successfully Login",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
});

//change-password

router.put("/change-password", async (req, res) => {
  // #swagger.tags = ['Auth']
  const { userId, oldPassword, newPassword } = req.body;
  // Validate input data
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({
      message: "User ID, old password, and new password are required",
      status: 400,
    });
  }
  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", status: 404 });
    }
    // Check if the old password matches
    const isMatch = await compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Old Password doesnt match",
        status: 400,
      });
    }
    // Ensure the new password is not the same as the old password
    const isSamePassword = await compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "Old password and new password cannot be the same",
        status: 400,
      });
    }
    // Hash the new password before saving
    const salt = await genSalt(10);
    user.password = await hash(newPassword, salt);
    // Save the updated user object
    await user.save();
    res.status(200).json({
      message: "Password successfully updated",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", status: 500 });
  }
});

//forget-password
router.post("/forgotPassword", async (req, res) => {
  // #swagger.tags = ['Auth']
  const { email } = req.body;
  console.log("Received email:", email);
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000;
  user.resetOTP = otp;
  user.resetOTPExpires = otpExpires;
  await user.save();
  await sendEmail(email, "Excurisions OTP Verification", `${otp}`);
  res.json({ message: "OTP sent to email", status: 200 });
});

//
router.post("/verifyOTP", async (req, res) => {
  // #swagger.tags = ['Auth']
  const { email, otp } = req.body;
  const user = await User.findOne({ email, resetOTP: otp });
  if (!user || user.resetOTPExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  res.json({ message: "OTP verified", status: 200 });
});

router.post("/resetPassword", async (res, req) => {
  // #swagger.tags = ['Auth']
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  const salt = await genSalt(10);
  if (user) {
    user.password = await hash(newPassword, salt);
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();
    res.json({ message: "Password reset successful", status: 200 });
  } else {
    res.json({ message: "Email not valid or OTP Expired", status: 200 });
  }
});

export default router;
