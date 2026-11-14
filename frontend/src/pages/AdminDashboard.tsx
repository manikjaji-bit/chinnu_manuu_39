import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Users, 
  Download, 
  RotateCcw, 
  Clock, 
  Wrench, 
  Sparkles,
  Building2,
  FileText,
  Layers,
  ArrowUpRight,
  TrendingUp,
  X
} from 'lucide-react';
import { CampusHealthScore, Complaint, RecurringHotspot, ResourceSuggestion } from '../types';
import { CampusHealthCard } from '../components/CampusHealthCard';
import { ResolutionVerificationModal } from '../components/ResolutionVerificationModal';

export const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [healthScore, setHealthScore] = useState<CampusHealthScore | null>(null);
  const [hotspots, setHotspots] = useState<RecurringHotspot[]>([]);
  const [resourceSuggestions, setResourceSuggestions] = useState<ResourceSuggestion[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeComplaints, setActiveComplaints] = useState<Complaint[]>([]);
  
  const [selectedForVerification, setSelectedForVerification] = useState<Complaint | null>(null);
  const [reassignModalComplaint, setReassignModalComplaint] = useState<Complaint | null>(null);

  // Override Form & Feedback
  const [overrideDeptId, setOverrideDeptId] = useState<number>(1);
  const [overridePriority, setOverridePriority] = useState<number>(75);
  const [overrideLoading, setOverrideLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);

  const fetchAdminData = async () => {
    try {
      const [ovRes, hsRes, spotRes, resSugRes, logsRes, compsRes, deptRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/health-score'),
        fetch('/api/predictive/recurring-hotspots'),
        fetch('/api/admin/resource-suggestions'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/complaints/'),
        fetch('/api/campus/departments')
      ]);

      if (ovRes.ok) setOverview(await ovRes.json());
      if (hsRes.ok) setHealthScore(await hsRes.json());
      if (spotRes.ok) setHotspots(await spotRes.json());
      if (resSugRes.ok) setResourceSuggestions(await resSugRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());
      if (compsRes.ok) setActiveComplaints(await compsRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleExportReport = async () => {
    try {
      const res = await fetch('/api/admin/export-report');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CampusGuardian_AuditReport_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecuteOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignModalComplaint) return;

    setOverrideLoading(true);
    try {
      const token = localStorage.getItem('cg_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/admin/override-assignment/${reassignModalComplaint.id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          department_id: Number(overrideDeptId),
          priority_score: Number(overridePriority)
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setActiveComplaints(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
        setReassignModalComplaint(null);
        setToastMessage(`Work Order #${reassignModalComplaint.id} override applied successfully!`);
        setTimeout(() => setToastMessage(null), 4000);
        fetchAdminData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Override failed: ${err.detail || 'Could not update assignment'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Network error executing override: ${e.message}`);
    } finally {
      setOverrideLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg shadow-emerald-950/50">
          <span className="flex items-center space-x-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white font-bold ml-4">✕</button>
        </div>
      )}

      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/60">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Chief Administrator Executive Portal</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Campus Intelligence Dashboard</h2>
          <p className="text-xs text-slate-400">Holistic facility performance, recurring failure detectors, and automated routing controls.</p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-all flex items-center space-x-2 shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Audit Report</span>
        </button>
      </div>

      {/* Campus Health Score Card (Feature A) */}
      <CampusHealthCard healthScore={healthScore} onRefresh={fetchAdminData} />

      {/* Executive KPI Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="glass-panel rounded-2xl p-4 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Recorded</span>
            <span className="text-2xl font-black text-white mt-1 block">{overview.total_complaints}</span>
            <span className="text-[10px] text-slate-500">Historical campus ledger</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-blue-400 block">Active Tickets</span>
            <span className="text-2xl font-black text-blue-300 mt-1 block">{overview.active_complaints}</span>
            <span className="text-[10px] text-slate-500">In dispatch & repair</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-red-900/40 bg-red-950/20">
            <span className="text-[10px] uppercase font-bold text-red-400 block">Critical Hazards</span>
            <span className="text-2xl font-black text-red-400 mt-1 block">{overview.critical_incidents}</span>
            <span className="text-[10px] text-red-300">Requires rapid response</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-emerald-900/40 bg-emerald-950/20">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Resolved</span>
            <span className="text-2xl font-black text-emerald-300 mt-1 block">{overview.resolved_complaints}</span>
            <span className="text-[10px] text-emerald-400">Verified remediated</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 border border-slate-800 col-span-2 lg:col-span-1">
            <span className="text-[10px] uppercase font-bold text-cyan-400 block">Avg Resolution</span>
            <span className="text-2xl font-black text-cyan-300 mt-1 block">{overview.avg_resolution_hours}h</span>
            <span className="text-[10px] text-slate-500">SLA target &lt; 24h</span>
          </div>
        </div>
      )}

      {/* 2-Column Section: Recurring Problem Detector + Smart Resource Planning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* FEATURE B: RECURRING PROBLEM DETECTOR */}
        <div className="glass-panel rounded-3xl p-5 border border-purple-900/50 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-white">Recurring Problem Detector</h3>
                <p className="text-[10px] text-slate-400">Clusters multi-incident failures in identical locations</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-400 border border-purple-800">
              {hotspots.length} hotspots active
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {hotspots.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No recurring hotspot breaches detected.</p>
            ) : (
              hotspots.map((h, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{h.building_name} • {h.room}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
                      {h.complaint_count} repeat complaints
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{h.insight}</p>
                  <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-900/40 text-[11px] text-purple-300">
                    <strong>Preventative Action:</strong> {h.recommendation}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FEATURE E: SMART RESOURCE PLANNING */}
        <div className="glass-panel rounded-3xl p-5 border border-cyan-900/50 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-white">Smart Resource Planning</h3>
                <p className="text-[10px] text-slate-400">Estimates repair effort & staffing allocations</p>
              </div>
            </div>
            <span className="text-[10px] text-cyan-400 font-semibold">AI Workload Balancer</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {resourceSuggestions.map((res, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{res.department_name}</span>
                  <div className="flex space-x-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {res.open_tickets} tickets ({res.estimated_effort_hours}h effort)
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      res.urgency === 'High' ? 'bg-red-950 text-red-400 border-red-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {res.urgency}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-cyan-200 leading-relaxed bg-cyan-950/30 p-2 rounded-xl border border-cyan-900/40">
                  {res.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Active Incidents Table & Override Actions */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white">All Active Campus Tickets</h3>
            <p className="text-xs text-slate-400">Real-time status, department routing, and administrator override</p>
          </div>
          <span className="text-xs text-slate-400">{activeComplaints.length} tickets loaded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Ticket</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeComplaints.map(c => {
                const isCritical = c.severity === 'Critical';

                return (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{c.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">#{c.id}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800 font-medium">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {c.building?.name} <span className="text-slate-500">• {c.room}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                        isCritical ? 'text-red-400' : c.priority_score >= 70 ? 'text-amber-400' : 'text-cyan-300'
                      }`}>
                        {c.priority_score}/100
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.status === 'Resolved' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                        c.status === 'Awaiting Verification' ? 'bg-purple-950 text-purple-400 border-purple-800 animate-pulse' :
                        'bg-blue-950 text-cyan-300 border-blue-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      {c.evidence && (
                        <button
                          onClick={() => setSelectedForVerification(c)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 text-[11px] font-semibold"
                        >
                          Verify Proof
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setReassignModalComplaint(c);
                          setOverrideDeptId(c.department_id || (departments.length > 0 ? departments[0].id : 1));
                          setOverridePriority(c.priority_score);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-[11px] font-medium"
                      >
                        Override
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Campus Audit Logs */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3">
        <h4 className="font-bold text-sm text-white">Live System Audit Logs</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-[11px]">
          {auditLogs.map(log => (
            <div key={log.id} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="text-cyan-400 font-bold">[{log.action}]</span>
                <span className="text-slate-300">{log.details}</span>
              </div>
              <span className="text-[10px] text-slate-600 shrink-0">
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Administrator Override Modal */}
      {reassignModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl p-6 relative">
            <button
              onClick={() => setReassignModalComplaint(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">Override Work Order #{reassignModalComplaint.id}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{reassignModalComplaint.title}</p>

            <form onSubmit={handleExecuteOverride} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Reassign Department</label>
                <select
                  value={overrideDeptId}
                  onChange={e => setOverrideDeptId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.active_workload} active)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Override Priority Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overridePriority}
                  onChange={e => setOverridePriority(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReassignModalComplaint(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={overrideLoading}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50"
                >
                  {overrideLoading ? 'Updating...' : 'Confirm Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Verification Modal */}
      {selectedForVerification && (
        <ResolutionVerificationModal
          complaint={selectedForVerification}
          onClose={() => setSelectedForVerification(null)}
          onSignoffSuccess={() => fetchAdminData()}
        />
      )}

    </div>
  );
};
