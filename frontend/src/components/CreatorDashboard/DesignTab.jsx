import React from 'react';
import { Palette, Sparkles } from 'lucide-react';

const THEME_PRESETS = [
  {
    name: 'Midnight Ink',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0f172a, #1e293b)',
    btnStyle: 'solid',
    btnColor: '#3b82f6',
    textColor: '#ffffff',
    premium: false
  },
  {
    name: 'Plum Nebula',
    type: 'gradient',
    value: 'linear-gradient(135deg, #1e1b4b, #311042)',
    btnStyle: 'glassmorphic',
    btnColor: 'rgba(255, 255, 255, 0.1)',
    textColor: '#ffffff',
    premium: true
  },
  {
    name: 'Cyber Neon',
    type: 'flat',
    value: '#05050a',
    btnStyle: 'neon',
    btnColor: '#39ff14',
    textColor: '#39ff14',
    premium: true
  },
  {
    name: 'Soft Rose',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)',
    btnStyle: 'pastel',
    btnColor: '#ec4899',
    textColor: '#4c0519',
    premium: true
  },
  {
    name: 'Forest Dream',
    type: 'gradient',
    value: 'linear-gradient(135deg, #022c22, #064e3b)',
    btnStyle: 'outline',
    btnColor: '#34d399',
    textColor: '#34d399',
    premium: false
  },
  {
    name: 'Ocean Spray',
    type: 'gradient',
    value: 'linear-gradient(135deg, #0f172a, #0284c7)',
    btnStyle: 'pill',
    btnColor: '#38bdf8',
    textColor: '#ffffff',
    premium: false
  },
  {
    name: 'Sunset Glow',
    type: 'gradient',
    value: 'linear-gradient(135deg, #451a03, #b45309)',
    btnStyle: 'solid',
    btnColor: '#f59e0b',
    textColor: '#ffffff',
    premium: false
  },
  {
    name: 'Lavender Mist',
    type: 'gradient',
    value: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
    btnStyle: 'soft',
    btnColor: 'rgba(79, 70, 229, 0.1)',
    textColor: '#4f46e5',
    premium: false
  },
  {
    name: 'Carbon & Gold',
    type: 'gradient',
    value: 'linear-gradient(135deg, #111111, #222222)',
    btnStyle: 'outline',
    btnColor: '#fbbf24',
    textColor: '#fbbf24',
    premium: true
  },
  {
    name: 'Matcha Latte',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    btnStyle: 'soft',
    btnColor: 'rgba(22, 101, 52, 0.08)',
    textColor: '#166534',
    premium: false
  },
  {
    name: 'Tangerine Breeze',
    type: 'gradient',
    value: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
    btnStyle: 'solid',
    btnColor: '#ea580c',
    textColor: '#ffffff',
    premium: true
  },
  {
    name: 'Minimal Slate',
    type: 'flat',
    value: '#f8fafc',
    btnStyle: 'solid',
    btnColor: '#0f172a',
    textColor: '#ffffff',
    premium: false
  },
  {
    name: 'Sakura Glass',
    type: 'gradient',
    value: 'linear-gradient(135deg, #3b0764, #f472b6)',
    btnStyle: 'glassmorphic',
    btnColor: 'rgba(255, 255, 255, 0.15)',
    textColor: '#ffffff',
    premium: true
  },
  {
    name: 'Retro Mint',
    type: 'flat',
    value: '#e6fffa',
    btnStyle: 'shadow',
    btnColor: '#319795',
    textColor: '#ffffff',
    premium: true
  },
  {
    name: 'Electric Violet',
    type: 'gradient',
    value: 'linear-gradient(135deg, #4c1d95, #8b5cf6)',
    btnStyle: 'neon',
    btnColor: '#a78bfa',
    textColor: '#ffffff',
    premium: true
  },
  {
    name: 'Warm Terracotta',
    type: 'gradient',
    value: 'linear-gradient(135deg, #2e1007, #7c2d12)',
    btnStyle: 'dashed',
    btnColor: '#ea580c',
    textColor: '#ffedd5',
    premium: false
  },
  {
    name: 'Midnight Velvet',
    type: 'gradient',
    value: 'linear-gradient(135deg, #2e0249, #570a57)',
    btnStyle: 'pill',
    btnColor: '#a91079',
    textColor: '#ffffff',
    premium: false
  },
  {
    name: 'Golden Hour',
    type: 'gradient',
    value: 'linear-gradient(135deg, #f59e0b, #d97706)',
    btnStyle: 'dashed',
    btnColor: '#b45309',
    textColor: '#fffbeb',
    premium: true
  },
  {
    name: 'Arctic Frost',
    type: 'gradient',
    value: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
    btnStyle: 'soft',
    btnColor: 'rgba(2, 132, 199, 0.1)',
    textColor: '#0369a1',
    premium: false
  },
  {
    name: 'Dark Matter',
    type: 'flat',
    value: '#09090b',
    btnStyle: 'shadow',
    btnColor: '#27272a',
    textColor: '#ffffff',
    premium: true
  }
];

export default function DesignTab({
  profile,
  proStatus,
  handleUpdateTheme,
  setProfile,
  handleSave,
  setShowProModal
}) {
  return (
    <>
      {/* Theme Presets */}
      <section className="editor-card">
        <h2 className="card-title"><Palette size={18} /> Designer Theme Presets</h2>
        <div className="themes-grid">
          {THEME_PRESETS.map((preset, idx) => {
            const isSelected = profile.theme.backgroundValue === preset.value && profile.theme.buttonStyle === preset.btnStyle;
            const isLocked = preset.premium && proStatus !== "approved";
            
            return (
              <div 
                key={idx} 
                onClick={() => {
                  if (isLocked) {
                    setShowProModal(true);
                    return;
                  }
                  const updatedProfile = {
                    ...profile,
                    theme: {
                      backgroundType: preset.type,
                      backgroundValue: preset.value,
                      buttonStyle: preset.btnStyle,
                      buttonColor: preset.btnColor,
                      buttonTextColor: preset.textColor,
                      buttonBorderColor: preset.btnStyle === 'glassmorphic' ? 'rgba(255,255,255,0.2)' : 'transparent'
                    }
                  };
                  setProfile(updatedProfile);
                  handleSave(updatedProfile);
                }}
                className={`theme-option ${isSelected ? 'active' : ''}`}
                style={{ position: 'relative' }}
              >
                {isLocked && (
                  <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', padding: '0.15rem', borderRadius: '50%' }}>
                    🔒
                  </div>
                )}
                <div 
                  className="theme-preview-dot" 
                  style={{ background: preset.value }}
                ></div>
                <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>{preset.name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Manual Editor */}
      <section className="editor-card">
        <h2 className="card-title"><Palette size={18} /> Typography & Buttons</h2>
        
        {/* Font selection */}
        <div className="form-group" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Font Styling</label>
            <select 
              value={profile.theme.font || 'Inter'} 
              onChange={(e) => handleUpdateTheme('font', e.target.value)}
              className="input-control"
            >
              <option value="Inter">Inter (Clean Sans)</option>
              <option value="Outfit">Outfit (Display Bold)</option>
              <option value="Georgia">Georgia (Serif)</option>
              <option value="monospace">Courier New (Monospace)</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Global Font Color</label>
            <input 
              type="color" 
              value={profile.theme.fontColor || '#ffffff'}
              onChange={(e) => handleUpdateTheme('fontColor', e.target.value)}
              style={{ width: '100%', height: '40px', padding: '0', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            />
          </div>
        </div>

        {/* Button style selection */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label>Button Border Style</label>
          <select 
            value={profile.theme.buttonStyle || 'solid'} 
            onChange={(e) => {
              const val = e.target.value;
              let btnCol = profile.theme.buttonColor;
              let textCol = profile.theme.buttonTextColor;
              let borderCol = 'transparent';

              if (val === 'glassmorphic') {
                btnCol = 'rgba(255, 255, 255, 0.08)';
                textCol = '#ffffff';
                borderCol = 'rgba(255, 255, 255, 0.2)';
              } else if (val === 'neon') {
                btnCol = '#000000';
                textCol = '#39ff14';
                borderCol = '#39ff14';
              }

              const updatedProfile = {
                ...profile,
                theme: {
                  ...profile.theme,
                  buttonStyle: val,
                  buttonColor: btnCol,
                  buttonTextColor: textCol,
                  buttonBorderColor: borderCol
                }
              };
              setProfile(updatedProfile);
              handleSave(updatedProfile);
            }}
            className="input-control"
          >
            <option value="solid">Solid Background</option>
            <option value="outline">Outline Border</option>
            <option value="glassmorphic">Glassmorphic Glow</option>
            <option value="pill">Pill Shape</option>
            <option value="soft">Soft Background</option>
            <option value="shadow">Retro Shadow Offset</option>
            <option value="dashed">Dashed Border</option>
            {proStatus === "approved" && <option value="neon">Neon Digital</option>}
            {proStatus === "approved" && <option value="pastel">Rounded Pastel</option>}
          </select>
        </div>

        {/* Background Picker */}
        <div className="form-group">
          <label>Custom Page Color</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="color" 
              value={profile.theme.backgroundType === 'flat' ? profile.theme.backgroundValue : '#0f172a'}
              onChange={(e) => {
                const updatedProfile = {
                  ...profile,
                  theme: {
                    ...profile.theme,
                    backgroundType: 'flat',
                    backgroundValue: e.target.value
                  }
                };
                setProfile(updatedProfile);
                handleSave(updatedProfile);
              }}
              style={{ width: '40px', height: '40px', padding: '0', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Click to pick solid hex color</span>
          </div>
        </div>
      </section>

      {proStatus === "approved" && (
        <section className="editor-card" style={{ marginTop: '1.5rem' }}>
          <h2 className="card-title" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={18} /> Premium Branding & Styles
          </h2>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={profile.showWatermark !== false}
                onChange={(e) => {
                  const updated = { ...profile, showWatermark: e.target.checked };
                  setProfile(updated);
                  handleSave(updated);
                }}
              />
              Show "Made with AuraLink" watermark on my profile
            </label>
          </div>

          <div className="form-group">
            <label>Custom CSS Overrides</label>
            <textarea 
              value={profile.customCss || ''} 
              onChange={(e) => setProfile({ ...profile, customCss: e.target.value })}
              onBlur={() => handleSave()}
              className="input-control" 
              placeholder="e.g. .bio-name { font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }"
              rows={4}
              style={{ fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical' }}
            />
          </div>
        </section>
      )}
    </>
  );
}
