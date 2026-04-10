import React from 'react';
import { Activity, Github, Twitter, Linkedin, Instagram } from 'lucide-react';

const LINKS = {
  Platform: ['Marketplace', 'Student Network', 'Business Suite', 'Skill Verification'],
  Company:  ['About Us', 'Careers', 'Partner Program', 'Contact'],
  Legal:    ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
};

const Footer = () => (
  <footer style={{ background: 'var(--c-bg-subtle)', borderTop: '1px solid var(--c-border)' }} className="pt-16 pb-10">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">

        {/* Brand */}
        <div>
          <a href="#home" className="flex items-center gap-2 mb-4 group">
            <div className="bg-primary-600 p-2 rounded-xl text-white group-hover:rotate-6 transition-transform">
              <Activity size={18} />
            </div>
            <span className="text-lg font-black" style={{ color: 'var(--c-text)' }}>
              GigGrow<span className="text-primary-600">.</span>
            </span>
          </a>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--c-muted)' }}>
            Empowering the next generation of professional talent through real‑world opportunities and verified skill growth.
          </p>
          <div className="flex gap-3">
            {[Github, Twitter, Linkedin, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 hover:text-primary-600"
                style={{ background: 'var(--c-bg-card)', color: 'var(--c-muted)', border: '1px solid var(--c-border)' }}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([col, links]) => (
          <div key={col}>
            <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: 'var(--c-muted)' }}>
              {col}
            </p>
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm font-medium hover:text-primary-600 transition-colors duration-200"
                    style={{ color: 'var(--c-muted)' }}
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 text-xs font-medium"
        style={{ borderTop: '1px solid var(--c-border)', color: 'var(--c-faint)' }}
      >
        <p>© 2026 GigGrow Platform. All rights reserved.</p>
        <p>Built with ❤ for Students</p>
      </div>
    </div>
  </footer>
);

export default Footer;
