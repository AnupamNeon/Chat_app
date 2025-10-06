const MessageSkeleton = () => {
  // Create an array of 6 items for skeleton messages
  const skeletonMessages = Array(6).fill(null);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background dark:bg-background-dark">
      {skeletonMessages.map((_, idx) => (
        <div
          key={idx}
          className={`flex ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          <div className="flex items-start space-x-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-border-dark animate-pulse"></div>
            <div className="flex flex-col">
              <div className="h-4 w-16 bg-gray-200 dark:bg-border-dark animate-pulse rounded mb-1"></div>
              <div className="w-[200px] h-16 bg-chat-bubble-received dark:bg-chat-bubble-received animate-pulse rounded-2xl"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;