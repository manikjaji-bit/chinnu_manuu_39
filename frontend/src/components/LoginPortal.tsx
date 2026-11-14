import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Wrench, 
  GraduationCap, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Building,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPortal: React.FC = () => {
  const { login, register, demoLogin } = useAuth();
  
  // Modes: 'register' | 'login' | 'demo'
  const [mode, setMode] = useState<'register' | 'login' | 'demo'>('register');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [departmentId, setDepartmentId] = useState<number>(1);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const cleanName = fullName.trim();
        const cleanEmail = email.trim();
        const cleanPass = password.trim();

        if (!cleanName) {
          throw new Error('Please enter your full name.');
        }
        if (!cleanEmail || !cleanEmail.includes('@')) {
          throw new Error('Please enter a valid campus email address.');
        }
        if (cleanPass.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        await register(
          cleanName,
          cleanEmail,
          cleanPass,
          selectedRole,
          selectedRole === 'maintenance' ? departmentId : undefined
        );
      } else if (mode === 'login') {
        const cleanEmail = email.trim();
        const cleanPass = password.trim();

        if (!cleanEmail || !cleanPass) {
          throw new Error('Please enter both your email address and password.');
        }
        await login(cleanEmail, cleanPass);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: UserRole) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await demoLogin(role);
    } catch (err: any) {
      setErrorMsg(err.message || `Demo login for ${role} failed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] bg-radial-gradient text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        
        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1.5px] shadow-2xl shadow-cyan-500/30 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-cyan-400 animate-pulse-subtle" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
            CAMPUS GUARDIAN
          </h1>
          <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5">
            The Self-Healing AI-Powered Smart Campus Ecosystem
          </p>
          <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tagline: "Detect Problems Before They Become Disasters"</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-panel rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 backdrop-blur-2xl">
          
          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); }}
              className={`py-2 px-3 rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Admin / User
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`py-2 px-3 rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('demo'); setErrorMsg(null); }}
              className={`py-2 px-3 rounded-xl transition-all ${
                mode === 'demo'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1-Click Demo Access
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-700/80 text-red-200 text-xs flex items-center space-x-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODE 1: REGISTER (Create Admin / User Account) */}
          {mode === 'register' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role Selection Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Role & Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  
                  {/* Admin Option */}
                  <div
                    onClick={() => setSelectedRole('admin')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all relative ${
                      selectedRole === 'admin'
                        ? 'border-purple-500 bg-purple-950/40 shadow-lg shadow-purple-950/50'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <ShieldCheck className={`w-5 h-5 ${selectedRole === 'admin' ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        Full Access
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white">Administrator</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Full editing control: overrides, approvals, audit logs, resource planning.
                    </p>
                  </div>

                  {/* Staff Option */}
                  <div
                    onClick={() => setSelectedRole('maintenance')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all relative ${
                      selectedRole === 'maintenance'
                        ? 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-950/50'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Wrench className={`w-5 h-5 ${selectedRole === 'maintenance' ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        Staff
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white">Maintenance Staff</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Kanban tasks, accept work orders, submit before/after photo proof.
                    </p>
                  </div>

                  {/* Student Option */}
                  <div
                    onClick={() => setSelectedRole('student')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all relative ${
                      selectedRole === 'student'
                        ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-950/50'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <GraduationCap className={`w-5 h-5 ${selectedRole === 'student' ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        Sentinel
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white">Student</div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Report defects with AI scan, track status, earn impact score points.
                    </p>
                  </div>

                </div>
              </div>

              {/* Department selector if Maintenance Staff */}
              {selectedRole === 'maintenance' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assigned Maintenance Department
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <select
                      value={departmentId}
                      onChange={e => setDepartmentId(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value={1}>Electrical Department (Power, Lighting, Circuits)</option>
                      <option value={2}>Plumbing Department (Leaks, Supply, Risers)</option>
                      <option value={3}>Infrastructure Department (Furniture, Windows, Structural)</option>
                      <option value={4}>Sanitation Department (Waste, Cleanliness, Restrooms)</option>
                      <option value={5}>IT & Network Department (WiFi, Access Points, Labs)</option>
                      <option value={6}>General Maintenance (HVAC, Elevators, Common)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={selectedRole === 'admin' ? "Dr. Chief Administrator" : "Your Full Name"}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder={selectedRole === 'admin' ? "admin@campus.edu" : "user@campus.edu"}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password (min 6 characters)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <span>Initializing Secure Session...</span>
                ) : (
                  <>
                    <span>Create {selectedRole.toUpperCase()} Account & Launch</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: SIGN IN */}
          {mode === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="your.email@campus.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 3: 1-CLICK DEMO ACCOUNTS */}
          {mode === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Select an authentic pre-configured persona to test immediately with live data:
              </p>

              {/* Demo Admin */}
              <button
                onClick={() => handleDemo('admin')}
                disabled={loading}
                className="w-full p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-purple-800/60 hover:border-purple-500 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-950 flex items-center justify-center border border-purple-700/60">
                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>Dr. Eleanor Vance</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        ADMIN
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Chief Campus Facilities Administrator</div>
                    <div className="text-[10px] text-purple-400 font-mono mt-0.5">admin@campus.demo</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Demo Maintenance Staff */}
              <button
                onClick={() => handleDemo('maintenance')}
                disabled={loading}
                className="w-full p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-blue-800/60 hover:border-blue-500 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center border border-blue-700/60">
                    <Wrench className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>Carlos Rodriguez</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        STAFF
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Senior Electrical & Mechanical Lead</div>
                    <div className="text-[10px] text-blue-400 font-mono mt-0.5">maintenance@campus.demo</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Demo Student */}
              <button
                onClick={() => handleDemo('student')}
                disabled={loading}
                className="w-full p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-cyan-800/60 hover:border-cyan-500 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 flex items-center justify-center border border-cyan-700/60">
                    <GraduationCap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>Alex Johnson</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        STUDENT
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Resident Sentinel (Points: 480)</div>
                    <div className="text-[10px] text-cyan-400 font-mono mt-0.5">student@campus.demo</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          )}

        </div>

        {/* Security & Feature Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role-Based Access Control</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Gemini Vision 2.0</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase Cloud Integration</span>
          </div>
        </div>

      </div>

    </div>
  );
};
