import React from 'react';
import { motion } from 'framer-motion';

const StatsBar = () => {
  const stats = [
    { value: '5,000+', label: 'Active Students' },
    { value: '250+',   label: 'Verified Partners' },
    { value: '15,000+', label: 'Gigs Completed' },
    { value: '₹5M+',  label: 'Student Earnings' },
  ];

  return (
    <div style={{ background: 'var(--c-bg-subtle)', borderTop: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)' }} className="py-10">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <p className="text-3xl font-black mb-1" style={{ color: 'var(--c-text)' }}>{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--c-muted)' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
