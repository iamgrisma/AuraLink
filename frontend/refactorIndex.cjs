const fs = require('fs');
const path = require('path');

const dashboardDir = 'c:/Users/Window 11/.gemini/antigravity-ide/scratch/AuraLink/frontend/src/components/CreatorDashboard';
const indexPath = path.join(dashboardDir, 'index.jsx');

let content = fs.readFileSync(indexPath, 'utf-8');

const regex = /export default function CreatorDashboard\(\{ username, onLogout, isAdmin, onUsernameChange \}\) \{(.*?)(?=\s*if \(loading\) \{)/s;

const newStart = `import { DashboardProvider, useDashboard } from './context/DashboardContext';

function DashboardContent({ onLogout }) {
  const { 
    activeTab, setActiveTab, profile, loading, proStatus, 
    showProModal, setShowProModal, mobileMenuOpen, setMobileMenuOpen,
    showMobilePreview, setShowMobilePreview, isAdmin, username,
    adminUsers, adminReports, adminSettings, adminPayments, activeApproval, savingSettings,
    newTitle, newUrl, expandedLinkId, mediaTarget, copiedUrl,
    setNewTitle, setNewUrl, setExpandedLinkId, handleAddLink, handleDeleteLink, handleToggleLink, handleEditLinkText, handleMoveLink, handleDuplicateLink,
    handleSave, saving, handleUpdateTheme, handleUpdatePresentation,
    analytics, handleAdminAction, handleResolveReport, handleSaveSettings, handleAdminQRUpload, submitApproval
  } = useDashboard();
`;

content = content.replace(regex, newStart);

const wrapperContent = `

export default function CreatorDashboard(props) {
  return (
    <DashboardProvider {...props}>
      <DashboardContent onLogout={props.onLogout} />
    </DashboardProvider>
  );
}
`;

content += wrapperContent;

fs.writeFileSync(indexPath, content, 'utf-8');
console.log('index.jsx refactored');
