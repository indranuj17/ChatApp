import express from "express";
import { Signup,Login,Logout,Onboard } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";
import { googleSignIn } from "../controllers/googleSignin.controllers.js";

const router=express.Router();

router.post("/signup",Signup);

router.post("/login",Login);

router.post("/logout",Logout);

router.post("/onboarding",protectRoute,Onboard);

router.get("/me",protectRoute,(req,res)=>{
    res.status(200).json({message:"User Logged In",success:true,user:req.user});
})

router.post("/google-signin",googleSignIn);






export default router;