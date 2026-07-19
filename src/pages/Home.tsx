import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import ValueProposition from '../components/ValueProposition';
import Industries from '../components/Industries';
import WhatWeRecord from '../components/WhatWeRecord';
import SampleVideoData from '../components/SampleVideoData';
import Contact from '../components/Contact';
import About from '../components/About';

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <ValueProposition />
      <Industries />
      <WhatWeRecord />
      <SampleVideoData />
      <Contact />
      <About />
    </main>
  );
}
