import React, { useEffect } from 'react';
import SEO from '../components/SEO';
import Hero from '../components/Hero';
import LiveStats from '../components/LiveStats';
import Services from '../components/Services';
import ValueProposition from '../components/ValueProposition';
import Industries from '../components/Industries';
import WhatWeRecord from '../components/WhatWeRecord';
import SampleVideoData from '../components/SampleVideoData';
import HomepageProjects from '../components/HomepageProjects';
import Contact from '../components/Contact';
import About from '../components/About';

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
      <LiveStats />
      <Services />
      <ValueProposition />
      <Industries />
      <WhatWeRecord />
      <SampleVideoData />
      <HomepageProjects />
      <Contact />
      <About />
    </main>
  );
}
