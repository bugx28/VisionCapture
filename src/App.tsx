import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';

const Home = React.lazy(() => import('./pages/Home'));
const PartnerWithUs = React.lazy(() => import('./pages/PartnerWithUs'));
const Contributors = React.lazy(() => import('./pages/Contributors'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Admin = React.lazy(() => import('./pages/Admin'));
const ProjectManager = React.lazy(() => import('./pages/ProjectManager'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Opportunities = React.lazy(() => import('./pages/Opportunities'));
const OpportunityManager = React.lazy(() => import('./pages/OpportunityManager'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

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
      {/* Static Background Gradients — hidden on mobile to save GPU/battery */}
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-blue-50">
        <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-200/40 mix-blend-multiply filter blur-[100px]" />
        <div className="hidden md:block absolute top-[20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-200/40 mix-blend-multiply filter blur-[120px]" />
        <div className="hidden md:block absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-sky-200/40 mix-blend-multiply filter blur-[100px]" />
      </div>

      <Header />
      <div className="min-h-screen text-slate-900 selection:bg-slate-200 relative z-0 max-w-[1600px] mx-auto border-x border-slate-200/50 bg-blue-50 shadow-2xl">
        <ErrorBoundary>
          <React.Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/partner-with-us" element={<PartnerWithUs />} />
              <Route path="/contributors" element={<Contributors />} />
              {/* Redirect legacy route */}
              <Route path="/active-projects" element={<Navigate to="/contributors" replace />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Profile />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/project-manager" element={<ProjectManager />} />
              <Route path="/opportunity-manager" element={<OpportunityManager />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
        </ErrorBoundary>
        <Footer />
      </div>
    </Router>
  );
}
