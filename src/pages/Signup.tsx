import React, { useState, useEffect } from 'react';
import { Briefcase, Globe, CheckCircle2, UserPlus, MonitorPlay, Video, Wallet, MessageSquare } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import SEO from '../components/SEO';
import CountrySelect from '../components/CountrySelect';
import { COUNTRIES } from '../utils/countries';

export default function Signup() {
  const params = new URLSearchParams(window.location.search);
  const prefilledProject = params.get('project');

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', city: '', country: '',
    nativeLanguage: '', additionalLanguage: '', phone: '', experience: '',
    howFoundUs: '',
    projectsInterestedIn: prefilledProject ? [prefilledProject] : [] as string[]
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending_otp' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token') || !!localStorage.getItem('adminToken') || !!localStorage.getItem('pmToken'));

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('token') || !!localStorage.getItem('adminToken') || !!localStorage.getItem('pmToken'));
    };
    window.addEventListener('authChange', checkAuth);
    window.addEventListener('storage', checkAuth);

    fetch('https://api.country.is')
      .then(res => res.json())
      .then(data => {
        if (data.country) {
          setFormData(prev => ({ ...prev, country: data.country }));
        }
      })
      .catch(() => {});

    // Check for referral code
    const refCode = params.get('ref');
    if (refCode) {
      setFormData(prev => ({ ...prev, referredByCode: refCode }));
    }

    return () => {
      window.removeEventListener('authChange', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  if (isLoggedIn) {
    if (localStorage.getItem('adminToken')) return <Navigate to="/admin" replace />;
    if (localStorage.getItem('pmToken')) return <Navigate to="/project-manager" replace />;
    return <Navigate to="/profile" replace />;
  }

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const selectedDialCode = COUNTRIES.find(c => c.code === formData.country)?.dial_code || '';
    const fullPhone = `${selectedDialCode} ${formData.phone.trim()}`;

    const phoneRegex = /^\+\d{1,4}[\s-]?(?:\d[\s-]?){9}\d$/;
    if (!phoneRegex.test(fullPhone)) {
      setErrorMessage('Phone number is invalid. Please enter exactly 10 digits.');
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
      const { referredByCode, ...submitData } = formData;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...submitData, phone: fullPhone, otp, referredByCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      // Auto-login
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const loginData = await loginRes.json();
      if (loginRes.ok && loginData.token) {
        localStorage.setItem('token', loginData.token);
        window.dispatchEvent(new Event('authChange'));
        window.location.href = '/profile';
        return;
      }

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
    <>
      <SEO 
        title="Become a Contributor | Vision Capture"
        description="Sign up to become a Vision Capture contributor and start earning by collecting POV and egocentric video data."
        canonicalUrl="https://visioncapture.in/signup"
      />
      <div className="pt-24 pb-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Create your Account</h1>
          <p className="text-slate-600">Join Vision Capture to start contributing and earning.</p>
        </div>

      {isLoggedIn ? (
        <div className="max-w-4xl mx-auto px-4 scroll-mt-28 mb-24 text-center">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-10 sm:p-16 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Message us for project onboarding</h2>
            <p className="text-slate-600 mb-8 max-w-lg">
              You already have an active account. Head over to your profile to chat with our team and start your onboarding process.
            </p>
            <a href={localStorage.getItem('adminToken') ? "/admin" : "/profile"} className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors inline-block shadow-lg shadow-slate-900/20">
              Open Chat Box
            </a>
          </div>
        </div>
      ) : (
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
                <CountrySelect 
                  value={formData.country}
                  onChange={(val) => setFormData(prev => ({ ...prev, country: val }))}
                />
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
                <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition-colors">
                  <div className="px-4 py-3 bg-slate-100 border-r border-slate-200 text-slate-600 font-medium flex items-center shrink-0">
                    {COUNTRIES.find(c => c.code === formData.country)?.dial_code || '+'}
                  </div>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="234 567 8900" 
                    className="w-full px-4 py-3 bg-transparent outline-none" 
                  />
                </div>
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
                {['Egocentric Video', 'Data Annotation', 'Data Collection', 'Field work Operator', 'Transcription', 'Audio Recording', 'Survey', 'Image Collection', prefilledProject].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).map(proj => (
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
      )}
    </div>
    </>
  );
}
