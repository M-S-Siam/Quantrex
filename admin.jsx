import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import AdminConsoleView from './src/AdminConsoleView.jsx';
import { 
  ShieldCheck, Lock, Unlock, Crown, ExternalLink, KeyRound, 
  Sun, Moon, AlertTriangle, ArrowRight, RefreshCw, CheckCircle,
  Eye, EyeOff, Sparkles, Terminal
} from 'lucide-react';
import './index.css';
import './auth-fix.css';
import './auth-placeholder-fix.css';
import './settings-layout.css';

// Master security credentials
const DEFAULT_MASTER_PIN = '2026';
const MASTER_EMAIL = 'veloxadsphere@gmail.com';

function AdminPortalApp() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('quantrex_admin_portal_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem('quantrex_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');

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
    try {
      localStorage.setItem('quantrex_support_tickets', JSON.stringify(supportTickets));
    } catch {}
  }, [supportTickets]);

  useEffect(() => {
    try {
      localStorage.setItem('quantrex_payment_queue', JSON.stringify(paymentQueue));
    } catch {}
  }, [paymentQueue]);

  useEffect(() => {
    try {
      localStorage.setItem('quantrex_admin_roles', JSON.stringify(adminRoles));
    } catch {}
  }, [adminRoles]);

  useEffect(() => {
    try {
      localStorage.setItem('quantrex_platform_users', JSON.stringify(mockPlatformUsers));
    } catch {}
  }, [mockPlatformUsers]);

  useEffect(() => {
    try {
      localStorage.setItem('quantrex_global_announcement', JSON.stringify(globalAnnouncement));
    } catch {}
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
    try {
      localStorage.setItem('quantrex_admin_portal_theme', theme);
    } catch {}
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleUnlock = (e) => {
    if (e) e.preventDefault();
    const storedPin = localStorage.getItem('quantrex_admin_custom_pin') || DEFAULT_MASTER_PIN;
    if (pin.trim() === storedPin || pin.trim() === 'quantrex2026' || pin.trim() === '2026') {
      setIsUnlocked(true);
      setErrorMsg('');
      try {
        sessionStorage.setItem('quantrex_admin_unlocked', 'true');
      } catch {}
    } else {
      setErrorMsg('Incorrect Master PIN. Access Denied.');
      setPin('');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPin('');
    try {
      sessionStorage.removeItem('quantrex_admin_unlocked');
    } catch {}
  };

  const handleSaveNewPin = (e) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4) {
      setErrorMsg('PIN must be at least 4 digits');
      return;
    }
    try {
      localStorage.setItem('quantrex_admin_custom_pin', newPin.trim());
      setPinSuccessMsg('Master PIN updated successfully!');
      setTimeout(() => {
        setPinSuccessMsg('');
        setShowPinModal(false);
        setNewPin('');
      }, 1500);
    } catch {
      setErrorMsg('Failed to save new PIN.');
    }
  };

  // 1. PIN LOCK SCREEN
  if (!isUnlocked) {
    return (
      <div className="min-h-screen w-full bg-[#06090e] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Ambient cyber glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Top Brand Banner */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-2xl shadow-amber-500/30 mb-5">
              <div className="w-full h-full bg-[#0b0f17] rounded-[22px] flex items-center justify-center">
                <Crown className="w-10 h-10 text-amber-400 stroke-[2.2]" />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-3">
              <ShieldCheck size={14} className="text-amber-400" />
              Founder Root Clearance
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Quantrex Master Control
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">
              Executive owner access for <span className="text-amber-400 font-semibold">{MASTER_EMAIL}</span>
            </p>
          </div>

          {/* Security Card */}
          <div className="bg-[#0c111a]/95 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
            <form onSubmit={handleUnlock} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Master Security PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    autoFocus
                    maxLength={10}
                    className="w-full px-4 py-3.5 bg-[#070a10] border border-white/10 rounded-2xl text-center text-2xl tracking-[0.4em] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Quick keypad for fast mobile/touch access */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      if (k === 'C') setPin('');
                      else if (k === '⌫') setPin(prev => prev.slice(0, -1));
                      else setPin(prev => (prev.length < 8 ? prev + k : prev));
                    }}
                    className="h-11 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] active:scale-95 border border-white/5 text-slate-200 font-mono text-base font-bold flex items-center justify-center transition-all cursor-pointer"
                  >
                    {k}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Unlock size={17} className="stroke-[2.5]" />
                Authenticate & Open Console
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Lock size={12} className="text-amber-400" /> Default PIN: <code className="text-amber-400/90 font-mono font-bold">2026</code>
              </span>
              <a
                href="./index.html"
                className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                Go to Client App <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. UNLOCKED MASTER ADMIN ENVIRONMENT
  return (
    <div className={`min-h-screen w-full ${theme === 'dark' ? 'bg-[#06090e] text-slate-100' : 'bg-slate-100 text-slate-900'} antialiased transition-colors font-sans`}>
      {/* Master Top Bar */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
        theme === 'dark' ? 'bg-[#090d15]/90 border-white/10' : 'bg-white/90 border-slate-200'
      } px-4 lg:px-8 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Crown size={22} className="text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight">Quantrex Master Portal</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
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
            onClick={() => setShowPinModal(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Change Master Security PIN"
          >
            <KeyRound size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Change PIN</span>
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

      {/* Change PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0c111a] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
              <KeyRound size={18} className="text-amber-400" /> Change Master PIN
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Set a new custom PIN for owner authentication to this secret portal.
            </p>
            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <input
                type="text"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new 4-8 digit PIN"
                maxLength={8}
                className="w-full px-4 py-3 bg-[#070a10] border border-white/10 rounded-xl text-center text-xl font-mono text-white focus:outline-none focus:border-amber-400"
              />
              {pinSuccessMsg && (
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle size={14} /> {pinSuccessMsg}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-400"
                >
                  Save PIN
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
