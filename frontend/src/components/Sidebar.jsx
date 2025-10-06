import { useEffect, useState, useMemo } from "react";
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

  // Memoize online users count (excluding current user)
  const onlineUsersCount = useMemo(
    () => onlineUsers.filter((id) => id !== authUser?._id).length,
    [onlineUsers, authUser]
  );

  // Memoize filtered and sorted users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => user._id !== authUser?._id);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // Apply online filter
    if (showOnlineOnly) {
      filtered = filtered.filter(user => onlineUsers.includes(user._id));
    }

    // Sort: online users first, then alphabetically
    return filtered.sort((a, b) => {
      const aOnline = onlineUsers.includes(a._id);
      const bOnline = onlineUsers.includes(b._id);
      
      if (aOnline && !bOnline) return -1;
      if (!aOnline && bOnline) return 1;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [users, onlineUsers, showOnlineOnly, searchQuery, authUser]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-gray-300 dark:border-gray-700 flex flex-col transition-all duration-300 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-300 dark:border-gray-700 w-full p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          <span className="font-semibold text-gray-800 dark:text-gray-100 text-lg hidden lg:block">
            Contacts
          </span>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden lg:block relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="hidden lg:flex items-center justify-between">
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
            <span className={`w-2 h-2 rounded-full ${onlineUsersCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
            {onlineUsersCount} online
          </span>
        </div>
      </div>

      {/* Contact List */}
      <div className="overflow-y-auto w-full py-2 flex-1">
        {filteredUsers.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 px-4">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">
              {searchQuery ? "No contacts found" : showOnlineOnly ? "No online users" : "No contacts available"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const isSelected = selectedUser?._id === user._id;
            
            return (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-3 flex items-center gap-3 transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-500/20 border-l-4 border-blue-500"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent"
                }`}
                aria-label={`Chat with ${user.fullName}`}
              >
                {/* Avatar */}
                <div className="relative mx-auto lg:mx-0 flex-shrink-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={`${user.fullName}'s avatar`}
                    className="w-12 h-12 object-cover rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                    onError={(e) => {
                      e.target.src = "/avatar.png";
                    }}
                  />
                  {isOnline && (
                    <span
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-900"
                      title="Online"
                    />
                  )}
                </div>

                {/* User Info - Hidden on mobile */}
                <div className="hidden lg:block text-left min-w-0 flex-1">
                  <div className="font-medium text-gray-900 dark:text-white truncate text-sm">
                    {user.fullName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                    {isOnline ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Online</span>
                      </>
                    ) : (
                      <span>Offline</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;