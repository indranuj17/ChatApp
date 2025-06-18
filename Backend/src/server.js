import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import { connectDb } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import chatRoutes from "./routes/chat.routes.js";
import path from "path"

dotenv.config();

const app = express();
const PORT = process.env.PORT ; // Fallback in case PORT is not defined

const __dirname=path.resolve();
app.use(
    cors({
origin:"http://localhost:5173",
credentials:true, //allow frontend to send cookies
})
);

// Middleware to parse JSON (recommended if you expect POST requests)
app.use(express.json());
app.use(cookieParser());


app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/chat",chatRoutes);

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../Frontend/dist")));
}

app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"../Frontend","dist","index.html"));
})

// Start the Server
app.listen(PORT, () => {
    console.log(`Serve at http://localhost:${PORT}`);
    connectDb();
});
