import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const scrollToBottom = (behavior = 'smooth') => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  useEffect(() => {
    if (!selectedUser?._id) return;

    let cleanup = null;
    let isMounted = true;

    const initializeChat = async () => {
      if (!isMounted) return;

      try {
        await getMessages(selectedUser._id);
        cleanup = subscribeToMessages();
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
  }, [selectedUser?._id]);

  useEffect(() => {
    if (messages.length === 0) return;

    const isAtBottom = () => {
      if (!containerRef.current) return true;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      return scrollHeight - scrollTop - clientHeight < 100;
    };

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
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">
            Select a user to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <ChatHeader />

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
            >
              <div className="text-center space-y-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl mb-4"
                >
                  💬
                </motion.div>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start a conversation with {selectedUser.fullName}</p>
              </div>
            </motion.div>
          ) : (
            messages.map((message, index) => {
              const senderId = message.senderId?._id || message.senderId;
              const isCurrentUser = senderId === authUser._id;

              const senderProfilePic =
                message.senderId?.profilePic ||
                (isCurrentUser ? authUser.profilePic : selectedUser.profilePic);
              const senderName =
                message.senderId?.fullName ||
                (isCurrentUser ? authUser.fullName : selectedUser.fullName);

              return (
                <motion.div
                  key={message._id || `message-${index}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30,
                    duration: 0.3 
                  }}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-start space-x-2 max-w-[70%]">
                    {!isCurrentUser && (
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-hidden"
                      >
                        <img
                          src={senderProfilePic || "/avatar.png"}
                          alt={`${senderName}'s profile`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/avatar.png";
                          }}
                        />
                      </motion.div>
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
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`flex flex-col p-3 rounded-2xl shadow-sm transition-all duration-200 ${
                          isCurrentUser
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {message.image && (
                          <motion.img
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            src={message.image}
                            alt="Attachment"
                            className="sm:max-w-[200px] rounded-lg mb-2 max-h-48 object-cover cursor-pointer"
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
                              <motion.span 
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="inline-block w-2 h-2 bg-white/50 rounded-full"
                              />
                            )}
                            {message.status === 'sent' && '✓'}
                            {message.status === 'delivered' && '✓✓'}
                            {message.status === 'read' && <span className="text-blue-200">✓✓</span>}
                          </div>
                        )}
                      </motion.div>
                    </div>
                    {isCurrentUser && (
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-hidden"
                      >
                        <img
                          src={senderProfilePic || "/avatar.png"}
                          alt={`${senderName}'s profile`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "/avatar.png";
                          }}
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;