import React, { useState, useEffect, useRef } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Upload, 
  Sparkles, 
  ShieldAlert, 
  CheckSquare, 
  FileCheck, 
  Building2,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import { Complaint, ResolutionEvidence } from '../types';
import { useAuth } from '../context/AuthContext';
import { ResolutionVerificationModal } from '../components/ResolutionVerificationModal';

export const MaintenanceDashboard: React.FC = () => {
  const { user } = useAuth();
  const [kanban, setKanban] = useState<{
    Assigned: Complaint[];
    'In Progress': Complaint[];
    'Awaiting Verification': Complaint[];
    Resolved: Complaint[];
  }>({
    Assigned: [],
    'In Progress': [],
    'Awaiting Verification': [],
    Resolved: []
  });

  const [loading, setLoading] = useState(true);
  const [selectedTaskForEvidence, setSelectedTaskForEvidence] = useState<Complaint | null>(null);
  const [selectedTaskForVerification, setSelectedTaskForVerification] = useState<Complaint | null>(null);

  // Evidence Form State
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null);
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [parts, setParts] = useState('');
  const [hours, setHours] = useState('1.5');
  const [submittingEvidence, setSubmittingEvidence] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getHeaders = (contentType = 'application/json') => {
    const token = localStorage.getItem('cg_token');
    const h: Record<string, string> = {};
    if (contentType) h['Content-Type'] = contentType;
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/maintenance/kanban', {
        headers: getHeaders('')
      });
      if (res.ok) {
        const data = await res.json();
        setKanban(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleAcceptTask = async (complaintId: number) => {
    try {
      const res = await fetch(`/api/maintenance/accept/${complaintId}`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        setToastMsg(`Work Order #${complaintId} accepted! Status moved to "In Progress".`);
        setTimeout(() => setToastMsg(null), 4000);
        fetchTasks();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to accept task: ${err.detail || 'Permission denied'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Network error accepting task: ${e.message}`);
    }
  };

  const handleEvidenceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAfterImageFile(file);
      setAfterImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForEvidence || !notes) return;

    setSubmittingEvidence(true);
    try {
      let finalAfterUrl = afterImagePreview || 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800';

      // Upload image first if local file selected
      if (afterImageFile) {
        const uploadData = new FormData();
        uploadData.append('file', afterImageFile);
        const upRes = await fetch('/api/complaints/upload-photo', {
          method: 'POST',
          headers: getHeaders(''),
          body: uploadData
        });
        if (upRes.ok) {
          const upJson = await upRes.json();
          finalAfterUrl = upJson.url;
        }
      }

      const res = await fetch(`/api/complaints/${selectedTaskForEvidence.id}/upload-evidence`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          after_image_url: finalAfterUrl,
          maintenance_notes: notes,
          work_duration_hours: parseFloat(hours) || 1.5,
          parts_replaced: parts || null
        })
      });

      if (res.ok) {
        setToastMsg(`Resolution evidence submitted for #${selectedTaskForEvidence.id}! AI Verification initiated.`);
        setTimeout(() => setToastMsg(null), 4000);
        setSelectedTaskForEvidence(null);
        setNotes('');
        setParts('');
        setAfterImageFile(null);
        setAfterImagePreview(null);
        fetchTasks();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Evidence submission failed: ${err.detail || 'Server error'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Network error submitting evidence: ${e.message}`);
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const columns: { title: keyof typeof kanban; badgeColor: string }[] = [
    { title: 'Assigned', badgeColor: 'bg-blue-950 text-blue-400 border-blue-800' },
    { title: 'In Progress', badgeColor: 'bg-amber-950 text-amber-400 border-amber-800' },
    { title: 'Awaiting Verification', badgeColor: 'bg-purple-950 text-purple-400 border-purple-800' },
    { title: 'Resolved', badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg shadow-emerald-950/50">
          <span className="flex items-center space-x-2">
            <span>✓</span>
            <span>{toastMsg}</span>
          </span>
          <button onClick={() => setToastMsg(null)} className="text-emerald-400 hover:text-white font-bold ml-4">✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-950 text-blue-400 border border-blue-800/60">
              <Wrench className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Maintenance Command Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Dispatch Queue & Work Orders
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Accept urgent tasks, log physical repairs, and upload before/after proof for automated AI verification.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Assigned Staff: <strong className="text-white">{user?.full_name || 'Carlos Rodriguez'}</strong>
          </span>
        </div>
      </div>

      {/* Kanban Board 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(col => {
          const tasks = kanban[col.title] || [];
          return (
            <div key={col.title} className="flex flex-col bg-slate-950/60 rounded-3xl p-4 border border-slate-800/80 min-h-[600px]">
              
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-white">{col.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${col.badgeColor}`}>
                    {tasks.length}
                  </span>
                </div>
              </div>

              {/* Task Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {tasks.length === 0 ? (
                  <div className="h-36 flex items-center justify-center text-xs text-slate-600 italic">
                    No tickets in {col.title}
                  </div>
                ) : (
                  tasks.map(task => {
                    const isCritical = task.severity === 'Critical';

                    return (
                      <div
                        key={task.id}
                        className="glass-panel glass-panel-hover rounded-2xl p-4 border border-slate-800 space-y-3 relative overflow-hidden"
                      >
                        {/* Priority Border Indicator */}
                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                          isCritical ? 'bg-red-500' : task.priority_score >= 70 ? 'bg-amber-500' : 'bg-cyan-500'
                        }`} />

                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2 pl-1">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              {task.category}
                            </span>
                            <h4 className="font-bold text-xs text-white leading-snug mt-0.5">{task.title}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border shrink-0 ${
                            isCritical ? 'bg-red-950 text-red-400 border-red-800' : 'bg-slate-900 text-slate-300 border-slate-700'
                          }`}>
                            {task.priority_score}/100
                          </span>
                        </div>

                        {/* Location */}
                        <p className="text-[11px] text-slate-400 pl-1">
                          {task.building?.name} • Floor {task.floor} • Room {task.room}
                        </p>

                        {/* Action Buttons per Status */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 pl-1">
                          {col.title === 'Assigned' && (
                            <button
                              onClick={() => handleAcceptTask(task.id)}
                              className="w-full py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-950 transition-all flex items-center justify-center space-x-1.5"
                            >
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>Accept Task</span>
                            </button>
                          )}

                          {col.title === 'In Progress' && (
                            <button
                              onClick={() => {
                                setSelectedTaskForEvidence(task);
                                setNotes('');
                                setParts('');
                                setAfterImagePreview(null);
                              }}
                              className="w-full py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-950 transition-all flex items-center justify-center space-x-1.5"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Submit Resolution Evidence</span>
                            </button>
                          )}

                          {(col.title === 'Awaiting Verification' || col.title === 'Resolved') && (
                            <button
                              onClick={() => setSelectedTaskForVerification(task)}
                              className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium text-xs transition-colors flex items-center justify-center space-x-1.5 border border-slate-700"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Inspect AI Verification</span>
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Upload Resolution Evidence Modal */}
      {selectedTaskForEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 shadow-2xl p-6 relative">
            
            <button
              onClick={() => setSelectedTaskForEvidence(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-4 pr-8">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Resolution Evidence Submission</span>
              <h3 className="text-lg font-bold text-white mt-1">Complete Work Order #{selectedTaskForEvidence.id}</h3>
              <p className="text-xs text-slate-400">{selectedTaskForEvidence.title} • {selectedTaskForEvidence.building?.name} {selectedTaskForEvidence.room}</p>
            </div>

            <form onSubmit={handleSubmitEvidence} className="mt-4 space-y-4 text-xs">
              
              {/* After Photo Upload */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">After-Repair Evidence Photograph</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-950/40 relative overflow-hidden"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEvidenceImageSelect}
                    className="hidden"
                  />
                  {afterImagePreview ? (
                    <div className="relative aspect-video max-h-44 rounded-xl overflow-hidden mx-auto">
                      <img src={afterImagePreview} alt="After Evidence" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white font-semibold">
                        Click to change photo
                      </div>
                    </div>
                  ) : (
                    <div className="py-5 flex flex-col items-center justify-center space-y-1.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-slate-200">Upload photograph of completed repair</span>
                      <span className="text-[10px] text-slate-500">Required for AI dual-image visual verification</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Maintenance Notes */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Remediation Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Detail the technical actions taken (e.g., Replaced brass fitting, cleared standing water, tested under operational load)..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Parts & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Parts & Hardware Replaced</label>
                  <input
                    type="text"
                    value={parts}
                    onChange={e => setParts(e.target.value)}
                    placeholder="e.g. Schedule 40 union, GFCI breaker"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Labor Time (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hours}
                    onChange={e => setHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForEvidence(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEvidence || !notes}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-40 shadow-lg shadow-cyan-950 flex items-center space-x-1.5"
                >
                  {submittingEvidence ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{submittingEvidence ? 'Triggering AI Verification...' : 'Submit & Trigger Verification'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Inspect Verification Modal */}
      {selectedTaskForVerification && (
        <ResolutionVerificationModal
          complaint={selectedTaskForVerification}
          onClose={() => setSelectedTaskForVerification(null)}
          onSignoffSuccess={() => fetchTasks()}
        />
      )}

    </div>
  );
};
