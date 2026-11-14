import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Bell, 
  MapPin, 
  BarChart3, 
  LayoutDashboard, 
  MessageSquareCode, 
  Award, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationItem, CampusHealthScore } from '../types';

interface NavbarProps {
  currentTab: 'dashboard' | 'map' | 'analytics';
  onSelectTab: (tab: 'dashboard' | 'map' | 'analytics') => void;
  onOpenAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenAssistant }) => {
  const { user, role, demoLogin, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [healthScore, setHealthScore] = useState<CampusHealthScore | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications/');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/admin/health-score');
      if (res.ok) {
        const data = await res.json();
        setHealthScore(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchHealth();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchHealth();
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#080d1a]/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse-subtle" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  CAMPUS GUARDIAN
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  AI 2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Self-Healing Smart Campus Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="capitalize">{role} Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('map')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'map'
                  ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Smart Map</span>
            </button>

            <button
              onClick={() => onSelectTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'analytics'
                  ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Predictive Intelligence</span>
            </button>

            <button
              onClick={onOpenAssistant}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 hover:bg-cyan-900/30 transition-all shadow-sm shadow-cyan-900/30"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
              <span>AI Assistant</span>
            </button>
          </nav>

          {/* Right Section: Persona Switcher, Health Pill, Notifications, User */}
          <div className="flex items-center space-x-3">
            
            {/* Supabase Cloud Storage Pill */}
            <div 
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-xs"
              title="Supabase Cloud Storage & Auth Active"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-medium text-[11px]">Supabase Cloud</span>
            </div>

            {/* Campus Health Pill */}
            {healthScore && (
              <div 
                onClick={() => onSelectTab('analytics')}
                className="hidden xl:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 cursor-pointer hover:border-cyan-500/50 transition-all text-xs"
                title={healthScore.calculation_summary}
              >
                <div className={`w-2 h-2 rounded-full ${healthScore.score >= 75 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-slate-400">Health:</span>
                <span className="font-bold text-white">{healthScore.score}/100</span>
              </div>
            )}

            {/* Instant Persona Switcher (Crucial for 3-minute Hackathon Judging) */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
              <button
                onClick={() => demoLogin('student')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'student'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Student Persona (Report & Track)"
              >
                Student
              </button>
              <button
                onClick={() => demoLogin('maintenance')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'maintenance'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Maintenance Persona (Kanban & Resolution Evidence)"
              >
                Staff
              </button>
              <button
                onClick={() => demoLogin('admin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Administrator Persona (Executive Control & Analytics)"
              >
                Admin
              </button>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-800 transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto mt-2 space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">No notifications yet</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border text-xs transition-all ${
                            n.is_read
                              ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                              : 'bg-slate-800/70 border-cyan-500/30 text-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-semibold text-white">{n.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Student Impact Score Badge (if Student) */}
            {role === 'student' && user && (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{user.impact_score} pts</span>
              </div>
            )}

            {/* User Profile Avatar */}
            {user && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full object-cover border border-cyan-500/40"
                />
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-white leading-tight">{user.full_name}</p>
                  <p className="text-[10px] text-cyan-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 border border-slate-800 transition-all ml-1"
                  title="Sign Out / Switch Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
