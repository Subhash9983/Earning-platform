import React from 'react';
import MainLayout from '../layouts/MainLayout';
import Hero from '../components/Hero';
import StatsBar from '../components/StatsBar';
import HowItWorks from '../components/HowItWorks';
import StudentsSection from '../components/StudentsSection';
import BusinessSection from '../components/BusinessSection';
import TrustSection from '../components/TrustSection';
import CTA from '../components/CTA';

const Home = () => {
  return (
    <MainLayout>
      <Hero />
      <StatsBar />
      <HowItWorks />
      <StudentsSection />
      <BusinessSection />
      <TrustSection />
      <CTA />
    </MainLayout>
  );
};

export default Home;
