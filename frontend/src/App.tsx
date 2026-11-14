import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './pages/StudentDashboard';
import { MaintenanceDashboard } from './pages/MaintenanceDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PredictiveAnalytics } from './pages/PredictiveAnalytics';
import { CampusMapView } from './pages/CampusMapView';
import { AIAssistantModal } from './components/AIAssistantModal';


const MainApp: React.FC = () => {
  const { role, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'map' | 'analytics'>('dashboard');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

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
            {role === 'student' && <StudentDashboard />}
            {role === 'maintenance' && <MaintenanceDashboard />}
            {role === 'admin' && <AdminDashboard />}
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
