import { StreamChat } from "stream-chat";
import dotenv from "dotenv";

dotenv.config();

const apikey=process.env.STREAM_API_KEY;
const apisecrete=process.env.STREAM_API_SECRETE;

if(!apikey || !apisecrete){
    console.error("Stream apikey or stream apisecrete is missing");
}

const streamClient=StreamChat.getInstance(apikey,apisecrete);

export const upsertStreamUser=async (userData)=>{
    try {
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error("Error upserting StreamUser",error.message)
    }
};


export async function generateStreamToken(userId){
    try {
        const userIdStr=userId.toString();
    
        const Streamtoken=streamClient.createToken(userIdStr);
        return Streamtoken;
    } catch (error) {
        console.log("Error generating Stream token in Streamjs in lib",error.message);
        return res.status(500).json({message:"Internal Server Error"});
    }
};