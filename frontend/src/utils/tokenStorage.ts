// Token storage utilities
// Handles storing and retrieving authentication tokens from localStorage
// Note: localStorage is vulnerable to XSS attacks. In production, consider using httpOnly cookies.

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Validate token format (basic JWT structure check)
 */
function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // JWT tokens have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  // Each part should be base64 encoded
  try {
    parts.forEach(part => {
      if (part.length === 0) {
        throw new Error('Invalid token part');
      }
      // Basic base64 validation
      if (!/^[A-Za-z0-9_-]+$/.test(part)) {
        throw new Error('Invalid token encoding');
      }
    });
    return true;
  } catch {
    return false;
  }
}

export const tokenStorage = {
  getToken: (): string | null => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && isValidTokenFormat(token)) {
        return token;
      }
      // If token is invalid, remove it
      if (token) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
      return null;
    } catch (error) {
      console.error('Error reading token from storage:', error);
      // Clear storage on error
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } catch {
        // Ignore cleanup errors
      }
      return null;
    }
  },

  setToken: (token: string): void => {
    try {
      // Validate token before storing
      if (!isValidTokenFormat(token)) {
        console.error('Invalid token format, not storing');
        return;
      }
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token:', error);
      // If storage is full or unavailable, clear old data and try again
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.setItem(TOKEN_KEY, token);
      } catch {
        console.error('Failed to store token after cleanup');
      }
    }
  },

  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing token from storage:', error);
    }
  },

  getUser: (): any | null => {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) {
        return null;
      }
      
      // Validate JSON structure
      const user = JSON.parse(userStr);
      
      // Basic validation - ensure it's an object
      if (typeof user !== 'object' || user === null || Array.isArray(user)) {
        localStorage.removeItem(USER_KEY);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error reading user from storage:', error);
      // Remove corrupted data
      try {
        localStorage.removeItem(USER_KEY);
      } catch {
        // Ignore cleanup errors
      }
      return null;
    }
  },

  setUser: (user: any): void => {
    try {
      // Validate user object
      if (!user || typeof user !== 'object' || Array.isArray(user)) {
        console.error('Invalid user object, not storing');
        return;
      }
      
      // Sanitize user data - remove any functions or dangerous properties
      const sanitizedUser = JSON.parse(JSON.stringify(user));
      localStorage.setItem(USER_KEY, JSON.stringify(sanitizedUser));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  },
};
