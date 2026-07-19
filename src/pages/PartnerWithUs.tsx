import React from 'react';

export default function PartnerWithUs() {
  return (
    <div className="py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-slate-900 mb-6">Partner with us</h1>
      <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
        Ready to scale your AI data collection? Contact our enterprise team to discuss your specific requirements, quality standards, and timelines.
      </p>
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-200">
        <a href="mailto:info@visioncapture.in" className="flex flex-col items-center group">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-slate-800">Write to us</span>
          <span className="text-slate-500 mt-1">info@visioncapture.in</span>
        </a>
      </div>
    </div>
  );
}
