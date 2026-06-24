import { Hono } from 'hono';
import { cors } from 'hono/cors';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import adminRoutes from './routes/admin.js';
import mediaRoutes from './routes/media.js';
import analyticsRoutes from './routes/analytics.js';

const app = new Hono();

// --- Production CORS Setup ---
// Replaced reflect-all with proper domain restrictions
app.use('/api/*', cors({
  origin: (origin) => {
    // Return only your production domain(s) or localhost for dev
    if (origin && (origin.endsWith('auralink.com') || origin.startsWith('http://localhost:'))) return origin; 
    return null; 
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// --- Request Logging Middleware ---
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  // Ignore static asset logs to reduce noise
  if (c.req.path.startsWith('/api/')) {
    console.log(`${c.req.method} ${c.req.path} - ${c.res.status} [${ms}ms]`);
  }
});

// --- Mount Sub-Apps ---
app.route('/api/auth', authRoutes);
app.route('/api/profile', profileRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/media', mediaRoutes);
app.route('/api/analytics', analyticsRoutes);

app.post('/api/report', async (c) => {
  try {
    const body = await c.req.json();
    const { reportedUsername, reason, reporterId } = body;
    if (!reportedUsername || !reason) return c.json({ error: 'Missing fields' }, 400);
    
    // In a real app, add rate limiting and auth checks here
    await c.env.DB.prepare("INSERT INTO profile_reports (id, reported_username, reporter_id, reason, status) VALUES (?, ?, ?, ?, 'pending')")
      .bind(crypto.randomUUID(), reportedUsername, reporterId || null, reason).run();
    return c.json({ message: 'Report submitted successfully' }, 201);
  } catch (err) {
    console.error('Report error:', err);
    return c.json({ error: 'Failed to submit report' }, 500);
  }
});

// --- SPA Fallback for Frontend ---
// This handles any route that doesn't start with /api and doesn't match an R2 asset.
app.get('*', async (c) => {
  const url = new URL(c.req.url);
  const path = url.pathname;

  // Ignore /api requests that missed routes (return 404 JSON instead of HTML)
  if (path.startsWith('/api')) {
    return c.json({ error: 'API route not found' }, 404);
  }

  // Pass-through static assets directly
  if (path.match(/\.(js|css|ico|png|jpg|jpeg|svg|woff2?|json|txt|webmanifest)$/i) || path.startsWith('/assets/')) {
    const assetReq = new Request(c.req.url, c.req.raw);
    const assetRes = await c.env.ASSETS.fetch(assetReq);
    if (!assetRes.ok) return c.text('Not Found', 404);
    
    // Add strong caching for hashed assets
    const newRes = new Response(assetRes.body, assetRes);
    if (path.startsWith('/assets/')) {
      newRes.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    return newRes;
  }

  try {
    const indexFile = await c.env.ASSETS.fetch(new Request(new URL('/', url)));
    if (!indexFile.ok) return c.text('Not Found', 404);
    
    let html = await indexFile.text();

    // SEO Meta Tag Injection for Profile Pages (SSR)
    if (path.startsWith('/@') && path.length > 2) {
      const username = path.substring(2).toLowerCase();
      try {
        const profile = await c.env.DB.prepare('SELECT name, bio, avatar_url, seo_title, seo_description FROM profiles WHERE username = ?')
          .bind(username).first();

        if (profile) {
          const title = profile.seo_title || `${profile.name} (@${username}) | AuraLink`;
          const desc = profile.seo_description || profile.bio || `Check out ${profile.name}'s links.`;
          const avatar = profile.avatar_url || 'https://via.placeholder.com/150';

          const escapeHtml = (unsafe) => {
            if (!unsafe) return '';
            return unsafe
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
          };

          const safeTitle = escapeHtml(title);
          const safeDesc = escapeHtml(desc);
          const safeAvatar = escapeHtml(avatar);
          const safeUrl = escapeHtml(c.req.url);

          const metaTags = `
            <title>${safeTitle}</title>
            <meta name="description" content="${safeDesc}">
            <meta property="og:title" content="${safeTitle}">
            <meta property="og:description" content="${safeDesc}">
            <meta property="og:image" content="${safeAvatar}">
            <meta property="og:type" content="profile">
            <meta property="og:url" content="${safeUrl}">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${safeTitle}">
            <meta name="twitter:description" content="${safeDesc}">
            <meta name="twitter:image" content="${safeAvatar}">
          `;
          html = html.replace(/<title>.*?<\/title>/, metaTags);
        }
      } catch (err) {
        console.error('SSR Meta Injection Error:', err);
      }
    }

    return c.html(html, 200, {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  } catch (err) {
    console.error('SPA Fallback Error:', err);
    return c.text('Internal Server Error', 500);
  }
});

export default app;
