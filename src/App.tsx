/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import ValueProposition from './components/ValueProposition';
import Industries from './components/Industries';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatWeRecord from './components/WhatWeRecord';
import SampleVideoData from './components/SampleVideoData';

export default function App() {
  return (
    <>
      {/* Liquid Display Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-50">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-200/40 mix-blend-multiply filter blur-[100px] animate-liquid-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-200/40 mix-blend-multiply filter blur-[120px] animate-liquid-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-sky-200/40 mix-blend-multiply filter blur-[100px] animate-liquid-blob animation-delay-4000" />
      </div>

      <Header />
      <div className="min-h-screen text-slate-900 selection:bg-slate-200 relative z-0 max-w-[1600px] mx-auto border-x border-slate-200/50 backdrop-blur-[8px] bg-slate-50/50 shadow-2xl">
        <main>
          <Hero />
          <Services />
          <ValueProposition />
          <WhatWeRecord />
          <Industries />
          <SampleVideoData />
          <About />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
