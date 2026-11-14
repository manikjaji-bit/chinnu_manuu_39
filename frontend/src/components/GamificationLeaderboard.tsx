import React, { useEffect, useState } from 'react';
import { Award, Trophy, Star, ShieldCheck, Flame, UserCheck } from 'lucide-react';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';

export const GamificationLeaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/auth/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [user]);

  const getRankBadge = (score: number) => {
    if (score >= 200) return { title: 'Campus Champion', color: 'text-amber-400 bg-amber-950/80 border-amber-700' };
    if (score >= 100) return { title: 'Campus Guardian', color: 'text-cyan-400 bg-cyan-950/80 border-cyan-700' };
    if (score >= 50) return { title: 'Sentinel', color: 'text-blue-400 bg-blue-950/80 border-blue-700' };
    return { title: 'Scout', color: 'text-slate-400 bg-slate-900 border-slate-700' };
  };

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Student Impact Leaderboard</h3>
            <p className="text-xs text-slate-400">Honoring students proactively keeping our campus safe</p>
          </div>
        </div>

        {user && user.role === 'student' && (
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Your Score</span>
            <span className="text-lg font-black text-amber-400">{user.impact_score} pts</span>
          </div>
        )}
      </div>

      {/* Rules & Rewards Explanation */}
      <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="flex items-center space-x-2">
          <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span><strong>+25 pts</strong> for verified safety hazards</span>
        </div>
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span><strong>+15 pts</strong> for confirming repair signoffs</span>
        </div>
        <div className="flex items-center space-x-2">
          <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>Duplicate reports earn <strong>0 pts</strong></span>
        </div>
      </div>

      {/* Ranking List */}
      <div className="mt-4 space-y-2.5">
        {loading ? (
          <p className="text-xs text-slate-500 text-center py-4">Loading student rankings...</p>
        ) : (
          leaderboard.map((student, idx) => {
            const badge = getRankBadge(student.impact_score);
            const isCurrentUser = user?.id === student.id;

            return (
              <div
                key={student.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isCurrentUser
                    ? 'bg-blue-950/40 border-cyan-500/60 shadow-lg shadow-cyan-900/20'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Rank Number */}
                  <span className={`w-6 text-center font-bold text-xs ${
                    idx === 0 ? 'text-amber-400 text-sm' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    #{idx + 1}
                  </span>

                  {/* Avatar */}
                  <img
                    src={student.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={student.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />

                  {/* Student Details */}
                  <div>
                    <h5 className="font-semibold text-xs text-white flex items-center space-x-1.5">
                      <span>{student.full_name}</span>
                      {isCurrentUser && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          You
                        </span>
                      )}
                    </h5>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full border inline-block mt-0.5 ${badge.color}`}>
                      {badge.title}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-white">{student.impact_score}</span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">points</span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
