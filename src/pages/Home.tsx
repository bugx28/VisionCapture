import { useEffect } from 'react';
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
        "email": "info@visioncapture.in",
        "description": "Leading AI data collection platform specializing in high-fidelity egocentric POV video and multimodal human demonstration datasets for Physical AI and robotics foundation models.",
        "areaServed": {
          "@type": "AdministrativeArea",
          "name": "Worldwide"
        },
        "knowsAbout": [
          "Physical AI",
          "Embodied AI",
          "Robotics Foundation Models",
          "Egocentric Computer Vision",
          "Multimodal AI Datasets",
          "Human Demonstration Learning",
          "Spatial Intelligence",
          "Dexterous Manipulation",
          "Behavior Cloning",
          "Imitation Learning"
        ],
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "AI Training Data Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Egocentric POV Video Data Collection",
                "description": "4K and 1080p high-frame-rate first-person video captured via smart glasses and action cameras."
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Physical AI & Robotics Demonstration Datasets",
                "description": "Multi-domain human manipulation and navigation datasets for embodied robotics policies."
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Automated Anonymization & Ethical Annotation",
                "description": "Bystander facial blurring, license plate obfuscation, and action-timestamp segmentation."
              }
            }
          ]
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "info@visioncapture.in",
          "contactType": "sales",
          "availableLanguage": ["English", "Hindi"]
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://visioncapture.in/#website",
        "url": "https://visioncapture.in",
        "name": "Vision Capture",
        "description": "Accelerating next-generation robotics and Physical AI with authentic first-person human demonstration datasets at scale.",
        "publisher": {
          "@id": "https://visioncapture.in/#organization"
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
