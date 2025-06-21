// backend/controllers/authController.js



import jwt from "jsonwebtoken";
import User from "../models/User.models.js"; // Your Mongoose User model
import { upsertStreamUser } from "../lib/stream.js"; // Stream chat user sync (optional)

// Handles Google Sign-In from the frontend
export async function googleSignIn(req, res) {
  const { fullName, email, profilepic, firebaseUid } = req.body;

  try {
    // 1. Check if user already exists in DB
    let user = await User.findOne({ email });

    // 2. If user does not exist, create a new one
    if (!user) {
      const randomAvatar =
        profilepic || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUid}`;

      user = await User.create({
        fullName,
        email,
        password: firebaseUid, // dummy password — not used, only to satisfy schema
        profilepic: randomAvatar,
      });

      // 3. Optional: Create or update user in Stream Chat (used for messaging features)
      try {
        await upsertStreamUser({
          id: user._id.toString(), // required to be string
          name: fullName,
          image: randomAvatar,
        });
        console.log(`StreamUser created for the user: ${user.fullName}`);
      } catch (streamErr) {
        console.log("Error creating StreamUser", streamErr.message);
      }
    }

    // 4. Generate JWT token for user session
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRETE_KEY,
      { expiresIn: "7d" }
    );

    // 5. Set the token as an HTTP-only cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      httpOnly: true,                 // cookie not accessible via JavaScript
      sameSite: "strict",             // prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", // secure cookie in prod only
    });

    // 6. Send success response
    res.status(200).json({ success: true, user });
  } 
  
  catch (error) {
    console.error("Google Sign-In Error:", error.message);
    res.status(500).json({ message: "Google sign-in failed" });
  }
}
