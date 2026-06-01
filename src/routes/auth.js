// AuraLink — Auth Routes
import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { setCookie, deleteCookie } from 'hono/cookie';
import { hashPassword, verifyPassword, isLegacyHash } from '../utils/password.js';
import { validateUsername } from '../utils/validators.js';
import { DEFAULT_PROFILE_SQL, defaultProfileBindings, getBlueprintProfileBindings, getBlueprintLinks } from '../utils/mapProfile.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const auth = new Hono();
const authLimiter = rateLimiter({ limit: 10, windowMs: 60 * 1000, message: 'Too many requests. Please try again later.' });

// --- Register ---
auth.post('/register', authLimiter, async (c) => {
  const { username, password, blueprint } = await c.req.json();
  if (!username || !password) {
    return c.json({ error: 'Username and password are required' }, 400);
  }

  const cleanUsername = username.trim().toLowerCase();

  const validation = validateUsername(cleanUsername);
  if (!validation.valid) {
    return c.json({ error: validation.error }, 400);
  }

  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters long.' }, 400);
  }

  try {
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?')
      .bind(cleanUsername).first();

    if (existing) {
      return c.json({ error: 'Username is already taken' }, 409);
    }

    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);

    await c.env.DB.batch([
      c.env.DB.prepare("INSERT INTO users (id, username, password_hash, role, pro_status, account_status) VALUES (?, ?, ?, 'user', 'none', 'active')")
        .bind(userId, cleanUsername, hashedPassword),
      c.env.DB.prepare(DEFAULT_PROFILE_SQL)
        .bind(...getBlueprintProfileBindings(cleanUsername, username, blueprint)),
      ...getBlueprintLinks(cleanUsername, blueprint).map((l, i) =>
        c.env.DB.prepare('INSERT INTO links (id, username, title, url, is_active, display_order) VALUES (?, ?, ?, ?, 1, ?)')
          .bind(crypto.randomUUID(), cleanUsername, l.title, l.url, i)
      )
    ]);

    const secret = c.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
    const token = await sign({ id: userId, username: cleanUsername, role: 'user' }, secret);

    setCookie(c, 'auralink_session', token, {
      httpOnly: true, secure: true, sameSite: 'Strict', path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return c.json({
      message: 'User registered successfully',
      user: { username: cleanUsername, role: 'user', proStatus: 'none' }
    }, 201);

  } catch (err) {
    console.error('Register error:', err);
    return c.json({ error: 'Database execution error' }, 500);
  }
});

// --- Login ---
auth.post('/login', authLimiter, async (c) => {
  const { username, password } = await c.req.json();
  if (!username || !password) {
    return c.json({ error: 'Username and password are required' }, 400);
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    const user = await c.env.DB.prepare('SELECT id, username, password_hash, role, pro_status, account_status FROM users WHERE username = ?')
      .bind(cleanUsername).first();

    if (!user) {
      return c.json({ error: 'Invalid username or password' }, 401);
    }

    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return c.json({ error: 'Invalid username or password' }, 401);
    }

    if (user.account_status === 'suspended') {
      return c.json({ error: 'This account is suspended' }, 403);
    }

    // Rehash legacy passwords on successful login
    if (isLegacyHash(user.password_hash)) {
      const newHash = await hashPassword(password);
      await c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
        .bind(newHash, user.id).run();
    }

    const secret = c.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
    const token = await sign({ id: user.id, username: user.username, role: user.role }, secret);

    setCookie(c, 'auralink_session', token, {
      httpOnly: true, secure: true, sameSite: 'Strict', path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return c.json({
      message: 'Login successful',
      user: { username: user.username, role: user.role, proStatus: user.pro_status }
    });
  } catch (err) {
    console.error('Login error:', err);
    return c.json({ error: 'Database query error' }, 500);
  }
});

// --- Google OAuth ---
auth.post('/google', async (c) => {
  const { credential } = await c.req.json();
  if (!credential) return c.json({ error: 'Missing credential' }, 400);

  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!response.ok) return c.json({ error: 'Invalid Google token' }, 401);
    const googleUser = await response.json();

    const email = googleUser.email;
    const googleId = googleUser.sub;
    const name = googleUser.name;
    const defaultUsername = email.split('@')[0] + Math.floor(Math.random() * 1000);

    let user = await c.env.DB.prepare('SELECT id, username, role, pro_status, account_status FROM users WHERE google_id = ? OR email = ?')
      .bind(googleId, email).first();

    if (!user) {
      const userId = crypto.randomUUID();
      await c.env.DB.batch([
        c.env.DB.prepare("INSERT INTO users (id, username, email, google_id, password_hash, role, pro_status, account_status) VALUES (?, ?, ?, ?, 'oauth_user', 'user', 'none', 'active')")
          .bind(userId, defaultUsername, email, googleId),
        c.env.DB.prepare(DEFAULT_PROFILE_SQL)
          .bind(...defaultProfileBindings(defaultUsername, name))
      ]);
      user = { id: userId, username: defaultUsername, role: 'user', pro_status: 'none', account_status: 'active' };
    }

    if (user.account_status === 'suspended') {
      return c.json({ error: 'This account is suspended' }, 403);
    }

    const secret = c.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
    const token = await sign({ id: user.id, username: user.username, role: user.role }, secret);

    setCookie(c, 'auralink_session', token, {
      httpOnly: true, secure: true, sameSite: 'Strict', path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return c.json({
      message: 'Login successful',
      user: { username: user.username, role: user.role, proStatus: user.pro_status }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    return c.json({ error: 'Google auth failed' }, 500);
  }
});

// --- Check Session ---
auth.get('/me', authMiddleware, async (c) => {
  const userPayload = c.get('user');
  try {
    const user = await c.env.DB.prepare('SELECT username, role, pro_status, account_status FROM users WHERE id = ?')
      .bind(userPayload.id).first();

    if (!user || user.account_status === 'suspended') {
      return c.json({ error: 'User not found or suspended' }, 401);
    }

    return c.json({
      user: { username: user.username, role: user.role, proStatus: user.pro_status }
    });
  } catch {
    return c.json({ error: 'Database error' }, 500);
  }
});

// --- Logout ---
auth.post('/logout', async (c) => {
  deleteCookie(c, 'auralink_session', { path: '/' });
  return c.json({ message: 'Logged out successfully' });
});

export default auth;
