import React, { useEffect, useState } from 'react'
import useAuthUser from '../hooks/useAuthUser.js';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../lib/api.js';
import ChatLoader from '../components/ChatLoader.jsx';
import CallButton from '../components/CallButton.jsx';
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from 'stream-chat';
import toast from 'react-hot-toast';

const STREAM_API_KEY=import.meta.env.VITE_STREAM_API_KEY;



const ChatPage = () => {
// Get the target user ID from the URL parameter (e.g., /chat/:id)
const { id: targetUserId } = useParams();

// State to hold the chat client instance (from Stream)
const [chatClient, setChatClient] = useState(null);

// State to hold the current Stream channel instance
const [channel, setChannel] = useState(null);

// State to indicate loading status during Stream client/channel setup
const [loading, setLoading] = useState(true);

// Get the currently authenticated user from your custom auth hook
const { authUser } = useAuthUser();

// Fetch Stream token for the logged-in user using React Query
const { data: tokenData } = useQuery({
  queryKey: ["streamToken"],
  queryFn: getStreamToken,   // function to fetch the token from your backend
  enabled: !!authUser,       // only run the query if the user is authenticated
});

useEffect(() => {
  // Async function to initialize the Stream chat client and connect to the channel
  const initChat = async () => {
    // If authUser or token isn't available yet, stop early
    if (!authUser || !tokenData?.token) return;

    try {
      console.log("Initializing stream chat...");

      // Get a StreamChat client instance using your public API key
      const client = StreamChat.getInstance(STREAM_API_KEY);

      // Connect the logged-in user to Stream using their token
      await client.connectUser(
        {
          id: authUser._id,               // unique user ID (must match what your backend provided)
          fullName: authUser.fullName,    // optional extra info shown in chat
          image: authUser.profilepic,     // optional profile pic shown in chat
        },
        tokenData.token              // Stream token fetched from backend
      );
    

      // Generate a consistent channel ID for any two users
      // Ensures uniqueness regardless of who initiates the chat
      const channelId = [authUser._id, targetUserId].sort().join("-");

      // Create or fetch the channel of type "messaging" for the two members
      const currChannel = client.channel("messaging", channelId, {
        members: [authUser._id, targetUserId],
      });

      // Subscribe to events and messages in the channel
      await currChannel.watch();

      // Save client and channel to local state
      setChatClient(client);
      setChannel(currChannel);

    } catch (error) {
      // If something goes wrong (e.g., bad token, network error)
      console.error("Error initializing chat:", error);
      toast.error("Could not connect to chat. Please try again.");
    } finally {
      // Whether success or failure, stop loading spinner
      setLoading(false);
    }
  };

  // Call the async function to init the chat
  initChat();

  // Rerun this effect whenever token, user, or target ID changes
}, [tokenData, authUser, targetUserId]);



const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  

  if(loading || !chatClient || !channel) return <ChatLoader/>

  

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;