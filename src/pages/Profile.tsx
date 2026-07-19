import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Profile() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [newMessage, setNewMessage] = useState('');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Password Reset State
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['profile', token],
    queryFn: async () => {
      const res = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        handleLogout();
        throw new Error('Failed to fetch profile');
      }
      const data = await res.json();
      return data.user;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const { data: messages = [], isLoading: isMessagesLoading } = useQuery({
    queryKey: ['profile-messages', user?._id, token],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      return data.messages;
    },
    enabled: !!token && !!user?._id,
    refetchInterval: 10000, // Background refresh every 10s
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ content, receiverId: 'admin' })
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ['messages', user?._id] });
      const previousMessages = queryClient.getQueryData(['messages', user?._id]);
      
      const optimisticMessage = {
        _id: Date.now().toString(),
        senderId: user?._id,
        content,
        createdAt: new Date().toISOString()
      };
      
      queryClient.setQueryData(['messages', user?._id], (old: any) => [...(old || []), optimisticMessage]);
      
      return { previousMessages };
    },
    onError: (err, newMsg, context) => {
      queryClient.setQueryData(['messages', user?._id], context?.previousMessages);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', user?._id] });
    }
  });

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
      if (res.ok) {
        if (data.user?.role === 'admin') {
          setLoginError('Admin accounts must log in via the Admin portal.');
          return;
        }
        localStorage.setItem('token', data.token);
        window.location.reload();
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (err) {
      setLoginError('Network error');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setResetSuccess('');

    if (!resetOtpSent) {
      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, type: 'reset' })
        });
        const data = await res.json();
        if (res.ok) {
          setResetOtpSent(true);
          setResetSuccess('OTP sent to your email.');
        } else {
          setLoginError(data.error || 'Failed to send OTP');
        }
      } catch (err) {
        setLoginError('Network error');
      }
    } else {
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: resetOtp, newPassword })
        });
        const data = await res.json();
        if (res.ok) {
          setResetSuccess('Password reset successfully. You can now login.');
          setResetOtpSent(false);
          setResetOtp('');
          setNewPassword('');
          setIsResetMode(false);
        } else {
          setLoginError(data.error || 'Failed to reset password');
        }
      } catch (err) {
        setLoginError('Network error');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    queryClient.removeQueries();
    window.dispatchEvent(new Event('authChange'));
    window.location.reload();
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    sendMessageMutation.mutate(newMessage);
    setNewMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  if (!token) {
    if (localStorage.getItem('adminToken')) {
      return (
        <div className="py-24 max-w-md mx-auto px-4 text-center">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-10 flex flex-col items-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Admin Session Active</h1>
            <p className="text-slate-600 mb-8">
              You are currently logged in as an administrator. To log into a regular user account, you must log out first.
            </p>
            <div className="flex flex-col w-full gap-3">
              <a href="/admin" className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                Go to Admin Dashboard
              </a>
              <button onClick={handleLogout} className="w-full px-6 py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors">
                Log Out
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="py-24 max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 text-center mb-8">
          {isResetMode ? 'Reset Password' : 'User Login'}
        </h1>
        <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 space-y-6">
          {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium">{loginError}</div>}
          {resetSuccess && <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm text-center font-medium">{resetSuccess}</div>}
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={isResetMode && resetOtpSent} placeholder="Enter your email address" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 disabled:opacity-50" />
          </div>
          
          {!isResetMode && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
            </div>
          )}

          {isResetMode && resetOtpSent && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Enter OTP</label>
                <input type="text" required value={resetOtp} onChange={e => setResetOtp(e.target.value)} placeholder="6-digit OTP" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">New Password</label>
                <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
              </div>
            </>
          )}

          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">
            {isResetMode ? (resetOtpSent ? 'Reset Password' : 'Send OTP') : 'Login'}
          </button>
          
          {!isResetMode && (
            <a href="/contributors" className="block w-full text-center bg-transparent border-2 border-slate-900 text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors mt-2">
              Create an Account
            </a>
          )}
          
          <div className="text-center mt-4 text-sm text-slate-600">
            {isResetMode ? (
              <button type="button" onClick={() => { setIsResetMode(false); setResetOtpSent(false); setResetSuccess(''); setLoginError(''); }} className="text-blue-600 hover:underline">Back to Login</button>
            ) : (
              <button type="button" onClick={() => { setIsResetMode(true); setResetSuccess(''); setLoginError(''); }} className="text-blue-600 hover:underline">Forgot Password?</button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="py-24 max-w-4xl mx-auto px-4 grid md:grid-cols-3 gap-8">
      {/* Profile Details */}
      <div className="md:col-span-1 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-6 h-fit">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile</h2>
        {isUserLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mt-4"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
          </div>
        ) : user ? (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-slate-500 font-semibold">Name</p>
              <p className="text-slate-900">{user.fullName}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Email</p>
              <p className="text-slate-900">{user.email}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Location</p>
              <p className="text-slate-900">{user.city}, {user.country}</p>
            </div>
            <button onClick={handleLogout} className="w-full mt-6 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold transition-colors">
              Logout
            </button>
          </div>
        ) : (
          <p>Failed to load profile.</p>
        )}
      </div>

      {/* Messaging */}
      <div className="md:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl flex flex-col h-[600px]">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">Message to Vision Team</h2>
        </div>
        
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
          {isMessagesLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-slate-200 rounded-2xl w-3/4 ml-auto"></div>
              <div className="h-16 bg-slate-200 rounded-2xl w-1/2"></div>
              <div className="h-12 bg-slate-200 rounded-2xl w-2/3 ml-auto"></div>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-slate-500 text-center m-auto">No messages yet.</p>
          ) : (
            messages.map((msg: any, idx: number) => (
              <div key={idx} className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${msg.senderId === user?._id ? 'bg-blue-600 text-white self-end rounded-tr-none' : 'bg-slate-100 text-slate-900 self-start rounded-tl-none'}`}>
                {msg.content}
              </div>
            ))
          )}
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2 items-end">
          <textarea 
            ref={textareaRef}
            rows={isFocused || newMessage.length > 0 ? 4 : 1}
            value={newMessage} 
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              if (!newMessage && textareaRef.current) {
                textareaRef.current.style.height = 'auto';
              }
            }}
            onChange={handleTextareaChange} 
            placeholder="Type a message... (Press Enter for new line)" 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-[360px] overflow-y-auto transition-all duration-200"
          />
          <button type="submit" disabled={sendMessageMutation.isPending} className="bg-slate-900 text-white px-6 py-2 h-[48px] rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50">
            {sendMessageMutation.isPending ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
