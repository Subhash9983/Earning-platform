import React from 'react';
import { UserPlus, Search, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    icon: <UserPlus size={22} />,
    title: 'Create your profile',
    desc: 'Sign up as a student or business in under 2 minutes. Verify your identity and set your preferences.',
    color: '#4f46e5',
  },
  {
    num: '02',
    icon: <Search size={22} />,
    title: 'Discover opportunities',
    desc: 'Browse curated gigs matched to your skills and location, or post a job listing to find talent.',
    color: '#7c3aed',
  },
  {
    num: '03',
    icon: <Rocket size={22} />,
    title: 'Execute & get paid',
    desc: 'Deliver great work, collect verified ratings, and receive instant payment — all in one place.',
    color: '#a855f7',
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="section-pad" style={{ background: 'var(--c-bg)' }}>
    <div className="max-w-6xl mx-auto px-6">

      <div className="text-center mb-20">
        <div className="label mb-6">How it works</div>
        <h2
          className="text-4xl md:text-5xl font-black tracking-tight mb-5"
          style={{ color: 'var(--c-text)' }}
        >
          Simple. Fast. Rewarding.
        </h2>
        <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--c-muted)' }}>
          Three steps from sign-up to your first gig or hire.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="relative"
          >
            {/* connector line */}
            {i < steps.length - 1 && (
              <div
                className="hidden md:block absolute top-10 left-full w-full h-px -translate-x-1/2 z-0"
                style={{ background: 'var(--c-border)' }}
              />
            )}

            <div
              className="pcard p-8 relative z-10 h-full"
              style={{ background: 'var(--c-bg-card)' }}
            >
              {/* Step number */}
              <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: 'var(--c-muted)' }}>
                Step {s.num}
              </p>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-white"
                style={{ background: s.color }}
              >
                {s.icon}
              </div>

              <h3 className="text-xl font-black mb-3" style={{ color: 'var(--c-text)' }}>{s.title}</h3>
              <p className="leading-relaxed text-sm" style={{ color: 'var(--c-muted)' }}>{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  </section>
);

export default HowItWorks;
