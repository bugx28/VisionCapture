import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Search, MapPin, Briefcase, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import FormattedText from '../components/FormattedText';

export default function Opportunities() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: fetchedOpportunities, isLoading } = useQuery({
    queryKey: ['public-opportunities'],
    queryFn: async () => {
      const res = await fetch('/api/public/opportunities');
      const data = await res.json();
      return data.opportunities || [];
    }
  });

  const projectsData = React.useMemo(() => {
    const hardcodedPromo = {
      _id: 'egocentric-promo',
      title: 'Egocentric Video Contributors (Remote)',
      payRate: 'High Pay',
      shortDescription: 'Record POV videos of everyday household, commercial, or industrial tasks to train AI and robotics. Smartphone (iPhone 11+, Pixel 6+, S21+) & Head strap required.',
      bannerImage: '/ego.webp',
      category: 'Featured',
      isEgocentric: true
    };

    if (!fetchedOpportunities) return [hardcodedPromo];

    return [hardcodedPromo, ...fetchedOpportunities];
  }, [fetchedOpportunities]);

  const filteredProjects = projectsData.filter((project: any) => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.tags && project.tags.join(' ').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-blue-50 min-h-screen pt-24 sm:pt-32 pb-20">
      <SEO title="Opportunities | Vision Capture" description="High-paying remote AI training jobs and data collection opportunities." />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 border border-blue-200 shadow-sm text-xs font-bold rounded-full uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            Available Now
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-slate-900 tracking-tight mb-6">
            Opportunities
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl font-medium mb-10">
            Use your expertise to train next generation AI models. Access exclusive roles, competitive pay, and start with flexible projects.
          </p>
          
          {/* Search Bar */}
          <div className="relative w-full max-w-xl">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by role or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 text-slate-900 rounded-full py-4 pl-12 pr-6 shadow-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-lg"
            />
          </div>
        </div>

        {/* Opportunities Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No opportunities found</h3>
            <p className="text-slate-500">Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-5xl mx-auto">
            {filteredProjects.map((project: any) => (
              <div 
                key={project._id} 
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group"
              >
                {project._id === 'egocentric-promo' ? (
                  <>
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider rounded-full border border-blue-100">Featured</span>
                        <span className="px-3 py-1 bg-green-50 text-green-700 font-bold text-xs uppercase tracking-wider rounded-full border border-green-200">{project.payRate}</span>
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      
                      <div className="text-slate-500 text-sm mb-4 leading-relaxed max-w-3xl">
                        {project.shortDescription}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                          <span>No experience required</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-500" />
                          <span>Smartphone & Head strap</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                      <a
                        href={`/signup?project=${encodeURIComponent(project.title)}`}
                        className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 text-base"
                      >
                        Apply Now
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 w-full">
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {project.tags.map((tag: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      
                      <div className="text-slate-500 text-sm mb-4 leading-relaxed max-w-3xl line-clamp-2">
                        {project.shortDescription}
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-600">
                        {project.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{project.location}</span>
                          </div>
                        )}
                        {project.payRate && (
                          <div className="flex items-center gap-1.5 text-green-700">
                            <Briefcase className="w-4 h-4 text-green-600" />
                            <span>{project.payRate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                      <a
                        href={project.applyLink || "/contributors"}
                        target={project.applyLink ? "_blank" : "_self"}
                        rel={project.applyLink ? "noreferrer" : ""}
                        className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 text-base"
                      >
                        Apply Now
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
