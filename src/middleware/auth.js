// AuraLink — Auth & Admin Middleware
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';

/**
 * Authentication middleware.
 * Extracts JWT from the HttpOnly cookie, verifies it, and injects the user payload into the context.
 */
export const authMiddleware = async (c, next) => {
  const token = getCookie(c, 'auralink_session');
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  try {
    const secret = c.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
    const payload = await verify(token, secret);
    c.set('user', payload);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};

/**
 * Admin middleware. Must be used AFTER authMiddleware.
 * Checks that the authenticated user has the 'admin' role.
 */
export const adminMiddleware = async (c, next) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Forbidden: admin access required' }, 403);
  }
  await next();
};

/**
 * Ownership middleware factory.
 * Checks that the authenticated user owns the resource identified by :username param.
 * Admins bypass the check.
 */
export function ownershipCheck(paramName = 'username') {
  return async (c, next) => {
    const user = c.get('user');
    const resourceUsername = c.req.param(paramName)?.trim().toLowerCase();
    if (user.username !== resourceUsername && user.role !== 'admin') {
      return c.json({ error: 'Forbidden: you can only access your own resources' }, 403);
    }
    await next();
  };
}

/**
 * Helper to check and enforce membership expiration dynamically.
 */
export async function checkAndEnforceMembership(db, username) {
  try {
    const user = await db.prepare('SELECT pro_status, pro_expires_at FROM users WHERE username = ?')
      .bind(username)
      .first();
    if (user && user.pro_status === 'approved' && user.pro_expires_at) {
      const expiresAt = new Date(user.pro_expires_at);
      if (expiresAt < new Date()) {
        await db.prepare("UPDATE users SET pro_status = 'none' WHERE username = ?")
          .bind(username)
          .run();
        return 'none';
      }
    }
    return user?.pro_status || 'none';
  } catch (err) {
    console.error('Error enforcing membership:', err);
    return 'none';
  }
}
