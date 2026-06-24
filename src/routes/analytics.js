// AuraLink — Analytics Routes
import { Hono } from 'hono';
import { authMiddleware, ownershipCheck } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimit.js';

const analytics = new Hono();
const analyticsLimiter = rateLimiter({ limit: 100, windowMs: 60 * 1000, message: 'Too many requests' });

// --- Record Page View (Public) ---
analytics.post('/view/:username?', analyticsLimiter, async (c) => {
  let body = {};
  try { body = await c.req.json(); } catch {}
  const username = c.req.param('username') || body.username;
  if (!username) return c.json({ error: 'Username required' }, 400);
  
  const { referrer, deviceType } = body;
  const country = c.req.header('cf-ipcountry') || body.country || 'Unknown';
  const userAgent = c.req.header('user-agent') || body.userAgent || '';
  
  const cleanUsername = username.trim().toLowerCase();
  try {
    const user = await c.env.DB.prepare('SELECT id, account_status FROM users WHERE username = ?')
      .bind(cleanUsername).first();
      
    if (!user || user.account_status === 'suspended') {
      return c.json({ error: 'Profile unavailable' }, 404);
    }
    
    await c.env.DB.prepare('INSERT INTO analytics_views (id, username, referrer, user_agent, device_type, country) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), cleanUsername, referrer || 'direct', userAgent || '', deviceType || 'desktop', country || 'Unknown').run();
      
    return c.json({ success: true }, 201);
  } catch (err) {
    console.error('Analytics view error:', err);
    return c.json({ error: 'Failed to record view' }, 500);
  }
});

// --- Record Link Click (Public) ---
analytics.post('/click/:username?', analyticsLimiter, async (c) => {
  let body = {};
  try { body = await c.req.json(); } catch {}
  const username = c.req.param('username') || body.username;
  const { linkId, linkUrl } = body;
  if (!username || !linkId) return c.json({ error: 'Username and linkId required' }, 400);
  
  const cleanUsername = username.trim().toLowerCase();
  try {
    const user = await c.env.DB.prepare('SELECT id, account_status FROM users WHERE username = ?')
      .bind(cleanUsername).first();
      
    if (!user || user.account_status === 'suspended') {
      return c.json({ error: 'Profile unavailable' }, 404);
    }
    
    await c.env.DB.prepare('INSERT INTO analytics_clicks (id, username, link_id, link_url) VALUES (?, ?, ?, ?)')
      .bind(crypto.randomUUID(), cleanUsername, linkId, linkUrl || '').run();
      
    return c.json({ success: true }, 201);
  } catch (err) {
    console.error('Analytics click error:', err);
    return c.json({ error: 'Failed to record click' }, 500);
  }
});

// --- Get Analytics Report (Protected) ---
analytics.get('/report/:username', authMiddleware, ownershipCheck(), async (c) => {
  const cleanUsername = c.req.param('username').trim().toLowerCase();
  
  try {
    // We moved these from in-memory JS array aggregations to SQL aggregations for scalability.
    
    // Total views & clicks
    const totalViewsRow = await c.env.DB.prepare('SELECT COUNT(*) as total FROM analytics_views WHERE username = ?').bind(cleanUsername).first();
    const totalClicksRow = await c.env.DB.prepare('SELECT COUNT(*) as total FROM analytics_clicks WHERE username = ?').bind(cleanUsername).first();
    
    const viewsCount = totalViewsRow?.total || 0;
    const clicksCount = totalClicksRow?.total || 0;
    const ctr = viewsCount > 0 ? ((clicksCount / viewsCount) * 100).toFixed(1) : '0.0';
    
    // Views by date (last 30 days)
    const { results: viewsByDateData } = await c.env.DB.prepare(`
      SELECT date(timestamp) as date, COUNT(*) as count 
      FROM analytics_views 
      WHERE username = ? AND timestamp > datetime('now', '-30 days')
      GROUP BY date
      ORDER BY date ASC
    `).bind(cleanUsername).all();
    
    // Convert to the exact format frontend expects (array of arrays: [dateString, count])
    const viewsByDate = viewsByDateData.map(row => [row.date, row.count]);
    
    // Referrers
    const { results: referrersData } = await c.env.DB.prepare(`
      SELECT referrer, COUNT(*) as count 
      FROM analytics_views 
      WHERE username = ? 
      GROUP BY referrer 
      ORDER BY count DESC 
      LIMIT 10
    `).bind(cleanUsername).all();
    
    // Device Types
    const { results: devicesData } = await c.env.DB.prepare(`
      SELECT device_type as deviceType, COUNT(*) as count 
      FROM analytics_views 
      WHERE username = ? 
      GROUP BY device_type 
      ORDER BY count DESC
    `).bind(cleanUsername).all();
    
    // Countries
    const { results: countriesData } = await c.env.DB.prepare(`
      SELECT country, COUNT(*) as count 
      FROM analytics_views 
      WHERE username = ? 
      GROUP BY country 
      ORDER BY count DESC 
      LIMIT 10
    `).bind(cleanUsername).all();
    
    // Clicks per link
    const { results: clicksByLink } = await c.env.DB.prepare(`
      SELECT link_id as linkId, COUNT(*) as count 
      FROM analytics_clicks 
      WHERE username = ? 
      GROUP BY link_id 
      ORDER BY count DESC
    `).bind(cleanUsername).all();

    const { results: userLinks } = await c.env.DB.prepare('SELECT id, title, url FROM links WHERE username = ? ORDER BY display_order ASC').bind(cleanUsername).all();
    const linkPerformance = userLinks.map(link => {
      const clickData = clicksByLink.find(c => c.linkId === link.id);
      return { id: link.id, title: link.title, url: link.url, clicks: clickData ? clickData.count : 0 };
    }).sort((a, b) => b.clicks - a.clicks);

    return c.json({
      metrics: {
        totalViews: viewsCount,
        totalClicks: clicksCount,
        ctr: ctr
      },
      viewsByDate,
      referralData: referrersData.map(r => {
        const total = referrersData.reduce((s, x) => s + x.count, 0) || 1;
        return {
          source: r.referrer,
          count: r.count,
          percentage: ((r.count / total) * 100).toFixed(1)
        };
      }),
      devices: devicesData,
      countries: countriesData,
      clicksByLink,
      linkPerformance
    });
    
  } catch (err) {
    console.error('Analytics report error:', err);
    return c.json({ error: 'Failed to generate analytics report' }, 500);
  }
});

export default analytics;
