import { 
  Link2, BarChart3, Palette, User, Save, QrCode,
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
import QRCodeGenerator from './QRCodeGenerator';


import { DashboardProvider, useDashboard } from './context/DashboardContext';

function DashboardContent({ onLogout }) {
  const { 
    activeTab, setActiveTab, profile, loading, proStatus, 
    showProModal, setShowProModal, mobileMenuOpen, setMobileMenuOpen,
    setShowMobilePreview, isAdmin, username, mediaTarget, copiedUrl,
    handleSave, saving, fetchData, handleUpgradeToPro,
    handleProUpgradeSuccess, handleCopyPublicUrl,
    setMediaTarget, handleMediaSelect
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
        <div className="empty-state-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>

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
      <div className="dashboard-save-bar" style={{
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
