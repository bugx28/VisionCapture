import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, Link } from 'react-router-dom';
import { Briefcase, CreditCard, Users, CheckCircle, Clock, Search, ChevronRight, Share2, Copy, MessageSquare, Bell, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import ProjectChat from '../components/ProjectChat';
import FormattedText from '../components/FormattedText';
import Modal, { ModalProps } from '../components/Modal';
import CountrySelect from '../components/CountrySelect';
import { COUNTRIES } from '../utils/countries';

const getDaysAgo = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
};

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.1,46,96,53,91.08,65.69,84.69,65.69Z"/>
  </svg>
);

const renderFormattedText = (text: string) => {
  if (!text) return null;
  // Match bold (**text**), italic (*text*), or URLs
  const regex = /(\*\*.*?\*\*|\*.*?\*|https?:\/\/[^\s]+)/g;
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {part}
        </a>
      );
    }
    return part;
  });
};

export default function Profile() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const location = useLocation();
  const getInitialTab = () => {
    if (location.hash) {
      const hashTab = location.hash.replace('#', '');
      if (['overview', 'available', 'my_projects', 'payments', 'messages', 'referrals', 'profile', 'notifications'].includes(hashTab)) {
        return hashTab as any;
      }
    }
    if (location.pathname === '/profile') return 'available';
    if (location.pathname === '/contributors') return 'available';
    return 'overview';
  };
  const [activeTab, setActiveTab] = useState<'overview' | 'available' | 'my_projects' | 'payments' | 'messages' | 'referrals' | 'profile' | 'notifications'>(getInitialTab());
  const [expandedAvailableProject, setExpandedAvailableProject] = useState<string | null>(null);
  const [consentProject, setConsentProject] = useState<any>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [egoAppStep, setEgoAppStep] = useState<1 | 2 | 3>(1);
  const [egoContributorType, setEgoContributorType] = useState<'individual' | 'vendor' | 'connections' | null>(null);
  const [egoFormData, setEgoFormData] = useState<any>({});
  const [modalConfig, setModalConfig] = useState<ModalProps>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
    variant: 'info',
    onClose: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
  });

  const showModal = (title: string, message: string, variant: 'success' | 'error' | 'info' = 'info', children?: React.ReactNode) => {
    setModalConfig(prev => ({
      ...prev,
      isOpen: true,
      title,
      message,
      variant,
      type: 'alert',
      children
    }));
  };

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname, location.hash]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    if (!token) {
      if (localStorage.getItem('adminToken')) {
        window.location.href = '/admin';
      } else if (localStorage.getItem('pmToken')) {
        window.location.href = '/project-manager';
      }
    }
  }, [token]);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [viewState, setViewState] = useState<'login' | 'forgotPassword'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isResetLoading) return;
    setResetError('');
    setIsResetLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, type: 'reset' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isResetLoading) return;
    setResetError('');
    setIsResetLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setResetSuccess('Password reset successfully. You can now log in.');
      setTimeout(() => {
        setViewState('login');
        setOtpSent(false);
        setResetEmail('');
        setResetOtp('');
        setNewPassword('');
        setResetSuccess('');
      }, 3000);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setIsResetLoading(false);
    }
  };

  // Form State
  const [upiId, setUpiId] = useState('');
  
  const [profileFormData, setProfileFormData] = useState<any>({});
  const [profileOtp, setProfileOtp] = useState('');
  const [isProfileOtpSent, setIsProfileOtpSent] = useState(false);
  const [isSendingProfileOtp, setIsSendingProfileOtp] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });

  const [selectedChatProject, setSelectedChatProject] = useState<any>(null);

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['profile', token],
    queryFn: async () => {
      const res = await fetch('/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) { handleLogout(); throw new Error('Failed to fetch profile'); }
      const data = await res.json();
      return data.user;
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (user) {
      setUpiId(user.upiId || '');
      let parsedPhone = user.phone || '';
      const dialCode = COUNTRIES.find(c => c.code === user.country)?.dial_code || '';
      if (dialCode && parsedPhone.startsWith(dialCode + ' ')) {
        parsedPhone = parsedPhone.slice(dialCode.length + 1);
      } else if (dialCode && parsedPhone.startsWith(dialCode)) {
        parsedPhone = parsedPhone.slice(dialCode.length);
      }

      setProfileFormData({
        fullName: user.fullName || '',
        city: user.city || '',
        country: user.country || '',
        nativeLanguage: user.nativeLanguage || '',
        additionalLanguage: user.additionalLanguage || '',
        phone: parsedPhone,
        experience: user.experience || '',
        howFoundUs: user.howFoundUs || '',
        upiId: user.upiId || ''
      });
    }
  }, [user]);

  const { data: availableProjects } = useQuery({
    queryKey: ['available-projects'],
    queryFn: async () => {
      const res = await fetch('/api/public/projects/contributor');
      const data = await res.json();
      return data.projects || [];
    },
    enabled: !!token,
  });

  const { data: myApplications } = useQuery({
    queryKey: ['my-applications', token],
    queryFn: async () => {
      const res = await fetch('/api/applications/user', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.applications || [];
    },
    enabled: !!token,
  });

  const { data: mySubmissions } = useQuery({
    queryKey: ['my-submissions', token],
    queryFn: async () => {
      const res = await fetch('/api/submissions/user', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.submissions || [];
    },
    enabled: !!token,
  });

  const { data: myPayments } = useQuery({
    queryKey: ['my-payments', token],
    queryFn: async () => {
      const res = await fetch('/api/payments/user', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.payments || [];
    },
    enabled: !!token,
  });
  const { data: myNotifications } = useQuery({
    queryKey: ['my-notifications', token],
    queryFn: async () => {
      const res = await fetch('/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.notifications || [];
    },
    enabled: !!token,
  });

  const { data: unreadMessagesData } = useQuery({
    queryKey: ['unread-messages', token],
    queryFn: async () => {
      const res = await fetch('/api/user/unread-messages', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data;
    },
    enabled: !!token,
    refetchInterval: 10000, // Poll every 10s for new messages
  });

  const markNotificationAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
    } catch (err) {
      console.error(err);
    }
  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (data.user.role !== 'user') throw new Error('Access denied. This page is for contributors only.');
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        window.dispatchEvent(new Event('authChange'));
      }
      setToken(data.token);
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setEmail('');
    setPassword('');
    queryClient.clear();
    window.dispatchEvent(new Event('authChange'));
    window.location.reload();
  };

  const [profileFormDataToSubmit, setProfileFormDataToSubmit] = useState<any>(null);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { otp: string, profileData: any }) => {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update');
      return json;
    },
    onSuccess: () => {
      showModal('Success', 'Profile updated successfully', 'success');
      setIsProfileOtpSent(false);
      setProfileOtp('');
      setProfileFormDataToSubmit(null);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (err: any) => {
      showModal('Error', err.message, 'error');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to change password');
      return json;
    },
    onSuccess: () => {
      showModal('Success', 'Password updated successfully', 'success');
      setPasswordForm({ oldPassword: '', newPassword: '' });
    },
    onError: (err: any) => {
      showModal('Error', err.message, 'error');
    }
  });

  const handleProfileSaveInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileFormData.country) {
      showModal('Error', 'Please select a country', 'error');
      return;
    }
    
    const selectedDialCode = COUNTRIES.find(c => c.code === profileFormData.country)?.dial_code || '';
    const fullPhone = `${selectedDialCode} ${profileFormData.phone.trim()}`;
    const phoneRegex = /^\+\d{1,4}[\s-]?(?:\d[\s-]?){9}\d$/;
    if (!phoneRegex.test(fullPhone)) {
      showModal('Error', 'Phone number is invalid. Please enter exactly 10 digits.', 'error');
      return;
    }

    setProfileFormDataToSubmit({ ...profileFormData, phone: fullPhone });
    setIsSendingProfileOtp(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, type: 'profile-update' })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send OTP');
      setIsProfileOtpSent(true);
    } catch (err: any) {
      showModal('Error', err.message, 'error');
    } finally {
      setIsSendingProfileOtp(false);
    }
  };

  const applyMutation = useMutation({
    mutationFn: async ({ projectId, agreedToTerms, formData }: { projectId: string, agreedToTerms: boolean, formData?: any }) => {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, agreedToTerms, formData })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to apply');
    },
    onSuccess: () => {
      showModal('Success', 'Application submitted successfully!', 'success');
      setConsentProject(null);
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      window.location.hash = 'my_projects';
    },
    onError: (error: any) => showModal('Error', error.message, 'error')
  });

  const submitWorkMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to submit work');
    },
    onSuccess: () => {
      showModal('Success', 'Work submitted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
    }
  });

  if (!token) {
    return (
      <div className="py-24 max-w-md mx-auto px-4 min-h-[70vh] flex flex-col justify-center">
        <SEO title="Login | Vision Capture" />
        {viewState === 'login' ? (
          <>
            <h1 className="text-3xl font-bold text-slate-900 text-center mb-8">Contributor Login</h1>
            <form onSubmit={handleLogin} className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 space-y-6">
              {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium">{loginError}</div>}
              {resetSuccess && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm text-center font-medium">{resetSuccess}</div>}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Email</label>
                <input type="email" required placeholder="Enter your email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-900">Password</label>
                  <button type="button" onClick={() => setViewState('forgotPassword')} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</button>
                </div>
                <input type="password" required placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">Login</button>
              
              <div className="text-center pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-600">Don't have an account? </span>
                <Link to="/signup" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Create an Account</Link>
              </div>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-slate-900 text-center mb-8">Reset Password</h1>
            <form onSubmit={otpSent ? handleResetPassword : handleSendResetOtp} className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 space-y-6">
              {resetError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium">{resetError}</div>}
              {resetSuccess && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm text-center font-medium">{resetSuccess}</div>}
              
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Email Address</label>
                    <input type="email" required placeholder="Enter your registered email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>
                  <button type="submit" disabled={isResetLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70">
                    {isResetLoading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Reset Code (OTP)</label>
                    <input type="text" required placeholder="Enter the 6-digit code" value={resetOtp} onChange={e => setResetOtp(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 tracking-widest text-center font-mono" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">New Password</label>
                    <input type="password" required placeholder="Enter your new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" minLength={6} />
                  </div>
                  <button type="submit" disabled={isResetLoading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70">
                    {isResetLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </>
              )}
              
              <div className="text-center pt-4 border-t border-slate-100">
                <button type="button" onClick={() => { setViewState('login'); setOtpSent(false); setResetError(''); setResetSuccess(''); }} className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Back to Login</button>
              </div>
            </form>
          </>
        )}
      </div>
    );
  }

  if (isUserLoading) return <div className="py-24 text-center">Loading...</div>;

  const totalEarnings = myPayments?.filter((p: any) => p?.status === 'Paid')?.reduce((acc: number, curr: any) => acc + (curr?.amount || 0), 0) || 0;
  const pendingEarnings = myPayments?.filter((p: any) => p?.status !== 'Paid')?.reduce((acc: number, curr: any) => acc + (curr?.amount || 0), 0) || 0;

  const completedProjectIds = new Set(
    (mySubmissions || [])
      .filter((s: any) => s?.status === 'Completed')
      .map((s: any) => s?.projectId?._id || s?.projectId)
  );
  
  const activeProjectsCount = Math.max(0, (myApplications?.length || 0) - completedProjectIds.size);
  const completedProjectsCount = completedProjectIds.size;

  const getApplicationStatus = (projectId: string) => {
    return myApplications?.find((a: any) => a?.projectId?._id === projectId)?.status;
  };

  const getProjectSubmission = (projectId: string) => {
    return mySubmissions?.find((s: any) => s?.projectId?._id === projectId || s?.projectId === projectId);
  };

  const renderProjectAction = (project: any, status: string) => {
    if (status === 'Approved') {
      const submission = getProjectSubmission(project._id);
      const subStatus = submission?.status;
      let btnText = 'Submit Work';
      let btnColor = 'bg-green-600 hover:bg-green-700 shadow-green-600/30';
      if (project.isEgocentric && (!subStatus || subStatus === 'Submit Work')) {
        btnText = 'Recording Instructions';
        btnColor = 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30';
      } else if (subStatus === 'Rework Required') {
        btnText = 'Rework Required';
        btnColor = 'bg-red-600 hover:bg-red-700 shadow-red-600/30';
      } else if (subStatus === 'Completed') {
        btnText = 'Completed';
        btnColor = 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30';
      } else if (subStatus === 'Submitted') {
        btnText = 'Submitted';
        btnColor = 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30';
      } else if (subStatus === 'Under Review') {
        btnText = 'Under Review';
        btnColor = 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30';
      }
      return (
        <button onClick={() => { 
          if (project.isEgocentric && btnText === 'Recording Instructions') {
            showModal(
              'To start recording and earning, you will need a unique access code.', 
              'Please join the official Project Telegram Group to receive your instructions and get your access code directly from the Project Manager.', 
              'info',
              (
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  {project.telegramLink && (
                    <a href={project.telegramLink} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-4 py-3 bg-[#0088cc] text-white font-bold rounded-xl hover:bg-[#0077b3] transition-colors">
                      Join Telegram Group
                    </a>
                  )}
                  <button onClick={() => { 
                    const app = myApplications?.find((a: any) => a?.projectId?._id === project._id);
                    setSelectedChatProject(app || null);
                    setModalConfig(prev => ({ ...prev, isOpen: false })); 
                    setActiveTab('messages'); 
                    window.location.hash = 'messages'; 
                  }} className="flex-1 px-4 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                    Message Project Manager
                  </button>
                </div>
              )
            );
          } else {
            setActiveTab('my_projects'); window.location.hash = 'my_projects'; 
          }
        }} className={`px-6 py-3 text-white font-bold rounded-xl transition-colors w-full sm:w-auto shadow-md ${btnColor}`}>
          {btnText}
        </button>
      );
    } else if (status) {
      return <span className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">{status}</span>;
    } else {
      return (
        <button onClick={() => {
          if (project.termsAndConditions) {
            setConsentProject(project);
            setAgreedToTerms(false);
          } else {
            applyMutation.mutate({ projectId: project._id, agreedToTerms: false });
          }
        }} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors w-full sm:w-auto shadow-md shadow-blue-600/30">
          Apply Now
        </button>
      );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-12">
      <SEO title="Profile | Vision Capture" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.fullName}</h1>
            <p className="text-slate-600">Manage your projects, submissions, and payments here.</p>
          </div>
          <button onClick={handleLogout} className="px-6 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 font-bold transition-colors">Logout</button>
        </div>

        {/* Sidebar + Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
            {[
              { id: 'overview', icon: Search, label: 'Overview' },
              { id: 'available', icon: Briefcase, label: 'Available Projects' },
              { id: 'my_projects', icon: CheckCircle, label: 'Project submissions' },
              { id: 'payments', icon: CreditCard, label: 'Payments' },
              { id: 'messages', icon: MessageSquare, label: 'Messages' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'referrals', icon: Users, label: 'Referrals' },
              { id: 'profile', icon: Share2, label: 'Profile Settings' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { 
                  setActiveTab(tab.id as any); 
                  window.location.hash = tab.id; 
                  if (tab.id === 'messages') setSelectedChatProject(null);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left relative ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                <tab.icon className="w-5 h-5 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.id === 'messages' && unreadMessagesData?.hasUnread && (
                  <span className="absolute top-3 right-4 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm shadow-red-500/50"></span>
                )}
                {tab.id === 'notifications' && myNotifications?.some((n: any) => !n.isRead) && (
                  <span className="absolute top-3 right-4 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm shadow-red-500/50"></span>
                )}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Shine Animation Keyframes */}
            <style>{`
              @keyframes shine {
                0% { transform: translateX(-200%) skewX(-15deg); }
                20%, 100% { transform: translateX(300%) skewX(-15deg); }
              }
            `}</style>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-bold text-slate-500 mb-1">Total Earnings</p>
                    <p className="text-3xl font-black text-green-600">₹{totalEarnings}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-bold text-slate-500 mb-1">Pending Payments</p>
                    <p className="text-3xl font-black text-amber-500">₹{pendingEarnings}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-bold text-slate-500 mb-1">Active Projects</p>
                    <p className="text-3xl font-black text-blue-600">{activeProjectsCount}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-sm font-bold text-slate-500 mb-1">Completed Projects</p>
                    <p className="text-3xl font-black text-purple-600">{completedProjectsCount}</p>
                  </div>
                </div>

                <div className="pt-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Available Projects</h2>

                  {/* Hardcoded Egocentric Project */}
                  <div className="bg-slate-900 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row gap-6 mb-8 border border-slate-800 relative overflow-hidden group ring-1 ring-white/10">
                    {/* Shine Animation Layer */}
                    <div className="absolute inset-0 z-10 pointer-events-none opacity-50 mix-blend-overlay overflow-hidden rounded-3xl">
                      <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-80 animate-[shine_4s_ease-in-out_infinite]" />
                    </div>
                    
                    <div className="w-full sm:w-56 h-40 sm:h-auto rounded-2xl overflow-hidden shrink-0 relative z-20">
                      <img src="/ego.webp" alt="Egocentric Data" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-lg border border-blue-400/30">Featured</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center relative z-20 py-2">
                      <div className="flex items-start justify-between mb-3 gap-4">
                        <h3 className="text-2xl font-display font-bold text-white">Egocentric Video Contributors ( Remote)</h3>
                        <span className="font-black text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-xl text-sm shrink-0 mt-1">High Pay</span>
                      </div>
                      <p className="text-slate-300 text-sm mb-5 leading-relaxed">Record POV videos of everyday household, commercial, or industrial tasks to train AI and robotics.</p>
                      <div className="flex flex-wrap gap-5 text-sm font-medium text-slate-300 mb-2">
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Smartphone & Head strap</span>
                        <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> No experience required</span>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex items-center justify-center sm:items-start pt-2 relative z-20">
                      {(() => {
                        const egoProjectObj = availableProjects?.find((p: any) => p.isEgocentric);
                        if (egoProjectObj) {
                          return renderProjectAction(egoProjectObj, getApplicationStatus(egoProjectObj._id));
                        }
                        return <button disabled className="px-6 py-3 bg-slate-400 text-white font-bold rounded-xl">Loading...</button>;
                      })()}
                    </div>
                  </div>
                  {availableProjects?.map((project: any) => {
                    if (!project || project.isEgocentric) return null;
                    const status = getApplicationStatus(project._id);
                    return (
                      <div key={project._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6 mb-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-bold text-slate-900">{project.title}</h3>
                              <span className="font-black text-green-600 bg-green-50 px-3 py-1 rounded-full">{project.payRate}</span>
                            </div>
                            <p className={`text-slate-600 text-sm mb-4 ${expandedAvailableProject !== project._id ? 'line-clamp-2' : ''}`}>
                              <FormattedText text={project.shortDescription} />
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 mb-4">
                              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {project.estimatedDuration}</span>
                              <span>Category: {project.category}</span>
                              {project.deadline && (
                                <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                              )}
                              {project.telegramLink && (
                                <a href={project.telegramLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#0088cc] hover:underline">
                                  <MessageSquare className="w-4 h-4" /> Live Support & Instructions
                                </a>
                              )}
                            </div>
                            <button
                              onClick={() => setExpandedAvailableProject(expandedAvailableProject === project._id ? null : project._id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1"
                            >
                              {expandedAvailableProject === project._id ? 'Hide Details' : 'View Details'}
                            </button>
                          </div>
                          <div className="shrink-0 flex items-center justify-center sm:items-start pt-2">
                            {renderProjectAction(project, status)}
                          </div>
                        </div>

                        {expandedAvailableProject === project._id && (
                          <div className="pt-6 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            {project.projectDetails && (
                              <div>
                                <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 text-sm">
                                  Project Details
                                </h4>
                                <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{project.projectDetails}</p>
                              </div>
                            )}
                            {project.requirements && (
                              <div>
                                <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 text-sm">
                                  Requirements
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed">{project.requirements}</p>
                              </div>
                            )}
                            {project.devicesRequired && (
                              <div>
                                <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 text-sm">
                                  Devices Needed
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed">{project.devicesRequired}</p>
                              </div>
                            )}
                            {project.eligibility && (
                              <div>
                                <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 text-sm">
                                  Eligibility
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed">{project.eligibility}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* AVAILABLE PROJECTS TAB */}
            {activeTab === 'available' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Available Projects</h2>

                {/* Hardcoded Egocentric Project */}
                <div className="bg-slate-900 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row gap-6 mb-8 border border-slate-800 relative overflow-hidden group ring-1 ring-white/10">
                  {/* Shine Animation Layer */}
                  <div className="absolute inset-0 z-10 pointer-events-none opacity-50 mix-blend-overlay overflow-hidden rounded-3xl">
                    <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-80 animate-[shine_4s_ease-in-out_infinite]" />
                  </div>
                  
                  <div className="w-full sm:w-56 h-40 sm:h-auto rounded-2xl overflow-hidden shrink-0 relative z-20">
                    <img src="/ego.webp" alt="Egocentric Data" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-lg border border-blue-400/30">Featured</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center relative z-20 py-2">
                    <div className="flex items-start justify-between mb-3 gap-4">
                      <h3 className="text-2xl font-display font-bold text-white">Egocentric Video Contributors ( Remote)</h3>
                      <span className="font-black text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1.5 rounded-xl text-sm shrink-0 mt-1">High Pay</span>
                    </div>
                    <p className="text-slate-300 text-sm mb-5 leading-relaxed">Record POV videos of everyday household, commercial, or industrial tasks to train AI and robotics.</p>
                    <div className="flex flex-wrap gap-5 text-sm font-medium text-slate-300 mb-2">
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Smartphone & Head strap</span>
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> No experience required</span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center justify-center sm:items-start pt-2 relative z-20">
                    {(() => {
                      const egoProjectObj = availableProjects?.find((p: any) => p.isEgocentric);
                      if (egoProjectObj) {
                        return renderProjectAction(egoProjectObj, getApplicationStatus(egoProjectObj._id));
                      }
                      return <button disabled className="px-6 py-3 bg-slate-400 text-white font-bold rounded-xl">Loading...</button>;
                    })()}
                  </div>
                </div>

                {availableProjects?.map((project: any) => {
                  if (!project || project.isEgocentric) return null;
                  const status = getApplicationStatus(project._id);
                  return (
                    <div key={project._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-slate-900">{project.title}</h3>
                            <span className="font-black text-green-600 bg-green-50 px-3 py-1 rounded-full">{project.payRate}</span>
                          </div>
                          <p className={`text-slate-600 text-sm mb-4 ${expandedAvailableProject !== project._id ? 'line-clamp-2' : ''}`}>
                            <FormattedText text={project.shortDescription} />
                          </p>
                          <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 mb-4">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {project.estimatedDuration}</span>
                            <span>Category: {project.category}</span>
                            {project.deadline && (
                              <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                            )}
                            {project.telegramLink && (
                              <a href={project.telegramLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#0088cc] hover:underline">
                                <MessageSquare className="w-4 h-4" /> Live Support & Instructions
                              </a>
                            )}
                          </div>
                          <button
                            onClick={() => setExpandedAvailableProject(expandedAvailableProject === project._id ? null : project._id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1"
                          >
                            {expandedAvailableProject === project._id ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>
                        <div className="shrink-0 flex items-center justify-center sm:items-start pt-2">
                          {renderProjectAction(project, status)}
                        </div>
                      </div>

                      {expandedAvailableProject === project._id && (
                        <div className="pt-6 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                          {project.projectDetails && (
                            <div>
                              <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 text-sm">
                                Project Details
                              </h4>
                              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{project.projectDetails}</p>
                            </div>
                          )}
                          {project.requirements && (
                            <div>
                              <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 text-sm">
                                Requirements
                              </h4>
                              <p className="text-slate-600 text-sm leading-relaxed">{project.requirements}</p>
                            </div>
                          )}
                          {project.devicesRequired && (
                            <div>
                              <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 text-sm">
                                Devices Needed
                              </h4>
                              <p className="text-slate-600 text-sm leading-relaxed">{project.devicesRequired}</p>
                            </div>
                          )}
                          {project.eligibility && (
                            <div>
                              <h4 className="text-slate-900 font-bold mb-2 flex items-center gap-2 text-sm">
                                Eligibility
                              </h4>
                              <p className="text-slate-600 text-sm leading-relaxed">{project.eligibility}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* MY PROJECTS TAB */}
            {activeTab === 'my_projects' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">My Projects</h2>
                {myApplications?.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                    <p className="text-slate-500">You haven't applied to any projects yet.</p>
                  </div>
                ) : (
                  myApplications?.filter?.((a: any) => a?.projectId)?.map?.((app: any) => {
                    if (!app || !app.projectId) return null;
                    const submission = getProjectSubmission(app.projectId._id);
                    return (
                      <div key={app._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                        <div className="p-6 border-b border-slate-100">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-slate-900">{app.projectId.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              Application: {app.status}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 bg-slate-50">
                          {app.projectId.projectDetails && (
                            <div className="mb-6">
                              <button
                                onClick={() => setExpandedAvailableProject(expandedAvailableProject === `inst_${app._id}` ? null : `inst_${app._id}`)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1 border border-blue-200 bg-white px-4 py-2 rounded-xl"
                              >
                                {expandedAvailableProject === `inst_${app._id}` ? 'Hide Project Instructions' : 'View Project Instructions'}
                              </button>
                                {expandedAvailableProject === `inst_${app._id}` && (
                                  <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl">
                                    <h4 className="font-bold text-slate-900 mb-2">Project Guidelines</h4>
                                    <p className="text-slate-600 whitespace-pre-wrap text-sm">{renderFormattedText(app.projectId.projectInstructions || app.projectId.projectDetails)}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {app.projectId.telegramLink && (
                              <div className="mb-6">
                                <a href={app.projectId.telegramLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0088cc] text-white font-bold rounded-xl hover:bg-[#0077b3] transition-colors shadow-sm">
                                  <MessageSquare className="w-4 h-4" /> Live Support & Instructions
                                </a>
                              </div>
                            )}

                          {app.status === 'Approved' ? (
                            <>
                              {app.projectId.isEgocentric ? (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                  <button onClick={() => showModal(
                                    'To start recording and earning, you will need a unique access code.', 
                                    'Please join the official Project Telegram Group to receive your instructions and get your access code directly from the Project Manager.', 
                                    'info',
                                    (
                                      <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                        {app.projectId.telegramLink && (
                                          <a href={app.projectId.telegramLink} target="_blank" rel="noopener noreferrer" className="flex-1 text-center px-4 py-3 bg-[#0088cc] text-white font-bold rounded-xl hover:bg-[#0077b3] transition-colors">
                                            Join Telegram Group
                                          </a>
                                        )}
                                        <button onClick={() => { 
                                          setSelectedChatProject(app);
                                          setModalConfig(prev => ({ ...prev, isOpen: false })); 
                                          setActiveTab('messages'); 
                                          window.location.hash = 'messages'; 
                                        }} className="flex-1 px-4 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                                          Message Project Manager
                                        </button>
                                      </div>
                                    )
                                  )} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md w-full sm:w-auto">
                                    Recording Instructions
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-slate-900">Submit Your Work</h4>
                                    {app.projectId.deadline && (
                                      <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-lg text-sm">Deadline: {new Date(app.projectId.deadline).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                  {submission ? (
                                    <div className="space-y-4">
                                      <div className={`p-4 rounded-xl border ${submission.status === 'Rework Required' ? 'bg-red-50 border-red-200 text-red-800' : (submission.status === 'Completed' || submission.status === 'Approved') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                                        <span className="font-bold">Submission Status: </span> {submission.status}
                                        {submission.feedback && <p className="mt-2 text-sm">Feedback: {submission.feedback}</p>}
                                        {(submission.status === 'Submitted' || submission.status === 'Under Review') && (
                                          <p className="mt-3 text-sm font-medium">Wait for the Team to review your work.</p>
                                        )}
                                      </div>
                                      {submission.status === 'Rework Required' && (
                                        <SubmissionForm
                                          projectId={app.projectId._id}
                                          onSubmit={(data) => submitWorkMutation.mutate({ ...data, projectId: app.projectId._id, id: submission._id })}
                                          isLoading={submitWorkMutation.isPending}
                                        />
                                      )}
                                    </div>
                                  ) : (
                                    <SubmissionForm
                                      projectId={app.projectId._id}
                                      onSubmit={(data) => submitWorkMutation.mutate({ ...data, projectId: app.projectId._id })}
                                      isLoading={submitWorkMutation.isPending}
                                    />
                                  )}
                                </>
                              )}
                            </>
                          ) : (
                            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl font-medium">
                              Wait for approval of your application to submit work.
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Payment History</h2>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 font-bold text-slate-900">Date</th>
                        <th className="p-4 font-bold text-slate-900">Project</th>
                        <th className="p-4 font-bold text-slate-900">Amount</th>
                        <th className="p-4 font-bold text-slate-900">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myPayments?.map((payment: any) => (
                        <tr key={payment._id}>
                          <td className="p-4 text-slate-600">{payment?.date ? new Date(payment.date).toLocaleDateString() : '-'}</td>
                          <td className="p-4 font-medium text-slate-900">{payment?.projectId?.title}</td>
                          <td className="p-4 font-bold text-slate-900">₹{payment?.amount}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${payment?.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {payment?.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {myPayments?.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">No payments found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MESSAGES TAB */}
            {activeTab === 'messages' && (
              <div className="space-y-6 h-full flex flex-col">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Project Messages</h2>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[500px]">
                  {selectedChatProject ? (
                    <ProjectChat
                      key={selectedChatProject.projectId._id}
                      projectId={selectedChatProject.projectId._id}
                      projectName={selectedChatProject.projectId.title}
                      token={token}
                      currentUserId={user?._id}
                      receiverId={selectedChatProject.projectId.createdBy}
                      onBack={() => setSelectedChatProject(null)}
                    />
                  ) : (
                    <div className="p-6">
                      <h4 className="font-bold text-slate-900 mb-4">Select a Project to Message the Manager</h4>
                      <div className="space-y-2">
                        {myApplications?.filter((a: any) => a?.projectId && (a?.status === 'Approved' || unreadMessagesData?.unreadProjectIds?.includes(a?.projectId?._id)))?.map((app: any) => (
                          <button
                            key={app._id}
                            onClick={() => setSelectedChatProject(app)}
                            className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-300 transition-colors relative"
                          >
                            <div className="text-left">
                              <p className="font-bold text-slate-900 flex items-center gap-2">
                                {app?.projectId?.title}
                                {unreadMessagesData?.unreadProjectIds?.includes(app?.projectId?._id) && (
                                  <span className="w-2 h-2 bg-red-500 rounded-full" title="New Message"></span>
                                )}
                              </p>
                              <p className="text-sm text-slate-500">Contact Project Manager</p>
                            </div>
                            <MessageSquare className="w-5 h-5 text-slate-400" />
                          </button>
                        ))}
                        {myApplications?.filter((a: any) => a?.projectId && (a?.status === 'Approved' || unreadMessagesData?.unreadProjectIds?.includes(a?.projectId?._id)))?.length === 0 && (
                          <p className="text-slate-500 text-center py-8">You don't have any approved projects yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* REFERRALS TAB */}
            {activeTab === 'referrals' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Refer & Earn</h2>
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <h3 className="text-xl font-bold text-slate-600 bg-slate-50 px-6 py-3 rounded-xl inline-block">Coming Soon</h3>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Notifications</h2>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  {myNotifications?.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">You have no notifications.</div>
                  ) : (
                    <div className="space-y-4">
                      {myNotifications?.map((n: any) => (
                        <div 
                          key={n._id} 
                          onClick={() => !n.isRead && markNotificationAsRead(n._id)}
                          className={`p-4 rounded-xl border transition-colors ${n.isRead ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-blue-50 border-blue-200 cursor-pointer hover:bg-blue-100'}`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <p className="text-slate-800 flex-1">{n.message}</p>
                            {!n.isRead && <span className="shrink-0 text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded-full">New</span>}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Profile Settings</h2>
                <form onSubmit={handleProfileSaveInitiate} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl space-y-4 mb-8">
                  <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Personal Details</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Email</label>
                    <input type="email" readOnly value={user?.email || ''} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-900">Full Name</label>
                      <input type="text" required value={profileFormData.fullName || ''} onChange={e => setProfileFormData({...profileFormData, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-900">Country</label>
                      <CountrySelect 
                        value={profileFormData.country || ''}
                        onChange={(val) => setProfileFormData({...profileFormData, country: val})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-900">Phone</label>
                      <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400 transition-colors">
                        <div className="px-4 py-3 bg-slate-100 border-r border-slate-200 text-slate-600 font-medium flex items-center shrink-0">
                          {COUNTRIES.find(c => c.code === profileFormData.country)?.dial_code || '+'}
                        </div>
                        <input 
                          type="tel" 
                          required 
                          value={profileFormData.phone || ''} 
                          onChange={e => setProfileFormData({...profileFormData, phone: e.target.value})} 
                          placeholder="234 567 8900" 
                          className="w-full px-4 py-3 bg-transparent outline-none" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-900">City</label>
                      <input type="text" required value={profileFormData.city || ''} onChange={e => setProfileFormData({...profileFormData, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Native Language</label>
                    <input type="text" required value={profileFormData.nativeLanguage || ''} onChange={e => setProfileFormData({...profileFormData, nativeLanguage: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">UPI ID for Payments</label>
                    <input type="text" required value={profileFormData.upiId || ''} onChange={e => setProfileFormData({...profileFormData, upiId: e.target.value})} placeholder="yourname@upi" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>
                  <button type="submit" disabled={isSendingProfileOtp} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors w-full sm:w-auto">
                    {isSendingProfileOtp ? 'Sending Code...' : 'Save Profile Details'}
                  </button>
                </form>

                <form onSubmit={(e) => { e.preventDefault(); changePasswordMutation.mutate(passwordForm); }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">Change Password</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Old Password</label>
                    <input type="password" required value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">New Password</label>
                    <input type="password" required minLength={6} value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>
                  <button type="submit" disabled={changePasswordMutation.isPending} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors w-full sm:w-auto">
                    {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Terms and Consent Modal */}
      {consentProject && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-2xl font-bold text-slate-900">
                {consentProject.isEgocentric ? (egoAppStep === 1 ? 'Terms & Conditions' : egoAppStep === 2 ? 'Select Contributor Type' : 'Application Form') : 'Terms & Conditions'}
              </h3>
              <button onClick={() => { setConsentProject(null); setEgoAppStep(1); setEgoContributorType(null); setEgoFormData({}); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {/* STEP 1: Terms */}
              {(!consentProject.isEgocentric || egoAppStep === 1) && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  <FormattedText text={consentProject.termsAndConditions} />
                </div>
              )}
              
              {/* STEP 2: Contributor Type (Egocentric Only) */}
              {consentProject.isEgocentric && egoAppStep === 2 && (
                <div className="space-y-4">
                  <p className="text-slate-600 mb-4">Please select the type of contributor you are applying as:</p>
                  
                  <label className={`block p-6 rounded-2xl border-2 cursor-pointer transition-all ${egoContributorType === 'individual' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="contributorType" value="individual" checked={egoContributorType === 'individual'} onChange={() => setEgoContributorType('individual')} className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-bold text-slate-900">Individual</h4>
                        <p className="text-sm text-slate-500">I am recording videos myself using my own device.</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className={`block p-6 rounded-2xl border-2 cursor-pointer transition-all ${egoContributorType === 'vendor' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="contributorType" value="vendor" checked={egoContributorType === 'vendor'} onChange={() => setEgoContributorType('vendor')} className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-bold text-slate-900">Vendor / Have Teams</h4>
                        <p className="text-sm text-slate-500">I have multiple contributors recording under my management.</p>
                      </div>
                    </div>
                  </label>
                  
                  <label className={`block p-6 rounded-2xl border-2 cursor-pointer transition-all ${egoContributorType === 'connections' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="contributorType" value="connections" checked={egoContributorType === 'connections'} onChange={() => setEgoContributorType('connections')} className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-bold text-slate-900">Connections to Onboard Businesses</h4>
                        <p className="text-sm text-slate-500">I have B2B connections and can onboard commercial spaces.</p>
                      </div>
                    </div>
                  </label>
                </div>
              )}
              
              {/* STEP 3: Dynamic Form (Egocentric Only) */}
              {consentProject.isEgocentric && egoAppStep === 3 && (
                <div className="space-y-6">
                  {egoContributorType === 'individual' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Device Name and Model</label>
                        <input required type="text" onChange={(e) => setEgoFormData({...egoFormData, deviceName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Do you already have a head strap?</label>
                        <select required onChange={(e) => setEgoFormData({...egoFormData, hasHeadStrap: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl">
                          <option value="">Select...</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">How many hours can you record weekly?</label>
                        <input required type="number" onChange={(e) => setEgoFormData({...egoFormData, hoursWeekly: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" />
                      </div>
                    </>
                  )}
                  {egoContributorType === 'vendor' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Device Name and Model</label>
                        <input required type="text" onChange={(e) => setEgoFormData({...egoFormData, deviceName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Number of Devices</label>
                        <input required type="number" onChange={(e) => setEgoFormData({...egoFormData, numDevices: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">How many hours can you record weekly in household?</label>
                        <input required type="number" onChange={(e) => setEgoFormData({...egoFormData, hoursHousehold: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">How many hours can you record weekly in commercials?</label>
                        <input required type="number" onChange={(e) => setEgoFormData({...egoFormData, hoursCommercial: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Total contributors you have</label>
                        <input required type="number" onChange={(e) => setEgoFormData({...egoFormData, totalContributors: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" />
                      </div>
                    </>
                  )}
                  {egoContributorType === 'connections' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Have you previously onboarded businesses/B2B connections?</label>
                        <select required onChange={(e) => setEgoFormData({...egoFormData, previousB2B: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl">
                          <option value="">Select...</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Portfolio / Reference Link</label>
                        <input required type="url" onChange={(e) => setEgoFormData({...egoFormData, portfolioLink: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">How many vendors can you connect with us?</label>
                        <input required type="number" onChange={(e) => setEgoFormData({...egoFormData, numVendorsConnect: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl" />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 shrink-0 bg-white rounded-b-3xl space-y-4">
              {/* Controls for Step 1 */}
              {(!consentProject.isEgocentric || egoAppStep === 1) && (
                <>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={agreedToTerms} 
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-slate-700 font-bold text-xs leading-relaxed text-justify">
                      I confirm that I have read and understand this Agreement and consent to the collection, use, processing, disclosure, licensing, assignment (where applicable), commercialization, and other use of my Recordings, associated information (including, where applicable, biometric information), and Materials for the Purposes described above, including for the creation, training, generation, deployment, distribution, and commercialization of artificial intelligence systems, synthetic or simulated outputs (including Digital Replicas), and synthetic media by VisionCapture and its customers.
                    </span>
                  </label>
                  <button 
                    onClick={() => {
                      if (consentProject.isEgocentric) {
                        setEgoAppStep(2);
                      } else {
                        applyMutation.mutate({ projectId: consentProject._id, agreedToTerms: true });
                      }
                    }}
                    disabled={!agreedToTerms || applyMutation.isPending}
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/20"
                  >
                    {applyMutation.isPending ? 'Submitting...' : consentProject.isEgocentric ? 'Continue' : 'Submit Application'}
                  </button>
                </>
              )}
              
              {/* Controls for Step 2 */}
              {consentProject.isEgocentric && egoAppStep === 2 && (
                <div className="flex gap-4">
                  <button onClick={() => setEgoAppStep(1)} className="px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 w-1/3">Back</button>
                  <button onClick={() => setEgoAppStep(3)} disabled={!egoContributorType} className="px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 w-2/3">Continue</button>
                </div>
              )}
              
              {/* Controls for Step 3 */}
              {consentProject.isEgocentric && egoAppStep === 3 && (
                <div className="flex gap-4">
                  <button onClick={() => setEgoAppStep(2)} className="px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 w-1/3">Back</button>
                  <button 
                    onClick={() => {
                      const formPayload = { ...egoFormData, contributorType: egoContributorType };
                      applyMutation.mutate({ projectId: consentProject._id, agreedToTerms: true, formData: formPayload });
                    }} 
                    disabled={applyMutation.isPending} 
                    className="px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 w-2/3"
                  >
                    {applyMutation.isPending ? 'Submitting...' : 'Submit Final Application'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      , document.body)}

      {/* OTP Modal for Profile Save */}
      {isProfileOtpSent && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-3xl w-full max-w-sm flex flex-col shadow-2xl p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Verify OTP</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              We've sent a 6-digit code to <strong>{user?.email}</strong>. Enter it below to confirm your profile changes.
            </p>
            <input 
              type="text" 
              placeholder="000000" 
              maxLength={6}
              value={profileOtp} 
              onChange={e => setProfileOtp(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center tracking-[0.5em] font-mono font-bold text-xl mb-6 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => { setIsProfileOtpSent(false); setProfileOtp(''); }} 
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => updateProfileMutation.mutate({ otp: profileOtp, profileData: profileFormDataToSubmit || profileFormData })} 
                disabled={updateProfileMutation.isPending || profileOtp.length !== 6} 
                className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      <Modal {...modalConfig} />
    </div>
  );
}

function SubmissionForm({ projectId, onSubmit, isLoading }: { projectId: string, onSubmit: (data: any) => void, isLoading: boolean }) {
  const [extId, setExtId] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ externalProjectId: extId, notes }); }} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">External Project ID</label>
          <input required type="text" value={extId} onChange={e => setExtId(e.target.value)} placeholder="e.g. TASK-123" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-900">Notes / Comments</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm h-24" />
      </div>
      <button type="submit" disabled={isLoading} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
        {isLoading ? 'Submitting...' : 'Submit Work'}
      </button>
    </form>
  )
}
