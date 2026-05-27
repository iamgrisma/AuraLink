const fs = require('fs');
const os = require('os');
const path = require('path');

const dashboardDir = 'c:/Users/Window 11/.gemini/antigravity-ide/scratch/AuraLink/frontend/src/components/CreatorDashboard';
const indexPath = path.join(dashboardDir, 'index.jsx');
const contextDir = path.join(dashboardDir, 'context');
fs.mkdirSync(contextDir, { recursive: true });
const contextPath = path.join(contextDir, 'DashboardContext.jsx');

const content = fs.readFileSync(indexPath, 'utf-8');

const regex = /export default function CreatorDashboard\(\{ username, onLogout, isAdmin, onUsernameChange \}\) \{(.*?)\s+return \(/s;
const match = content.match(regex);
if (!match) {
  console.log('Failed to match');
  process.exit(1);
}
const stateLogic = match[1];

const contextContent = `import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../ToastContext';

const DashboardContext = createContext();
const API_BASE = '/api';

export function DashboardProvider({ children, username, onLogout, isAdmin, onUsernameChange }) {
${stateLogic}

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
}`;

fs.writeFileSync(contextPath, contextContent, 'utf-8');
console.log('Context generated successfully');
