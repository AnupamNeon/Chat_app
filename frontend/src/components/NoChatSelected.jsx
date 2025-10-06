import { MessageSquare, Users, Zap } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="max-w-md text-center space-y-6">
        {/* Animated Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center animate-bounce transition-colors shadow-lg">
              <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            {/* Ping animation */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
            </span>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            Welcome to Chatty! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">
            Select a conversation from the sidebar to start chatting
          </p>
        </div>

        {/* Features List */}
        <div className="mt-8 space-y-3 text-left">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-colors">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">Real-time Messaging</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Send and receive messages instantly
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-colors">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">Online Status</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                See who's online and available to chat
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">Rich Messages</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Share text, images, and more
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 transition-colors">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            💡 <strong>Tip:</strong> Click on any contact to start a conversation
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;