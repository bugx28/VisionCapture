import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import SEO from '../components/SEO';

export default function Leaderboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['referral-leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/public/leaderboard');
      const data = await res.json();
      return data.leaderboard || [];
    }
  });

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 border-amber-300 shadow-amber-500/20';
      case 2:
        return 'bg-gradient-to-r from-slate-100 to-slate-200 border-slate-300 shadow-slate-500/20';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300 shadow-orange-500/20';
      default:
        return 'bg-white border-slate-200';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-8 h-8 text-amber-500 drop-shadow" />;
      case 2: return <Medal className="w-8 h-8 text-slate-400 drop-shadow" />;
      case 3: return <Medal className="w-8 h-8 text-orange-400 drop-shadow" />;
      default: return <Award className="w-6 h-6 text-blue-300" />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-12">
      <SEO title="Referral Leaderboard | Vision Capture" description="Top contributors leaderboard and monthly prizes." />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-amber-100 rounded-full mb-6">
            <Trophy className="w-12 h-12 text-amber-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 mb-6">Monthly Referral Leaderboard</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Invite friends to contribute and earn big prizes every month. The top referrers win cash bonuses!
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-sm font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-4">Contributor</div>
              <div className="col-span-3 text-center">Referrals</div>
              <div className="col-span-3 text-right">Prize</div>
            </div>

            {data?.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">No Referrals Yet</h3>
                <p className="text-slate-500">Be the first to get on the leaderboard this month!</p>
              </div>
            ) : (
              data?.map((entry: any) => (
                <div 
                  key={entry.userId} 
                  className={`grid sm:grid-cols-12 gap-4 items-center p-4 sm:p-6 rounded-2xl border shadow-lg transition-transform hover:-translate-y-1 ${getRankStyle(entry.rank)}`}
                >
                  <div className="col-span-12 sm:col-span-2 flex items-center justify-center gap-2">
                    <div className="w-12 h-12 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm font-black text-xl text-slate-700">
                      #{entry.rank}
                    </div>
                  </div>
                  
                  <div className="col-span-12 sm:col-span-4 flex items-center justify-center sm:justify-start gap-3">
                    {getRankIcon(entry.rank)}
                    <span className="font-bold text-lg text-slate-900">{entry.name}</span>
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider sm:hidden mb-1">Referrals</span>
                    <span className="text-2xl font-black text-blue-600">{entry.count}</span>
                  </div>
                  
                  <div className="col-span-6 sm:col-span-3 flex flex-col items-end justify-center">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider sm:hidden mb-1">Prize</span>
                    <span className={`text-xl font-black ${entry.prizeAmount > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                      {entry.prizeAmount > 0 ? `₹${entry.prizeAmount.toLocaleString()}` : '-'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
