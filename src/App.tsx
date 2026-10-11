import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import Home from './pages/Home';

const PartnerWithUs = React.lazy(() => import('./pages/PartnerWithUs'));
const Contributors = React.lazy(() => import('./pages/Contributors'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Admin = React.lazy(() => import('./pages/Admin'));
const ProjectManager = React.lazy(() => import('./pages/ProjectManager'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Opportunities = React.lazy(() => import('./pages/Opportunities'));
const OpportunityManager = React.lazy(() => import('./pages/OpportunityManager'));
const Visualisation = React.lazy(() => import('./pages/Visualisation'));
const EgocentricOnboarding = React.lazy(() => import('./pages/EgocentricOnboarding'));
const Legal = React.lazy(() => import('./pages/Legal'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const prevPathname = React.useRef(pathname);

  useEffect(() => {
    // If navigating to a different page, always scroll to top
    if (prevPathname.current !== pathname) {
      window.scrollTo(0, 0);
      prevPathname.current = pathname;
    } else if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      {/* Hardware-accelerated background gradients with native radial gradients for smooth 120fps scrolling on Safari & Chrome */}
      <div 
        className="fixed inset-0 z-[-1] overflow-hidden bg-blue-50 pointer-events-none"
        style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
      >
        <div 
          className="hidden md:block absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(191, 219, 254, 0.7) 0%, rgba(191, 219, 254, 0) 70%)' }}
        />
        <div 
          className="hidden md:block absolute top-[20%] right-[-10%] w-[70vw] h-[70vw] rounded-full opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(199, 210, 254, 0.7) 0%, rgba(199, 210, 254, 0) 70%)' }}
        />
        <div 
          className="hidden md:block absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(224, 242, 254, 0.7) 0%, rgba(224, 242, 254, 0) 70%)' }}
        />
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
              <Route path="/pm-visualisations" element={<Visualisation />} />
              <Route path="/opportunity-manager" element={<OpportunityManager />} />
              <Route path="/onboarding/:applicationId" element={<EgocentricOnboarding />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/privacy" element={<Navigate to="/legal#privacy" replace />} />
              <Route path="/privacy-policy" element={<Navigate to="/legal#privacy" replace />} />
              <Route path="/terms" element={<Navigate to="/legal#terms" replace />} />
              <Route path="/terms-of-service" element={<Navigate to="/legal#terms" replace />} />
              <Route path="/ethics" element={<Navigate to="/legal#ethics" replace />} />
              <Route path="/ethical-data-guidelines" element={<Navigate to="/legal#ethics" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
        </ErrorBoundary>
        <Footer />
      </div>
    </Router>
  );
}
