import { motion } from 'motion/react';
import { Factory, Stethoscope, ShoppingCart, Truck, Cpu, GraduationCap, Building2 } from 'lucide-react';

export default function Industries() {
  const industries = [
    { name: "Artificial Intelligence", icon: <Cpu className="w-5 h-5" /> },
    { name: "Robotics & Automation", icon: <Factory className="w-5 h-5" /> },
    { name: "Research Laboratories", icon: <GraduationCap className="w-5 h-5" /> },
    { name: "Healthcare AI", icon: <Stethoscope className="w-5 h-5" /> },
    { name: "Retail Technology", icon: <ShoppingCart className="w-5 h-5" /> },
    { name: "Logistics & Warehousing", icon: <Truck className="w-5 h-5" /> },
    { name: "Enterprise Tech", icon: <Building2 className="w-5 h-5" /> }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-12">
          Empowering Innovation Across Industries
        </h2>
        
        <div className="flex flex-wrap justify-center gap-4">
          {industries.map((ind, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full text-slate-700 font-medium hover:bg-white hover:border-slate-300 transition-colors cursor-default shadow-sm"
            >
              {ind.icon}
              <span className="text-sm">{ind.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
