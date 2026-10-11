import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

export default function Visualisation() {
  const navigate = useNavigate();
  const token = localStorage.getItem('pmToken') || localStorage.getItem('adminToken');

  if (!token) {
    return <Navigate to="/project-manager" replace />;
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['pm-visualisations', token],
    queryFn: async () => {
      const res = await fetch('/api/pm/visualisation-data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      return json;
    },
    enabled: !!token
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">Loading visualisations...</p>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-xl flex flex-col items-center gap-4 text-red-600">
          <div className="flex items-center gap-4">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-bold">Failed to load visualisations</h2>
          </div>
          <p className="text-sm font-medium bg-red-50 p-4 rounded-xl text-red-800 break-words max-w-full">
            {error?.message || 'Unknown error occurred'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const globalStats = data?.globalStats || {};
  const egocentricStats = data?.egocentricStats || null;

  const renderBarChart = (title: string, data: any[], xKey: string = 'name', yKey: string = 'value') => {
    if (!data || data.length === 0) return null;
    return (
      <div key={title} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-1 md:col-span-2 lg:col-span-1">
      <h3 className="font-bold text-slate-900 mb-6 text-lg">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xKey} tick={{ fill: '#64748b', fontSize: 12 }} tickMargin={10} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              cursor={{ fill: '#f1f5f9' }}
            />
            <Bar dataKey={yKey} fill="#3b82f6" radius={[4, 4, 0, 0]}>
              {data.slice(0, 10).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {data.length > 10 && <p className="text-xs text-slate-400 mt-2 text-right">Showing top 10 results</p>}
    </div>
  );
};

  const renderPieChart = (title: string, data: any[]) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-1">
      <h3 className="font-bold text-slate-900 mb-6 text-lg">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/project-manager')}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Contributors Visualisation</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Platform-wide data insights</p>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">🌎</span>
            Global Contributor Demographics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderBarChart('Countries (Top 10)', globalStats.country)}
            {renderBarChart('Native Languages', globalStats.nativeLanguage)}
            {renderBarChart('Additional Languages', globalStats.additionalLanguages)}
            {renderPieChart('How Did You Find Us?', globalStats.howDidYouFindUs)}
            {renderBarChart('Projects Interested In', globalStats.projectsInterestedIn)}
          </div>
        </div>

        {/* Egocentric Project Stats */}
        {egocentricStats && (
          <div className="pt-8 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm">📱</span>
              Egocentric Video Applications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderPieChart('Contributor Type', egocentricStats.contributorType)}
              {renderPieChart('Device Operating System', egocentricStats.deviceStats)}
              {renderPieChart('Application Status', egocentricStats.statusStats)}
              
              {egocentricStats.countryByType?.map((typeData: any) => {
                const capitalizedType = typeData.type.charAt(0).toUpperCase() + typeData.type.slice(1);
                return renderBarChart(`${capitalizedType}s by Country`, typeData.data);
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
