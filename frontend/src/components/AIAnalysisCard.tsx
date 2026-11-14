import React from 'react';
import { 
  Bot, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  ShieldAlert, 
  ArrowRight,
  Cpu
} from 'lucide-react';
import { AIAnalysis } from '../types';

interface AIAnalysisCardProps {
  analysis?: AIAnalysis | null;
  compact?: boolean;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ analysis, compact = false }) => {
  if (!analysis) {
    return (
      <div className="glass-panel p-4 rounded-xl border border-slate-800 text-slate-500 text-xs text-center">
        No AI telemetry captured for this ticket.
      </div>
    );
  }

  const {
    detected_problem,
    category,
    severity,
    priority_score,
    safety_risk,
    description,
    recommended_action,
    assigned_department,
    confidence,
    is_simulated
  } = analysis;

  const getPriorityColor = (p: number) => {
    if (p >= 85) return 'text-red-400 bg-red-950/80 border-red-800/80';
    if (p >= 65) return 'text-amber-400 bg-amber-950/80 border-amber-800/80';
    if (p >= 40) return 'text-blue-400 bg-blue-950/80 border-blue-800/80';
    return 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80';
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-cyan-900/40 relative overflow-hidden">
      {/* Top Banner with Simulation Badge & Confidence */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white flex items-center space-x-2">
              <span>Campus Guardian Vision AI</span>
              <span className="text-[10px] text-cyan-400 font-normal">v4.2</span>
            </h4>
            <span className="text-[10px] text-slate-400">Diagnostic confidence: {Math.round(confidence * 100)}%</span>
          </div>
        </div>

        {/* Transparent Demo/Live Badge as requested in prompt */}
        <div className="flex items-center space-x-1.5">
          {is_simulated ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-700/60">
              Demo AI Mode (Deterministic Heuristics)
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Gemini Vision API Live</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Diagnostic Data */}
      <div className="mt-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Identified Fault</span>
            <p className="text-sm font-bold text-white leading-snug">{detected_problem}</p>
          </div>

          <div className={`px-2.5 py-1 rounded-xl border text-center shrink-0 ${getPriorityColor(priority_score)}`}>
            <span className="text-[10px] block uppercase font-bold leading-none">Priority</span>
            <span className="text-lg font-black leading-tight">{priority_score}</span>
            <span className="text-[9px] block text-slate-400 -mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Badges: Severity + Safety Hazard */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`px-2 py-0.5 rounded-md font-semibold border ${
            severity === 'Critical' 
              ? 'bg-red-950 text-red-400 border-red-800'
              : severity === 'High'
              ? 'bg-amber-950 text-amber-400 border-amber-800'
              : 'bg-blue-950 text-blue-400 border-blue-800'
          }`}>
            Severity: {severity}
          </span>

          {safety_risk && (
            <span className="px-2 py-0.5 rounded-md font-semibold bg-red-950/90 text-red-300 border border-red-700 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>Critical Safety Hazard</span>
            </span>
          )}

          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            Route: {assigned_department}
          </span>
        </div>

        {/* Narrative Description */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          {description}
        </p>

        {/* Recommended Action */}
        <div className="bg-cyan-950/30 border border-cyan-900/50 p-2.5 rounded-xl text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-0.5">Recommended Remediation</span>
          <p className="text-cyan-200 leading-normal">{recommended_action}</p>
        </div>
      </div>
    </div>
  );
};
