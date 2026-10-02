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
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative bg-white/95 border border-white shadow-xl rounded-[2rem] p-5 sm:p-8 max-w-6xl w-full hover:bg-white transition-all group overflow-hidden"
            >
              <a href="/partner-with-us" className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1 sm:gap-2 bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors text-xs sm:text-sm font-bold shadow-sm z-10">
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Contact Us
              </a>
              
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start md:items-center mb-6 sm:mb-8 pt-10 sm:pt-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-300 shadow-md">
                  <div className="transition-colors duration-300">
                    {service.icon}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{service.title}</h4>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* How It Works embedded section */}
              <div className="w-full pt-6 sm:pt-8 border-t border-slate-200/60 mt-6 sm:mt-8">
                <HowItWorks />
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
