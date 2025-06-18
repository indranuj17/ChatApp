import User from "../models/User.models.js";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";


export async function Signup(req, res) {
  // ✅ Extract input from the request body
  const { fullName, email, password } = req.body;

  try {
    // ✅ Step 1: Basic input validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Step 2: Enforce a minimum password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must have atleast 6 characters!" });
    }

    // ✅ Step 3: Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // ✅ Step 4: Check if user already exists in the DB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Step 5: Generate a random avatar for new user
    const ind = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${ind}.png`;

    // ✅ Step 6: Create the new user in the database
    const newUser = await User.create({
      fullName,
      email,
      password,         // 📌 Make sure this is hashed in your User model!
      profilepic: randomAvatar,
    });

    // ✅ Step 7 (optional): Create the same user in Stream (for chat or live features)
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),       // Stream user ID (must be a string)
        name: newUser.fullName,          // Display name
        image: newUser.profilepic || "", // Profile picture
      });
      console.log(`StreamUser created for the user: ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating StreamUser", error.message);
    }

    // ✅ Step 8: Generate a JWT for session management
    const token = jwt.sign(
      { userId: newUser._id },                // Payload
      process.env.JWT_SECRETE_KEY,            // Secret key from .env (🔁 correct to JWT_SECRET_KEY)
      { expiresIn: "7d" }                     // Token validity: 7 days
    );

    // ✅ Step 9: Store the token in an HTTP-only cookie (more secure than localStorage)
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry in ms
      httpOnly: true,                  // JS cannot access cookie → helps prevent XSS
      sameSite: "strict",              // helps prevent CSRF
      secure: process.env.NODE_ENV === "production", // send only over HTTPS in production
    });

    // ✅ Step 10: Send back success response with the new user
    res.status(200).json({ success: true, user: newUser });
  } catch (error) {
    // ❌ Handles any unpredicted errors (like DB failures, etc.)
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}




export async function Login(req, res) {
  try {
    // ✅ Step 1: Extract user credentials from the request body
    const { email, password } = req.body;

    // ✅ Step 2: Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Step 3: Check if the user exists in the database
    const user = await User.findOne({ email });

    // ❌ Step 4: If user not found, return error
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Step 5: Compare provided password with hashed password in DB
    const isPasswordCorrect = await user.matchPassword(password); // assumes bcrypt compare
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Step 6: Generate a JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRETE_KEY,  // 
      { expiresIn: "7d" }
    );

    // ✅ Step 7: Store token securely in an HTTP-only cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      httpOnly: true,                  // prevents JavaScript access (XSS protection)
      sameSite: "strict",              // CSRF protection
      secure: process.env.NODE_ENV === "production", // HTTPS-only in production
    });

    // ✅ Step 8: Send back user info (without password)
    res.status(200).json({ success: true, user });

  } catch (error) {
    // ❌ Handle unexpected errors
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}




export async function Logout(req, res) {
  // ✅ Step 1: Clear the JWT cookie from the browser
  res.clearCookie("jwt");

  // ✅ Step 2: Send success response
  res.status(200).json({ success: true, message: "Logout Successful" });
}





export async function Onboard(req, res) {
  try {
    // ✅ Step 1: Extract the currently authenticated user's ID from the request
    const userId = req.user._id;
    // 🔐 Assumes `protectRoute` middleware is used and sets `req.user`

    // ✅ Step 2: Destructure onboarding fields from request body
    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    // ✅ Step 3: Validate that all required fields are provided
    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(401).json({
        message: "All fields are required",
        // 📌 Return which fields are missing to improve frontend UX
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean), // remove any `false` entries
      });
    }

    // ✅ Step 4: Update the user's profile in the database with onboarding info
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        isOnboarded: true, // ✅ Set a flag to indicate onboarding is complete
      },
      { new: true } // ✅ Ensures the updated user is returned
    );

    // ❌ If the user wasn’t found in the DB
    if (!updatedUser) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Step 5: Update user info in external service (e.g., Stream chat)
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),         // Stream expects a string ID
        name: updatedUser.fullName,             // Display name
        image: updatedUser.profilepic || "",    // Optional profile picture
      });
    } catch (err) {
      // ❌ If Stream update fails, log and return error
      console.log("Error in upsertingOnboardUserin Stream", err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // ✅ Step 6: If all operations succeed, send success response
    return res.status(200).json({ message: "User Onboarded Successfully" });
  } catch (error) {
    // ❌ Catch any unhandled errors and respond with a 500 error
    console.log("Error in the User Onboard in auth controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
