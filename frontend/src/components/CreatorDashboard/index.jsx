
import { 
  Link2, BarChart3, Palette, User, Save, 
  LogOut, RefreshCw, Eye, Sparkles, Shield, Copy, ExternalLink,
  Menu, X
} from 'lucide-react';
import MediaManager from '../MediaManager';
import ProUpgradeModal from '../ProUpgradeModal';
import Simulator from './Simulator';
import LinksTab from './LinksTab';
import DesignTab from './DesignTab';
import AnalyticsTab from './AnalyticsTab';
import AdminTab from './AdminTab';


import { DashboardProvider, useDashboard } from './context/DashboardContext';

function DashboardContent({ onLogout }) {
  const { 
    activeTab, setActiveTab, profile, loading, proStatus, 
    showProModal, setShowProModal, mobileMenuOpen, setMobileMenuOpen,
    showMobilePreview, setShowMobilePreview, isAdmin, username,
    adminUsers, adminReports, adminSettings, adminPayments, activeApproval, savingSettings,
    newTitle, newUrl, expandedLinkId, mediaTarget, copiedUrl,
    setNewTitle, setNewUrl, setExpandedLinkId, handleAddLink, handleDeleteLink, handleToggleLink, handleEditLinkText, handleMoveLink, handleDuplicateLink,
    handleSave, saving, handleUpdateTheme, handleUpdatePresentation, fetchData,
    analytics, handleAdminAction, handleResolveReport, handleSaveSettings, handleAdminQRUpload, submitApproval,
    handleUpgradeToPro, handleProUpgradeSuccess, handleCopyPublicUrl, handleAddTemplateLink,
    tempUsername, setTempUsername, isUsernameAvailable, isUsernameChecked, setIsUsernameChecked, usernameSuggestions, changingUsername, handleCheckUsername, handleChangeUsernameSubmit,
    handleUpdateLinkStyle, setMediaTarget, getSocialLink, setSocialLink, setAdminSettings, setAdminPayments, setAdminUsers, setAdminReports, setActiveApproval, approvalStartDate, setApprovalStartDate, approvalEndDate, setApprovalEndDate, approvalNotes, setApprovalNotes, enlargedReceiptUrl, setEnlargedReceiptUrl, handleMediaSelect, setProfile
  } = useDashboard();


  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
        <RefreshCw className="animate-spin" size={24} />
        <span>Loading your AuraLink dashboard...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)' }}>Profile Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Could not load the profile configuration for @{username}.</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={fetchData} className="btn btn-primary"><RefreshCw size={16} /> Retry Connection</button>
          <button onClick={onLogout} className="btn btn-secondary">Log Out</button>
        </div>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/@${username}`;
  const socialLinks = (() => {
    try {
      return JSON.parse(profile.socialLinksJson || '{}');
    } catch {
      return {};
    }
  })();
  const activeLinks = profile.links.filter(link => link.active).length;
  const setupItems = [
    Boolean(profile.avatarUrl),
    Boolean(profile.name && profile.name.trim().length > 1),
    Boolean(profile.bio && profile.bio.trim().length > 20),
    activeLinks >= 3,
    Boolean(profile.seo?.title && profile.seo?.description),
    Boolean(Object.values(socialLinks).some(Boolean))
  ];
  const setupScore = Math.round((setupItems.filter(Boolean).length / setupItems.length) * 100);

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <header className="mobile-dashboard-header">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-btn" title="Toggle Menu">
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="nav-brand" style={{ background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}>
          <Link2 size={20} style={{ color: 'var(--accent-primary)' }} />
          <span>AuraLink</span>
        </div>
        <button onClick={() => setShowMobilePreview(true)} className="mobile-preview-btn-top" title="View Live Preview">
          <Eye size={20} />
        </button>
      </header>

      <div className="dashboard-layout">
        
        {/* Sidebar Nav */}
        <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-top">
            <div className="nav-brand" style={{ padding: '0 0.5rem 1.5rem 0.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
              <Link2 size={24} />
              <span>AuraLink</span>
            </div>
            
            <nav className="sidebar-menu">
              <button 
                onClick={() => { setActiveTab('links'); setMobileMenuOpen(false); }}
                className={`sidebar-item ${activeTab === 'links' ? 'active' : ''}`}
              >
                <User size={18} />
                <span>Page Profile</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab('design'); setMobileMenuOpen(false); }}
                className={`sidebar-item ${activeTab === 'design' ? 'active' : ''}`}
              >
                <Palette size={18} />
                <span>Theme Design</span>
              </button>
              
              <button 
                onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
                className={`sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`}
              >
                <BarChart3 size={18} />
                <span>Analytics</span>
              </button>
              
              {isAdmin && (
                <button 
                  onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                  className={`sidebar-item ${activeTab === 'admin' ? 'active' : ''}`}
                  style={{ marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}
                >
                  <Shield size={18} color="var(--primary)" />
                  <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Admin Panel</span>
                </button>
              )}
            </nav>
          </div>
          
          <div className="sidebar-bottom">
            <div className="sidebar-item" onClick={handleUpgradeToPro} style={{ color: proStatus === "approved" ? 'var(--success)' : 'var(--warning)', cursor: 'pointer', marginBottom: '1rem', border: '1px dashed var(--border-light)' }}>
              <Sparkles size={16} />
              <span>{proStatus === "approved" ? 'Premium Active' : 'Upgrade to Pro'}</span>
            </div>
            
            <div className="sidebar-user">
              <div className="user-info">
                <span className="username">@{username}</span>
                {proStatus === 'approved' ? (
                  <span className="plan-badge" style={{ background: 'var(--success)', color: '#000' }}>PRO</span>
                ) : proStatus === 'pending' ? (
                  <span className="plan-badge" style={{ background: 'var(--warning)', color: '#000' }}>PENDING</span>
                ) : (
                  <button onClick={handleUpgradeToPro} className="btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>UPGRADE TO PRO</button>
                )}
              </div>
              <button onClick={onLogout} className="btn-text" title="Log Out">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>

        {mobileMenuOpen && <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>}

        {/* Content Pane */}
        <main className="workspace-content">
          {/* Floating preview FAB for mobile */}
          <button onClick={() => setShowMobilePreview(true)} className="mobile-preview-fab" title="View Simulator Live">
            <Eye size={18} />
            <span>Live Preview</span>
          </button>

          <div className="splitscreen">
            
            {/* Left: Editor form */}
            <div className="editor-pane">
              
              <div className="dashboard-command-center">
                <div>
                  <p className="eyebrow-label">Creator Workspace</p>
                  <h1>Build a profile that earns trust</h1>
                  <div className="public-url-pill">
                    <span>{publicUrl}</span>
                    <button type="button" onClick={handleCopyPublicUrl} title="Copy public URL">
                      <Copy size={14} />
                    </button>
                    <a href={`/@${username}`} target="_blank" rel="noreferrer" title="Open public page">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <div className="launch-score">
                  <span>{setupScore}%</span>
                  <small>Launch readiness</small>
                  <div className="score-bar"><div style={{ width: `${setupScore}%` }} /></div>
                  {copiedUrl && <em>Copied</em>}
                </div>
              </div>

              {/* TABS */}
              {activeTab === 'links' && <LinksTab />}

              {activeTab === 'design' && <DesignTab />}

              {activeTab === 'analytics' && <AnalyticsTab />}

              {activeTab === 'admin' && isAdmin && <AdminTab />}

            </div>

            {/* Right: Phone preview */}
            <Simulator />

          </div>
        </main>

      </div>

      {mediaTarget && (
        <MediaManager
          username={username}
          onSelectImage={handleMediaSelect}
          onClose={() => setMediaTarget(null)}
        />
      )}
      
      {/* Save Action Bar (Sticky at bottom of screen for desktop) */}
      <div style={{
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100,
        backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--border-light)',
        display: 'flex', alignItems: 'center', gap: '1rem'
      }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Unsaved changes?</span>
        <button 
          onClick={() => handleSave()} 
          disabled={saving} 
          className="btn btn-primary"
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Page'}
        </button>
      </div>

      <ProUpgradeModal 
        isOpen={showProModal} 
        onClose={() => setShowProModal(false)}
        username={username}
        onUpgradeSuccess={handleProUpgradeSuccess}
      />
    </div>
  );
}


export default function CreatorDashboard(props) {
  return (
    <DashboardProvider {...props}>
      <DashboardContent onLogout={props.onLogout} />
    </DashboardProvider>
  );
}
