// FILE: g:\Chat-App\frontend\src\components\ChatHeader.jsx
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  // Ensure arrays to prevent errors
  const safeOnlineUsers = Array.isArray(onlineUsers) ? onlineUsers : [];
  const safeTypingUsers = Array.isArray(typingUsers) ? typingUsers : [];

  // Check if user is online
  const isUserOnline = selectedUser?._id ? safeOnlineUsers.includes(selectedUser._id) : false;
  const isUserTyping = selectedUser?._id ? safeTypingUsers.includes(selectedUser._id) : false;

  if (!selectedUser) {
    return (
      <div className="p-2.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Select a user</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose someone to chat with</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2.5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-colors shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with Online Indicator */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/avatar.png";
                }}
              />
            </div>
            {isUserOnline && (
              <span
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"
                title="Online"
              />
            )}
          </div>

          {/* User Info */}
          <div className="flex flex-col">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {selectedUser.fullName}
            </h3>
            
            {/* Status with Typing Indicator */}
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              {isUserTyping ? (
                <>
                  <span className="flex items-center gap-1">
                    <span className="text-blue-500 dark:text-blue-400 font-medium">Typing</span>
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1 h-1 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </span>
                </>
              ) : isUserOnline ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Online</span>
                </>
              ) : (
                <span>Offline</span>
              )}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setSelectedUser(null)}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;