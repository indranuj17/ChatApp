import express from "express";
import { protectRoute } from "../middlewares/auth.middlewares.js";
import { acceptFriendRequest, getFriendRequests, getMyFriends, getOutgoingFriendRequests, getReccomendedUsers, sendFriendRequest } from "../controllers/user.controllers.js";


const router=express.Router();
//apply the auth middleware before every route
router.use(protectRoute);

router.get("/",getReccomendedUsers);

router.get("/friends",getMyFriends);

router.post("/friend-request/:id",sendFriendRequest);

router.post("/friend-request/:id/accept",acceptFriendRequest);

router.get("/friend-requests",getFriendRequests);

router.get("/outgoing-friend-requests",getOutgoingFriendRequests);


export default router;