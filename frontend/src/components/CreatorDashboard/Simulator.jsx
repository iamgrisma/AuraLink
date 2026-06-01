import { Link2, Eye, X } from 'lucide-react';
import { FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaGithub, FaLinkedin, FaSpotify, FaDiscord, FaTwitch } from 'react-icons/fa';

const AVAILABLE_ICONS = { FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaGithub, FaLinkedin, FaSpotify, FaDiscord, FaTwitch };
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
  sm: 58,
  md: 74,
  lg: 96,
  xl: 114
};

import { useDashboard } from './context/DashboardContext';

export default function Simulator() {
  const { profile, username, proStatus, showMobilePreview, setShowMobilePreview } = useDashboard();
  if (!profile) return null;

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
      style={{ width: avatarDimension, height: avatarDimension, margin: '0 auto' }}
    >
      {avatarDisplayMode === 'initial' || !profile.avatarUrl ? (
        <div className="avatar-monogram" style={{ width: '100%', height: '100%' }}>
          <span>{avatarInitial}</span>
        </div>
      ) : (
        <img src={profile.avatarUrl} alt="Avatar" className="avatar-image" style={{ margin: 0 }} />
      )}
    </div>
  );

  const renderSocialItem = ([platform, handle]) => {
    const Icon = AVAILABLE_ICONS[{
      instagram: 'FaInstagram',
      youtube: 'FaYoutube',
      twitter: 'FaTwitter',
      tiktok: 'FaTiktok',
      facebook: 'FaFacebook',
      github: 'FaGithub',
      linkedin: 'FaLinkedin'
    }[platform]];
    if (!Icon) return null;

    const fontColor = profile.theme.backgroundValue.includes('#fdf2f8') ? '#4c0519' : '#ffffff';
    const brandColor = SOCIAL_COLOR_MAP[platform] || fontColor;
    const toneColor = socialIconStyle === 'brand' ? brandColor : (socialIconStyle === 'custom' ? (profile.socialIconColor || fontColor) : fontColor);
    const label = platform.charAt(0).toUpperCase() + platform.slice(1);
    const handleText = handle.startsWith('@') ? handle : `@${handle}`;

    return (
      <a
        key={platform}
        href="#"
        onClick={(e) => e.preventDefault()}
        rel="noopener noreferrer nofollow"
        className={`social-item social-layout-${socialDisplayStyle} social-tone-${socialIconStyle} social-shape-${socialIconShape}`}
        style={{
          color: toneColor,
          borderColor: socialIconStyle === 'outline' ? toneColor : undefined,
          backgroundColor: socialIconStyle === 'glass'
            ? 'rgba(255,255,255,0.08)'
            : socialIconStyle === 'brand'
              ? `${brandColor}1a`
              : undefined
        }}
      >
        <span className="social-icon-mark">
          <Icon size={14} />
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
    <div className={`preview-pane ${showMobilePreview ? 'active' : ''}`}>
      <div className="mobile-preview-header">
        <h3>Live Simulator</h3>
        <button onClick={() => setShowMobilePreview(false)} className="btn-close-preview" title="Close Preview">
          <X size={20} />
        </button>
      </div>

      <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="desktop-preview-label">
        <Eye size={14} /> LIVE PREVIEW (SIMULATOR)
      </div>
      
      <div className="phone-mockup">
        <div className="phone-speaker"></div>
        <div 
          className="phone-screen" 
          style={{ 
            background: profile.theme.backgroundValue, 
            fontFamily: profile.theme.font === 'monospace' ? 'Courier New, monospace' : profile.theme.font,
            color: profile.theme.backgroundValue.includes('#fdf2f8') ? '#4c0519' : '#ffffff' 
          }}
        >
          {profile.proStatus === 'approved' && profile.customCss && (
            <style id="custom-css-simulator">{profile.customCss}</style>
          )}

          {/* Avatar */}
          {renderAvatar()}

          <h2 className="bio-name" style={{ marginTop: '1rem' }}>{profile.name || `@${username}`}</h2>
          <p className="bio-description" style={{ color: profile.theme.backgroundValue.includes('#fdf2f8') ? 'rgba(76,5,25,0.7)' : 'rgba(255,255,255,0.7)' }}>
            {profile.bio || 'Enter details on the left to customize...'}
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
            } catch {
              return null;
            }
          })()}

          <div className="bio-links-container">
            {profile.links.filter(l => {
              if (!l.active) return false;
              if (proStatus === 'approved') {
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
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                  className={buttonClass}
                  style={{...computedStyles, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textDecoration: 'none'}}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {link.imageUrl && <img src={link.imageUrl} alt="icon" loading="lazy" style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />}
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

          {(proStatus !== 'approved' || profile.showWatermark !== false) && (
            <div className="branding-tag" style={{ color: profile.theme.backgroundValue.includes('#fdf2f8') ? 'rgba(76,5,25,0.4)' : 'rgba(255,255,255,0.4)' }}>
              <Link2 size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Powered by <span>AuraLink</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
