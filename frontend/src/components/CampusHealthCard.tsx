import React, { useState } from 'react';
import { Activity, ShieldCheck, AlertCircle, Info, TrendingUp, HelpCircle } from 'lucide-react';
import { CampusHealthScore } from '../types';

interface CampusHealthCardProps {
  healthScore: CampusHealthScore | null;
  onRefresh?: () => void;
}

export const CampusHealthCard: React.FC<CampusHealthCardProps> = ({ healthScore }) => {
  const [showFormula, setShowFormula] = useState(false);

  if (!healthScore) {
    return (
      <div className="glass-panel rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-800 rounded w-1/2"></div>
      </div>
    );
  }

  const score = healthScore.score;
  const isHealthy = score >= 75;
  const isModerate = score >= 50 && score < 75;

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 opacity-30 ${
        isHealthy ? 'bg-cyan-500' : isModerate ? 'bg-amber-500' : 'bg-red-500'
      }`} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Campus Health Score</span>
            <button 
              onClick={() => setShowFormula(!showFormula)}
              className="text-slate-400 hover:text-cyan-300 transition-colors"
              title="View transparent algorithmic calculation"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex items-baseline space-x-2">
            <span>{score}</span>
            <span className="text-sm text-slate-400 font-normal">/ 100</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              isHealthy 
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                : isModerate
                ? 'bg-amber-950/80 text-amber-400 border-amber-800/60'
                : 'bg-red-950/80 text-red-400 border-red-800/60'
            }`}>
              {score >= 85 ? 'Excellent' : score >= 70 ? 'Nominal' : score >= 50 ? 'Attention Needed' : 'Critical'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            {healthScore.calculation_summary}
          </p>
        </div>

        {/* Quick telemetry pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full sm:w-auto text-xs">
          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block">Open Issues</span>
            <span className="font-bold text-white text-sm">{healthScore.total_open_complaints}</span>
            <span className="text-[10px] text-red-400 block mt-0.5">{healthScore.open_complaints_impact} pts</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block">Critical Risks</span>
            <span className="font-bold text-amber-400 text-sm">{healthScore.total_critical_incidents}</span>
            <span className="text-[10px] text-amber-400 block mt-0.5">{healthScore.critical_incidents_impact} pts</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block">Avg Turnaround</span>
            <span className="font-bold text-cyan-300 text-sm">{healthScore.avg_resolution_hours}h</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">+4.0 bonus</span>
          </div>
        </div>
      </div>

      {/* Algorithmic Formula Explainer Drawer */}
      {showFormula && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300 bg-slate-950/50 p-4 rounded-xl border border-slate-800 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-semibold text-white mb-2">
            <span>Mathematical Health Score Formulation</span>
            <span className="text-cyan-400 font-mono">100 - Penalties + Prevention</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
            <div className="space-y-1">
              <p>• Base Score: <span className="text-white">100.0</span></p>
              <p>• Active Queue Penalty: <span className="text-red-400">{healthScore.open_complaints_impact}</span> ({healthScore.total_open_complaints} × 1.5 pts)</p>
              <p>• Critical Incidents Penalty: <span className="text-red-400">{healthScore.critical_incidents_impact}</span> ({healthScore.total_critical_incidents} × 8.0 pts)</p>
            </div>
            <div className="space-y-1">
              <p>• Latency Lag Penalty: <span className="text-amber-400">{healthScore.resolution_time_impact}</span> (&gt;24h delta)</p>
              <p>• Recurring Hotspots Penalty: <span className="text-amber-400">{healthScore.recurring_problems_impact}</span> ({healthScore.recurring_hotspot_count} × 4.0 pts)</p>
              <p>• Preventative Inspection Offset: <span className="text-emerald-400">+{healthScore.preventive_maintenance_impact}</span></p>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 italic">
            Dynamically recalculates in real-time as tasks are resolved, verified, or newly reported across campus.
          </p>
        </div>
      )}
    </div>
  );
};
