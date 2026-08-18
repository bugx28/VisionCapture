import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

export default function Admin() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // UI State
  type TabType = 'contributors' | 'inquiries' | 'project_managers' | 'platform_stats' | 'referral_settings' | 'approvals';
  const getInitialTab = (): TabType => {
    const hash = window.location.hash.replace('#', '');
    if (['contributors', 'inquiries', 'project_managers', 'platform_stats', 'referral_settings', 'approvals'].includes(hash)) {
      return hash as TabType;
    }
    return 'contributors';
  };
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(getInitialTab());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);
  const [filterEgocentric, setFilterEgocentric] = useState(false);
  const [filterCountry, setFilterCountry] = useState('');
  
  // Pagination State
  const [usersPage, setUsersPage] = useState(1);
  const [contactsPage, setContactsPage] = useState(1);

  // Messaging State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // PM Creation State
  const [pmEmail, setPmEmail] = useState('');
  const [pmPassword, setPmPassword] = useState('');
  const [pmStatus, setPmStatus] = useState('');
  
  // PM Edit State
  const [editingPmId, setEditingPmId] = useState<string | null>(null);
  const [editPmEmail, setEditPmEmail] = useState('');
  const [editPmPassword, setEditPmPassword] = useState('');

  const handleCreatePm = async (e: React.FormEvent) => {
    e.preventDefault();
    setPmStatus('Creating...');
    try {
      const res = await fetch('/api/admin/create-pm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: pmEmail, password: pmPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPmStatus('Project Manager created successfully!');
      setPmEmail('');
      setPmPassword('');
      queryClient.invalidateQueries({ queryKey: ['admin-pms'] });
    } catch (err: any) {
      setPmStatus(err.message || 'Error creating PM');
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Inquiries State
  const [selectedContact, setSelectedContact] = useState<any>(null);

  // Queries
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['admin-users', usersPage, filterCountry, token],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?page=${usersPage}&limit=20${filterCountry ? '&country=' + encodeURIComponent(filterCountry) : ''}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { handleLogout(); throw new Error('Unauthorized'); }
      const data = await res.json();
      return data;
    },
    enabled: !!token,
    staleTime: 60 * 1000
  });

  const { data: countriesData } = useQuery({
    queryKey: ['admin-countries', token],
    queryFn: async () => {
      const res = await fetch('/api/admin/countries', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.countries || [];
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000
  });

  const { data: contactsData, isLoading: isContactsLoading } = useQuery({
    queryKey: ['admin-contacts', contactsPage, token],
    queryFn: async () => {
      const res = await fetch(`/api/admin/contacts?page=${contactsPage}&limit=20`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data;
    },
    enabled: !!token,
    staleTime: 60 * 1000
  });

  const { data: pmsData } = useQuery({
    queryKey: ['admin-pms', token],
    queryFn: async () => {
      const res = await fetch('/api/admin/pms', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.pms || [];
    },
    enabled: !!token,
    staleTime: 60 * 1000
  });

  const { data: platformStatsData } = useQuery({
    queryKey: ['admin-platform-stats', token],
    queryFn: async () => {
      const res = await fetch('/api/public/platform-stats');
      const data = await res.json();
      return data.stats;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000
  });

  const { data: referralSettingsData } = useQuery({
    queryKey: ['admin-referral-settings', token],
    queryFn: async () => {
      const res = await fetch('/api/admin/referral-settings', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.settings;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000
  });

  const { data: approvalsData, refetch: refetchApprovals } = useQuery({
    queryKey: ['admin-approvals', token],
    queryFn: async () => {
      const res = await fetch('/api/admin/approvals', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.approvals || [];
    },
    enabled: !!token,
    staleTime: 60 * 1000
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/approvals/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to approve');
      return res.json();
    },
    onSuccess: () => {
      refetchApprovals();
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/approvals/${id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: 'Rejected by admin.' })
      });
      if (!res.ok) throw new Error('Failed to reject');
      return res.json();
    },
    onSuccess: () => {
      refetchApprovals();
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
    }
  });

  const { data: messages = [], isLoading: isMessagesLoading } = useQuery({
    queryKey: ['messages', selectedUser?._id, token],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${selectedUser._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.messages;
    },
    enabled: !!token && !!selectedUser?._id,
    refetchInterval: 10000,
    staleTime: 60 * 1000
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mutations
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: (_, id) => {
      if (selectedUser?._id === id) setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: (_, id) => {
      if (selectedContact?._id === id) setSelectedContact(null);
      queryClient.invalidateQueries({ queryKey: ['admin-contacts'] });
    }
  });

  const updatePmMutation = useMutation({
    mutationFn: async ({ id, email, password }: { id: string, email: string, password?: string }) => {
      const res = await fetch(`/api/admin/pms/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update PM');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pms'] });
      setEditingPmId(null);
      alert('Project Manager updated successfully.');
    },
    onError: (err: any) => alert(err.message)
  });

  const deletePmMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/pms/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pms'] });
    }
  });

  const updatePlatformStatsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/admin/platform-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update stats');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-platform-stats'] })
  });

  const updateReferralSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/admin/referral-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update referral settings');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-referral-settings'] })
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ content, receiverId: selectedUser._id })
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedUser?._id] });
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
      if (res.ok && data.user.role === 'admin') {
        localStorage.setItem('adminToken', data.token);
        window.location.reload();
      } else {
        setLoginError(data.error || 'Access denied. Admins only.');
      }
    } catch (err) {
      setLoginError('Network error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    queryClient.removeQueries();
    window.dispatchEvent(new Event('authChange'));
    window.location.reload();
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
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

  const deleteUser = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this contributor?')) return;
    deleteUserMutation.mutate(id);
  };

  const deleteContact = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    deleteContactMutation.mutate(id);
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

  const usersList = usersData?.users || [];
  const contactsList = contactsData?.contacts || [];
  
  const filteredUsers = React.useMemo(() => {
    return filterEgocentric 
      ? usersList.filter((u: any) => u.projectsInterestedIn && u.projectsInterestedIn.includes('Egocentric Video')) 
      : usersList;
  }, [filterEgocentric, usersList]);

  return (
    <div className="py-24 max-w-7xl mx-auto px-4">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <div className="flex gap-4 text-sm font-medium text-slate-600">
            <span className="bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Total Contributors: <strong className="text-slate-900">{usersData?.pagination?.total || 0}</strong>
            </span>
            <span className="bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Total Inquiries: <strong className="text-slate-900">{contactsData?.pagination?.total || 0}</strong>
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="px-6 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold transition-colors">Logout</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => { setActiveTab('contributors'); window.location.hash = 'contributors'; }}
          className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'contributors' ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          Contributors
        </button>
        <button 
          onClick={() => { setActiveTab('inquiries'); window.location.hash = 'inquiries'; }}
          className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'inquiries' ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          Inquiries
        </button>
        <button 
          onClick={() => { setActiveTab('project_managers'); window.location.hash = 'project_managers'; }}
          className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'project_managers' ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          Project Managers
        </button>
        <button 
          onClick={() => { setActiveTab('platform_stats'); window.location.hash = 'platform_stats'; }}
          className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'platform_stats' ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          Platform Stats
        </button>
        <button 
          onClick={() => { setActiveTab('referral_settings'); window.location.hash = 'referral_settings'; }}
          className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'referral_settings' ? 'bg-slate-900 text-white' : 'bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          Referral Settings
        </button>
        <button 
          onClick={() => { setActiveTab('approvals'); window.location.hash = 'approvals'; }}
          className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'approvals' ? 'bg-amber-500 text-white' : 'bg-white/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          <div className="flex items-center gap-2">
            Approvals
            {approvalsData?.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{approvalsData.length}</span>
            )}
          </div>
        </button>
      </div>

      {/* Main Layout */}
      {activeTab === 'approvals' ? (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Pending Approvals</h2>
          {!approvalsData || approvalsData.length === 0 ? (
            <p className="text-slate-500 text-center py-10">No pending approvals.</p>
          ) : (
            <div className="space-y-6">
              {approvalsData.map((req: any) => (
                <div key={req._id} className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
                  <div className="flex justify-between items-start mb-4 border-b border-slate-200 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {req.type === 'CREATE_PROJECT' ? 'Create New Project' : 
                         req.type === 'UPDATE_PROJECT' ? `Update Project: ${req.projectId?.title}` : 
                         'Update Egocentric Settings'}
                      </h3>
                      <p className="text-sm text-slate-500">Requested by: {req.requestedBy?.email}</p>
                      <p className="text-xs text-slate-400">On: {new Date(req.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => approveMutation.mutate(req._id)}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                      >Approve</button>
                      <button 
                        onClick={() => rejectMutation.mutate(req._id)}
                        disabled={rejectMutation.isPending}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
                      >Reject</button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm mb-2">Payload Data:</h4>
                    <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                      {JSON.stringify(req.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'platform_stats' ? (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Homepage Platform Statistics</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            updatePlatformStatsMutation.mutate({
              totalPayments: formData.get('totalPayments'),
              projectsDelivered: formData.get('projectsDelivered'),
              clientsServed: formData.get('clientsServed')
            });
            alert('Stats updated successfully');
          }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Total Payments Paid</label>
              <input type="text" name="totalPayments" defaultValue={platformStatsData?.totalPayments || '0'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Projects Delivered</label>
              <input type="text" name="projectsDelivered" defaultValue={platformStatsData?.projectsDelivered || '0'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Happy Clients</label>
              <input type="text" name="clientsServed" defaultValue={platformStatsData?.clientsServed || '0'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
            </div>
            <p className="text-sm text-slate-500">Note: Total Contributors is calculated automatically from registered users.</p>
            <button type="submit" disabled={updatePlatformStatsMutation.isPending} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
              {updatePlatformStatsMutation.isPending ? 'Saving...' : 'Save Statistics'}
            </button>
          </form>
        </div>
      ) : activeTab === 'referral_settings' ? (
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Referral Settings & Prizes</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const prize1 = formData.get('prize1');
            const prize2 = formData.get('prize2');
            const prize3 = formData.get('prize3');
            updateReferralSettingsMutation.mutate({
              prizeAmounts: JSON.stringify([
                { rank: 1, amount: Number(prize1) },
                { rank: 2, amount: Number(prize2) },
                { rank: 3, amount: Number(prize3) }
              ])
            });
            alert('Referral settings updated successfully');
          }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Current Month</label>
              <input type="text" disabled value={referralSettingsData?.currentMonth || ''} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 pt-4 border-t border-slate-200">Monthly Prizes (₹)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">🥇 1st Prize</label>
                <input type="number" name="prize1" defaultValue={referralSettingsData?.prizeAmounts ? JSON.parse(referralSettingsData.prizeAmounts)[0]?.amount : 3000} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">🥈 2nd Prize</label>
                <input type="number" name="prize2" defaultValue={referralSettingsData?.prizeAmounts ? JSON.parse(referralSettingsData.prizeAmounts)[1]?.amount : 1000} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">🥉 3rd Prize</label>
                <input type="number" name="prize3" defaultValue={referralSettingsData?.prizeAmounts ? JSON.parse(referralSettingsData.prizeAmounts)[2]?.amount : 500} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
              </div>
            </div>
            <button type="submit" disabled={updateReferralSettingsMutation.isPending} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
              {updateReferralSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
          
          {/* Manual Adjustments UI could go here in future */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Manual Adjustments</h3>
            <p className="text-sm text-slate-600 mb-4">To manually adjust referral counts, you can use the backend API directly or implement an adjustment interface here.</p>
          </div>
        </div>
      ) : activeTab === 'project_managers' ? (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 h-fit">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Create Project Manager</h2>
            <form onSubmit={handleCreatePm} className="space-y-6">
              {pmStatus && (
                <div className={`p-4 rounded-xl text-sm font-medium ${pmStatus.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                  {pmStatus}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Email Address</label>
                <input type="email" required value={pmEmail} onChange={e => setPmEmail(e.target.value)} placeholder="pm@visioncapture.in" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Temporary Password</label>
                <input type="password" required value={pmPassword} onChange={e => setPmPassword(e.target.value)} placeholder="Minimum 6 characters" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
              </div>
              <button type="submit" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                Create Account
              </button>
            </form>
          </div>
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Existing Project Managers</h2>
            <div className="space-y-4">
              {pmsData?.map((pm: any) => (
                <div key={pm._id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  {editingPmId === pm._id ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Email</label>
                        <input type="email" value={editPmEmail} onChange={e => setEditPmEmail(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">New Password (leave blank to keep current)</label>
                        <input type="password" value={editPmPassword} onChange={e => setEditPmPassword(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Minimum 6 characters" />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setEditingPmId(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                        <button 
                          onClick={() => updatePmMutation.mutate({ id: pm._id, email: editPmEmail, password: editPmPassword || undefined })}
                          disabled={updatePmMutation.isPending}
                          className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {updatePmMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900">{pm.email}</p>
                        <p className="text-sm text-slate-500">Created: {new Date(pm.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setEditingPmId(pm._id); setEditPmEmail(pm.email); setEditPmPassword(''); }} 
                          className="text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => { if(window.confirm('Delete this PM?')) deletePmMutation.mutate(pm._id); }} 
                          className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50" 
                          disabled={deletePmMutation.isPending}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {pmsData?.length === 0 && <p className="text-slate-500 text-center py-4">No project managers found.</p>}
            </div>
          </div>
        </div>
      ) : (
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT PANEL (List) */}
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-6 flex flex-col h-[650px]">
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">
                {activeTab === 'contributors' ? 'Contributors' : 'Inquiries'}
              </h2>
              {activeTab === 'contributors' && (
                <button
                  onClick={() => setFilterEgocentric(!filterEgocentric)}
                  className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors shrink-0 ${filterEgocentric ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                >
                  Egocentric Only
                </button>
              )}
            </div>
            {activeTab === 'contributors' && (
              <select 
                value={filterCountry} 
                onChange={(e) => { setFilterCountry(e.target.value); setUsersPage(1); }}
                className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white transition-colors"
              >
                <option value="">All Countries</option>
                {countriesData?.map((country: string) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            )}
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            
            {/* Contributors List */}
            {activeTab === 'contributors' && (
              <>
                {isUsersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
                    ))}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-slate-500 text-center m-auto">No contributors found.</p>
                ) : (
                  filteredUsers.map((u: any, index: number) => (
                    <div 
                      key={u._id} 
                      onClick={() => setSelectedUser(u)}
                      className={`p-4 border rounded-2xl flex flex-col cursor-pointer transition-colors ${selectedUser?._id === u._id ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">{(usersPage - 1) * 20 + index + 1}</span>
                        <div className="flex-1 overflow-hidden pr-2">
                          <p className="font-bold text-slate-900 truncate">{u.fullName}</p>
                          <p className="text-sm text-slate-500 truncate">{u.email}</p>
                        </div>
                        {u.createdAt && (
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md shrink-0 border border-green-200 whitespace-nowrap">
                            Joined {getDaysAgo(u.createdAt).toLowerCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {/* Users Pagination */}
                {usersData?.pagination && usersData.pagination.pages > 1 && (
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
                    <button 
                      disabled={usersPage === 1} 
                      onClick={() => setUsersPage(p => p - 1)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg disabled:opacity-50 transition-colors"
                    >
                      Prev
                    </button>
                    <span className="text-sm font-medium text-slate-500">Page {usersPage} of {usersData.pagination.pages}</span>
                    <button 
                      disabled={usersPage === usersData.pagination.pages} 
                      onClick={() => setUsersPage(p => p + 1)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Inquiries List */}
            {activeTab === 'inquiries' && (
              <>
                {isContactsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
                    ))}
                  </div>
                ) : contactsList.length === 0 ? (
                  <p className="text-slate-500 text-center m-auto">No inquiries found.</p>
                ) : (
                  contactsList.map((c: any, index: number) => (
                    <div 
                      key={c._id} 
                      onClick={() => setSelectedContact(c)}
                      className={`p-4 border rounded-2xl flex flex-col cursor-pointer transition-colors ${selectedContact?._id === c._id ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">{(contactsPage - 1) * 20 + index + 1}</span>
                        <div className="flex-1 overflow-hidden pr-2">
                          <p className="font-bold text-slate-900 truncate">{c.company || c.name}</p>
                          <p className="text-sm text-slate-500 truncate">{c.company ? `${c.name} • ` : ''}{c.serviceType || 'General Inquiry'}</p>
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md shrink-0 border border-blue-200">{getDaysAgo(c.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}

                {/* Contacts Pagination */}
                {contactsData?.pagination && contactsData.pagination.pages > 1 && (
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-auto">
                    <button 
                      disabled={contactsPage === 1} 
                      onClick={() => setContactsPage(p => p - 1)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg disabled:opacity-50 transition-colors"
                    >
                      Prev
                    </button>
                    <span className="text-sm font-medium text-slate-500">Page {contactsPage} of {contactsData.pagination.pages}</span>
                    <button 
                      disabled={contactsPage === contactsData.pagination.pages} 
                      onClick={() => setContactsPage(p => p + 1)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
            
          </div>
        </div>

        {/* RIGHT PANEL (Details) */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl flex flex-col h-[650px] overflow-hidden">
          
          {/* Contributor Chat Details */}
          {activeTab === 'contributors' && (
            selectedUser ? (
              <>
                <div className="p-3 border-b border-slate-100 flex flex-col shrink-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedUser.fullName}</h2>
                        <p className="text-xs text-slate-500">{selectedUser.email}</p>
                      </div>
                      {selectedUser.createdAt && (
                        <span className="text-xs font-bold bg-green-100 text-green-800 border border-green-200 px-2.5 py-1 rounded-full shadow-sm">
                          Joined {getDaysAgo(selectedUser.createdAt).toLowerCase()}
                        </span>
                      )}
                    </div>
                    <button onClick={(e) => deleteUser(selectedUser._id, e)} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50" disabled={deleteUserMutation.isPending}>
                      {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                  
                  {/* User Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 overflow-y-auto max-h-24">
                    <div><span className="text-slate-400 block">Location</span><span className="font-semibold text-slate-700">{selectedUser.city}, {selectedUser.country}</span></div>
                    <div><span className="text-slate-400 block">Phone</span><span className="font-semibold text-slate-700">{selectedUser.phone}</span></div>
                    <div><span className="text-slate-400 block">Experience</span><span className="font-semibold text-slate-700">{selectedUser.experience}</span></div>
                    <div><span className="text-slate-400 block">Native Lang</span><span className="font-semibold text-slate-700">{selectedUser.nativeLanguage}</span></div>
                    <div><span className="text-slate-400 block">Other Lang</span><span className="font-semibold text-slate-700">{selectedUser.additionalLanguage || '-'}</span></div>
                    <div><span className="text-slate-400 block">Source</span><span className="font-semibold text-slate-700">{selectedUser.howFoundUs}</span></div>
                    <div className="col-span-2"><span className="text-slate-400 block">Projects</span><span className="font-semibold text-slate-700 truncate block" title={selectedUser.projectsInterestedIn?.join(', ')}>{selectedUser.projectsInterestedIn?.join(', ') || '-'}</span></div>
                  </div>
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
                      <div key={idx} className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${msg.senderId !== selectedUser._id ? 'bg-blue-600 text-white self-end rounded-tr-none' : 'bg-slate-200 text-slate-900 self-start rounded-tl-none'}`}>
                        {msg.content}
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2 items-end bg-white">
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
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-slate-900">{selectedContact.company || selectedContact.name}</h2>
                      {selectedContact.createdAt && (
                        <span className="text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full shadow-sm">
                          {getDaysAgo(selectedContact.createdAt)}
                        </span>
                      )}
                    </div>
                    {selectedContact.company && <p className="text-lg font-medium text-slate-700">{selectedContact.name}</p>}
                    <a href={`mailto:${selectedContact.email}`} className="text-sm text-blue-600 hover:underline">{selectedContact.email}</a>
                  </div>
                  <button onClick={(e) => deleteContact(selectedContact._id, e)} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shrink-0 disabled:opacity-50" disabled={deleteContactMutation.isPending}>
                    {deleteContactMutation.isPending ? 'Deleting...' : 'Delete Inquiry'}
                  </button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
                  {(selectedContact.serviceType || selectedContact.company) && (
                    <div className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-full mb-6 border border-blue-200">
                      {selectedContact.serviceType || 'General Inquiry'}
                    </div>
                  )}
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Message</h3>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-800 whitespace-pre-wrap leading-relaxed shadow-sm">
                    {selectedContact.message || selectedContact.project || 'No message provided.'}
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
      )}
    </div>
  );
}
