import React from 'react';
import { motion } from 'motion/react';

const samples = [
  {
    title: "Household",
    category: "Household",
    video: "/household.mp4"
  },
  {
    title: "Paint Brush",
    category: "Manufacturing",
    video: "/brush.mp4"
  },
  {
    title: "Cardboard",
    category: "Industrial",
    video: "/cardboard.mp4"
  },
  {
    title: "Textile",
    category: "Industrial",
    video: "/textile.mp4"
  }
];

function LazyVideo({ src }: { src: string }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
          } else if (videoRef.current) {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.2 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      playsInline
      preload="none"
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

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
              viewport={{ once: true, margin: "100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-md overflow-hidden group cursor-pointer"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-900">
                <LazyVideo src={sample.video} />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold tracking-wider uppercase text-white shadow-sm z-10">
                  {sample.category}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-base text-center">
                  {sample.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
