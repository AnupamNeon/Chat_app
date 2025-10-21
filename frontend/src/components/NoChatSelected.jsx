import { motion } from "framer-motion";
import { MessageSquare, Users, Zap } from "lucide-react";

const NoChatSelected = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md text-center space-y-6"
      >
        {/* Animated Icon */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center gap-4 mb-4"
        >
          <div className="relative">
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center shadow-xl"
            >
              <MessageSquare className="w-8 h-8 text-white" />
            </motion.div>
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-1 -right-1 flex h-4 w-4"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
            </motion.span>
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Welcome to Chatty! 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select a conversation from the sidebar to start chatting
          </p>
        </motion.div>

        {/* Features List */}
        <motion.div variants={containerVariants} className="mt-8 space-y-3">
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, x: 5 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0"
            >
              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
            </motion.div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">Real-time Messaging</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Send and receive messages instantly
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, x: 5 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0"
            >
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </motion.div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">Online Status</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                See who's online and available to chat
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, x: 5 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0"
            >
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">Rich Messages</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Share text, images, and more
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-600/10 border border-blue-200 dark:border-blue-500/30"
        >
          <p className="text-sm text-blue-900 dark:text-blue-300">
            💡 <strong>Tip:</strong> Click on any contact to start a conversation
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NoChatSelected;