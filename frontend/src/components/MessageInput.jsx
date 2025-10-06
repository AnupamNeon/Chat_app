import { useRef, useState, useCallback, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const TYPING_TIMEOUT = 2000; // Stop typing indicator after 2 seconds

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const imageObjectUrlRef = useRef(null); // Track object URL for cleanup
  
  const { sendMessage, selectedUser, startTyping, stopTyping, isSendingMessage } = useChatStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop typing indicator
      stopTyping();
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Revoke object URL to prevent memory leak
      if (imageObjectUrlRef.current) {
        URL.revokeObjectURL(imageObjectUrlRef.current);
        imageObjectUrlRef.current = null;
      }
    };
  }, [stopTyping]);

  const validateFile = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return false;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Please select a valid image type (JPEG, PNG, GIF, WebP)");
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
      // If image is already small enough, skip compression
      if (file.size <= 1024 * 1024) {
        resolve(file);
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src); // ✅ Cleanup on error
        reject(new Error("Failed to load image"));
      };

      img.onload = () => {
        URL.revokeObjectURL(img.src); // ✅ Cleanup after load
        
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let { width, height } = img;

        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
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
          "image/jpeg",
          0.8
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFile(file)) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      // Show loading state
      const loadingToast = toast.loading("Processing image...");
      
      const compressedFile = await compressImage(file);
      const reader = new FileReader();
      
      reader.onloadend = () => {
        toast.dismiss(loadingToast);
        setImagePreview(reader.result);
      };
      
      reader.onerror = () => {
        toast.dismiss(loadingToast);
        toast.error("Failed to read image file");
      };
      
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Image processing failed:", error);
      toast.error("Failed to process image");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    // Revoke object URL if exists
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
      imageObjectUrlRef.current = null;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!text.trim() && !imagePreview) return;

    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    const currentText = text.trim();
    const currentImage = imagePreview;

    try {
      // Clear input immediately for better UX
      setText("");
      setImagePreview(null);
      stopTyping();
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      await sendMessage({ text: currentText, image: currentImage });
    } catch (error) {
      // Error already handled in store
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleTextChange = useCallback((e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Typing indicator logic
    if (newText.trim().length > 0) {
      // Start typing indicator
      startTyping();
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, TYPING_TIMEOUT);
    } else {
      // Stop typing if text is cleared
      stopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [startTyping, stopTyping]);

  return (
    <div className="p-4 sm:p-6 w-full border-t border-border bg-background-secondary transition-all duration-300">
      {imagePreview && (
        <div className="mb-4 flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border-2 border-blue-500 shadow-md hover:opacity-90 transition-opacity"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 border-2 border-white flex items-center justify-center transition-colors duration-200 shadow-md"
              type="button"
              aria-label="Remove image"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Image ready to send
          </p>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3">
          <input
            type="text"
            className="flex-1 border border-border rounded-lg px-4 py-2.5 bg-background-secondary text-text-color placeholder-text-secondary-color focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            placeholder="Type a message..."
            value={text}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            disabled={isSendingMessage}
            aria-label="Type a message"
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={isSendingMessage}
            aria-label="Upload image"
          />
          <button
            type="button"
            className={`p-2.5 rounded-full transition-all duration-200 ${
              imagePreview
                ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md"
                : "text-text-secondary-color hover:bg-blue-50 dark:hover:bg-blue-500/20"
            }`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isSendingMessage}
            aria-label="Attach image"
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="p-2.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          disabled={(!text.trim() && !imagePreview) || !selectedUser || isSendingMessage}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;