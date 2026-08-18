import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Database, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormattedText from './FormattedText';

export default function HomepageProjects() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);
  const { data: projects, isLoading } = useQuery({
    queryKey: ['homepage-projects'],
    queryFn: async () => {
      const res = await fetch('/api/public/projects/homepage');
      const data = await res.json();
      return data.projects || [];
    }
  });

  if (isLoading || !projects) return null;

  return (
    <section className="py-16 sm:py-24 bg-slate-50 relative overflow-hidden" id="active-projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-extrabold text-slate-900 mb-6">Active Projects</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Join our open projects and start recording environments today.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Active Projects</h2>
            <p className="text-slate-600">Please check back later for new opportunities.</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Shine Animation Keyframes */}
          <style>{`
            @keyframes shine {
              0% { transform: translateX(-200%) skewX(-15deg); }
              20%, 100% { transform: translateX(300%) skewX(-15deg); }
            }
          `}</style>

          {/* Dedicated Egocentric Card */}
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl hover:-translate-y-1 transition-transform duration-300 group flex flex-col h-full relative ring-1 ring-white/10">
            {/* Shine Animation Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none opacity-50 mix-blend-overlay overflow-hidden rounded-3xl">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-80 animate-[shine_4s_ease-in-out_infinite]" />
            </div>

            <div className="h-48 bg-slate-800 overflow-hidden relative">
              <img src="/ego.webp" alt="Egocentric Video Contributors" loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute top-4 left-4 z-20">
                <span className="px-3 py-1 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg border border-blue-400/30">Featured</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col relative z-20">
              <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3">Egocentric Video Contributors ( Remote)</h3>
              <p className="text-blue-300 font-medium text-sm mb-2">Apply if you are Individual, Vendor, Has connections.</p>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">Record POV videos of everyday household, commercial, or industrial tasks to train AI and robotics.</p>

              <div className="mb-6 space-y-2">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-wide">Quick Requirements</div>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2 text-slate-300 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> Smartphone (iPhone 11+, Pixel 6+, S21+) & Head strap</li>
                  <li className="flex items-center gap-2 text-slate-300 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> No experience required</li>
                </ul>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-700/50 flex justify-between items-center">
                <div className="font-bold text-green-400">Apply to Earn</div>
                <button
                  onClick={() => {
                    if (isLoggedIn) navigate('/profile');
                    else navigate(`/signup?project=Egocentric%20Video%20Contributors`);
                  }}
                  className="inline-flex items-center justify-center gap-1 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Apply Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Projects */}
          {projects?.filter((p: any) => !p.isEgocentric).map((project: any) => (
            <div key={project._id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative">
              <div className="h-48 bg-slate-100 overflow-hidden relative">
                {(project.coverImage?.url || project.bannerImage) ? (
                  <img src={project.coverImage?.url || project.bannerImage} alt={project.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
                    <Database className="w-12 h-12" />
                  </div>
                )}
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-5">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider rounded-full shadow-sm">
                    {project.category || 'General'}
                  </span>
                  <span className="px-4 py-1.5 bg-green-500 text-white font-black text-sm uppercase tracking-wide rounded-full shadow-md shadow-green-500/20">
                    {project.payRate}
                  </span>
                </div>

                <h3 className="text-2xl font-display font-bold text-slate-900 mb-3 leading-tight hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                
                <div className="mb-6 shrink-0">
                  <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed font-medium">
                    <FormattedText text={project.shortDescription} />
                  </p>
                </div>

                <div className="mt-auto pt-2 flex justify-between items-center">
                  <div className="font-bold text-slate-400 text-xs uppercase tracking-widest hidden sm:block">Open Role</div>
                  <button
                    onClick={() => {
                      if (isLoggedIn) navigate('/profile');
                      else navigate(`/signup?project=${encodeURIComponent(project.title)}`);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-600/30 text-sm w-full sm:w-auto"
                  >
                    Apply Now <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
