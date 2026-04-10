import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CTA = () => (
  <section className="py-20 px-6" style={{ background: 'var(--c-bg)' }}>
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-4xl overflow-hidden text-center px-10 py-16"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)' }}
      >
        {/* subtle overlay circle */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10">
          <p className="text-white/70 text-xs font-black uppercase tracking-widest mb-5">
            Join 5,000+ students already on platform
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-6">
            Ready to grow your career?
          </h2>
          <p className="text-white/75 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Sign up free and start finding gigs or posting jobs in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#auth"
              className="group flex items-center gap-3 px-8 py-4 bg-white text-primary-700 text-sm font-bold rounded-2xl hover:bg-primary-50 hover:-translate-y-0.5 shadow-xl transition-all duration-200"
            >
              Get Started Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#job-marketplace"
              onClick={() => (window.location.hash = '#job-marketplace')}
              className="px-8 py-4 border border-white/30 hover:bg-white/10 text-white text-sm font-bold rounded-2xl transition-all duration-200"
            >
              Browse Gigs
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTA;
