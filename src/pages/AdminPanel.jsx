import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, Star, Activity, FileText, Loader2, ShieldCheck, TrendingUp } from 'lucide-react';
import { fetchAdminStats } from '../api/api';

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch((err) => {
        setError(err.response?.data?.msg || 'Failed to load admin stats.');
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { icon: <Users size={20} />,    label: 'Total Students',    value: stats.students,    accent: '#4f46e5' },
    { icon: <Briefcase size={20} />,label: 'Businesses',        value: stats.businesses,  accent: '#059669' },
    { icon: <Activity size={20} />, label: 'Jobs Posted',       value: stats.jobs,        accent: '#d97706' },
    { icon: <FileText size={20} />, label: 'Applications',      value: stats.applications,accent: '#0ea5e9' },
    { icon: <Star size={20} />,     label: 'Reviews',           value: stats.reviews,     accent: '#8b5cf6' },
    { icon: <TrendingUp size={20} />,label:'Total Users',       value: (stats.students || 0) + (stats.businesses || 0), accent: '#ec4899' },
  ] : [];

  const ROLE_COLORS = { student: '#4f46e5', business: '#059669', admin: '#d97706' };

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-6xl mx-auto px-6 space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--c-muted)' }}>Admin Panel</p>
            <h1 className="text-3xl font-black" style={{ color: 'var(--c-text)' }}>Platform Overview</h1>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl text-sm font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Stats grid */}
        {loading ? (
          <div className="flex flex-col items-center py-20" style={{ color: 'var(--c-muted)' }}>
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-sm font-bold uppercase tracking-widest">Loading platform data…</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {statCards.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="pcard p-5 text-center"
                  style={{ background: 'var(--c-bg-card)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 text-white" style={{ background: c.accent }}>
                    {c.icon}
                  </div>
                  <p className="text-2xl font-black mb-1" style={{ color: 'var(--c-text)' }}>{c.value}</p>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-muted)' }}>{c.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Users */}
            {stats?.recentUsers?.length > 0 && (
              <div className="pcard p-6" style={{ background: 'var(--c-bg-card)' }}>
                <h2 className="font-black text-lg mb-6" style={{ color: 'var(--c-text)' }}>Recent Registrations</h2>
                <div className="space-y-3">
                  {stats.recentUsers.map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl"
                      style={{ background: 'var(--c-bg-subtle)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm"
                          style={{ background: ROLE_COLORS[u.role] || '#4f46e5' }}>
                          {u.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-black text-sm" style={{ color: 'var(--c-text)' }}>{u.name}</p>
                          <p className="text-xs" style={{ color: 'var(--c-muted)' }}>{u.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-black capitalize"
                          style={{ background: `${ROLE_COLORS[u.role]}20`, color: ROLE_COLORS[u.role] || '#4f46e5' }}>
                          {u.role}
                        </span>
                        {u.date && (
                          <span className="text-xs" style={{ color: 'var(--c-faint)' }}>
                            {new Date(u.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
