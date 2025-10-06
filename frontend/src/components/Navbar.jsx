import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="bg-background-secondary border-b border-border fixed w-full top-0 z-40 backdrop-blur-lg bg-opacity-80 transition-all duration-300">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 group hover:opacity-80 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-200">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <h1 className="text-xl font-bold text-text-color tracking-tight">
                Chatty
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-colors duration-200 text-text-color"
            >
              <Settings className="w-5 h-5 text-text-secondary-color" />
              <span className="hidden sm:inline text-sm font-medium">
                Settings
              </span>
            </Link>
            {authUser && (
              <>
                <Link
                  to="/profile"
                  className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-colors duration-200 text-text-color"
                >
                  <User className="w-5 h-5 text-text-secondary-color" />
                  <span className="hidden sm:inline text-sm font-medium">
                    Profile
                  </span>
                </Link>
                <button
                  className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-colors duration-200 text-text-color"
                  onClick={logout}
                >
                  <LogOut className="w-5 h-5 text-text-secondary-color" />
                  <span className="hidden sm:inline text-sm font-medium">
                    Logout
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;