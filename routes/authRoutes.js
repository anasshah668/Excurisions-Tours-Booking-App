import { Router } from "express";
import User from "../models/userModel.js";
import Company from "../models/CompanyModel.js";
import PendingCompany from "../models/PendingCompany.js";
import pkg from "bcryptjs";
const { compare, genSalt, hash } = pkg;
import { sendEmail } from "../shared/common.js";

import db from "../config/firebaseConfiguration.js";
const router = Router();
// Register a new user
router.post("/", async (req, res) => {
  const { name, email } = req.body;
});
router.post("/register", async (req, res) => {
  // #swagger.tags = ['Auth']
  try {
    const {
      firstname,
      lastname,
      password,
      email,
      userType,
      gender,
      dateOfBirth,
    } = req.body;
    // Check if all required fields are provided
    if (
      !firstname ||
      !lastname ||
      !password ||
      !userType ||
      !email ||
      !gender ||
      !dateOfBirth
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // Create a new user instance
    const newUser = new User({
      firstname,
      lastname,
      password, // Password will be hashed by the pre-save hook in the model
      userType,
      email,
      gender,
      dateOfBirth,
    });

    // Save the user to the database
    await newUser.save();

    // Return success message
    res.status(201).json({
      message: "User registered successfully",
      user: {
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        userType: newUser.userType,
        userId: newUser.id,
        dateOfBirth: newUser.dateOfBirth,
        gender: newUser.gender,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error.message); // Log detailed error
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.post("/registerUser", async (req, res) => {
  // #swagger.tags = ['Auth']
  try {
    const {
      firstname,
      lastname,
      password,
      email,
      userType,
      gender,
      dateOfBirth,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !password ||
      !userType ||
      !email ||
      !gender ||
      !dateOfBirth
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Check if user already exists
    const usersRef = db.collection("users");
    const existingQuery = await usersRef.where("email", "==", email).get();

    if (!existingQuery.empty) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create user data
    const newUserData = {
      firstname,
      lastname,
      password, // You should hash this before storing in production
      userType,
      email,
      gender,
      dateOfBirth,
      createdAt: new Date(),
    };

    // Add user to Firestore
    const docRef = await usersRef.add(newUserData);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        firstname,
        lastname,
        email,
        userType,
        userId: docRef.id,
        gender,
        dateOfBirth,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

// Register as Company
// router.post("/register-company", async (req, res) => {
//   // #swagger.tags = ['Auth']
//   try {
//     const {
//       companyName,
//       companyOwnerFirstName,
//       companyOwnerLastName,
//       companyPhoneNo,
//       companyAddress,
//       companyEmail,
//       password,
//       companyLogoUrl,
//       gender,
//       dateOfBirth,
//     } = req.body;

//     // Step 1: Check if the company phone number or email already exists
//     const existingCompany = await Company.findOne({
//       $or: [{ companyPhoneNo }, { companyEmail }],
//     });
//     if (existingCompany) {
//       return res.status(400).json({
//         message: "Company with this phone number or email already exists",
//       });
//     }

//     // Step 2: Create a new company
//     const newCompany = new Company({
//       companyName,
//       companyOwnerFirstName,
//       companyOwnerLastName,
//       companyPhoneNo,
//       companyAddress,
//       companyEmail,
//       password,
//       gender,
//       dateOfBirth,
//       companyLogoUrl,
//     });
//     // Save the company to the database
//     await newCompany.save();

//     // Step 3: Create the corresponding user
//     const newUser = new User({
//       _id: newCompany._id, // Set the user _id to be the same as the company _id
//       firstname: companyOwnerFirstName,
//       lastname: companyOwnerLastName,
//       email: companyEmail,
//       password, // The password should already be hashed as we did for the company
//       userType: "company",
//       gender: gender, // Setting the userType to 'company' for company admin
//       dateOfBirth: dateOfBirth,
//     });

//     // Save the user to the database
//     await newUser.save();

//     // Step 4: Generate JWT for the company (optional)
//     const token = newCompany.getSignedJwtToken(); // Assuming the method exists in company model

//     // Step 5: Return success response with token and company details
//     res.status(201).json({
//       message: "Company and user registered successfully",
//       token,
//       company: {
//         companyName: newCompany.companyName,
//         companyEmail: newCompany.companyEmail,
//         companyPhoneNo: newCompany.companyPhoneNo,
//         companyLogoUrl: newCompany.companyLogoUrl,
//       },
//       user: {
//         firstname: newUser.firstname,
//         lastname: newUser.lastname,
//         email: newUser.email,
//         userType: newUser.userType,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// });

router.post("/registerCompany", async (req, res) => {
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
      gender,
      dateOfBirth,
      establishedIn,
      supportDoocument,
    } = req.body;

    // Check if phone or email already exists in Pending or Company
    const existsInPending = await PendingCompany.findOne({
      $or: [{ companyPhoneNo }, { companyEmail }],
    });
    const existsInCompany = await Company.findOne({
      $or: [{ companyPhoneNo }, { companyEmail }],
    });

    if (existsInPending || existsInCompany) {
      return res.status(400).json({
        message: "Company with this phone number or email already exists",
      });
    }
    const pendingCompany = new PendingCompany({
      companyName,
      companyOwnerFirstName,
      companyOwnerLastName,
      companyPhoneNo,
      companyAddress,
      establishedIn,
      companyEmail,
      password,
      companyLogoUrl,
      gender,
      dateOfBirth,
      supportDoocument,
    });

    await pendingCompany.save();

    res.status(201).json({
      message: "Company registration submitted and pending approval.",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.get("/getcompaniesUnApproved", async (req, res) => {
  try {
    const pendingCompanies = await PendingCompany.find({ status: "pending" });
    res.status(200).json({
      message: "Pending companies fetched successfully",
      count: pendingCompanies.length,
      data: pendingCompanies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Login a user

router.post("/login", async (req, res) => {
  // #swagger.tags = ['Auth']
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
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
      userType: user.userType,
      email: user.email,
      profileImage: user.profileImage,
      message: "Successfully Login",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
});

router.get("/getUserAgainstId", async (req, res) => {
  const { id } = req.query;

  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // await User.updateMany(
    //   {},
    //   {
    //     $set: {
    //       phone: "",
    //       address: "",
    //       bio: "",
    //       WalletBalance: 0,
    //       profileImage: "",
    //       pastTrips: 0,
    //       bookedTrips: 0,
    //     },
    //   }
    // );
    return res.status(200).json({
      status: 200,
      success: true,
      data: {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        phone: user.phone,
        address: user.address,
        pastTrips: user.pastTrips,
        balance: user.WalletBalance,
        bookedTrips: user.bookedTrips,
        profileImage: user.profileImage,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res.status(500).json({ message: "Server Error" });
  }
});
// PUT /api/user/updateUser
router.put("/updateUser", async (req, res) => {
  const { id } = req.query;
  const { phone, address, bio, profileImage } = req.body;
  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.phone = phone ?? user.phone;
    user.address = address ?? user.address;
    user.profileImage = profileImage ?? user.profileImage;
    user.bio = bio ?? user.bio;
    await user.save();
    return res.status(200).json({
      status: 200,
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Server Error" });
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

router.post("/sendCompanyEmailOtp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  try {
    const company = await PendingCompany.findOne({ companyEmail: email });
    if (!company) {
      return res.status(404).json({ message: "Pending company not found." });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    company.emailOtp = otp;
    await company.save();
    await sendEmail(
      email,
      "OnBoarding Email Verification as Tour Operating Company",
      `${otp}`
    );
    res
      .status(200)
      .json({ message: "OTP sent to email successfully.", status: 200 });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
});

router.post("/verifyOTP", async (req, res) => {
  // #swagger.tags = ['Auth']
  const { email, otp } = req.body;
  const user = await User.findOne({ email, resetOTP: otp });
  if (!user || user.resetOTPExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  res.json({ message: "OTP verified", status: 200 });
});

router.post("/resetPassword", async (req, res) => {
  // #swagger.tags = ['Auth']
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();
    res.json({ message: "Password reset successful", status: 200 });
  } else {
    res.json({ message: "Email not valid or OTP Expired", status: 200 });
  }
});

export default router;
