import { CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function ValueProposition() {
  const points = [
    "PAN India contributor recruitment and deployment capabilities.",
    "Standardized and scalable field data collection workflows.",
    "Flexible execution for custom enterprise data collection.",
    "Privacy-conscious and ethically managed participant programs.",
    "Dedicated project management and transparent communication."
  ];

  return (
    <section id="why-us" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <div className="order-2 lg:order-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid gap-4"
            >
              {points.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 bg-white/60 backdrop-blur-xl border border-slate-200 p-4 rounded-xl shadow-sm hover:bg-white transition-colors"
                >
                  <CheckCircle2 className="w-6 h-6 text-slate-900 shrink-0 mt-0.5" />
                  <p className="text-slate-700 font-medium text-sm leading-relaxed">{point}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase mb-4">The Vision Capture Advantage</h2>
            <h3 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-6">
              Built for Scale. <br /> Engineered for Quality.
            </h3>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              We understand that the success of physical AI depends entirely on the quality of its training data. Our operations are designed from the ground up to handle complex, large-scale data collection without compromising on strict quality constraints.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-200">
              <div>
                <div className="text-4xl font-display font-bold text-slate-900 mb-2">100%</div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-[0.1em]">Ethically Sourced</div>
              </div>
              <div>
                <div className="text-4xl font-display font-bold text-slate-900 mb-2">PAN</div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-[0.1em]">India Coverage</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
