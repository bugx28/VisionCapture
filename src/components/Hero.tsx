import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Clock, MapPin, Briefcase, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ProcessFlow from './ProcessFlow';
import FormattedText from './FormattedText';

export default function Hero() {
  const { data: fetchedProjects } = useQuery({
    queryKey: ['homepage-projects'],
    queryFn: async () => {
      const res = await fetch('/api/public/projects/homepage');
      const data = await res.json();
      return data.projects || [];
    }
  });

  const projectsData = React.useMemo(() => {
    const hardcodedPromo = {
      _id: 'egocentric-promo',
      title: 'Egocentric Video Contributors (Remote)',
      payRate: 'High Pay',
      shortDescription: 'Record POV videos of everyday household, commercial, or industrial tasks to train AI and robotics. Smartphone (iPhone 11+, Pixel 6+, S21+) & Head strap required.',
      bannerImage: '/ego.webp',
      category: 'Featured'
    };

    if (!fetchedProjects) return [hardcodedPromo];

    const otherProjects = fetchedProjects.filter((p: any) => !p.isEgocentric);
    return [hardcodedPromo, ...otherProjects];
  }, [fetchedProjects]);

  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

  useEffect(() => {
    if (!projectsData || projectsData.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentProjectIndex((prev) => (prev + 1) % projectsData.length);
    }, 6000); // Shuffle every 6 seconds
    return () => clearInterval(interval);
  }, [projectsData]);

  const nextProject = () => {
    if (projectsData) {
      setCurrentProjectIndex((prev) => (prev + 1) % projectsData.length);
    }
  };

  const prevProject = () => {
    if (projectsData) {
      setCurrentProjectIndex((prev) => (prev - 1 + projectsData.length) % projectsData.length);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col pt-32 pb-20 overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 bg-slate-50">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover opacity-80"
          src="/intro-video.mp4"
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto relative z-10 flex flex-col flex-1 px-4">

        {/* Split Hero Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16 flex-1">

          {/* Left Column: Text Box */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full p-8 sm:p-12 bg-black/10 backdrop-blur-sm rounded-3xl border border-black/20 shadow-2xl flex flex-col items-start text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/80 backdrop-blur-md text-white border border-slate-200 shadow-sm text-xs font-bold rounded-full uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-600 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-600" />
              </span>
              India's Premier Data Infrastructure
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-black leading-[1.1] mb-6 drop-shadow-lg">
              Real-world Data for <br />
              <span className="text-blue-600 drop-shadow-md">
                Physical AI
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-800 mb-10 leading-relaxed max-w-2xl font-medium drop-shadow-md">
              We capture authentic human demonstrations and egocentric multimodal data to accelerate the development of next-generation intelligent robotics and embodied AI systems.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <a
                href="mailto:contact@visioncapture.in"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-black text-white font-bold hover:bg-slate-100 transition-colors shadow-xl border border-slate-200"
              >
                Discuss Your Project
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#what-we-record"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-black/10 text-black font-bold hover:bg-black/20 transition-colors border border-black/30 backdrop-blur-md"
              >
                Recording Environments
              </a>
            </div>
          </motion.div>

          {/* Right Column: Active Projects Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full h-full flex flex-col justify-center"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Active Projects
              </h2>
              <p className="text-blue-700 text-lg font-medium">Start Earning Today</p>
            </div>

            <div className="relative w-full aspect-[4/3] sm:aspect-auto sm:h-[560px] group">
              {projectsData && projectsData.length > 1 && (
                <>
                  <button
                    onClick={prevProject}
                    className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 p-3 bg-white hover:bg-slate-50 text-slate-900 shadow-xl border border-slate-200 rounded-full transition-all z-30 opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:flex hover:scale-110"
                    aria-label="Previous project"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextProject}
                    className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 p-3 bg-white hover:bg-slate-50 text-slate-900 shadow-xl border border-slate-200 rounded-full transition-all z-30 opacity-0 group-hover:opacity-100 focus:opacity-100 hidden sm:flex hover:scale-110"
                    aria-label="Next project"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              <AnimatePresence mode="wait">
                {projectsData && projectsData.length > 0 ? (
                  <motion.div
                    key={currentProjectIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col overflow-hidden"
                  >
                    {(() => {
                      const currentProject = projectsData[currentProjectIndex % projectsData.length];
                      return currentProject._id === 'egocentric-promo' ? (
                        <>
                          <img
                            src={currentProject.bannerImage}
                            alt={`${currentProject.title} - Vision Capture`}
                            fetchPriority="high"
                            className="absolute inset-0 w-full h-full object-cover z-0"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent z-10" />

                          <div className="relative z-20 flex flex-col h-full justify-end p-6 sm:p-8 pb-12">
                            <div className="flex gap-3 mb-4">
                              <span className="px-3 py-1 bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg border border-blue-400/30">Featured</span>
                              <span className="px-3 py-1 bg-green-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg border border-green-400/30">High Pay</span>
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3 leading-tight">
                              {currentProject.title}
                            </h3>
                            <p className="text-slate-200 text-sm sm:text-base mb-4 leading-relaxed">
                              Record POV videos of everyday household, commercial, or industrial tasks to train AI and robotics.
                            </p>

                            <div className="mb-6 space-y-2 bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
                              <div className="text-xs font-bold text-blue-300 uppercase tracking-wide">Quick Requirements</div>
                              <ul className="space-y-1.5">
                                <li className="flex items-start gap-2 text-white text-sm font-medium">
                                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                  <span>Smartphone (iPhone 11+, Pixel 6+, S21+) & Head strap</span>
                                </li>
                                <li className="flex items-center gap-2 text-white text-sm font-medium">
                                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                                  <span>No experience required</span>
                                </li>
                              </ul>
                            </div>

                            <div className="mt-auto pt-4 border-t border-white/20">
                              <div className="flex justify-between items-center mb-3">
                                <div className="font-bold text-green-400 drop-shadow-md">Apply to Earn</div>
                              </div>
                              <a
                                href="/signup?project=Egocentric%20Video%20Contributors"
                                className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-xl shadow-blue-600/30 text-lg group"
                              >
                                Apply Now
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              </a>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-48 sm:h-56 bg-slate-100 overflow-hidden relative shrink-0">
                            {currentProject.coverImage?.url || currentProject.bannerImage ? (
                              <img
                                src={currentProject.coverImage?.url || currentProject.bannerImage}
                                alt={currentProject.title}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                <Briefcase className="w-12 h-12 text-blue-200" />
                              </div>
                            )}
                          </div>

                          <div className="p-6 sm:p-8 flex flex-col flex-1 pb-10">
                          <div className="flex justify-between items-start mb-5">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs uppercase tracking-wider rounded-full shadow-sm">
                              {currentProject.category || 'General'}
                            </span>
                            <span className="px-4 py-1.5 bg-green-500 text-white font-black text-sm uppercase tracking-wide rounded-full shadow-md shadow-green-500/20">
                              {currentProject.payRate}
                            </span>
                          </div>

                          <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-3 leading-tight hover:text-blue-600 transition-colors">
                            {currentProject.title}
                          </h3>

                          <div className="mb-6 shrink-0">
                            <p className="text-slate-600 text-sm md:text-base line-clamp-2 md:line-clamp-3 leading-relaxed font-medium">
                              <FormattedText text={currentProject.shortDescription || 'Join this project to contribute to cutting-edge AI data collection.'} />
                            </p>
                          </div>

                            <div className="grid grid-cols-2 gap-4 mb-auto">
                              {currentProject.estimatedDuration && (
                                <div className="flex items-center gap-2 text-slate-700 font-medium bg-slate-50 px-3 py-2 rounded-xl">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span className="truncate">{currentProject.estimatedDuration}</span>
                                </div>
                              )}
                              {currentProject.country && (
                                <div className="flex items-center gap-2 text-slate-700 font-medium bg-slate-50 px-3 py-2 rounded-xl">
                                  <MapPin className="w-4 h-4 text-slate-400" />
                                  <span className="truncate">{currentProject.country}</span>
                                </div>
                              )}
                              {currentProject.positions && (
                                <div className="flex items-center gap-2 text-slate-700 font-medium bg-slate-50 px-3 py-2 rounded-xl">
                                  <Briefcase className="w-4 h-4 text-slate-400" />
                                  <span className="truncate">{currentProject.positions} Openings</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-6">
                              <a
                                href="/contributors"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 text-base sm:text-lg"
                              >
                                Apply Now
                                <ArrowRight className="w-5 h-5" />
                              </a>
                            </div>
                          </div>
                        </>
                      );
                    })()}

                    {/* Carousel Indicators */}
                    {projectsData.length > 1 && (
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {projectsData.map((_: any, idx: number) => (
                          <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all ${idx === currentProjectIndex ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300'}`}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl flex flex-col items-center justify-center text-center">
                    <Briefcase className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Check Back Soon</h3>
                    <p className="text-slate-600">New high-paying contributor projects are being posted regularly.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>

        {/* Interactive Process Flow Section */}
        <div className="w-full mt-12">
          <ProcessFlow />
        </div>

      </div>
    </section>
  );
}
