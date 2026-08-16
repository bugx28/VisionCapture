import { Send } from 'lucide-react';
import React, { useState } from 'react';

interface ContactProps {
  hideHeader?: boolean;
}

export default function Contact({ hideHeader = false }: ContactProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newErrors: Record<string, string> = {};
    
    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const company = (formData.get('company') as string)?.trim();
    const serviceType = (formData.get('serviceType') as string)?.trim();
    const message = (formData.get('message') as string)?.trim();

    if (!name) newErrors.name = 'Please enter your full name.';
    
    if (!email) {
      newErrors.email = 'Please enter your work email.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter correct email.';
      }
    }

    if (!serviceType) newErrors.serviceType = 'Please select an item in the list.';
    
    if (!message) newErrors.message = 'Please enter a message.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus('idle');
      return;
    }

    setErrors({});

    const data = {
      name,
      email,
      company,
      serviceType,
      message
    };

    try {
      const startTime = performance.now();
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const endTime = performance.now();
      console.log(`Total API Submission Time: ${(endTime - startTime).toFixed(2)} ms`);

      if (!response.ok) {
        let errorMsg = 'Failed to submit form';
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      setStatus('success');
      form.reset();
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'Something went wrong. Please try again later.');
    }
  };

  return (
    <section id="contact" className={`${hideHeader ? '' : 'py-24'} relative overflow-hidden`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {!hideHeader && (
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 mb-4">
              Start Your Data Project
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Ready to scale your AI data collection? Contact our enterprise team to discuss your specific requirements, quality standards, and timelines.
            </p>
          </div>
        )}

        <div
          className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-3xl p-8 sm:p-12 animate-[fadeInUp_0.5s_ease-out_forwards]"
          style={{ animationFillMode: 'forwards' }}
        >
          {status === 'success' ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-6">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Received</h3>
              <p className="text-slate-600">Your form is successfully submitted and you will get a reply within 24 hours.</p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-8 text-slate-900 font-bold hover:text-slate-700 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {status === 'error' && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium text-center">
                  {errorMessage}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-slate-900">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    onChange={(e) => setErrors({ ...errors, name: '' })}
                    className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-slate-300'} rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors placeholder:text-slate-400 backdrop-blur-sm`}
                    placeholder="Jane Doe"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs font-medium mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-slate-900">Work Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    onChange={(e) => setErrors({ ...errors, email: '' })}
                    className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-slate-300'} rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors placeholder:text-slate-400 backdrop-blur-sm`}
                    placeholder="jane@company.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs font-medium mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-bold text-slate-900">Organization / Company</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors placeholder:text-slate-400 backdrop-blur-sm"
                  placeholder="AI Robotics Inc."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="serviceType" className="text-sm font-bold text-slate-900">Service Type <span className="text-red-500">*</span></label>
                <select
                  id="serviceType"
                  name="serviceType"
                  defaultValue=""
                  onChange={(e) => setErrors({ ...errors, serviceType: '' })}
                  className={`w-full bg-white border ${errors.serviceType ? 'border-red-500' : 'border-slate-300'} rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors backdrop-blur-sm`}
                >
                  <option value="" disabled>Select a service</option>
                  <option value="AI Data Services">AI Data Services — I need data collection or annotation</option>
                  <option value="Partnership Inquiry">Partnership Inquiry — I want to explore a partnership</option>
                  <option value="General Inquiry">General Inquiry — Something else</option>
                </select>
                {errors.serviceType && (
                  <p className="text-red-500 text-xs font-medium mt-1">{errors.serviceType}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-slate-900">Message <span className="text-red-500">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  onChange={(e) => setErrors({ ...errors, message: '' })}
                  className={`w-full bg-white border ${errors.message ? 'border-red-500' : 'border-slate-300'} rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors resize-none placeholder:text-slate-400 backdrop-blur-sm`}
                  placeholder="Briefly describe your requirements..."
                />
                {errors.message && (
                  <p className="text-red-500 text-xs font-medium mt-1">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? 'Submitting...' : 'Send Message'}
                {status !== 'submitting' && <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
