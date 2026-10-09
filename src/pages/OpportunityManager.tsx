import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, Briefcase, Link as LinkIcon, MapPin, DollarSign, Tag, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function OpportunityManager() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(localStorage.getItem('pmToken') || localStorage.getItem('adminToken'));
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    tags: '',
    shortDescription: '',
    payRate: '',
    applyLink: '',
    status: 'active'
  });

  const { data: fetchRes, isLoading } = useQuery({
    queryKey: ['pm-opportunities'],
    queryFn: async () => {
      const currentToken = localStorage.getItem('pmToken') || localStorage.getItem('adminToken');
      const res = await fetch('/api/pm/opportunities', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      return res.json();
    },
    enabled: !!token
  });

  const opportunities = fetchRes?.opportunities || [];

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('pmToken') || localStorage.getItem('adminToken');
      const res = await fetch('/api/pm/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Failed to create opportunity');
      return result;
    },
    onError: (err: any) => {
      alert(err.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-opportunities'] });
      setIsModalOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem('pmToken') || localStorage.getItem('adminToken');
      const res = await fetch(`/api/pm/opportunities/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Failed to update opportunity');
      return result;
    },
    onError: (err: any) => {
      alert(err.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-opportunities'] });
      setIsModalOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('pmToken') || localStorage.getItem('adminToken');
      const res = await fetch(`/api/pm/opportunities/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || 'Failed to delete opportunity');
      return result;
    },
    onError: (err: any) => {
      alert(err.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-opportunities'] });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      location: '',
      tags: '',
      shortDescription: '',
      payRate: '',
      applyLink: '',
      status: 'active'
    });
    setEditingId(null);
  };

  const handleEdit = (opp: any) => {
    setFormData({
      title: opp.title,
      location: opp.location,
      tags: opp.tags ? opp.tags.join(', ') : '',
      shortDescription: opp.shortDescription,
      payRate: opp.payRate,
      applyLink: opp.applyLink,
      status: opp.status
    });
    setEditingId(opp._id);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    if (editingId) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      if (data.user.role !== 'project_manager' && data.user.role !== 'admin') {
        throw new Error('Access denied. Project Manager role required.');
      }
      localStorage.setItem('pmToken', data.token);
      window.dispatchEvent(new Event('authChange'));
      setLoginEmail('');
      setToken(data.token);
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pmToken');
    localStorage.removeItem('adminToken');
    setToken(null);
    setLoginEmail('');
    setLoginPassword('');
    queryClient.clear();
  };

  if (!token) {
    return (
      <div className="pt-8 pb-20 max-w-md mx-auto px-4 min-h-[70vh] flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-slate-900 text-center mb-8">Opportunity Manager Login</h1>
        <form onSubmit={handleLogin} className="bg-white/95 border border-slate-200 shadow-xl rounded-3xl p-8 space-y-6">
          {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium">{loginError}</div>}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Email</label>
            <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-blue-50 border border-slate-200 rounded-xl px-4 py-3" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Password</label>
            <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-blue-50 border border-slate-200 rounded-xl px-4 py-3" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">Login to Portal</button>
        </form>
      </div>
    );
  }

  return (
    <div className="pt-8 sm:pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Opportunity Manager</h1>
          <p className="text-slate-600 mt-2 font-medium">Manage and post external opportunities (like Micro1 jobs)</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-bold"
          >
            Logout
          </button>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 font-bold"
          >
            <Plus className="w-5 h-5" />
            Add Opportunity
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No opportunities found</h3>
          <p className="text-slate-500">Create one to get started.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {opportunities.map((opp: any) => (
            <div key={opp._id} className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 flex flex-col group hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{opp.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {opp.tags?.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(opp)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if(window.confirm('Delete?')) deleteMutation.mutate(opp._id); }} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-1">{opp.shortDescription}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  {opp.payRate}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {opp.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <LinkIcon className="w-4 h-4 text-slate-400" />
                  <a href={opp.applyLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">{opp.applyLink}</a>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Status: <span className={opp.status === 'active' ? 'text-green-600' : 'text-slate-500'}>{opp.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col border border-slate-100"
            >
              <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0 z-20">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {editingId ? 'Edit Opportunity' : 'Create Opportunity'}
                  </h2>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 sm:p-8 overflow-y-auto flex-1">
                  <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-slate-900 mb-2 block">Title *</label>
                    <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-slate-800" placeholder="e.g. AI Training - Software Engineering" />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-bold text-slate-900 mb-2 block">Location *</label>
                      <input type="text" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-slate-800" placeholder="e.g. Remote (Worldwide)" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-900 mb-2 block">Pay Rate *</label>
                      <input type="text" required value={formData.payRate} onChange={e => setFormData({...formData, payRate: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-slate-800" placeholder="e.g. $30-$50/hr" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-900 mb-2 block">Tags</label>
                    <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-slate-800" placeholder="Comma separated, e.g. AI, Software Engineering, Python" />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-900 mb-2 block">Apply Link (URL) *</label>
                    <input type="url" required value={formData.applyLink} onChange={e => setFormData({...formData, applyLink: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-slate-800" placeholder="https://..." />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-900 mb-2 block">Short Description *</label>
                    <textarea required value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm min-h-[120px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-slate-800" placeholder="Brief overview of the role..." />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-900 mb-2 block">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium text-slate-800">
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  </div>
                </div>

                <div className="p-6 sm:px-8 sm:py-6 border-t border-slate-100 bg-white flex gap-4 flex-shrink-0 z-20">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 text-slate-700 font-bold hover:bg-slate-100 border-2 border-transparent hover:border-slate-200 rounded-xl transition-all">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50">
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Opportunity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
