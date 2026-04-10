import React, { useState, useEffect } from 'react';
import { DollarSign, Award, UserCheck, FileText, Loader2, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchPublicStudents } from '../api/api';

const benefits = [
  { icon: <DollarSign size={18} />, title: 'Earn Money',       desc: 'Fair pay directly into your account, no middlemen.' },
  { icon: <Award size={18} />,      title: 'Gain Experience',  desc: 'Real projects from real local businesses.' },
  { icon: <UserCheck size={18} />,  title: 'Build Profile',    desc: 'Every gig earns you a verified rating and skill proof.' },
  { icon: <FileText size={18} />,   title: 'Auto Resume',      desc: 'One-click download of a verified professional resume.' },
];

const StudentsSection = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicStudents()
      .then((d) => setStudent(d[0] || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="students" className="section-pad" style={{ background: 'var(--c-bg-subtle)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* ── Left: copy ── */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="label mb-6">For Students</div>

            <h2
              className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6"
              style={{ color: 'var(--c-text)' }}
            >
              Not just jobs.{' '}
              <span className="grad-text">Real growth.</span>
            </h2>

            <p className="text-lg leading-relaxed mb-10 max-w-md" style={{ color: 'var(--c-muted)' }}>
              Turn your free time into your competitive advantage. Earn money,
              build a verified portfolio, and start a career that speaks for itself.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {benefits.map((b, i) => (
                <div key={i} className="flex gap-4 group">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200"
                    style={{ background: 'var(--c-accent-lt)', color: 'var(--c-accent)' }}
                  >
                    {b.icon}
                  </div>
                  <div>
                    <p className="font-black text-sm mb-0.5 uppercase tracking-tight" style={{ color: 'var(--c-text)' }}>
                      {b.title}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="#auth"
              className="inline-flex px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary-600/20 hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Earning Now
            </a>
          </motion.div>

          {/* ── Right: profile card ── */}
          <motion.div
            className="flex-1 w-full max-w-sm mx-auto"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="pcard p-8" style={{ background: 'var(--c-bg-card)' }}>

              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-6" style={{ borderBottom: '1px solid var(--c-border)' }}>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--c-muted)' }}>
                    Featured Talent
                  </p>
                  <p className="text-xl font-black" style={{ color: 'var(--c-text)' }}>
                    {loading ? '—' : student?.name || 'Be the First'}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--c-muted)' }}>
                    {student?.university || 'Verified Professional'}
                  </p>
                </div>
                <div
                  className="px-3 py-1.5 rounded-xl text-xs font-black"
                  style={{ background: 'var(--c-accent-lt)', color: 'var(--c-accent)' }}
                >
                  {student?.rating || '5.0'} ★
                </div>
              </div>

              {/* Recent work */}
              {loading ? (
                <div className="flex flex-col items-center py-10" style={{ color: 'var(--c-muted)' }}>
                  <Loader2 className="animate-spin mb-3" size={24} />
                  <p className="text-xs font-bold uppercase tracking-widest">Finding talent…</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--c-muted)' }}>
                    Recent Work
                  </p>
                  {[
                    { title: 'Campus Brand Rep', company: 'Red Bull', score: '5.0' },
                    { title: 'React Dev Intern', company: 'Local Tech', score: '4.8' },
                  ].map((w, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 rounded-xl"
                      style={{ background: 'var(--c-bg-subtle)' }}
                    >
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--c-text)' }}>{w.title}</p>
                        <p className="text-xs" style={{ color: 'var(--c-muted)' }}>{w.company}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-black text-amber-500">
                        <Star size={12} className="fill-current" /> {w.score}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="flex gap-2 flex-wrap mt-6 pt-5" style={{ borderTop: '1px solid var(--c-border)' }}>
                {['Verified', 'Top Rated', 'Skilled'].map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest"
                    style={{ background: 'var(--c-accent-lt)', color: 'var(--c-accent)' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default StudentsSection;
