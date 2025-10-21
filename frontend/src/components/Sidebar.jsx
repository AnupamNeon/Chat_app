import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, X } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const onlineUsersCount = useMemo(
    () => onlineUsers.filter((id) => id !== authUser?._id).length,
    [onlineUsers, authUser]
  );

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => user._id !== authUser?._id);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    if (showOnlineOnly) {
      filtered = filtered.filter(user => onlineUsers.includes(user._id));
    }

    return filtered.sort((a, b) => {
      const aOnline = onlineUsers.includes(a._id);
      const bOnline = onlineUsers.includes(b._id);
      
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [users, onlineUsers, showOnlineOnly, searchQuery, authUser]);

  if (isUsersLoading) return <SidebarSkeleton />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    exit: { x: -20, opacity: 0 }
  };

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 w-full p-4 sm:p-5 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Users className="w-6 h-6 text-blue-500" />
          <span className="font-semibold text-gray-800 dark:text-gray-100 text-lg hidden lg:block">
            Contacts
          </span>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="hidden lg:block relative"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex items-center justify-between"
        >
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="w-4 h-4 text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            Show online only
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <motion.span
              animate={{
                scale: onlineUsersCount > 0 ? [1, 1.2, 1] : 1,
                opacity: onlineUsersCount > 0 ? [1, 0.7, 1] : 1
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-2 h-2 rounded-full ${onlineUsersCount > 0 ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            {onlineUsersCount} online
          </span>
        </motion.div>
      </div>

      {/* Contact List */}
      <div className="overflow-y-auto w-full py-2 flex-1">
        <AnimatePresence mode="popLayout">
          {filteredUsers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center text-gray-500 dark:text-gray-400 py-8 px-4"
            >
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">
                {searchQuery ? "No contacts found" : showOnlineOnly ? "No online users" : "No contacts available"}
              </p>
              {searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear search
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredUsers.map((user) => {
                const isOnline = onlineUsers.includes(user._id);
                const isSelected = selectedUser?._id === user._id;
                
                return (
                  <motion.button
                    key={user._id}
                    variants={itemVariants}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full p-3 flex items-center gap-3 transition-all ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-500/20 border-l-4 border-blue-500"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative mx-auto lg:mx-0 flex-shrink-0">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        src={user.profilePic || "/avatar.png"}
                        alt={`${user.fullName}'s avatar`}
                        className="w-12 h-12 object-cover rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                        onError={(e) => {
                          e.target.src = "/avatar.png";
                        }}
                      />
                      {isOnline && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800"
                        />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="hidden lg:block text-left min-w-0 flex-1">
                      <div className="font-medium text-gray-900 dark:text-white truncate text-sm">
                        {user.fullName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                        {isOnline ? (
                          <>
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 bg-green-500 rounded-full"
                            />
                            <span>Online</span>
                          </>
                        ) : (
                          <span>Offline</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};

export default Sidebar;