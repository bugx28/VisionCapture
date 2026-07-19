import React, { useState, useEffect } from 'react';

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [users, setUsers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // UI State
  const [activeTab, setActiveTab] = useState<'contributors' | 'inquiries'>('contributors');
  const [filterEgocentric, setFilterEgocentric] = useState(false);

  // Messaging State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Inquiries State
  const [selectedContact, setSelectedContact] = useState<any>(null);

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchContacts();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setUsers(data.users);
      else if (res.status === 401 || res.status === 403) handleLogout();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/admin/contacts', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setContacts(data.contacts);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const res = await fetch(`/api/messages/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setMessages(data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const selectUserForChat = (user: any) => {
    setSelectedUser(user);
    fetchMessages(user._id);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ content: newMessage, receiverId: selectedUser._id })
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedUser._id);
      }
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
      if (res.ok && data.user.role === 'admin') {
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        window.dispatchEvent(new Event('authChange'));
      } else {
        setLoginError(data.error || 'Access denied. Admins only.');
      }
    } catch (err) {
      setLoginError('Network error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setEmail('');
    setPassword('');
    setLoginError('');
    window.dispatchEvent(new Event('authChange'));
  };

  const deleteUser = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this contributor?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (selectedUser && selectedUser._id === id) setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteContact = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (selectedContact && selectedContact._id === id) setSelectedContact(null);
        fetchContacts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="py-24 max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 text-center mb-8">Admin Login</h1>
        <form onSubmit={handleLogin} className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 space-y-6">
          {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium">{loginError}</div>}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter admin email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">Login</button>
        </form>
      </div>
    );
  }

  const filteredUsers = filterEgocentric 
    ? users.filter(u => u.projectsInterestedIn && u.projectsInterestedIn.includes('Egocentric Video')) 
    : users;

  return (
    <div className="py-24 max-w-7xl mx-auto px-4">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <div className="flex gap-4 text-sm font-medium text-slate-600">
            <span className="bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Total Contributors: <strong className="text-slate-900">{users.length}</strong>
            </span>
            <span className="bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Total Inquiries: <strong className="text-slate-900">{contacts.length}</strong>
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="px-6 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold transition-colors">Logout</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('contributors')}
          className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'contributors' ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          Contributors
        </button>
        <button 
          onClick={() => setActiveTab('inquiries')}
          className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'inquiries' ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          Inquiries
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT PANEL (List) */}
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-6 flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {activeTab === 'contributors' ? 'Contributors' : 'Inquiries'}
            </h2>
            {activeTab === 'contributors' && (
              <button
                onClick={() => setFilterEgocentric(!filterEgocentric)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors ${filterEgocentric ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
              >
                Egocentric Only
              </button>
            )}
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            
            {/* Contributors List */}
            {activeTab === 'contributors' && (
              <>
                {filteredUsers.length === 0 && <p className="text-slate-500 text-center m-auto">No contributors found.</p>}
                {filteredUsers.map((u, index) => (
                  <div 
                    key={u._id} 
                    onClick={() => selectUserForChat(u)}
                    className={`p-4 border rounded-2xl flex flex-col cursor-pointer transition-colors ${selectedUser?._id === u._id ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">{index + 1}</span>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 truncate">{u.fullName}</p>
                        <p className="text-sm text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Inquiries List */}
            {activeTab === 'inquiries' && (
              <>
                {contacts.length === 0 && <p className="text-slate-500 text-center m-auto">No inquiries found.</p>}
                {contacts.map((c, index) => (
                  <div 
                    key={c._id} 
                    onClick={() => setSelectedContact(c)}
                    className={`p-4 border rounded-2xl flex flex-col cursor-pointer transition-colors ${selectedContact?._id === c._id ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">{index + 1}</span>
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 truncate">{c.company}</p>
                        <p className="text-sm text-slate-500 truncate">{c.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            
          </div>
        </div>

        {/* RIGHT PANEL (Details) */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl flex flex-col h-[600px] overflow-hidden">
          
          {/* Contributor Chat Details */}
          {activeTab === 'contributors' && (
            selectedUser ? (
              <>
                <div className="p-4 border-b border-slate-100 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedUser.fullName}</h2>
                      <p className="text-sm text-slate-500">{selectedUser.email}</p>
                    </div>
                    <button onClick={(e) => deleteUser(selectedUser._id, e)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">Delete Contributor</button>
                  </div>
                  
                  {/* User Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100 overflow-y-auto max-h-40">
                    <div><span className="text-slate-400 block mb-1">Location</span><span className="font-semibold text-slate-700">{selectedUser.city}, {selectedUser.country}</span></div>
                    <div><span className="text-slate-400 block mb-1">Phone</span><span className="font-semibold text-slate-700">{selectedUser.phone}</span></div>
                    <div><span className="text-slate-400 block mb-1">Experience</span><span className="font-semibold text-slate-700">{selectedUser.experience}</span></div>
                    <div><span className="text-slate-400 block mb-1">Native Lang</span><span className="font-semibold text-slate-700">{selectedUser.nativeLanguage}</span></div>
                    <div><span className="text-slate-400 block mb-1">Other Lang</span><span className="font-semibold text-slate-700">{selectedUser.additionalLanguage || '-'}</span></div>
                    <div><span className="text-slate-400 block mb-1">Source</span><span className="font-semibold text-slate-700">{selectedUser.howFoundUs}</span></div>
                    <div className="col-span-2 sm:col-span-3"><span className="text-slate-400 block mb-1">Projects Interested In</span><span className="font-semibold text-slate-700">{selectedUser.projectsInterestedIn?.join(', ') || '-'}</span></div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col bg-slate-50/50">
                  {messages.length === 0 && <p className="text-slate-500 text-center m-auto">No messages yet.</p>}
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${msg.senderId !== selectedUser._id ? 'bg-blue-600 text-white self-end rounded-tr-none' : 'bg-slate-200 text-slate-900 self-start rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2 items-end bg-white">
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
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <p className="text-lg font-medium text-slate-600">Select a contributor to view details and chat</p>
              </div>
            )
          )}

          {/* Inquiry Details */}
          {activeTab === 'inquiries' && (
            selectedContact ? (
              <>
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">{selectedContact.company}</h2>
                    <p className="text-lg font-medium text-slate-700">{selectedContact.name}</p>
                    <a href={`mailto:${selectedContact.email}`} className="text-sm text-blue-600 hover:underline">{selectedContact.email}</a>
                  </div>
                  <button onClick={(e) => deleteContact(selectedContact._id, e)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shrink-0">Delete Inquiry</button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Project Requirements</h3>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-800 whitespace-pre-wrap leading-relaxed shadow-sm">
                    {selectedContact.project}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium text-slate-600">Select an inquiry to read the project details</p>
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}
