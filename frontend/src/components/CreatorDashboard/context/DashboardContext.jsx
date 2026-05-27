import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../../ToastContext';

const DashboardContext = createContext();
const API_BASE = '/api';

export function DashboardProvider({ children, username, onLogout, isAdmin, onUsernameChange }) {

  const { addToast } = useToast();
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
  const [copiedUrl, setCopiedUrl] = useState(false);

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
        addToast({ type: 'success', message: 'Your username has been updated successfully!' });
        if (onUsernameChange) {
          onUsernameChange(data.username);
        }
      } else {
        const errData = await res.json();
        addToast({ type: 'error', message: errData.error || 'Failed to change username.' });
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'An error occurred during username update.' });
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
        addToast({ type: 'error', message: 'Action failed.' });
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
        addToast({ type: 'error', message: 'Action failed.' });
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
        addToast({ type: 'success', message: 'Global configurations saved successfully!' });
      } else {
        addToast({ type: 'error', message: 'Failed to save settings.' });
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Error saving settings.' });
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
        addToast({ type: 'success', message: 'QR code uploaded successfully! Click "Save Configuration Settings" to apply it.' });
      } else {
        addToast({ type: 'error', message: data.error || 'Failed to upload QR code' });
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'QR upload error occurred.' });
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
        addToast({ type: 'success', message: `Successfully updated membership status for @${activeApproval.username}` });
        const [uRes, pRes] = await Promise.all([
          fetch(`${API_BASE}/admin/users`),
          fetch(`${API_BASE}/admin/payments`)
        ]);
        if (uRes.ok) setAdminUsers(await uRes.json());
        if (pRes.ok) setAdminPayments(await pRes.json());
        setActiveApproval(null);
        setApprovalNotes('');
      } else {
        addToast({ type: 'error', message: 'Failed to update membership.' });
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'An error occurred.' });
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

  const handleMoveLink = (id, direction) => {
    const currentIndex = profile.links.findIndex(l => l.id === id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= profile.links.length) return;

    const updatedLinks = [...profile.links];
    [updatedLinks[currentIndex], updatedLinks[nextIndex]] = [updatedLinks[nextIndex], updatedLinks[currentIndex]];
    const updatedProfile = { ...profile, links: updatedLinks };
    setProfile(updatedProfile);
    handleSave(updatedProfile);
  };

  const handleDuplicateLink = (id) => {
    const source = profile.links.find(l => l.id === id);
    if (!source) return;

    const duplicate = {
      ...source,
      id: `link-${Date.now()}`,
      title: `${source.title} Copy`,
      active: false
    };
    const updatedProfile = { ...profile, links: [...profile.links, duplicate] };
    setProfile(updatedProfile);
    handleSave(updatedProfile);
  };

  const handleAddTemplateLink = (template) => {
    const newLinkItem = {
      id: `link-${Date.now()}`,
      title: template.title,
      url: template.url,
      active: true,
      iconName: template.iconName || '',
      showUrl: true,
      buttonStyle: template.buttonStyle || ''
    };
    const updatedProfile = { ...profile, links: [...profile.links, newLinkItem] };
    setProfile(updatedProfile);
    handleSave(updatedProfile);
  };

  const handleCopyPublicUrl = async () => {
    const publicUrl = `${window.location.origin}/@${username}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 1800);
    } catch {
      window.prompt('Copy your public page URL', publicUrl);
    }
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

  const handleUpdatePresentation = (key, value) => {
    const updatedProfile = {
      ...profile,
      [key]: value
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

  const contextValue = {
    activeTab, setActiveTab, profile, setProfile, analytics, setAnalytics, loading, setLoading, saving, setSaving, proStatus, setProStatus, adminUsers, setAdminUsers, adminReports, setAdminReports, adminSettings, setAdminSettings, adminPayments, setAdminPayments, savingSettings, setSavingSettings, activeApproval, setActiveApproval, approvalStartDate, setApprovalStartDate, approvalEndDate, setApprovalEndDate, approvalNotes, setApprovalNotes, enlargedReceiptUrl, setEnlargedReceiptUrl, newTitle, setNewTitle, newUrl, setNewUrl, expandedLinkId, setExpandedLinkId, mediaTarget, setMediaTarget, mobileMenuOpen, setMobileMenuOpen, showMobilePreview, setShowMobilePreview, copiedUrl, setCopiedUrl, tempUsername, setTempUsername, isUsernameAvailable, setIsUsernameAvailable, isUsernameChecked, setIsUsernameChecked, usernameSuggestions, setUsernameSuggestions, changingUsername, setChangingUsername, showProModal, setShowProModal, handleCheckUsername, handleChangeUsernameSubmit, handleUpdateLinkStyle, handleMediaSelect, fetchData, handleSave, handleAdminAction, handleResolveReport, getSocialLink, setSocialLink, handleSaveSettings, handleAdminQRUpload, submitApproval, handleAddLink, handleDeleteLink, handleToggleLink, handleEditLinkText, handleMoveLink, handleDuplicateLink
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}