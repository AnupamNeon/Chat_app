// FILE: g:\Chat-App\frontend\src\App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import ErrorBoundary from "./components/ErrorBoundary";
import ConnectionStatus from "./components/ConnectionStatus"; // ✅ NEW

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading spinner during auth check
  if (isCheckingAuth && !authUser) {
    return (
      <div className={theme}>
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <Loader className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={theme}>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
          <Navbar />
          
          <Routes>
            <Route 
              path="/" 
              element={authUser ? <HomePage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/signup" 
              element={!authUser ? <SignUpPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/login" 
              element={!authUser ? <LoginPage /> : <Navigate to="/" />} 
            />
            <Route 
              path="/settings" 
              element={<SettingsPage />} 
            />
            <Route 
              path="/profile" 
              element={authUser ? <ProfilePage /> : <Navigate to="/login" />} 
            />
            {/* Catch-all route */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>

          {/* ✅ NEW: Connection Status Indicator */}
          <ConnectionStatus />

          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: theme === 'dark' ? '#1f2937' : '#ffffff',
                color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
                border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;