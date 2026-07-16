import { Send } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate API call
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4">
            Start Your Data Project
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Ready to scale your AI data collection? Contact our enterprise team to discuss your specific requirements, quality standards, and timelines.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-10"
        >
          {status === 'success' ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-6">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Received</h3>
              <p className="text-slate-600">Our enterprise team will contact you within 24 hours.</p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-8 text-slate-900 font-bold hover:text-slate-700 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-slate-900">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors placeholder:text-slate-400 backdrop-blur-sm"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-slate-900">Work Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors placeholder:text-slate-400 backdrop-blur-sm"
                    placeholder="jane@company.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-bold text-slate-900">Organization / Company</label>
                <input 
                  type="text" 
                  id="company" 
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors placeholder:text-slate-400 backdrop-blur-sm"
                  placeholder="AI Robotics Inc."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="project" className="text-sm font-bold text-slate-900">Project Requirements</label>
                <textarea 
                  id="project" 
                  required
                  rows={4}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors resize-none placeholder:text-slate-400 backdrop-blur-sm"
                  placeholder="Briefly describe your data collection needs (e.g., egocentric video, hours required, environment)..."
                />
              </div>

              <button 
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-black/10"
              >
                {status === 'submitting' ? 'Submitting...' : (
                  <>
                    Request Consultation
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
