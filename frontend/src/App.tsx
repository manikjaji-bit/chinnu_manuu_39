import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPortal } from './components/LoginPortal';
import { StudentDashboard } from './pages/StudentDashboard';
import { MaintenanceDashboard } from './pages/MaintenanceDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PredictiveAnalytics } from './pages/PredictiveAnalytics';
import { CampusMapView } from './pages/CampusMapView';
import { AIAssistantModal } from './components/AIAssistantModal';


const MainApp: React.FC = () => {
  const { role, user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'map' | 'analytics'>('dashboard');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1.5px] animate-spin">
          <div className="w-full h-full bg-slate-950 rounded-[14px]"></div>
        </div>
        <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase animate-pulse">
          Initializing Campus Guardian Security...
        </p>
      </div>
    );
  }

  // If no authenticated user, present the Login & Admin Creation Portal
  if (!user) {
    return <LoginPortal />;
  }

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navbar with Instant Role Switcher & Live Notifications */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'map' && <CampusMapView />}
        {currentTab === 'analytics' && <PredictiveAnalytics />}
        {currentTab === 'dashboard' && (
          <>
            {role === 'admin' && <AdminDashboard />}
            {role === 'maintenance' && <MaintenanceDashboard />}
            {role === 'student' && <StudentDashboard />}
            {!['admin', 'maintenance', 'student'].includes(role) && <StudentDashboard />}
          </>
        )}
      </main>

      {/* AI Assistant Chat Modal */}
      <AIAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      {/* Futuristic Bottom Status Bar */}
      <footer className="border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-400">Campus Guardian AI Core:</span>
            <span className="text-emerald-400 font-mono">NOMINAL</span>
            <span className="text-slate-600">•</span>
            <span>Tagline: "Detect Problems Before They Become Disasters"</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span className="text-slate-400">
              Role: <strong className="text-white capitalize">{role}</strong> ({user?.full_name})
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400/80 font-mono">FastAPI + Vite React + SQLite/Supabase</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
