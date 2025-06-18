import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api.js";
import { Link } from "react-router";
import { CheckCircleIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { capitialize } from "../lib/utils.js";
import FriendCard, { getLanguageFlag } from "../components/FriendCard.jsx";
import NoFriendsFound from "../components/NoFriendsFound.jsx";


const HomePage = () => {
  // Get access to React Query's queryClient instance to manually invalidate/cache queries
  const queryClient = useQueryClient();

  // Local state to store IDs of users to whom friend requests have already been sent
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  // Fetch the current user's friends
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],     // Unique identifier for this query's cache
    queryFn: getUserFriends,   // API call to fetch friends list
  });

  // Fetch recommended users to send friend requests to
  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],              // Query key for caching recommended users
    queryFn: getRecommendedUsers,     // API call to fetch recommended users
  });

  // Fetch the friend requests the current user has already sent
  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],   // Unique key for outgoing friend requests cache
    queryFn: getOutgoingFriendReqs,     // API call to fetch outgoing friend requests
  });

  // Mutation for sending a friend request to another user
  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,  // API call to send a friend request
    onSuccess: () => {
      // After sending a request successfully, re-fetch the outgoing requests
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
  });

  // When the component mounts or outgoingFriendReqs changes,
  // update the local Set of user IDs who have already received a request
  useEffect(() => {
    const outgoingIds = new Set();

    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      // Extract each recipient's ID from the sent requests and add to the Set
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });

      // Update local state
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);




  return (

<div className="min-h-screen w-full p-4 sm:p-6 lg:p-8 bg-base-100 overflow-x-hidden">
  <div className="w-full space-y-10 px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Friends</h2>
          <Link to="/notifications" className="btn btn-outline btn-sm">
            <UsersIcon className="mr-2 size-4" />
            Friend Requests
          </Link>
        </div>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}

      {/* // Section for showing recommended language exchange users */}

<section>

  {/* Header section with title and subtitle */}
  <div className="mb-6 sm:mb-8">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Meet New Learners</h2>

        {/* Section Subtitle */}
        <p className="opacity-70">
          Discover perfect language exchange partners based on your profile
        </p>
      </div>
    </div>
  </div>

  {/* Conditional rendering for different data states */}
  {loadingUsers ? (
    // Show spinner while users are being loaded
    <div className="flex justify-center py-12">
      <span className="loading loading-spinner loading-lg" />
    </div>
  ) : recommendedUsers.length === 0 ? (
    // If no users are recommended, show a fallback card message
    <div className="card bg-base-200 p-6 text-center">
      <h3 className="font-semibold text-lg mb-2">No recommendations available</h3>
      <p className="text-base-content opacity-70">
        Check back later for new language partners!
      </p>
    </div>
  ) : (
    // Otherwise, show a grid of recommended user cards
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Loop through recommended users and render a card for each */}
      {recommendedUsers.map((user) => {
        
        // Check if a friend request has already been sent to this user
        const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

        return (
          // Individual user card
          <div
            key={user._id}
            className="card bg-base-200 hover:shadow-lg transition-all duration-300"
          >
            {/* Card content with spacing */}
            <div className="card-body p-5 space-y-4">
              
              {/* Avatar and name */}
              <div className="flex items-center gap-3">
                <div className="avatar size-16 rounded-full">
                  <img src={user.profilepic} alt={user.fullName} />
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{user.fullName}</h3>

                  {/* Optional location display */}
                  {user.location && (
                    <div className="flex items-center text-xs opacity-70 mt-1">
                      <MapPinIcon className="size-3 mr-1" />
                      {user.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Language info with flags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="badge badge-secondary">
                  {getLanguageFlag(user.nativeLanguage)}
                  Native: {capitialize(user.nativeLanguage)}
                </span>
                <span className="badge badge-outline">
                  {getLanguageFlag(user.learningLanguage)}
                  Learning: {capitialize(user.learningLanguage)}
                </span>
              </div>

              {/* Optional bio section */}
              {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

              {/* Action button: send request or show 'Request Sent' if already done */}
              <button
                className={`btn w-full mt-2 ${
                  hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                } `}
                onClick={() => sendRequestMutation(user._id)}
                disabled={hasRequestBeenSent || isPending}
              >
                {hasRequestBeenSent ? (
                  <>
                    <CheckCircleIcon className="size-4 mr-2" />
                    Request Sent
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="size-4 mr-2" />
                    Send Friend Request
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  )}
</section>

      </div>
    </div>
  );
};

export default HomePage;