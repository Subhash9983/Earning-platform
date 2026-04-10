import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-20 overflow-hidden"
    >
      {/* ── Atmospheric blobs ── */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        {/* Top-left warm orb */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
        />
        {/* Bottom-right violet orb */}
        <div className="absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest cborder"
          style={{
            background: 'var(--c-accent-lt)',
            color: 'var(--c-accent)',
            borderColor: 'var(--c-border)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
          The Future of Student Careers
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl font-black leading-[0.95] tracking-tightest mb-8"
          style={{ color: 'var(--c-text)' }}
        >
          Build your future
          <br />
          <span className="grad-text">one gig</span> at a time.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{ color: 'var(--c-muted)' }}
        >
          GigGrow connects ambitious students with real-world opportunities.
          Gain experience, build your portfolio, and start earning — today.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#auth"
            className="group flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Sparkles size={18} />
            Get Started Free
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="#job-marketplace"
            onClick={() => (window.location.hash = '#job-marketplace')}
            className="px-8 py-4 text-sm font-bold rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'var(--c-bg-card)',
              color: 'var(--c-text)',
              borderColor: 'var(--c-border)',
            }}
          >
            Explore Gigs
          </a>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { value: '5K+', label: 'Active Students' },
            { value: '250+', label: 'Verified Partners' },
            { value: '₹5M+', label: 'Student Earnings' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black" style={{ color: 'var(--c-text)' }}>
                {s.value}
              </p>
              <p className="text-xs font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--c-muted)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
