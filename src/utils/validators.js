// AuraLink — Input Validators

const RESERVED_USERNAMES = [
  'admin', 'api', 'images', 'auth', 'dashboard', 'pro', 'settings',
  'login', 'register', 'signup', 'signin', 'logout', 'profile',
  'support', 'help', 'about', 'terms', 'privacy', 'contact',
  'static', 'assets', 'public', 'www', 'mail', 'ftp'
];

/**
 * Validate a URL string.
 */
export function isValidUrl(string) {
  try {
    const url = new URL(string);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate a Google Analytics measurement ID.
 * Accepts G-XXXXXXX (GA4) or UA-XXXXX-Y (Universal Analytics).
 */
export function isValidGAId(id) {
  if (!id) return true; // optional field
  return /^G-[A-Z0-9]+$/.test(id) || /^UA-\d+-\d+$/.test(id);
}

/**
 * Validate a username.
 * Returns { valid: boolean, error?: string }
 */
export function validateUsername(username, minLength = 4) {
  if (!username || username.length < minLength) {
    return { valid: false, error: `Username must be at least ${minLength} characters` };
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain lowercase letters, numbers, and underscores' };
  }
  if (RESERVED_USERNAMES.includes(username)) {
    return { valid: false, error: 'This username is reserved' };
  }
  return { valid: true };
}

/**
 * Sanitize custom CSS to prevent XSS.
 * Strips dangerous patterns while allowing legitimate styling.
 */
export function sanitizeCss(css) {
  if (!css) return css;

  // Remove javascript: URLs
  let clean = css.replace(/javascript\s*:/gi, '');
  // Remove expression() (IE XSS vector)
  clean = clean.replace(/expression\s*\(/gi, '');
  // Remove @import (can load external stylesheets)
  clean = clean.replace(/@import\b/gi, '');
  // Remove url() with external domains (allow relative and data: URIs)
  clean = clean.replace(/url\s*\(\s*(['"]?)https?:\/\/[^)]+\1\s*\)/gi, 'url()');
  // Remove behavior: (IE XSS vector)
  clean = clean.replace(/behavior\s*:/gi, '');
  // Remove -moz-binding (Firefox XSS vector)
  clean = clean.replace(/-moz-binding\s*:/gi, '');
  // Remove vbscript: URLs
  clean = clean.replace(/vbscript\s*:/gi, '');
  // Prevent breaking out of <style> blocks
  clean = clean.replace(/<\/?style.*?>/gi, '');
  // Prevent general HTML tag injection
  clean = clean.replace(/<.*?>/g, '');

  return clean;
}

/**
 * Validate that socialLinksJson is safe.
 * Returns parsed object or empty object.
 */
export function parseSocialLinks(jsonStr) {
  if (!jsonStr) return {};
  try {
    const obj = JSON.parse(jsonStr);
    if (typeof obj !== 'object' || Array.isArray(obj)) return {};
    // Validate each value is a simple string (username or URL)
    const clean = {};
    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'string' && val.length <= 200) {
        clean[key] = val;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

/**
 * Allowed MIME types for image uploads.
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
];

/**
 * Max file size in bytes (5MB).
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate an uploaded file.
 * Returns { valid: boolean, error?: string }
 */
export function validateUploadedFile(file) {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'No valid file uploaded' };
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: `File type '${file.type}' is not allowed. Accepted: JPEG, PNG, WebP, GIF, SVG.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum is 5MB.` };
  }
  return { valid: true };
}
