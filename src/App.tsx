import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import PartnerWithUs from './pages/PartnerWithUs';
import Contributors from './pages/Contributors';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Only scroll to top if there is no hash in the URL
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      {/* Liquid Display Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-50">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-200/40 mix-blend-multiply filter blur-[100px] animate-liquid-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-200/40 mix-blend-multiply filter blur-[120px] animate-liquid-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-sky-200/40 mix-blend-multiply filter blur-[100px] animate-liquid-blob animation-delay-4000" />
      </div>

      <Header />
      <div className="min-h-screen text-slate-900 selection:bg-slate-200 relative z-0 max-w-[1600px] mx-auto border-x border-slate-200/50 backdrop-blur-[8px] bg-slate-50/50 shadow-2xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/partner-with-us" element={<PartnerWithUs />} />
          <Route path="/contributors" element={<Contributors />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}
