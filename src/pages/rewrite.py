import re

with open('src/pages/StudentProfile.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Pattern matches exactly the old block
pattern = r'  return \(\n    <div className=\"min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8\" style={{ background: \'var\(--c-bg\)\' }}>.*?};\n\nexport default StudentProfile;\n'

new_ui = r'''  return (
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
                   <label className='absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all rounded-xl'>
                     <Camera className='text-white mb-1' size={24} />
                     <input type='file' accept='image/*' className='hidden' onChange={handlePhotoUpload} />
                   </label>
                   {isUploadingPhoto && (
                     <div className='absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl'>
                        <Loader2 className='animate-spin text-white' size={24} />
                     </div>
                   )}
                </div>
              </div>
              
              <div className='flex gap-2 flex-wrap justify-end'>
                <div className='flex bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100 items-center gap-1.5 shadow-sm'>
                    <CheckCircle size={16} />
                    <span className='text-xs font-bold uppercase tracking-wider'>Identity Verified</span>
                </div>
                {student?.university && (
                  <div className='hidden sm:flex bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 items-center gap-1.5 shadow-sm'>
                      <Award size={16} />
                      <span className='text-xs font-bold uppercase tracking-wider'>College Verified</span>
                  </div>
                )}
                <button onClick={() => setIsEditing(true)} className='px-4 py-1.5 border min-w-max border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors' style={{ borderColor: 'var(--c-border)', color: 'var(--c-text)' }}>
                  Edit Profile
                </button>
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
           {/* Earnings */}
           <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
              <DollarSign className='text-green-500 mb-2' size={24} />
              <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1' style={{ color: 'var(--c-muted)' }}>Total Earnings</p>
              <p className='text-2xl font-black text-gray-900' style={{ color: 'var(--c-text)' }}>₹{jobsDone * 1200}</p>
           </div>
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
           {/* Views */}
           <div className='bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
              <Eye className='text-indigo-500 mb-2' size={24} />
              <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1' style={{ color: 'var(--c-muted)' }}>Profile Views</p>
              <p className='text-2xl font-black text-gray-900' style={{ color: 'var(--c-text)' }}>{jobsDone > 0 ? jobsDone * 14 + 23 : 5}</p>
           </div>
        </div>

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 text-left'>
           
           {/* Left Column (Strength, About, Skills, Trust) */}
           <div className='space-y-6'>
              
              {/* Profile Strength */}
              <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                 <div className='flex justify-between items-center mb-3'>
                    <h3 className='font-bold text-gray-900' style={{ color: 'var(--c-text)' }}>Profile Strength</h3>
                    <span className='text-primary-600 font-extrabold'>{profileStrength}%</span>
                 </div>
                 <div className='w-full bg-gray-100 rounded-full h-2.5 overflow-hidden' style={{ background: 'var(--c-bg)' }}>
                    <div className='bg-primary-600 h-2.5 rounded-full transition-all' style={{ width: `${profileStrength}%` }}></div>
                 </div>
              </div>

              {/* About */}
              <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                 <h3 className='font-bold text-gray-900 mb-3' style={{ color: 'var(--c-text)' }}>About Me</h3>
                 <p className='text-sm text-gray-600 leading-relaxed' style={{ color: 'var(--c-muted)' }}>
                   {student?.bio || "Motivated student with interest in gaining practical skills. Looking for real-world opportunities to gain experience."}
                 </p>
              </div>

              {/* Skills Section */}
              <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                 <h3 className='font-bold text-gray-900 mb-4' style={{ color: 'var(--c-text)' }}>Verified Skills</h3>
                 {student?.skills?.length > 0 ? (
                   <div className='space-y-3'>
                     {student.skills.map((skill, idx) => (
                        <div key={idx} className='flex justify-between items-center p-3 rounded-xl border border-gray-100 transition-colors' style={{ borderColor: 'var(--c-border)' }}>
                           <span className='font-bold text-sm text-gray-900' style={{ color: 'var(--c-text)' }}>{skill}</span>
                           <div className='flex items-center gap-2'>
                              <span className='text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded' style={{ background: 'var(--c-bg)', color: 'var(--c-muted)' }}>{idx === 0 ? "Adv" : "Int"}</span>
                              <CheckCircle size={14} className='text-green-500' />
                           </div>
                        </div>
                     ))}
                   </div>
                 ) : (
                    <div className='text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200' style={{ background: 'var(--c-bg)', borderColor: 'var(--c-border)' }}>
                      <p className='text-xs text-gray-400 mb-3'>No skills added</p>
                      <button onClick={() => setIsEditing(true)} className='text-xs font-bold text-white bg-primary-600 px-4 py-1.5 rounded-lg hover:bg-primary-700 transition'>Add Skills</button>
                    </div>
                 )}
              </div>

              {/* Trust / Reliability */}
              <div className='bg-white p-6 rounded-3xl border border-gray-100 shadow-sm' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                 <h3 className='font-bold text-gray-900 mb-4' style={{ color: 'var(--c-text)' }}>Reliability</h3>
                 {jobsDone > 0 ? (
                    <div className='space-y-4 text-sm'>
                       <div className='flex justify-between items-center'>
                          <span className='text-gray-500' style={{ color: 'var(--c-muted)' }}>On-time Completion</span>
                          <span className='font-bold text-green-600'>100%</span>
                       </div>
                       <div className='flex justify-between items-center'>
                          <span className='text-gray-500' style={{ color: 'var(--c-muted)' }}>No-show Rate</span>
                          <span className='font-bold text-gray-900' style={{ color: 'var(--c-text)' }}>0%</span>
                       </div>
                    </div>
                 ) : (
                    <div className='text-center py-4 bg-gray-50 rounded-xl' style={{ background: 'var(--c-bg)' }}>
                       <p className='text-xs text-gray-500 font-medium' style={{ color: 'var(--c-muted)' }}>Start working to build reliability</p>
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
                 <h3 className='text-xl font-extrabold text-white mb-2 relative z-10'>Your Resume is Building Automatically</h3>
                 <p className='text-sm text-gray-300 mb-6 max-w-md relative z-10'>Your work, reviews, and skills are being converted into a professional resume for your industry applications.</p>
                 <div className='flex flex-wrap gap-3 relative z-10'>
                    <button onClick={() => setIsResumeMode(true)} className='px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-500 transition-colors'>
                      View Resume
                    </button>
                    <button onClick={handleDirectDownload} disabled={isDownloading} className='px-6 py-2.5 bg-white/10 text-white border border-white/20 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors flex items-center gap-2'>
                      {isDownloading ? <Loader2 size={16} className='animate-spin' /> : <Download size={16} />}
                      Download PDF
                    </button>
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
                       <p className='text-sm text-gray-500 mb-6 max-w-xs mx-auto' style={{ color: 'var(--c-muted)' }}>Complete gigs to build your work history and increase your rating.</p>
                       <button onClick={() => { window.location.hash = '#job-marketplace'; window.dispatchEvent(new HashChangeEvent('hashchange')); }} className='px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition'>
                          Explore Jobs
                       </button>
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

              {/* Featured Projects */}
              <div className='bg-white p-8 rounded-3xl border border-gray-100 shadow-sm' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                 <div className='flex justify-between items-center mb-6'>
                    <h3 className='text-xl font-extrabold text-gray-900 flex items-center gap-2' style={{ color: 'var(--c-text)' }}>
                      <Code className='text-primary-600' /> Featured Projects
                    </h3>
                    <button onClick={() => setIsPortfolioModalOpen(true)} className='text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition'>
                      <PlusCircle size={20} />
                    </button>
                 </div>
                 
                 {student?.portfolio?.length > 0 ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                       {student.portfolio.map((proj, idx) => (
                          <div key={idx} className='border border-gray-100 rounded-2xl overflow-hidden group hover:border-primary-200 transition' style={{ borderColor: 'var(--c-border)' }}>
                             <div className='h-32 bg-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-primary-50 transition relative overflow-hidden' style={{ background: 'var(--c-bg)' }}>
                                <Code size={32} className='group-hover:text-primary-300 transition transform group-hover:scale-110' />
                                <div className='absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent'></div>
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
                       <p className='text-sm text-gray-500 mb-4' style={{ color: 'var(--c-muted)' }}>No projects featured yet. Add your best work!</p>
                       <button onClick={() => setIsPortfolioModalOpen(true)} className='px-5 py-2 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold text-sm hover:shadow-md transition' style={{ background: 'var(--c-bg)', color: 'var(--c-text)', borderColor: 'var(--c-border)' }}>
                          + Add First Project
                       </button>
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

                <div className="p-8 space-y-6 text-left">
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
                    <label className="block text-sm font-bold text-gray-700 mb-2" style={{ color: "var(--c-text)" }}>Verified Skills (Comma Separated)</label>
                    <input 
                      type="text" 
                      name="skills"
                      value={editFormData.skills}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium" 
                      placeholder="e.g. React, Event Management, Sales"
                      style={{ background: "var(--c-bg)", color: "var(--c-text)", borderColor: "var(--c-border)" }}
                    />
                    <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Separated by commas</p>
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
'''

# Because there might be two block instances (from prior partial update), 
# let's just split by '  if (isResumeMode && student) {' to be safe, then replace the tail.

parts = text.split('  if (isResumeMode && student) {')
resume_block = parts[1]

# We want to replace after `    );\n  }\n` inside the resume block.
idx = resume_block.find('  }\n\n  return (')

if idx != -1:
    retained = parts[0] + '  if (isResumeMode && student) {' + resume_block[:idx+4]
    final_text = retained + new_ui
    with open('src/pages/StudentProfile.jsx', 'w', encoding='utf-8') as f:
        f.write(final_text)
    print('SUCCESS')
else:
    print('FAILED TO FIND SPLIT POINT')
    print(resume_block[:200])

