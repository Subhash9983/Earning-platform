import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Loader2, Zap, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotifications, markAsRead, markAllAsRead } from '../api/api';

const ICONS = {
  approach: <Zap size={16} className="text-amber-500 flex-shrink-0" />,
  hired:    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />,
  application_update: <Info size={16} className="text-blue-500 flex-shrink-0" />,
  general: <Info size={16} className="text-blue-500 flex-shrink-0" />,
};

const NotificationBell = () => {
  const [open, setOpen]       = useState(false);
  const [notes, setNotes]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread]   = useState(0);
  const ref = useRef(null);

  const load = async () => {
    try {
      const data = await fetchNotifications();
      // Only show unread notifications in the list
      const unreadOnly = (data || []).filter(n => !n.isRead);
      setNotes(unreadOnly);
      setUnread(unreadOnly.length);
    } catch (err) {
      console.error('[NotificationBell] Error:', err);
    }
  };

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      // Immediately remove from UI
      setNotes(prev => prev.filter(n => n._id !== id));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const handleClearAll = async () => {
    try {
      await markAllAsRead();
      // Clear entire list
      setNotes([]);
      setUnread(0);
    } catch (err) {
      console.error('Failed to clear all');
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
        style={{ 
          background: 'var(--c-bg-card)', 
          border: '1px solid var(--c-border)', 
          color: 'var(--c-text)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <Bell size={20} className={unread > 0 ? 'animate-bounce' : ''} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[var(--c-bg-card)]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute right-0 top-full mt-3 w-80 rounded-2xl shadow-2xl z-[100] overflow-hidden border border-[var(--c-border)]"
            style={{ background: 'var(--c-bg-card)', backdropFilter: 'blur(20px)' }}
          >
            <div className="p-4 border-b border-[var(--c-border)] flex items-center justify-between">
              <h3 className="font-bold text-sm">Notifications</h3>
              {notes.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 text-[10px] text-red-500 font-bold hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors border border-red-100"
                >
                  <Trash2 size={12} /> Clear All
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notes.length === 0 ? (
                <div className="py-12 text-center opacity-40">
                  <CheckCircle size={32} className="mx-auto mb-3 text-emerald-500" />
                  <p className="text-xs font-medium">All caught up!</p>
                </div>
              ) : (
                notes.map((n, i) => (
                  <div 
                    key={n._id || i}
                    onClick={() => handleRead(n._id)}
                    className="p-4 border-b border-[var(--c-border)] last:border-0 hover:bg-primary-500/5 cursor-pointer transition-colors flex gap-3 group"
                  >
                    <div className="mt-1">{ICONS[n.type] || ICONS.general}</div>
                    <div className="flex-1">
                      <p className="text-xs leading-relaxed font-medium group-hover:text-primary-600 transition-colors">{n.message}</p>
                      <div className="flex items-center justify-between mt-2">
                         <span className="text-[9px] opacity-40 uppercase tracking-tighter">
                           {n.date ? new Date(n.date).toLocaleDateString() : 'Just now'}
                         </span>
                         <span className="text-[8px] font-bold text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity">
                           Done
                         </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
