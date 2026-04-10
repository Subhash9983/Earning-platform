import React, { useState, useEffect } from 'react';
import { Menu, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';


const Navbar = () => {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const role = localStorage.getItem('role') || 'guest';

  // Dynamic Navigation based on role
  const getNavLinks = () => {
    if (role === 'student') {
      return [
        { name: 'Home',      href: '#student-dashboard' },
        { name: 'My Resume', href: '#student-profile?view=resume' },
        { name: 'Jobs',      href: '#job-marketplace' },
      ];
    }
    if (role === 'business') {
      return [
        { name: 'Dashboard',   href: '#business-dashboard' },
        { name: 'Talents',     href: '#business-dashboard' },
        { name: 'Support',     href: 'mailto:support@giggrow.com' },
      ];
    }
    // Default Guest/Marketing links
    return [
      { name: 'Home',         href: '#home' },
      { name: 'Students',     href: '#students' },
      { name: 'Businesses',   href: '#businesses' },
      { name: 'How it Works', href: '#how-it-works' },
    ];
  };

  const navLinks = getNavLinks();

  const handleLogout = () => {
    ['token', 'role', 'userName', 'userId', 'user'].forEach((k) => localStorage.removeItem(k));
    setUser(null);
    window.location.hash = '#home';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navStyle = {
    background: scrolled ? 'var(--c-bg)' : 'transparent',
    borderBottom: scrolled ? '1px solid var(--c-border)' : '1px solid transparent',
    backdropFilter: scrolled ? 'blur(14px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
    transition: 'background 0.3s, border-color 0.3s',
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 py-4" style={navStyle}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <a href="#home" className="flex items-center gap-2.5 group">
          <div className="bg-primary-600 p-2 rounded-xl text-white group-hover:rotate-6 transition-transform duration-200">
            <Activity size={18} />
          </div>
          <span className="text-lg font-black" style={{ color: 'var(--c-text)' }}>
            GigGrow<span className="text-primary-600">.</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.name}
              href={l.href}
              className="text-xs font-bold uppercase tracking-widest hover:text-primary-600 transition-colors duration-200"
              style={{ color: 'var(--c-muted)' }}
            >
              {l.name}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <>
              {/* Only show Admin Dashboard button if Admin */}
              {role === 'admin' && (
                <a
                  href='#admin-panel'
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors duration-200"
                  style={{ background: 'var(--c-bg-subtle)', color: 'var(--c-text)', border: '1px solid var(--c-border)' }}
                >
                  Admin Hub
                </a>
              )}
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl text-red-500 hover:bg-red-50 transition-colors duration-200"
                style={{ border: '1px solid var(--c-border)' }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <a href="#auth" className="text-xs font-bold uppercase tracking-widest hover:text-primary-600 transition-colors" style={{ color: 'var(--c-muted)' }}>
                Log In
              </a>
              <a
                href="#auth"
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md shadow-primary-600/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                Join Free
              </a>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl"
            style={{ color: 'var(--c-text)' }}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ background: 'var(--c-bg)', borderBottom: '1px solid var(--c-border)' }}
          >
            <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">
              {navLinks.map((l) => (
                <a
                  key={l.name}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm font-bold hover:text-primary-600 transition-colors"
                  style={{ color: 'var(--c-text)' }}
                >
                  {l.name}
                </a>
              ))}
              <div style={{ borderTop: '1px solid var(--c-border)' }} className="pt-5 space-y-3">
                <a href="#auth" onClick={() => setOpen(false)} className="block text-sm font-bold" style={{ color: 'var(--c-muted)' }}>
                  Log In
                </a>
                <a
                  href="#auth"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors"
                >
                  Join Free
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
