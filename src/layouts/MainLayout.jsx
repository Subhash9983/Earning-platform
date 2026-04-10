import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', background: 'var(--c-bg)', color: 'var(--c-text)', transition: 'background 0.3s, color 0.3s' }}>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </div>
);

export default MainLayout;
