import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Wrench,
  Layers
} from 'lucide-react';
import { Complaint } from '../types';
import { useAuth } from '../context/AuthContext';

interface ResolutionVerificationModalProps {
  complaint: Complaint;
  onClose: () => void;
  onSignoffSuccess: () => void;
}

export const ResolutionVerificationModal: React.FC<ResolutionVerificationModalProps> = ({
  complaint,
  onClose,
  onSignoffSuccess
}) => {
  const { role } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [activeView, setActiveView] = useState<'side-by-side' | 'after-only'>('side-by-side');

  const evidence = complaint.evidence;
  const verification = complaint.verification;

  const handleSignoff = async (approved: boolean) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/complaints/${complaint.id}/verify-signoff?approved=${approved}`, {
        method: 'POST',
      });
      if (res.ok) {
        onSignoffSuccess();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const getVerdictBadge = (verdict?: string) => {
    if (verdict === 'Likely Resolved') {
      return (
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/80 text-emerald-400 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Likely Resolved</span>
        </div>
      );
    }
    if (verdict === 'Needs Human Review') {
      return (
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/80 text-amber-400 font-bold text-xs">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>Needs Human Review</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/80 text-red-400 font-bold text-xs">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span>Likely Unresolved</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 shadow-2xl p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start justify-between pr-8 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">AI Resolution Verification System</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">Ticket #{complaint.id}</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">{complaint.title}</h3>
            <p className="text-xs text-slate-400">{complaint.building?.name} • Floor {complaint.floor} • Room {complaint.room}</p>
          </div>
          {verification && getVerdictBadge(verification.verdict)}
        </div>

        {/* Before vs After Imagery */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">Visual Remediation Comparison</span>
            <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveView('side-by-side')}
                className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
                  activeView === 'side-by-side' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                Side-by-Side
              </button>
              <button
                onClick={() => setActiveView('after-only')}
                className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
                  activeView === 'after-only' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                After Only
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeView === 'side-by-side' && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex flex-col justify-end">
                <img
                  src={complaint.image_url || 'https://images.unsplash.com/photo-1542013936693-884638332954?w=600'}
                  alt="Original Incident Problem"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 border-t border-slate-800 text-xs flex justify-between items-center">
                  <span className="font-semibold text-red-400">BEFORE (Reported Incident)</span>
                  <span className="text-[10px] text-slate-400">Severity: {complaint.severity}</span>
                </div>
              </div>
            )}

            <div className={`relative rounded-2xl overflow-hidden border border-cyan-800/60 bg-slate-950 aspect-video flex flex-col justify-end ${
              activeView === 'after-only' ? 'md:col-span-2' : ''
            }`}>
              <img
                src={evidence?.after_image_url || 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600'}
                alt="After Repair Evidence"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="relative z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 border-t border-slate-800 text-xs flex justify-between items-center">
                <span className="font-semibold text-emerald-400">AFTER (Technician Work Evidence)</span>
                <span className="text-[10px] text-cyan-300">Verified by AI</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Verification Intelligence Breakdown */}
        {verification && (
          <div className="mt-5 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-900/60">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-900/40">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs text-white">AI Vision Diagnostic Verification</span>
              </div>
              <span className="text-xs text-cyan-300 font-mono">
                Similarity Score: {Math.round(verification.similarity_score * 100)}%
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {verification.notes}
            </p>
          </div>
        )}

        {/* Technician Notes & Parts Replaced */}
        {evidence && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-slate-400 block mb-1">Technician Notes</span>
              <p className="text-white leading-relaxed">{evidence.maintenance_notes}</p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-slate-400 block mb-1">Parts Replaced & Effort</span>
              <p className="text-cyan-300 font-mono">{evidence.parts_replaced || 'Standard hardware adjustment / no parts replacement'}</p>
              <span className="text-[10px] text-slate-400 block mt-1">Duration: {evidence.work_duration_hours} hours on site</span>
            </div>
          </div>
        )}

        {/* Sign-off Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            {role === 'admin'
              ? 'As Administrator, your approval completes the audit trail and updates the Campus Health Score.'
              : 'Confirming resolution confirms quality and awards you +15 Student Impact points!'}
          </p>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => handleSignoff(false)}
              disabled={submitting}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-950/40 border border-red-800/60 hover:bg-red-900/40 transition-colors flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen Complaint</span>
            </button>

            <button
              onClick={() => handleSignoff(true)}
              disabled={submitting}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-cyan-900/40 transition-all flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve & Close</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
