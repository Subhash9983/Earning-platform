import React, { useState } from 'react';
import { X, Briefcase, MapPin, IndianRupee, Clock, Tag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { postJob } from '../api/api';
import { useToast } from '../context/ToastContext';
import { JOB_CATEGORIES } from '../constants/jobs';

const PostJobModal = ({ isOpen, onClose, onJobPosted }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', minPay: '', maxPay: '', location: '', category: 'General',
    duration: 'Flexible', description: '', skills: '',
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArr = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      // Format pay as a range string
      const formattedPay = `₹${form.minPay}${form.maxPay ? ` - ₹${form.maxPay}` : ''}`;
      
      const job = await postJob({ ...form, pay: formattedPay, skills: skillsArr });
      addToast('Job posted successfully! 🎉', 'success');
      onJobPosted?.(job);
      onClose();
      setForm({ title: '', minPay: '', maxPay: '', location: '', category: 'General', duration: 'Flexible', description: '', skills: '' });
    } catch (err) {
      addToast(err.response?.data?.msg || 'Failed to post job.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--c-bg-card)', border: '1px solid var(--c-border)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-7 pb-5" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h2 className="font-black text-lg" style={{ color: 'var(--c-text)' }}>Post a New Job</h2>
                  <p className="text-xs" style={{ color: 'var(--c-muted)' }}>Reach 5,000+ verified students</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4 max-h-[70vh] overflow-y-auto thin-scrollbar">

              {/* Title */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--c-muted)' }}>Job Title *</label>
                <input name="title" value={form.title} onChange={onChange} required placeholder="e.g. Social Media Manager"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }} />
              </div>

              {/* Pay Range + Location row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--c-muted)' }}>Pay Scale (₹) *</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-muted)' }} />
                      <input name="minPay" value={form.minPay} onChange={onChange} required placeholder="Min"
                        className="w-full pl-8 pr-3 py-3 rounded-xl text-xs outline-none"
                        style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }} />
                    </div>
                    <span className="text-gray-400 font-bold">-</span>
                    <div className="relative flex-1">
                      <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-muted)' }} />
                      <input name="maxPay" value={form.maxPay} onChange={onChange} placeholder="Max"
                        className="w-full pl-8 pr-3 py-3 rounded-xl text-xs outline-none"
                        style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--c-muted)' }}>Location</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-muted)' }} />
                    <input name="location" value={form.location} onChange={onChange} placeholder="e.g. Mumbai"
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }} />
                  </div>
                </div>
              </div>

              {/* Category + Duration row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--c-muted)' }}>Category</label>
                  <div className="relative">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--c-muted)' }} />
                    <select name="category" value={form.category} onChange={onChange}
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-sm outline-none cursor-pointer appearance-none"
                      style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>
                      {(JOB_CATEGORIES || ['General','Tech','Marketing','Design','Events','Delivery']).map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--c-muted)' }}>Duration</label>
                  <div className="relative">
                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--c-muted)' }} />
                    <select name="duration" value={form.duration} onChange={onChange}
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-sm outline-none cursor-pointer appearance-none"
                      style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}>
                      {['Flexible','1 Day','Few Days','1 Week','2 Weeks','1 Month','Ongoing'].map(d => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--c-muted)' }}>Required Skills (comma separated)</label>
                <input name="skills" value={form.skills} onChange={onChange} placeholder="e.g. React, Canva, Communication"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--c-muted)' }}>Job Description *</label>
                <textarea name="description" value={form.description} onChange={onChange} required rows={4}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }} />
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Posting…</> : '🚀 Post Job Now'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PostJobModal;
