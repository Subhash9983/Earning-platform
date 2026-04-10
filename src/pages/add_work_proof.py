import re

def update_profile():
    file_path = r"c:\Users\aranw\OneDrive\Desktop\student\src\pages\StudentProfile.jsx"
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    # 1. Add state and mock data
    state_injection = """
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
"""
    idx = text.find('const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);')
    if idx != -1:
        text = text[:idx] + 'const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);\n' + state_injection + text[idx+len('const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);'):]

    # 2. Add imports
    text = text.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport { Shield, Upload, FileUp, Calendar as CalIcon } from 'lucide-react';")

    # 3. Add Work Proof Section right before Featured Projects
    proof_section = """
              {/* Work Proof & Experience */}
              <div className='bg-white p-8 rounded-3xl shadow-sm border border-gray-100 shadow-sm mb-6' style={{ background: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }}>
                 <div className='flex justify-between items-center mb-6'>
                    <h3 className='text-xl font-extrabold text-gray-900 flex items-center gap-2' style={{ color: 'var(--c-text)' }}>
                      <Shield className='text-primary-600' /> Work Proof & Experience
                    </h3>
                    <button onClick={() => setIsProofModalOpen(true)} className='flex items-center gap-2 bg-primary-50 text-primary-600 hover:bg-primary-100 px-3 py-1.5 rounded-lg text-sm font-bold transition'>
                      <FileUp size={16} /> Add Proof
                    </button>
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
                       <p className='text-xs text-gray-500 mb-4' style={{ color: 'var(--c-muted)' }}>Upload photos or certificates to prove your experience</p>
                       <button onClick={() => setIsProofModalOpen(true)} className='px-5 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition'>
                          Add your first proof
                       </button>
                    </div>
                 )}
              </div>

"""
    text = text.replace('{/* Featured Projects */}', proof_section + '{/* Featured Projects */}')

    # 4. Add Proof Modal near the Add Project Modal
    proof_modal = """
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

"""
    text = text.replace('{/* Add Project Modal */}', proof_modal + '{/* Add Project Modal */}')

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)

def update_dashboard():
    file_path_dash = r"c:\Users\aranw\OneDrive\Desktop\student\src\pages\StudentDashboard.jsx"
    with open(file_path_dash, "r", encoding="utf-8") as f:
        text_dash = f.read()

    text_dash = text_dash.replace("import { fetchStudentStats", "import { Camera } from 'lucide-react';\nimport { fetchStudentStats")

    insight_card = """             {/* Trust Builder Card */}
             <div className="p-6 rounded-3xl shadow-sm border border-emerald-100 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full flex-shrink-0">
                      <Camera size={24} />
                   </div>
                   <div>
                      <p className="font-black text-emerald-900 dark:text-emerald-100 mb-1">Increase your Trust Score</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Add work proof and certificates</p>
                   </div>
                </div>
                <button onClick={() => navigateTo('#student-profile?uploadProof=true')} className="px-5 py-2.5 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-200 transition-colors">
                   Add Proof
                </button>
             </div>

             {/* Quick Actions */}"""

    text_dash = text_dash.replace('{/* Quick Actions */}', insight_card)

    with open(file_path_dash, "w", encoding="utf-8") as f:
        f.write(text_dash)

if __name__ == '__main__':
    update_profile()
    update_dashboard()
    print("Updates completed successfully.")
