import { motion } from 'motion/react';
import { ArrowRight, Camera, Brain, Database } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Subtle overlay for hero */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/30 to-slate-50 opacity-90" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl py-24"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/50 backdrop-blur-md text-slate-800 border border-slate-200 shadow-sm text-xs font-bold rounded-full uppercase tracking-wider mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              India's Premier Data Infrastructure
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Real-world Data for <br />
              <span className="text-slate-500">
                Physical AI
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
              We capture authentic human demonstrations and egocentric multimodal data to accelerate the development of next-generation intelligent robotics and embodied AI systems.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-md"
              >
                Discuss Your Project
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#what-we-record"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-slate-900 font-bold hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm"
              >
                Explore Datasets
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            {/* Motion Graphic */}
            <div className="relative w-full max-w-lg aspect-square">
              {/* Center glowing orb/liquid */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 90, 0],
                  borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%"]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-12 bg-gradient-to-tr from-blue-100 to-indigo-100 backdrop-blur-3xl border border-white/50 shadow-2xl"
              />

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-8 p-4 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white"
              >
                <Camera className="w-8 h-8 text-indigo-500" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 right-8 p-4 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white"
              >
                <Brain className="w-8 h-8 text-blue-500" />
              </motion.div>

              <motion.div
                animate={{ y: [0, -15, 0], x: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-1/3 right-1/3 p-4 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white"
              >
                <Database className="w-8 h-8 text-sky-500" />
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
