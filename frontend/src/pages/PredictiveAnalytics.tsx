import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  CalendarClock, 
  AlertTriangle, 
  ShieldAlert, 
  Cpu, 
  Layers, 
  Sparkles 
} from 'lucide-react';

export const PredictiveAnalytics: React.FC = () => {
  const [trends, setTrends] = useState<any>(null);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [trendRes, foreRes] = await Promise.all([
          fetch('/api/predictive/trends'),
          fetch('/api/predictive/forecasts')
        ]);

        if (trendRes.ok) setTrends(await trendRes.json());
        if (foreRes.ok) setForecasts(await foreRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <Cpu className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Predictive Maintenance Engine</span>
        </div>
        <h2 className="text-2xl font-black text-white mt-1">Predictive Campus Analytics</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Transitioning campus maintenance from reactive fire-fighting to predictive self-healing.
          Analyze recurring breakdown cycles, stress points, and forecast preventive maintenance overhauls.
        </p>
      </div>

      {/* Deep-Dive Recharts Visualizations */}
      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Incidents by Category */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">Complaints by Infrastructure Category</h4>
                <p className="text-[10px] text-slate-400">Distribution of reported mechanical & electrical defects</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.categories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                  />
                  <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Incidents by Facility Building */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">Facility Vulnerability by Building</h4>
                <p className="text-[10px] text-slate-400">Total fault incidence across campus structures</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.buildings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Turnaround Trend Timeline */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">Historical Resolution Turnaround Efficiency (Hours)</h4>
                <p className="text-[10px] text-slate-400">Mean time to remediate tickets trending downward over time</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                -41% Latency Reduction
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.timeline}>
                  <defs>
                    <linearGradient id="colorTurnaround" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="avg_turnaround_hrs" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorTurnaround)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Preventive Maintenance Failure Probability Forecasts */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white">Preventive Maintenance Schedule & Failure Forecaster</h3>
            <p className="text-xs text-slate-400">Predictive risk scoring to preemptively inspect buildings before breakdowns occur</p>
          </div>
          <span className="text-xs text-cyan-400 font-semibold">Self-Healing Campus Engine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forecasts.map(f => {
            const isHighRisk = f.failure_probability_pct >= 75;
            const isMedRisk = f.failure_probability_pct >= 40 && f.failure_probability_pct < 75;

            return (
              <div
                key={f.building_id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">{f.building_code}</span>
                    <h5 className="font-bold text-sm text-white">{f.building_name}</h5>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-black ${
                      isHighRisk ? 'text-red-400' : isMedRisk ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {f.failure_probability_pct}%
                    </span>
                    <span className="block text-[9px] text-slate-500 uppercase">Failure Risk</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Primary Vulnerability:</span>
                    <span className="text-cyan-300 font-medium">{f.primary_vulnerability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">30-Day Volume:</span>
                    <span className="text-white font-medium">{f.incident_volume_30d} incidents</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Suggested Window:</span>
                    <span className={`font-bold ${isHighRisk ? 'text-red-400' : 'text-amber-300'}`}>
                      {f.recommended_schedule}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                  {f.advisory}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
