import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee, Briefcase, Star, TrendingUp, ArrowUpRight,
  Loader2, Activity, Settings, ToggleLeft, ToggleRight, User,
  CheckCircle, ShieldCheck, CheckSquare, Square, Eye, MapPin, Play, Clock, Rocket, FileText, PlusCircle, Zap, X
} from 'lucide-react';
import { Camera } from 'lucide-react';
import { fetchStudentStats, fetchJobs, fetchProfile, updateProfile, fetchNotifications, fetchInvitations, updateApplicationStatus } from '../api/api';
import NotificationBell from '../components/NotificationBell';
import { useToast } from '../context/ToastContext';

const StudentDashboard = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [liveStats, setLiveStats]     = useState({ appliedCount: 0, totalEarnings: 0 });
  const [jobs, setJobs]               = useState([]);
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [appliedIds, setAppliedIds]   = useState(new Set());
  const [invitations, setInvitations] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [isViewsModalOpen, setIsViewsModalOpen] = useState(false);
  const { addToast } = useToast();
  const userName = localStorage.getItem('userName') || 'Student';

  useEffect(() => {
    fetchStudentStats()
      .then(setLiveStats)
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchProfile()
      .then(d => {
        setProfile(d);
        setIsAvailable(d.isAvailable !== false);
      })
      .catch(console.error);

    fetchInvitations()
      .then(d => {
        console.log('[DEBUG-OFFERS] Invitations fetched:', d);
        setInvitations(d);
      })
      .catch(console.error)
      .finally(() => setInvitesLoading(false));
  }, []);

  useEffect(() => {
    fetchJobs()
      .then(d => setJobs(d.slice(0, 6)))
      .catch(console.error)
      .finally(() => setJobsLoading(false));

    // Debugging notifs
    const checkNotifs = async () => {
       try {
          const data = await fetchNotifications();
          console.log('[DEBUG-DASHBOARD] NOTIF COUNT:', data?.length || 0);
       } catch(e) {
          console.error('[DEBUG-DASHBOARD] NOTIF FETCH ERROR:', e);
       }
    };
    checkNotifs();  }, []);

  const navigateTo = (hash) => {
    window.location.hash = hash;
  };

  const handleDownloadResume = () => {
    window.location.hash = '#student-profile?print=true';
  };

  const handleAcceptInvite = async (invite) => {
    try {
      await updateApplicationStatus(invite._id, 'accepted');
      addToast(`Accepted invitation for ${invite.job?.title}!`, 'success');
      setInvitations(prev => prev.filter(i => i._id !== invite._id));
      // Refresh stats
      fetchStudentStats().then(setLiveStats);
    } catch (err) {
      addToast('Failed to accept invitation', 'error');
    }
  };

  const handleDeclineInvite = async (invite) => {
    try {
      await updateApplicationStatus(invite._id, 'rejected');
      addToast(`Declined invitation for ${invite.job?.title}`, 'info');
      setInvitations(prev => prev.filter(i => i._id !== invite._id));
    } catch (err) {
      addToast('Failed to decline invitation', 'error');
    }
  };

  const jobsDone = liveStats.appliedCount || 0; 
  const totalEarned = liveStats.totalEarnings || 0;

  const calculateStrength = () => {
    if (!profile) return 20;
    let score = 20;
    if (profile.bio) score += 20;
    if (profile.skills?.length > 0) score += 20;
    if (profile.portfolio?.length > 0) score += 20;
    if (jobsDone > 0) score += 20;
    return score;
  };
  
  const profileStrength = calculateStrength();
  const hasSkills = profile?.skills?.length > 0;
  const hasBio = !!profile?.bio;
  const isBeginner = jobsDone === 0;

  return (
    <div className="min-h-screen pt-24 pb-16 transition-colors" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-6xl mx-auto px-6 space-y-8">

        {/* Polished Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-[10px] bg-primary-500/10 text-primary-600 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                 {isBeginner ? <Rocket size={12} /> : <ShieldCheck size={12} />} 
                 {isBeginner ? "New Talent" : "Verified Pro"}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-black uppercase tracking-wider" style={{ background: 'var(--c-bg-card)', color: 'var(--c-text)', opacity: 0.6 }}>
                 {isBeginner ? "Beginner" : "Active"}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-1" style={{ color: 'var(--c-text)' }}>
              Welcome back, <span className="grad-text">{userName}</span> 👋
            </h1>
            <p className="text-sm font-semibold opacity-80" style={{ color: 'var(--c-muted)' }}>
              {jobsDone === 0 ? "Ready to kickstart your freelance career? Complete your profile today." : "You're doing great! Keep applying to high-paying gigs."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                const newStatus = !isAvailable; setIsAvailable(newStatus);
                try { await updateProfile({ isAvailable: newStatus }); } catch (e) { setIsAvailable(!newStatus); }
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 border hover:shadow-lg"
              style={{
                background: isAvailable ? 'rgba(5,150,105,0.05)' : 'var(--c-bg-card)',
                color: isAvailable ? '#059669' : 'var(--c-muted)',
                borderColor: isAvailable ? 'rgba(5,150,105,0.2)' : 'var(--c-border)',
              }}
            >
              <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
              {isAvailable ? 'Available for work' : 'Offline'}
            </button>

            <NotificationBell />

            <button
              onClick={() => navigateTo('#student-profile')}
              className="p-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--c-bg-card)', border: '1px solid var(--c-border)', color: 'var(--c-muted)' }}
            >
              <User size={20} />
            </button>
          </div>
        </div>

        {/* Polished Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {/* Jobs Applied */}
           <motion.div whileHover={{ y: -5 }} className="p-7 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-start gap-5 transition-all hover:shadow-xl hover:border-indigo-200 group" style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110">
                 <Briefcase size={22} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-1 opacity-80" style={{ color: 'var(--c-muted)' }}>Jobs Applied</p>
                 <p className="text-3xl font-extrabold mb-1" style={{ color: 'var(--c-text)' }}>{loading ? '—' : jobsDone}</p>
                 {jobsDone === 0 && <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Opportunity awaits</span>}
              </div>
           </motion.div>

           {/* Total Earnings */}
           <motion.div whileHover={{ y: -5 }} className="p-7 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-start gap-5 transition-all hover:shadow-xl hover:border-emerald-200 group" style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110">
                 <IndianRupee size={22} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-1 opacity-80" style={{ color: 'var(--c-muted)' }}>Total Earnings</p>
                 <p className="text-3xl font-extrabold mb-1" style={{ color: 'var(--c-text)' }}>{loading ? '—' : `₹${totalEarned.toLocaleString()}`}</p>
                 {totalEarned === 0 && <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Building wealth</span>}
              </div>
           </motion.div>

           {/* Avg Rating */}
           <motion.div whileHover={{ y: -5 }} className="p-7 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-start gap-5 transition-all hover:shadow-xl hover:border-amber-200 group" style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center transition-transform group-hover:scale-110">
                 <Star size={22} className={jobsDone > 0 ? "fill-current" : ""} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-1 opacity-80" style={{ color: 'var(--c-muted)' }}>Avg Rating</p>
                 {jobsDone > 0 ? (
                    <p className="text-3xl font-extrabold mb-1" style={{ color: 'var(--c-text)' }}>4.9</p>
                 ) : (
                    <p className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">New Talent</p>
                 )}
              </div>
           </motion.div>

           {/* Profile Views */}
           <motion.div 
              whileHover={{ y: -5 }} 
              onClick={() => setIsViewsModalOpen(true)}
              className="p-7 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-start justify-between gap-5 transition-all hover:shadow-xl hover:border-sky-200 group cursor-pointer" 
              style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}
           >
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center transition-transform group-hover:scale-110">
                 <Eye size={22} />
              </div>
              <div className="w-full">
                 <p className="text-[10px] font-black uppercase tracking-[0.15em] mb-1 opacity-80" style={{ color: 'var(--c-muted)' }}>Profile Views</p>
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-extrabold" style={{ color: 'var(--c-text)' }}>{profile?.profileViews || 0}</span>
                 </div>
                 <div className="w-full bg-gray-100/50 rounded-full h-1.5 overflow-hidden">
                    <motion.div 
                       initial={{ width: 0 }} 
                       animate={{ width: `${Math.min((profile?.profileViews || 0) * 10, 100)}%` }}
                       className="bg-sky-500 h-full rounded-full" 
                    />
                 </div>
              </div>
           </motion.div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* Live Insights */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                   onClick={() => navigateTo('#job-marketplace')}
                   className="p-4 rounded-2xl border flex items-center gap-3 cursor-pointer hover:shadow-md transition-all group"
                   style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}
                 >
                   <div className="bg-blue-50 p-2 rounded-lg text-blue-600 shadow-sm group-hover:scale-110 transition-transform"><MapPin size={16}/></div>
                   <p className="text-sm font-bold" style={{ color: 'var(--c-text)' }}>{jobsLoading ? "Locating jobs..." : `${jobs.length} jobs available near you`}</p>
                </div>
                <div 
                   onClick={() => setIsViewsModalOpen(true)}
                   className="p-4 rounded-2xl border flex items-center gap-3 cursor-pointer hover:shadow-md transition-all"
                   style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}
                 >
                    <div className="bg-purple-50 p-2 rounded-lg text-purple-600 shadow-sm"><Eye size={16}/></div>
                    <p className="text-sm font-bold" style={{ color: 'var(--c-text)' }}>
                      {profile?.profileViews || 0} businesses viewed your profile 
                      {(profile?.profileViews || 0) > 0 ? " in total" : " so far"}
                    </p>
                 </div>
             </div>

              {/* Job Invitations / Offers */}
              <AnimatePresence>
                {invitations.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-8 rounded-3xl shadow-xl border-2 border-primary-500/20 bg-gradient-to-br from-primary-50/50 to-white"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-200">
                        <Zap size={20} fill="currentColor" />
                      </div>
                      <div>
                        <h2 className="font-extrabold text-xl" style={{ color: 'var(--c-text)' }}>New Job Offers</h2>
                        <p className="text-xs font-bold text-primary-600 opacity-70 uppercase tracking-widest">Action Required</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {invitations.map((invite) => (
                        <div key={invite._id} className="p-6 rounded-2xl bg-white border border-primary-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-gray-400 overflow-hidden">
                                {invite.job?.business?.profilePicture ? (
                                  <img src={invite.job.business.profilePicture} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  invite.job?.business?.name?.[0] || '?'
                                )}
                              </div>
                              <div>
                                <p className="font-black text-sm text-gray-900">{invite.job?.title}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{invite.job?.business?.companyName || invite.job?.business?.name}</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-md uppercase">₹{invite.job?.pay}</span>
                          </div>

                          <p className="text-[11px] leading-relaxed text-gray-500 line-clamp-2 italic">
                            "{invite.job?.description || 'No description provided'}"
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                             <button 
                                onClick={() => setSelectedOffer(invite)}
                                className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-black shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95"
                              >
                                View Detailed Offer
                             </button>
                             <button 
                                onClick={() => handleDeclineInvite(invite)}
                                className="px-4 py-2.5 rounded-xl bg-gray-50 text-gray-400 text-xs font-black hover:bg-red-50 hover:text-red-500 transition-all"
                              >
                                Decline
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Offer Details Modal */}
              <AnimatePresence>
                {selectedOffer && (
                  <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedOffer(null)}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                      style={{ background: 'var(--c-bg-card)' }}
                    >
                      {/* Modal Header */}
                      <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-100" style={{ borderColor: 'var(--c-border)' }}>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary-200">
                             {selectedOffer.job?.title?.[0]}
                          </div>
                          <div>
                            <h2 className="text-2xl font-black" style={{ color: 'var(--c-text)' }}>{selectedOffer.job?.title}</h2>
                            <p className="text-sm font-bold text-primary-600 uppercase tracking-widest">
                              {selectedOffer.job?.business?.companyName || selectedOffer.job?.business?.name}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedOffer(null)}
                          className="p-2.5 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <X size={24} style={{ color: 'var(--c-text)' }} />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                        {/* Company & Job Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100" style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Proposed Salary</p>
                            <p className="text-lg font-black text-primary-600">₹{selectedOffer.job?.pay}</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100" style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Company Industry</p>
                            <p className="text-lg font-black" style={{ color: 'var(--c-text)' }}>{selectedOffer.job?.business?.industry || 'Service'}</p>
                          </div>
                        </div>

                        {/* Full Description */}
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest mb-3 opacity-40">Job Description</h4>
                          <div className="p-6 rounded-3xl bg-gray-50/50 leading-relaxed text-sm whitespace-pre-wrap" style={{ color: 'var(--c-text)', border: '1px solid var(--c-border)' }}>
                            {selectedOffer.job?.description || "No detailed description provided by the company."}
                          </div>
                        </div>

                        {/* Benefits/Tags */}
                        <div className="flex flex-wrap gap-2">
                           <span className="px-3 py-1.5 bf-white rounded-lg border border-gray-100 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                             <Clock size={14} className="text-primary-500" /> {selectedOffer.job?.duration || 'Flexible Time'}
                           </span>
                           <span className="px-3 py-1.5 bf-white rounded-lg border border-gray-100 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                             <MapPin size={14} className="text-primary-500" /> {selectedOffer.job?.location || 'Remote'}
                           </span>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div className="p-8 pt-4 bg-gray-50/50 border-t border-gray-100 flex items-center gap-4" style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                         <button 
                            onClick={() => {
                              handleAcceptInvite(selectedOffer);
                              setSelectedOffer(null);
                            }}
                            className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={18} /> Accept Job Invitation
                         </button>
                         <button 
                            onClick={() => {
                              handleDeclineInvite(selectedOffer);
                              setSelectedOffer(null);
                            }}
                            className="px-8 py-4 bg-white border border-gray-200 text-gray-400 rounded-2xl font-black hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                          >
                            Decline
                         </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Recommended Jobs */}
              <div className="p-8 rounded-3xl shadow-sm border border-gray-100" style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="font-extrabold text-lg" style={{ color: 'var(--c-text)' }}>Recommended Jobs</h2>
                  </div>

                  {jobsLoading ? (
                    <div className="flex flex-col items-center py-12" style={{ color: 'var(--c-muted)' }}>
                      <Loader2 className="animate-spin mb-3 text-primary-600" size={32} />
                      <p className="text-sm font-bold uppercase tracking-widest">Finding matches…</p>
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 transition-colors" style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm" style={{ background: 'var(--c-bg-card)' }}>
                        <Briefcase size={24} className="text-gray-400" />
                      </div>
                      <p className="text-lg font-bold mb-2" style={{ color: 'var(--c-text)' }}>No jobs yet</p>
                      <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto" style={{ color: 'var(--c-muted)' }}>Explore all available offers and apply to your first opportunity.</p>
                      <button onClick={() => navigateTo('#job-marketplace')} className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-200">
                         Explore Jobs
                      </button>
                    </div>
                  ) : (
                     <div className="space-y-3">
                       {jobs.map((job, i) => {
                         const applied = appliedIds.has(job._id);
                         return (
                           <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl gap-4 hover:border-primary-100 border border-transparent transition-all"
                             style={{ background: 'var(--c-bg-subtle)' }}>
                             <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                                 {job.title?.[0] ?? '?'}
                               </div>
                               <div>
                                 <p className="font-black text-sm" style={{ color: 'var(--c-text)' }}>{job.title}</p>
                                 <p className="text-xs" style={{ color: 'var(--c-muted)' }}>
                                   {job.location ?? 'Remote'} · {job.category}
                                 </p>
                               </div>
                             </div>
                             <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                               <p className="font-black text-sm text-primary-600">₹{job.pay ?? '—'}</p>
                               <button
                                 onClick={() => navigateTo('#job-marketplace')}
                                 className="px-4 py-2 rounded-xl text-xs font-black transition-colors"
                                 style={{
                                   background: applied ? 'rgba(5,150,105,0.1)' : 'var(--c-accent-lt)',
                                   color: applied ? '#059669' : 'var(--c-accent)',
                                 }}
                               >
                                 {applied ? '✓ Applied' : 'Apply →'}
                               </button>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                  )}
              </div>
              {/* Recent Activity */}
               <div className="p-6 rounded-3xl shadow-sm border border-gray-100" style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                  <h2 className="font-black mb-4 text-base" style={{ color: 'var(--c-text)' }}>My Activity</h2>
                  {liveStats?.appliedCount === 0 && !hasBio && !hasSkills ? (
                     <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center" style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                        <Activity size={24} className="mb-2" style={{ color: 'var(--c-muted)', opacity: 0.5 }} />
                        <p className="text-sm font-bold mb-1" style={{ color: 'var(--c-text)' }}>No activity yet</p>
                        <p className="text-xs mb-4" style={{ color: 'var(--c-muted)' }}>Start exploring jobs to see activity</p>
                        <button onClick={() => navigateTo('#job-marketplace')} className="text-xs font-bold text-primary-600 hover:underline">Explore Jobs</button>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {liveStats?.appliedCount > 0 && (
                          <div className="flex items-start gap-4">
                             <div className="mt-1 bg-green-100 text-green-600 p-1.5 rounded-full"><CheckCircle size={14} /></div>
                             <div className="flex-1">
                                <p className="text-sm font-bold leading-tight" style={{ color: 'var(--c-text)' }}>Applied to {liveStats.appliedCount} jobs</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--c-muted)' }}>Check your application status in the Jobs tab</p>
                             </div>
                          </div>
                        )}
                        {hasSkills && (
                          <div className="flex items-start gap-4">
                             <div className="mt-1 bg-blue-100 text-blue-600 p-1.5 rounded-full"><Rocket size={14} /></div>
                             <div className="flex-1">
                                <p className="text-sm font-bold leading-tight" style={{ color: 'var(--c-text)' }}>Skills verified</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--c-muted)' }}>Your profile is {profileStrength}% complete</p>
                             </div>
                          </div>
                        )}
                     </div>
                  )}
               </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Strength */}
            <div className="p-8 rounded-[2rem] shadow-sm border border-gray-100" style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
               <h3 className="font-extrabold mb-6 flex items-center justify-between" style={{ color: 'var(--c-text)' }}>
                 Profile Power
                 <span className="text-xs text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{profileStrength}%</span>
               </h3>
               <div className="relative h-3 w-full rounded-full mb-8 overflow-hidden" style={{ background: 'var(--c-border)' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${profileStrength}%` }}
                    className="absolute h-full bg-gradient-to-r from-primary-400 to-indigo-500 rounded-full"
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <div className={`w-5 h-5 rounded-full flex items-center justify-center ${hasBio ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {hasBio ? <CheckCircle size={12} /> : <Circle size={12} />}
                     </div>
                     <span className={`text-xs font-bold ${hasBio ? 'text-gray-900' : 'text-gray-400'}`}>Add a professional bio</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className={`w-5 h-5 rounded-full flex items-center justify-center ${hasSkills ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {hasSkills ? <CheckCircle size={12} /> : <Circle size={12} />}
                     </div>
                     <span className={`text-xs font-bold ${hasSkills ? 'text-gray-900' : 'text-gray-400'}`}>Add verified skills</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className={`w-5 h-5 rounded-full flex items-center justify-center ${!isBeginner ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {!isBeginner ? <CheckCircle size={12} /> : <Circle size={12} />}
                     </div>
                     <span className={`text-xs font-bold ${!isBeginner ? 'text-gray-900' : 'text-gray-400'}`}>Secure your first gig</span>
                  </div>
               </div>
               <button onClick={() => navigateTo('#student-profile')} className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition shadow-xl shadow-gray-200">
                  Update Profile
               </button>
            </div>

            {/* Smart Insights */}
            <div className="p-8 rounded-[2rem] shadow-sm border border-gray-100 border-l-4 border-l-primary-500" style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
               <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="text-primary-600" size={20} />
                  <h3 className="font-extrabold text-sm uppercase tracking-widest" style={{ color: 'var(--c-text)' }}>Smart Insights</h3>
               </div>
               <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-primary-50/50 border border-primary-100 transition-transform hover:scale-[1.02] cursor-default">
                     <p className="text-xs font-black text-primary-900 leading-relaxed">
                        Students with professional bios are <span className="text-primary-600 underline">3x more likely</span> to get hired.
                     </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 transition-transform hover:scale-[1.02] cursor-default">
                     <p className="text-xs font-black text-indigo-900 leading-relaxed">
                        The "Tech" category is currently peaking with <span className="text-indigo-600 font-black">+40% demand.</span>
                     </p>
                  </div>
               </div>
            </div>

            {/* Resume CTA */}
            <div className="p-8 rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-200 overflow-hidden relative group">
               <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
               <div className="relative z-10">
                  <FileText className="mb-4 opacity-50" size={32} />
                  <h3 className="text-xl font-black mb-2">Need a Pro Resume?</h3>
                  <p className="text-xs font-bold text-indigo-100 mb-6 leading-relaxed">Download your AI-powered resume formatted for premium gigs.</p>
                  <button onClick={handleDownloadResume} className="w-full py-3.5 bg-white text-indigo-600 rounded-xl font-black text-xs hover:bg-gray-50 transition shadow-lg flex items-center justify-center gap-2">
                     <ArrowUpRight size={16} /> Download PDF
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Views Analytics Modal */}
      <AnimatePresence>
        {isViewsModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setIsViewsModalOpen(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-md" 
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
               style={{ background: 'var(--c-bg-card)' }}
             >
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3 text-sky-500">
                      <div className="p-2 bg-sky-50 rounded-xl"><Eye size={24}/></div>
                      <h2 className="text-2xl font-black" style={{ color: 'var(--c-text)' }}>Profile Analytics</h2>
                   </div>
                   <button onClick={() => setIsViewsModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors" style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}>
                      <X size={20} />
                   </button>
                </div>
                
                <div className="space-y-6">
                   <div className="p-6 rounded-3xl border-2 border-dashed border-sky-100 text-center" style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                      <p className="text-4xl font-black grad-text mb-2">{profile?.profileViews || 0}</p>
                      <p className="text-xs font-black uppercase tracking-widest text-sky-600">Total Businesses Viewed</p>
                   </div>
                   
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--c-muted)' }}>Growth Insights</h4>
                      <div className="flex items-center gap-4 p-4 rounded-2xl border" style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                         <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><TrendingUp size={18}/></div>
                         <p className="text-[11px] font-bold" style={{ color: 'var(--c-text)' }}>Your profile visibility increased by <span className="text-green-600 font-black">+12%</span> this week.</p>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-2xl border" style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                         <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><CheckCircle size={18}/></div>
                         <p className="text-[11px] font-bold" style={{ color: 'var(--c-text)' }}>Keep your "Available for work" status ON to show up in more searches.</p>
                      </div>
                   </div>
                </div>
                
                <button onClick={() => setIsViewsModalOpen(false)} className="w-full mt-10 py-4 bg-sky-500 text-white rounded-2xl font-black shadow-xl shadow-sky-100 hover:bg-sky-600 transition-all">
                   Got it
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Simple Circle fallback for Lucide if not imported properly
const Circle = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export default StudentDashboard;
