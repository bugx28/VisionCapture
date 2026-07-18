import { Target, Lightbulb, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-6">
              Pioneering Data Collection for <br />
              <span className="text-slate-500">Embodied Intelligence</span>
            </h2>

            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                Founded in 2026 and headquartered in Alwar, Rajasthan, Vision Capture is India's premier AI data collection company dedicated entirely to Physical AI, robotics, and embodied systems.
              </p>
              <p>
                We bridge the gap between digital models and the physical world by providing highly accurate, ethically sourced, real-world datasets. Our scalable PAN India operations capture the nuanced human demonstrations needed to train the next generation of intelligent machines.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2 text-slate-900 font-bold text-sm tracking-wide">
              <MapPin className="w-4 h-4" />
              <span>HQ: Alwar, Rajasthan | Operations: PAN India</span>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/60 backdrop-blur-xl border border-slate-200 shadow-sm rounded-3xl p-8 hover:bg-white transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 shadow-md">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                To deliver accurate, diverse, and production-ready AI datasets by combining experienced field operations, advanced quality assurance, and responsible methodologies.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/60 backdrop-blur-xl border border-slate-200 shadow-sm rounded-3xl p-8 sm:translate-y-8 hover:bg-white transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 shadow-md">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Our Vision</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                To become the most trusted global data infrastructure partner, enabling the seamless integration of intelligent robotic systems into human environments.
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
