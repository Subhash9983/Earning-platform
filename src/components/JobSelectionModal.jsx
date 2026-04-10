import React from 'react';
import { X, Briefcase, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JobSelectionModal = ({ isOpen, onClose, jobs, onSelect, studentName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={onClose}></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-[#0f172a] w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-white/10"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent">
          <div>
            <h2 className="text-xl font-black text-white">Select a Role</h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Hire {studentName} for...</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-[400px] overflow-y-auto thin-scrollbar">
          {jobs.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                <Briefcase size={20} />
              </div>
              <p className="text-sm text-gray-400">No active jobs found.</p>
              <button 
                onClick={() => { window.location.hash = '#dashboard'; onClose(); }}
                className="mt-4 text-xs font-bold text-primary-400 hover:underline"
              >
                Post a new job first
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <button
                  key={job._id}
                  onClick={() => onSelect(job)}
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary-600/20 hover:border-primary-500/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                      <Zap size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{job.title}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{job.pay}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 bg-white/5 text-center">
          <p className="text-[10px] text-gray-500 font-medium italic">
            Choosing a role helps the student understand your requirements.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default JobSelectionModal;
