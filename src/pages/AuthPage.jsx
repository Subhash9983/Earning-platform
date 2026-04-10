import React, { useState } from 'react';
import { Rocket, Mail, Lock, User, Briefcase, GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { registerUser, loginUser } from '../api/api';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userRole, setUserRole] = useState('student'); // 'student' or 'business'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await loginUser({ email: formData.email, password: formData.password });
      } else {
        data = await registerUser({ 
            ...formData, 
            role: userRole,
            // Only send if it's a business, handled by backend but cleaner here too
            companyName: userRole === 'business' ? formData.companyName : undefined,
            industry: userRole === 'business' ? formData.industry : undefined
        });
      }

      // Save full user info to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userName', data.name);
      if (data.userId || data.id || data._id) {
        localStorage.setItem('userId', data.userId || data.id || data._id);
      }
      // Store as JSON object so Navbar can also read it
      localStorage.setItem('user', JSON.stringify({ role: data.role, name: data.name }));

      // Redirect based on role — force hashchange event
      const dest = data.role === 'student' ? '#student-dashboard' : '#business-dashboard';
      window.location.hash = dest;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--c-bg)', color: 'var(--c-text)' }}>
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24" style={{ background: 'var(--c-bg)' }}>
        <a href="#home" className="flex items-center gap-2 mb-12 group pt-8 lg:pt-0">
          <div className="bg-primary-600 p-1.5 rounded-lg text-white group-hover:rotate-12 transition-transform duration-300">
            <Rocket size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">Gig<span className="text-primary-600">Grow</span></span>
        </a>

        <div className="max-w-md w-full">
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-4xl font-extrabold mb-2 tracking-tight" style={{ color: 'var(--c-text)' }}>
              {isLogin ? 'Welcome back.' : 'Create an account.'}
            </h1>
            <p className="mb-8 font-medium" style={{ color: 'var(--c-muted)' }}>
              {isLogin 
                ? 'Log in to continue your journey and manage your gigs.' 
                : 'Join the fastest growing marketplace for students and businesses.'}
            </p>

            {/* Role Selection (Only shown on signup) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <button
                    type="button"
                    onClick={() => setUserRole('student')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${userRole === 'student' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                  >
                    <GraduationCap size={24} className={userRole === 'student' ? 'text-primary-600' : 'text-gray-400'} />
                    <span className="font-bold text-sm">I'm a Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole('business')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${userRole === 'business' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                  >
                    <Briefcase size={24} className={userRole === 'business' ? 'text-primary-600' : 'text-gray-400'} />
                    <span className="font-bold text-sm">I'm a Business</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600"
                >
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1" style={{ color: 'var(--c-muted)' }}>
                      {userRole === 'student' ? 'Full Name' : 'Contact Person Name'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--c-muted)' }}>
                        <User size={18} />
                      </div>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all" 
                        style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
                        placeholder="e.g. Subhash Kumar"
                        required
                      />
                    </div>
                  </div>

                  {userRole === 'business' && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: 'var(--c-muted)' }}>Company Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--c-muted)' }}>
                            <Briefcase size={18} />
                          </div>
                          <input 
                            type="text" 
                            name="companyName"
                            value={formData.companyName || ''}
                            onChange={onChange}
                            className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all" 
                            style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
                            placeholder="e.g. GigGrow Pvt Ltd"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: 'var(--c-muted)' }}>Industry Type</label>
                        <select 
                          name="industry"
                          value={formData.industry || ''}
                          onChange={onChange}
                          className="w-full px-4 py-3 rounded-xl outline-none transition-all appearance-none" 
                          style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
                          required
                        >
                          <option value="">Select Industry</option>
                          <option value="Tech">Technology / IT</option>
                          <option value="Marketing">Marketing / Sales</option>
                          <option value="Design">UI/UX & Design</option>
                          <option value="Events">Events & Management</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-1" style={{ color: 'var(--c-muted)' }}>Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--c-muted)' }}>
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all" 
                    style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
                    placeholder={!isLogin && userRole === 'student' ? "university@edu.com" : "contact@business.com"}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-bold" style={{ color: 'var(--c-muted)' }}>Password</label>
                  {isLogin && <a href="#" className="text-xs font-bold text-primary-600 hover:text-primary-700">Forgot password?</a>}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--c-muted)' }}>
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all" 
                    style={{ background: 'var(--c-bg-subtle)', border: '1px solid var(--c-border)', color: 'var(--c-text)' }}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2 group ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 hover:-translate-y-0.5'}`}
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register Now')}
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or continue with</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button 
                type="button" 
                className="w-full py-3.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-primary-600 font-bold hover:text-primary-700 hover:underline"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Image/Graphic Section */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden" style={{ background: 'var(--c-bg-subtle)' }}>
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-primary-100 rounded-full blur-3xl opacity-50 z-0"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-indigo-100 rounded-full blur-3xl opacity-60 z-0"></div>
        
        <div className="relative z-10 w-full max-w-lg p-12">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
             <div className="flex gap-3 mb-6">
               <div className="w-3 h-3 rounded-full bg-red-400"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
               <div className="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
             <h3 className="text-2xl font-extrabold text-gray-900 mb-4">
               {isLogin ? 'Turn free time into experience.' : 'Verified Talent meets Real Opportunities.'}
             </h3>
             <div className="space-y-3">
               <div className="h-2 w-3/4 bg-gray-100 rounded-full"></div>
               <div className="h-2 w-1/2 bg-gray-100 rounded-full"></div>
               <div className="h-2 w-5/6 bg-gray-100 rounded-full"></div>
             </div>
             
             <div className="mt-8 p-4 bg-primary-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white">
                      <GraduationCap size={20} />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-gray-900">Aryan completed a job</p>
                     <p className="text-[10px] text-gray-500">React Development • ₹2000</p>
                   </div>
                </div>
                <div className="text-green-500 font-bold">+ Verified</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
