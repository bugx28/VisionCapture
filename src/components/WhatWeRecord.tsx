import { motion } from 'motion/react';

const industryData = [
  {
    title: "Retail Stores",
    count: "4 INDUSTRIES",
    items: [
      { name: "Grocery", desc: "" },
      { name: "Pharmacy Retail", desc: "Prescription fulfillment, cold chain, controlled substances, clinical services" },
      { name: "Hardware Stores", desc: "Big-box and neighborhood hardware retail • 250,000+ SKU complexity" },
      { name: "Fashion Retail", desc: "Apparel retail floor and back-of-house • visual merchandising, garment handling" }
    ]
  },
  {
    title: "Consumer Services",
    count: "2 INDUSTRIES",
    items: [
      { name: "Drycleaning & Garment Services", desc: "High-throughput garment processing • intake, cleaning, pressing, pickup" },
      { name: "QSR & Restaurant Kitchens", desc: "Quick-service restaurants • multi-station choreographed workflows" }
    ]
  },
  {
    title: "Industrial Ops",
    count: "3 INDUSTRIES",
    items: [
      { name: "Precision Manufacturing", desc: "CNC operations, in-process metrology, hand-finishing, quality gates" },
      { name: "Auto Parts Manufacturing", desc: "Tier-1 and tier-2 automotive • press ops, welding, assembly-line work" },
      { name: "Industrial Remanufacturing", desc: "Circular-economy operations • pallet repair, drum & tote refurbishment" }
    ]
  },
  {
    title: "Logistics",
    count: "1 INDUSTRY",
    items: [
      { name: "Warehousing & Handling", desc: "Distribution & fulfillment centers • receiving, putaway, picking, packing, shipping" }
    ]
  },
  {
    title: "Healthcare & Wellness",
    count: "2 INDUSTRIES",
    items: [
      { name: "Healthcare (Clinical)", desc: "Bedside clinical staff workflows • IV management, wound care, emergency resuscitation" },
      { name: "Fitness & Physical Therapy", desc: "Personal training, physical therapy, rehab clinics • movement coaching & therapeutic modalities" }
    ]
  }
];

export default function WhatWeRecord() {
  return (
    <section id="what-we-record" className="py-24 relative bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 mb-6">
            What we can <span className="text-slate-500">record.</span>
          </h2>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            We cover highly specialized, skill-dense physical workflows across a variety of complex industries—delivering the precise egocentric data you need.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industryData.map((record, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 p-6 rounded-2xl shadow-sm hover:bg-white transition-all flex flex-col min-h-[220px]"
            >
              <div className="flex justify-between items-start gap-4 mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                  {record.title}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right w-24 shrink-0 mt-1">
                  {record.count}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {record.items.map((item, itemIdx) => (
                  <div key={itemIdx}>
                    <h4 className="text-sm font-bold text-slate-800">
                      • {item.name}
                    </h4>
                    {item.desc && (
                      <p className="text-xs text-slate-500 mt-1 pl-3 leading-relaxed">
                        {item.desc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
