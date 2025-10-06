export function formatMessageTime(date) {
  if (!date) return '';
  
  try {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInMs = now - messageDate;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    // Less than 1 minute ago
    if (diffInMs < 60000) {
      return "Just now";
    }

    // Less than 1 hour ago
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / 60000);
      return `${minutes}m ago`;
    }

    // Today - show time
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    // Yesterday
    if (diffInDays < 2) {
      return "Yesterday";
    }

    // This week
    if (diffInDays < 7) {
      return messageDate.toLocaleDateString("en-US", {
        weekday: "short",
      });
    }

    // Older - show date
    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(messageDate.getFullYear() !== now.getFullYear() && { year: "numeric" }),
    });
  } catch (error) {
    console.error("Error formatting message time:", error);
    return '';
  }
}

// Validate email format
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Sanitize user input to prevent XSS attacks
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Debounce function to limit function calls
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function to limit function execution rate
export function throttle(func, limit = 300) {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Format file size to human-readable format
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Check if image is valid base64
export function isValidBase64Image(str) {
  if (!str || typeof str !== 'string') return false;
  
  // Check if it starts with data:image
  if (!str.startsWith('data:image/')) return false;
  
  try {
    // Extract base64 part
    const base64 = str.split(',')[1];
    if (!base64) return false;
    
    // Check if valid base64
    return /^[A-Za-z0-9+/]+={0,2}$/.test(base64);
  } catch {
    return false;
  }
}

// Truncate text with ellipsis
export function truncateText(text, maxLength = 50) {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Get initials from full name
 */
export function getInitials(fullName) {
  if (!fullName || typeof fullName !== 'string') return '?';
  
  const names = fullName.trim().split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format last seen timestamp
 */
export function formatLastSeen(lastSeen) {
  if (!lastSeen) return 'Never';
  
  try {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInMs = now - lastSeenDate;
    const diffInMinutes = diffInMs / 60000;
    const diffInHours = diffInMs / 3600000;
    const diffInDays = diffInMs / 86400000;

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInDays < 7) return `${Math.floor(diffInDays)}d ago`;
    
    return lastSeenDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting last seen:", error);
    return 'Unknown';
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generate random color from string (for avatars)
 */
export function stringToColor(str) {
  if (!str) return '#3B82F6'; // Default blue
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#06B6D4', // cyan
    '#6366F1', // indigo
  ];
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}