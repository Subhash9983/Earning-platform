import React, { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitReview } from '../api/api';
import { useToast } from '../context/ToastContext';

const ReviewModal = ({ isOpen, onClose, application }) => {
  const { addToast } = useToast();
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { addToast('Please select a rating.', 'error'); return; }
    setLoading(true);
    try {
      await submitReview({
        studentId: application.student?._id || application.student,
        jobId: application.job?._id || application.job,
        rating,
        comment,
      });
      addToast('Review submitted! ⭐', 'success');
      onClose();
    } catch (err) {
      addToast(err.response?.data?.msg || 'Failed to submit review.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--c-bg-card)', border: '1px solid var(--c-border)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-6 pb-5" style={{ borderBottom: '1px solid var(--c-border)' }}>
              <div>
                <h2 className="font-black text-lg" style={{ color: 'var(--c-text)' }}>Leave a Review</h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--c-muted)' }}>
                  For {application?.student?.name || 'Student'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">
              {/* Star rating */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--c-muted)' }}>Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${(hovered || rating) >= star ? 'text-amber-400 fill-current' : ''}`}
                        style={{ color: (hovered || rating) >= star ? '#f59e0b' : 'var(--c-border)' }}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm font-black self-center" style={{ color: 'var(--c-muted)' }}>
                      {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--c-muted)' }}>Comment</label>
                <textarea
                  value={comment} onChange={e => setComment(e.target.value)} rows={4}
                  placeholder="How was this student's work? What did they do well?"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Submitting…</> : '⭐ Submit Review'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
