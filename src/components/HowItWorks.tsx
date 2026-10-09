import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Users, ClipboardList, Rocket, UserCheck, Video, PackageCheck, FileVideo } from 'lucide-react';

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const steps = [
    {
      id: 1,
      title: 'Client Outreach',
      desc: 'Understanding specific data needs.',
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      id: 2,
      title: 'Project Planning',
      desc: 'Defining parameters and scope.',
      icon: <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      id: 3,
      title: 'Assign Operators',
      desc: 'Deploying trained field experts.',
      icon: <UserCheck className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      id: 4,
      title: 'Record Data',
      desc: 'Capturing egocentric video.',
      icon: <Video className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      id: 5,
      title: 'Dataset Delivery',
      desc: 'Providing high-quality datasets.',
      icon: <PackageCheck className="w-6 h-6 sm:w-8 sm:h-8" />
    }
  ];

  return (
    <div className="w-full relative overflow-hidden mt-12" ref={containerRef}>
      <div className="w-full relative z-10">

        <div className="text-center mb-12">
          <motion.h4
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-display font-bold text-slate-900 mb-4"
          >
            How It Works
          </motion.h4>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-600 max-w-3xl mx-auto"
          >
            A seamless, end-to-end process for egocentric video collection, ensuring you receive the highest quality datasets for your AI models.
          </motion.p>
        </div>

        {/* Desktop Process Flow */}
        <div className="hidden lg:block relative py-10">
          {/* Connecting Line (Background) */}
          <div className="absolute top-[4.5rem] left-[8%] right-[8%] h-1 bg-slate-100 rounded-full">
            {/* Animated Glow Line */}
            <motion.div
              className="h-full bg-sky-500 rounded-full"
              initial={{ width: '0%' }}
              animate={isInView ? { width: '100%' } : { width: '0%' }}
              transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
            />
          </div>

          {/* Flowing File Icon */}
          {isInView && (
            <motion.div
              className="absolute top-[3.7rem] z-20"
              initial={{ left: '8%', opacity: 0, scale: 0.5 }}
              animate={{
                left: '92%',
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1, 1, 0.5]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: 1,
                ease: "linear"
              }}
              style={{ x: '-50%' }}
            >
              <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-200 text-sky-500 relative">
                <div className="absolute inset-0 bg-sky-400 blur-md opacity-20 rounded-xl" />
                <FileVideo className="w-5 h-5 relative z-10" />
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-5 gap-4 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.3 + (index * 0.2) }}
                className="flex flex-col items-center text-center group"
              >
                <div className="relative mb-6">
                  {/* Outer glowing ring */}
                  <div className="absolute inset-[-10px] bg-slate-200/0 rounded-full blur-xl group-hover:bg-sky-100 transition-colors duration-500" />

                  {/* Icon Container */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-lg group-hover:border-sky-500 group-hover:text-sky-500 transition-all duration-300 relative z-10 text-slate-700">
                    {step.icon}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-2 font-display text-sm sm:text-base px-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 px-2 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Process Flow (Fast & Lightweight) */}
        <div className="lg:hidden flex flex-col items-center py-8 px-4">
          <div className="flex flex-col items-center w-full max-w-sm mx-auto z-10">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center text-center w-full"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-md relative z-10 text-sky-500">
                    {step.icon}
                  </div>
                </div>
                
                <h3 className="font-bold text-slate-900 mb-1.5 font-display text-lg">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">
                  {step.desc}
                </p>

                {/* Mobile Connector Arrow */}
                {index < steps.length - 1 && (
                  <div className="mt-6 mb-6 flex flex-col items-center">
                    <div className="w-px h-8 bg-slate-300" />
                    <div className="w-2 h-2 border-b-2 border-r-2 border-slate-300 transform rotate-45 -mt-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
