import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee, Users, Briefcase, Star, Plus, 
  Activity, MapPin, Clock, Loader2, ChevronDown, ChevronUp,
  CheckCircle, XCircle, MessageSquare, Trash2, Search, Filter,
  Lightbulb, Zap, TrendingUp, Award, AlertCircle, ArrowRight
} from 'lucide-react';
import { fetchMyJobs, fetchApplicants, updateApplicationStatus, deleteJob, fetchStudents, sendNotification } from '../api/api';
import { useToast } from '../context/ToastContext';
import PostJobModal from '../components/PostJobModal';
import NotificationBell from '../components/NotificationBell';
import JobSelectionModal from '../components/JobSelectionModal';
import ReviewModal from '../components/ReviewModal';

const StatCard = ({ icon, label, value, sub, accent, onClick }) => (
  <div 
    className="pcard p-6 flex flex-col justify-between transition-transform hover:-translate-y-1 cursor-pointer group" 
    style={{ background: 'var(--c-bg-card)' }}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
       <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-black/10 group-hover:scale-110 transition-transform" style={{ background: accent }}>{icon}</div>
       <ArrowRight size={16} className="text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
    </div>
    <div>
      <p className="text-2xl font-black mb-1" style={{ color: 'var(--c-text)' }}>{value}</p>
      <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--c-muted)' }}>{label}</p>
      {sub && <p className="text-[10px] mt-2 font-bold text-gray-400 uppercase">{sub}</p>}
    </div>
  </div>
);

const BusinessDashboard = () => {
  const { addToast } = useToast();
  const [jobs, setJobs]                   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [expandedJob, setExpandedJob]     = useState(null);
  const [applicants, setApplicants]       = useState({});
  const [appsLoading, setAppsLoading]     = useState({});
  const [reviewApp, setReviewApp]         = useState(null);
  const [showTalentModal, setShowTalentModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [candidateModal, setCandidateModal] = useState({ isOpen: false, tab: 'all' });
  const [publicTalents, setPublicTalents] = useState([]);
  const [realStats, setRealStats]         = useState({ hired: 0, pending: 0, totalApps: 0 });
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [businessJobs, setBusinessJobs] = useState([]);
  
  const businessName = localStorage.getItem('userName') || 'Business Partner';

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try { 
      const myJobs = await fetchMyJobs();
      setJobs(myJobs);

      // Pre-fetch applicants to calculate real stats
      let h = 0, p = 0, t = 0;
      for (const j of myJobs) {
         if (j.applicants > 0) {
            try {
               const apps = await fetchApplicants(j._id);
               setApplicants(prev => ({ ...prev, [j._id]: apps }));
               p += apps.filter(a => a.status === 'pending').length;
               h += apps.filter(a => a.status === 'accepted').length;
               t += apps.length;
            } catch (e) {}
         }
      }
      setRealStats({ hired: h, pending: p, totalApps: t });
    }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const loadPublicTalents = async () => {
     try {
        const data = await fetchStudents();
        setPublicTalents(data.filter(s => s.rating >= 4.0).slice(0, 3));
     } catch (e) { console.error('Failed fetching talents', e); }
  }

  useEffect(() => { 
      loadJobs(); 
      loadPublicTalents();
  }, [loadJobs]);

  const loadApplicants = async (jobId) => {
    if (applicants[jobId]) return; // cached
    setAppsLoading(p => ({ ...p, [jobId]: true }));
    try {
      const data = await fetchApplicants(jobId);
      setApplicants(p => ({ ...p, [jobId]: data }));
    } catch { addToast('Failed to load applicants', 'error'); }
    finally { setAppsLoading(p => ({ ...p, [jobId]: false })); }
  };

  const toggleJob = (jobId) => {
    if (expandedJob === jobId) { setExpandedJob(null); return; }
    setExpandedJob(jobId);
    loadApplicants(jobId);
  };

  const handleStatus = async (appId, status, jobId) => {
    try {
      await updateApplicationStatus(appId, status);
      setApplicants(p => ({
        ...p,
        [jobId]: p[jobId].map(a => a._id === appId ? { ...a, status } : a),
      }));
      addToast(status === 'accepted' ? 'Applicant accepted! 🎉' : 'Application rejected.', status === 'accepted' ? 'success' : 'info');
    } catch { addToast('Failed to update status.', 'error'); }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job listing?')) return;
    try {
      await deleteJob(jobId);
      setJobs(j => j.filter(x => x._id !== jobId));
      addToast('Job deleted.', 'info');
    } catch { addToast('Failed to delete job.', 'error'); }
  };

  // Derive metrics
  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const { hired: successfulHired, pending: pendingAppsCount, totalApps: totalAppsCount } = realStats;

  // Calculate Pipeline Progress Percentage
  const getPipelineProgress = () => {
     if (successfulHired > 0) return 100;
     if (totalAppsCount > 0) return 50;
     if (jobs.length > 0) return 0;
     return -1; // No progress
  };
  const pipelineProgress = getPipelineProgress();

  const handleHireDirect = async (student) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        addToast('Please login to hire students', 'error');
        return;
      }

      const myJobs = await fetchMyJobs();
      const activeJobs = myJobs.filter(j => j.status === 'active');
      
      if (activeJobs.length === 0) {
        addToast('Please post an active job first', 'error');
        return;
      }

      setSelectedStudent(student);
      setBusinessJobs(activeJobs);
      setShowJobModal(true);
    } catch (err) {
      console.error('Hiring error:', err);
      addToast('Failed to fetch jobs', 'error');
    }
  };

  const confirmHire = async (job) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await sendNotification({
        recipientId: selectedStudent._id,
        message: `${user.name || 'A business'} has approached you for the "${job.title}" role!`,
        type: 'approach',
        jobId: job._id
      });
      addToast(`Direct approach for "${job.title}" sent to ${selectedStudent.name}!`, 'success');
      setShowJobModal(false);
    } catch (err) {
      addToast('Failed to send approach request', 'error');
    }
  };

  const stats = [
    { 
       icon: <Briefcase size={20} />,   label: 'Active Jobs',          value: activeJobs,      sub: 'Currently open',     accent: '#4f46e5',
       onClick: () => {
          const el = document.getElementById('active-jobs-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
       }
    },
    { 
       icon: <Users size={20} />,       label: 'Candidates Waiting',   value: pendingAppsCount,sub: 'Needs review',       accent: '#059669',
       onClick: () => setCandidateModal({ isOpen: true, tab: 'pending' })
    },
    { 
       icon: <CheckCircle size={20} />, label: 'Successful Hires',     value: successfulHired, sub: 'Completed matches',  accent: '#d97706',
       onClick: () => setCandidateModal({ isOpen: true, tab: 'accepted' })
    },
    { 
       icon: <Clock size={20} />,       label: 'Total Applicants',     value: totalAppsCount,  sub: 'Across active jobs', accent: '#0ea5e9',
       onClick: () => setCandidateModal({ isOpen: true, tab: 'all' })
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-7xl mx-auto px-6 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-blue-100 text-blue-700">
                 <CheckCircle size={12} /> Verified Business
              </span>
              <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: 'var(--c-bg-card)', color: 'var(--c-text)' }}>
                 Employer Badge
              </span>
            </div>
            <h1 className="text-4xl font-black mb-1" style={{ color: 'var(--c-text)' }}>
              Welcome, <span className="grad-text">{businessName}</span> 🏢
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--c-muted)' }}>
              Find your next top talent. Review applicants and post jobs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={() => setShowPostModal(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              <Plus size={18} /> Post New Job
            </button>
          </div>
        </div>

        {/* 1. TOP ACTION ALERT */}
        {pendingAppsCount > 0 && (
           <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border shadow-sm" style={{ background: 'var(--c-accent-lt)', borderColor: 'var(--c-accent)', color: 'var(--c-text)' }}>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm" style={{ color: 'var(--c-accent)' }}>
                    <AlertCircle size={24} />
                 </div>
                 <div>
                    <h3 className="font-extrabold text-lg">Action Required: {pendingAppsCount} New Applicants</h3>
                    <p className="text-sm opacity-80 font-medium mt-0.5">You have highly-rated candidates waiting for a response.</p>
                 </div>
              </div>
              <button onClick={() => {
                 for (let jobId in applicants) {
                    if (applicants[jobId].some(a => a.status === 'pending')) {
                       setExpandedJob(jobId);
                       const el = document.getElementById('active-jobs-section');
                       if (el) el.scrollIntoView({ behavior: 'smooth' });
                       return;
                    }
                 }
                 if(jobs.length > 0) toggleJob(jobs[0]._id);
              }} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white hover:scale-105 transition-transform whitespace-nowrap shadow-sm text-primary-700">
                 Review Candidates
              </button>
           </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Main Left Column (Stats + Jobs) */}
           <div className="lg:col-span-2 space-y-8">
              
              {/* 2. STATS SECTION */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 {stats.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <StatCard {...s} />
                    </motion.div>
                 ))}
              </div>

              {/* 5. HIRING FUNNEL */}
              <div className="p-6 rounded-3xl border border-gray-100" style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                 <p className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: 'var(--c-muted)' }}>Hiring Pipeline</p>
                 <div className="flex items-center justify-between relative px-2">
                    {/* connecting line */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-10 right-10 h-1 rounded-full z-0" style={{ background: 'var(--c-bg-subtle)' }}></div>
                    {pipelineProgress >= 0 && (
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${pipelineProgress}%` }}
                          className="absolute top-1/2 -translate-y-1/2 left-10 h-1 bg-primary-500 rounded-full z-0 shadow-[0_0_10px_rgba(var(--c-primary-rgb),0.3)]"
                          style={{ 
                             width: `calc(${pipelineProgress}% - ${pipelineProgress === 100 ? '20px' : '0px'})`,
                             background: 'var(--c-primary)' 
                          }}
                       ></motion.div>
                    )}

                    {[
                       { label: 'Jobs Posted', count: jobs.length || 0, icon: <Briefcase size={16}/>, color: 'text-indigo-600', active: pipelineProgress >= 0 },
                       { label: 'Applicants', count: totalAppsCount, icon: <Users size={16}/>, color: 'text-blue-600', active: pipelineProgress >= 50 },
                       { label: 'Hired', count: successfulHired, icon: <CheckCircle size={16}/>, color: 'text-emerald-600', active: pipelineProgress >= 100 }
                    ].map((step, idx) => (
                       <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                          <div 
                             className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md font-bold border-4 transition-all duration-500 ${step.active ? 'scale-110' : 'opacity-50 gray-scale'}`}
                             style={{ 
                                background: step.active ? 'var(--c-bg-card)' : 'var(--c-bg-subtle)',
                                borderColor: step.active ? 'var(--c-primary)' : 'var(--c-border)',
                                color: step.active ? 'var(--c-text)' : 'var(--c-muted)'
                             }}
                          >
                             {step.count}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wide transition-colors ${step.active ? '' : 'opacity-40'}`} style={{ color: step.active ? 'var(--c-text)' : 'var(--c-muted)' }}>{step.label}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* 3. UPGRADED ACTIVE JOB LIST */}
              <div id="active-jobs-section" className="pcard overflow-hidden" style={{ background: 'var(--c-bg-card)' }}>
                 <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100" style={{ borderColor: 'var(--c-border)' }}>
                    <h2 className="font-extrabold text-xl flex items-center gap-2" style={{ color: 'var(--c-text)' }}>
                       <Briefcase className="text-primary-600" /> Active Job Listings
                    </h2>
                    <button onClick={() => setShowPostModal(true)} className="text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition">
                       + New Job
                    </button>
                 </div>

                 {loading ? (
                    <div className="flex flex-col items-center py-16" style={{ color: 'var(--c-muted)' }}>
                       <Loader2 className="animate-spin mb-3" size={28} />
                       <p className="text-xs font-bold uppercase tracking-widest">Loading listings…</p>
                    </div>
                 ) : jobs.length === 0 ? (
                    // 9. EMPTY STATE IMPROVEMENT
                    <div className="text-center py-16 px-6" style={{ color: 'var(--c-muted)' }}>
                       <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--c-bg-subtle)' }}>
                          <Users size={36} className="opacity-40" />
                       </div>
                       <p className="text-xl font-black mb-2" style={{ color: 'var(--c-text)' }}>No active applicants yet</p>
                       <p className="text-sm mb-8 max-w-sm mx-auto">Post a highly detailed job description to attract top student talent fast.</p>
                       <div className="flex justify-center gap-4">
                          <button onClick={() => setShowPostModal(true)} className="px-6 py-3 bg-primary-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-all shadow-md">
                             Post Job
                          </button>
                          <button onClick={() => setShowTalentModal(true)} className="px-6 py-3 bg-white text-gray-700 border border-gray-200 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all shadow-sm" style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}>
                             <Search size={14} className="inline mr-1 mb-0.5"/> Browse Talent
                          </button>
                       </div>
                    </div>
                 ) : (
                    <div className="divide-y divide-gray-100" style={{ borderColor: 'var(--c-border)' }}>
                       {jobs.map((job) => (
                          <div key={job._id}>
                             <div 
                               className="px-6 py-5 cursor-pointer hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                               onClick={() => toggleJob(job._id)}
                             >
                                <div className="flex gap-4">
                                   <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-sm">
                                      {job.title?.[0]?.toUpperCase() ?? 'J'}
                                   </div>
                                   <div>
                                      <h3 className="font-extrabold text-[15px] mb-1" style={{ color: 'var(--c-text)' }}>{job.title}</h3>
                                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase bg-clip-text text-transparent bg-gradient-to-r from-gray-500 to-gray-400" style={{ color: 'var(--c-muted)' }}>
                                         <span className="flex items-center gap-1"><MapPin size={12}/>{job.location || 'Remote'}</span>
                                         <span className="flex items-center gap-1"><IndianRupee size={12}/>{job.pay}</span>
                                         <span className="flex items-center gap-1"><Clock size={12}/> {job.duration || 'Flexible'}</span>
                                      </div>
                                   </div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <div className="text-right">
                                      {job.applicants > 0 ? (
                                         <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 mb-1">
                                            <Star size={10} className="fill-current"/> Top applicants
                                         </span>
                                      ) : null}
                                      <p className="text-sm font-bold text-primary-600">
                                         {job.applicants || 0} Applicants
                                      </p>
                                   </div>
                                   <div className="bg-gray-100 p-2 rounded-lg" style={{ background: 'var(--c-bg-subtle)' }}>
                                      {expandedJob === job._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                   </div>
                                </div>
                             </div>

                             {/* Applicants Panel inside Job */}
                             <AnimatePresence>
                                {expandedJob === job._id && (
                                   <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50/50 border-t border-gray-100" style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-subtle)' }}>
                                      <div className="px-6 py-5">
                                         {appsLoading[job._id] ? (
                                            <div className="flex items-center justify-center p-4">
                                               <Loader2 className="animate-spin text-primary-600" />
                                            </div>
                                         ) : !applicants[job._id] || applicants[job._id].length === 0 ? (
                                            <p className="text-sm font-medium opacity-60 text-center py-4">No candidates have applied yet.</p>
                                         ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                               {applicants[job._id].map(app => (
                                                  <div key={app._id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between" style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                                                     <div className="flex items-start justify-between mb-4 cursor-pointer" onClick={() => window.location.hash = `#student-profile?id=${app.student?._id || app.student?.id}`}>
                                                        <div className="flex items-center gap-3">
                                                           <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold uppercase text-lg shadow-inner">
                                                              {app.student?.name?.[0] ?? '?'}
                                                           </div>
                                                           <div>
                                                              <h4 className="font-bold text-sm hover:text-primary-600 transition-colors" style={{ color: 'var(--c-text)' }}>{app.student?.name ?? 'Candidate'}</h4>
                                                              <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">{app.student?.university || 'Pro Talent'}</p>
                                                           </div>
                                                        </div>
                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${app.status === 'accepted' ? 'text-emerald-700 bg-emerald-100' : app.status === 'rejected' ? 'text-red-600 bg-red-100' : 'text-amber-700 bg-amber-100'}`}>
                                                           {app.status}
                                                        </span>
                                                     </div>

                                                     <div className="flex gap-2">
                                                        {app.status === 'pending' && (
                                                           <>
                                                              <button onClick={() => handleStatus(app._id, 'accepted', job._id)} className="flex-1 py-2 text-[11px] font-bold uppercase tracking-wider bg-black text-white hover:bg-gray-800 rounded-xl transition">Accept</button>
                                                              <button onClick={() => handleStatus(app._id, 'rejected', job._id)} className="flex-1 py-2 text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition" style={{ background: 'var(--c-bg-subtle)', color: 'var(--c-text)' }}>Decline</button>
                                                           </>
                                                        )}
                                                        {app.status === 'accepted' && (
                                                           <button onClick={() => setReviewApp({ ...app, job })} className="w-full py-2 text-[11px] font-bold uppercase tracking-wider bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl transition">Rate & Review</button>
                                                        )}
                                                     </div>
                                                  </div>
                                               ))}
                                            </div>
                                         )}
                                      </div>
                                   </motion.div>
                                )}
                             </AnimatePresence>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>

           {/* Right Column (Insights & Recommended Candidates) */}
           <div className="space-y-8">
              
              {/* 10. QUICK ACTIONS */}
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setShowTalentModal(true)} className="p-4 rounded-3xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-emerald-500/10 transition-all text-left group" style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                       <Search size={18} />
                    </div>
                    <p className="font-extrabold text-sm" style={{ color: 'var(--c-text)' }}>Talent Hub</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1" style={{ color: 'var(--c-muted)' }}>Browse All</p>
                 </button>
                 <button onClick={() => setShowAnalyticsModal(true)} className="p-4 rounded-3xl border border-gray-100 bg-white hover:border-amber-200 hover:shadow-amber-500/10 transition-all text-left group" style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                       <TrendingUp size={18} />
                    </div>
                    <p className="font-extrabold text-sm" style={{ color: 'var(--c-text)' }}>Analytics</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mt-1" style={{ color: 'var(--c-muted)' }}>View Metrics</p>
                 </button>
              </div>

              {/* 6. INSIGHTS SECTION */}
              <div className="p-6 rounded-3xl border border-gray-100 bg-gradient-to-br from-indigo-50/50 to-transparent" style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-card)' }}>
                 <p className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--c-muted)' }}>
                    <Lightbulb size={14} className="text-yellow-500"/> Smart Insights
                 </p>
                 <div className="space-y-3">
                    <div className="flex gap-3 items-start p-3 bg-white rounded-2xl shadow-sm border border-gray-50" style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                       <Zap size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                       <p className="text-[13px] font-medium leading-snug" style={{ color: 'var(--c-text)' }}>Tech tasks are getting 40% more applications this week.</p>
                    </div>
                    <div className="flex gap-3 items-start p-3 bg-white rounded-2xl shadow-sm border border-gray-50" style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                       <TrendingUp size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                       <p className="text-[13px] font-medium leading-snug" style={{ color: 'var(--c-text)' }}>Increase pay by 10% to rank higher in student searches.</p>
                    </div>
                 </div>
              </div>

              {/* 4. RECOMMENDED CANDIDATES */}
              <div className="p-6 rounded-3xl border border-gray-100" style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg-card)' }}>
                 <div className="flex items-center justify-between mb-5">
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--c-muted)' }}>Top Recommended</p>
                    <Award size={16} className="text-amber-500" />
                 </div>
                 <div className="space-y-4">
                    {publicTalents.length === 0 ? (
                       <div className="text-center p-4">
                          <p className="text-xs text-gray-500 font-bold uppercase">No recommendations available</p>
                       </div>
                    ) : (
                       publicTalents.map(talent => (
                          <div key={talent._id} className="p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 transition-all group" style={{ background: 'var(--c-bg)' }}>
                             <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black text-lg flex items-center justify-center uppercase">
                                   {talent.name?.[0] ?? 'T'}
                                </div>
                                <div>
                                   <h4 className="font-extrabold text-sm" style={{ color: 'var(--c-text)' }}>{talent.name}</h4>
                                   <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] font-bold text-gray-500 uppercase">{talent.skills?.[0] || 'General'}</span>
                                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600"><Star size={10} className="fill-current"/> {talent.rating ? talent.rating.toFixed(1) : '5.0'}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => window.location.hash = `#student-profile?id=${talent._id}`} className="flex-1 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest bg-gray-200 text-gray-700 hover:bg-gray-300 transition" style={{ background: 'var(--c-bg-subtle)' }}>
                                   View Profile
                                </button>
                                <button 
                                  onClick={() => handleHireDirect(talent)}
                                  className="flex-1 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 shadow-md transition">
                                   Hire Direct
                                </button>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>

           </div>
        </div>
      </div>

      {/* Post Job Modal */}
      <PostJobModal isOpen={showPostModal} onClose={() => setShowPostModal(false)} onJobPosted={(job) => { setJobs(j => [job, ...j]); }} />

      {/* Review Modal */}
      <ReviewModal isOpen={!!reviewApp} onClose={() => setReviewApp(null)} application={reviewApp} />

      {/* Browse Talent Modal */}
      <BrowseTalentModal isOpen={showTalentModal} onClose={() => setShowTalentModal(false)} />

      {/* Analytics Modal */}
      <AnalyticsModal 
        isOpen={showAnalyticsModal} 
        onClose={() => setShowAnalyticsModal(false)} 
        jobs={jobs} 
        applicants={applicants}
      />

      {/* Unified Candidate Tracker Modal */}
      <CandidateTrackerModal 
        isOpen={candidateModal.isOpen} 
        initialTab={candidateModal.tab} 
        onClose={() => setCandidateModal({ ...candidateModal, isOpen: false })}
        applicants={applicants}
        jobs={jobs}
      />
      <JobSelectionModal 
          isOpen={showJobModal}
          onClose={() => setShowJobModal(false)}
          jobs={businessJobs}
          onSelect={confirmHire}
          studentName={selectedStudent?.name}
        />
    </div>
  );
};

/* --- Inline Modals --- */

const BrowseTalentModal = ({ isOpen, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [minJobs, setMinJobs] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchStudents().then(setStudents).catch(console.error).finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredStudents = students.filter(s => {
     const query = searchQuery.toLowerCase();
     const matchesSearch = !query || s.name?.toLowerCase().includes(query) || s.university?.toLowerCase().includes(query) || s.skills?.some(skill => skill.toLowerCase().includes(query));
     const matchesRating = (s.rating || 0) >= minRating;
     const matchesJobs = (s.jobsCompleted || 0) >= minJobs;
     return matchesSearch && matchesRating && matchesJobs;
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]" style={{ background: "var(--c-bg-card)", color: "var(--c-text)" }}>
        <div className="px-8 py-6 border-b flex justify-between items-center" style={{ borderColor: "var(--c-border)" }}>
          <h2 className="text-2xl font-black flex items-center gap-2"><Users className="text-primary-600" /> Browse Top Talent</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors"><XCircle size={28} /></button>
        </div>
        
        {/* Filters Section */}
        <div className="px-8 py-4 border-b flex flex-col sm:flex-row gap-4" style={{ borderColor: "var(--c-border)", background: "var(--c-bg-subtle)" }}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search by name, skills, or university..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm" style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }} />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="pl-9 pr-8 py-3 rounded-xl border outline-none font-bold text-xs appearance-none" style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}>
                <option value="0">All Ratings</option>
                <option value="4">4.0+ Rating</option>
                <option value="4.8">4.8+ Rating</option>
              </select>
            </div>
            <select value={minJobs} onChange={(e) => setMinJobs(Number(e.target.value))} className="px-4 pr-8 py-3 rounded-xl border outline-none font-bold text-xs appearance-none" style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}>
               <option value="0">Any Exp</option>
               <option value="5">5+ Jobs</option>
               <option value="10">10+ Jobs</option>
            </select>
          </div>
        </div>

        <div className="p-8 overflow-y-auto">
          {loading ? <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
          : filteredStudents.length === 0 ? <div className="text-center py-10 opacity-60"><p className="font-bold">No talents found.</p></div>
          : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStudents.map(s => (
                   <div key={s._id} className="p-5 rounded-2xl border transition shadow-sm cursor-pointer hover:shadow-md hover:border-primary-200" style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg)' }} onClick={() => window.location.hash = `#student-profile?id=${s._id}`}>
                      <div className="flex items-center gap-4 mb-4">
                         <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl uppercase text-white shadow-sm" style={{ background: `linear-gradient(135deg, var(--c-primary), #312e81)` }}>{s.name?.[0] || 'T'}</div>
                         <div>
                            <p className="font-extrabold text-base">{s.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] font-bold text-primary-600 px-2 py-0.5 bg-primary-50 rounded-md uppercase">{s.jobsCompleted || 0} Jobs</span>
                               <span className="flex items-center gap-0.5 text-yellow-500 font-bold text-xs"><Star size={11} className="fill-current"/> {s.rating ? (s.rating).toFixed(1) : 'New'}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex gap-2 flex-wrap mb-4">
                         {s.skills?.slice(0, 3).map((skill, i) => (
                           <span key={i} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-md bg-opacity-50" style={{ background: 'var(--c-bg-subtle)' }}>{skill}</span>
                         ))}
                      </div>
                      <button className="w-full py-2.5 bg-gray-900 text-white hover:bg-black rounded-xl text-xs font-black uppercase tracking-widest transition">View Profile</button>
                   </div>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};


const AnalyticsModal = ({ isOpen, onClose, jobs, applicants }) => {
  if (!isOpen) return null;
  
  // Helper to parse min/max from pay string "₹500 - ₹1000" or "₹500"
  const parsePay = (payStr) => {
     if (!payStr) return [0, 0];
     const nums = payStr.match(/\d+/g);
     if (!nums) return [0, 0];
     const first = Number(nums[0]);
     const last = nums.length > 1 ? Number(nums[1]) : first;
     return [first, last];
  };

  const spendRange = jobs.reduce((acc, j) => {
     const [min, max] = parsePay(j.pay);
     acc[0] += min;
     acc[1] += max;
     return acc;
  }, [0, 0]);

  const [minTotal, maxTotal] = spendRange;
  const totalApps = jobs.reduce((a, j) => a + (j.applicants || 0), 0);

  // Calculate Actual Spend (Sum of pay for all accepted candidates)
  const actualHiredSpend = jobs.reduce((total, job) => {
     const jobApps = applicants[job._id] || [];
     const isHired = jobApps.some(a => a.status === 'accepted');
     if (isHired) {
        const [min] = parsePay(job.pay); // Assume min as committed for now or extract if stored
        return total + min;
     }
     return total;
  }, 0);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-[#0f172a] w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/10" style={{ color: "white" }}>
        
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-primary-600/20 flex items-center justify-center text-primary-400 border border-primary-500/30">
                <Activity size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black">Hiring Insights</h2>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Real-time Performance</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><XCircle size={24} className="text-gray-400" /></button>
        </div>

        <div className="px-10 pb-10 space-y-8 overflow-y-auto max-h-[70vh] thin-scrollbar">
           
           {/* Top Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-[32px] bg-gradient-to-br from-primary-600 to-indigo-700 shadow-xl shadow-primary-900/20 relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-125 transition-transform duration-700 text-white">
                    <IndianRupee size={120} />
                 </div>
                 <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 relative z-10">Total Estimated Budget</p>
                 <h3 className="text-2xl font-black text-white relative z-10">
                    ₹{minTotal}{maxTotal !== minTotal ? ` - ₹${maxTotal}` : ''}
                 </h3>
                 <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                    <span className="text-[10px] font-bold text-white/50">Utilized: ₹{actualHiredSpend}</span>
                    <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">LIVE</span>
                 </div>
              </div>

              <div className="p-6 rounded-[32px] bg-white/5 border border-white/10 flex flex-col justify-between">
                 <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Conversion Efficiency</p>
                    <h3 className="text-3xl font-black">{totalApps ? Math.min((jobs.length / totalApps)*100, 100).toFixed(0) : 0}%</h3>
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-2">
                    <CheckCircle size={12} className="text-emerald-500" /> Based on {jobs.length} jobs
                 </div>
              </div>
           </div>

           {/* Detailed Volume */}
           <div>
              <div className="flex items-center justify-between mb-4 px-2">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Job Performance & Spend</p>
                 <TrendingUp size={14} className="text-primary-500" />
              </div>
              
              <div className="space-y-4">
                 {jobs.length === 0 && <p className="text-xs text-gray-500 text-center py-10 bg-white/5 rounded-3xl">No jobs posted yet.</p>}
                 {jobs.map(j => {
                    const jobApps = applicants[j._id] || [];
                    const hired = jobApps.find(a => a.status === 'accepted');
                    const [min] = parsePay(j.pay);
                    
                    return (
                       <div key={j._id} className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all">
                          <div className="flex items-center justify-between mb-3">
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${hired ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary-500/20 text-primary-400'}`}>
                                   {j.title?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                   <p className="text-sm font-bold truncate max-w-[200px]">{j.title}</p>
                                   <p className="text-[10px] font-bold text-gray-500">{j.applicants || 0} Applicants</p>
                                </div>
                             </div>
                             <div className="text-right">
                                {hired ? (
                                   <p className="text-xs font-black text-emerald-400">Total Hired: ₹{min}</p>
                                ) : (
                                   <p className="text-xs font-bold text-gray-400">Target: {j.pay}</p>
                                )}
                             </div>
                          </div>
                          
                          {/* Mini Progress Bar */}
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((j.applicants || 0)*15, 100)}%` }}
                                className={`h-full rounded-full ${hired ? 'bg-emerald-500' : 'bg-primary-500'}`}
                             />
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};


const CandidateTrackerModal = ({ isOpen, onClose, initialTab, applicants, jobs }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Flatten and enrich with job titles
  const allFlattened = Object.keys(applicants).flatMap(jobId => {
    const job = jobs.find(j => j._id === jobId);
    return (applicants[jobId] || []).map(app => ({ ...app, jobTitle: job?.title }));
  });

  const filtered = activeTab === 'all' 
    ? allFlattened 
    : allFlattened.filter(a => a.status === activeTab);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/20" style={{ background: "var(--c-bg-card)", color: "var(--c-text)" }}>
        
        {/* Header & Tabs */}
        <div className="px-8 pt-8 pb-4 border-b border-gray-100/10" style={{ borderColor: 'var(--c-border)' }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black flex items-center gap-2">
               <Users className="text-primary-600" /> Candidate Tracker
            </h2>
            <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors" style={{ background: 'var(--c-bg-subtle)', color: 'var(--c-text)' }}>
               <XCircle size={24} />
            </button>
          </div>

          <div className="flex p-1 bg-gray-100 rounded-2xl w-fit" style={{ background: 'var(--c-bg-subtle)' }}>
             {[
               { id: 'all', label: 'All Applicants' },
               { id: 'pending', label: 'Waiting/Pending' },
               { id: 'accepted', label: 'Successfully Hired' }
             ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-500 hover:text-gray-700'}`}
                  style={activeTab === t.id ? {} : { color: 'var(--c-muted)' }}
                >
                  {t.label}
                </button>
             ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20 opacity-40">
               <Users size={48} className="mx-auto mb-4" />
               <p className="font-extrabold text-lg uppercase tracking-widest">No candidates found in this category</p>
            </div>
          ) : (
             <div className="grid grid-cols-1 gap-4">
               {filtered.map((app, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, y: 10 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   transition={{ delay: i * 0.05 }}
                   className="p-5 rounded-3xl border transition-all hover:scale-[1.01] hover:shadow-xl cursor-default group"
                   style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}
                 >
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                          {app.student?.name?.[0] || 'C'}
                       </div>
                       <div>
                         <h4 className="font-black text-[15px] mb-0.5 active:text-primary-600 transition-colors cursor-pointer" onClick={() => window.location.hash = `#student-profile?id=${app.student?._id}`}>
                            {app.student?.name}
                         </h4>
                         <p className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: 'var(--c-muted)' }}>
                            Applied for: <span className="text-primary-600">{app.jobTitle || 'Gig Task'}</span>
                         </p>
                       </div>
                     </div>
                     <div className="text-right flex flex-col items-end gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : app.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                           {app.status === 'accepted' ? 'Successfully Hired' : app.status === 'pending' ? 'Needs Review' : app.status}
                        </span>
                        <div className="flex gap-2">
                           <button onClick={() => window.location.hash = `#student-profile?id=${app.student?._id}`} className="text-[9px] font-black uppercase tracking-widest text-primary-600 hover:underline">View Profile</button>
                           {app.status === 'accepted' && <CheckCircle size={14} className="text-emerald-500" />}
                        </div>
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
