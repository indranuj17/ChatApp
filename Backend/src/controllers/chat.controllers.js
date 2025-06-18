import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    console.log("✅ req.user.id:", req.user?.id); // should be defined

    const token = await generateStreamToken(req.user.id);
    console.log("✅ Generated Stream Token:", token); // should be a string

    return res.status(200).json({ token });
  } catch (error) {
    console.log("❌ Error in chatController:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
