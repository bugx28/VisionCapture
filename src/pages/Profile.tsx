import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
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

  useEffect(() => {
    if (token) {
      fetchProfile();
      // Assume adminId is known or messaging system is broadcast. For simplicity, we just send to 'admin'
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        // Also fetch messages (needs admin ID, or we fetch all messages for user)
        // Since we are the user, we just fetch our messages
        fetchMessages(data.user._id);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const res = await fetch(`/api/messages/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMessages(data.messages);
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
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        window.dispatchEvent(new Event('authChange'));
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
      // Step 1: Send OTP
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
      // Step 2: Verify OTP and Reset Password
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
    setToken(null);
    setUser(null);
    setEmail('');
    setPassword('');
    setLoginError('');
    window.dispatchEvent(new Event('authChange'));
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    try {
      // In this simple app, we just send message to the admin. 
      // We need admin's ID, but for now we assume there's a logic in backend or we fetch admin users.
      // A proper way is the backend handles messages to 'admin' if receiverId is omitted or special.
      // Let's modify backend later to handle "admin" as receiverId.
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ content: newMessage, receiverId: 'admin' }) // Requires backend tweak
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages(user._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="py-24 max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 text-center mb-8">
          {isResetMode ? 'Reset Password' : 'User Login'}
        </h1>
        <form onSubmit={isResetMode ? handleResetPassword : handleLogin} className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 space-y-6">
          {loginError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium">
              {loginError}
            </div>
          )}
          {resetSuccess && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl text-sm text-center font-medium">
              {resetSuccess}
            </div>
          )}
          
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

  if (!user) return <div className="py-24 text-center">Loading...</div>;

  return (
    <div className="py-24 max-w-4xl mx-auto px-4 grid md:grid-cols-3 gap-8">
      {/* Profile Details */}
      <div className="md:col-span-1 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-6 h-fit">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile</h2>
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
      </div>

      {/* Messaging */}
      <div className="md:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl flex flex-col h-[600px]">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900">Message to Vision Team</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
          {messages.length === 0 && <p className="text-slate-500 text-center m-auto">No messages yet.</p>}
          {messages.map((msg, idx) => (
            <div key={idx} className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${msg.senderId === user._id ? 'bg-blue-600 text-white self-end rounded-tr-none' : 'bg-slate-100 text-slate-900 self-start rounded-tl-none'}`}>
              {msg.content}
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2 items-end">
          <textarea 
            rows={4}
            value={newMessage} 
            onChange={e => setNewMessage(e.target.value)} 
            placeholder="Type a message... (Press Enter for new line)" 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-slate-900 text-white px-6 py-2 h-[42px] rounded-xl font-bold hover:bg-slate-800 transition-colors">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
