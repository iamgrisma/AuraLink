import { useState, useEffect } from 'react';
import { 
  Link2, BarChart3, Palette, User, Save, 
  LogOut, RefreshCw, Eye, Sparkles, Shield,
  Menu, X
} from 'lucide-react';
import MediaManager from '../MediaManager';
import ProUpgradeModal from '../ProUpgradeModal';
import Simulator from './Simulator';
import LinksTab from './LinksTab';
import DesignTab from './DesignTab';
import AnalyticsTab from './AnalyticsTab';
import AdminTab from './AdminTab';

const API_BASE = '/api';

export default function CreatorDashboard({ username, onLogout, isAdmin, onUsernameChange }) {
  const [activeTab, setActiveTab] = useState('links'); // 'links', 'design', 'analytics', 'admin'
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proStatus, setProStatus] = useState('none');
  
  // Admin states
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [adminSettings, setAdminSettings] = useState({
    membership_price_nrs: '100',
    admin_whatsapp: '9779844245717',
    admin_payment_instructions: 'Send exactly Rs. 100 via QR and put your username in remarks.',
    payment_qr_url: ''
  });
  const [adminPayments, setAdminPayments] = useState([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [activeApproval, setActiveApproval] = useState(null); // { username, logId, action: 'grant_pro' | 'revoke_pro' }
  const [approvalStartDate, setApprovalStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [approvalEndDate, setApprovalEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [approvalNotes, setApprovalNotes] = useState('');
  const [enlargedReceiptUrl, setEnlargedReceiptUrl] = useState(null);
  
  // Link form states
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [expandedLinkId, setExpandedLinkId] = useState(null);

  // Media Manager state
  const [mediaTarget, setMediaTarget] = useState(null);

  // Mobile UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Username change states
  const [tempUsername, setTempUsername] = useState(username);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [changingUsername, setChangingUsername] = useState(false);

  // Pro Modal state
  const [showProModal, setShowProModal] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTempUsername(username);
    setIsUsernameChecked(false);
  }, [username]);

  const handleCheckUsername = async () => {
    if (tempUsername === username || tempUsername.length < 3) return;
    try {
      const res = await fetch(`${API_BASE}/profile/check/${tempUsername}`);
      if (res.ok) {
        const data = await res.json();
        setIsUsernameAvailable(data.available);
        setUsernameSuggestions(data.suggestions || []);
        setIsUsernameChecked(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeUsernameSubmit = async () => {
    if (!isUsernameChecked || !isUsernameAvailable || tempUsername === username) return;
    if (!confirm(`Are you sure you want to change your username from @${username} to @${tempUsername}? Your page URL will change.`)) return;
    
    try {
      setChangingUsername(true);
      const res = await fetch(`${API_BASE}/profile/${username}/change-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: tempUsername })
      });
      
      if (res.ok) {
        const data = await res.json();
        alert('Your username has been updated successfully!');
        if (onUsernameChange) {
          onUsernameChange(data.username);
        }
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to change username.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during username update.');
    } finally {
      setChangingUsername(false);
    }
  };

  const handleUpdateLinkStyle = (linkId, key, value) => {
    const updatedLinks = profile.links.map(l => {
      if (l.id === linkId) {
        return { ...l, [key]: value };
      }
      return l;
    });
    const updatedProfile = { ...profile, links: updatedLinks };
    setProfile(updatedProfile);
    handleSave(updatedProfile);
  };

  const handleMediaSelect = (url) => {
    if (!mediaTarget) return;

    if (mediaTarget.type === 'avatar') {
      const updatedProfile = { ...profile, avatarUrl: url };
      setProfile(updatedProfile);
      handleSave(updatedProfile);
    } else if (mediaTarget.type === 'link') {
      handleUpdateLinkStyle(mediaTarget.id, 'imageUrl', url);
    }
    
    setMediaTarget(null);
  };

  // Fetch profile & analytics
  const fetchData = async () => {
    try {
      setLoading(true);

      const [profRes, analRes] = await Promise.all([
        fetch(`${API_BASE}/profile/${username}`),
        fetch(`${API_BASE}/analytics/report/${username}`)
      ]);

      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
        if (profData.proStatus) {
          setProStatus(profData.proStatus);
        }
      }
      
      if (analRes.ok) {
        const analData = await analRes.json();
        setAnalytics(analData);
      }
      
      // Admin data fetch
      if (isAdmin) {
        const [usersRes, reportsRes, settingsRes, paymentsRes] = await Promise.all([
          fetch(`${API_BASE}/admin/users`),
          fetch(`${API_BASE}/admin/reports`),
          fetch(`${API_BASE}/settings`),
          fetch(`${API_BASE}/admin/payments`)
        ]);
        if (usersRes.ok) setAdminUsers(await usersRes.json());
        if (reportsRes.ok) setAdminReports(await reportsRes.json());
        if (settingsRes.ok) setAdminSettings(await settingsRes.json());
        if (paymentsRes.ok) setAdminPayments(await paymentsRes.json());
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [username]);

  // Save changes to backend
  const handleSave = async (updatedProfile = profile) => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/profile/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAdminAction = async (action, targetUsername) => {
    try {
      let endpoint = '';
      let body = {};
      
      if (action === 'grant_pro') {
        endpoint = `${API_BASE}/admin/approve-pro/${targetUsername}`;
        body = { status: 'approved' };
      } else if (action === 'revoke_pro') {
        endpoint = `${API_BASE}/admin/approve-pro/${targetUsername}`;
        body = { status: 'none' };
      } else if (action === 'suspend') {
        endpoint = `${API_BASE}/admin/suspend-user/${targetUsername}`;
        body = { status: 'suspended', reason: 'Admin action' };
      } else if (action === 'unsuspend') {
        endpoint = `${API_BASE}/admin/suspend-user/${targetUsername}`;
        body = { status: 'active', reason: '' };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        // Refresh users
        const usersRes = await fetch(`${API_BASE}/admin/users`);
        if (usersRes.ok) setAdminUsers(await usersRes.json());
      } else {
        alert('Action failed.');
      }
    } catch (err) {
      console.error('Error performing admin action:', err);
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/reports/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve' })
      });
      if (res.ok) {
        // Refresh reports
        const reportsRes = await fetch(`${API_BASE}/admin/reports`);
        if (reportsRes.ok) setAdminReports(await reportsRes.json());
      } else {
        alert('Action failed.');
      }
    } catch (err) {
      console.error('Error resolving report:', err);
    }
  };

  const getSocialLink = (platform) => {
    if (!profile) return '';
    try {
      const json = profile.socialLinksJson ? JSON.parse(profile.socialLinksJson) : {};
      return json[platform] || '';
    } catch {
      return '';
    }
  };

  const setSocialLink = (platform, value) => {
    if (!profile) return;
    try {
      const json = profile.socialLinksJson ? JSON.parse(profile.socialLinksJson) : {};
      json[platform] = value;
      const updatedProfile = { ...profile, socialLinksJson: JSON.stringify(json) };
      setProfile(updatedProfile);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      const res = await fetch(`${API_BASE}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminSettings)
      });
      if (res.ok) {
        alert('Global configurations saved successfully!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAdminQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('username', 'admin');
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setAdminSettings(prev => ({ ...prev, payment_qr_url: data.url }));
        alert('QR code uploaded successfully! Click "Save Configuration Settings" to apply it.');
      } else {
        alert(data.error || 'Failed to upload QR code');
      }
    } catch (err) {
      console.error(err);
      alert('QR upload error occurred.');
    }
  };

  const submitApproval = async () => {
    if (!activeApproval) return;
    try {
      const res = await fetch(`${API_BASE}/admin/approve-pro/${activeApproval.username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: activeApproval.action === 'revoke_pro' ? 'none' : 'approved',
          pro_since: activeApproval.action === 'revoke_pro' ? null : new Date(approvalStartDate).toISOString(),
          pro_expires_at: activeApproval.action === 'revoke_pro' ? null : new Date(approvalEndDate).toISOString(),
          logId: activeApproval.logId || null,
          adminNotes: approvalNotes
        })
      });
      if (res.ok) {
        alert(`Successfully updated membership status for @${activeApproval.username}`);
        const [uRes, pRes] = await Promise.all([
          fetch(`${API_BASE}/admin/users`),
          fetch(`${API_BASE}/admin/payments`)
        ]);
        if (uRes.ok) setAdminUsers(await uRes.json());
        if (pRes.ok) setAdminPayments(await pRes.json());
        setActiveApproval(null);
        setApprovalNotes('');
      } else {
        alert('Failed to update membership.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    }
  };

  // Add Link
  const handleAddLink = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newLinkItem = {
      id: `link-${Date.now()}`,
      title: newTitle.trim(),
      url: formattedUrl,
      active: true
    };

    const updatedProfile = {
      ...profile,
      links: [...profile.links, newLinkItem]
    };

    setProfile(updatedProfile);
    setNewTitle('');
    setNewUrl('');
    handleSave(updatedProfile);
  };

  // Delete Link
  const handleDeleteLink = (id) => {
    const updatedLinks = profile.links.filter(l => l.id !== id);
    const updatedProfile = { ...profile, links: updatedLinks };
    setProfile(updatedProfile);
    handleSave(updatedProfile);
  };

  // Toggle Link Active Status
  const handleToggleLink = (id) => {
    const updatedLinks = profile.links.map(l => {
      if (l.id === id) {
        return { ...l, active: !l.active };
      }
      return l;
    });
    const updatedProfile = { ...profile, links: updatedLinks };
    setProfile(updatedProfile);
    handleSave(updatedProfile);
  };

  // Edit Link detail
  const handleEditLinkText = (id, field, value) => {
    const updatedLinks = profile.links.map(l => {
      if (l.id === id) {
        return { ...l, [field]: value };
      }
      return l;
    });
    setProfile({ ...profile, links: updatedLinks });
  };

  // Theme updates
  const handleUpdateTheme = (key, value) => {
    const updatedProfile = {
      ...profile,
      theme: {
        ...profile.theme,
        [key]: value
      }
    };
    setProfile(updatedProfile);
    handleSave(updatedProfile);
  };

  // Upgrade to Pro Request
  const handleUpgradeToPro = () => {
    setShowProModal(true);
  };
  
  const handleProUpgradeSuccess = () => {
    setProStatus('pending');
    const cachedUser = localStorage.getItem('auralink_user');
    if (cachedUser) {
      const userObj = JSON.parse(cachedUser);
      userObj.proStatus = 'pending';
      localStorage.setItem('auralink_user', JSON.stringify(userObj));
    }
  };

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
              
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem' }}>Creator Dashboard</h1>
                </div>
              </div>

              {/* TABS */}
              {activeTab === 'links' && (
                <LinksTab
                  profile={profile}
                  setProfile={setProfile}
                  username={username}
                  proStatus={proStatus}
                  tempUsername={tempUsername}
                  setTempUsername={setTempUsername}
                  isUsernameAvailable={isUsernameAvailable}
                  isUsernameChecked={isUsernameChecked}
                  setIsUsernameChecked={setIsUsernameChecked}
                  usernameSuggestions={usernameSuggestions}
                  changingUsername={changingUsername}
                  handleCheckUsername={handleCheckUsername}
                  handleChangeUsernameSubmit={handleChangeUsernameSubmit}
                  newTitle={newTitle}
                  setNewTitle={setNewTitle}
                  newUrl={newUrl}
                  setNewUrl={setNewUrl}
                  handleAddLink={handleAddLink}
                  handleToggleLink={handleToggleLink}
                  handleDeleteLink={handleDeleteLink}
                  handleEditLinkText={handleEditLinkText}
                  expandedLinkId={expandedLinkId}
                  setExpandedLinkId={setExpandedLinkId}
                  handleUpdateLinkStyle={handleUpdateLinkStyle}
                  setMediaTarget={setMediaTarget}
                  handleSave={handleSave}
                  getSocialLink={getSocialLink}
                  setSocialLink={setSocialLink}
                />
              )}

              {activeTab === 'design' && (
                <DesignTab
                  profile={profile}
                  proStatus={proStatus}
                  handleUpdateTheme={handleUpdateTheme}
                  setProfile={setProfile}
                  handleSave={handleSave}
                  setShowProModal={setShowProModal}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsTab analytics={analytics} />
              )}

              {activeTab === 'admin' && isAdmin && (
                <AdminTab
                  adminSettings={adminSettings}
                  setAdminSettings={setAdminSettings}
                  adminPayments={adminPayments}
                  setAdminPayments={setAdminPayments}
                  adminUsers={adminUsers}
                  setAdminUsers={setAdminUsers}
                  adminReports={adminReports}
                  setAdminReports={setAdminReports}
                  savingSettings={savingSettings}
                  handleSaveSettings={handleSaveSettings}
                  handleAdminQRUpload={handleAdminQRUpload}
                  activeApproval={activeApproval}
                  setActiveApproval={setActiveApproval}
                  approvalStartDate={approvalStartDate}
                  setApprovalStartDate={setApprovalStartDate}
                  approvalEndDate={approvalEndDate}
                  setApprovalEndDate={setApprovalEndDate}
                  approvalNotes={approvalNotes}
                  setApprovalNotes={setApprovalNotes}
                  submitApproval={submitApproval}
                  enlargedReceiptUrl={enlargedReceiptUrl}
                  setEnlargedReceiptUrl={setEnlargedReceiptUrl}
                  handleAdminAction={handleAdminAction}
                  handleResolveReport={handleResolveReport}
                />
              )}

            </div>

            {/* Right: Phone preview */}
            <Simulator
              profile={profile}
              username={username}
              proStatus={proStatus}
              showMobilePreview={showMobilePreview}
              setShowMobilePreview={setShowMobilePreview}
            />

          </div>
        </main>

      </div>

      {mediaTarget && (
        <MediaManager
          username={username}
          onSelect={handleMediaSelect}
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
