import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Filter, IndianRupee, Clock, Briefcase, Star, X, Loader2, ChevronRight, CheckCircle } from 'lucide-react';
import { fetchJobs, applyForJob } from '../api/api';
import { JOB_CATEGORIES as categories, LOCATIONS as locations } from '../constants/jobs';
import { useToast } from '../context/ToastContext';

const JobMarketplace = () => {
  const { addToast } = useToast();
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [location, setLocation]     = useState('Anywhere');
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    fetchJobs()
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (jobId) => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    if (!token) {
      addToast('Please log in to apply for jobs.', 'error');
      window.location.hash = '#auth';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      return;
    }
    if (role !== 'student') {
      addToast('Only students can apply for jobs.', 'error');
      return;
    }
    if (appliedIds.has(jobId)) return;
    setApplyingId(jobId);
    try {
      await applyForJob(jobId);
      setAppliedIds(prev => new Set([...prev, jobId]));
      addToast('Applied successfully! 🎉', 'success');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to apply.';
      if (msg.includes('already applied')) {
        setAppliedIds(prev => new Set([...prev, jobId]));
        addToast('You already applied for this job.', 'info');
      } else {
        addToast(msg, 'error');
      }
    } finally {
      setApplyingId(null);
    }
  };

  const filtered = jobs.filter((j) => {
    const matchSearch = !search || j.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === 'All' || j.category === category;
    const matchLoc    = location === 'Anywhere' || j.location === location;
    return matchSearch && matchCat && matchLoc;
  });

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--c-muted)' }}>Explore Gigs</p>
          <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--c-text)' }}>
            Find your next <span className="grad-text">opportunity.</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--c-muted)' }}>
            {jobs.length} verified gigs from local businesses
          </p>
        </div>

        {/* Search & Filter bar */}
        <div
          className="pcard p-4 mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          style={{ background: 'var(--c-bg-card)' }}
        >
          {/* Search */}
          <div className="flex items-center gap-3 flex-1 px-4 py-2.5 rounded-xl" style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)' }}>
            <Search size={16} style={{ color: 'var(--c-muted)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job title…"
              className="flex-1 bg-transparent outline-none text-sm font-medium"
              style={{ color: 'var(--c-text)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: 'var(--c-muted)' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer"
            style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
          >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>

          {/* Location */}
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm font-bold outline-none cursor-pointer"
            style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
          >
            {locations.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center py-24" style={{ color: 'var(--c-muted)' }}>
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-sm font-bold uppercase tracking-widest">Loading gigs…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--c-muted)' }}>
            <Briefcase size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-black mb-2" style={{ color: 'var(--c-text)' }}>No gigs found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtered.map((job, i) => (
                <motion.div
                  key={job._id ?? i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: i * 0.05 }}
                  className="pcard p-6 flex flex-col group"
                  style={{ background: 'var(--c-bg-card)' }}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black text-base flex-shrink-0"
                    >
                      {job.title?.[0] ?? 'G'}
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-black"
                      style={{ background: 'var(--c-accent-lt)', color: 'var(--c-accent)' }}
                    >
                      {job.category ?? 'General'}
                    </span>
                  </div>

                  <h3 className="font-black text-base mb-1" style={{ color: 'var(--c-text)' }}>{job.title}</h3>

                  <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: 'var(--c-muted)' }}>
                    {job.description?.slice(0, 90) ?? 'Exciting opportunity to grow your skills and earnings.'}
                    {job.description?.length > 90 ? '…' : ''}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 mb-5 text-xs font-bold" style={{ color: 'var(--c-muted)' }}>
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {job.location}
                      </span>
                    )}
                    {job.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {job.duration}
                      </span>
                    )}
                    {job.rating && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star size={12} className="fill-current" /> {job.rating}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: '1px solid var(--c-border)' }}
                  >
                    <div className="flex items-center gap-1 font-black text-sm text-primary-600">
                      <IndianRupee size={14} />
                      {job.pay ?? 'Negotiable'}
                    </div>
                    {appliedIds.has(job._id) ? (
                      <span className="flex items-center gap-1 text-xs font-black text-emerald-600">
                        <CheckCircle size={14} /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(job._id)}
                        disabled={applyingId === job._id}
                        className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-primary-600 hover:underline transition-all disabled:opacity-50"
                      >
                        {applyingId === job._id ? <Loader2 size={13} className="animate-spin" /> : null}
                        {applyingId === job._id ? 'Applying…' : 'Apply Now'}
                        {applyingId !== job._id && <ChevronRight size={14} />}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMarketplace;
