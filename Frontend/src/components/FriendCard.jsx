import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
// FriendCard component receives a `friend` object as a prop
const FriendCard = ({ friend }) => {
  return (
    // Main card container with background color and hover effect
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      {/* Card body with padding */}
      <div className="card-body p-4">
        
        {/* USER INFO SECTION */}
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar container with fixed size */}
          <div className="avatar size-12">
            {/* User profile picture */}
            <img src={friend.profilepic} alt={friend.fullName} />
          </div>

          {/* Friend's full name, bold and truncated if too long */}
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        {/* LANGUAGES BADGES SECTION */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {/* Badge for native language */}
          <span className="badge badge-secondary text-xs">
            {/* Flag icon + text */}
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>

          {/* Badge for learning language */}
          <span className="badge badge-outline text-xs">
            {/* Flag icon + text */}
            {getLanguageFlag(friend.learningLanguage)} 
            Learning: {friend.learningLanguage}
          </span>
        </div>

        {/* CHAT BUTTON */}
        {/* Navigates to chat page with this friend */}
        <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
          Message
        </Link>
      </div>
    </div>
  );
};
// Export the component so it can be used elsewhere
export default FriendCard;



export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    //UI to return 
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}