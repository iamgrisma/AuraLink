/* eslint-disable no-unused-vars, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-useless-assignment */
import { useEffect, useState } from 'react';
import { Link2, User, RefreshCw, Flag } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaGithub, FaLinkedin, FaSpotify, FaDiscord, FaTwitch } from 'react-icons/fa';

const AVAILABLE_ICONS = { FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaGithub, FaLinkedin, FaSpotify, FaDiscord, FaTwitch };
const API_BASE = '/api';
const SOCIAL_COLOR_MAP = {
  instagram: '#e1306c',
  youtube: '#ff0000',
  twitter: '#1d9bf0',
  tiktok: '#ffffff',
  facebook: '#1877f2',
  github: '#f5f5f5',
  linkedin: '#0a66c2'
};
const AVATAR_SIZE_MAP = {
  sm: 64,
  md: 84,
  lg: 108,
  xl: 132
};

export default function PublicBioPage({ username }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Report Modal State
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportStatus, setReportStatus] = useState('');

  const handleReport = async () => {
    if (!reportReason) return;
    setReportStatus('submitting');
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('auralink_user') || 'null');
      await fetch(`${API_BASE}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedUsername: username,
          reason: reportReason,
          reporterId: loggedInUser?.username || null
        })
      });
      setReportStatus('success');
      setTimeout(() => {
        setReportOpen(false);
        setReportStatus('');
        setReportReason('');
      }, 2000);
    } catch(err) {
      setReportStatus('error');
    }
  };

  // Dynamically load Google Analytics if ID is provided
  useEffect(() => {
    if (profile && profile.googleAnalyticsId) {
      const gaId = profile.googleAnalyticsId.trim();
      if (gaId) {
        const scriptId = 'ga-gtag-script';
        const configScriptId = 'ga-config-script';

        // Check if script already exists to avoid duplicates
        let script = document.getElementById(scriptId);
        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
          document.head.appendChild(script);
        }

        let configScript = document.getElementById(configScriptId);
        if (!configScript) {
          configScript = document.createElement('script');
          configScript.id = configScriptId;
          configScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);};
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `;
          document.head.appendChild(configScript);
        }

        return () => {
          const s = document.getElementById(scriptId);
          if (s) s.remove();
          const cs = document.getElementById(configScriptId);
          if (cs) cs.remove();
        };
      }
    }
  }, [profile]);

  // Parse referrer details
  const getReferrer = () => {
    try {
      const ref = document.referrer;
      if (!ref) return 'Direct';
      const url = new URL(ref);
      if (url.hostname.includes('instagram.com')) return 'Instagram';
      if (url.hostname.includes('twitter.com') || url.hostname.includes('t.co') || url.hostname.includes('x.com')) return 'Twitter/X';
      if (url.hostname.includes('tiktok.com')) return 'TikTok';
      if (url.hostname.includes('youtube.com')) return 'YouTube';
      if (url.hostname.includes('facebook.com')) return 'Facebook';
      return url.hostname;
    } catch {
      return 'Direct';
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/profile/${username}`);
        if (!res.ok) {
          throw new Error('Profile not found');
        }
        const data = await res.json();
        setProfile(data);

        // Record the page view in the background
        const referrerVal = getReferrer();
        fetch(`${API_BASE}/analytics/view/${username}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referrer: referrerVal })
        }).catch(err => console.error('Failed to log view analytics:', err));

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      loadProfile();
    }
  }, [username]);

  // Log link click before redirection
  const handleLinkClick = (linkId) => {
    fetch(`${API_BASE}/analytics/click/${username}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId })
    }).catch(err => console.error('Failed to log click analytics:', err));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', background: '#070913', color: '#fff' }}>
        <RefreshCw className="animate-spin" size={24} />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', background: '#070913', color: '#fff', textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--danger)' }}>Profile not found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>The AuraLink profile @{username} does not exist or has been removed.</p>
        <a href="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Create Your Own Bio Page</a>
      </div>
    );
  }

  const isPastelTheme = profile.theme.backgroundValue.includes('pastel') || profile.theme.backgroundValue.includes('#fdf2f8');
  const globalFontColor = profile.theme.fontColor || (isPastelTheme ? '#4c0519' : '#ffffff');

  const getPlatformUrl = (platform, handle) => {
    if (!handle) return '';
    const cleanHandle = handle.trim();
    if (cleanHandle.startsWith('http://') || cleanHandle.startsWith('https://')) {
      return cleanHandle;
    }
    switch (platform) {
      case 'instagram': return `https://instagram.com/${cleanHandle}`;
      case 'youtube': return cleanHandle.startsWith('@') ? `https://youtube.com/${cleanHandle}` : `https://youtube.com/@${cleanHandle}`;
      case 'twitter': return `https://x.com/${cleanHandle}`;
      case 'tiktok': return cleanHandle.startsWith('@') ? `https://tiktok.com/${cleanHandle}` : `https://tiktok.com/@${cleanHandle}`;
      case 'facebook': return `https://facebook.com/${cleanHandle}`;
      case 'github': return `https://github.com/${cleanHandle}`;
      case 'linkedin': return `https://linkedin.com/in/${cleanHandle}`;
      default: return cleanHandle;
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'instagram': return FaInstagram;
      case 'youtube': return FaYoutube;
      case 'twitter': return FaTwitter;
      case 'tiktok': return FaTiktok;
      case 'facebook': return FaFacebook;
      case 'github': return FaGithub;
      case 'linkedin': return FaLinkedin;
      default: return null;
    }
  };

  const showWatermark = profile.proStatus !== 'approved' || profile.showWatermark !== false;
  const avatarInitial = (profile.name || username || '?').trim().charAt(0).toUpperCase();
  const avatarSize = profile.avatarSize || 'md';
  const avatarFrameStyle = profile.avatarFrameStyle || 'animated-border';
  const avatarDisplayMode = profile.avatarDisplayMode || 'image';
  const socialDisplayStyle = profile.socialDisplayStyle || 'icons';
  const socialIconStyle = profile.socialIconStyle || 'brand';
  const socialIconShape = profile.socialIconShape || 'circle';
  const avatarDimension = AVATAR_SIZE_MAP[avatarSize] || AVATAR_SIZE_MAP.md;

  const renderAvatar = () => (
    <div
      className={`avatar-shell avatar-${avatarSize} avatar-${avatarFrameStyle}`}
      style={{ width: avatarDimension, height: avatarDimension }}
    >
      {avatarDisplayMode === 'initial' || !profile.avatarUrl ? (
        <div className="avatar-monogram" style={{ width: '100%', height: '100%' }}>
          <span>{avatarInitial}</span>
        </div>
      ) : (
        <img src={profile.avatarUrl} alt="Avatar" className="avatar-image" />
      )}
    </div>
  );

  const renderSocialItem = ([platform, handle]) => {
    const Icon = getPlatformIcon(platform);
    if (!Icon) return null;

    const brandColor = SOCIAL_COLOR_MAP[platform] || globalFontColor;
    const toneColor = socialIconStyle === 'brand' ? brandColor : globalFontColor;
    const itemClass = `social-item social-layout-${socialDisplayStyle} social-tone-${socialIconStyle} social-shape-${socialIconShape}`;
    const label = platform.charAt(0).toUpperCase() + platform.slice(1);
    const href = getPlatformUrl(platform, handle);
    const handleText = handle.startsWith('@') ? handle : `@${handle}`;

    return (
      <a
        key={platform}
        href={href}
        target="_blank"
        rel="noreferrer"
        className={itemClass}
        style={{
          color: toneColor,
          borderColor: socialIconStyle === 'outline' ? toneColor : undefined,
          backgroundColor: socialIconStyle === 'glass'
            ? 'rgba(255,255,255,0.08)'
            : socialIconStyle === 'brand'
              ? `${brandColor}1a`
              : undefined
        }}
        title={`${label} ${handleText}`}
      >
        <span className="social-icon-mark">
          <Icon />
        </span>
        {(socialDisplayStyle === 'stack' || socialDisplayStyle === 'pills') && (
          <span className="social-text-block">
            <strong>{label}</strong>
            <small>{handleText}</small>
          </span>
        )}
        {socialDisplayStyle === 'text' && (
          <span className="social-text-only">{label} {handleText}</span>
        )}
      </a>
    );
  };

  return (
    <>
      <Helmet>
        <title>{profile.seo?.title || `${profile.name}'s Links`}</title>
        <meta name="description" content={profile.seo?.description || profile.bio} />
        {profile.seo?.allowIndexing === false && <meta name="robots" content="noindex, nofollow" />}
      </Helmet>

      {profile.proStatus === 'approved' && profile.customCss && (
        <style id="custom-css-block">{profile.customCss}</style>
      )}

      <div 
        className="public-profile-wrapper"
        style={{ 
          background: profile.theme.backgroundValue, 
          fontFamily: profile.theme.font === 'monospace' ? 'Courier New, monospace' : profile.theme.font,
          color: globalFontColor 
        }}
      >
        <div className="public-profile-container">
          
          {/* Avatar */}
          {renderAvatar()}

          {/* Info */}
          <h1 className="bio-name">{profile.name}</h1>
          <p className="bio-description" style={{ color: globalFontColor, opacity: 0.8 }}>
            {profile.bio}
          </p>

          {/* Social Links Row */}
          {profile.socialLinksJson && (() => {
            try {
              const socialLinks = JSON.parse(profile.socialLinksJson);
              const activePlatforms = Object.entries(socialLinks).filter(([, value]) => value && value.trim() !== '');
              if (activePlatforms.length === 0) return null;
              return (
                <div className={`social-rail social-rail-${socialDisplayStyle}`}>
                  {activePlatforms.map(renderSocialItem)}
                </div>
              );
            } catch (e) {
              console.error('Error parsing social links json:', e);
              return null;
            }
          })()}

          {/* Links list */}
          <div className="bio-links-container">
            {profile.links.filter(l => {
              if (!l.active) return false;
              if (profile.proStatus === 'approved') {
                const now = new Date();
                if (l.startDate && now < new Date(l.startDate)) return false;
                if (l.endDate && now > new Date(l.endDate)) return false;
              }
              return true;
            }).map((link) => {
              const finalStyleName = link.buttonStyle || profile.theme.buttonStyle || 'solid';
              const buttonClass = `bio-link-button theme-${finalStyleName}-btn`;
              const computedStyles = {};
              
              // Theme Base styles
              if (finalStyleName === 'solid' || finalStyleName === 'pill' || finalStyleName === 'soft') {
                computedStyles.backgroundColor = profile.theme.buttonColor;
                computedStyles.color = profile.theme.buttonTextColor;
              } else if (finalStyleName === 'outline' || finalStyleName === 'dashed') {
                computedStyles.borderColor = profile.theme.buttonColor;
                computedStyles.color = profile.theme.buttonColor;
              }
              
              // Individual link overrides
              if (link.buttonColor) computedStyles.backgroundColor = link.buttonColor;
              if (link.buttonColor && (finalStyleName === 'outline' || finalStyleName === 'dashed')) {
                computedStyles.borderColor = link.buttonColor;
                computedStyles.color = link.buttonColor;
              }
              if (link.buttonTextColor) computedStyles.color = link.buttonTextColor;
              if (link.buttonBorderColor) computedStyles.borderColor = link.buttonBorderColor;
              if (link.buttonBorderRadius) computedStyles.borderRadius = link.buttonBorderRadius;

              const IconComponent = link.iconName && AVAILABLE_ICONS[link.iconName] ? AVAILABLE_ICONS[link.iconName] : null;

              const parsedUrlHostname = (() => {
                try {
                  return new URL(link.url).hostname;
                } catch {
                  return link.url;
                }
              })();

              return (
                <a 
                  key={link.id} 
                  href={link.url}
                  target="_blank" 
                  rel="noreferrer"
                  onClick={() => handleLinkClick(link.id)}
                  className={buttonClass}
                  style={{...computedStyles, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem'}}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {link.imageUrl && <img src={link.imageUrl} alt="icon" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />}
                    {!link.imageUrl && IconComponent && <IconComponent size={20} />}
                    <span>{link.title}</span>
                    {link.linkType === 'product' && (
                      <span style={{ background: 'var(--success)', color: '#000', padding: '2px 6px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                        {link.currency === 'USD' ? '$' : link.currency === 'EUR' ? '€' : '£'}{link.price}
                      </span>
                    )}
                  </div>
                  {link.showUrl && <span style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.2rem' }}>{parsedUrlHostname}</span>}
                </a>
              );
            })}
          </div>

          {profile.links.filter(l => l.active).length === 0 && (
            <div className="public-empty-state">
              <strong>No public links yet</strong>
              <span>This creator is still setting up their page.</span>
            </div>
          )}

          {/* Brand stamp & Report link */}
          <div className="branding-tag" style={{ color: globalFontColor, opacity: 0.6, marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
            {showWatermark && (
              <div>
                <Link2 size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> 
                Powered by <a href="/" style={{ color: globalFontColor, textDecoration: 'underline', fontWeight: '600' }}>AuraLink</a>
              </div>
            )}
            <button 
              onClick={() => setReportOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: 0.7 }}
            >
              <Flag size={10} /> Report this profile
            </button>
          </div>

        </div>
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Report Profile</h3>
            {reportStatus === 'success' ? (
              <p style={{ color: '#4ade80' }}>Report submitted successfully. Our team will review it.</p>
            ) : (
              <>
                <textarea 
                  value={reportReason} 
                  onChange={e => setReportReason(e.target.value)} 
                  placeholder="Why are you reporting this profile? Please provide details."
                  style={{ width: '100%', height: '100px', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setReportOpen(false)} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>Cancel</button>
                  <button onClick={handleReport} disabled={reportStatus === 'submitting' || !reportReason} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', opacity: (reportStatus === 'submitting' || !reportReason) ? 0.5 : 1 }}>
                    {reportStatus === 'submitting' ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
