import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const containerRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  // Scroll to bottom function
  const scrollToBottom = (behavior = 'smooth') => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  // Initialize chat when user is selected
  useEffect(() => {
    if (!selectedUser?._id) return;

    let cleanup = null;
    let isMounted = true;

    const initializeChat = async () => {
      if (!isMounted) return;

      try {
        // Fetch messages
        await getMessages(selectedUser._id);
        
        // Subscribe to real-time updates
        cleanup = subscribeToMessages();
        
        // Scroll to bottom immediately after loading
        setTimeout(() => scrollToBottom('auto'), 100);
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    initializeChat();

    return () => {
      isMounted = false;
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
      unsubscribeFromMessages();
    };
  }, [selectedUser?._id]); // Only depend on selectedUser._id

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length === 0) return;

    // Check if user is at bottom before new message
    const isAtBottom = () => {
      if (!containerRef.current) return true;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      return scrollHeight - scrollTop - clientHeight < 100;
    };

    // Only auto-scroll if:
    // 1. New messages were added
    // 2. User is already at bottom OR the new message is from current user
    const messagesAdded = messages.length > prevMessagesLengthRef.current;
    const lastMessage = messages[messages.length - 1];
    const isMyMessage = lastMessage?.senderId === authUser?._id || 
                        lastMessage?.senderId?._id === authUser?._id;

    if (messagesAdded && (isAtBottom() || isMyMessage)) {
      scrollToBottom('smooth');
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, authUser]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Select a user to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors">
      <ChatHeader />

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm">Start a conversation with {selectedUser.fullName}</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const senderId = message.senderId?._id || message.senderId;
            const receiverId = message.receiverId?._id || message.receiverId;
            const isCurrentUser = senderId === authUser._id;

            const senderProfilePic =
              message.senderId?.profilePic ||
              (isCurrentUser ? authUser.profilePic : selectedUser.profilePic);
            const senderName =
              message.senderId?.fullName ||
              (isCurrentUser ? authUser.fullName : selectedUser.fullName);

            return (
              <div
                key={message._id || `message-${index}`}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-start space-x-2 max-w-[70%]">
                  {!isCurrentUser && (
                    <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex-shrink-0">
                      <img
                        src={senderProfilePic || "/avatar.png"}
                        alt={`${senderName}'s profile`}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = "/avatar.png";
                        }}
                      />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {isCurrentUser ? "You" : senderName}
                      </span>
                      <time className="text-xs text-gray-500 dark:text-gray-400">
                        {formatMessageTime(message.createdAt)}
                      </time>
                    </div>
                    <div
                      className={`flex flex-col p-3 rounded-lg transition-colors ${
                        isCurrentUser
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Attachment"
                          className="sm:max-w-[200px] rounded-md mb-2 max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          loading="lazy"
                          onClick={() => window.open(message.image, '_blank')}
                        />
                      )}
                      {message.text && (
                        <p className="break-words whitespace-pre-wrap">{message.text}</p>
                      )}
                      {isCurrentUser && (
                        <div className="text-xs text-white/70 mt-1 self-end flex items-center gap-1">
                          {message.status === 'sending' && (
                            <span className="inline-block w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                          )}
                          {message.status === 'sent' && '✓'}
                          {message.status === 'delivered' && '✓✓'}
                          {message.status === 'read' && <span className="text-blue-200">✓✓</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  {isCurrentUser && (
                    <div className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex-shrink-0">
                      <img
                        src={senderProfilePic || "/avatar.png"}
                        alt={`${senderName}'s profile`}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = "/avatar.png";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;