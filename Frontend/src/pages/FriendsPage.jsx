import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import PageLoader from "../components/PageLoader";
import { getUserFriends } from "../lib/api.js";

;

const FriendsPage = () => {

  const navigate = useNavigate();

  const { data: friends, isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Friends</h2>
      {friends?.length === 0 ? (
        <p>No friends added yet.</p>
      ) : (
        <div className="grid gap-4">
          {friends.map((friend) => (
            <div
              key={friend._id}
              className="flex items-center justify-between bg-base-200 p-4 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <img
                  src={friend.profilepic || "/default-avatar.png"}
                  alt={friend.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{friend.fullName}</p>
                  <p className={`text-sm ${friend.status === "online" ? "text-success" : "text-gray-500"}`}>
                    {friend.status}
                  </p>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/chat/${friend._id}`)}
              >
                Message
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
