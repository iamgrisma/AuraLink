import { Link2, User, Eye, X } from 'lucide-react';
import { FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaGithub, FaLinkedin, FaSpotify, FaDiscord, FaTwitch } from 'react-icons/fa';

const AVAILABLE_ICONS = { FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaGithub, FaLinkedin, FaSpotify, FaDiscord, FaTwitch };

export default function Simulator({ profile, username, proStatus, showMobilePreview, setShowMobilePreview }) {
  if (!profile) return null;

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
          <div className={`bio-avatar-wrapper ${profile.proStatus === 'approved' ? 'pro-avatar-ring' : ''}`}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="bio-avatar" style={{ margin: 0 }} />
            ) : (
              <div className="bio-avatar-placeholder" style={{ margin: 0 }}>
                <User size={30} style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
          </div>

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

              return (
                <div className="bio-social-bar" style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  {activePlatforms.map(([platform]) => {
                    const Icon = getPlatformIcon(platform);
                    if (!Icon) return null;
                    return (
                      <div 
                        key={platform} 
                        className="bio-social-icon"
                        title={platform}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: profile.theme.backgroundValue.includes('#fdf2f8') ? '#4c0519' : '#ffffff',
                          fontSize: '1rem'
                        }}
                      >
                        <Icon />
                      </div>
                    );
                  })}
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
                <div 
                  key={link.id} 
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
                </div>
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
