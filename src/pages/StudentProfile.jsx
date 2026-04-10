import React, { useState, useEffect, useRef } from 'react';
import { Star, MapPin, Download, CheckCircle, Award, Calendar, ChevronLeft, Link as LinkIcon, Briefcase, Loader2, PlusCircle, Mail, Phone, Globe, Camera, DollarSign, Eye, FileText, Code, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Upload, FileUp, Calendar as CalIcon } from 'lucide-react';
import { fetchProfile, updateProfile, fetchReviews, fetchStudentProfileById, fetchMyJobs, fetchApplicants, updateApplicationStatus, sendOffer } from '../api/api';
import JobSelectionModal from '../components/JobSelectionModal';
import { useToast } from '../context/ToastContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StudentProfile = ({ studentId: propStudentId }) => {
  const [student, setStudent] = useState(null);
  const resumeRef = useRef();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isPublicMode, setIsPublicMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    phone: '',
    location: '',
    githubLink: '',
    linkedinLink: '',
    frameworks: '',
    developerTools: '',
    softSkills: '',
    achievements: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [businessJobs, setBusinessJobs] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isResumeMode, setIsResumeMode] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const { addToast } = useToast();
  const [apiError, setApiError] = useState(null);
  const hasToken = !!localStorage.getItem('token');
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [portfolioFormData, setPortfolioFormData] = useState({ title: '', description: '', link: '', image: '' });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [resumeSections, setResumeSections] = useState([]);

  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [proofFormData, setProofFormData] = useState({ title: '', category: 'Event', description: '', date: '', file: null });
  const [proofs, setProofs] = useState([
    {
      title: "Event Volunteer - Tech Fest",
      date: "2025-01-15",
      description: "Managed event entry and assisted attendees.",
      category: "Event",
      image: "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=400",
      verified: true
    }
  ]);

  // Handle URL hash for quick opening modal
  useEffect(() => {
    if (window.location.hash.includes('uploadProof')) {
      setIsProofModalOpen(true);
      window.location.hash = '#student-profile';
    }
  }, [window.location.hash]);

  const handleAddProof = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
       const newProof = {
          ...proofFormData,
          image: proofFormData.file ? URL.createObjectURL(proofFormData.file) : "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?auto=format&fit=crop&q=80&w=400",
          verified: false
       };
       setProofs([newProof, ...proofs]);
       setIsProofModalOpen(false);
       setProofFormData({ title: '', category: 'Event', description: '', date: '', file: null });
       setIsSaving(false);
    }, 1000);
  };


  const getProfile = async () => {
    if (isEditingInline || isSaving) return;
    
    try {
      setApiError(null);
      const studentId = propStudentId || new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '').get('id');
      
      if (!student) setLoading(true);
      
      console.log('Fetching profile for studentId:', studentId, 'Public Mode:', !!studentId);
      
      let data;
      if (studentId) {
        setIsPublicMode(true);
        // Try the standard path first, then fall back to public-student if needed (during debug)
        try {
           data = await fetchStudentProfileById(studentId);
        } catch (e) {
           console.log('Main profile path failed, trying public-student fallback...');
           const response = await api.get(`/auth/public-student/${studentId}`);
           data = response.data;
        }
      } else {
        setIsPublicMode(false);
        data = await fetchProfile();
      }
      
      setStudent(data);
      setResumeData(data); // Sync local resume data
      // If student is found, fetch their reviews
      if (data && data._id) {
        setLoadingReviews(true);
        const reviewData = await fetchReviews(data._id);
        setReviews(reviewData);
      }
      
      setEditFormData({
        skills: (data.skills || []).map(s => ({ name: s.split(':')[0].trim(), level: s.split(':')[1] ? s.split(':')[1].trim() : 'Intermediate' })),
        phone: data.phone || '',
        location: data.location || '',
        githubLink: data.githubLink || '',
        linkedinLink: data.linkedinLink || '',
        frameworks: data.frameworks || '',
        developerTools: data.developerTools || '',
        softSkills: data.softSkills || '',
        achievements: (data.achievements || []).join('\n'),
        educationDegree: data.educationDegree || '',
        educationDateRange: data.educationDateRange || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.response) {
        console.log('Error Data:', err.response.data);
        console.log('Error Status:', err.response.status);
      }
      setApiError(err.response?.status || 'network');
    } finally {
      setLoading(false);
      setLoadingReviews(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Link copied to clipboard!', 'success');
  };

  useEffect(() => {
    getProfile();
  }, [propStudentId]);

  // Handle hash parameters (edit/print) reactively
  useEffect(() => {
    if (!student) return;
    
    const handleHash = () => {
      const hash = window.location.hash;
      console.log('🔄 Hash routing updated:', hash);
      if (hash.includes('view=resume')) {
        setIsResumeMode(true);
      } else if (hash.includes('print')) {
        setIsResumeMode(true);
      } else if (hash.includes('student-profile')) {
          // Stay on profile page
      } else {
        setIsResumeMode(false);
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => {
        window.removeEventListener('hashchange', handleHash);
        console.log('Cleanup hash listener');
    };
  }, [!!student]);

  const handleEditChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const skillsArray = editFormData.skills.filter(s => s.name.trim() !== '').map(s => `${s.name.trim()}:${s.level}`);
      const updatedData = { ...editFormData, skills: skillsArray };
      const data = await updateProfile(updatedData);
      setStudent(data);
      setIsEditing(false);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update profile:', err);
      addToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updatedPortfolio = [...(student.portfolio || []), portfolioFormData];
      const data = await updateProfile({ portfolio: updatedPortfolio });
      setStudent(data);
      setIsPortfolioModalOpen(false);
      setPortfolioFormData({ title: '', description: '', link: '', image: '' });
      addToast('Project added to portfolio!', 'success');
    } catch (err) {
      console.error('Failed to add project:', err);
      addToast('Failed to add project', 'error');
    } finally {
      setIsSaving(false);
    }
  };



  // Calculate real metrics from reviews (safe with null student)
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : (student?.rating || '0.0');
  const jobsDone = reviews.length;

  const calculateStrength = () => {
    let score = 20; // Base profile
    if (student?.bio) score += 20;
    if (student?.skills?.length > 0) score += 20;
    if (student?.portfolio?.length > 0) score += 20;
    if (reviews.length > 0) score += 20;
    return score;
  };
  const profileStrength = student ? calculateStrength() : 0;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
       const reader = new FileReader();
       reader.onloadend = async () => {
         const base64String = reader.result;
         try {
           setIsUploadingPhoto(true);
           setStudent(prev => ({...prev, profilePicture: base64String}));
           await updateProfile({ profilePicture: base64String });
           addToast('Profile photo updated!', 'success');
         } catch(err) {
           addToast('Failed to update photo', 'error');
         } finally {
           setIsUploadingPhoto(false);
         }
       };
       reader.readAsDataURL(file);
    }
  };

  const handleDirectDownload = async () => {
    if (!resumeRef.current || !student) return;
    try {
      setIsDownloading(true);
      const element = resumeRef.current;
      
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${(student.name || 'Student').replace(/\s+/g, '_')}_Resume.pdf`);
      
      addToast('Resume downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      addToast('Failed to download PDF. Try printing instead.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleHireClick = async () => {
    if (!student || !student._id) {
       addToast('Student data not loaded yet', 'error');
       return;
    }

    try {
      setIsSaving(true);
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user) {
        addToast('Please login to continue', 'error');
        return;
      }

      if (user.role !== 'business') {
        addToast('Only businesses can hire students', 'error');
        return;
      }

      const myJobs = await fetchMyJobs();
      let applicationToHire = null;

      // Check if student applied for any of my jobs
      for (const job of myJobs) {
        try {
          const apps = await fetchApplicants(job._id);
          const studentApp = apps.find(a => 
            (a.student?._id === student._id || a.student === student._id) && 
            a.status === 'pending'
          );
          if (studentApp) {
            applicationToHire = { appId: studentApp._id, jobTitle: job.title, jobId: job._id };
            break;
          }
        } catch (e) { console.log('Job check error:', e); }
      }

      if (applicationToHire) {
        await updateApplicationStatus(applicationToHire.appId, 'accepted');
        addToast(`Successfully hired for ${applicationToHire.jobTitle}!`, 'success');
      } else {
        // Prepare for Role Selection
        setBusinessJobs(myJobs.filter(j => j.status === 'active'));
        setShowJobModal(true);
      }
    } catch (err) {
      console.error('Hiring error:', err);
      addToast(err.response?.data?.msg || 'Failed to process hiring request', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmHire = async (job) => {
    try {
      setIsSaving(true);
      const user = JSON.parse(localStorage.getItem('user'));
      await sendOffer({
        studentId: student._id,
        jobId: job._id,
        message: `${user.name || 'A business'} has offered you the "${job.title}" role!`
      });
      addToast(`Formal offer for "${job.title}" sent to ${student.name}!`, 'success');
      setShowJobModal(false);
    } catch (err) {
      addToast('Failed to send approach request', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInline = async () => {
    try {
      setIsSaving(true);
      // Process skills if they were edited as a string
      let processedData = { ...resumeData };
      if (typeof processedData.skills === 'string') {
        processedData.skills = processedData.skills.split(',').map(s => s.trim()).filter(s => s !== '');
      }
      if (typeof processedData.achievements === 'string') {
        processedData.achievements = processedData.achievements.split('\n').map(s => s.trim()).filter(s => s !== '');
      }
      const data = await updateProfile(processedData);
      setStudent(data);
      setResumeData(data);
      setIsEditingInline(false);
      addToast('Resume changes saved!', 'success');
    } catch (err) {
      console.error('Failed to save inline edits:', err);
      addToast('Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateResumeField = (field, value) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const updatePortfolioField = (index, field, value) => {
    const newPortfolio = [...resumeData.portfolio];
    newPortfolio[index] = { ...newPortfolio[index], [field]: value };
    setResumeData(prev => ({ ...prev, portfolio: newPortfolio }));
  };


  // Initialize resume sections from profile data
  useEffect(() => {
    if (!student && !resumeData) return;
    const data = resumeData || student;
    if (!data || resumeSections.length > 0) return;

    const sections = [];
    
    // Summary
    sections.push({
      id: 'summary',
      title: 'Summary',
      type: 'text',
      content: data.bio || 'Motivated student with a strong foundation in academic excellence.',
      deletable: true
    });

    // Education
    sections.push({
      id: 'education',
      title: 'Education',
      type: 'structured',
      entries: [{
        line1Left: data.university || 'University Name',
        line1Right: data.location || 'Location',
        line2Left: data.educationDegree || 'Active Degree Program',
        line2Right: data.educationDateRange || '2022 - Present',
        bullets: []
      }],
      deletable: true
    });

    // Projects
    const projectEntries = (data.portfolio && data.portfolio.length > 0)
      ? data.portfolio.map(proj => ({
          line1Left: proj.title || 'Project Title',
          line1Right: proj.dateRange || 'Recent',
          subtitle: proj.techStack || '',
          bullets: proj.description 
            ? proj.description.split('\n').filter(l => l.trim()) 
            : ['Developed a professional project with modern technology stack.']
        }))
      : [{
          line1Left: 'Academic Project',
          line1Right: 'Recent',
          subtitle: 'HTML, CSS, JavaScript, React',
          bullets: [
            'Developed a responsive web application focusing on user experience and clean code architecture.',
            'Utilized modern frameworks to build interactive features and ensure cross-browser compatibility.'
          ]
        }];
    sections.push({
      id: 'projects',
      title: 'Projects',
      type: 'structured',
      entries: projectEntries,
      deletable: true
    });

    // Verified Experience (GigGrow)
    const expEntries = reviews.length > 0 
      ? reviews.map(rev => ({
          line1Left: rev.jobTitle || 'Verified Gig',
          line1Right: rev.date ? new Date(rev.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Recent',
          subtitle: rev.business?.name || 'Platform Business',
          bullets: [
            `Professional delivery rated ${rev.rating}/5.0 by client.`,
            rev.comment || 'Successfully completed project requirements with high quality and on-time delivery.'
          ]
        }))
      : [{
          line1Left: '',
          line1Right: '',
          subtitle: '',
          bullets: ['Building verified experience through the GigGrow platform...']
        }];
    sections.push({
      id: 'experience',
      title: 'Verified Experience (GigGrow)',
      type: 'structured',
      entries: expEntries,
      deletable: true
    });

    // Skills
    const skillBullets = [];
    if (data.skills && data.skills.length > 0) {
      skillBullets.push('Core Skills: ' + data.skills.map(s => {
        const parts = s.split(':');
        return parts.length > 1 ? `${parts[0].trim()} (${parts[1].trim()})` : parts[0].trim();
      }).join(', '));
    }
    if (data.frameworks) skillBullets.push('Specialized Tools/Frameworks: ' + data.frameworks);
    if (data.softSkills) skillBullets.push('Professional Soft Skills: ' + data.softSkills);
    sections.push({
      id: 'skills',
      title: 'Skills & Expertise',
      type: 'bullets',
      items: skillBullets.length > 0 ? skillBullets : ['Add your skills here...'],
      deletable: true
    });

    // Professional Presence (only if data exists)
    if (data.githubLink || (data.portfolio && data.portfolio.length > 0)) {
      const presenceItems = [];
      if (data.githubLink) presenceItems.push('GitHub: ' + String(data.githubLink).replace('https://', ''));
      if (data.linkedinLink) presenceItems.push('LinkedIn: ' + String(data.linkedinLink).replace('https://', ''));
      if (data.portfolio && data.portfolio.length > 0) presenceItems.push('Project Portfolio: Verified showcase of past work on GigGrow.');
      sections.push({
        id: 'presence',
        title: 'Professional Presence',
        type: 'bullets',
        items: presenceItems,
        deletable: true
      });
    }

    // Achievements
    const achItems = [];
    if (jobsDone > 0) achItems.push(`GigGrow Elite: Successfully completed ${jobsDone} verified projects with professional client satisfaction.`);
    if (avgRating >= 4.5 && jobsDone >= 1) achItems.push(`Top-Rated Status: Consistently maintained ${avgRating}/5.0 professional rating.`);
    if (data.achievements && data.achievements.length > 0) {
      const achArr = Array.isArray(data.achievements) ? data.achievements : data.achievements.split('\n');
      achItems.push(...achArr);
    }
    sections.push({
      id: 'achievements',
      title: 'Achievements & Certifications',
      type: 'bullets',
      items: achItems.length > 0 ? achItems : ['Add your achievements here...'],
      deletable: true
    });

    setResumeSections(sections);
  }, [student, resumeData, reviews]);

  // Section CRUD helpers
  const updateSectionTitle = (idx, newTitle) => {
    setResumeSections(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], title: newTitle };
      return next;
    });
  };

  const deleteSection = (idx) => {
    setResumeSections(prev => prev.filter((_, i) => i !== idx));
  };

  const addNewSection = () => {
    setResumeSections(prev => [...prev, {
      id: `custom-${Date.now()}`,
      title: 'New Section (Click to rename)',
      type: 'bullets',
      items: ['Click to edit this point...'],
      deletable: true
    }]);
  };

  // Bullet items CRUD
  const addBulletItem = (sectionIdx) => {
    setResumeSections(prev => {
      const next = [...prev];
      const section = { ...next[sectionIdx] };
      section.items = [...(section.items || []), 'New point (Click to edit)'];
      next[sectionIdx] = section;
      return next;
    });
  };

  const updateBulletItem = (sectionIdx, itemIdx, value) => {
    setResumeSections(prev => {
      const next = [...prev];
      const section = { ...next[sectionIdx] };
      section.items = [...section.items];
      section.items[itemIdx] = value;
      next[sectionIdx] = section;
      return next;
    });
  };

  const deleteBulletItem = (sectionIdx, itemIdx) => {
    setResumeSections(prev => {
      const next = [...prev];
      const section = { ...next[sectionIdx] };
      section.items = section.items.filter((_, i) => i !== itemIdx);
      next[sectionIdx] = section;
      return next;
    });
  };

  // Structured entry CRUD
  const addStructuredEntry = (sectionIdx) => {
    setResumeSections(prev => {
      const next = [...prev];
      const section = { ...next[sectionIdx] };
      section.entries = [...(section.entries || []), {
        line1Left: 'New Entry Title',
        line1Right: 'Date',
        subtitle: '',
        bullets: ['Description point...']
      }];
      next[sectionIdx] = section;
      return next;
    });
  };

  const updateStructuredEntry = (sectionIdx, entryIdx, field, value) => {
    setResumeSections(prev => {
      const next = [...prev];
      const section = { ...next[sectionIdx] };
      section.entries = [...section.entries];
      section.entries[entryIdx] = { ...section.entries[entryIdx], [field]: value };
      next[sectionIdx] = section;
      return next;
    });
  };

  const deleteStructuredEntry = (sectionIdx, entryIdx) => {
    setResumeSections(prev => {
      const next = [...prev];
      const section = { ...next[sectionIdx] };
      section.entries = section.entries.filter((_, i) => i !== entryIdx);
      next[sectionIdx] = section;
      return next;
    });
  };

  const addEntryBullet = (sectionIdx, entryIdx) => {
    setResumeSections(prev => {
      const next = [...prev];
      const section = { ...next[sectionIdx] };
      section.entries = [...section.entries];
      section.entries[entryIdx] = { 
        ...section.entries[entryIdx], 
        bullets: [...(section.entries[entryIdx].bullets || []), 'New sub-point (Click to edit)'] 
      };
      next[sectionIdx] = section;
      return next;
    });
  };

  const updateEntryBullet = (sectionIdx, entryIdx, bulletIdx, value) => {
    setResumeSections(prev => {
      const next = [...prev];
      const section = { ...next[sectionIdx] };
      section.entries = [...section.entries];
      const entry = { ...section.entries[entryIdx] };
      entry.bullets = [...entry.bullets];
      entry.bullets[bulletIdx] = value;
      section.entries[entryIdx] = entry;
      next[sectionIdx] = section;
      return next;
    });
  };

  const deleteEntryBullet = (sectionIdx, entryIdx, bulletIdx) => {
    setResumeSections(prev => {
      const next = [...prev];
      const section = { ...next[sectionIdx] };
      section.entries = [...section.entries];
      const entry = { ...section.entries[entryIdx] };
      entry.bullets = entry.bullets.filter((_, i) => i !== bulletIdx);
      section.entries[entryIdx] = entry;
      next[sectionIdx] = section;
      return next;
    });
  };

  // === EARLY RETURNS (must be AFTER all hooks) ===
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--c-bg)' }}>
        <Loader2 size={40} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-5 px-6" style={{ background: 'var(--c-bg)' }}>
        <div className="text-center max-w-sm">
          {!hasToken ? (
            <>
              <p className="font-bold text-lg mb-2" style={{ color: 'var(--c-text)' }}>Pehle login karo</p>
              <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>Profile dekhne ke liye sign in zaroori hai.</p>
              <button
                onClick={() => { window.location.hash = '#auth'; window.dispatchEvent(new HashChangeEvent('hashchange')); }}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                Sign In
              </button>
            </>
          ) : apiError === 401 ? (
            <>
              <p className="font-bold text-lg mb-2" style={{ color: 'var(--c-text)' }}>Session expire ho gayi</p>
              <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>Please dobara login karo.</p>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.hash = '#auth';
                  window.dispatchEvent(new HashChangeEvent('hashchange'));
                }}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                Dobara Login Karo
              </button>
            </>
          ) : (
            <>
              <p className="font-bold text-lg mb-2" style={{ color: 'var(--c-text)' }}>Profile load nahi hua</p>
              <p className="text-sm mb-6" style={{ color: 'var(--c-muted)' }}>Server se data fetch nahi ho paya. Server chal raha hai?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={getProfile}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors">
                  Dobara Try Karo
                </button>
                <button
                  onClick={() => { window.location.hash = '#student-dashboard'; window.dispatchEvent(new HashChangeEvent('hashchange')); }}
                  className="px-6 py-3 rounded-xl font-bold transition-colors"
                  style={{ background: 'var(--c-bg-card)', color: 'var(--c-text)', border: '1px solid var(--c-border)' }}>
                  Dashboard Wapas
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- Professional Resume Mockup for PDF ---
  const renderProfessionalResume = () => {
    const data = resumeData || student;
    if (!data) return null;
    return (
      <div ref={resumeRef} className="bg-white p-8 sm:p-12 max-w-[210mm] mx-auto shadow-sm text-left relative" style={{ minHeight: '297mm', color: '#000', fontFamily: '"Times New Roman", Times, serif', lineHeight: '1.4' }}>
        
        {isEditingInline && (
          <div className="absolute top-2 right-2 no-print bg-primary-50 text-primary-600 px-3 py-1 rounded-md text-[10px] font-bold animate-pulse">
            ✏️ Editing Mode — Click any text to change. Use ✕ to delete.
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h1 
            contentEditable={isEditingInline}
            suppressContentEditableWarning={true}
            onBlur={(e) => updateResumeField('name', e.target.innerText)}
            className={`text-3xl font-bold mb-1 ${isEditingInline ? 'hover:bg-gray-50 outline-dotted outline-1 outline-gray-200 p-1' : ''}`} 
            style={{ fontFamily: 'serif' }}
          >
            {data.name || 'Student Name'}
          </h1>
          <div className="flex justify-center flex-wrap gap-2 text-[11px] text-gray-800">
            <span 
              contentEditable={isEditingInline}
              suppressContentEditableWarning={true}
              onBlur={(e) => updateResumeField('phone', e.target.innerText)}
              className={isEditingInline ? 'hover:bg-gray-50 outline-dotted outline-1 outline-gray-200 px-1' : ''}
            >
              {data.phone || (isEditingInline ? 'Phone Number' : '')}</span>
            <span>|</span>
            <span className="underline">{data.email || 'email@example.com'}</span>
            {data.linkedinLink && <><span>|</span><span className="underline">{String(data.linkedinLink).replace('https://', '').replace('www.', '')}</span></>}
            {data.githubLink && <><span>|</span><span className="underline">{String(data.githubLink).replace('https://', '').replace('www.', '')}</span></>}
          </div>
        </div>

        {/* Dynamic Sections */}
        {resumeSections.map((section, sIdx) => (
          <div key={section.id} className="mb-4 text-left group/section relative">
            {/* Section Title with controls */}
            <h2 className="text-sm font-bold border-b border-black mb-1.5 pb-0.5 flex justify-between items-center">
              <span
                contentEditable={isEditingInline}
                suppressContentEditableWarning={true}
                onBlur={(e) => updateSectionTitle(sIdx, e.target.innerText)}
                className={isEditingInline ? 'hover:bg-gray-50 outline-dotted outline-1 outline-gray-200 px-1' : ''}
              >
                {section.title}
              </span>
              {isEditingInline && (
                <div className="no-print flex gap-1 items-center opacity-0 group-hover/section:opacity-100 transition-opacity">
                  {section.type === 'bullets' && (
                    <button onClick={() => addBulletItem(sIdx)} className="text-[8px] bg-green-600 text-white px-1.5 py-0.5 rounded hover:bg-green-700">+ Point</button>
                  )}
                  {section.type === 'structured' && (
                    <button onClick={() => addStructuredEntry(sIdx)} className="text-[8px] bg-green-600 text-white px-1.5 py-0.5 rounded hover:bg-green-700">+ Entry</button>
                  )}
                  <button onClick={() => deleteSection(sIdx)} className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded hover:bg-red-600">✕ Section</button>
                </div>
              )}
            </h2>

            {/* TEXT type (e.g. Summary) */}
            {section.type === 'text' && (
              <p 
                contentEditable={isEditingInline}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  const next = [...resumeSections];
                  next[sIdx] = { ...next[sIdx], content: e.target.innerText };
                  setResumeSections(next);
                }}
                className={`text-[11px] text-justify leading-relaxed ${isEditingInline ? 'hover:bg-gray-50 outline-dotted outline-1 outline-gray-200 p-1' : ''}`}
              >
                {section.content}
              </p>
            )}

            {/* BULLETS type (e.g. Skills, Achievements) */}
            {section.type === 'bullets' && (
              <ul className="list-disc list-outside ml-4 text-[11px] space-y-0.5">
                {(section.items || []).map((item, iIdx) => (
                  <li key={iIdx} className={`group/item flex items-start gap-1 ${isEditingInline ? 'hover:bg-gray-50' : ''}`}>
                    <span
                      contentEditable={isEditingInline}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => updateBulletItem(sIdx, iIdx, e.target.innerText)}
                      className={`flex-1 ${isEditingInline ? 'outline-dotted outline-1 outline-gray-200 px-1' : ''}`}
                    >
                      {item}
                    </span>
                    {isEditingInline && (
                      <button 
                        onClick={() => deleteBulletItem(sIdx, iIdx)} 
                        className="no-print text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity text-[9px] font-bold px-1 shrink-0"
                      >✕</button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* STRUCTURED type (e.g. Education, Projects, Experience) */}
            {section.type === 'structured' && (
              <div className="space-y-3">
                {(section.entries || []).map((entry, eIdx) => (
                  <div key={eIdx} className="group/entry relative">
                    {/* Entry header row */}
                    {(entry.line1Left || entry.line1Right) && (
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-[11px] font-bold">
                          <span
                            contentEditable={isEditingInline}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => updateStructuredEntry(sIdx, eIdx, 'line1Left', e.target.innerText)}
                            className={isEditingInline ? 'hover:bg-gray-50 outline-dotted outline-1 outline-gray-200 px-1' : ''}
                          >{entry.line1Left}</span>
                          {entry.subtitle && (
                            <span className="font-normal italic">
                              {' | '}
                              <span
                                contentEditable={isEditingInline}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => updateStructuredEntry(sIdx, eIdx, 'subtitle', e.target.innerText)}
                                className={isEditingInline ? 'hover:bg-gray-50 outline-dotted outline-1 outline-gray-200 px-1' : ''}
                              >{entry.subtitle}</span>
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            contentEditable={isEditingInline}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => updateStructuredEntry(sIdx, eIdx, 'line1Right', e.target.innerText)}
                            className={`text-[11px] ${isEditingInline ? 'hover:bg-gray-50 outline-dotted outline-1 outline-gray-200 px-1' : ''}`}
                          >{entry.line1Right}</span>
                          {isEditingInline && (
                            <button onClick={() => deleteStructuredEntry(sIdx, eIdx)} className="no-print text-red-500 opacity-0 group-hover/entry:opacity-100 transition-opacity text-[9px] font-bold px-1">✕</button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Line 2 (for education style) */}
                    {(entry.line2Left || entry.line2Right) && (
                      <div className="flex justify-between items-baseline italic mb-1">
                        <span
                          contentEditable={isEditingInline}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => updateStructuredEntry(sIdx, eIdx, 'line2Left', e.target.innerText)}
                          className={`text-[11px] ${isEditingInline ? 'hover:bg-gray-50 outline-dotted outline-1 outline-gray-200 px-1' : ''}`}
                        >{entry.line2Left}</span>
                        <span
                          contentEditable={isEditingInline}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => updateStructuredEntry(sIdx, eIdx, 'line2Right', e.target.innerText)}
                          className={`text-[11px] ${isEditingInline ? 'hover:bg-gray-50 outline-dotted outline-1 outline-gray-200 px-1' : ''}`}
                        >{entry.line2Right}</span>
                      </div>
                    )}

                    {/* Sub-bullets */}
                    {entry.bullets && entry.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-4 text-[11px] space-y-0.5">
                        {entry.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className={`group/bullet flex items-start gap-1 ${isEditingInline ? 'hover:bg-gray-50' : ''}`}>
                            <span
                              contentEditable={isEditingInline}
                              suppressContentEditableWarning={true}
                              onBlur={(e) => updateEntryBullet(sIdx, eIdx, bIdx, e.target.innerText)}
                              className={`flex-1 ${isEditingInline ? 'outline-dotted outline-1 outline-gray-200 px-1' : ''}`}
                            >{bullet}</span>
                            {isEditingInline && (
                              <button onClick={() => deleteEntryBullet(sIdx, eIdx, bIdx)} className="no-print text-red-500 opacity-0 group-hover/bullet:opacity-100 transition-opacity text-[9px] font-bold px-1 shrink-0">✕</button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Add sub-point button */}
                    {isEditingInline && (
                      <button 
                        onClick={() => addEntryBullet(sIdx, eIdx)} 
                        className="no-print text-[8px] text-green-600 hover:text-green-700 font-bold mt-1 ml-4 opacity-0 group-hover/entry:opacity-100 transition-opacity"
                      >+ Add Sub-point</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Add New Section Button */}
        {isEditingInline && (
          <div className="no-print mt-4 text-center">
            <button 
              onClick={addNewSection}
              className="text-[10px] bg-primary-600 text-white px-4 py-1.5 rounded-md hover:bg-primary-700 transition font-bold"
            >
              + Add New Section
            </button>
          </div>
        )}
        
        {/* Footer Branding */}
        <div className="mt-12 pt-4 border-t border-gray-100 flex justify-between items-center opacity-20 no-print">
          <span className="text-[8px] font-bold uppercase">Verified @ GigGrow.app</span>
          <span className="text-[8px] font-serif italic">Academic Style Export</span>
        </div>
      </div>
    );
  };

  if (isResumeMode && student) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col pt-24 pb-20">
        <div className="max-w-4xl mx-auto w-full px-6 flex justify-between items-center mb-10 no-print">
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => { setIsResumeMode(false); window.location.hash = '#student-dashboard'; }}
              className="flex items-center gap-2 font-bold text-xs text-gray-400 hover:text-primary-600 transition-all group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
            </button>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <button 
              onClick={() => { setIsResumeMode(false); window.location.hash = '#student-profile'; }}
              className="flex items-center gap-2 font-bold text-xs text-gray-400 hover:text-primary-600 transition-all group"
            >
              <Eye size={16} /> View Full Profile
            </button>
          </div>
          
          <div className="flex gap-3">
              {isEditingInline ? (
               <>
                <button 
                  onClick={() => setIsEditingInline(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveInline}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Save Resume Changes
                </button>
               </>
             ) : (
               <>
                {!isPublicMode && (
                  <button 
                    onClick={() => setIsEditingInline(true)}
                    className="px-5 py-2.5 bg-primary-50 text-primary-600 text-xs font-bold rounded-xl border border-primary-100 hover:bg-primary-100 transition-all flex items-center gap-2"
                  >
                    <FileText size={16} /> Quick Edit Inline
                  </button>
                )}
                {!isPublicMode && (
                  <button 
                    onClick={handleShare}
                    className="px-5 py-2.5 bg-white text-gray-900 text-xs font-bold rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    <LinkIcon size={16} /> Share Profile
                  </button>
                )}
               </>
             )}
            {!isPublicMode && (
              <button 
                onClick={handleDirectDownload}
                disabled={isDownloading}
                className="px-7 py-2.5 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-gray-200 hover:shadow-primary-600/20 hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isDownloading ? 'Processing...' : 'Direct Download PDF'}
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto pb-10">
          {renderProfessionalResume()}
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50 transition-colors' style={{ background: 'var(--c-bg)' }}>
      <div className='max-w-5xl mx-auto space-y-6'>
        
        {/* Navigation */}
        <div className='flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
          <button 
            onClick={() => { window.location.hash = '#student-dashboard'; window.dispatchEvent(new HashChangeEvent('hashchange')); }} 
            className='flex items-center gap-2 font-bold text-sm text-gray-500 hover:text-primary-600 transition-colors'
            style={{ color: 'var(--c-muted)' }}
          >
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
          <div className='flex gap-3'>
            <button 
              onClick={handleShare}
              className='flex items-center gap-2 px-4 py-2 bg-gray-50 font-bold text-xs text-gray-700 rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors'
              style={{ background: 'var(--c-bg)', color: 'var(--c-text)', borderColor: 'var(--c-border)' }}
            >
              <LinkIcon size={14}/> Share Profile
            </button>
          </div>
        </div>

        {/* Header Section */}
        <div className='bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
          <div className='h-32 bg-gradient-to-r from-primary-600 to-indigo-800 relative'>
             <div className='absolute inset-0 bg-white/10 pattern-grid'></div>
          </div>
          <div className='px-8 pb-8'>
            <div className='relative flex justify-between items-end -mt-12 mb-6'>
              <div className='relative group'>
                {/* Avatar */}
                <div className='w-28 h-28 bg-white rounded-2xl p-1 border-4 border-white shadow-lg flex-shrink-0 relative overflow-hidden' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-bg-card)' }}>
                   {student?.profilePicture ? (
                       <img src={student.profilePicture} alt='Profile' className='w-full h-full object-cover rounded-xl' />
                   ) : (
                       <div className='w-full h-full bg-primary-100 text-primary-700 flex items-center justify-center text-4xl font-extrabold rounded-xl uppercase'>{student?.name?.charAt(0) || 'S'}</div>
                   )}
                   {/* Hover overlay for upload */}
                   {!isPublicMode && (
                     <label className='absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all rounded-xl'>
                       <Camera className='text-white mb-1' size={24} />
                       <input type='file' accept='image/*' className='hidden' onChange={handlePhotoUpload} />
                     </label>
                   )}
                   {isUploadingPhoto && (
                     <div className='absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl'>
                        <Loader2 className='animate-spin text-white' size={24} />
                     </div>
                   )}
                </div>
              </div>
              
              <div className='flex gap-2 flex-wrap justify-end'>
                {!isPublicMode && (
                  <div className='flex bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100 items-center gap-1.5 shadow-sm'>
                      <CheckCircle size={16} />
                      <span className='text-xs font-bold uppercase tracking-wider'>Identity Verified</span>
                  </div>
                )}
                {student?.university && !isPublicMode && (
                  <div className='hidden sm:flex bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 items-center gap-1.5 shadow-sm'>
                      <Award size={16} />
                      <span className='text-xs font-bold uppercase tracking-wider'>College Verified</span>
                  </div>
                )}
                {isPublicMode ? (
                  <button 
                    onClick={handleHireClick}
                    disabled={isSaving}
                    className='px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50'>
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                    Hire Student
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className='px-4 py-1.5 border min-w-max border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors' style={{ borderColor: 'var(--c-border)', color: 'var(--c-text)' }}>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
            
            <div className='text-left'>
               <h1 className='text-3xl font-extrabold text-gray-900 mb-2' style={{ color: 'var(--c-text)' }}>{student?.name || 'Student Name'}</h1>
               <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium' style={{ color: 'var(--c-muted)' }}>
                  <span className='flex items-center gap-1'><MapPin size={16}/> {student?.university || 'University'}</span>
                  <span className='flex items-center gap-1'><Calendar size={16}/> Joined {student?.date ? new Date(student.date).toLocaleDateString() : 'N/A'}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
           {/* Jobs Completed */}
           <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
              <Briefcase className='text-primary-600 mb-2' size={24} />
              <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1' style={{ color: 'var(--c-muted)' }}>Jobs Completed</p>
              <p className='text-2xl font-black text-gray-900' style={{ color: 'var(--c-text)' }}>{jobsDone}</p>
           </div>
           {/* Earnings (Private Only) */}
           {!isPublicMode && (
             <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                <DollarSign className='text-green-500 mb-2' size={24} />
                <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1' style={{ color: 'var(--c-muted)' }}>Total Earnings</p>
                <p className='text-2xl font-black text-gray-900' style={{ color: 'var(--c-text)' }}>₹{student?.totalEarnings || 0}</p>
             </div>
           )}
           {/* Rating */}
           <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
              <Star className='text-yellow-500 mb-2 fill-current' size={24} />
              <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1' style={{ color: 'var(--c-muted)' }}>Rating</p>
              {jobsDone > 0 ? (
                <p className='text-2xl font-black text-gray-900' style={{ color: 'var(--c-text)' }}>{avgRating} / 5</p>
              ) : (
                <span className='text-sm text-primary-600 h-8 flex items-center font-bold'>New Profile</span>
              )}
           </div>
           {/* Views (Private Only) */}
           {!isPublicMode && (
             <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                <Eye className='text-indigo-500 mb-2' size={24} />
                <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1' style={{ color: 'var(--c-muted)' }}>Profile Views</p>
                <p className='text-2xl font-black text-gray-900' style={{ color: 'var(--c-text)' }}>{student?.profileViews || 0}</p>
             </div>
           )}
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 text-left'>
           
           {/* Left Column (Strength, About, Skills, Trust) */}
           <div className='space-y-6'>
              
              {/* Profile Strength */}
              {!isPublicMode && (
                <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                   <div className='flex justify-between items-center mb-3'>
                      <h3 className='font-bold text-gray-900' style={{ color: 'var(--c-text)' }}>Profile Strength</h3>
                      <span className='text-primary-600 font-extrabold'>{profileStrength}%</span>
                   </div>
                   <div className='w-full bg-gray-100 rounded-full h-2.5 overflow-hidden' style={{ background: 'var(--c-bg)' }}>
                      <div className='bg-primary-600 h-2.5 rounded-full transition-all' style={{ width: `${profileStrength}%` }}></div>
                   </div>
                </div>
              )}

              {/* About Me Section - Premium Upgrade */}
              <div className='bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                 {/* Background Accent */}
                 <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors" />
                 
                 <div className='flex items-center gap-3 mb-5'>
                    <div className='w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center'>
                       <FileText size={20} />
                    </div>
                    <h3 className='font-black text-lg tracking-tight' style={{ color: 'var(--c-text)' }}>About Me</h3>
                 </div>

                 <div className="relative">
                    {/* Decorative Quote Mark */}
                    <div className="absolute -left-2 -top-2 opacity-[0.03] pointer-events-none">
                       <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM14.017 15C14.017 12.2386 11.7784 10 9.01704 10V13C10.6739 13 12.017 14.3431 12.017 16V19C12.017 20.1046 11.1216 21 10.017 21H7.01704C5.91247 21 5.01704 20.1046 5.01704 19V16C5.01704 13.2386 7.25561 11 10.017 11V8C6.15105 8 3.01704 11.134 3.01704 15V19C3.01704 21.2091 4.79612 23 7.00519 23H11.0052C13.2143 23 15.017 21.2091 15.017 19V15H14.017Z" /></svg>
                    </div>

                    <p className='text-[15px] leading-[1.8] font-medium relative z-10' style={{ color: 'var(--c-muted)' }}>
                       {student?.bio || "Motivated student with interest in gaining practical skills. Looking for real-world opportunities to gain experience."}
                    </p>
                 </div>

                 {/* Bottom border highlight */}
                 <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
              </div>

              {/* Skills Section */}
              <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                 <h3 className='font-bold text-gray-900 mb-4' style={{ color: 'var(--c-text)' }}>Verified Skills</h3>
                 {student?.skills?.length > 0 ? (
                   <div className='space-y-3'>
                     {student.skills.map((rawSkill, idx) => {
                        const parts = rawSkill.split(':');
                        const skill = parts[0].trim();
                        let levelText = parts.length > 1 ? parts[1].trim() : "Intermediate";
                        
                        let levelColor = "text-gray-600 bg-gray-200";
                        let barColor = "bg-blue-400";
                        let progress = 2;
                        
                        if (levelText.toLowerCase() === "expert") {
                            levelColor = "text-primary-700 bg-primary-100";
                            barColor = "bg-primary-500";
                            progress = 4;
                        } else if (levelText.toLowerCase() === "advanced") {
                            levelColor = "text-blue-700 bg-blue-100";
                            barColor = "bg-blue-500";
                            progress = 3;
                        } else if (levelText.toLowerCase() === "basic") {
                            levelColor = "text-gray-500 bg-gray-100";
                            barColor = "bg-blue-300";
                            progress = 1;
                        }

                        return (
                         <div key={idx} className='p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all' style={{ borderColor: 'var(--c-border)' }}>
                            <div className='flex justify-between items-center mb-3'>
                               <span className='font-extrabold text-sm text-gray-900 tracking-tight uppercase' style={{ color: 'var(--c-text)' }}>{skill}</span>
                               <div className='flex items-center gap-2'>
                                  <span className={`text-[9px] uppercase font-black px-2 py-1 rounded-md tracking-widest flex items-center gap-1 ${levelColor}`}>
                                    {levelText}
                                    {progress >= 3 && <CheckCircle size={10} />}
                                  </span>
                               </div>
                            </div>
                            <div className='flex gap-1 h-1 w-full opacity-80'>
                               {[1, 2, 3, 4].map(step => (
                                 <div 
                                    key={step} 
                                    className={`h-full flex-1 rounded-full ${step <= progress ? barColor : 'bg-gray-200'}`}
                                 ></div>
                               ))}
                            </div>
                         </div>
                        );
                     })}
                   </div>
                 ) : (
                    <div className='text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200' style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                      <p className='text-xs text-gray-400 mb-3'>No skills added</p>
                      {!isPublicMode && <button onClick={() => setIsEditing(true)} className='text-xs font-bold text-white bg-primary-600 px-4 py-1.5 rounded-lg hover:bg-primary-700 transition'>Add Skills</button>}
                    </div>
                 )}
              </div>

              {/* Trust / Reliability Center */}
               <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                  <div className="flex justify-between items-center mb-5">
                    <h3 className='font-bold text-gray-900' style={{ color: 'var(--c-text)' }}>Professional Reliability</h3>
                    {jobsDone > 0 && <span className="bg-green-500/10 text-green-600 text-[10px] font-black uppercase px-2 py-1 rounded-md border border-green-500/20">Elite Stats</span>}
                  </div>
                  
                  {jobsDone > 0 ? (
                    <div className='grid grid-cols-1 gap-4'>
                       {/* Metric 1 */}
                       <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4 transition-all hover:border-primary-100" style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                             <Clock size={20} />
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>On-time Completion</span>
                                <span className="text-sm font-black text-green-600">{(student?.metrics?.onTime || 100)}%</span>
                             </div>
                             <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${student?.metrics?.onTime || 100}%` }} className="bg-green-500 h-full rounded-full" />
                             </div>
                          </div>
                       </div>

                       {/* Metric 2 */}
                       <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4 transition-all hover:border-primary-100" style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                             <Zap size={20} />
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider" style={{ color: 'var(--c-muted)' }}>Commitment Rate</span>
                                <span className="text-sm font-black text-primary-600">{(student?.metrics?.commitment || 100)}%</span>
                             </div>
                             <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${student?.metrics?.commitment || 100}%` }} className="bg-primary-600 h-full rounded-full" />
                             </div>
                          </div>
                       </div>

                       <div className="mt-2 p-3 bg-yellow-50 rounded-xl border border-yellow-100 flex items-center gap-3">
                          <CheckCircle className="text-yellow-600" size={16} />
                          <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-tight">GigGrow Top-Rated Talent candidate</span>
                       </div>
                    </div>
                  ) : (
                    <div className='text-center py-6 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 relative group overflow-hidden' style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                       <div className="relative z-10">
                          <div className='w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-3 text-gray-400 transform group-hover:scale-110 transition-transform duration-500' style={{ background: 'var(--c-bg-card)' }}>
                             <Shield size={24} className="text-primary-300" />
                          </div>
                          {isPublicMode ? (
                             <>
                                <p className='text-[11px] font-extrabold text-emerald-600 uppercase tracking-widest mb-1'>Rising Talent</p>
                                <p className='text-[10px] text-gray-500 font-medium max-w-[180px] mx-auto' style={{ color: 'var(--c-muted)' }}>
                                   Verified new member. Ready to build professional reliability on GigGrow.
                                </p>
                             </>
                          ) : (
                             <>
                                <p className='text-[11px] font-extrabold text-gray-900 uppercase tracking-widest mb-1' style={{ color: 'var(--c-text)' }}>Ready for Gigs</p>
                                <p className='text-[10px] text-gray-400 font-medium max-w-[180px] mx-auto' style={{ color: 'var(--c-muted)' }}>Complete your first gig to unlock verified reliability stats.</p>
                             </>
                          )}
                       </div>
                       {/* Decorative light */}
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
                    </div>
                  )}
               </div>

{/* Featured Projects */}
              <div className='bg-white p-8 rounded-3xl border border-gray-100 shadow-sm' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                 <div className='flex justify-between items-center mb-6'>
                    <h3 className='text-xl font-extrabold text-gray-900 flex items-center gap-2' style={{ color: 'var(--c-text)' }}>
                      <Code className='text-primary-600' /> Featured Projects
                    </h3>
                    {!isPublicMode && (
                      <button onClick={() => setIsPortfolioModalOpen(true)} className='text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition'>
                        <PlusCircle size={20} />
                      </button>
                    )}
                 </div>
                 
                 {student?.portfolio?.length > 0 ? (
                    <div className='grid grid-cols-1 gap-4'>
                       {student.portfolio.map((proj, idx) => (
                          <div key={idx} className='border border-gray-100 rounded-2xl overflow-hidden group hover:border-primary-200 transition' style={{ borderColor: 'var(--c-border)' }}>
                             <div className='h-32 bg-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-primary-50 transition relative overflow-hidden' style={{ background: 'var(--c-bg)' }}>
                                {proj.image ? (
                                   <img src={proj.image} alt={proj.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0" />
                                ) : (
                                   <Code size={32} className='group-hover:text-primary-300 transition transform group-hover:scale-110 relative z-0' />
                                )}
                                <div className='absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10'></div>
                             </div>
                             <div className='p-4 bg-white' style={{ background: 'var(--c-bg-card)' }}>
                                <h4 className='font-bold text-gray-900 text-sm mb-1' style={{ color: 'var(--c-text)' }}>{proj.title}</h4>
                                <p className='text-xs text-gray-500 line-clamp-2 mb-3' style={{ color: 'var(--c-muted)' }}>{proj.description}</p>
                                {proj.link && (
                                   <a href={proj.link} target='_blank' rel="noopener noreferrer" className='text-[10px] uppercase font-bold tracking-wider text-primary-600 hover:underline flex items-center gap-1'>
                                      <LinkIcon size={10} /> View Project
                                   </a>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className='text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl' style={{ borderColor: 'var(--c-border)' }}>
                       <p className='text-sm text-gray-500 mb-4' style={{ color: 'var(--c-muted)' }}>No projects featured yet. </p>
                       {!isPublicMode && (
                         <button onClick={() => setIsPortfolioModalOpen(true)} className='px-5 py-2 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold text-sm hover:shadow-md transition' style={{ background: 'var(--c-bg)', color: 'var(--c-text)', borderColor: 'var(--c-border)' }}>
                            + Add First Project
                         </button>
                       )}
                    </div>
                 )}
              </div>
           </div>

           {/* Right Column (Resume, Work History, Projects) */}
           <div className='lg:col-span-2 space-y-6 text-left'>
              
              {/* Automatic Resume Section */}
              <div className='bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 relative overflow-hidden shadow-xl'>
                 <div className='absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4'>
                    <FileText size={200} />
                 </div>
                 <h3 className='text-xl font-extrabold text-white mb-2 relative z-10'>
                    {isPublicMode ? "View Candidate's Professional Resume" : "Your Resume is Building Automatically"}
                 </h3>
                 <p className='text-sm text-gray-300 mb-6 max-w-md relative z-10'>
                    {isPublicMode 
                      ? "Review the comprehensive academic and professional history of this candidate, verified by GigGrow." 
                      : "Your work, reviews, and skills are being converted into a professional resume for your industry applications."}
                 </p>
                 <div className='flex flex-wrap gap-3 relative z-10'>
                    <button onClick={() => setIsResumeMode(true)} className='px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-500 transition-colors'>
                      {isPublicMode ? "Review Candidate" : "View Resume"}
                    </button>
                    {!isPublicMode && (
                      <button onClick={handleDirectDownload} disabled={isDownloading} className='px-6 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors flex items-center gap-2'>
                        {isDownloading ? <Loader2 size={16} className='animate-spin' /> : <Download size={16} />}
                        Download PDF
                      </button>
                    )}
                 </div>
              </div>

              {/* Work History */}
              <div className='bg-white p-8 rounded-3xl border border-gray-100 shadow-sm' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                 <h3 className='text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2' style={{ color: 'var(--c-text)' }}>
                   <Briefcase className='text-primary-600' /> Verified Work History
                 </h3>
                 {reviews.length === 0 ? (
                    <div className='text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50' style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                       <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm' style={{ background: 'var(--c-bg-card)' }}>
                          <Briefcase className='text-gray-300' size={24} />
                       </div>
                       <h4 className='font-bold text-gray-900 mb-2' style={{ color: 'var(--c-text)' }}>No work history yet</h4>
                       {!isPublicMode && (
                         <>
                           <p className='text-sm text-gray-500 mb-6 max-w-xs mx-auto' style={{ color: 'var(--c-muted)' }}>Complete gigs to build your work history and increase your rating.</p>
                           <button onClick={() => { window.location.hash = '#job-marketplace'; window.dispatchEvent(new HashChangeEvent('hashchange')); }} className='px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition'>
                              Explore Jobs
                           </button>
                         </>
                       )}
                    </div>
                 ) : (
                    <div className='space-y-6'>
                       {reviews.map((rev, idx) => (
                          <div key={idx} className='p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary-100 transition' style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                             <div className='flex justify-between items-start mb-2'>
                                <div>
                                   <h4 className='font-bold text-gray-900 text-base' style={{ color: 'var(--c-text)' }}>{rev.jobTitle || 'Gig Project'}</h4>
                                   <p className='text-xs text-primary-600 font-bold uppercase tracking-wider mt-1'>{rev.business?.name || 'Local Business'}</p>
                                </div>
                                <span className='text-xs bg-white border border-gray-200 px-2 py-1 rounded-md font-bold text-gray-500' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                                   {rev.date ? new Date(rev.date).toLocaleDateString() : 'Recent'}
                                </span>
                             </div>
                             <div className='flex gap-1 mb-3 text-yellow-500'>
                                {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= rev.rating ? "fill-current" : "text-gray-300"} />)}
                             </div>
                             <p className='text-sm text-gray-600 italic border-l-2 border-primary-200 pl-3' style={{ color: 'var(--c-muted)' }}>"{rev.comment}"</p>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              
              {/* Work Proof & Experience */}
              <div className='bg-white p-8 rounded-3xl shadow-sm border border-gray-100 shadow-sm mb-6' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                 <div className='flex justify-between items-center mb-6'>
                    <h3 className='text-xl font-extrabold text-gray-900 flex items-center gap-2' style={{ color: 'var(--c-text)' }}>
                      <Shield className='text-primary-600' /> Work Proof & Experience
                    </h3>
                    {!isPublicMode && (
                      <button onClick={() => setIsProofModalOpen(true)} className='flex items-center gap-2 bg-primary-50 text-primary-600 hover:bg-primary-100 px-3 py-1.5 rounded-lg text-sm font-bold transition'>
                        <FileUp size={16} /> Add Proof
                      </button>
                    )}
                 </div>
                 
                 {proofs.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                       {proofs.map((proof, idx) => (
                          <div key={idx} className='border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-all bg-gray-50' style={{ borderColor: 'var(--c-border)', background: 'var(--c-bg)' }}>
                             <div className='h-36 bg-gray-100 relative overflow-hidden'>
                                <img src={proof.image} alt={proof.title} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500' />
                                <div className='absolute top-3 left-3'>
                                   {proof.verified ? (
                                      <span className='bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm border border-green-200 flex items-center gap-1'><CheckCircle size={10}/> Verified</span>
                                   ) : (
                                      <span className='bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-sm border border-yellow-200 flex items-center gap-1'><Upload size={10}/> Self Uploaded</span>
                                   )}
                                </div>
                             </div>
                             <div className='p-4'>
                                <div className='flex justify-between items-start mb-1'>
                                   <h4 className='font-bold text-gray-900 text-sm line-clamp-1' style={{ color: 'var(--c-text)' }}>{proof.title}</h4>
                                </div>
                                <div className='flex items-center gap-1 text-[10px] text-primary-600 font-bold mb-2 uppercase tracking-wide'>
                                   {proof.category}
                                </div>
                                <p className='text-xs text-gray-500 line-clamp-2 mb-3' style={{ color: 'var(--c-muted)' }}>{proof.description}</p>
                                <div className='flex items-center gap-1 text-[10px] text-gray-400 font-bold'>
                                   <CalIcon size={12}/> {proof.date}
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className='text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl' style={{ borderColor: 'var(--c-border)' }}>
                       <div className='w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300' style={{ background: 'var(--c-bg)' }}>
                          <FileUp size={24} />
                       </div>
                       <p className='text-sm font-bold text-gray-900 mb-2' style={{ color: 'var(--c-text)' }}>No work proof added yet</p>
                       {!isPublicMode && (
                         <button onClick={() => setIsProofModalOpen(true)} className='px-5 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition'>
                            Add your first proof
                         </button>
                       )}
                    </div>
                 )}
              </div>

           </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setIsEditing(false)}
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ background: "var(--c-bg-card)", color: "var(--c-text)" }}
            >
              <form onSubmit={handleUpdateProfile}>
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center" style={{ borderColor: "var(--c-border)" }}>
                  <h2 className="text-xl font-extrabold" style={{ color: "var(--c-text)" }}>Edit Your Profile</h2>
                  <Loader2 className={`animate-spin text-primary-600 ${isSaving ? 'opacity-100' : 'opacity-0'}`} size={20} />
                </div>

                <div className="p-8 space-y-6 text-left max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>University / Institution</label>
                    <input 
                      type="text" 
                      name="university"
                      value={editFormData.university}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium" 
                      placeholder="e.g. University of Delhi"
                      style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Academic Bio</label>
                    <textarea 
                      name="bio"
                      value={editFormData.bio}
                      onChange={handleEditChange}
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium resize-none text-sm"
                      placeholder="Describe your background and what you are looking for..."
                      style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Verified Skills</label>
                    <div className="space-y-3">
                      {editFormData.skills && editFormData.skills.map((skillObj, i) => (
                         <div key={i} className="flex gap-2 items-center">
                            <input 
                              type="text" 
                              value={skillObj.name}
                              onChange={(e) => {
                                 const newSkills = [...editFormData.skills];
                                 newSkills[i].name = e.target.value;
                                 setEditFormData({...editFormData, skills: newSkills});
                              }}
                              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-sm" 
                              placeholder="Skill name (e.g. React)"
                              style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                            />
                            <select 
                               value={skillObj.level}
                               onChange={(e) => {
                                 const newSkills = [...editFormData.skills];
                                 newSkills[i].level = e.target.value;
                                 setEditFormData({...editFormData, skills: newSkills});
                               }}
                               className="px-3 py-3 rounded-xl border border-gray-200 outline-none font-bold text-sm bg-gray-50 text-gray-700 transition-all font-medium"
                               style={{ borderColor: "var(--c-border)" }}
                            >
                               <option value="Expert">Expert</option>
                               <option value="Advanced">Advanced</option>
                               <option value="Intermediate">Intermediate</option>
                               <option value="Basic">Basic</option>
                            </select>
                            <button type="button" onClick={() => {
                                const newSkills = editFormData.skills.filter((_, idx) => idx !== i);
                                setEditFormData({...editFormData, skills: newSkills});
                            }} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                              X
                            </button>
                         </div>
                      ))}
                      <button 
                         type="button" 
                         onClick={() => setEditFormData({...editFormData, skills: [...(editFormData.skills || []), { name: '', level: 'Intermediate' }]})} 
                         className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                      >
                         + Add Another Skill
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Phone Number</label>
                      <input 
                        type="text" 
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium" 
                        placeholder="e.g. +91 9876543210"
                        style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Address / Location</label>
                      <input 
                        type="text" 
                        name="location"
                        value={editFormData.location}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium" 
                        placeholder="e.g. Jaipur, Rajasthan"
                        style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>LinkedIn URL</label>
                      <input 
                        type="text" 
                        name="linkedinLink"
                        value={editFormData.linkedinLink}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium" 
                        placeholder="https://linkedin.com/in/username"
                        style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>GitHub URL</label>
                      <input 
                        type="text" 
                        name="githubLink"
                        value={editFormData.githubLink}
                        onChange={handleEditChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium" 
                        placeholder="https://github.com/username"
                        style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-end gap-4" style={{ borderColor: 'var(--c-border)' }}>
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 text-sm font-bold text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-2.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all flex items-center gap-2 group disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      
      {/* Add Work Proof Modal */}
      <AnimatePresence>
        {isProofModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setIsProofModalOpen(false)}
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ background: "var(--c-bg-card)", color: "var(--c-text)" }}
            >
              <form onSubmit={handleAddProof}>
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center" style={{ borderColor: "var(--c-border)" }}>
                  <h2 className="text-xl font-extrabold text-gray-900" style={{ color: "var(--c-text)" }}>Add Work Proof</h2>
                  <FileUp className="text-primary-600" size={24} />
                </div>

                <div className="p-8 space-y-5 text-left max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Proof Title</label>
                    <input 
                      type="text" 
                      required
                      value={proofFormData.title}
                      onChange={(e) => setProofFormData({...proofFormData, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none font-medium text-sm" 
                      placeholder="e.g. Event Volunteer - Tech Fest"
                      style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Category</label>
                    <select 
                      value={proofFormData.category}
                      onChange={(e) => setProofFormData({...proofFormData, category: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none font-medium text-sm cursor-pointer"
                      style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                    >
                       <option value="Event">Event</option>
                       <option value="Content">Content</option>
                       <option value="Tech">Tech</option>
                       <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Short Description</label>
                    <textarea 
                      required
                      value={proofFormData.description}
                      onChange={(e) => setProofFormData({...proofFormData, description: e.target.value})}
                      rows="2"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none font-medium resize-none text-sm"
                      placeholder="Describe your role or what the proof represents..."
                      style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                    ></textarea>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                     <div className="w-full sm:w-1/2">
                       <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Date</label>
                       <input 
                         type="month" 
                         required
                         value={proofFormData.date}
                         onChange={(e) => setProofFormData({...proofFormData, date: e.target.value})}
                         className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 outline-none font-medium text-sm cursor-pointer" 
                         style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                       />
                     </div>
                     <div className="w-full sm:w-1/2">
                       <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Upload File</label>
                       <input 
                         type="file" 
                         accept="image/*,.pdf"
                         onChange={(e) => setProofFormData({...proofFormData, file: e.target.files[0]})}
                         className="w-full px-2 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 outline-none font-medium text-sm bg-gray-50 cursor-pointer" 
                         style={{ borderColor: "var(--c-border)" }}
                       />
                     </div>
                  </div>
                </div>

                <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-end gap-4" style={{ borderColor: 'var(--c-border)' }}>
                  <button 
                    type="button"
                    onClick={() => setIsProofModalOpen(false)}
                    className="px-6 py-2.5 text-sm font-bold text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-2.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-700 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Submit Proof'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

{/* Add Project Modal */}
      <AnimatePresence>
        {isPortfolioModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setIsPortfolioModalOpen(false)}
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ background: "var(--c-bg-card)", color: "var(--c-text)" }}
            >
              <form onSubmit={handleAddProject}>
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center" style={{ borderColor: "var(--c-border)" }}>
                  <h2 className="text-xl font-extrabold text-gray-900" style={{ color: "var(--c-text)" }}>Add New Project</h2>
                  <PlusCircle className="text-primary-600" size={24} />
                </div>

                <div className="p-8 space-y-5 text-left">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Project Title</label>
                    <input 
                      type="text" 
                      required
                      value={portfolioFormData.title}
                      onChange={(e) => setPortfolioFormData({...portfolioFormData, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium" 
                      placeholder="e.g. Personal Portfolio Website"
                      style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Short Description</label>
                    <textarea 
                      required
                      value={portfolioFormData.description}
                      onChange={(e) => setPortfolioFormData({...portfolioFormData, description: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium resize-none text-sm"
                      placeholder="What did you build? What technologies did you use?"
                      style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Project Link (Optional)</label>
                    <input 
                      type="url" 
                      value={portfolioFormData.link}
                      onChange={(e) => setPortfolioFormData({...portfolioFormData, link: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium" 
                      placeholder="https://github.com/yourusername/project"
                      style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Project Image (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPortfolioFormData({ ...portfolioFormData, image: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm" 
                      style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                    />
                    {portfolioFormData.image && (
                      <div className="mt-3 aspect-video w-full rounded-lg overflow-hidden border border-gray-100 relative">
                        <img src={portfolioFormData.image} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPortfolioFormData({...portfolioFormData, image: ''})} className="absolute top-2 right-2 bg-black/50 text-white rounded-md px-2 text-xs font-bold p-1 hover:bg-red-500">Remove</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-end gap-4" style={{ borderColor: 'var(--c-border)' }}>
                  <button 
                    type="button"
                    onClick={() => setIsPortfolioModalOpen(false)}
                    className="px-6 py-2.5 text-sm font-bold text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-2.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Add to Resume'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentProfile;
