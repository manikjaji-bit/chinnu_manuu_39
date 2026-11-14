import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Sparkles, 
  Camera, 
  FileCheck2,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Complaint } from '../types';
import { useAuth } from '../context/AuthContext';
import { ReportProblemModal } from '../components/ReportProblemModal';
import { ResolutionVerificationModal } from '../components/ResolutionVerificationModal';
import { AIAnalysisCard } from '../components/AIAnalysisCard';
import { GamificationLeaderboard } from '../components/GamificationLeaderboard';
import { getAuthHeaders } from '../utils/api';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [verificationModalComplaint, setVerificationModalComplaint] = useState<Complaint | null>(null);

  const fetchMyComplaints = async () => {
    try {
      const res = await fetch('/api/complaints/?mine_only=true', {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, [user]);

  const getStatusStepIndex = (status: string) => {
    const steps = ['Submitted', 'AI Analysed', 'Assigned', 'In Progress', 'Awaiting Verification', 'Resolved'];
    const idx = steps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Action CTA + Impact Score Highlight */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-600/20 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Student Intelligence Sentinel</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{user?.full_name || 'Alex'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Detect campus infrastructure risks early before they become hazardous disruptions.
              Take a photo, let Vision AI diagnose severity, and track live repair progress.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-900/40 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Report a Problem</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): My Complaints & Active Tracking */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-base text-white">My Submitted Complaints & Tracking</h3>
            </div>
            <span className="text-xs text-slate-400">{complaints.length} tickets recorded</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading your complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <Camera className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No active complaints filed yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Notice any broken furniture, ceiling leaks, or electrical hazards? Click 'Report a Problem' to earn impact points.
              </p>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900"
              >
                File Your First Report
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map(c => {
                const stepIdx = getStatusStepIndex(c.status);
                const isAwaitingVerification = c.status === 'Awaiting Verification';
                const isCritical = c.severity === 'Critical';

                return (
                  <div
                    key={c.id}
                    className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCritical ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {c.category}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">#{c.id}</span>
                          <span className="text-xs text-slate-500">• {new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-sm text-white mt-1">{c.title}</h4>
                        <p className="text-xs text-slate-400">{c.building?.name} • Floor {c.floor} • Room {c.room}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border inline-block ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                            : isAwaitingVerification
                            ? 'bg-amber-950/80 text-amber-400 border-amber-800 animate-pulse'
                            : 'bg-blue-950/80 text-cyan-300 border-blue-800'
                        }`}>
                          {c.status}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-1">Priority {c.priority_score}/100</span>
                      </div>
                    </div>

                    {/* Progress Timeline Tracker */}
                    <div className="pt-2">
                      <div className="grid grid-cols-6 gap-1 text-center">
                        {['Submitted', 'AI Analysed', 'Assigned', 'In Progress', 'Verification', 'Resolved'].map((step, idx) => {
                          const isDone = idx <= stepIdx;
                          const isCurrent = idx === stepIdx;
                          return (
                            <div key={step} className="flex flex-col items-center">
                              <div className={`w-full h-1.5 rounded-full mb-1 transition-all ${
                                isDone 
                                  ? 'bg-gradient-to-r from-blue-500 to-cyan-400' 
                                  : 'bg-slate-800'
                              } ${isCurrent ? 'ring-2 ring-cyan-400/40' : ''}`} />
                              <span className={`text-[9px] truncate max-w-full font-medium ${
                                isCurrent ? 'text-cyan-300 font-bold' : isDone ? 'text-slate-300' : 'text-slate-600'
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Bar / AI Insight preview */}
                    <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-xs">
                      <div className="text-slate-400 flex items-center space-x-1.5 text-[11px]">
                        <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                        <span>
                          {c.technician ? `Assigned to ${c.technician.full_name}` : c.department ? `Dispatched to ${c.department.name}` : 'Awaiting routing'}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        {/* If awaiting verification or resolved with evidence, show Inspect Verification button */}
                        {(isAwaitingVerification || c.evidence) && (
                          <button
                            onClick={() => setVerificationModalComplaint(c)}
                            className="px-3 py-1 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 text-xs font-semibold flex items-center space-x-1"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>{isAwaitingVerification ? 'Review & Confirm Repair' : 'View Verification Proof'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedComplaint(selectedComplaint?.id === c.id ? null : c)}
                          className="px-3 py-1 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium"
                        >
                          {selectedComplaint?.id === c.id ? 'Hide Details' : 'Details'}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details & AI Analysis Card */}
                    {selectedComplaint?.id === c.id && (
                      <div className="pt-3 space-y-3 animate-in fade-in duration-150">
                        <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                          <strong>Incident Report:</strong> {c.description}
                        </p>
                        {c.ai_analysis && (
                          <AIAnalysisCard analysis={c.ai_analysis} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Student Gamification Leaderboard */}
        <div className="space-y-6">
          <GamificationLeaderboard />
        </div>

      </div>

      {/* Modals */}
      <ReportProblemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitSuccess={() => {
          fetchMyComplaints();
        }}
      />

      {verificationModalComplaint && (
        <ResolutionVerificationModal
          complaint={verificationModalComplaint}
          onClose={() => setVerificationModalComplaint(null)}
          onSignoffSuccess={() => {
            fetchMyComplaints();
          }}
        />
      )}

    </div>
  );
};
