
import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import CreatorDashboard from './components/CreatorDashboard/index';
import PublicBioPage from './components/PublicBioPage';
import ProSalesPage from './components/ProSalesPage';
import { ToastProvider } from './components/ToastContext';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('user');

  useEffect(() => {
    // Securely fetch session from server instead of trusting localStorage
    const verifySession = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user.username);
          setRole(data.user.role);
          // Optional: cache for UI, but server is source of truth
          localStorage.setItem('auralink_user', JSON.stringify(data.user));
        } else {
          setUser(null);
          setRole('user');
          localStorage.removeItem('auralink_user');
        }
      } catch (err) {
        console.error('Session verify failed', err);
      } finally {
        setLoadingAuth(false);
      }
    };
    verifySession();
  }, []);


  // Sync state on popstate change and handle legacy hashes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    
    // Handle legacy hash routing redirect
    if (window.location.hash) {
      const hash = window.location.hash;
      if (hash.startsWith('#p/')) {
        const username = hash.replace('#p/', '');
        window.history.replaceState(null, '', `/@${username}`);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPath(`/@${username}`);
      } else if (hash === '#auth') {
        window.history.replaceState(null, '', '/auth');
         
        setCurrentPath('/auth');
      } else if (hash === '#dashboard') {
        window.history.replaceState(null, '', '/dashboard');
         
        setCurrentPath('/dashboard');
      } else {
        window.history.replaceState(null, '', '/');
         
        setCurrentPath('/');
      }
    }


    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigateTo = (path) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  const handleAuthSuccess = (username) => {
    const cachedUser = localStorage.getItem('auralink_user');
    let currentRole = 'user';
    if (cachedUser) {
      currentRole = JSON.parse(cachedUser).role || 'user';
    }
    setUser(username);
    setRole(currentRole);
    navigateTo('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout error', e);
    }
    localStorage.removeItem('auralink_user');
    setUser(null);
    setRole('user');
    navigateTo('/');
  };

  // Route resolver
  // 1. Check if public profile view: e.g. /@username
  if (currentPath.startsWith('/@')) {
    const username = currentPath.replace('/@', '').trim();
    return <PublicBioPage username={username} />;
  }

  // 2. Check fallback profile path: e.g. /p/username
  if (currentPath.startsWith('/p/')) {
    const username = currentPath.replace('/p/', '').trim();
    return <PublicBioPage username={username} />;
  }

  // 3. Main Views
  switch (currentPath) {
    case '/auth':
      return (
        <AuthForm 
          onAuthSuccess={handleAuthSuccess} 
          onBackToHome={() => navigateTo('/')} 
        />
      );
      
    case '/pro':
      return <ProSalesPage onNavigate={navigateTo} />;
      
    case '/dashboard':
      if (loadingAuth) {
        return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Loading...</div>;
      }
      if (!user) {
        // Redirect to auth if not logged in
        window.history.replaceState(null, '', '/auth');
        setCurrentPath('/auth');
        return null;
      }
      return (
        <CreatorDashboard 
          username={user} 
          onLogout={handleLogout} 
          isAdmin={role === 'admin'}
          onUsernameChange={(newUsername) => {
            setUser(newUsername);
            const cachedUser = localStorage.getItem('auralink_user');
            if (cachedUser) {
              try {
                const userObj = JSON.parse(cachedUser);
                userObj.username = newUsername;
                localStorage.setItem('auralink_user', JSON.stringify(userObj));
              } catch { /* ignore */ }
            }
            navigateTo('/dashboard');
          }}
        />
      );
    default:
      return <LandingPage onNavigate={navigateTo} />;
  }
}

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  );
}
