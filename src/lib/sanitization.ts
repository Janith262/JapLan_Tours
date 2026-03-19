/**
 * Basic input sanitization utility to prevent XSS and keep data clean.
 */

export const sanitizeString = (str: string, maxLength = 1000): string => {
  if (!str) return "";
  
  // 1. Trim whitespace
  let sanitized = str.trim();
  
  // 2. Remove HTML tags using regex (simple version)
  sanitized = sanitized.replace(/<[^>]*>?/gm, '');
  
  // 3. Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

/**
 * Specifically for names or short fields
 */
export const sanitizeName = (name: string): string => {
  return sanitizeString(name, 100);
};

/**
 * For long descriptions or comments
 */
export const sanitizeLongText = (text: string): string => {
  return sanitizeString(text, 5000);
};
