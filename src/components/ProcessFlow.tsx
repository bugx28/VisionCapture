import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Glasses, Database, Settings, Brain } from 'lucide-react';

export default function ProcessFlow() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const steps = [
    {
      id: 1,
      icon: <Glasses className="w-8 h-8 text-slate-800" />,
      title: "Data Capture",
      desc: "First-person egocentric video is captured using head-mounted cameras in real-world environments."
    },
    {
      id: 2,
      icon: (
        <div className="relative">
          <Database className="w-8 h-8 text-slate-800" />
          <Settings className="w-4 h-4 text-slate-500 absolute -bottom-1 -right-1 animate-[spin_4s_linear_infinite]" />
        </div>
      ),
      title: "Processing",
      desc: "Raw videos are securely uploaded, validated, synchronized and organized into high-quality datasets."
    },
    {
      id: 3,
      icon: <Brain className="w-8 h-8 text-slate-800" />,
      title: "AI Learning",
      desc: "Processed datasets are fed into Physical AI and Robotics models to learn human actions and spatial understanding."
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 relative z-20" ref={containerRef}>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 relative">

        {/* Desktop Connection Line SVG (Behind items) */}
        <div className="hidden lg:block absolute top-[40%] left-[10%] right-[38%] h-1 z-0">
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Background faint line */}
            <line x1="0" y1="0" x2="100%" y2="0" stroke="rgba(0,0,0,0.1)" strokeWidth="2" strokeDasharray="4 4" />

            {/* Animated glowing line */}
            <motion.line
              x1="0" y1="0" x2="100%" y2="0"
              stroke="#475569"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
              className="drop-shadow-[0_0_8px_rgba(71,85,105,0.3)]"
            />
          </svg>
        </div>

        {/* The 3 Steps */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 w-full lg:w-[60%] z-10">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.4 }}
              className="flex-1 flex flex-col items-center text-center group"
            >
              <div className="relative mb-6">
                {/* Glowing ring */}
                <div className="absolute inset-0 bg-slate-200/50 rounded-full blur-xl group-hover:bg-slate-300/60 transition-colors duration-500" />

                {/* Icon Container */}
                <div className="relative w-20 h-20 rounded-full bg-white border border-slate-200 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.05)] group-hover:border-slate-400/50 transition-colors">
                  {/* Pulse effect */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, delay: index * 0.3 }}
                    className="absolute inset-0 rounded-full border border-slate-300"
                  />
                  {step.icon}
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">
                {step.title}
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed max-w-[280px]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Connecting SVG from Step 3 to Video Card (Desktop) */}
        <div className="hidden lg:block absolute top-[40%] left-[62%] right-[35%] h-32 z-0">
          <svg width="100%" height="100%" className="overflow-visible" preserveAspectRatio="none">
            <motion.path
              d="M0,0 C50,0 50,-40 100,-40"
              stroke="#475569" strokeWidth="2" fill="none"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1, delay: 2 }}
              className="drop-shadow-[0_0_8px_rgba(71,85,105,0.3)]"
            />
            <motion.path
              d="M0,0 C50,0 50,40 100,40"
              stroke="#475569" strokeWidth="2" fill="none"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1, delay: 2 }}
              className="drop-shadow-[0_0_8px_rgba(71,85,105,0.3)]"
            />
          </svg>
        </div>

        {/* Step 4: Video Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, delay: 2.2, type: "spring" }}
          className="w-full lg:w-[35%] z-10 mt-8 lg:mt-0"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-6 shadow-xl hover:shadow-2xl transition-all duration-500 group relative">
            {/* Glow dots where lines attach */}
            <div className="hidden lg:block absolute -left-2 top-[30%] w-3 h-3 rounded-full bg-slate-600 shadow-[0_0_10px_rgba(71,85,105,0.5)]" />
            <div className="hidden lg:block absolute -left-2 top-[70%] w-3 h-3 rounded-full bg-slate-600 shadow-[0_0_10px_rgba(71,85,105,0.5)]" />

            <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">
              See Physical AI in Action
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              Watch how egocentric data enables robots to understand, learn and interact with the real world.
            </p>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                src="/orb-video.mp4"
              />
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
