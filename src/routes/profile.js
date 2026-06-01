// AuraLink — Profile Routes
import { Hono } from 'hono';
import { authMiddleware, ownershipCheck, checkAndEnforceMembership } from '../middleware/auth.js';
import { mapProfileToClient, LINKS_SELECT_COLUMNS, DEFAULT_PROFILE_SQL, defaultProfileBindings } from '../utils/mapProfile.js';
import { isValidUrl, isValidGAId, sanitizeCss, validateUsername } from '../utils/validators.js';

const profile = new Hono();

// --- Check Username Availability ---
profile.get('/check/:username', async (c) => {
  const cleanUsername = c.req.param('username').trim().toLowerCase();
  try {
    const user = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?')
      .bind(cleanUsername).first();

    let suggestions = [];
    if (user) {
      suggestions = [
        cleanUsername + Math.floor(Math.random() * 999),
        cleanUsername + '_',
        cleanUsername + 'official'
      ];
    }
    return c.json({ available: !user, suggestions });
  } catch {
    return c.json({ error: 'Error checking username' }, 500);
  }
});

// --- Get Public Profile ---
profile.get('/:username', async (c) => {
  const cleanUsername = c.req.param('username').trim().toLowerCase();

  try {
    await checkAndEnforceMembership(c.env.DB, cleanUsername);

    let profileData = await c.env.DB.prepare(`
      SELECT p.*, u.account_status, u.pro_status, u.pro_since, u.pro_expires_at
      FROM profiles p
      JOIN users u ON p.username = u.username
      WHERE p.username = ?
    `).bind(cleanUsername).first();

    if (!profileData) {
      const user = await c.env.DB.prepare('SELECT account_status FROM users WHERE username = ?')
        .bind(cleanUsername).first();

      if (user) {
        await c.env.DB.batch([
          c.env.DB.prepare(DEFAULT_PROFILE_SQL)
            .bind(...defaultProfileBindings(cleanUsername)),
          c.env.DB.prepare('INSERT INTO links (id, username, title, url, is_active, display_order) VALUES (?, ?, ?, ?, 1, 0)')
            .bind(crypto.randomUUID(), cleanUsername, 'Start here', 'https://example.com')
        ]);

        profileData = await c.env.DB.prepare(`
          SELECT p.*, u.account_status, u.pro_status, u.pro_since, u.pro_expires_at
          FROM profiles p JOIN users u ON p.username = u.username
          WHERE p.username = ?
        `).bind(cleanUsername).first();
      } else {
        return c.json({ error: 'Profile not found' }, 404);
      }
    }

    if (profileData.account_status === 'suspended') {
      return c.json({ error: 'This profile has been suspended.', isSuspended: true }, 403);
    }

    const { results: links } = await c.env.DB.prepare(`SELECT ${LINKS_SELECT_COLUMNS} FROM links WHERE username = ? ORDER BY display_order ASC`)
      .bind(cleanUsername).all();

    return c.json(mapProfileToClient(profileData, links));
  } catch (err) {
    console.error('Profile fetch error:', err);
    return c.json({ error: 'Error fetching profile' }, 500);
  }
});

// --- Update Profile (Protected) ---
profile.put('/:username', authMiddleware, ownershipCheck(), async (c) => {
  const cleanUsername = c.req.param('username').trim().toLowerCase();
  const body = await c.req.json();
  const { name, bio, avatarUrl, avatarDisplayMode, avatarSize, avatarFrameStyle,
    theme, seo, links, googleAnalyticsId, showWatermark, customCss,
    socialLinksJson, socialDisplayStyle, socialIconStyle, socialIconShape, socialIconColor } = body;

  // Validate inputs
  if (googleAnalyticsId && !isValidGAId(googleAnalyticsId)) {
    return c.json({ error: 'Invalid Google Analytics ID format' }, 400);
  }

  if (links && Array.isArray(links)) {
    for (const link of links) {
      if (link.url && !isValidUrl(link.url)) {
        return c.json({ error: `Invalid URL for link: ${link.title || link.url}` }, 400);
      }
      if (link.imageUrl && !isValidUrl(link.imageUrl) && !link.imageUrl.startsWith('/')) {
        return c.json({ error: `Invalid image URL for link: ${link.title}` }, 400);
      }
    }
  }

  // Sanitize custom CSS
  const safeCss = sanitizeCss(customCss);

  try {
    // Update profile
    await c.env.DB.prepare(`
      UPDATE profiles SET
        name = COALESCE(?, name), bio = COALESCE(?, bio), avatar_url = COALESCE(?, avatar_url),
        avatar_display_mode = COALESCE(?, avatar_display_mode), avatar_size = COALESCE(?, avatar_size),
        avatar_frame_style = COALESCE(?, avatar_frame_style),
        background_type = COALESCE(?, background_type), background_value = COALESCE(?, background_value),
        font = COALESCE(?, font), font_color = COALESCE(?, font_color),
        button_style = COALESCE(?, button_style), button_color = COALESCE(?, button_color),
        button_text_color = COALESCE(?, button_text_color), button_border_color = COALESCE(?, button_border_color),
        seo_title = COALESCE(?, seo_title), seo_description = COALESCE(?, seo_description),
        allow_indexing = COALESCE(?, allow_indexing), google_analytics_id = COALESCE(?, google_analytics_id),
        show_watermark = COALESCE(?, show_watermark), custom_css = COALESCE(?, custom_css),
        social_links_json = COALESCE(?, social_links_json),
        social_display_style = COALESCE(?, social_display_style), social_icon_style = COALESCE(?, social_icon_style),
        social_icon_shape = COALESCE(?, social_icon_shape), social_icon_color = COALESCE(?, social_icon_color),
        updated_at = CURRENT_TIMESTAMP
      WHERE username = ?
    `).bind(
      name, bio, avatarUrl,
      avatarDisplayMode, avatarSize, avatarFrameStyle,
      theme?.backgroundType, theme?.backgroundValue, theme?.font, theme?.fontColor,
      theme?.buttonStyle, theme?.buttonColor, theme?.buttonTextColor, theme?.buttonBorderColor,
      seo?.title, seo?.description, seo?.allowIndexing === false ? 0 : 1,
      googleAnalyticsId,
      showWatermark === undefined ? null : (showWatermark ? 1 : 0),
      safeCss === undefined ? null : safeCss,
      socialLinksJson === undefined ? null : socialLinksJson,
      socialDisplayStyle, socialIconStyle, socialIconShape, socialIconColor,
      cleanUsername
    ).run();

    // Sync links: diff-based instead of delete-all
    if (links && Array.isArray(links)) {
      const { results: existingLinks } = await c.env.DB.prepare('SELECT id FROM links WHERE username = ?')
        .bind(cleanUsername).all();
      const existingIds = new Set(existingLinks.map(l => l.id));
      const incomingIds = new Set(links.map(l => l.id).filter(Boolean));

      const statements = [];

      // Delete removed links
      for (const existingId of existingIds) {
        if (!incomingIds.has(existingId)) {
          statements.push(
            c.env.DB.prepare('DELETE FROM links WHERE id = ? AND username = ?').bind(existingId, cleanUsername)
          );
        }
      }

      // Upsert incoming links
      links.forEach((link, idx) => {
        const linkId = link.id || crypto.randomUUID();
        if (existingIds.has(link.id)) {
          // Update existing
          statements.push(
            c.env.DB.prepare(`UPDATE links SET title=?, url=?, is_active=?, display_order=?,
              button_style=?, button_color=?, button_text_color=?, button_border_color=?,
              button_border_radius=?, show_url=?, image_url=?, icon_name=?,
              link_type=?, price=?, currency=?, start_date=?, end_date=?
              WHERE id=? AND username=?`).bind(
              link.title, link.url, link.active ? 1 : 0, idx,
              link.buttonStyle || null, link.buttonColor || null,
              link.buttonTextColor || null, link.buttonBorderColor || null,
              link.buttonBorderRadius || null, link.showUrl ? 1 : 0,
              link.imageUrl || null, link.iconName || null,
              link.linkType || 'link', link.price || null, link.currency || 'USD',
              link.startDate || null, link.endDate || null,
              link.id, cleanUsername
            )
          );
        } else {
          // Insert new
          statements.push(
            c.env.DB.prepare('INSERT INTO links (id, username, title, url, is_active, display_order, button_style, button_color, button_text_color, button_border_color, button_border_radius, show_url, image_url, icon_name, link_type, price, currency, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
              .bind(
                linkId, cleanUsername, link.title, link.url, link.active ? 1 : 0, idx,
                link.buttonStyle || null, link.buttonColor || null,
                link.buttonTextColor || null, link.buttonBorderColor || null,
                link.buttonBorderRadius || null, link.showUrl ? 1 : 0,
                link.imageUrl || null, link.iconName || null,
                link.linkType || 'link', link.price || null, link.currency || 'USD',
                link.startDate || null, link.endDate || null
              )
          );
        }
      });

      if (statements.length > 0) {
        await c.env.DB.batch(statements);
      }
    }

    // Fetch and return updated profile
    const updatedProfile = await c.env.DB.prepare('SELECT * FROM profiles WHERE username = ?')
      .bind(cleanUsername).first();
    const { results: dbLinks } = await c.env.DB.prepare(`SELECT ${LINKS_SELECT_COLUMNS} FROM links WHERE username = ? ORDER BY display_order ASC`)
      .bind(cleanUsername).all();

    return c.json({ message: 'Profile updated successfully', profile: mapProfileToClient(updatedProfile, dbLinks) });
  } catch (err) {
    console.error('Profile update error:', err);
    return c.json({ error: 'Error saving profile modifications' }, 500);
  }
});

// --- Change Username (Protected) ---
profile.post('/:username/change-username', authMiddleware, ownershipCheck(), async (c) => {
  const currentUsername = c.req.param('username').trim().toLowerCase();
  const { newUsername } = await c.req.json();

  if (!newUsername) return c.json({ error: 'New username is required' }, 400);
  const cleanNewUsername = newUsername.trim().toLowerCase();

  try {
    const userRecord = await c.env.DB.prepare('SELECT id, pro_status, last_username_change FROM users WHERE username = ?')
      .bind(currentUsername).first();
    if (!userRecord) return c.json({ error: 'User not found' }, 404);

    const isPro = userRecord.pro_status === 'approved';
    const minLength = isPro ? 3 : 5;

    const validation = validateUsername(cleanNewUsername, minLength);
    if (!validation.valid) return c.json({ error: validation.error }, 400);

    // Cooldown check
    if (userRecord.last_username_change) {
      const lastChange = new Date(userRecord.last_username_change);
      const diffHours = (Date.now() - lastChange.getTime()) / (1000 * 60 * 60);
      const requiredWait = isPro ? 24 : 30 * 24;
      if (diffHours < requiredWait) {
        return c.json({ error: `You can only change your username once every ${isPro ? '24 hours' : '30 days'}.` }, 429);
      }
    }

    const existingUser = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?')
      .bind(cleanNewUsername).first();
    if (existingUser) {
      return c.json({ error: 'Username is already taken', suggestions: [cleanNewUsername + Math.floor(Math.random() * 999)] }, 409);
    }

    await c.env.DB.batch([
      c.env.DB.prepare('UPDATE users SET username = ?, last_username_change = CURRENT_TIMESTAMP WHERE username = ?').bind(cleanNewUsername, currentUsername),
      c.env.DB.prepare('UPDATE profiles SET username = ? WHERE username = ?').bind(cleanNewUsername, currentUsername),
      c.env.DB.prepare('UPDATE links SET username = ? WHERE username = ?').bind(cleanNewUsername, currentUsername),
      c.env.DB.prepare('UPDATE analytics_views SET username = ? WHERE username = ?').bind(cleanNewUsername, currentUsername),
      c.env.DB.prepare('UPDATE analytics_clicks SET username = ? WHERE username = ?').bind(cleanNewUsername, currentUsername),
      c.env.DB.prepare('UPDATE profile_reports SET reported_username = ? WHERE reported_username = ?').bind(cleanNewUsername, currentUsername),
      c.env.DB.prepare('UPDATE media_files SET username = ? WHERE username = ?').bind(cleanNewUsername, currentUsername),
      c.env.DB.prepare('UPDATE payment_logs SET username = ? WHERE username = ?').bind(cleanNewUsername, currentUsername)
    ]);

    return c.json({ message: 'Username updated successfully', username: cleanNewUsername });
  } catch (err) {
    console.error('Username change error:', err);
    return c.json({ error: 'Failed to update username' }, 500);
  }
});

// --- Request Pro (Protected) ---
profile.post('/:username/request-pro', authMiddleware, ownershipCheck(), async (c) => {
  const cleanUsername = c.req.param('username').trim().toLowerCase();
  const { txnId, receiptImageUrl } = await c.req.json();

  try {
    const priceRow = await c.env.DB.prepare("SELECT value FROM app_settings WHERE key = 'membership_price_nrs'").first();
    const price = priceRow ? parseFloat(priceRow.value) : 100.0;

    await c.env.DB.batch([
      c.env.DB.prepare("UPDATE users SET pro_status = 'pending', pro_requested_at = CURRENT_TIMESTAMP WHERE username = ?")
        .bind(cleanUsername),
      c.env.DB.prepare("INSERT INTO payment_logs (id, username, amount, currency, transaction_id, payment_method, status, receipt_image_url) VALUES (?, ?, ?, 'NPR', ?, 'QR Code', 'pending', ?)")
        .bind(crypto.randomUUID(), cleanUsername, price, txnId || null, receiptImageUrl || null)
    ]);

    return c.json({ message: 'Pro status requested' });
  } catch (err) {
    console.error('Pro request error:', err);
    return c.json({ error: 'Error requesting pro' }, 500);
  }
});

// --- Report Profile ---
profile.post('/report', async (c) => {
  const { reportedUsername, reason, reporterId } = await c.req.json();
  if (!reportedUsername || !reason) return c.json({ error: 'Missing fields' }, 400);

  try {
    await c.env.DB.prepare("INSERT INTO profile_reports (id, reported_username, reporter_id, reason, status) VALUES (?, ?, ?, ?, 'pending')")
      .bind(crypto.randomUUID(), reportedUsername, reporterId || null, reason).run();
    return c.json({ message: 'Report submitted successfully' }, 201);
  } catch (err) {
    console.error('Report error:', err);
    return c.json({ error: 'Failed to submit report' }, 500);
  }
});

export default profile;
