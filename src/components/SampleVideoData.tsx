import React from 'react';

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

function LazyVideo({ src, title }: { src: string; title: string }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (isMobile) return; // Do not autoplay on mobile to save battery and GPU

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
  }, [isMobile]);

  // On mobile: show poster image from first frame, don't download video
  if (isMobile) {
    return (
      <video
        ref={videoRef}
        src={`${src}#t=0.001`}
        muted
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      playsInline
      preload="metadata"
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

export default function SampleVideoData() {
  return (
    <section id="sample-data" className="py-12 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-slate-900 mb-4 sm:mb-6">
            Sample <span className="text-slate-500">Video</span> Data
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Explore our high-quality egocentric video datasets captured in 4K resolution
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {samples.map((sample, index) => (
            <div
              key={index}
              className="bg-white/95 border border-slate-200 rounded-2xl shadow-md overflow-hidden group cursor-pointer"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-900">
                <LazyVideo src={sample.video} title={sample.title} />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/40 border border-white/30 text-[10px] font-bold tracking-wider uppercase text-white shadow-sm z-10">
                  {sample.category}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-base text-center">
                  {sample.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
