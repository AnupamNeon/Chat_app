import { useEffect, useState } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const ConnectionStatus = () => {
  const { isConnected, authUser } = useAuthStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    // Show status when connection changes
    if (authUser) {
      setShowStatus(true);
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isOnline, authUser]);

  if (!authUser) return null;

  // Don't show if everything is fine
  if (isOnline && isConnected && !showStatus) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
        !isOnline 
          ? "bg-red-500 text-white" 
          : !isConnected 
            ? "bg-yellow-500 text-white" 
            : "bg-green-500 text-white"
      }`}>
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">No internet</span>
          </>
        ) : !isConnected ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Connecting...</span>
          </>
        ) : (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Connected</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;