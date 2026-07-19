import React, { useState } from 'react';
import { Briefcase, Globe, CheckCircle2, UserPlus, MonitorPlay, Video, Wallet } from 'lucide-react';

export default function Contributors() {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', city: '', country: '',
    nativeLanguage: '', additionalLanguage: '', phone: '', experience: '',
    howFoundUs: '',
    projectsInterestedIn: [] as string[]
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending_otp' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProjectToggle = (project: string) => {
    setFormData(prev => ({
      ...prev,
      projectsInterestedIn: prev.projectsInterestedIn.includes(project)
        ? prev.projectsInterestedIn.filter(p => p !== project)
        : [...prev.projectsInterestedIn, project]
    }));
  };

  const sendOtp = async () => {
    if (!formData.email) {
      setErrorMessage('Please enter a valid email first.');
      return;
    }
    setStatus('sending_otp');
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true);
      setStatus('idle');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields = [];
    if (!formData.fullName) missingFields.push('Full Name');
    if (!formData.email) missingFields.push('Email');
    if (!formData.city) missingFields.push('City');
    if (!formData.country) missingFields.push('Country');
    if (!formData.nativeLanguage) missingFields.push('Native Language');
    if (!formData.phone) missingFields.push('Phone');
    if (!formData.experience) missingFields.push('Experience');
    if (!formData.howFoundUs) missingFields.push('How did you find us?');
    if (formData.projectsInterestedIn.length === 0) missingFields.push('Projects Interested In');

    if (missingFields.length > 0) {
      setErrorMessage(`Please fill in the following missing fields: ${missingFields.join(', ')}`);
      setStatus('error');
      document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!otpSent) {
      setErrorMessage('Please send the OTP to your email before completing registration.');
      setStatus('error');
      document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!otp) {
      setErrorMessage('Please enter the 6-digit OTP.');
      setStatus('error');
      return;
    }

    if (!formData.password) {
      setErrorMessage('Please create a password.');
      setStatus('error');
      return;
    }

    if (!agreed) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  if (status === 'success') {
    return (
      <div className="py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Registration Successful!</h1>
        <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
          Welcome to the contributor team. You can now log in to your profile.
        </p>
        <a href="/profile" className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
          Login
        </a>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12">
      {/* Process Flow Banner */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative bg-slate-900">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0 bg-slate-900">
            <img src="/ego.jpeg" alt="Process Flow Background" className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 to-slate-900/80" />
          </div>

          {/* Foreground Process Flow */}
          <div className="relative z-10 py-16 px-4 sm:px-8">
            <h2 className="text-3xl font-display font-bold text-white text-center mb-12 tracking-wide">How it Works</h2>
            <div className="flex flex-col md:flex-row items-center justify-between relative max-w-5xl mx-auto">
              {/* Desktop connecting line */}
              <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-slate-700/80 z-0" />

              {[
                { icon: <UserPlus className="w-6 h-6" />, title: "Apply to Earn", scrollId: "registration-form" },
                { icon: <MonitorPlay className="w-6 h-6" />, title: "Onboarding" },
                { icon: <Video className="w-6 h-6" />, title: "Recording Video" },
                { icon: <Wallet className="w-6 h-6" />, title: "Payment" }
              ].map((step, i) => (
                <React.Fragment key={i}>
                  <div
                    className={`relative z-10 flex flex-col items-center group w-full md:w-1/4 ${step.scrollId ? 'cursor-pointer' : ''}`}
                    onClick={() => {
                      if (step.scrollId) {
                        document.getElementById(step.scrollId)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-800/80 backdrop-blur-sm border-2 border-slate-600 shadow-xl flex items-center justify-center text-slate-300 group-hover:border-blue-400 group-hover:text-blue-400 group-hover:bg-slate-900 group-hover:scale-110 transition-all duration-300 mb-4 relative">
                      {step.icon}
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 text-center px-2 group-hover:text-white transition-colors">{step.title}</h4>
                  </div>
                  {i < 3 && (
                    <div className="md:hidden w-0.5 h-8 bg-slate-700/80 my-3" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mb-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <Briefcase className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">Hiring: AI Video Contributors (Remote)</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-12 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Video className="w-5 h-5 text-slate-400" /> The Job
              </h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Record POV videos of everyday household, commercial, or industrial tasks to train AI and robotics.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-slate-400" /> Eligible Countries
              </h3>
              <p className="text-slate-600 leading-relaxed">
                India, USA, UK, Canada, Australia, Germany, France, Brazil, Japan, South Korea, Mexico, and more.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-slate-400" /> Quick Requirements
              </h3>
              <ul className="space-y-4">
                {[
                  'Recent smartphone (iPhone 11+, Pixel 6+, or Galaxy S21+).',
                  'Smartphone head strap.',
                  'Stable internet & well-lit workspace.',
                  'No experience required.',
                  'Record to earn. Apply today.'
                ].map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div id="registration-form" className="max-w-4xl mx-auto px-4 scroll-mt-28">
        <form noValidate onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-10 space-y-6">
          {status === 'error' && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium text-center">
              {errorMessage}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Full Name *</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Email *</label>
              <div className="flex gap-2">
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} disabled={otpSent} placeholder="Enter your email address" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 disabled:opacity-50" />
                {!otpSent && (
                  <button type="button" onClick={sendOtp} disabled={status === 'sending_otp'} className="px-4 py-3 bg-slate-900 text-white rounded-xl font-semibold whitespace-nowrap text-sm disabled:opacity-70">
                    {status === 'sending_otp' ? 'Sending...' : 'Send OTP'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {otpSent && (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Enter OTP *</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="6-digit OTP" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                <p className="text-xs text-slate-500 mt-1">Please check your spam or junk folder also for otp.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Password *</label>
                <input type="password" name="password" required value={formData.password} onChange={handleInputChange} placeholder="Create a strong password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">City *</label>
              <input type="text" name="city" required value={formData.city} onChange={handleInputChange} placeholder="e.g. New York" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Country *</label>
              <input type="text" name="country" required value={formData.country} onChange={handleInputChange} placeholder="e.g. USA" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Native Language *</label>
              <input type="text" name="nativeLanguage" required value={formData.nativeLanguage} onChange={handleInputChange} placeholder="e.g. English" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Additional Language</label>
              <input type="text" name="additionalLanguage" value={formData.additionalLanguage} onChange={handleInputChange} placeholder="e.g. Spanish (Optional)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Phone *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="+91 234 567 8900" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Experience *</label>
              <select name="experience" required value={formData.experience} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <option value="">Select experience</option>
                <option value="No experience">No experience</option>
                <option value="Less than 1 year">Less than 1 year</option>
                <option value="1-2 years">1-2 years</option>
                <option value="3-5 years">3-5 years</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">How did you find us? *</label>
            <select name="howFoundUs" required value={formData.howFoundUs} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <option value="">Select an option</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Google search">Google search</option>
              <option value="Reddit">Reddit</option>
              <option value="Youtube">Youtube</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900">Projects Interested In *</label>
            <div className="flex flex-wrap gap-3">
              {['Egocentric Video', 'Data Annotation', 'Data Collection', 'Field work Operator', 'Transcription', 'Audio Recording', 'Survey', 'Image Collection'].map(proj => (
                <button
                  key={proj}
                  type="button"
                  onClick={() => handleProjectToggle(proj)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${formData.projectsInterestedIn.includes(proj) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                >
                  {proj}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="terms" className="text-sm text-slate-700">
              I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold py-4 rounded-xl transition-colors disabled:opacity-50 mt-4"
          >
            {status === 'submitting' ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
