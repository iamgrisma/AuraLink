// AuraLink — Rate Limiting Middleware
import { getConnInfo } from 'hono/cloudflare-workers';

// In-memory store for rate limiting (Note: isolated per worker instance)
const rateLimitMap = new Map();

export const rateLimiter = (options = {}) => {
  const limit = options.limit || 10; // max requests
  const windowMs = options.windowMs || 60 * 1000; // 1 minute default
  const message = options.message || 'Too many requests, please try again later.';

  return async (c, next) => {
    // Get IP address from Cloudflare headers, fallback to basic conn info
    const ip = c.req.header('cf-connecting-ip') || 
               c.req.header('x-forwarded-for') || 
               'unknown';
    
    // Bypass rate limiting for unknown IPs in development/local
    if (ip === 'unknown') {
      return next();
    }

    const now = Date.now();
    let record = rateLimitMap.get(ip);

    if (!record) {
      record = { count: 1, resetTime: now + windowMs };
      rateLimitMap.set(ip, record);
    } else {
      if (now > record.resetTime) {
        // Reset window
        record.count = 1;
        record.resetTime = now + windowMs;
      } else {
        record.count++;
      }
    }

    // Clean up old entries to prevent memory leak (random 1% chance on request)
    if (Math.random() < 0.01) {
      const cleanupTime = Date.now();
      for (const [key, val] of rateLimitMap.entries()) {
        if (cleanupTime > val.resetTime) {
          rateLimitMap.delete(key);
        }
      }
    }

    if (record.count > limit) {
      return c.json({ error: message }, 429);
    }

    await next();
  };
};
