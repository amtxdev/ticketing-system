/**
 * Frontend input validation utilities
 * Provides client-side validation for forms and user input
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input - basic XSS prevention
 * Removes potentially dangerous characters and HTML tags
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  
  // Remove HTML tags and dangerous characters
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>]/g, "") // Remove remaining angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers (onclick, onerror, etc.)
    .trim();
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  
  if (password.length > 128) {
    return { valid: false, message: "Password must be less than 128 characters" };
  }
  
  return { valid: true };
}

/**
 * Validate email with detailed error message
 */
export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: "Email is required" };
  }
  
  if (email.length > 255) {
    return { valid: false, message: "Email is too long" };
  }
  
  if (!isValidEmail(email)) {
    return { valid: false, message: "Invalid email format" };
  }
  
  return { valid: true };
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

