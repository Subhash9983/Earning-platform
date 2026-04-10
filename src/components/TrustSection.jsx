import React from 'react';
import { ShieldCheck, CheckSquare, Lock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const cards = [
  { icon: <ShieldCheck size={22} />, title: 'Verified Profiles',  desc: "Every student's university email and ID is verified through the platform.", accent: '#4f46e5' },
  { icon: <CheckSquare size={22} />, title: 'Work Proof',        desc: 'Businesses only pay when they\'ve confirmed work is delivered.', accent: '#059669' },
  { icon: <Lock size={22} />,        title: 'Secure Payments',   desc: 'Automated escrow holds funds and releases instantly on completion.', accent: '#0ea5e9' },
  { icon: <Award size={22} />,       title: 'Skill Validation',  desc: 'Skill ratings auto-calculated from real job performance data.', accent: '#d97706' },
];

const TrustSection = () => (
  <section className="section-pad" style={{ background: 'var(--c-bg-subtle)' }}>
    <div className="max-w-6xl mx-auto px-6">

      <div className="text-center mb-16">
        <div className="label mb-6">Platform Standards</div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5" style={{ color: 'var(--c-text)' }}>
          Built on trust.
        </h2>
        <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--c-muted)' }}>
          Every interaction on GigGrow is protected, verified, and transparent.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="pcard p-7 group"
            style={{ background: 'var(--c-bg-card)' }}
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center mb-6 text-white transition-transform duration-300 group-hover:scale-110"
              style={{ background: c.accent }}
            >
              {c.icon}
            </div>
            <h3 className="font-black text-base mb-2" style={{ color: 'var(--c-text)' }}>{c.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--c-muted)' }}>{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSection;
