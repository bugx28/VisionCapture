import { motion } from 'motion/react';
import { Glasses, MessageCircle } from 'lucide-react';
import HowItWorks from './HowItWorks';

export default function Services() {
  const services = [
    {
      icon: <Glasses className="w-8 h-8 text-white transition-colors" />,
      title: "Egocentric Video Data",
      description: "High-fidelity first-person perspective video collection using smart glasses, head-mounted cameras, and specialized rigs. Essential for teaching AI models to understand the world from a human viewpoint."
    }
  ];

  return (
    <section id="services" className="py-12 sm:py-24 relative bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <h2 className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase mb-4">Core Portfolio</h2>
          <h3 className="text-2xl sm:text-4xl font-display font-bold text-slate-900 mb-4 sm:mb-6">
            Specialized Data for Intelligent Systems
          </h3>
          <p className="text-slate-600 text-base sm:text-lg">
            We provide the foundational real-world data required to train complex, adaptable, and robust Physical AI models.
          </p>
        </div>

        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-slate-200 shadow-xl rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 lg:p-12 max-w-6xl w-full"
          >
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start lg:items-center justify-between mb-8 sm:mb-12">
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-center flex-1">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[1.5rem] bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/20">
                  <Glasses className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-slate-900 mb-2 sm:mb-3">Egocentric Video Data</h4>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base lg:text-lg max-w-2xl">
                    High-fidelity first-person perspective video collection using smart glasses, head-mounted cameras, and specialized rigs. Essential for teaching AI models to understand the world from a human viewpoint.
                  </p>
                </div>
              </div>
              
              <div className="w-full lg:w-auto shrink-0">
                <a href="/partner-with-us" className="inline-flex w-full lg:w-auto justify-center items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all text-sm sm:text-base font-bold shadow-lg shadow-slate-900/20">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Partner With Us
                </a>
              </div>
            </div>

            {/* How It Works embedded section */}
            <div className="w-full pt-8 sm:pt-12 border-t-2 border-slate-100">
              <HowItWorks />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
