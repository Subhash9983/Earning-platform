import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import AuthPage from './pages/AuthPage';
import StudentProfile from './pages/StudentProfile';
import JobMarketplace from './pages/JobMarketplace';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import { ToastProvider } from './context/ToastContext';

// Valid hash routes
const ROUTES = [
  'home', 'student-dashboard', 'business-dashboard',
  'auth', 'student-profile', 'job-marketplace', 'admin-panel',
];

function getInitialView() {
  const hashFull = window.location.hash.replace('#', '');
  const hash = hashFull.split('?')[0]; // Ignore query params for routing match
  // If user is logged in and lands on root/home, redirect to their dashboard
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  if (token && role && (hash === '' || hash === 'home')) {
    return role === 'student' ? 'student-dashboard' : 'business-dashboard';
  }
  return ROUTES.includes(hash) ? hash : 'home';
}

function App() {
  const [currentView, setCurrentView] = useState(getInitialView);

  useEffect(() => {
    const handleHashChange = () => {
      const hashFull = window.location.hash.replace('#', '');
      const hash = hashFull.split('?')[0]; // Ignore query params for routing match

      // Auth guard: if going to a dashboard without a token, redirect to auth
      const token = localStorage.getItem('token');
      if ((hash === 'student-dashboard' || hash === 'business-dashboard') && !token) {
        window.location.hash = '#auth';
        setCurrentView('auth');
        return;
      }

      // Role guard: if a business tries to access student dashboard and vice versa
      const role = localStorage.getItem('role');
      if (hash === 'student-dashboard' && role === 'business') {
        setCurrentView('business-dashboard');
        return;
      }
      if (hash === 'business-dashboard' && role === 'student') {
        setCurrentView('student-dashboard');
        return;
      }

      setCurrentView(ROUTES.includes(hash) ? hash : 'home');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isFullPage = currentView === 'auth';

  return (
    <ToastProvider>
      <div className="App overflow-x-hidden relative">


        {/* ── Page Rendering ── */}
        {currentView === 'home' && <Home />}
        {currentView === 'auth' && <AuthPage />}

        {currentView === 'student-dashboard' && (
          <>
            <Navbar />
            <StudentDashboard />
          </>
        )}
        {currentView === 'business-dashboard' && (
          <>
            <Navbar />
            <BusinessDashboard />
          </>
        )}
        {currentView === 'student-profile' && (
          <>
            <Navbar />
            <StudentProfile studentId={window.location.hash.split('?id=')[1]} />
          </>
        )}
        {currentView === 'job-marketplace' && (
          <>
            <Navbar />
            <JobMarketplace />
          </>
        )}
        {currentView === 'admin-panel' && (
          <>
            <Navbar />
            <AdminPanel />
          </>
        )}
      </div>
    </ToastProvider>
  );
}

export default App;
