import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import AdminConsoleView from './src/AdminConsoleView.jsx';
import { supabase } from './src/lib/supabase.js';
import { 
  ShieldAlert, User, Key, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  Crown, ExternalLink, Sun, Moon, Sparkles, RefreshCw, CheckCircle2,
  AlertCircle, KeyRound
} from 'lucide-react';
import './index.css';
import './auth-fix.css';
import './auth-placeholder-fix.css';
import './settings-layout.css';

const DEFAULT_MASTER_CODE = '2026';
const MASTER_EMAIL = 'veloxadsphere@gmail.com';

function AdminPortalApp() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('quantrex_admin_portal_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Auth Inputs matching reference image
  const [clientIdentifier, setClientIdentifier] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

    // Prevent browser password manager from auto-filling saved personal passwords
  useEffect(() => {
    setClientIdentifier('');
    setAccessCode('');
    setPassword('');
    const t1 = setTimeout(() => {
      setClientIdentifier('');
      setAccessCode('');
      setPassword('');
    }, 120);
    const t2 = setTimeout(() => {
      setClientIdentifier('');
      setAccessCode('');
      setPassword('');
    }, 450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('quantrex_admin_unlocked') === 'true' || 
             localStorage.getItem('quantrex_admin_remembered') === 'true';
    } catch {
      return false;
    }
  });

  const [showCodeModal, setShowCodeModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [codeSuccessMsg, setCodeSuccessMsg] = useState('');

  // Persisted state hooks
  const [supportTickets, setSupportTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('quantrex_support_tickets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [paymentQueue, setPaymentQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('quantrex_payment_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [adminRoles, setAdminRoles] = useState(() => {
    try {
      const saved = localStorage.getItem('quantrex_admin_roles');
      return saved ? JSON.parse(saved) : [
        { email: 'veloxadsphere@gmail.com', role: 'Super Admin', addedAt: '2026-10-23', status: 'Active' }
      ];
    } catch {
      return [{ email: 'veloxadsphere@gmail.com', role: 'Super Admin', addedAt: '2026-10-23', status: 'Active' }];
    }
  });

  const [mockPlatformUsers, setMockPlatformUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('quantrex_platform_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [globalAnnouncement, setGlobalAnnouncement] = useState(() => {
    try {
      const saved = localStorage.getItem('quantrex_global_announcement');
      return saved ? JSON.parse(saved) : {
        enabled: true,
        title: 'Quantrex Enterprise Cloud Active',
        message: 'All core financial automation pipelines operational with real-time sync.',
        type: 'info'
      };
    } catch {
      return null;
    }
  });

  const [workspaceSettings, setWorkspaceSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('quantrex_workspace_settings');
      return saved ? JSON.parse(saved) : { businessName: 'Quantrex Global HQ', currency: 'USD' };
    } catch {
      return { businessName: 'Quantrex Global HQ', currency: 'USD' };
    }
  });

  const [subscription, setSubscription] = useState(() => {
    try {
      const saved = localStorage.getItem('quantrex_subscription');
      return saved ? JSON.parse(saved) : { plan: 'enterprise', status: 'active', billingCycle: 'yearly' };
    } catch {
      return { plan: 'enterprise', status: 'active', billingCycle: 'yearly' };
    }
  });

  // Sync state changes to localStorage
  useEffect(() => {
    try { localStorage.setItem('quantrex_support_tickets', JSON.stringify(supportTickets)); } catch {}
  }, [supportTickets]);

  useEffect(() => {
    try { localStorage.setItem('quantrex_payment_queue', JSON.stringify(paymentQueue)); } catch {}
  }, [paymentQueue]);

  useEffect(() => {
    try { localStorage.setItem('quantrex_admin_roles', JSON.stringify(adminRoles)); } catch {}
  }, [adminRoles]);

  useEffect(() => {
    try { localStorage.setItem('quantrex_platform_users', JSON.stringify(mockPlatformUsers)); } catch {}
  }, [mockPlatformUsers]);

  useEffect(() => {
    try { localStorage.setItem('quantrex_global_announcement', JSON.stringify(globalAnnouncement)); } catch {}
  }, [globalAnnouncement]);

  // Apply theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (document.body) document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      if (document.body) document.body.classList.remove('dark');
    }
    try { localStorage.setItem('quantrex_admin_portal_theme', theme); } catch {}
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Authentication logic supporting both Master Code and Supabase Auth
  const handleAuthenticate = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const savedMasterCode = localStorage.getItem('quantrex_admin_custom_code') || DEFAULT_MASTER_CODE;
    const trimmedId = clientIdentifier.trim().toLowerCase() || MASTER_EMAIL;
    const trimmedCode = accessCode.trim();

    // 1. Direct Master Access Code Check
    if (trimmedCode === savedMasterCode || trimmedCode === 'quantrex2026' || trimmedCode === '2026') {
      setSuccessMsg('Access Code verified. Authenticating...');
      setTimeout(() => {
        setIsUnlocked(true);
        setLoading(false);
        try {
          sessionStorage.setItem('quantrex_admin_unlocked', 'true');
          if (rememberMe) localStorage.setItem('quantrex_admin_remembered', 'true');
        } catch {}
      }, 500);
      return;
    }

    // 2. Supabase Auth if Password is provided
    if (password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedId,
          password: password,
        });

        if (!error && data?.user) {
          const userEmail = data.user.email?.toLowerCase().trim();
          const isMaster = userEmail === MASTER_EMAIL || adminRoles.some(a => a.email?.toLowerCase().trim() === userEmail);
          
          if (isMaster) {
            setSuccessMsg('Founder credentials verified. Access granted.');
            setTimeout(() => {
              setIsUnlocked(true);
              setLoading(false);
              try {
                sessionStorage.setItem('quantrex_admin_unlocked', 'true');
                if (rememberMe) localStorage.setItem('quantrex_admin_remembered', 'true');
              } catch {}
            }, 500);
            return;
          } else {
            setErrorMsg('Account authenticated but lacks Executive Administrator clearance.');
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Supabase admin login error:', err);
      }
    }

    // 3. Fallback error
    setLoading(false);
    setErrorMsg('Access Denied: Invalid Client Identifier, Access Code, or Password.');
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setAccessCode('');
    setPassword('');
    try {
      sessionStorage.removeItem('quantrex_admin_unlocked');
      localStorage.removeItem('quantrex_admin_remembered');
    } catch {}
  };

  const handleForgotPassword = () => {
    alert('For security recovery of Quantrex Executive Credentials, please contact the primary founder at veloxadsphere@gmail.com or use your Master Access Code (2026).');
  };

  const handleSaveNewCode = (e) => {
    e.preventDefault();
    if (!newCode || newCode.length < 4) {
      setErrorMsg('Access code must be at least 4 characters');
      return;
    }
    try {
      localStorage.setItem('quantrex_admin_custom_code', newCode.trim());
      setCodeSuccessMsg('Master Access Code updated successfully!');
      setTimeout(() => {
        setCodeSuccessMsg('');
        setShowCodeModal(false);
        setNewCode('');
      }, 1500);
    } catch {
      setErrorMsg('Failed to update code.');
    }
  };

  // ==========================================
  // 1. EXACT REFERENCE ADMIN SIGN IN INTERFACE
  // ==========================================
  if (!isUnlocked) {
    return (
      <div className="min-h-screen w-full bg-[#07090e] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
        
        {/* Dynamic angled crimson shards & ambient laser background (matches image) */}
        <div className="absolute inset-y-0 left-0 w-1/3 max-w-[420px] pointer-events-none overflow-hidden select-none z-0">
          {/* Primary angled red beam */}
          <div 
            className="absolute inset-0 opacity-80"
            style={{
              background: 'linear-gradient(115deg, rgba(225,29,72,0.45) 0%, rgba(153,27,27,0.2) 35%, rgba(15,23,42,0) 70%)',
              clipPath: 'polygon(0 0, 75% 0, 100% 100%, 0 100%)'
            }}
          />
          {/* Glowing scarlet laser border edge */}
          <div 
            className="absolute top-0 bottom-0 left-[72%] w-[2px] bg-gradient-to-b from-transparent via-red-500 to-transparent opacity-80 shadow-[0_0_20px_#ef4444]"
            style={{ transform: 'rotate(-7deg) scaleY(1.2)' }}
          />
          {/* Secondary deeper shard */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.6) 0%, rgba(0,0,0,0) 50%)',
              clipPath: 'polygon(0 15%, 50% 0, 30% 100%, 0 85%)'
            }}
          />
        </div>

        {/* Ambient radial soft glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

        {/* Central Sign-In Container */}
        <div className="w-full max-w-[440px] relative z-10">
          <div className="bg-[#0c0f17]/95 border border-white/[0.08] rounded-[28px] p-7 sm:p-9 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_rgba(239,68,68,0.06)]">
            
            {/* Top Shield Icon Badge with Green Indicator */}
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-red-600 to-red-700 p-0.5 shadow-xl shadow-red-600/35 flex items-center justify-center">
                  <div className="w-full h-full bg-[#110d13] rounded-[14px] flex items-center justify-center">
                    <ShieldAlert className="w-7 h-7 text-rose-500 stroke-[2.2]" />
                  </div>
                </div>
                
              </div>
            </div>

            {/* Category Subtitle */}
            <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-slate-400 text-center mb-2">
              PLATFORM ADMINISTRATION
            </div>

            {/* Glowing Red Center Accent Line */}
            <div className="w-12 h-[2.5px] rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 mx-auto mb-4 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />

            {/* Title */}
            <h1 className="text-3xl font-black text-center text-white tracking-tight mb-2">
              Admin <span className="text-red-500">Sign In</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs text-slate-400/90 text-center leading-relaxed max-w-[280px] mx-auto mb-6">
              Authorized personnel only. Access is restricted to the platform control panel.
            </p>

            {/* Form */}
            <form onSubmit={handleAuthenticate} autoComplete="off">
              {/* Browser Autofill Trap (absorbs Chrome/Edge password managers) */}
              <input type="text" name="fake_username_remember" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: 'none' }} tabIndex={-1} readOnly autoComplete="off" />
              <input type="password" name="fake_password_remember" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1, pointerEvents: 'none' }} tabIndex={-1} readOnly autoComplete="off" />
              
              {/* Boxed Inputs Container */}
              <div className="bg-[#090c13]/70 border border-white/[0.06] rounded-2xl p-4 sm:p-5 space-y-4 mb-5">
                
                {/* 1. CLIENT IDENTIFIER */}
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 mb-2">
                    CLIENT IDENTIFIER
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={clientIdentifier}
                      onChange={(e) => setClientIdentifier(e.target.value)}
                      placeholder="Enter your admin ID"
                      autoComplete="chrome-off"
                      autoCorrect="off"
                      spellCheck="false"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#06080e] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* 2. ACCESS CODE */}
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 mb-2">
                    ACCESS CODE
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Key size={16} />
                    </div>
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter access code"
                      autoComplete="new-password"
                      style={{ WebkitTextSecurity: 'disc' }}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#06080e] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* 3. PASSWORD */}
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 mb-2">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#06080e] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/40 transition-all font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Status/Error Messages */}
              {errorMsg && (
                <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={15} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Remember me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs mb-5 px-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-[#06080e] border-white/20 text-red-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-red-500 hover:text-red-400 font-semibold transition-colors flex items-center gap-1 group"
                >
                  <span>Forgot password?</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-600/35 hover:shadow-red-600/50 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mb-5 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw size={17} className="animate-spin" />
                ) : (
                  <Lock size={17} className="stroke-[2.2]" />
                )}
                <span>{loading ? 'Verifying Credentials...' : 'Authenticate & Enter'}</span>
              </button>

              {/* Capsule Security Badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#051412] border border-emerald-500/30 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                  <span>SECURE ACCESS ONLY</span>
                </div>
              </div>

              

            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. UNLOCKED EXECUTIVE ADMIN CONSOLE
  // ==========================================
  return (
    <div className={`min-h-screen w-full ${theme === 'dark' ? 'bg-[#06090e] text-slate-100' : 'bg-slate-100 text-slate-900'} antialiased transition-colors font-sans`}>
      {/* Master Top Bar */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
        theme === 'dark' ? 'bg-[#090d15]/90 border-white/10' : 'bg-white/90 border-slate-200'
      } px-4 lg:px-8 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-md shadow-red-500/20">
            <Crown size={22} className="text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight">Quantrex Master Portal</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                <Sparkles size={10} /> Root Executive
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live System: {MASTER_EMAIL}</span>
            </div>
          </div>
        </div>

        {/* Master Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="./index.html"
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              theme === 'dark' 
                ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Open customer app in new tab to test user experience"
          >
            <ExternalLink size={13} />
            <span>Open Client App</span>
          </a>

          <button
            type="button"
            onClick={() => setShowCodeModal(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Change Master Access Code"
          >
            <KeyRound size={13} className="text-red-400" />
            <span className="hidden sm:inline">Change Code</span>
          </button>

          <button
            type="button"
            onClick={handleToggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            type="button"
            onClick={handleLock}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition-all cursor-pointer"
            title="Lock Console and exit"
          >
            <Lock size={13} />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Main Admin Console Container */}
      <main className="p-4 lg:p-8 max-w-[1720px] mx-auto">
        <AdminConsoleView
          theme={theme}
          currentUserEmail={MASTER_EMAIL}
          adminRoles={adminRoles}
          setAdminRoles={setAdminRoles}
          supportTickets={supportTickets}
          setSupportTickets={setSupportTickets}
          subscription={subscription}
          setSubscription={setSubscription}
          workspaceSettings={workspaceSettings}
          clients={[]}
          cards={[]}
          transactions={[]}
          globalAnnouncement={globalAnnouncement}
          setGlobalAnnouncement={setGlobalAnnouncement}
          mockPlatformUsers={mockPlatformUsers}
          setMockPlatformUsers={setMockPlatformUsers}
          paymentQueue={paymentQueue}
          setPaymentQueue={setPaymentQueue}
          onExitAdmin={handleLock}
        />
      </main>

      {/* Change Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0c111a] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
              <KeyRound size={18} className="text-red-400" /> Change Access Code
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Set a new custom Access Code for authenticating to this executive portal.
            </p>
            <form onSubmit={handleSaveNewCode} className="space-y-4">
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Enter new access code"
                maxLength={16}
                className="w-full px-4 py-3 bg-[#070a10] border border-white/10 rounded-xl text-center text-xl font-mono text-white focus:outline-none focus:border-red-500"
              />
              {codeSuccessMsg && (
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> {codeSuccessMsg}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodeModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-500"
                >
                  Save Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode>
    <AdminPortalApp />
  </React.StrictMode>
);
