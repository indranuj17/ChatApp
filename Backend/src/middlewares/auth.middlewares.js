import jwt from "jsonwebtoken";
import User from "../models/User.models.js";

// ✅ Middleware to protect routes that require authentication
export const protectRoute = async (req, res, next) => {
  try {
    // ✅ 1. Read the JWT token from the browser's cookies
    const token = req.cookies.jwt;

    // ❌ If no token is present, block access (user is not logged in)
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    // ✅ 2. Verify the token using the secret key
    // This gives us the payload, which includes userId
    const decodedToken = jwt.verify(token, process.env.JWT_SECRETE_KEY);

    // ❌ If token is invalid or expired, block access
    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // ✅ 3. Fetch the user from the database using the ID in the token payload
    // We exclude the password field for security
    const user = await User.findById(decodedToken.userId).select("-password");

    // ❌ If the user no longer exists (e.g., deleted), block access
    if (!user) {
      return res.status(401).json({ message: "User not found!" });
    }

    // ✅ 4. Attach the user object to the request, so it can be accessed in the next middleware or route
    req.user = user;

    // ✅ 5. Move on to the next middleware or route handler
    next();
  } catch (error) {
    // ❌ If anything goes wrong (e.g., invalid token, DB error), respond with server error
    console.log("Error in the protectRoute Middleware:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
