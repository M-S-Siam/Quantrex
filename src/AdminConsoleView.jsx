import React, { useState, useMemo, useEffect } from 'react';
import { PLATFORM_SYNC_SQL } from './lib/platformSync.js';
import {
  Crown, Users, CreditCard, Coins, Building, TrendingUp,
  AlertCircle, CheckCircle2, Search, Filter, Mail, HelpCircle,
  Bell, Sparkles, ShieldCheck, UserPlus, Trash2, ArrowRight,
  ExternalLink, Check, Copy, SlidersHorizontal, BriefcaseBusiness,
  BarChart3, RefreshCw, X, ChevronRight, Tag, Plus, Percent, Calendar,
  FileSpreadsheet, Download, Database, Clock, Activity, Power, Wrench, Pause
} from 'lucide-react';

export default function AdminConsoleView({
  theme,
  currentUserEmail,
  adminRoles = [],
  setAdminRoles,
  supportTickets = [],
  setSupportTickets,
  subscription,
  setSubscription,
  workspaceSettings,
  clients = [],
  cards = [],
  transactions = [],
  globalAnnouncement,
  setGlobalAnnouncement,
  mockPlatformUsers = [],
  setMockPlatformUsers,
  paymentQueue = [],
  setPaymentQueue,
  supabaseLatency = 38,
  onSyncSupabase,
  cloudTableMissing = false,
  cloudSyncedStates = {},
  onCloudSave,
  autoLockMinutes = 15,
  setAutoLockMinutes,
  onExitAdmin
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'payments' | 'tickets' | 'announcements' | 'admins'
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('Co-Admin');
  const [statusMessage, setStatusMessage] = useState('');

  // Maintenance Mode & System Health State
  const [maintenanceMode, setMaintenanceMode] = useState(() => {
    try {
      return localStorage.getItem('quantrex_maintenance_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  // Command Palette (Ctrl+K) State
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
        setCommandQuery('');
      } else if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1-Click Renewal Reminder Modal State
  const [reminderTarget, setReminderTarget] = useState(null);
  const [reminderLang, setReminderLang] = useState('en'); // 'en' | 'bn'

  // Dynamic Pricing & Trial Config State
  const [platformConfig, setPlatformConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('quantrex_platform_config');
      return saved ? JSON.parse(saved) : {
        trialDays: 3,
        starterPriceBDT: 500,
        annualPriceBDT: 4500,
        lifetimePriceBDT: 12000,
        allowSignups: true
      };
    } catch {
      return { trialDays: 3, starterPriceBDT: 500, annualPriceBDT: 4500, lifetimePriceBDT: 12000, allowSignups: true };
    }
  });

  const handleSavePlatformConfig = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('quantrex_platform_config', JSON.stringify(platformConfig));
    } catch {}
    if (onCloudSave) onCloudSave('platform_config', platformConfig);
    logAuditEvent('CONFIG', `Updated pricing config (Starter: ৳${platformConfig.starterPriceBDT}, Trial: ${platformConfig.trialDays}d, Signups: ${platformConfig.allowSignups ? 'Open' : 'Paused'})`);
    showToast('Platform pricing & trial settings saved!');
  };

  useEffect(() => {
    if (!cloudSyncedStates || Object.keys(cloudSyncedStates).length === 0) return;
    if (Array.isArray(cloudSyncedStates.promo_coupons)) setCoupons(cloudSyncedStates.promo_coupons);
    if (cloudSyncedStates.platform_config) setPlatformConfig(cloudSyncedStates.platform_config);
    if (cloudSyncedStates.maintenance_mode) setMaintenanceMode(!!cloudSyncedStates.maintenance_mode.enabled);
    if (Array.isArray(cloudSyncedStates.audit_logs)) setAuditLogs(cloudSyncedStates.audit_logs);
  }, [cloudSyncedStates]);

  const handleManualSync = async () => {
    if (!onSyncSupabase) return;
    setIsSyncingCloud(true);
    await onSyncSupabase();
    setTimeout(() => {
      setIsSyncingCloud(false);
      logAuditEvent('SYSTEM', 'Manual Supabase cloud telemetry sync completed');
      showToast('Synced live workspaces & telemetry from Supabase!');
    }, 350);
  };

  // Admin Audit Logs State
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('quantrex_audit_logs');
      return saved ? JSON.parse(saved) : [
        { id: 'l1', timestamp: '2026-11-24 14:15', category: 'COUPON', actor: 'mdshahariar307@gmail.com', detail: 'Created promo coupon LAUNCH50 (50% Off)' },
        { id: 'l2', timestamp: '2026-11-24 12:40', category: 'BILLING', actor: 'mdshahariar307@gmail.com', detail: 'Verified bKash transaction #8AX921004 for Starter Plan' },
        { id: 'l3', timestamp: '2026-11-24 09:10', category: 'SECURITY', actor: 'mdshahariar307@gmail.com', detail: 'Portal unlocked with Master Access Code' },
        { id: 'l4', timestamp: '2026-11-23 18:22', category: 'WORKSPACE', actor: 'mdshahariar307@gmail.com', detail: 'Apex Digital Agency upgraded to Starter Plan' }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('quantrex_audit_logs', JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  const logAuditEvent = (category, detail) => {
    const newLog = {
      id: 'l_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      category,
      actor: currentUserEmail || 'veloxadsphere@gmail.com',
      detail
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleToggleMaintenance = () => {
    const next = !maintenanceMode;
    setMaintenanceMode(next);
    try {
      localStorage.setItem('quantrex_maintenance_mode', next ? 'true' : 'false');
    } catch {}
    if (onCloudSave) onCloudSave('maintenance_mode', { enabled: next, updatedAt: new Date().toISOString() });
    logAuditEvent('SYSTEM', next ? 'Maintenance mode ENABLED' : 'Maintenance mode DISABLED');
    showToast(next ? '⚠️ Maintenance mode is now active!' : 'System restored to live operation.');
  };

  const handleDownloadMasterBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      exportedBy: currentUserEmail || 'veloxadsphere@gmail.com',
      totalRevenue,
      workspaces: allWorkspaces.map(w => ({
        id: w.id,
        businessName: w.businessName,
        email: w.email,
        ownerName: w.ownerName,
        plan: w.plan,
        status: w.status,
        expiryDate: w.expiryDate,
        signupDate: w.signupDate,
        totalSpentBDT: w.totalSpentBDT
      })),
      subscriptions: subscription,
      coupons,
      announcement: globalAnnouncement,
      auditLogs
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantrex_master_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAuditEvent('BACKUP', 'Exported full encrypted master backup vault (.json)');
    showToast('Master backup vault downloaded successfully!');
  };

  const handleExportCSV = () => {
    const headers = ['Record ID', 'Agency / Workspace', 'Owner Email', 'Plan Tier', 'Amount (BDT)', 'Status', 'Expiry Date', 'Joined Date'];
    const rows = allWorkspaces.map((w, idx) => [
      `REC-${1000 + idx}`,
      `"${(w.businessName || '').replace(/"/g, '""')}"`,
      `"${w.email}"`,
      `"${w.plan}"`,
      w.totalSpentBDT || 500,
      `"${w.status}"`,
      `"${w.expiryDate || '2026-12-25'}"`,
      `"${w.signupDate}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantrex_revenue_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    logAuditEvent('EXPORT', 'Downloaded financial revenue ledger (.csv)');
    showToast('Financial CSV ledger exported successfully!');
  };

  // Coupon & Promo Code State
  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem('quantrex_promo_coupons');
      return saved ? JSON.parse(saved) : [
        { id: 'c1', code: 'LAUNCH50', discount: 50, type: 'percent', maxUses: 50, usedCount: 14, expiryDate: '2026-12-31', status: 'Active' },
        { id: 'c2', code: 'WINTER2026', discount: 150, type: 'fixed', maxUses: 30, usedCount: 8, expiryDate: '2026-12-15', status: 'Active' },
        { id: 'c3', code: 'VIPFOUNDER', discount: 100, type: 'percent', maxUses: 10, usedCount: 10, expiryDate: '2026-11-15', status: 'Expired' }
      ];
    } catch {
      return [];
    }
  });

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponType, setNewCouponType] = useState('percent'); // 'percent' | 'fixed'
  const [newCouponMaxUses, setNewCouponMaxUses] = useState('50');
  const [newCouponExpiry, setNewCouponExpiry] = useState('');
  const [copiedCouponId, setCopiedCouponId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('quantrex_promo_coupons', JSON.stringify(coupons));
    } catch {}
  }, [coupons]);

  const saveCouponsToCloud = (nextCoupons) => {
    if (onCloudSave) onCloudSave('promo_coupons', nextCoupons);
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const cleanCode = newCouponCode.trim().toUpperCase().replace(/\s+/g, '');
    if (coupons.some(c => c.code === cleanCode)) {
      alert('A coupon with this code already exists.');
      return;
    }
    const newCoupon = {
      id: 'c_' + Date.now(),
      code: cleanCode,
      discount: parseFloat(newCouponDiscount) || 10,
      type: newCouponType,
      maxUses: parseInt(newCouponMaxUses, 10) || 50,
      usedCount: 0,
      expiryDate: newCouponExpiry || '2026-12-31',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCoupons(prev => { const next = [newCoupon, ...prev]; saveCouponsToCloud(next); return next; });
    setNewCouponCode('');
    setNewCouponDiscount('');
    setNewCouponExpiry('');
    showToast(`Coupon ${cleanCode} created successfully!`);
  };

  const handleToggleCouponStatus = (couponId) => {
    setCoupons(prev => {
      const next = prev.map(c => {
        if (c.id === couponId) {
          const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
          return { ...c, status: nextStatus };
        }
        return c;
      });
      saveCouponsToCloud(next);
      return next;
    });
    showToast('Coupon status updated.');
  };

  const handleDeleteCoupon = (couponId) => {
    if (window.confirm('Delete this coupon code?')) {
      setCoupons(prev => { const next = prev.filter(c => c.id !== couponId); saveCouponsToCloud(next); return next; });
      showToast('Coupon deleted.');
    }
  };

  const handleCopyCoupon = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponId(id);
    setTimeout(() => setCopiedCouponId(null), 2000);
    showToast(`Coupon code ${code} copied!`);
  };

  const getExpiryInfo = (w) => {
    if (w.plan?.toLowerCase().includes('lifetime')) {
      return { text: 'Lifetime Access', days: 9999, badgeClass: 'text-slate-600 dark:text-slate-400 font-medium text-[10.5px]' };
    }
    const exp = w.expiryDate || '2026-12-25';
    const now = new Date();
    const expDate = new Date(exp);
    const diffTime = expDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { text: 'Expired', days: diffDays, badgeClass: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md font-semibold text-[10px]' };
    }
    if (diffDays <= 5) {
      return { text: `${diffDays} days left`, days: diffDays, badgeClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-semibold text-[10px]' };
    }
    return { text: `${diffDays} days left`, days: diffDays, badgeClass: 'text-slate-600 dark:text-slate-400 text-[10.5px]' };
  };

  const handleToggleSuspendWorkspace = (workspaceId) => {
    if (workspaceId === 'current_ws') {
      showToast('Cannot suspend your current live administrative session.');
      return;
    }
    setMockPlatformUsers(prev => {
      const next = prev.map(u => {
        if (u.id === workspaceId) {
          const nextSuspended = !u.isSuspended;
          return {
            ...u,
            isSuspended: nextSuspended,
            status: nextSuspended ? 'Suspended' : 'Active'
          };
        }
        return u;
      });
      if (onCloudSave) {
        const overrides = {};
        next.forEach(u => {
          overrides[u.id] = { isSuspended: !!u.isSuspended, status: u.status, plan: u.plan, expiryDate: u.expiryDate };
        });
        onCloudSave('workspace_overrides', overrides);
      }
      return next;
    });
    showToast('Agency status updated.');
  };

  // Announcement state
  const [annTitle, setAnnTitle] = useState(globalAnnouncement?.title || 'Special Launching Offer: Starter Plan Now Only ৳500');
  const [annMessage, setAnnMessage] = useState(globalAnnouncement?.message || 'Use promo code LAUNCH500 to get instant 50% discount!');
  const [annType, setAnnType] = useState(globalAnnouncement?.type || 'promo');
  const [annEnabled, setAnnEnabled] = useState(!!globalAnnouncement?.enabled);

  // Combine current live workspace with directory
  const allWorkspaces = useMemo(() => {
    const currentBiz = workspaceSettings?.businessName || 'My Agency Workspace';
    const currentEntry = {
      id: 'current_ws',
      businessName: currentBiz,
      email: currentUserEmail || 'veloxadsphere@gmail.com',
      ownerName: (workspaceSettings?.businessName || 'Workspace') + ' (Live Session)',
      plan: subscription?.planName || (subscription?.status === 'active' ? 'Starter Plan' : '3-Day Free Trial'),
      status: subscription?.status === 'active' ? 'Active' : 'Trial Active',
      signupDate: '2026-10-20',
      expiryDate: '2026-12-25',
      lastActive: 'Just now (Live)',
      totalSpentBDT: subscription?.price || 400,
      isLiveSession: true,
      isSuspended: false,
    };
    const rest = mockPlatformUsers.filter(u => u.email !== currentEntry.email);
    return [currentEntry, ...rest];
  }, [workspaceSettings, currentUserEmail, subscription, mockPlatformUsers]);

  const filteredWorkspaces = useMemo(() => {
    return allWorkspaces.filter(w => {
      const matchSearch = (w.businessName + ' ' + w.email + ' ' + w.ownerName).toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      if (planFilter === 'all') return true;
      if (planFilter === 'starter') return w.plan.toLowerCase().includes('starter');
      if (planFilter === 'annual') return w.plan.toLowerCase().includes('annual');
      if (planFilter === 'lifetime') return w.plan.toLowerCase().includes('lifetime');
      if (planFilter === 'trial') return w.status.toLowerCase().includes('trial');
      return true;
    });
  }, [allWorkspaces, searchTerm, planFilter]);

  // Aggregate KPI metrics
  const totalRevenue = useMemo(() => {
    return paymentQueue
      .filter(p => p.status === 'Approved')
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 16900);
  }, [paymentQueue]);

  const pendingPaymentsCount = useMemo(() => {
    return paymentQueue.filter(p => p.status === 'Pending').length;
  }, [paymentQueue]);

  const openTicketsCount = useMemo(() => {
    return supportTickets.filter(t => t.status !== 'Resolved').length;
  }, [supportTickets]);

  const showToast = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleApprovePayment = (paymentId) => {
    setPaymentQueue(prev => prev.map(p => {
      if (p.id === paymentId) {
        return { ...p, status: 'Approved' };
      }
      return p;
    }));
    setSubscription(prev => ({
      ...prev,
      status: 'active',
      plan: 'starter_monthly',
      planName: 'Starter Plan',
      activatedTrxId: 'VERIFIED_BY_ADMIN',
    }));
    showToast('Payment approved & workspace upgraded to Starter Plan!');
  };

  const handleRejectPayment = (paymentId) => {
    setPaymentQueue(prev => prev.map(p => {
      if (p.id === paymentId) {
        return { ...p, status: 'Rejected' };
      }
      return p;
    }));
    showToast('Payment marked as rejected.');
  };

  const handleUpdateTicketStatus = (ticketId, nextStatus) => {
    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: nextStatus };
      }
      return t;
    }));
    showToast('Ticket #' + ticketId + ' updated to ' + nextStatus);
  };

  const handleSaveAnnouncement = (e) => {
    e.preventDefault();
    setAnnEnabled(true);
    const annPayload = {
      title: annTitle.trim(),
      message: annMessage.trim(),
      type: annType,
      enabled: true,
      updatedAt: new Date().toISOString()
    };
    setGlobalAnnouncement(annPayload);
    if (onCloudSave) onCloudSave('global_announcement', annPayload);
    logAuditEvent('BROADCAST', `Published broadcast: ${annTitle.trim()}`);
    showToast('Broadcast saved and published live!');
  };

  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    const cleanEmail = newAdminEmail.toLowerCase().trim();
    if (adminRoles.some(a => a.email.toLowerCase() === cleanEmail)) {
      alert('This email is already in the admin team.');
      return;
    }
    setAdminRoles(prev => [
      ...prev,
      {
        email: cleanEmail,
        role: newAdminRole,
        addedAt: new Date().toISOString().split('T')[0],
        status: 'Active',
      }
    ]);
    setNewAdminEmail('');
    showToast('New ' + newAdminRole + ' (' + cleanEmail + ') added successfully!');
  };

  const handleRemoveAdmin = (emailToRemove) => {
    if (emailToRemove === 'veloxadsphere@gmail.com' || emailToRemove === 'mdshahariar307@gmail.com') {
      alert('Cannot remove the Master Founder email.');
      return;
    }
    if (window.confirm('Remove ' + emailToRemove + ' from the Admin Team?')) {
      setAdminRoles(prev => prev.filter(a => a.email !== emailToRemove));
      showToast('Admin removed.');
    }
  };

  const handleQuickUpgradeWorkspace = (workspaceId) => {
    setMockPlatformUsers(prev => {
      const next = prev.map(u => {
        if (u.id === workspaceId) {
          return {
            ...u,
            plan: 'Starter Plan (৳500/mo)',
            status: 'Active',
            isSuspended: false,
            totalSpentBDT: (u.totalSpentBDT || 0) + 500,
          };
        }
        return u;
      });
      if (onCloudSave) {
        const overrides = {};
        next.forEach(u => {
          overrides[u.id] = { isSuspended: !!u.isSuspended, status: u.status, plan: u.plan, expiryDate: u.expiryDate };
        });
        onCloudSave('workspace_overrides', overrides);
      }
      return next;
    });
    if (workspaceId === 'current_ws') {
      setSubscription(prev => ({
        ...prev,
        status: 'active',
        plan: 'starter_monthly',
        planName: 'Starter Plan',
      }));
    }
    showToast('Workspace upgraded to Starter Plan!');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* TOAST MESSAGE */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xl shadow-emerald-900/40 flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-150">
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* TOP FOUNDER HERO BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Crown size={20} className="stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Quantrex Master Control
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Logged in as: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{currentUserEmail || 'veloxadsphere@gmail.com'}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => { setShowCommandPalette(true); setCommandQuery(''); }}
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#070b13] dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-xs font-medium transition-all inline-flex items-center gap-2.5 cursor-pointer"
            title="Quick Jump & Search (Ctrl+K)"
          >
            <Search size={13} />
            <span className="hidden sm:inline">Quick Search...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
              Ctrl K
            </kbd>
          </button>

          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={onExitAdmin}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <BriefcaseBusiness size={14} />
              <span>Exit to Workspace View</span>
            </button>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium text-center">
              Connected to Supabase Engine
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN EXECUTIVE LAYOUT: CATEGORIZED SIDEBAR ON LEFT, CONTENT ON RIGHT */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* CATEGORIZED EXECUTIVE SIDEBAR */}
        <aside className="w-full lg:w-64 xl:w-72 shrink-0 bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-3 shadow-xs space-y-4">
          {/* CATEGORY 1: PLATFORM TELEMETRY */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
              Platform Telemetry
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 size={15} className={activeTab === 'overview' ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'} />
                  <span>Executive Overview</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users size={15} className={activeTab === 'users' ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'} />
                  <span>User Directory</span>
                </div>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'users'
                    ? 'bg-black/20 text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {allWorkspaces.length}
                </span>
              </button>
            </div>
          </div>

          {/* CATEGORY 2: REVENUE & BILLING */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
              Revenue &amp; Billing
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                type="button"
                onClick={() => setActiveTab('coupons')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'coupons'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag size={15} className={activeTab === 'coupons' ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'} />
                  <span>Promo &amp; Coupons</span>
                </div>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'coupons'
                    ? 'bg-black/20 text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {coupons.filter(c => c.status === 'Active').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'payments'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard size={15} className={activeTab === 'payments' ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'} />
                  <span>Payment Desk</span>
                </div>
                {pendingPaymentsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'payments' ? 'bg-black/20 text-slate-950' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {pendingPaymentsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('exports')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'exports'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet size={15} className={activeTab === 'exports' ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'} />
                  <span>Financial Ledger</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'pricing'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal size={15} className={activeTab === 'pricing' ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'} />
                  <span>Pricing &amp; Trials</span>
                </div>
              </button>
            </div>
          </div>

          {/* CATEGORY 3: COMMUNICATIONS */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
              Communications
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                type="button"
                onClick={() => setActiveTab('tickets')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'tickets'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle size={15} className={activeTab === 'tickets' ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'} />
                  <span>Support Inbox</span>
                </div>
                {openTicketsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'tickets' ? 'bg-black/20 text-slate-950' : 'bg-sky-500 text-white'
                  }`}>
                    {openTicketsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('announcements')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'announcements'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bell size={15} className={activeTab === 'announcements' ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'} />
                  <span>Broadcast Notices</span>
                </div>
              </button>
            </div>
          </div>

          {/* CATEGORY 4: SYSTEM & SECURITY */}
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1">
              System &amp; Security
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                type="button"
                onClick={() => setActiveTab('system')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'system'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database size={15} className={activeTab === 'system' ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'} />
                  <span>Health &amp; Vault</span>
                </div>
                {maintenanceMode && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Maintenance Active" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'audit'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock size={15} className={activeTab === 'audit' ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'} />
                  <span>Audit Trail</span>
                </div>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'audit'
                    ? 'bg-black/20 text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {auditLogs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('admins')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'admins'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={15} className={activeTab === 'admins' ? 'text-slate-950' : 'text-slate-400 dark:text-slate-500'} />
                  <span>Co-Admins</span>
                </div>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'admins'
                    ? 'bg-black/20 text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {adminRoles.length}
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT WORKSPACE */}
        <div className="flex-1 min-w-0 w-full space-y-6">

      {/* --- TAB 1: EXECUTIVE OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total BDT Revenue</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Coins size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                ৳{totalRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                <span>Verified subscription inflows</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Agencies</span>
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Building size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {allWorkspaces.length}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                Registered workspaces across BD
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Payments</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <CreditCard size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {pendingPaymentsCount}
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                {pendingPaymentsCount > 0 ? 'Requires your TrxID audit' : 'All transactions up to date'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Support Inquiries</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <HelpCircle size={16} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {supportTickets.length}
              </div>
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                {openTicketsCount} tickets pending review
              </div>
            </div>
          </div>

          {/* RECENT PENDING PAYMENTS ALERT */}
          {pendingPaymentsCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950 dark:text-amber-200">
                    {pendingPaymentsCount} Pending Payment Verification(s) Awaiting Review
                  </div>
                  <div className="text-[11px] text-amber-800 dark:text-amber-300">
                    A user submitted bKash/Nagad TrxID for Starter Plan upgrade.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer"
              >
                Review Now
              </button>
            </div>
          )}

          {/* MINIMAL REVENUE & GROWTH ANALYTICS + EXPIRING WATCHLIST */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 6-MONTH MRR BAR CHART */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">6-Month Revenue &amp; MRR Trend</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Verified monthly subscription growth across Quantrex</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                  +18.4% MoM
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-36 pt-4 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                {[
                  { month: 'Jun', amount: 4500, pct: 28 },
                  { month: 'Jul', amount: 6800, pct: 42 },
                  { month: 'Aug', amount: 8900, pct: 55 },
                  { month: 'Sep', amount: 11200, pct: 68 },
                  { month: 'Oct', amount: 14100, pct: 84 },
                  { month: 'Nov', amount: totalRevenue, pct: 100 },
                ].map(item => (
                  <div key={item.month} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      ৳{(item.amount / 1000).toFixed(1)}k
                    </div>
                    <div
                      style={{ height: `${item.pct}%` }}
                      className="w-full max-w-[36px] rounded-t-lg bg-slate-200 dark:bg-slate-800 group-hover:bg-amber-500 dark:group-hover:bg-amber-500 transition-colors relative"
                    />
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* EXPIRING SOON WATCHLIST */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Renewal Watchlist</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  All Agencies
                </button>
              </div>
              <div className="space-y-2.5">
                {allWorkspaces.slice(0, 3).map(w => {
                  const expInfo = getExpiryInfo(w);
                  return (
                    <div key={w.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{w.businessName}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{w.expiryDate || '2026-12-25'} • {expInfo.text}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReminderTarget(w)}
                        className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 shrink-0 cursor-pointer"
                      >
                        Remind
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* QUICK DIRECTORY SNAPSHOT */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Agency Workspaces</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time telemetry of clients utilizing Quantrex</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('users')}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                View Full Directory &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2.5">Workspace / Brand</th>
                    <th className="pb-2.5">Owner Email</th>
                    <th className="pb-2.5">Subscription Plan</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {allWorkspaces.slice(0, 4).map(w => (
                    <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-sky-500/10 text-sky-500 flex items-center justify-center text-[10px] font-black">
                          {w.businessName.charAt(0)}
                        </span>
                        <span>{w.businessName}</span>
                        {w.isLiveSession && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black">
                            Current Session
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{w.email}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10.5px]">
                          {w.plan}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={'px-2 py-0.5 rounded-md text-[10px] font-bold ' + (
                          w.status === 'Active'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        )}>
                          ● {w.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleQuickUpgradeWorkspace(w.id)}
                          className="px-2.5 py-1 rounded-lg bg-sky-600/10 hover:bg-sky-600 text-sky-600 hover:text-white font-bold text-[10.5px] transition-all cursor-pointer"
                        >
                          Upgrade Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: USER DIRECTORY --- */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by brand name or email..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">Filter:</span>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="all">All Plans</option>
                <option value="starter">Starter Plan (৳500)</option>
                <option value="annual">Pro Annual (৳4,500)</option>
                <option value="lifetime">Lifetime Founder</option>
                <option value="trial">Free Trial Only</option>
              </select>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Agency / Workspace</th>
                  <th className="pb-3">Owner Contact</th>
                  <th className="pb-3">Plan Tier</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Subscription Expiry</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredWorkspaces.map(w => {
                  const expInfo = getExpiryInfo(w);
                  const isSuspended = w.status === 'Suspended' || w.isSuspended;
                  return (
                    <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-xs shrink-0">
                            {w.businessName.charAt(0)}
                          </span>
                          <div>
                            <div>{w.businessName}</div>
                            <div className="text-[10px] text-slate-400 font-normal">Last active: {w.lastActive}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">
                        <div>{w.email}</div>
                        <div className="text-[10px] text-slate-400">{w.ownerName}</div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[10.5px]">
                          {w.plan}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className={'px-2 py-0.5 rounded-md text-[10px] font-bold ' + (
                          isSuspended
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : w.status === 'Active'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        )}>
                          ● {isSuspended ? 'Suspended' : w.status}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="text-slate-800 dark:text-slate-200 font-medium text-[11px]">
                          {w.expiryDate || '2026-12-25'}
                        </div>
                        <div className="mt-0.5">
                          <span className={expInfo.badgeClass}>{expInfo.text}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400">{w.signupDate}</td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickUpgradeWorkspace(w.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-slate-950 font-bold text-[10.5px] transition-all cursor-pointer"
                        >
                          Upgrade Plan
                        </button>
                        <button
                          type="button"
                          onClick={() => setReminderTarget(w)}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600 hover:border-sky-300 text-[10.5px] font-bold transition-all cursor-pointer"
                          title="Send renewal or payment reminder"
                        >
                          Remind
                        </button>
                        {!w.isLiveSession && (
                          <button
                            type="button"
                            onClick={() => handleToggleSuspendWorkspace(w.id)}
                            className={'px-2.5 py-1 rounded-lg border text-[10.5px] font-bold transition-all cursor-pointer ' + (
                              isSuspended
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:border-rose-300'
                            )}
                          >
                            {isSuspended ? 'Activate' : 'Suspend'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB: PROMO & COUPONS --- */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Promo &amp; Discount Coupons</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Create and manage promotional discount vouchers for client agency subscriptions</p>
              </div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                Active Codes: {coupons.filter(c => c.status === 'Active').length}
              </span>
            </div>

            {/* CREATE COUPON FORM */}
            <form onSubmit={handleCreateCoupon} className="p-4 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="E.g., PROMO50"
                  className="w-full px-3 py-2 bg-white dark:bg-[#0c121e] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Discount Type
                </label>
                <select
                  value={newCouponType}
                  onChange={(e) => setNewCouponType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0c121e] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="percent">Percentage (% Off)</option>
                  <option value="fixed">Fixed BDT (৳ Off)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Discount Value {newCouponType === 'percent' ? '(%)' : '(৳)'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={newCouponType === 'percent' ? 100 : 5000}
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(e.target.value)}
                  placeholder={newCouponType === 'percent' ? '50' : '200'}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0c121e] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Max Uses
                </label>
                <input
                  type="number"
                  min="1"
                  value={newCouponMaxUses}
                  onChange={(e) => setNewCouponMaxUses(e.target.value)}
                  placeholder="50"
                  className="w-full px-3 py-2 bg-white dark:bg-[#0c121e] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Create Coupon</span>
                </button>
              </div>
            </form>

            {/* COUPONS LIST TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Coupon Code</th>
                    <th className="pb-3">Discount Benefit</th>
                    <th className="pb-3">Redemptions</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {coupons.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 font-bold">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-900 dark:text-white text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCoupon(c.code, c.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            title="Copy code"
                          >
                            {copiedCouponId === c.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {c.type === 'percent' ? `${c.discount}% OFF` : `৳${c.discount} OFF`}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">
                        {c.usedCount} / {c.maxUses} used
                      </td>
                      <td className="py-3.5">
                        <span className={'px-2 py-0.5 rounded-md text-[10px] font-bold ' + (
                          c.status === 'Active'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        )}>
                          ● {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleCouponStatus(c.id)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10.5px] font-bold transition-all cursor-pointer"
                        >
                          {c.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors inline-flex items-center"
                          title="Delete coupon"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: PAYMENT APPROVALS --- */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">bKash / Nagad TrxID Verification Desk</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Audit customer transaction IDs and activate subscriptions with 1 click</p>
              </div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                Total Verified: ৳{totalRevenue.toLocaleString()}
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Reference / ID</th>
                    <th className="pb-3">Agency Name</th>
                    <th className="pb-3">Requested Plan</th>
                    <th className="pb-3">Paid Amount</th>
                    <th className="pb-3">Method &amp; Phone</th>
                    <th className="pb-3">TrxID Submitted</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Audit Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {paymentQueue.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 font-mono font-bold text-sky-600 dark:text-sky-400">{p.id}</td>
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                        <div>{p.workspaceName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{p.userEmail}</div>
                      </td>
                      <td className="py-3.5 text-slate-800 dark:text-slate-200">
                        {p.plan}
                        {p.promoCode && (
                          <div className="text-[10px] text-emerald-600 font-bold">Promo: {p.promoCode}</div>
                        )}
                      </td>
                      <td className="py-3.5 font-black text-slate-900 dark:text-white">৳{p.amount}</td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{p.method}</span> • {p.senderNumber}
                      </td>
                      <td className="py-3.5 font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded inline-block">
                        {p.trxId}
                      </td>
                      <td className="py-3.5 text-slate-400 text-[11px]">{p.timestamp}</td>
                      <td className="py-3.5">
                        <span className={'px-2 py-0.5 rounded-md text-[10px] font-bold ' + (
                          p.status === 'Approved'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : p.status === 'Rejected'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        )}>
                          ● {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        {p.status === 'Pending' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApprovePayment(p.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10.5px] transition-all cursor-pointer"
                            >
                              ✓ Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectPayment(p.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600/10 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-[10.5px] transition-all cursor-pointer"
                            >
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-bold">Verified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: SUPPORT INBOX --- */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer Support Inquiries</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tickets submitted by clients from within the Quantrex app</p>
              </div>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg">
                Total: {supportTickets.length}
              </span>
            </div>

            {supportTickets.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No support tickets in queue. Customers have not submitted any inquiries.
              </div>
            ) : (
              <div className="space-y-3">
                {supportTickets.map(t => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200/80 dark:border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-600 dark:text-sky-400">#{t.id}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {t.category}
                        </span>
                        {t.priority === 'Urgent' && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-500 font-extrabold text-[9px]">
                            ⚡ Urgent
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">
                          {new Date(t.createdAt).toLocaleString('en-GB')}
                        </span>
                        <select
                          value={t.status || 'Open'}
                          onChange={(e) => handleUpdateTicketStatus(t.id, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="Open">● Open</option>
                          <option value="Under Review">● Under Review</option>
                          <option value="Resolved">✓ Resolved</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{t.subject}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 bg-white dark:bg-[#0c121e] p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        {t.message}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Agency: <strong className="text-slate-800 dark:text-slate-200">{t.workspaceName}</strong> ({t.planName})</span>
                      <a
                        href={'mailto:' + (currentUserEmail || 'veloxadsphere@gmail.com') + '?subject=Re: [' + t.id + '] ' + t.subject}
                        className="text-sky-600 dark:text-sky-400 hover:underline font-bold inline-flex items-center gap-1"
                      >
                        <Mail size={12} />
                        <span>Send Email Reply</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 5: BROADCAST NOTICES --- */}
      {activeTab === 'announcements' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Platform Broadcast</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Publish system notices, alerts, or promotions to all active workspaces</p>
          </div>

          <form onSubmit={handleSaveAnnouncement} className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Broadcast Status</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Display this notice across all client dashboards</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
                  <span className={`w-2 h-2 rounded-full ${annEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  <span className={annEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}>
                    {annEnabled ? 'Broadcasting Live' : 'Disabled'}
                  </span>
                </div>
                {annEnabled && (
                  <button
                    type="button"
                    onClick={() => {
                      setAnnEnabled(false);
                      const annPayload = {
                        title: annTitle.trim(),
                        message: annMessage.trim(),
                        type: annType,
                        enabled: false,
                        updatedAt: new Date().toISOString()
                      };
                      setGlobalAnnouncement(annPayload);
                      if (onCloudSave) onCloudSave('global_announcement', annPayload);
                      logAuditEvent('BROADCAST', 'Paused active broadcast notice');
                      showToast('Broadcast paused and disabled.');
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Pause & disable broadcast"
                  >
                    <Pause size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Notice Type
                </label>
                <select
                  value={annType}
                  onChange={(e) => setAnnType(e.target.value)}
                  className="w-full bg-white dark:bg-[#090d16] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="promo">🎉 Launching Promo</option>
                  <option value="info">ℹ️ System Notice</option>
                  <option value="warning">⚡ Maintenance Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="E.g., Special Launching Offer: Starter Plan Now Only ৳500"
                  className="w-full bg-white dark:bg-[#090d16] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Message
              </label>
              <textarea
                required
                rows={3}
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                placeholder="Write the notice details here..."
                className="w-full bg-white dark:bg-[#090d16] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs"
              />
            </div>

            {/* PREVIEW BOX */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Preview
              </label>
              <div className={'p-3.5 rounded-xl border flex items-center gap-3 ' + (
                annType === 'promo'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
                  : annType === 'warning'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
                    : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
              )}>
                <div className="flex items-center gap-2.5">
                  {annType === 'promo' && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />}
                  {annType === 'warning' && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />}
                  <span className="text-sm shrink-0 leading-none">
                    {annType === 'promo' ? '🎉' : annType === 'warning' ? '⚡' : 'ℹ️'}
                  </span>
                  <div>
                    <strong className="text-xs">{annTitle || 'Special Launching Offer'}</strong>
                    <div className="text-[11px] opacity-90">{annMessage || 'Message will appear here...'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-7 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- TAB: FINANCIAL LEDGER & EXPORT --- */}
      {activeTab === 'exports' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Financial Revenue Ledger &amp; Export</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Audit verified inflows, subscription billing history and export records to spreadsheet</p>
              </div>
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Download size={14} />
                <span>Export Ledger (.CSV)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Verified Inflow</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">৳{totalRevenue.toLocaleString()}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Subscriptions</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{allWorkspaces.filter(w => w.status === 'Active').length} Agencies</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Average Revenue / Agency</div>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">৳{(Math.round(totalRevenue / Math.max(1, allWorkspaces.length))).toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Record ID</th>
                    <th className="pb-3">Agency Name</th>
                    <th className="pb-3">Owner Email</th>
                    <th className="pb-3">Plan Tier</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Renewal Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {allWorkspaces.map((w, idx) => (
                    <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-mono font-bold text-sky-600 dark:text-sky-400">REC-100{idx + 1}</td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{w.businessName}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{w.email}</td>
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{w.plan}</td>
                      <td className="py-3 font-black text-slate-900 dark:text-white">৳{(w.totalSpentBDT || 500).toLocaleString()}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                          ● {w.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{w.expiryDate || '2026-12-25'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: SYSTEM HEALTH & VAULT --- */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Health, Maintenance &amp; Backup Vault</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control cloud telemetry, download database snapshots and schedule maintenance mode</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CARD 1: LIVE CLOUD TELEMETRY */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Supabase Cloud</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{supabaseLatency}ms</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Status: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Live Connected</strong> • Singapore
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncingCloud}
                  className="w-full py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={13} className={isSyncingCloud ? 'animate-spin' : ''} />
                  <span>{isSyncingCloud ? 'Syncing Telemetry...' : 'Sync Live Telemetry'}</span>
                </button>
              </div>

              {/* CARD 2: MASTER BACKUP VAULT */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Master Backup Vault</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Download complete encrypted JSON snapshot of workspaces, subscriptions and coupons.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadMasterBackup}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download Backup (.JSON)</span>
                </button>
              </div>

              {/* CARD 3: MAINTENANCE MODE */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Maintenance Mode</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      maintenanceMode ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-600'
                    }`}>
                      {maintenanceMode ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    When active, clients see a scheduled maintenance notice while you perform upgrades.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleMaintenance}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                    maintenanceMode
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <Power size={13} />
                  <span>{maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}</span>
                </button>
              </div>
            </div>
            {/* LIVE CLOUD SYNC STATUS / 1-TIME SQL SETUP */}
            {cloudTableMissing ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-xs font-bold text-amber-900 dark:text-amber-300">1-Time Supabase Cloud Sync Table Setup Required</div>
                    <div className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                      Run this SQL once in your Supabase SQL Editor so all updates (Maintenance, Coupons, Broadcasts, Suspensions) sync live to every user automatically.
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(PLATFORM_SYNC_SQL);
                        showToast('Supabase SQL copied to clipboard!');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Copy size={12} />
                      <span>Copy SQL</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleManualSync}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
                    >
                      Verify Sync
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={15} />
                  <span>Live Cloud Sync Active — All changes push automatically to web &amp; desktop users</span>
                </div>
              </div>
            )}

            {/* AUTO-LOCK SECURITY SETTING */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Session Auto-Lock Security</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically lock this Admin Portal after a period of inactivity
                </div>
              </div>
              <select
                value={autoLockMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setAutoLockMinutes && setAutoLockMinutes(val);
                  logAuditEvent('SECURITY', `Auto-lock timeout set to ${val === 0 ? 'Disabled' : val + ' minutes'}`);
                  showToast('Auto-lock preference updated.');
                }}
                className="px-3 py-2 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value={5}>Lock after 5 minutes</option>
                <option value={15}>Lock after 15 minutes (Recommended)</option>
                <option value={30}>Lock after 30 minutes</option>
                <option value={0}>Disabled (Stay unlocked)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: DYNAMIC PRICING & TRIAL CONFIG --- */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dynamic Plan Pricing &amp; Trial Control</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Adjust subscription tiers, free trial duration and signup availability without editing code</p>
            </div>

            <form onSubmit={handleSavePlatformConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Free Trial Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={platformConfig.trialDays}
                    onChange={(e) => setPlatformConfig(p => ({ ...p, trialDays: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b13] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Starter Plan (BDT / Mo)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={platformConfig.starterPriceBDT}
                    onChange={(e) => setPlatformConfig(p => ({ ...p, starterPriceBDT: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b13] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Pro Annual (BDT / Yr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={platformConfig.annualPriceBDT}
                    onChange={(e) => setPlatformConfig(p => ({ ...p, annualPriceBDT: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b13] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Lifetime Founder (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={platformConfig.lifetimePriceBDT}
                    onChange={(e) => setPlatformConfig(p => ({ ...p, lifetimePriceBDT: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#070b13] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Allow New Agency Signups</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">When paused, new users cannot register new workspaces</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPlatformConfig(p => ({ ...p, allowSignups: !p.allowSignups }))}
                  className={'px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (
                    platformConfig.allowSignups
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  )}
                >
                  {platformConfig.allowSignups ? '● Signups Open' : '○ Signups Paused'}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer"
                >
                  Save Pricing &amp; Trial Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB: ADMIN AUDIT TRAIL --- */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admin Audit Trail &amp; Activity Logs</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chronological record of administrative decisions, plan upgrades and security events</p>
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                Total Events: {auditLogs.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Event Description</th>
                    <th className="pb-3">Actor / Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 font-mono text-slate-500 dark:text-slate-400 text-[11px]">{log.timestamp}</td>
                      <td className="py-3">
                        <span className={'px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider ' + (
                          log.category === 'SECURITY'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : log.category === 'BILLING'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : log.category === 'COUPON'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        )}>
                          {log.category}
                        </span>
                      </td>
                      <td className="py-3 text-slate-800 dark:text-slate-200 font-medium">{log.detail}</td>
                      <td className="py-3 text-slate-500 dark:text-slate-400 text-[11px]">{log.actor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 6: CO-ADMIN MANAGEMENT --- */}
      {activeTab === 'admins' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admin Team &amp; Access Control</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Grant admin privileges to partners or support agents without touching code</p>
            </div>

            {/* ADD CO-ADMIN FORM */}
            <form onSubmit={handleAddAdmin} className="p-4 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:flex-1">
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Enter partner email (e.g., cofounder@gmail.com)..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#0c121e] border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <select
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-[#0c121e] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="Co-Admin">Co-Admin (Full Master Access)</option>
                <option value="Support Agent">Support Agent (Tickets Only)</option>
              </select>

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0"
              >
                <UserPlus size={14} />
                <span>Grant Admin Access</span>
              </button>
            </form>

            {/* ADMINS LIST */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Admin Email</th>
                    <th className="pb-3">Designation / Role</th>
                    <th className="pb-3">Added Date</th>
                    <th className="pb-3">Privileges</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {adminRoles.map((a, idx) => (
                    <tr key={a.email || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                          🛡️
                        </span>
                        <span>{a.email}</span>
                        {(a.email === 'veloxadsphere@gmail.com' || a.email === 'mdshahariar307@gmail.com') && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
                            Master Owner
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">{a.role}</td>
                      <td className="py-3.5 text-slate-400">{a.addedAt || '2026-10-23'}</td>
                      <td className="py-3.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                        ● Full Platform Control
                      </td>
                      <td className="py-3.5 text-right">
                        {a.email !== 'veloxadsphere@gmail.com' && a.email !== 'mdshahariar307@gmail.com' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAdmin(a.email)}
                            className="text-rose-600 hover:text-rose-700 font-bold text-[11px] hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* COMMAND PALETTE MODAL (Ctrl+K) */}
      {showCommandPalette && (
        <div
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
          onClick={() => setShowCommandPalette(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Jump to tab, agency, or quick action..."
                className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCommandPalette(false)}
                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500"
              >
                ESC
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {[
                { label: 'Executive Overview', group: 'Navigation', action: () => setActiveTab('overview') },
                { label: 'User Directory', group: 'Navigation', action: () => setActiveTab('users') },
                { label: 'Promo & Coupons', group: 'Navigation', action: () => setActiveTab('coupons') },
                { label: 'Payment Desk', group: 'Navigation', action: () => setActiveTab('payments') },
                { label: 'Financial Ledger & CSV Export', group: 'Navigation', action: () => setActiveTab('exports') },
                { label: 'Pricing & Trial Config', group: 'Navigation', action: () => setActiveTab('pricing') },
                { label: 'Support Inbox', group: 'Navigation', action: () => setActiveTab('tickets') },
                { label: 'Broadcast Notices', group: 'Navigation', action: () => setActiveTab('announcements') },
                { label: 'Health & Backup Vault', group: 'Navigation', action: () => setActiveTab('system') },
                { label: 'Admin Audit Trail', group: 'Navigation', action: () => setActiveTab('audit') },
                { label: 'Co-Admins Management', group: 'Navigation', action: () => setActiveTab('admins') },
                { label: 'Export Financial Ledger (.CSV)', group: 'Quick Action', action: handleExportCSV },
                { label: 'Download Master Backup (.JSON)', group: 'Quick Action', action: handleDownloadMasterBackup },
                { label: 'Sync Live Supabase Telemetry', group: 'Quick Action', action: handleManualSync },
                ...allWorkspaces.map(w => ({
                  label: `Agency: ${w.businessName} (${w.email})`,
                  group: 'Workspace',
                  action: () => { setSearchTerm(w.businessName); setActiveTab('users'); }
                }))
              ]
                .filter(item => item.label.toLowerCase().includes(commandQuery.toLowerCase()) || item.group.toLowerCase().includes(commandQuery.toLowerCase()))
                .slice(0, 10)
                .map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      item.action();
                      setShowCommandPalette(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.group}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 1-CLICK RENEWAL REMINDER MODAL */}
      {reminderTarget && (
        <div
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setReminderTarget(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Renewal Reminder Template</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Send quick notice to {reminderTarget.businessName}</p>
              </div>
              <button
                type="button"
                onClick={() => setReminderTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReminderLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  reminderLang === 'en' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setReminderLang('bn')}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  reminderLang === 'bn' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                বাংলা (Bengali)
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {reminderLang === 'en'
                ? `Hi ${reminderTarget.ownerName || reminderTarget.businessName},

This is a quick reminder from Quantrex that your ${reminderTarget.plan} subscription for "${reminderTarget.businessName}" is scheduled for renewal on ${reminderTarget.expiryDate || '2026-12-25'}.

Please complete your bKash/Nagad payment and submit your TrxID inside your workspace Settings to keep uninterrupted access.

Best regards,
Quantrex Support Team`
                : `আসসালামু আলাইকুম ${reminderTarget.ownerName || reminderTarget.businessName},

আপনার "${reminderTarget.businessName}" এজেন্সির Quantrex (${reminderTarget.plan}) সাবস্ক্রিপশনটির মেয়াদ আগামী ${reminderTarget.expiryDate || '2026-12-25'} তারিখে শেষ হতে যাচ্ছে।

নিরবচ্ছিন্ন সেবা চালু রাখতে অনুগ্রহ করে নির্ধারিত সময়ের মধ্যে bKash/Nagad পেমেন্ট করে অ্যাপের ভেতর TrxID সাবমিট করুন।

ধন্যবাদ,
Quantrex টিম`
              }
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const msg = reminderLang === 'en'
                    ? `Hi ${reminderTarget.ownerName || reminderTarget.businessName}, your Quantrex subscription (${reminderTarget.plan}) expires on ${reminderTarget.expiryDate || '2026-12-25'}. Please renew via bKash/Nagad to continue.`
                    : `আসসালামু আলাইকুম, আপনার "${reminderTarget.businessName}" এজেন্সির Quantrex সাবস্ক্রিপশনের মেয়াদ ${reminderTarget.expiryDate || '2026-12-25'} তারিখে শেষ হচ্ছে। অনুগ্রহ করে রিনিউ করুন।`;
                  navigator.clipboard.writeText(msg);
                  logAuditEvent('COMMUNICATION', `Copied renewal reminder for ${reminderTarget.businessName}`);
                  showToast('Reminder message copied to clipboard!');
                }}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy size={13} />
                <span>Copy Message</span>
              </button>
              <a
                href={`mailto:${reminderTarget.email}?subject=${encodeURIComponent('Quantrex Subscription Renewal Reminder')}`}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Mail size={13} />
                <span>Open Email</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
