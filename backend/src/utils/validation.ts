/**
 * Input validation utilities
 * Provides email validation, input sanitization, and common validation functions
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input - remove potentially dangerous characters
 * Basic XSS prevention for user input
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") {
    return "";
  }
  
  // Remove null bytes and control characters
  return input
    .replace(/\0/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim();
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  
  if (password.length > 128) {
    return { valid: false, message: "Password must be less than 128 characters" };
  }
  
  // Optional: Add more complexity requirements
  // if (!/[A-Z]/.test(password)) {
  //   return { valid: false, message: "Password must contain at least one uppercase letter" };
  // }
  // if (!/[a-z]/.test(password)) {
  //   return { valid: false, message: "Password must contain at least one lowercase letter" };
  // }
  // if (!/[0-9]/.test(password)) {
  //   return { valid: false, message: "Password must contain at least one number" };
  // }
  
  return { valid: true };
}

/**
 * Validate and sanitize email
 */
export function validateAndSanitizeEmail(email: string): { valid: boolean; sanitized?: string; message?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, message: "Email is required" };
  }
  
  const sanitized = sanitizeInput(email.toLowerCase());
  
  if (!sanitized) {
    return { valid: false, message: "Email cannot be empty" };
  }
  
  if (sanitized.length > 255) {
    return { valid: false, message: "Email is too long" };
  }
  
  if (!isValidEmail(sanitized)) {
    return { valid: false, message: "Invalid email format" };
  }
  
  return { valid: true, sanitized };
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string | undefined,
  minLength: number,
  maxLength: number,
  fieldName: string
): { valid: boolean; message?: string } {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    return { valid: false, message: `${fieldName} is required` };
  }
  
  const trimmed = value.trim();
  
  if (trimmed.length < minLength) {
    return { valid: false, message: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (trimmed.length > maxLength) {
    return { valid: false, message: `${fieldName} must be less than ${maxLength} characters` };
  }
  
  return { valid: true };
}

