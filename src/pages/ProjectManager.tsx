import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, Plus, Users, FileText, CreditCard, MessageSquare, ArrowLeft, Edit2, Trash2, Send, Mail, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FormattedText from '../components/FormattedText';
import SEO from '../components/SEO';
import ProjectChat from '../components/ProjectChat';
import Modal, { ModalProps } from '../components/Modal';
import { COUNTRIES } from '../utils/countries';

const initialFormState = {
  title: '', category: '', payRate: '', estimatedDuration: '', country: '',
  shortDescription: '', fullDescription: '', projectDetails: '', requirements: '', devicesRequired: '',
  eligibility: '', instructions: '', deadline: '', bannerImage: '',
  homepageVisible: false, contributorVisible: false, status: 'active'
};

export default function ProjectManager() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(localStorage.getItem('pmToken'));
  const [userStr, setUserStr] = useState(localStorage.getItem('pmUser'));
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard State
  const [activeProject, setActiveProject] = useState<any>(null);
  const [activeProjectTab, setActiveProjectTab] = useState<'overview' | 'applications' | 'submissions' | 'payments' | 'messages' | 'settings'>('overview');
  const [targetContributorId, setTargetContributorId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  // Image State
  const [includeCoverImage, setIncludeCoverImage] = useState(false);
  const [coverImageSource, setCoverImageSource] = useState<'blob' | 'public'>('blob');
  const [publicCoverImageName, setPublicCoverImageName] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  const [settingsCoverImageFile, setSettingsCoverImageFile] = useState<File | null>(null);
  const [settingsCoverImagePreview, setSettingsCoverImagePreview] = useState<string | null>(null);
  const [settingsRemoveCoverImage, setSettingsRemoveCoverImage] = useState(false);
  const [settingsIncludeCoverImage, setSettingsIncludeCoverImage] = useState(false);
  const [settingsCoverImageSource, setSettingsCoverImageSource] = useState<'blob' | 'public'>('blob');
  const [settingsPublicCoverImageName, setSettingsPublicCoverImageName] = useState('');

  const [modalConfig, setModalConfig] = useState<ModalProps>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
    variant: 'info',
    onClose: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
  });

  const showModal = (title: string, message: string, variant: 'success' | 'error' | 'info' = 'info') => {
    setModalConfig(prev => ({ ...prev, isOpen: true, title, message, variant, type: 'alert' }));
  };

  // Global Dashboard Tab
  const getInitialGlobalTab = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'contributors') return 'contributors';
    if (hash === 'approvals') return 'approvals';
    if (hash.startsWith('egocentric')) return 'egocentric';
    return 'projects';
  };
  const [globalTab, setGlobalTab] = useState<'projects' | 'contributors' | 'egocentric' | 'approvals'>(getInitialGlobalTab());
  
  const getInitialEgocentricTab = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('egocentric_')) {
      const parts = hash.split('_');
      if (parts.length >= 2) {
        const subTab = parts[1];
        if (['overview', 'applications', 'payments', 'messages', 'settings'].includes(subTab)) {
          return subTab as any;
        }
      }
    }
    return 'overview';
  };
  const [egocentricTab, setEgocentricTab] = useState<'overview' | 'applications' | 'payments' | 'messages' | 'settings'>(getInitialEgocentricTab());
  
  const { data: egoProjectData, refetch: refetchEgoProject } = useQuery({
    queryKey: ['pm-egocentric-project', token],
    queryFn: async () => {
      const res = await fetch('/api/pm/egocentric/project', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.project || null;
    },
    enabled: !!token,
    staleTime: 60 * 1000
  });

  const { data: approvalsData } = useQuery({
    queryKey: ['pm-approvals', token],
    queryFn: async () => {
      const res = await fetch('/api/pm/approvals', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.approvals || [];
    },
    enabled: !!token,
    refetchInterval: 15000,
    staleTime: 60 * 1000
  });

  const [egoPayRate, setEgoPayRate] = useState('');
  const [egoTelegramLink, setEgoTelegramLink] = useState('');
  const [egoTerms, setEgoTerms] = useState('');
  const [egoInstructions, setEgoInstructions] = useState('');
  const [isSavingEgo, setIsSavingEgo] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [globalTab, activeProjectTab, egocentricTab, activeProject]);

  useEffect(() => {
    if (egoProjectData) {
      setEgoPayRate(egoProjectData.payRate || '');
      setEgoTelegramLink(egoProjectData.telegramLink || '');
      setEgoTerms(egoProjectData.termsAndConditions || '');
      setEgoInstructions(egoProjectData.projectInstructions || '');
    }
  }, [egoProjectData]);

  const handleSaveEgoSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEgo(true);
    try {
      const res = await fetch('/api/pm/egocentric/project', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payRate: egoPayRate,
          telegramLink: egoTelegramLink,
          termsAndConditions: egoTerms,
          projectInstructions: egoInstructions
        })
      });
      const data = await res.json();
      if (data.success) {
        showModal('Success', 'Egocentric project update request sent for admin approval.', 'success');
        queryClient.invalidateQueries({ queryKey: ['pm-approvals'] });
      } else {
        showModal('Error', data.error || 'Failed to save', 'error');
      }
    } catch (err) {
      showModal('Error', 'Failed to save settings', 'error');
    } finally {
      setIsSavingEgo(false);
    }
  };

  const [notificationMsg, setNotificationMsg] = useState('');
  
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterTrustScore, setFilterTrustScore] = useState('');
  const [filterWorkStatus, setFilterWorkStatus] = useState('');
  const [filterInterestedIn, setFilterInterestedIn] = useState('');
  const [filterContributorProjectStatus, setFilterContributorProjectStatus] = useState('All');
  const [filterProjectStatus, setFilterProjectStatus] = useState('active');
  const [analysisProjectStatusFilter, setAnalysisProjectStatusFilter] = useState('active');
  const [directoryProjectOptionsFilter, setDirectoryProjectOptionsFilter] = useState('active');

  const { data: analysisData, isLoading: isAnalysisLoading } = useQuery({
    queryKey: ['pm-contributors-analysis', token],
    queryFn: async () => {
      const res = await fetch('/api/pm/contributors-analysis', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data;
    },
    enabled: !!token && globalTab === 'contributors',
    staleTime: 60 * 1000
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (targetUserIds: string[]) => {
      const res = await fetch('/api/pm/notifications/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserIds, message: notificationMsg })
      });
      if (!res.ok) throw new Error('Failed to send notifications');
    },
    onSuccess: () => {
      setNotificationMsg('');
      showModal('Success', 'Notifications sent successfully!', 'success');
    }
  });

  const { data: projectsData, isLoading: isProjectsLoading, error: projectsError } = useQuery({
    queryKey: ['pm-projects', token],
    queryFn: async () => {
      const res = await fetch('/api/pm/projects', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) handleLogout();
      const data = await res.json();
      return data.projects || [];
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      
      if (hash.startsWith('project_')) {
        const parts = hash.split('_');
        if (parts.length >= 3 && projectsData) {
          const pId = parts[1];
          const tabId = parts.slice(2).join('_');
          const proj = projectsData.find((p: any) => p._id === pId);
          if (proj) {
            setActiveProject(proj);
            setActiveProjectTab(tabId as any);
            return;
          }
        }
      } else if (hash.startsWith('egocentric')) {
        setGlobalTab('egocentric');
        setActiveProject(null);
        if (hash.startsWith('egocentric_')) {
          const parts = hash.split('_');
          if (parts.length >= 2) {
            const subTab = parts[1];
            if (['overview', 'applications', 'payments', 'messages', 'settings'].includes(subTab)) {
              setEgocentricTab(subTab as any);
            }
          }
        } else {
          setEgocentricTab('overview');
        }
      } else {
        if (hash === 'contributors') setGlobalTab('contributors');
        else setGlobalTab('projects');
        setActiveProject(null);
      }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [projectsData]);

  const { data: unreadMessagesData } = useQuery({
    queryKey: ['unread-messages', token, activeProject?._id],
    queryFn: async () => {
      const res = await fetch(`/api/user/unread-messages${activeProject ? `?projectId=${activeProject._id}` : ''}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data;
    },
    enabled: !!token && !!activeProject,
    refetchInterval: 10000,
    staleTime: 60 * 1000
  });

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
      localStorage.setItem('pmUser', JSON.stringify(data.user));
      setLoginEmail('');
      setToken(data.token);
      setUserStr(JSON.stringify(data.user));
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pmToken');
    localStorage.removeItem('pmUser');
    setToken(null);
    setUserStr(null);
    setLoginEmail('');
    setLoginPassword('');
    queryClient.clear();
    window.dispatchEvent(new Event('authChange'));
    window.location.reload();
  };

  const createMutation = useMutation({
    mutationFn: async ({ metadata, coverImage }: { metadata: any, coverImage: File | null }) => {
      let finalMetadata = { ...metadata };
      
      if (coverImage) {
        const formData = new FormData();
        formData.append('coverImage', coverImage);
        const coverRes = await fetch(`/api/pm/upload/cover`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (!coverRes.ok) throw new Error('Failed to upload cover image.');
        const coverData = await coverRes.json();
        finalMetadata.coverImage = { url: coverData.url, pathname: coverData.pathname };
      }

      const res = await fetch('/api/pm/projects', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(finalMetadata)
      });
      if (!res.ok) throw new Error('Failed to create project request');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-approvals'] });
      setIsCreating(false);
      setFormData(initialFormState);
      setCoverImageFile(null);
      setCoverImagePreview(null);
      setIncludeCoverImage(false);
      setPublicCoverImageName('');
      setCoverImageSource('blob');
      showModal('Success', 'Project creation request sent for admin approval.', 'success');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, metadata, coverImage }: { id: string, metadata: any, coverImage: File | null }) => {
      let finalMetadata = { ...metadata };
      
      if (coverImage) {
        const formData = new FormData();
        formData.append('coverImage', coverImage);
        const coverRes = await fetch(`/api/pm/upload/cover`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        if (!coverRes.ok) throw new Error('Failed to upload cover image.');
        const coverData = await coverRes.json();
        finalMetadata.coverImage = { url: coverData.url, pathname: coverData.pathname };
      }

      const res = await fetch(`/api/pm/projects/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(finalMetadata)
      });
      if (!res.ok) throw new Error('Failed to update project request');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-approvals'] });
      setSettingsCoverImageFile(null);
      setSettingsCoverImagePreview(null);
      setSettingsRemoveCoverImage(false);
      setSettingsPublicCoverImageName('');
      setSettingsCoverImageSource('blob');
      showModal('Success', 'Project update request sent for admin approval.', 'success');
    }
  });

  if (!token) {
    return (
      <div className="py-24 max-w-md mx-auto px-4 min-h-[70vh] flex flex-col justify-center">
        <SEO title="PM Login | Vision Capture" />
        <h1 className="text-3xl font-bold text-slate-900 text-center mb-8">Project Manager Portal</h1>
        <form onSubmit={handleLogin} className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl rounded-3xl p-8 space-y-6">
          {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium">{loginError}</div>}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Email</label>
            <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Password</label>
            <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">Login to Portal</button>
        </form>
      </div>
    );
  }

  const pmUser = userStr ? JSON.parse(userStr) : null;

  const filteredContributors = analysisData?.contributors?.filter((u: any) => {
    if (filterCountry) {
      const searchCountry = filterCountry.toLowerCase().trim();
      if (!(u.country || '').toLowerCase().includes(searchCountry)) return false;
    }
    if (filterLanguage) {
      const search = filterLanguage.toLowerCase().trim();
      const hasNative = (u.nativeLanguage || '').toLowerCase().includes(search);
      const additionalLangs = (u.additionalLanguage || '')
        .toLowerCase()
        .split(/[\s,;|/]+/)
        .map((l: string) => l.trim())
        .filter(Boolean);
      const hasAdditional = additionalLangs.some((lang: string) => lang.includes(search));
      if (!hasNative && !hasAdditional) return false;
    }
    if (filterProject && !u.appliedProjectIds.includes(filterProject)) return false;
    if (filterTrustScore && (u.trustScore || 0) < Number(filterTrustScore)) return false;
    if (filterInterestedIn && !u.projectsInterestedIn?.includes(filterInterestedIn)) return false;
    
    const completedList = u.completedProjectIds || [];
    const appliedList = u.appliedProjectIds || [];
    
    let matchesStatus = true;
    if (filterWorkStatus === 'Successfully Completed') {
      matchesStatus = filterProject ? completedList.includes(filterProject) : completedList.length > 0;
    } else if (filterWorkStatus === 'Working') {
      if (filterProject) {
        matchesStatus = !completedList.includes(filterProject) && appliedList.includes(filterProject);
      } else {
        matchesStatus = appliedList.some((pid: string) => !completedList.includes(pid));
      }
    }
    
    if (filterWorkStatus && !matchesStatus) return false;

    if (filterContributorProjectStatus !== 'All') {
      const hasProjectWithStatus = appliedList.some((pid: string) => {
        const projectStat = analysisData?.projectStats?.find((p: any) => p.projectId === pid);
        return projectStat && (projectStat.status || 'active') === filterContributorProjectStatus;
      });
      if (!hasProjectWithStatus) return false;
    }

    return true;
  }) || [];

  const handleSendNotification = () => {
    if (!notificationMsg.trim()) return;
    const ids = filteredContributors.map((u: any) => u._id);
    if (ids.length === 0) return showModal('No Match', 'No users match the current filters.', 'info');
    sendNotificationMutation.mutate(ids);
  };

  const handleSendMassEmail = async (users: any[]) => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      return showModal('Error', 'Subject and body are required', 'error');
    }
    setIsSendingEmail(true);
    try {
      const userIds = users.map(u => u._id);
      const res = await fetch('/api/pm/mail-contributors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userIds, subject: emailSubject, message: emailBody })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');
      showModal('Success', data.message || `Emails successfully sent to ${users.length} contributors.`, 'success');
      setIsEmailModalOpen(false);
      setEmailSubject('');
      setEmailBody('');
    } catch (err: any) {
      showModal('Error', err.message, 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-12">
      <SEO title="PM Dashboard | Vision Capture" />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Project Manager Workspace</h1>
              <p className="text-sm text-slate-500">Logged in as {pmUser?.email}</p>
            </div>
            {!activeProject && !isCreating && (
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => { setGlobalTab('projects'); window.location.hash = 'projects'; }}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${globalTab === 'projects' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Projects
                </button>
                <button 
                  onClick={() => { setGlobalTab('approvals'); window.location.hash = 'approvals'; }}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${globalTab === 'approvals' ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Pending Approvals
                  {approvalsData && approvalsData.length > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">{approvalsData.length}</span>
                  )}
                </button>
                <button 
                  onClick={() => { setGlobalTab('contributors'); window.location.hash = 'contributors'; }}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${globalTab === 'contributors' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Contributor Analysis
                </button>
                <button 
                  onClick={() => { setGlobalTab('egocentric'); window.location.hash = 'egocentric'; }}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${globalTab === 'egocentric' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Egocentric Video
                </button>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="px-4 py-2 text-sm font-bold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Logout</button>
        </div>

        {/* Global Dashboard View */}
        {!activeProject && !isCreating && globalTab === 'projects' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-900">Your Projects</h2>
                <select 
                  value={filterProjectStatus} 
                  onChange={e => setFilterProjectStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <button onClick={() => { setFormData(initialFormState); setIsCreating(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shrink-0">
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>

            {isProjectsLoading ? (
              <div className="text-center py-12 text-slate-500 font-medium">Loading projects...</div>
            ) : projectsError ? (
              <div className="text-center py-12 text-red-500 font-medium border-2 border-dashed border-red-200 rounded-xl bg-red-50">
                Failed to fetch projects. Make sure the backend server is running.
              </div>
            ) : !projectsData || projectsData.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">No Projects Found</h3>
                <p className="text-slate-500 mb-6">You haven't created any projects yet.</p>
                <button onClick={() => { setFormData(initialFormState); setIsCreating(true); }} className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">Create First Project</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projectsData?.filter((p: any) => filterProjectStatus === 'All' || p.status === filterProjectStatus).map((project: any) => (
                  <div key={project._id} onClick={() => { setActiveProject(project); setActiveProjectTab('overview'); window.location.hash = `project_${project._id}_overview`; setSettingsCoverImageFile(null); setSettingsCoverImagePreview(null); setSettingsRemoveCoverImage(false); }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${project.status === 'active' ? 'bg-green-100 text-green-700' : project.status === 'inactive' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {project.status}
                      </span>
                      <span className="text-sm font-black text-blue-600">{project.payRate}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{project.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                      <FormattedText text={project.shortDescription} />
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-medium text-slate-500">
                      <span className="text-blue-600 flex items-center gap-1 font-bold">Manage <ChevronRight className="w-4 h-4"/></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Egocentric Video View */}
        {!activeProject && !isCreating && globalTab === 'egocentric' && egoProjectData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
            {/* Header & Tabs */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white p-8 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
                  <div>
                    <span className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded-full text-sm font-bold border border-blue-500/30 mb-4 inline-block">Egocentric Data</span>
                    <h2 className="text-3xl font-display font-bold">Egocentric Video Contributors</h2>
                    <p className="text-slate-400 mt-2">Dedicated Workspace</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-slate-400 text-sm font-bold">Pay Rate</p>
                      <p className="text-2xl font-black text-green-400">{egoProjectData.payRate || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex border-t border-slate-200 bg-slate-50 p-2 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'applications', label: 'Applications' },
                  { id: 'payments', label: 'Payments' },
                  { id: 'messages', label: 'Messages' },
                  { id: 'settings', label: 'Settings' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setEgocentricTab(tab.id as any);
                      window.location.hash = `egocentric_${tab.id}`;
                    }}
                    className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${egocentricTab === tab.id ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Based on Tab */}
            {egocentricTab === 'overview' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Overview</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-slate-700 mb-2">Category</h4>
                    <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">{egoProjectData.category}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 mb-2">Pay Rate</h4>
                    <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-green-600">{egoProjectData.payRate}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-bold text-slate-700 mb-2">Live Support Link (Telegram)</h4>
                    <a href={egoProjectData.telegramLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 bg-blue-50 p-4 rounded-xl border border-blue-100 block hover:underline truncate">
                      {egoProjectData.telegramLink || 'Not set'}
                    </a>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-bold text-slate-700 mb-2">Terms and Conditions</h4>
                    <div className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                      <FormattedText text={egoProjectData.termsAndConditions || 'Not set'} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {egocentricTab === 'applications' && (
              <div className="bg-white p-0 rounded-3xl border border-slate-200 shadow-sm h-[600px] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900">Applications</h3>
                </div>
                <ProjectApplications projectId={egoProjectData._id} token={token} isEgocentric={true} />
              </div>
            )}
            
            {egocentricTab === 'settings' && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Project Settings</h3>
                <form onSubmit={handleSaveEgoSettings} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Pay Rate (e.g. 300₹ (3$))</label>
                    <input type="text" value={egoPayRate} onChange={(e) => setEgoPayRate(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Live Support Link (Telegram)</label>
                    <input type="url" value={egoTelegramLink} onChange={(e) => setEgoTelegramLink(e.target.value)} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Terms and Conditions (Consent Form)</label>
                    <textarea value={egoTerms} onChange={(e) => setEgoTerms(e.target.value)} required rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Project Instructions</label>
                    <textarea value={egoInstructions} onChange={(e) => setEgoInstructions(e.target.value)} required rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"></textarea>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button type="submit" disabled={isSavingEgo} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50">
                      {isSavingEgo ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {egocentricTab === 'payments' && (
              <div className="bg-white p-0 rounded-3xl border border-slate-200 shadow-sm h-[600px] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900">Payments</h3>
                </div>
                <ProjectPayments projectId={egoProjectData._id} token={token} />
              </div>
            )}

            {egocentricTab === 'messages' && (
              <div className="bg-white p-0 rounded-3xl border border-slate-200 shadow-sm h-[600px] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900">Messages</h3>
                </div>
                <ProjectMessages projectId={egoProjectData._id} projectName={egoProjectData.title} token={token} currentUserId={pmUser?.id || pmUser?._id} />
              </div>
            )}
          </div>
        )}

        {/* Approvals View */}
        {!activeProject && !isCreating && globalTab === 'approvals' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span> Pending Approvals
            </h2>
            {!approvalsData || approvalsData.length === 0 ? (
              <p className="text-slate-500 text-center py-10">No pending approvals.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvalsData.map((approval: any) => (
                  <div key={approval._id} className="p-6 bg-amber-50 border border-amber-200 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/50 rounded-bl-full -z-0"></div>
                    <h4 className="font-bold text-amber-900 text-lg mb-2 z-10 relative">
                      {approval.type === 'CREATE_PROJECT' ? 'New Project' : 
                       approval.type === 'UPDATE_PROJECT' ? `Update: ${approval.projectId?.title || 'Unknown'}` : 
                       'Update: Egocentric Settings'}
                    </h4>
                    <p className="text-sm text-amber-700 z-10 relative mb-4">Status: <span className="font-bold uppercase tracking-wider">{approval.status}</span></p>
                    {approval.adminNotes && (
                      <div className="text-sm text-amber-800 bg-amber-100 p-3 rounded-lg z-10 relative mb-4">
                        <strong>Admin Note:</strong> {approval.adminNotes}
                      </div>
                    )}
                    <p className="text-sm text-amber-600 mt-2 z-10 relative font-medium">Submitted: {new Date(approval.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contributor Analysis View */}
        {!activeProject && !isCreating && globalTab === 'contributors' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Applicant Count per Project</h2>
                <select 
                  value={analysisProjectStatusFilter} 
                  onChange={e => setAnalysisProjectStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              {isAnalysisLoading ? (
                <div className="text-slate-500">Loading analysis data...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analysisData?.projectStats?.filter((stat: any) => analysisProjectStatusFilter === 'All' || (stat.status || 'active') === analysisProjectStatusFilter).map((stat: any) => (
                    <div key={stat.projectId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                      <p className="text-sm font-bold text-slate-500 line-clamp-1 pr-12">{stat.title}</p>
                      <p className="text-3xl font-black text-blue-600 mt-2">{stat.applicantCount}</p>
                      <span className={`absolute top-4 right-4 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${(stat.status || 'active') === 'active' ? 'bg-green-100 text-green-700' : (stat.status || 'active') === 'inactive' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        {stat.status || 'active'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Contributor Directory</h2>
              
              <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Filter by Country</label>
                  <input type="text" value={filterCountry} onChange={e => setFilterCountry(e.target.value)} placeholder="e.g. India" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Filter by Language</label>
                  <input type="text" value={filterLanguage} onChange={e => setFilterLanguage(e.target.value)} placeholder="e.g. Hindi" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Min Trust Score</label>
                  <input type="number" min="0" value={filterTrustScore} onChange={e => setFilterTrustScore(e.target.value)} placeholder="e.g. 1" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Project List Type</label>
                  <select value={directoryProjectOptionsFilter} onChange={e => setDirectoryProjectOptionsFilter(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="active">Active Projects</option>
                    <option value="all">All Projects</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Filter by Project ID</label>
                  <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">Any Project</option>
                    {analysisData?.projectStats?.filter((stat: any) => directoryProjectOptionsFilter === 'all' || stat.status === 'active').map((stat: any) => (
                      <option key={stat.projectId} value={stat.projectId}>{stat.title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Filter by Work Status</label>
                  <select value={filterWorkStatus} onChange={e => setFilterWorkStatus(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">All Statuses</option>
                    <option value="Working">Working</option>
                    <option value="Successfully Completed">Successfully Completed</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Interested In</label>
                  <select value={filterInterestedIn} onChange={e => setFilterInterestedIn(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">Any Project Type</option>
                    <option value="Egocentric Video">Egocentric Video</option>
                    <option value="Data Annotation">Data Annotation</option>
                    <option value="Data Collection">Data Collection</option>
                    <option value="Field work Operator">Field work Operator</option>
                    <option value="Transcription">Transcription</option>
                    <option value="Audio Recording">Audio Recording</option>
                    <option value="Survey">Survey</option>
                    <option value="Image Collection">Image Collection</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Project Status</label>
                  <select value={filterContributorProjectStatus} onChange={e => setFilterContributorProjectStatus(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="All">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl mb-8">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="p-3 font-bold">Name</th>
                      <th className="p-3 font-bold">Email</th>
                      <th className="p-3">Country</th>
                      <th className="p-3">Native Language</th>
                      <th className="p-3">Trust Score</th>
                      <th className="p-3">Work Status</th>
                      <th className="p-3">UPI ID</th>
                      <th className="p-3">Applied Projects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredContributors.map((u: any) => {
                      const completedList = u.completedProjectIds || [];
                      return (
                      <tr key={u._id}>
                        <td className="p-3 font-medium text-slate-900">{u.fullName}</td>
                        <td className="p-3 text-slate-600">{u.email}</td>
                        <td className="p-3 text-slate-600">{u.country}</td>
                        <td className="p-3 text-slate-600">{u.nativeLanguage}</td>
                        <td className="p-3 font-bold text-green-600">{u.trustScore || 0}</td>
                        <td className="p-3 text-slate-600">
                          {filterProject ? (
                            completedList.includes(filterProject) ? (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Successfully Completed</span>
                            ) : (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">Working</span>
                            )
                          ) : (
                            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-bold border border-slate-200">
                              {completedList.length} / {u.appliedProjectIds.length} Completed
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-600 text-xs">{u.upiId || 'N/A'}</td>
                        <td className="p-3 text-blue-600 font-bold">{u.appliedProjectIds.length}</td>
                      </tr>
                    )})}
                    {filteredContributors.length === 0 && (
                      <tr><td colSpan={8} className="p-6 text-center text-slate-500">No contributors match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6 flex flex-col">
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Send className="w-4 h-4 text-blue-600"/> Send Targeted Notification</h3>
                    <p className="text-xs text-slate-500 mb-4">This message will be sent to the {filteredContributors.length} users currently visible in the table above.</p>
                    <textarea 
                      value={notificationMsg}
                      onChange={e => setNotificationMsg(e.target.value)}
                      placeholder="Type your notification message here..."
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm h-24 mb-4"
                    />
                    <button 
                      onClick={handleSendNotification}
                      disabled={filteredContributors.length === 0 || !notificationMsg.trim() || sendNotificationMutation.isPending}
                      className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mt-auto"
                    >
                      {sendNotificationMutation.isPending ? 'Sending...' : 'Send to Filtered Users'}
                    </button>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600"/> Send Mass Email</h3>
                    <p className="text-xs text-slate-500 mb-4">Draft an email to send to the {filteredContributors.length} users currently visible in the table above.</p>
                    <button 
                      onClick={() => setIsEmailModalOpen(true)}
                      disabled={filteredContributors.length === 0}
                      className="bg-slate-900 text-white font-bold px-6 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 mt-auto"
                    >
                      Compose Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Project View (Basic Form) */}
        {isCreating && (
          <div className="max-w-5xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl w-full">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">Create New Project</h2>
              <button onClick={() => { setIsCreating(false); setFormData(initialFormState); }} className="text-slate-400 hover:text-slate-600 p-2"><Trash2 className="w-5 h-5"/></button>
            </div>
            
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              if (includeCoverImage && coverImageSource === 'public' && !publicCoverImageName) return showModal('Error', 'Please enter a public folder image filename', 'error');
              
              const submitData = { ...formData } as any;
              if (includeCoverImage && coverImageSource === 'public') submitData.publicCoverImage = publicCoverImageName;
              
              createMutation.mutate({ metadata: submitData, coverImage: includeCoverImage && coverImageSource === 'blob' ? coverImageFile : null }); 
            }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Project Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Category</label>
                  <input required type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Pay Rate</label>
                  <input required type="text" value={formData.payRate} onChange={e => setFormData({ ...formData, payRate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Telegram Link (Optional)</label>
                  <input type="url" value={formData.telegramLink || ''} onChange={e => setFormData({ ...formData, telegramLink: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" placeholder="https://t.me/..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Deadline (Optional)</label>
                  <input type="date" value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-slate-900">Terms & Conditions (Optional)</label>
                  <textarea value={formData.termsAndConditions || ''} onChange={e => setFormData({ ...formData, termsAndConditions: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 min-h-[150px]" placeholder="Specific terms contributors must agree to before applying..." />
                </div>
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <input 
                      type="checkbox" 
                      id="includeCoverImage"
                      checked={includeCoverImage} 
                      onChange={e => {
                        setIncludeCoverImage(e.target.checked);
                        if (!e.target.checked) {
                          setCoverImageFile(null);
                          setCoverImagePreview(null);
                        }
                      }} 
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                    <label htmlFor="includeCoverImage" className="text-sm font-bold text-slate-900 cursor-pointer">
                      Add a Cover Image to this Project
                    </label>
                  </div>
                  
                  {includeCoverImage && (
                    <div className="mt-2 space-y-4">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="coverImageSource" checked={coverImageSource === 'blob'} onChange={() => setCoverImageSource('blob')} className="text-blue-600 focus:ring-blue-500 cursor-pointer" />
                          <span className="text-sm font-medium text-slate-700">Upload Image (Vercel Blob)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="coverImageSource" checked={coverImageSource === 'public'} onChange={() => setCoverImageSource('public')} className="text-blue-600 focus:ring-blue-500 cursor-pointer" />
                          <span className="text-sm font-medium text-slate-700">Use Public Folder Image</span>
                        </label>
                      </div>
                      
                      {coverImageSource === 'public' ? (
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-900">Image Filename</label>
                          <input type="text" placeholder="e.g. banner1.jpg" value={publicCoverImageName} onChange={e => setPublicCoverImageName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                          <p className="text-xs text-slate-500">The image must exist in the public folder.</p>
                        </div>
                      ) : (
                        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl relative hover:bg-slate-50 transition-colors">
                          {coverImagePreview ? (
                            <div className="relative w-full">
                              <img src={coverImagePreview} alt="Preview" className="h-48 w-full object-cover rounded-lg" />
                              <button type="button" onClick={() => { setCoverImageFile(null); setCoverImagePreview(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1 text-center">
                              <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="flex text-sm text-slate-600 justify-center">
                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                  <span>Upload a file</span>
                                  <input type="file" className="sr-only" accept="image/jpeg, image/png, image/webp" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      if (file.size > 5 * 1024 * 1024) return alert('File too large. Max 5MB.');
                                      setCoverImageFile(file);
                                      setCoverImagePreview(URL.createObjectURL(file));
                                    }
                                  }} />
                                </label>
                              </div>
                              <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Short Description</label>
                <textarea value={formData.shortDescription} onChange={e => setFormData({ ...formData, shortDescription: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 min-h-[150px]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex justify-between items-center">
                  <span>Project Details (Shown inline when expanded)</span>
                  <span className="font-normal text-xs text-slate-500">Use **text** for bold, *text* for italic</span>
                </label>
                <textarea value={formData.projectDetails} onChange={e => setFormData({ ...formData, projectDetails: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 min-h-[150px]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 flex justify-between items-center">
                  <span>Project Instructions (Shown in submissions form)</span>
                  <span className="font-normal text-xs text-slate-500">Use **text** for bold, *text* for italic</span>
                </label>
                <textarea value={formData.projectInstructions || ''} onChange={e => setFormData({ ...formData, projectInstructions: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 min-h-[150px]" placeholder="Specific instructions for how to submit work..." />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={formData.homepageVisible} onChange={e => setFormData({ ...formData, homepageVisible: e.target.checked })} className="w-5 h-5 rounded" />
                  Show on Homepage
                </label>
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={formData.contributorVisible} onChange={e => setFormData({ ...formData, contributorVisible: e.target.checked })} className="w-5 h-5 rounded" />
                  Show in Contributor Portal
                </label>
              </div>
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">{createMutation.isPending ? 'Saving...' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Project Details Inner Dashboard */}
        {activeProject && !isCreating && (
          <div className={`flex flex-col ${activeProjectTab === 'messages' ? 'h-[calc(100vh-180px)]' : 'min-h-[calc(100vh-180px)]'}`}>
            <div className="flex items-center gap-4 mb-6 shrink-0">
              <button onClick={() => { setActiveProject(null); window.location.hash = 'projects'; }} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-3xl font-bold text-slate-900">{activeProject.title}</h2>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${activeProject.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {activeProject.status}
              </span>
            </div>

            <div className="flex gap-4 mb-6 overflow-x-auto pb-2 shrink-0">
              {[
                { id: 'overview', icon: Briefcase, label: 'Overview' },
                { id: 'applications', icon: Users, label: 'Applications' },
                { id: 'submissions', icon: FileText, label: 'Submissions' },
                { id: 'payments', icon: CreditCard, label: 'Payments' },
                { id: 'messages', icon: MessageSquare, label: 'Messages' },
                { id: 'settings', icon: Edit2, label: 'Settings' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveProjectTab(tab.id as any); setTargetContributorId(null); window.location.hash = `project_${activeProject._id}_${tab.id}`; }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap relative ${activeProjectTab === tab.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                  {tab.id === 'messages' && unreadMessagesData?.hasUnread && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm shadow-red-500/50"></span>
                  )}
                </button>
              ))}
            </div>

            <div className={`flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col ${activeProjectTab === 'messages' ? 'overflow-hidden' : ''}`}>
              
              {/* INNER TAB: OVERVIEW */}
              {activeProjectTab === 'overview' && (
                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Project Overview</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-500 font-bold mb-2">Category</p>
                      <p className="text-xl font-black text-slate-900">{activeProject.category}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-500 font-bold mb-2">Pay Rate</p>
                      <p className="text-xl font-black text-green-600">{activeProject.payRate}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-500 font-bold mb-2">Live Support</p>
                      {activeProject.telegramLink ? (
                        <a href={activeProject.telegramLink} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline break-all">{activeProject.telegramLink}</a>
                      ) : (
                        <p className="text-slate-400 font-medium">Not provided</p>
                      )}
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-slate-500 font-bold mb-2">Visibility</p>
                      <p className="text-lg font-bold text-slate-700">
                        {activeProject.homepageVisible && <span className="block">🌍 Homepage</span>}
                        {activeProject.contributorVisible && <span className="block">👥 Contributor Portal</span>}
                        {!activeProject.homepageVisible && !activeProject.contributorVisible && <span className="block text-slate-400">Hidden</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* INNER TAB: APPLICATIONS */}
              {activeProjectTab === 'applications' && (
                <ProjectApplications projectId={activeProject._id} token={token} />
              )}

              {/* INNER TAB: SUBMISSIONS */}
              {activeProjectTab === 'submissions' && (
                <ProjectSubmissions 
                  projectId={activeProject._id} 
                  token={token} 
                  deadline={activeProject.deadline}
                  onAction={(action, contributorId) => {
                    setTargetContributorId(contributorId);
                    setActiveProjectTab(action === 'payment' ? 'payments' : 'messages');
                  }}
                />
              )}

              {/* INNER TAB: PAYMENTS */}
              {activeProjectTab === 'payments' && (
                <ProjectPayments projectId={activeProject._id} token={token} payRate={activeProject.payRate} targetContributorId={targetContributorId} />
              )}
              
              {/* INNER TAB: MESSAGES */}
              {activeProjectTab === 'messages' && (
                <ProjectMessages projectId={activeProject._id} projectName={activeProject.title} token={token} currentUserId={pmUser?.id || pmUser?._id} targetContributorId={targetContributorId} />
              )}

              {/* INNER TAB: SETTINGS */}
              {activeProjectTab === 'settings' && (
                <div className="p-8 overflow-y-auto">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Edit Project Details</h3>
                  <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (settingsIncludeCoverImage && settingsCoverImageSource === 'public' && !settingsPublicCoverImageName) {
                       return showModal('Error', 'Please enter a public folder image filename', 'error');
                    }

                    const formData = new FormData(e.currentTarget);
                    const metadata: Record<string, any> = {};
                    formData.forEach((value, key) => {
                      if (key !== 'coverImage') {
                        metadata[key] = value;
                      }
                    });
                    metadata.homepageVisible = formData.get('homepageVisible') === 'on';
                    metadata.contributorVisible = formData.get('contributorVisible') === 'on';
                    
                    if (settingsIncludeCoverImage && settingsCoverImageSource === 'public') {
                      metadata.publicCoverImage = settingsPublicCoverImageName;
                    } else if (settingsIncludeCoverImage && settingsRemoveCoverImage) {
                      metadata.removeCoverImage = true;
                    }

                    updateMutation.mutate({ 
                      id: activeProject._id, 
                      metadata,
                      coverImage: settingsIncludeCoverImage && settingsCoverImageSource === 'blob' ? settingsCoverImageFile : null
                    });
                  }} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Project Title</label>
                        <input name="title" defaultValue={activeProject.title} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Status</label>
                        <select name="status" defaultValue={activeProject.status} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Pay Rate</label>
                        <input name="payRate" defaultValue={activeProject.payRate} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Telegram Link</label>
                        <input name="telegramLink" defaultValue={activeProject.telegramLink} type="url" placeholder="https://t.me/..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Deadline</label>
                        <input name="deadline" type="date" defaultValue={activeProject.deadline ? new Date(activeProject.deadline).toISOString().split('T')[0] : ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-900">Terms & Conditions</label>
                        <textarea name="termsAndConditions" defaultValue={activeProject.termsAndConditions} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 min-h-[150px]" placeholder="Specific terms contributors must agree to before applying..." />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-900">Short Description</label>
                        <textarea name="shortDescription" defaultValue={activeProject.shortDescription} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 min-h-[150px]" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-900 flex justify-between items-center">
                          <span>Project Details</span>
                          <span className="font-normal text-xs text-slate-500">Use **text** for bold, *text* for italic</span>
                        </label>
                        <textarea name="projectDetails" defaultValue={activeProject.projectDetails} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 min-h-[150px]" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-900 flex justify-between items-center">
                          <span>Project Instructions (Shown in submissions form)</span>
                          <span className="font-normal text-xs text-slate-500">Use **text** for bold, *text* for italic</span>
                        </label>
                        <textarea name="projectInstructions" defaultValue={activeProject.projectInstructions} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 min-h-[150px]" placeholder="Specific instructions for how to submit work..." />
                      </div>
                      <div className="flex gap-4 md:col-span-2">
                        <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                          <input name="homepageVisible" type="checkbox" defaultChecked={activeProject.homepageVisible} className="w-5 h-5 rounded" />
                          Show on Homepage
                        </label>
                        <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                          <input name="contributorVisible" type="checkbox" defaultChecked={activeProject.contributorVisible} className="w-5 h-5 rounded" />
                          Show in Contributor Portal
                        </label>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center gap-3 mb-2">
                          <input 
                            type="checkbox" 
                            id="settingsIncludeCoverImage"
                            checked={settingsIncludeCoverImage} 
                            onChange={e => {
                              setSettingsIncludeCoverImage(e.target.checked);
                              if (!e.target.checked) {
                                setSettingsCoverImageFile(null);
                                setSettingsCoverImagePreview(null);
                                setSettingsRemoveCoverImage(false);
                              }
                            }} 
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                          />
                          <label htmlFor="settingsIncludeCoverImage" className="text-sm font-bold text-slate-900 cursor-pointer">
                            Update Cover Image
                          </label>
                        </div>

                      {settingsIncludeCoverImage && (
                        <div className="mt-2 space-y-4">
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="settingsCoverImageSource" checked={settingsCoverImageSource === 'blob'} onChange={() => setSettingsCoverImageSource('blob')} className="text-blue-600 focus:ring-blue-500 cursor-pointer" />
                              <span className="text-sm font-medium text-slate-700">Upload Image (Vercel Blob)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="settingsCoverImageSource" checked={settingsCoverImageSource === 'public'} onChange={() => setSettingsCoverImageSource('public')} className="text-blue-600 focus:ring-blue-500 cursor-pointer" />
                              <span className="text-sm font-medium text-slate-700">Use Public Folder Image</span>
                            </label>
                          </div>

                          {settingsCoverImageSource === 'public' ? (
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-slate-900">Image Filename</label>
                              <input type="text" placeholder="e.g. banner1.jpg" value={settingsPublicCoverImageName} onChange={e => setSettingsPublicCoverImageName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                              <p className="text-xs text-slate-500">The image must exist in the public folder.</p>
                            </div>
                          ) : (
                            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl relative hover:bg-slate-50 transition-colors">
                              {(settingsCoverImagePreview || (activeProject.coverImage?.url && !settingsRemoveCoverImage) || (activeProject.bannerImage && !settingsRemoveCoverImage)) ? (
                                <div className="relative w-full">
                                  <img src={settingsCoverImagePreview || activeProject.coverImage?.url || activeProject.bannerImage} alt="Preview" className="h-48 w-full object-cover rounded-lg" />
                                  <button type="button" onClick={() => { setSettingsCoverImageFile(null); setSettingsCoverImagePreview(null); setSettingsRemoveCoverImage(true); }} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-1 text-center">
                                  <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  <div className="flex text-sm text-slate-600 justify-center">
                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                      <span>Upload a file</span>
                                      <input type="file" className="sr-only" accept="image/jpeg, image/png, image/webp" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          if (file.size > 5 * 1024 * 1024) return showModal('Error', 'File too large. Max 5MB.', 'error');
                                          setSettingsCoverImageFile(file);
                                          setSettingsCoverImagePreview(URL.createObjectURL(file));
                                          setSettingsRemoveCoverImage(false);
                                        }
                                      }} />
                                    </label>
                                  </div>
                                  <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    </div>
                    <button type="submit" disabled={updateMutation.isPending} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold">
                      {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
      <Modal {...modalConfig} />

      {isEmailModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 sm:p-8 bg-slate-900 text-white relative">
              <h3 className="text-2xl font-display font-bold">Email Filtered Contributors</h3>
              <p className="text-slate-400 mt-2">Sending to {filteredContributors.length} contributor(s)</p>
              <button 
                onClick={() => setIsEmailModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g., Update on Egocentric Project"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Message Body</label>
                <textarea 
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={8}
                  placeholder="Write your message here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsEmailModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSendMassEmail(filteredContributors)}
                  disabled={isSendingEmail}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSendingEmail ? 'Sending...' : 'Send Emails'}
                  {!isSendingEmail && <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function ChevronRight(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
}

// Subcomponents for Project Tabs

function ProjectApplications({ projectId, token, isEgocentric }: { projectId: string, token: string, isEgocentric?: boolean }) {
  const queryClient = useQueryClient();
  const [filterContributorType, setFilterContributorType] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const { data: apps, isLoading } = useQuery({
    queryKey: ['pm-applications', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/applications/project/${projectId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.applications || [];
    },
    staleTime: 60 * 1000
  });

  const updateAppMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Update failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-applications'] });
      setPendingAction(null);
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    }
  });

  const [modalConfig, setModalConfig] = useState<ModalProps>({
    isOpen: false,
    title: '',
    type: 'alert',
    onClose: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
  });
  const [pendingAction, setPendingAction] = useState<{ id: string, status: string } | null>(null);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const confirmAction = (id: string, status: string) => {
    setPendingAction({ id, status });
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title: `Confirm ${status}`,
      message: `Are you sure you want to ${status.toLowerCase()} this application?`,
      onConfirm: () => updateAppMutation.mutate({ id, status }),
      onClose: () => {
        setPendingAction(null);
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  const filteredApps = apps?.filter((a: any) => {
    if (!a.contributorId) return false;
    if (isEgocentric && filterContributorType !== 'All' && a.formData?.contributorType !== filterContributorType) {
      return false;
    }
    if (isEgocentric && filterCountry !== 'All' && a.contributorId?.country !== filterCountry) {
      return false;
    }
    if (filterStatus !== 'All' && a.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const uniqueApplicantCountries = Array.from(new Set(
    (apps || []).map((a: any) => a.contributorId?.country).filter(Boolean)
  )) as string[];

  return (
    <div className="overflow-y-auto h-full p-6">
      <div className="mb-4 flex justify-end gap-4">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Statuses</option>
          <option value="Applied">Applied</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        {isEgocentric && (
          <>
            <select
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Countries</option>
              {uniqueApplicantCountries.map(code => (
                <option key={code} value={code}>
                  {COUNTRIES.find(c => c.code === code)?.name || code}
                </option>
              ))}
            </select>
            <select
              value={filterContributorType}
              onChange={e => setFilterContributorType(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Contributor Types</option>
              <option value="individual">Individual</option>
              <option value="vendor">Vendor</option>
              <option value="connections">Connections</option>
            </select>
          </>
        )}
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
          <tr>
            <th className="p-4 font-bold text-slate-900">Contributor</th>
            <th className="p-4 font-bold text-slate-900">Email</th>
            <th className="p-4 font-bold text-slate-900">Experience</th>
            <th className="p-4 font-bold text-slate-900">Status</th>
            <th className="p-4 font-bold text-slate-900 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredApps?.map((app: any) => (
            <tr key={app._id} className="hover:bg-slate-50">
              <td className="p-4 font-medium text-slate-900">{app.contributorId.fullName}</td>
              <td className="p-4 text-slate-600">{app.contributorId.email}</td>
              <td className="p-4 text-slate-600">{app.contributorId.experience || '-'}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${app.status === 'Approved' ? 'bg-green-100 text-green-700' : app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {app.status}
                </span>
              </td>
              <td className="p-4 text-right space-x-2">
                <button onClick={() => setSelectedApp(app)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200">Profile Details</button>
                {app.status === 'Applied' && (
                  <>
                    <button onClick={() => confirmAction(app._id, 'Approved')} className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600">Approve</button>
                    <button onClick={() => confirmAction(app._id, 'Rejected')} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600">Reject</button>
                  </>
                )}
                {app.status === 'Rejected' && (
                  <button onClick={() => confirmAction(app._id, 'Approved')} className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600">Approve</button>
                )}
              </td>
            </tr>
          ))}
          {filteredApps?.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No applications found.</td></tr>}
        </tbody>
      </table>
      <Modal {...modalConfig} />
      
      {/* Profile Details Modal */}
      {selectedApp && (
        <Modal
          isOpen={true}
          title="Contributor Profile & Application Details"
          type="alert"
          onClose={() => setSelectedApp(null)}
        >
          <div className="space-y-6 text-sm text-slate-700">
            <div>
              <h4 className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1">Registration Details</h4>
              <p><strong>Name:</strong> {selectedApp.contributorId.fullName}</p>
              <p><strong>Email:</strong> {selectedApp.contributorId.email}</p>
              <p><strong>Phone:</strong> {selectedApp.contributorId.phone || 'N/A'}</p>
              <p><strong>Country:</strong> {COUNTRIES.find(c => c.code === selectedApp.contributorId.country)?.name || selectedApp.contributorId.country || 'N/A'}</p>
              <p><strong>Native Language:</strong> {selectedApp.contributorId.nativeLanguage || 'N/A'}</p>
              <p><strong>Experience:</strong> {selectedApp.contributorId.experience || 'N/A'}</p>
            </div>
            {selectedApp.formData && (
              <div>
                <h4 className="font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1">Application Form Data</h4>
                <div className="space-y-1">
                  {Object.entries(selectedApp.formData).map(([key, val]) => (
                    <p key={key}><strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {String(val)}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}

function ProjectSubmissions({ projectId, token, deadline, onAction }: { projectId: string, token: string, deadline?: string, onAction?: (action: 'payment'|'message', id: string) => void }) {
  const queryClient = useQueryClient();
  const [modalConfig, setModalConfig] = useState<ModalProps>({
    isOpen: false,
    title: '',
    type: 'alert',
    onClose: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
  });
  const [pendingAction, setPendingAction] = useState<{ id: string, status: string } | null>(null);

  const { data: subs, isLoading } = useQuery({
    queryKey: ['pm-submissions', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/submissions/project/${projectId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      return data.submissions || [];
    },
    staleTime: 60 * 1000
  });

  const updateSubMutation = useMutation({
    mutationFn: async ({ id, status, feedback }: { id: string, status: string, feedback?: string }) => {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, feedback })
      });
      if (!res.ok) throw new Error('Update failed');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pm-submissions'] })
  });

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="overflow-y-auto h-full p-6">
      {deadline && (
        <div className="mb-6 flex justify-end">
          <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-lg text-sm border border-red-100 shadow-sm">
            Project Deadline: {new Date(deadline).toLocaleDateString()}
          </span>
        </div>
      )}
      <div className="space-y-4">
        {subs?.filter((s: any) => s.contributorId).map((sub: any) => (
          <div key={sub._id} className="p-6 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900">{sub.contributorId.fullName}</span>
                <span className="text-sm text-slate-500">({sub.contributorId.email})</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">External ID:</span>
                <p className="font-medium text-slate-800">{sub.externalProjectId}</p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Link:</span>
                <p><a href={sub.submissionLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{sub.submissionLink}</a></p>
              </div>
              {sub.notes && (
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">Notes:</span>
                  <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">{sub.notes}</p>
                </div>
              )}
            </div>
            
            <div className="lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 flex flex-col">
              <div className="mb-4">
                <span className="text-sm font-bold text-slate-900 block mb-1">Status</span>
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${sub.status === 'Approved' || sub.status === 'Completed' ? 'bg-green-100 text-green-700' : sub.status === 'Rework Required' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {sub.status}
                </span>
              </div>
              
              <div className="space-y-2 mt-auto">
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold"
                  onChange={(e) => {
                    const status = e.target.value;
                    const subId = sub._id;
                    if (status === 'Rework Required') {
                      setPendingAction({ id: subId, status });
                      setModalConfig(prev => ({
                        ...prev,
                        isOpen: true,
                        title: 'Feedback Required',
                        message: 'Please provide feedback detailing what needs to be reworked:',
                        type: 'prompt',
                        promptPlaceholder: 'Enter feedback for rework...',
                        confirmText: 'Submit Feedback',
                        variant: 'warning',
                        onConfirm: (inputValue) => {
                          if (inputValue) {
                            updateSubMutation.mutate({ id: subId, status, feedback: inputValue });
                          }
                          setPendingAction(null);
                        }
                      }));
                    } else {
                      setPendingAction({ id: subId, status });
                      setModalConfig(prev => ({
                        ...prev,
                        isOpen: true,
                        title: 'Confirm Status Change',
                        message: `Are you sure you want to change the status to ${status}?`,
                        type: 'confirm',
                        confirmText: 'Yes, Change Status',
                        variant: 'info',
                        onConfirm: () => {
                          updateSubMutation.mutate({ id: subId, status, feedback: '' });
                          setPendingAction(null);
                        }
                      }));
                    }
                  }}
                  value={pendingAction?.id === sub._id ? pendingAction.status : sub.status}
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rework Required">Rework Required</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </select>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => onAction && onAction('payment', sub.contributorId._id)} className="flex-1 bg-slate-900 text-white text-[11px] font-bold py-2 rounded-lg hover:bg-slate-800 transition-colors">Record Payment</button>
                  <button onClick={() => onAction && onAction('message', sub.contributorId._id)} className="flex-1 bg-slate-100 text-slate-700 text-[11px] font-bold py-2 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200">Message</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {subs?.length === 0 && <div className="text-center p-8 text-slate-500">No submissions yet.</div>}
      </div>
      <Modal {...modalConfig} />
    </div>
  )
}

function ProjectPayments({ projectId, token, payRate, targetContributorId }: { projectId: string, token: string, payRate?: string, targetContributorId?: string | null }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [contributorId, setContributorId] = useState(targetContributorId || '');
  const [status, setStatus] = useState('Pending');
  
  const [modalConfig, setModalConfig] = useState<ModalProps>({
    isOpen: false,
    title: '',
    type: 'alert',
    onClose: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
  });
  const [pendingPayment, setPendingPayment] = useState<{ id: string, status: string } | null>(null);
  
  const maxAmount = payRate ? parseInt(payRate.replace(/\D/g, '')) || Infinity : Infinity;
  const isAmountValid = amount === '' || Number(amount) <= maxAmount;

  const { data: subs } = useQuery({ queryKey: ['pm-submissions', projectId], queryFn: async () => (await fetch(`/api/submissions/project/${projectId}`, { headers: { 'Authorization': `Bearer ${token}` } })).json().then(d => d.submissions || []), staleTime: 60 * 1000 });
  const { data: payments } = useQuery({ queryKey: ['pm-payments', projectId], queryFn: async () => (await fetch(`/api/payments/project/${projectId}`, { headers: { 'Authorization': `Bearer ${token}` } })).json().then(d => d.payments || []), staleTime: 60 * 1000 });

  const createPayment = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ projectId, contributorId, amount: Number(amount), status, remarks: '' }) });
      if (!res.ok) throw new Error('Failed to record payment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-payments'] });
      setAmount(''); setContributorId('');
    }
  });

  const updatePaymentStatus = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string, newStatus: string }) => {
      const res = await fetch(`/api/payments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status: newStatus }) });
      if (!res.ok) throw new Error('Failed to update');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pm-payments'] })
  });

  const completedSubs = subs?.filter((s: any) => s.status === 'Completed' && s.contributorId) || [];

  return (
    <div className="flex flex-col h-full lg:flex-row">
      <div className="lg:w-1/3 p-6 border-r border-slate-100 bg-slate-50/50 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-slate-900">Record New Payment</h4>
          {payRate && <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">{payRate}</span>}
        </div>
        <div className="space-y-4">
          <select value={contributorId} onChange={e => setContributorId(e.target.value)} disabled={!!targetContributorId} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm disabled:opacity-50">
            <option value="">Select Contributor (Completed only)</option>
            {completedSubs.map((s: any) => (
              <option key={s.contributorId._id} value={s.contributorId._id}>{s.contributorId.fullName} ({s.contributorId.email})</option>
            ))}
          </select>
          <div>
            <input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} className={`w-full bg-white border ${!isAmountValid ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-2 text-sm`} />
            {!isAmountValid && maxAmount !== Infinity && <p className="text-xs text-red-500 mt-1">Amount cannot exceed project pay rate (₹{maxAmount}).</p>}
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm">
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
          </select>
          <button onClick={() => createPayment.mutate()} disabled={!contributorId || !amount || !isAmountValid || createPayment.isPending} className="w-full bg-slate-900 text-white font-bold py-2 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-opacity">Record Payment</button>
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto">
        <h4 className="font-bold text-slate-900 mb-4">Payment Records</h4>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="pb-3">Contributor</th>
              <th className="pb-3">UPI ID</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments?.filter((p: any) => p.contributorId).map((p: any) => (
              <tr key={p._id}>
                <td className="py-3 font-medium">{p.contributorId.fullName}</td>
                <td className="py-3 font-mono text-xs">{p.contributorId.upiId || 'Not set'}</td>
                <td className="py-3 font-bold text-slate-900">₹{p.amount}</td>
                <td className="py-3">
                  <select 
                    value={pendingPayment?.id === p._id ? pendingPayment.status : p.status} 
                    onChange={e => {
                      const newStatus = e.target.value;
                      setPendingPayment({ id: p._id, status: newStatus });
                      setModalConfig(prev => ({
                        ...prev,
                        isOpen: true,
                        title: 'Confirm Status Change',
                        message: `Are you sure you want to change the payment status for ${p.contributorId.fullName} to ${newStatus}?`,
                        type: 'confirm',
                        confirmText: 'Yes, Change Status',
                        variant: 'warning',
                        onConfirm: () => {
                          updatePaymentStatus.mutate({ id: p._id, newStatus });
                          setPendingPayment(null);
                        },
                        onClose: () => {
                          setPendingPayment(null);
                          setModalConfig(prev => ({ ...prev, isOpen: false }));
                        }
                      }));
                    }}
                    className={`text-xs font-bold px-2 py-1 rounded-md border-0 outline-none ${p.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Paid</option>
                  </select>
                </td>
              </tr>
            ))}
            {payments?.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-500">No payment records yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal {...modalConfig} />
    </div>
  )
}

function ProjectMessages({ projectId, projectName, token, currentUserId, targetContributorId }: { projectId: string, projectName: string, token: string, currentUserId: string, targetContributorId?: string | null }) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const { data: apps } = useQuery({ 
    queryKey: ['pm-applications', projectId], 
    queryFn: async () => (await fetch(`/api/applications/project/${projectId}`, { headers: { 'Authorization': `Bearer ${token}` } })).json().then(d => d.applications || []),
    staleTime: 60 * 1000
  });

  const { data: unreadData } = useQuery({
    queryKey: ['unread-messages', token, projectId],
    queryFn: async () => (await fetch(`/api/user/unread-messages?projectId=${projectId}`, { headers: { 'Authorization': `Bearer ${token}` } })).json(),
    refetchInterval: 10000,
    staleTime: 60 * 1000
  });

  useEffect(() => {
    if (targetContributorId && apps) {
      const targetApp = apps.find((a: any) => a.contributorId && a.contributorId._id === targetContributorId);
      if (targetApp) {
        setSelectedUser(targetApp.contributorId);
      }
    }
  }, [targetContributorId, apps]);

  if (selectedUser) {
    return <ProjectChat projectId={projectId} projectName={projectName} token={token} currentUserId={currentUserId} receiverId={selectedUser._id} receiverName={selectedUser.fullName} receiverEmail={selectedUser.email} onBack={() => setSelectedUser(null)} />
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h4 className="font-bold text-slate-900 mb-4">Select a Contributor to Message</h4>
      <div className="space-y-2">
        {apps?.filter((a: any) => a.contributorId).map((app: any) => {
          const hasUnread = unreadData?.unreadSenderIds?.includes(app.contributorId._id);
          return (
            <button 
              key={app.contributorId._id}
              onClick={() => setSelectedUser(app.contributorId)}
              className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-300 transition-colors"
            >
              <div className="text-left flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg">
                    {app.contributorId.fullName.charAt(0).toUpperCase()}
                  </div>
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                    {app.contributorId.fullName}
                  </p>
                  <p className="text-sm text-slate-500">{app.contributorId.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasUnread && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">New Message</span>}
                <MessageSquare className={`w-5 h-5 ${hasUnread ? 'text-blue-500' : 'text-slate-400'}`} />
              </div>
            </button>
          );
        })}
        {apps?.length === 0 && <p className="text-slate-500 text-center py-8">No applicants found for this project.</p>}
      </div>
    </div>
  );
}
