import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, ArrowRight, Loader2, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchPublicStudents } from '../api/api';

const points = [
  'Find nearby verified students in minutes',
  'Filter by skill, rating, and availability',
  'Affordable on-demand local talent',
  'Post a job in under 3 minutes',
];

const BusinessSection = () => {
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicStudents()
      .then((d) => setTalents(d.slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="businesses" className="section-pad" style={{ background: 'var(--c-bg)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16">

          {/* ── Left: talent card ── */}
          <motion.div
            className="flex-1 w-full max-w-sm mx-auto lg:max-w-none"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="pcard p-6" style={{ background: 'var(--c-bg-card)' }}>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                  <Search size={16} />
                </div>
                <div>
                  <p className="font-black text-sm" style={{ color: 'var(--c-text)' }}>Discover Talent</p>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-muted)' }}>
                    Live network
                  </p>
                </div>
              </div>

              {/* Talent list */}
              <div className="space-y-2 mb-5">
                {loading ? (
                  <div className="flex flex-col items-center py-8" style={{ color: 'var(--c-muted)' }}>
                    <Loader2 className="animate-spin mb-2" size={20} />
                    <p className="text-xs font-bold">Loading verified talent…</p>
                  </div>
                ) : talents.length === 0 ? (
                  <div className="text-center py-6" style={{ color: 'var(--c-muted)' }}>
                    <Users size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Join our first wave!</p>
                  </div>
                ) : (
                  talents.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl transition-colors duration-200 cursor-default"
                      style={{ background: 'var(--c-bg-subtle)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-black">
                          {t.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="text-sm font-black" style={{ color: 'var(--c-text)' }}>{t.name}</p>
                          <p className="text-xs" style={{ color: 'var(--c-muted)' }}>
                            {t.university || 'Student'} · {t.rating || 'New'} ★
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full text-emerald-600"
                        style={{ background: 'rgba(16,185,129,0.1)' }}>
                        Available
                      </span>
                    </div>
                  ))
                )}
              </div>

              <button
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors duration-200"
              >
                Hire Instantly
              </button>
            </div>
          </motion.div>

          {/* ── Right: copy ── */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="label mb-6">For Businesses</div>

            <h2
              className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6"
              style={{ color: 'var(--c-text)' }}
            >
              Hire reliable students{' '}
              <span className="grad-text">instantly.</span>
            </h2>

            <p className="text-lg leading-relaxed mb-10 max-w-md" style={{ color: 'var(--c-muted)' }}>
              Stop wasting time on generic job boards. Access a curated network of
              verified student talent with proven ratings.
            </p>

            <ul className="space-y-4 mb-10">
              {points.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium" style={{ color: 'var(--c-text)' }}>{p}</span>
                </li>
              ))}
            </ul>

            <a
              href="#auth"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary-600/20 hover:-translate-y-0.5 transition-all duration-200"
            >
              Post a Job Now
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default BusinessSection;
