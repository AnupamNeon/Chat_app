import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const fileInputRef = useRef(null);
  const imageObjectUrlRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageObjectUrlRef.current) {
        URL.revokeObjectURL(imageObjectUrlRef.current);
        imageObjectUrlRef.current = null;
      }
    };
  }, []);

  const validateImage = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return false;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Please select a JPEG, PNG, GIF, or WebP image");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size must be less than 5MB");
      return false;
    }

    return true;
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      // If image is small enough, skip compression
      if (file.size <= 1024 * 1024) {
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src); // ✅ Cleanup on error
        reject(new Error("Failed to load image"));
      };
      
      img.onload = () => {
        URL.revokeObjectURL(img.src); // ✅ Cleanup after load
        
        const MAX_SIZE = 800;
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > MAX_SIZE) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Image compression failed"));
            }
          },
          'image/jpeg',
          0.85
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateImage(file)) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const loadingToast = toast.loading("Processing image...");
      
      const compressedFile = await compressImage(file);
      
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result;
        setSelectedImg(base64Image);
        
        try {
          await updateProfile({ profilePic: base64Image });
          toast.dismiss(loadingToast);
          setSelectedImg(null); // Reset after successful upload
        } catch (error) {
          toast.dismiss(loadingToast);
          // Error already handled in store
        }
      };
      
      reader.onerror = () => {
        toast.dismiss(loadingToast);
        toast.error("Failed to read image file");
      };
      
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Image processing failed:", error);
      toast.error(error.message || "Failed to process image");
    } finally {
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAvatarClick = () => {
    if (!isUpdatingProfile) {
      fileInputRef.current?.click();
    }
  };

  if (!authUser) {
    return (
      <div className="h-screen pt-20 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-8 shadow-lg transition-colors">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Your profile information</p>
          </div>

          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 transition-all">
                <img
                  src={selectedImg || authUser.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="w-full h-full object-cover cursor-pointer transition-all duration-200 group-hover:opacity-80"
                  onClick={handleAvatarClick}
                />
              </div>
              
              {/* Overlay */}
              <div 
                className={`absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                  isUpdatingProfile ? "opacity-100" : ""
                }`}
                onClick={handleAvatarClick}
              >
                {isUpdatingProfile ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isUpdatingProfile 
                  ? "Uploading..." 
                  : "Click on the avatar to update your photo"
                }
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Max size: 5MB • JPG, PNG, GIF, WebP
              </p>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <div className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                {authUser.fullName}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <div className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
                {authUser.email}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 transition-colors">
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Account Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                <span className="text-gray-500 dark:text-gray-400">Member Since</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {new Date(authUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500 dark:text-gray-400">Account Status</span>
                <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;