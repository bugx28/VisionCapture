import { motion } from 'motion/react';

const records = [
  {
    title: "Electrical / Industrial assembly",
    badge: "FLAGSHIP VERTICAL",
    items: "Panel wiring · Electronics assembly · Machine tending · Inspection"
  },
  {
    title: "CNC / Machining",
    badge: "SKILLED MACHINISTS",
    items: "Lathe ops · Mill setup · Quality inspection"
  },
  {
    title: "Tailoring & Textile",
    badge: "DEEP SKILLED POOL",
    items: "Hand stitching · Machine sewing · Pattern cutting"
  },
  {
    title: "Construction / Warehouse",
    badge: "HEAVY PHYSICAL TASKS",
    items: "Bricklaying · Tile setting · Pick and pack"
  },
  {
    title: "Carpentry & Furniture",
    badge: "COMPLEX 3D ASSEMBLY",
    items: "Joinery · Lathe work · Lacquer finishing"
  },
  {
    title: "Cooking & Food",
    badge: "MULTI-CUISINE POOL",
    items: "Knife skills · Plating · Tandoor / griddle"
  },
  {
    title: "Medical & Surgical",
    badge: "CREDENTIALED CLINICIANS",
    items: "Suturing · Instrument handoff · Patient prep"
  }
];

export default function WhatWeRecord() {
  return (
    <section id="what-we-record" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 mb-6">
            What we can <span className="text-slate-500">record.</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Our flagship vertical is skilled industrial and technical work - electrical panel assembly, machine tending, CNC setup, electronics assembly, and inspection - the data the free open datasets don't cover and gig networks can't reach.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-2xl shadow-sm hover:bg-white transition-all flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {record.title}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right w-24 shrink-0 mt-1">
                    {record.badge}
                  </span>
                </div>
              </div>
              <p className="text-slate-600 text-sm">
                {record.items}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
