import { User, Plus, Link2, Trash2, Settings, ExternalLink, Image as ImageIcon, ArrowUp, ArrowDown, Copy, CheckCircle2 } from 'lucide-react';
import { FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaGithub, FaLinkedin, FaSpotify, FaDiscord, FaTwitch } from 'react-icons/fa';

const AVAILABLE_ICONS = { FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaGithub, FaLinkedin, FaSpotify, FaDiscord, FaTwitch };
const LINK_TEMPLATES = [
  { title: 'Book a consultation', url: 'https://calendly.com/your-name', iconName: 'FaLinkedin', buttonStyle: 'solid' },
  { title: 'Shop my recommended tools', url: 'https://your-store.com', iconName: 'FaSpotify', buttonStyle: 'soft' },
  { title: 'Join my newsletter', url: 'https://substack.com', iconName: 'FaTwitter', buttonStyle: 'outline' },
  { title: 'View portfolio and case studies', url: 'https://your-domain.com', iconName: 'FaGithub', buttonStyle: 'solid' }
];

export default function LinksTab({
  profile,
  setProfile,
  username,
  proStatus,
  tempUsername,
  setTempUsername,
  isUsernameAvailable,
  isUsernameChecked,
  setIsUsernameChecked,
  usernameSuggestions,
  changingUsername,
  handleCheckUsername,
  handleChangeUsernameSubmit,
  newTitle,
  setNewTitle,
  newUrl,
  setNewUrl,
  handleAddLink,
  handleToggleLink,
  handleDeleteLink,
  handleEditLinkText,
  handleMoveLink,
  handleDuplicateLink,
  handleAddTemplateLink,
  expandedLinkId,
  setExpandedLinkId,
  handleUpdateLinkStyle,
  setMediaTarget,
  handleSave,
  getSocialLink,
  setSocialLink
}) {
  const activeLinks = profile.links.filter(link => link.active).length;
  const checklist = [
    { label: 'Upload a clear profile photo', done: Boolean(profile.avatarUrl) },
    { label: 'Write a specific bio with your offer', done: Boolean(profile.bio && profile.bio.trim().length > 20) },
    { label: 'Publish at least 3 active links', done: activeLinks >= 3 },
    { label: 'Add social profile icons', done: ['instagram', 'youtube', 'twitter', 'tiktok', 'facebook', 'github', 'linkedin'].some(platform => getSocialLink(platform)) },
    { label: 'Set SEO title and description', done: Boolean(profile.seo?.title && profile.seo?.description) }
  ];

  return (
    <>
      <section className="editor-card launch-checklist-card">
        <div>
          <p className="eyebrow-label">Launch Checklist</p>
          <h2 className="card-title compact-title"><CheckCircle2 size={18} /> Business-ready basics</h2>
        </div>
        <div className="checklist-grid">
          {checklist.map(item => (
            <div key={item.label} className={`checklist-item ${item.done ? 'done' : ''}`}>
              <CheckCircle2 size={16} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Profile Info */}
      <section className="editor-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="card-title" style={{ margin: 0 }}><User size={18} /> Profile Bio Details</h2>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            Live URL: <a href={`/@${username}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: '500', textDecoration: 'underline' }}>
              {window.location.origin}/@{username} <ExternalLink size={10} style={{ display: 'inline' }} />
            </a>
          </p>
        </div>
        
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Avatar Photo (Upload to Cloudflare R2)</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.4rem' }}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar Preview" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)' }} />
            ) : (
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px dashed var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>No Pic</div>
            )}
            <button 
              type="button" 
              onClick={() => setMediaTarget({ type: 'avatar' })}
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', margin: 0, cursor: 'pointer' }}
            >
              <ImageIcon size={14} style={{ marginRight: '0.3rem', display: 'inline', verticalAlign: 'text-bottom' }} /> Choose Image
            </button>
            {profile.avatarUrl && (
              <button 
                type="button" 
                onClick={() => {
                  const updatedProfile = { ...profile, avatarUrl: '' };
                  setProfile(updatedProfile);
                  handleSave(updatedProfile);
                }}
                className="btn-text" 
                style={{ color: 'var(--danger)', fontSize: '0.8rem' }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
        
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Display Name</label>
          <input 
            type="text" 
            value={profile.name} 
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="input-control" 
            placeholder="Alex Rivers"
            maxLength={40}
          />
        </div>
        
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Google Analytics Measurement ID (gtag.js)</label>
          <input 
            type="text" 
            value={profile.googleAnalyticsId || ''} 
            onChange={(e) => setProfile({ ...profile, googleAnalyticsId: e.target.value })}
            onBlur={() => handleSave()}
            className="input-control" 
            placeholder="e.g. G-XXXXXXXXXX"
            maxLength={20}
          />
        </div>
        
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Short Biography</label>
          <textarea 
            value={profile.bio} 
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="input-control" 
            placeholder="Share a short bio (social handles, products, info...)"
            rows={3}
            maxLength={180}
            style={{ resize: 'none' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
          <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.75rem' }}>Social Profile Handles</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {['instagram', 'youtube', 'twitter', 'tiktok', 'facebook', 'github', 'linkedin'].map(platform => (
              <div key={platform} style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.75rem', textTransform: 'capitalize', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{platform}</label>
                <input 
                  type="text" 
                  value={getSocialLink(platform)}
                  onChange={(e) => setSocialLink(platform, e.target.value)}
                  onBlur={() => handleSave()}
                  className="input-control" 
                  style={{ fontSize: '0.8rem', padding: '0.4rem' }}
                  placeholder={`${platform} username`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: '600' }}>SEO Settings</label>
          <input 
            type="text" 
            value={profile.seo?.title || ''} 
            onChange={(e) => {
              const updated = { ...profile, seo: { ...profile.seo, title: e.target.value } };
              setProfile(updated);
            }}
            onBlur={() => handleSave()}
            className="input-control" 
            placeholder="SEO Meta Title"
            style={{ marginBottom: '0.5rem' }}
          />
          <textarea 
            value={profile.seo?.description || ''} 
            onChange={(e) => {
              const updated = { ...profile, seo: { ...profile.seo, description: e.target.value } };
              setProfile(updated);
            }}
            onBlur={() => handleSave()}
            className="input-control" 
            placeholder="SEO Meta Description"
            rows={2}
            style={{ marginBottom: '0.5rem', resize: 'none' }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <input 
              type="checkbox" 
              checked={profile.seo?.allowIndexing !== false}
              onChange={(e) => {
                const updated = { ...profile, seo: { ...profile.seo, allowIndexing: e.target.checked } };
                setProfile(updated);
                handleSave(updated);
              }}
            />
            Allow Search Engines to Index Page
          </label>
        </div>
      </section>

      {/* Change Username Card */}
      <section className="editor-card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="card-title"><User size={18} /> Update Username</h2>
        
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>New Username</label>
          <div style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>@</span>
              <input 
                type="text" 
                value={tempUsername} 
                onChange={(e) => {
                  const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                  setTempUsername(val);
                  setIsUsernameChecked(false);
                }}
                className="input-control" 
                style={{ paddingLeft: '32px' }}
                placeholder="new_username"
              />
            </div>
            <button 
              onClick={handleCheckUsername} 
              disabled={tempUsername === username || tempUsername.length < 3}
              className="btn btn-secondary"
            >
              Check
            </button>
          </div>
          
          {isUsernameChecked && !isUsernameAvailable && (
            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--danger)' }}>
              Username is already taken. 
              {usernameSuggestions.length > 0 && (
                <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                  Suggestions: 
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                    {usernameSuggestions.map(sug => (
                      <button 
                        key={sug} 
                        onClick={() => { setTempUsername(sug); setIsUsernameChecked(false); }}
                        style={{ padding: '0.2rem 0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        @{sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {isUsernameChecked && isUsernameAvailable && (
            <p style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Username is available.</p>
          )}
        </div>
        
        <button 
          type="button" 
          onClick={handleChangeUsernameSubmit}
          className="btn btn-primary"
          disabled={!isUsernameChecked || !isUsernameAvailable || tempUsername === username || changingUsername}
        >
          {changingUsername ? 'Updating...' : 'Apply New Username'}
        </button>
      </section>

      {/* Add New Link */}
      <section className="editor-card">
        <h2 className="card-title"><Plus size={18} /> Add New Link</h2>
        <form onSubmit={handleAddLink} style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <div className="form-group">
            <label>Link Display Title</label>
            <input 
              type="text" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="input-control" 
              placeholder="e.g. Visit My Storefront"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Target URL</label>
            <input 
              type="text" 
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="input-control" 
              placeholder="e.g. https://my-affiliate-shop.com/discount"
              required
            />
          </div>
          
          <button type="submit" className="btn btn-secondary" style={{ width: 'fit-content' }}>
            <Plus size={16} /> Add to List
          </button>
        </form>
      </section>

      <section className="editor-card">
        <h2 className="card-title"><Plus size={18} /> Quick Link Templates</h2>
        <div className="template-grid">
          {LINK_TEMPLATES.map(template => (
            <button
              key={template.title}
              type="button"
              className="template-button"
              onClick={() => handleAddTemplateLink(template)}
            >
              <span>{template.title}</span>
              <small>{template.url.replace(/^https?:\/\//, '')}</small>
            </button>
          ))}
        </div>
      </section>

      {/* Active Links List */}
      <section className="editor-card">
        <h2 className="card-title"><Link2 size={18} /> Manage Active Links</h2>
        
        {profile.links.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
            No links added yet. Use the form above to add your first link!
          </p>
        ) : (
          <div className="links-list">
            {profile.links.map((link) => (
              <div key={link.id} className="link-editor-item">
                <div className="link-item-header">
                  <span className="link-drag-handle">Link #{profile.links.indexOf(link) + 1}</span>
                  <div className="link-actions">
                    <button
                      type="button"
                      onClick={() => handleMoveLink(link.id, -1)}
                      className="icon-action"
                      title="Move link up"
                      disabled={profile.links.indexOf(link) === 0}
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveLink(link.id, 1)}
                      className="icon-action"
                      title="Move link down"
                      disabled={profile.links.indexOf(link) === profile.links.length - 1}
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateLink(link.id)}
                      className="icon-action"
                      title="Duplicate link as inactive draft"
                    >
                      <Copy size={15} />
                    </button>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={link.active}
                        onChange={() => handleToggleLink(link.id)} 
                      />
                      <span className="slider"></span>
                    </label>
                    <button 
                      onClick={() => handleDeleteLink(link.id)} 
                      className="btn-text" 
                      style={{ color: 'var(--danger)', padding: '0.2rem' }}
                      title="Delete Link"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '0.75rem' }}>
                  <input 
                    type="text" 
                    value={link.title}
                    onChange={(e) => handleEditLinkText(link.id, 'title', e.target.value)}
                    onBlur={() => handleSave()}
                    className="input-control" 
                    style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                    placeholder="Title"
                  />
                  <input 
                    type="text" 
                    value={link.url}
                    onChange={(e) => handleEditLinkText(link.id, 'url', e.target.value)}
                    onBlur={() => handleSave()}
                    className="input-control" 
                    style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                    placeholder="URL"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button className="btn-text" onClick={() => setExpandedLinkId(expandedLinkId === link.id ? null : link.id)} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Settings size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {expandedLinkId === link.id ? 'Close Settings' : 'Customize Style'}
                  </button>
                </div>
                
                {expandedLinkId === link.id && (
                  <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <input type="checkbox" checked={link.showUrl} onChange={(e) => handleUpdateLinkStyle(link.id, 'showUrl', e.target.checked)} />
                      Show URL below title
                    </label>
                    
                    {proStatus === "approved" && (
                      <>
                        <div style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid var(--accent-secondary)', borderRadius: '4px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input type="checkbox" checked={link.linkType === 'product'} onChange={(e) => handleUpdateLinkStyle(link.id, 'linkType', e.target.checked ? 'product' : 'link')} />
                            Sell as Product
                          </label>
                          {link.linkType === 'product' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input type="number" value={link.price || 0} onChange={(e) => handleUpdateLinkStyle(link.id, 'price', parseFloat(e.target.value))} onBlur={() => handleSave()} className="input-control" placeholder="Price" />
                              <select value={link.currency || 'USD'} onChange={(e) => handleUpdateLinkStyle(link.id, 'currency', e.target.value)} className="input-control">
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                              </select>
                            </div>
                          )}
                        </div>

                        <div style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.05)' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b', display: 'block', marginBottom: '0.5rem' }}>Link Scheduling (Pro Feature)</span>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <div>
                              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Show From</label>
                              <input 
                                type="datetime-local" 
                                value={link.startDate || ''} 
                                onChange={(e) => handleUpdateLinkStyle(link.id, 'startDate', e.target.value)} 
                                className="input-control" 
                                style={{ fontSize: '0.75rem', padding: '0.3rem' }} 
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hide From</label>
                              <input 
                                type="datetime-local" 
                                value={link.endDate || ''} 
                                onChange={(e) => handleUpdateLinkStyle(link.id, 'endDate', e.target.value)} 
                                className="input-control" 
                                style={{ fontSize: '0.75rem', padding: '0.3rem' }} 
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <label>Icon</label>
                        <select value={link.iconName || ''} onChange={(e) => handleUpdateLinkStyle(link.id, 'iconName', e.target.value)} className="input-control">
                          <option value="">None</option>
                          {Object.keys(AVAILABLE_ICONS).map(icon => <option key={icon} value={icon}>{icon.replace('Fa', '')}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          Custom Image URL
                          <button 
                            type="button" 
                            onClick={() => setMediaTarget({ type: 'link', id: link.id })}
                            style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                          >
                            <ImageIcon size={12} /> Library
                          </button>
                        </label>
                        <input type="text" value={link.imageUrl || ''} onChange={(e) => handleUpdateLinkStyle(link.id, 'imageUrl', e.target.value)} onBlur={() => handleSave()} className="input-control" placeholder="https://..." />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label>Button Style</label>
                        <select value={link.buttonStyle || ''} onChange={(e) => handleUpdateLinkStyle(link.id, 'buttonStyle', e.target.value)} className="input-control">
                          <option value="">Inherit Theme</option>
                          <option value="solid">Solid</option>
                          <option value="outline">Outline</option>
                          <option value="glassmorphic">Glass</option>
                          <option value="pill">Pill</option>
                          <option value="soft">Soft</option>
                          <option value="shadow">Retro Shadow</option>
                          <option value="dashed">Dashed</option>
                        </select>
                      </div>
                      <div>
                        <label>Border Radius</label>
                        <select value={link.buttonBorderRadius || ''} onChange={(e) => handleUpdateLinkStyle(link.id, 'buttonBorderRadius', e.target.value)} className="input-control">
                          <option value="">Inherit</option>
                          <option value="0px">Square 0px</option>
                          <option value="8px">Rounded 8px</option>
                          <option value="16px">Extra Rounded 16px</option>
                          <option value="30px">Full Pill 30px</option>
                        </select>
                      </div>
                      <div>
                        <label>Bg Color</label>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <input 
                            type="color" 
                            value={link.buttonColor && link.buttonColor.startsWith('#') ? link.buttonColor : '#3b82f6'} 
                            onChange={(e) => handleUpdateLinkStyle(link.id, 'buttonColor', e.target.value)}
                            style={{ width: '36px', height: '36px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '4px', background: 'transparent' }} 
                          />
                          <input 
                            type="text" 
                            value={link.buttonColor || ''} 
                            onChange={(e) => handleUpdateLinkStyle(link.id, 'buttonColor', e.target.value)} 
                            onBlur={() => handleSave()} 
                            className="input-control" 
                            style={{ flex: 1, padding: '0.4rem' }}
                            placeholder="Inherit" 
                          />
                        </div>
                      </div>
                      <div>
                        <label>Text Color</label>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <input 
                            type="color" 
                            value={link.buttonTextColor && link.buttonTextColor.startsWith('#') ? link.buttonTextColor : '#ffffff'} 
                            onChange={(e) => handleUpdateLinkStyle(link.id, 'buttonTextColor', e.target.value)}
                            style={{ width: '36px', height: '36px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '4px', background: 'transparent' }} 
                          />
                          <input 
                            type="text" 
                            value={link.buttonTextColor || ''} 
                            onChange={(e) => handleUpdateLinkStyle(link.id, 'buttonTextColor', e.target.value)} 
                            onBlur={() => handleSave()} 
                            className="input-control" 
                            style={{ flex: 1, padding: '0.4rem' }}
                            placeholder="Inherit" 
                          />
                        </div>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label>Border Color</label>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <input 
                            type="color" 
                            value={link.buttonBorderColor && link.buttonBorderColor.startsWith('#') ? link.buttonBorderColor : '#cccccc'} 
                            onChange={(e) => handleUpdateLinkStyle(link.id, 'buttonBorderColor', e.target.value)}
                            style={{ width: '36px', height: '36px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '4px', background: 'transparent' }} 
                          />
                          <input 
                            type="text" 
                            value={link.buttonBorderColor || ''} 
                            onChange={(e) => handleUpdateLinkStyle(link.id, 'buttonBorderColor', e.target.value)} 
                            onBlur={() => handleSave()} 
                            className="input-control" 
                            style={{ flex: 1, padding: '0.4rem' }}
                            placeholder="Inherit" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
