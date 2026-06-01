// AuraLink — Profile-to-Client Mapper
// Eliminates the 30-line mapping block that was copy-pasted 3 times.

/**
 * Map a DB profile row + links rows to the client-facing JSON shape.
 */
export function mapProfileToClient(profile, links) {
  return {
    username: profile.username,
    name: profile.name,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    avatarDisplayMode: profile.avatar_display_mode || 'image',
    avatarSize: profile.avatar_size || 'md',
    avatarFrameStyle: profile.avatar_frame_style || 'animated-border',
    theme: {
      backgroundType: profile.background_type,
      backgroundValue: profile.background_value,
      font: profile.font,
      fontColor: profile.font_color,
      buttonStyle: profile.button_style,
      buttonColor: profile.button_color,
      buttonTextColor: profile.button_text_color,
      buttonBorderColor: profile.button_border_color,
    },
    seo: {
      title: profile.seo_title,
      description: profile.seo_description,
      allowIndexing: Boolean(profile.allow_indexing !== 0),
    },
    proStatus: profile.pro_status,
    proSince: profile.pro_since,
    proExpiresAt: profile.pro_expires_at,
    showWatermark: Boolean(profile.show_watermark !== 0),
    customCss: profile.custom_css,
    socialLinksJson: profile.social_links_json,
    socialDisplayStyle: profile.social_display_style || 'icons',
    socialIconStyle: profile.social_icon_style || 'brand',
    socialIconShape: profile.social_icon_shape || 'circle',
    socialIconColor: profile.social_icon_color,
    googleAnalyticsId: profile.google_analytics_id,
    links: (links || []).map(l => ({
      id: l.id,
      title: l.title,
      url: l.url,
      active: Boolean(l.is_active),
      buttonStyle: l.button_style,
      buttonColor: l.button_color,
      buttonTextColor: l.button_text_color,
      buttonBorderColor: l.button_border_color,
      buttonBorderRadius: l.button_border_radius,
      showUrl: Boolean(l.show_url),
      imageUrl: l.image_url,
      iconName: l.icon_name,
      linkType: l.link_type,
      price: l.price,
      currency: l.currency,
      startDate: l.start_date,
      endDate: l.end_date,
    })),
  };
}

/**
 * SQL to fetch links for a username, ordered by display_order.
 */
export const LINKS_SELECT_COLUMNS = 'id, title, url, is_active, button_style, button_color, button_text_color, button_border_color, button_border_radius, show_url, image_url, icon_name, link_type, price, currency, start_date, end_date';

/**
 * Default profile INSERT values for new users.
 */
export const DEFAULT_PROFILE_SQL = `INSERT INTO profiles (username, name, bio, avatar_url, avatar_display_mode, avatar_size, avatar_frame_style, background_type, background_value, font, button_style, button_color, button_text_color, button_border_color, social_display_style, social_icon_style, social_icon_shape, social_icon_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

export function defaultProfileBindings(username, displayName) {
  return [
    username,
    displayName || username,
    'Welcome to my new link page!',
    '',
    'image', 'md', 'animated-border',
    'gradient', 'linear-gradient(135deg, #0f172a, #1e293b)',
    'Inter', 'solid', '#3b82f6', '#ffffff', 'transparent',
    'icons', 'brand', 'circle', '#ffffff'
  ];
}

export function getBlueprintProfileBindings(username, displayName, blueprint) {
  const name = displayName || username;
  if (blueprint === 'ecommerce') {
    return [
      username, name, 'Shop my latest products and recommendations.', '',
      'image', 'lg', 'animated-border',
      'gradient', 'linear-gradient(135deg, #fdfbfb, #ebedee)',
      'Outfit', 'solid', '#000000', '#ffffff', 'transparent',
      'icons', 'brand', 'circle', '#000000'
    ];
  }
  if (blueprint === 'musician') {
    return [
      username, name, 'Stream my latest tracks and upcoming tour dates.', '',
      'image', 'lg', 'glow',
      'gradient', 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      'Inter', 'glassmorphic', 'rgba(255, 255, 255, 0.1)', '#ffffff', 'rgba(255, 255, 255, 0.2)',
      'icons', 'brand', 'circle', '#ffffff'
    ];
  }
  if (blueprint === 'freelancer') {
    return [
      username, name, 'Freelance Designer & Developer. Available for booking.', '',
      'image', 'md', 'none',
      'flat', '#ffffff',
      'Inter', 'solid', '#1e293b', '#ffffff', 'transparent',
      'icons', 'minimal', 'square', '#1e293b'
    ];
  }
  return defaultProfileBindings(username, name);
}

export function getBlueprintLinks(username, blueprint) {
  if (blueprint === 'ecommerce') {
    return [
      { title: '🛍️ Shop My Store', url: 'https://example.com/store' },
      { title: '🔥 Featured Product', url: 'https://example.com/product' },
      { title: '💌 Join Newsletter', url: 'https://example.com/newsletter' }
    ];
  }
  if (blueprint === 'musician') {
    return [
      { title: '🎵 Listen on Spotify', url: 'https://spotify.com' },
      { title: '▶️ Watch on YouTube', url: 'https://youtube.com' },
      { title: '🎟️ Tour Tickets', url: 'https://example.com/tickets' }
    ];
  }
  if (blueprint === 'freelancer') {
    return [
      { title: '💼 View Portfolio', url: 'https://example.com/portfolio' },
      { title: '📅 Book a Consultation', url: 'https://calendly.com' },
      { title: '✍️ Read My Blog', url: 'https://example.com/blog' }
    ];
  }
  return [
    { title: 'Start here', url: 'https://example.com' }
  ];
}
