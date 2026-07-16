import { motion } from 'motion/react';
import { Play, Eye, Clock } from 'lucide-react';

const samples = [
  {
    title: "Robotic Arm Setup",
    category: "Industrial",
    description: "Configuring and teaching an industrial robotic arm for precise manufacturing tasks",
    duration: "1:15",
    views: "24.1K",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Picking Items Task",
    category: "Logistics",
    description: "Warehouse item picking with object recognition and hand tracking",
    duration: "0:48",
    views: "16.8K",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Phone Charging Task",
    category: "Household",
    description: "Mobile device handling and cable manipulation tracking",
    duration: "0:35",
    views: "12.5K",
    image: "https://images.unsplash.com/photo-1519326844854-704cb3b72802?q=80&w=600&auto=format&fit=crop"
  },
  {
    title: "Remote Cleaning Task",
    category: "Household",
    description: "TV remote cleaning with small object handling and precision movements",
    duration: "0:42",
    views: "11.2K",
    image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=600&auto=format&fit=crop"
  }
];

export default function SampleVideoData() {
  return (
    <section id="sample-data" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 mb-6">
            Sample <span className="text-slate-500">Video</span> Data
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            Explore our high-quality egocentric video datasets captured in 4K resolution
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {samples.map((sample, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-md overflow-hidden group cursor-pointer"
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={sample.image} 
                  alt={sample.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg shadow-black/20 transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <Play className="w-5 h-5 ml-1" />
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold text-white shadow-sm">
                  {sample.category}
                </div>

                {/* Meta info */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white/90 text-xs font-medium">
                  <div className="flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                    <Clock className="w-3 h-3" />
                    {sample.duration}
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                    <Eye className="w-3 h-3" />
                    {sample.views}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-lg mb-2">{sample.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                  {sample.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
