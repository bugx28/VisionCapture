import { motion } from 'motion/react';
import { Glasses } from 'lucide-react';

export default function Services() {
  const services = [
    {
      icon: <Glasses className="w-8 h-8 text-white transition-colors" />,
      title: "Egocentric Video Data",
      description: "High-fidelity first-person perspective video collection using smart glasses, head-mounted cameras, and specialized rigs. Essential for teaching AI models to understand the world from a human viewpoint."
    }
  ];

  return (
    <section id="services" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase mb-4">Core Portfolio</h2>
          <h3 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-6">
            Specialized Data for Intelligent Systems
          </h3>
          <p className="text-slate-600 text-lg">
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
              className="bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-[2rem] p-8 max-w-xl w-full hover:bg-white/90 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-300 shadow-md">
                <div className="transition-colors duration-300">
                  {service.icon}
                </div>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">{service.title}</h4>
              <p className="text-slate-600 leading-relaxed text-sm">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
