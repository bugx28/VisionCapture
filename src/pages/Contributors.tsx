import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, MapPin, Briefcase, ChevronRight, FileText, Globe, CheckCircle2, UserPlus, MonitorPlay, Video, Wallet, ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';
import FormattedText from '../components/FormattedText';

export default function Contributors() {
  const navigate = useNavigate();
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['contributor-projects'],
    queryFn: async () => {
      const res = await fetch('/api/public/projects/contributor');
      const data = await res.json();
      return data.projects || [];
    }
  });

  const handleApply = (project: any) => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      navigate(`/signup?project=${encodeURIComponent(project.title)}`);
    }
  };

  const toggleDetails = (projectId: string) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-12">
      <SEO title="Active Projects & Contributors | Vision Capture" description="Browse and apply for active data collection projects as a contributor. We are hiring for egocentric video collection." canonicalUrl="https://visioncapture.in/contributors" />
      
      {/* Combined Banner: How it Works & Hiring */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white flex flex-col">
          
          {/* Top Half: How it Works (Dark) */}
          <div className="relative bg-slate-900">
            <div className="absolute inset-0 z-0 bg-slate-900">
              <img src="/ego.webp" alt="Process Flow Background" loading="lazy" className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 to-slate-900/80" />
            </div>

            <div className="relative z-10 py-16 px-4 sm:px-8">
              <h2 className="text-3xl font-display font-bold text-white text-center mb-12 tracking-wide">How it Works</h2>
              <div className="flex flex-col md:flex-row items-center justify-between relative max-w-5xl mx-auto">
                <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-slate-700/80 z-0" />

                {[
                  { icon: <UserPlus className="w-6 h-6" />, title: "Apply to Earn", isLink: true },
                  { icon: <MonitorPlay className="w-6 h-6" />, title: "Onboarding" },
                  { icon: <Video className="w-6 h-6" />, title: "Recording Video" },
                  { icon: <Wallet className="w-6 h-6" />, title: "Payment" }
                ].map((step, i) => (
                  <React.Fragment key={i}>
                    {step.isLink ? (
                      <button onClick={(e) => { e.preventDefault(); handleApply({}); }} className="relative z-10 flex flex-col items-center group w-full md:w-1/4 cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-blue-600 border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-blue-500 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all duration-300 mb-4 relative">
                          {step.icon}
                        </div>
                        <h4 className="text-sm font-bold text-blue-400 text-center px-2 group-hover:text-blue-300 transition-colors">{step.title}</h4>
                      </button>
                    ) : (
                      <div className="relative z-10 flex flex-col items-center group w-full md:w-1/4">
                        <div className="w-16 h-16 rounded-full bg-slate-800/80 backdrop-blur-sm border-2 border-slate-600 shadow-xl flex items-center justify-center text-slate-300 group-hover:border-blue-400 group-hover:text-blue-400 group-hover:bg-slate-900 group-hover:scale-110 transition-all duration-300 mb-4 relative">
                          {step.icon}
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 text-center px-2 group-hover:text-white transition-colors">{step.title}</h4>
                      </div>
                    )}
                    {i < 3 && <div className="md:hidden w-0.5 h-8 bg-slate-700/80 my-3" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Half: Hiring (Light) */}
          <div className="p-8 sm:p-12 relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">Hiring: Video Contributors (Remote)</h1>
                <p className="text-slate-600 font-medium mt-1">Apply if you are Individual, Vendor, Has connections.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 relative z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Video className="w-5 h-5 text-slate-400" /> The Job
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Record POV videos of everyday household, commercial, or industrial tasks to train AI and robotics.
                </p>

                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-slate-400" /> Eligible Countries
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  India, USA, UK, Canada, Australia, Germany, France, Brazil, Japan, South Korea, Mexico, and more.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6 flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-slate-400" /> Quick Requirements
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'Recent smartphone (iPhone 11+, Pixel 6+, or Galaxy S21+).',
                      'Smartphone head strap.',
                      'Stable internet & well-lit workspace.',
                      'No experience required.'
                    ].map((req, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button 
                  onClick={() => handleApply({ title: "General Contributor" })} 
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 text-lg flex items-center justify-center gap-2 group"
                >
                  Apply to Earn <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mb-6">Contributors</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Browse our open data collection projects and apply to start earning today.
          </p>
        </div>

      {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : projectsData?.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Active Projects</h2>
            <p className="text-slate-600">Please check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
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

              <div className="p-8 flex-1 flex flex-col relative z-20">
                <h3 className="text-2xl font-display font-bold text-white mb-3">Egocentric Video Contributors ( Remote)</h3>
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
                    onClick={() => handleApply({ title: "Egocentric Video Contributors" })}
                    className="inline-flex items-center justify-center gap-1 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    Apply Now <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Projects */}
            {projectsData?.filter((p: any) => !p.isEgocentric).map((project: any) => {
              const isExpanded = expandedProjectId === project._id;
              
              return (
                <div key={project._id} className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all flex flex-col h-full">
                  
                  {(project.coverImage?.url || project.bannerImage) ? (
                    <div className="h-48 shrink-0 bg-slate-100 overflow-hidden relative">
                      <img src={project.coverImage?.url || project.bannerImage} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-600 to-indigo-900 shrink-0 flex items-center justify-center p-6 text-center">
                      <h3 className="text-white font-bold text-xl">{project.title}</h3>
                    </div>
                  )}
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-wider rounded-full mb-3 inline-block w-fit">
                      {project.category || 'General'}
                    </span>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{project.title}</h3>
                    <div className="text-green-600 font-black mb-4">{project.payRate}</div>
                    <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">
                      <FormattedText text={project.shortDescription} />
                    </p>

                    {/* Expanded Inline Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-6 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        {project.projectDetails && (
                          <div>
                            <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-500" /> Project Details
                            </h4>
                            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{project.projectDetails}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600 bg-slate-50 p-4 rounded-2xl">
                          {project.estimatedDuration && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {project.estimatedDuration}
                            </div>
                          )}
                          {project.country && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              {project.country}
                            </div>
                          )}
                          {project.deadline && (
                            <div className="flex items-center gap-2 col-span-2">
                              <FileText className="w-4 h-4 text-slate-400" />
                              Deadline: {new Date(project.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {project.requirements && (
                          <div>
                            <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-blue-500" /> Requirements
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed">{project.requirements}</p>
                          </div>
                        )}
                        {project.devicesRequired && (
                          <div>
                            <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 text-sm">
                              <MonitorPlay className="w-4 h-4 text-blue-500" /> Devices Needed
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed">{project.devicesRequired}</p>
                          </div>
                        )}
                        {project.eligibility && (
                          <div>
                            <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 text-sm">
                              <Globe className="w-4 h-4 text-blue-500" /> Eligibility
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed">{project.eligibility}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-auto pt-6 border-t border-slate-100 flex flex-wrap gap-3">
                      <button 
                        onClick={() => toggleDetails(project._id)}
                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm text-center flex items-center justify-center gap-1"
                      >
                        {isExpanded ? (
                          <>Less <ChevronUp className="w-4 h-4" /></>
                        ) : (
                          <>Details <ChevronDown className="w-4 h-4" /></>
                        )}
                      </button>
                      <button 
                        onClick={() => handleApply(project)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/30 text-sm"
                      >
                        Apply <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
