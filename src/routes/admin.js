// AuraLink — Admin Routes (ALL PROTECTED with authMiddleware + adminMiddleware)
import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const admin = new Hono();

// Apply auth + admin middleware to ALL routes in this module
admin.use('*', authMiddleware, adminMiddleware);

// --- Get All Users ---
admin.get('/users', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, username, email, role, pro_status, account_status, created_at, pro_since, pro_expires_at, pro_requested_at FROM users ORDER BY created_at DESC'
    ).all();
    return c.json(results);
  } catch {
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// --- Get Payment Logs ---
admin.get('/payments', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM payment_logs ORDER BY created_at DESC').all();
    return c.json(results);
  } catch {
    return c.json({ error: 'Failed to fetch payment logs' }, 500);
  }
});

// --- Approve/Reject Pro ---
admin.post('/approve-pro/:username', async (c) => {
  const cleanUsername = c.req.param('username').trim().toLowerCase();
  const { status, pro_since, pro_expires_at, logId, adminNotes } = await c.req.json();

  try {
    const proSinceVal = status === 'approved' ? (pro_since || new Date().toISOString()) : null;
    const proExpiresVal = status === 'approved' ? (pro_expires_at || null) : null;
    const logStatusVal = status === 'approved' ? 'approved' : 'rejected';

    const statements = [
      c.env.DB.prepare('UPDATE users SET pro_status = ?, pro_since = ?, pro_expires_at = ? WHERE username = ?')
        .bind(status, proSinceVal, proExpiresVal, cleanUsername)
    ];

    if (logId) {
      statements.push(
        c.env.DB.prepare("UPDATE payment_logs SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .bind(logStatusVal, adminNotes || null, logId)
      );
    } else {
      statements.push(
        c.env.DB.prepare("UPDATE payment_logs SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ? AND status = 'pending'")
          .bind(logStatusVal, adminNotes || null, cleanUsername)
      );
    }

    await c.env.DB.batch(statements);
    return c.json({ message: `Pro status updated to ${status}` });
  } catch (err) {
    console.error('Approve pro error:', err);
    return c.json({ error: 'Failed to update pro status' }, 500);
  }
});

// --- Suspend/Unsuspend User ---
admin.post('/suspend-user/:username', async (c) => {
  const cleanUsername = c.req.param('username').trim().toLowerCase();
  const { status, reason } = await c.req.json();
  try {
    await c.env.DB.prepare('UPDATE users SET account_status = ?, suspension_reason = ? WHERE username = ?')
      .bind(status, reason || null, cleanUsername).run();
    return c.json({ message: `Account status updated to ${status}` });
  } catch {
    return c.json({ error: 'Failed to update account status' }, 500);
  }
});

// --- Get Reports ---
admin.get('/reports', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM profile_reports ORDER BY created_at DESC').all();
    return c.json(results);
  } catch {
    return c.json({ error: 'Failed to fetch reports' }, 500);
  }
});

// --- Update Report ---
admin.post('/reports/:id', async (c) => {
  const { status } = await c.req.json();
  try {
    await c.env.DB.prepare('UPDATE profile_reports SET status = ? WHERE id = ?')
      .bind(status, c.req.param('id')).run();
    return c.json({ message: 'Report updated' });
  } catch {
    return c.json({ error: 'Failed to update report' }, 500);
  }
});

// --- Get Settings ---
admin.get('/settings', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT key, value FROM app_settings').all();
    const settings = {};
    results.forEach(row => { settings[row.key] = row.value; });
    return c.json(settings);
  } catch {
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// --- Update Settings ---
admin.put('/settings', async (c) => {
  try {
    const settings = await c.req.json();
    const statements = Object.entries(settings).map(([key, value]) =>
      c.env.DB.prepare('INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
        .bind(key, String(value))
    );
    await c.env.DB.batch(statements);
    return c.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Settings update error:', err);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

export default admin;
