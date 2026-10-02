import React, { useEffect } from 'react';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
const LiveStats = React.lazy(() => import('../components/LiveStats'));
const Services = React.lazy(() => import('../components/Services'));
const ValueProposition = React.lazy(() => import('../components/ValueProposition'));
const Industries = React.lazy(() => import('../components/Industries'));
const WhatWeRecord = React.lazy(() => import('../components/WhatWeRecord'));
const SampleVideoData = React.lazy(() => import('../components/SampleVideoData'));
const HomepageProjects = React.lazy(() => import('../components/HomepageProjects'));
const Contact = React.lazy(() => import('../components/Contact'));
const About = React.lazy(() => import('../components/About'));

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://visioncapture.in/#organization",
        "name": "Vision Capture",
        "url": "https://visioncapture.in",
        "logo": "https://visioncapture.in/logo.svg",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://visioncapture.in/#website",
        "url": "https://visioncapture.in",
        "name": "Vision Capture",
        "publisher": {
          "@id": "https://visioncapture.in/#organization"
        }
      },
      {
        "@type": "Service",
        "name": "AI Data Collection",
        "provider": {
          "@id": "https://visioncapture.in/#organization"
        },
        "description": "We specialize in egocentric and POV video data collection for training physical AI and robotics.",
        "areaServed": {
          "@type": "Country",
          "name": "India"
        }
      }
    ]
  };

  useEffect(() => {
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, []);

  return (
    <main>
      <SEO
        title="Vision Capture | AI Training Data Collection"
        description="Join Vision Capture to record POV videos of everyday tasks and help train the next generation of AI and robotics."
        canonicalUrl="https://visioncapture.in"
      />
      <Hero />
      <React.Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>}>
        <LiveStats />
        <Services />
        <ValueProposition />
        <Industries />
        <WhatWeRecord />
        <SampleVideoData />
        <HomepageProjects />
        <Contact />
        <About />
      </React.Suspense>
    </main>
  );
}
