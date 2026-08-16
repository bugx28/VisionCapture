import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowRight, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <SEO 
        title="Page Not Found | Vision Capture" 
        description="The page you are looking for does not exist. Return to Vision Capture homepage."
      />
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 max-w-lg w-full flex flex-col items-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
          <SearchX className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Page Not Found</h2>
        <p className="text-slate-600 mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            to="/"
            className="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
          >
            Go to Homepage
          </Link>
          <Link
            to="/contributors"
            className="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            View Projects <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
