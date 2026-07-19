import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import ProcessFlow from './ProcessFlow';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-80"
          src="/intro-video.mp4"
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto relative z-10 flex flex-col items-center">

        {/* Main Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-fit max-w-4xl p-6 sm:p-10 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center text-center mx-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-md text-slate-900 border border-slate-200 shadow-sm text-xs font-bold rounded-full uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-600 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-600" />
            </span>
            India's Premier Data Infrastructure
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            Real-world Data for <br />
            <span className="text-slate-700">
              Physical AI
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-800 mb-8 leading-relaxed max-w-2xl font-medium mx-auto">
            We capture authentic human demonstrations and egocentric multimodal data to accelerate the development of next-generation intelligent robotics and embodied AI systems.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

        {/* Interactive Process Flow Section */}
        <div className="w-full mt-24">
          <ProcessFlow />
        </div>

      </div>
    </section>
  );
}
