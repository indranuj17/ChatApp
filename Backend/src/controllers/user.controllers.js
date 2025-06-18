import FriendRequest from "../models/FriendRequest.models.js";
import User from "../models/User.models.js";



export async function getReccomendedUsers(req,res){

  try {
      const currentUserId=req.user._id;
      const currentUser=req.user;
  
      const recommendedUsers=await User.find(
          {
              $and:[ 
                  {_id:{$ne:currentUserId}}, 
                  {_id:{$nin:currentUser.friends}},
                  {isOnboarded:true}
              ],
          }
      );

      res.status(200).json(recommendedUsers);
  }
  
  catch (error) {
    console.log("Error in the getReccomendedUsers in user Controller",error.message);
    res.status(500).json({message:"Internal Server Error"});
  }
};



export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilepic nativeLanguage learningLanguage");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export async function sendFriendRequest(req,res){

  try {
     const myId=req.user.id;
     const {id:recipientId}=req.params;
     
     if(myId===recipientId){
      return res.status(400).json({message:"You cannot send friend request to yourself"});
     }

     const recipient=await User.findById(recipientId);
     if(!recipient){
      return res.status(400).json({message:"Reciepent not found"});
     }
     
     //check if the user is already friends
     if(recipient.friends.includes(myId)){
      return res.status(400).json({message:"You are already friends with this user"});
     }

     const existingRequest=await FriendRequest.findOne({
      $or:[{sender:myId , recipient:recipientId} , {sender:recipientId, recipient:myId}]
     });

     if(existingRequest){
      return res.status(400).json({message:"Request already exists"});
     }

     const friendRequest=await FriendRequest.create({
      sender:myId,
      recipient:recipientId
     });

     return res.status(200).json(friendRequest);
  } 
  catch (error) {
    console.log("Error in the friendRequest user controller",error.message);
    return res.status(500).json({message:"Internal Server Error"});
  }
};




export async function acceptFriendRequest(req,res){

  try {
    
    const {id:requestId}=req.params; //reciepent id

    const friendRequest=await FriendRequest.findById(requestId);
    if(!friendRequest){
      return res.status(404).json({message:"Request not found"});
    }

    //checking if the current user is the reciepent
    if(friendRequest.recipient.toString()!==req.user.id){ // account of reciepent 
      return res.status(403).json({message:"You are Unauthorized to accept the friend request"});
    }
    

    friendRequest.status="accepted";
    await friendRequest.save();


    //add each user to other users friends array
    //$addToSet:adds the elements to the array if do not already exists
   await User.findByIdAndUpdate(friendRequest.sender,
    {
      $addToSet:{friends:friendRequest.recipient},
    }
   );
   await User.findByIdAndUpdate(friendRequest.recipient,
    {
      $addToSet:{friends:friendRequest.sender},
    }
   );


   return res.status(200).json({message:"Friend Request Accepted"});
    
  } 
  catch (error) {
    console.log("Error in the acceptFriendRequest user controller",error.message);
   return res.status(500).json({message:"Internal Server Error"});
  }
};



export async function getFriendRequests(req,res){
  try {
    const incomingRequests=await FriendRequest.find({
      //filters
      recipient:req.user.id,  //in the recipent account
      status:"pending"
    }).populate("sender","fullName profilepic nativeLanguage learningLanguage");
    

    const acceptedRequests=await FriendRequest.find({
      sender:req.user.id, //whom the reciepent has sent requests
      status:"accepted"  //jinhone accept kar liya
    }).populate("recipient","fullName profilepic");

    return res.status(200).json({incomingRequests,acceptedRequests});

  } catch (error) {
    console.log("Error in the getRequests user controller",error.message);
   return res.status(500).json({message:"Internal Server Error"});

  }
};




export async function getOutgoingFriendRequests(req,res){
  try {
    const outgoingFriendRequests=await FriendRequest.find({
      sender:req.user.id,
      status:"pending",
    }).populate("recipient","fullName profilepic nativeLanguage learningLanguage");

    return res.status(200).json(outgoingFriendRequests);
  } catch (error) {
     console.log("Error in the getOutgoingFriendRequests user controller",error.message);
     return res.status(500).json({message:"Internal Server Error"});
  }
}