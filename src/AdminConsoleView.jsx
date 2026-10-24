import React, { useState, useMemo } from 'react';
import {
  Crown, Users, CreditCard, Coins, Building, TrendingUp,
  AlertCircle, CheckCircle2, Search, Filter, Mail, HelpCircle,
  Bell, Sparkles, ShieldCheck, UserPlus, Trash2, ArrowRight,
  ExternalLink, Check, Copy, SlidersHorizontal, BriefcaseBusiness,
  BarChart3, RefreshCw, X, ChevronRight
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
  onExitAdmin
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'payments' | 'tickets' | 'announcements' | 'admins'
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('Co-Admin');
  const [statusMessage, setStatusMessage] = useState('');

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
      lastActive: 'Just now (Live)',
      totalSpentBDT: subscription?.price || 400,
      isLiveSession: true,
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
    setGlobalAnnouncement({
      title: annTitle.trim(),
      message: annMessage.trim(),
      type: annType,
      enabled: annEnabled,
      updatedAt: new Date().toISOString()
    });
    showToast('Global announcement broadcast saved!');
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
    setMockPlatformUsers(prev => prev.map(u => {
      if (u.id === workspaceId) {
        return {
          ...u,
          plan: 'Starter Plan (৳500/mo)',
          status: 'Active',
          totalSpentBDT: (u.totalSpentBDT || 0) + 500,
        };
      }
      return u;
    }));
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
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0d1527] via-[#09101d] to-[#0d1627] border border-amber-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/25 shrink-0">
              <Crown size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-black text-white tracking-wide">
                  Quantrex Master Control
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-[10px] uppercase tracking-wider">
                  👑 Super Admin / Founder
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                  ● System Live
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Logged in as: <strong className="text-slate-200">{currentUserEmail || 'veloxadsphere@gmail.com'}</strong> • Connected to Supabase Engine
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onExitAdmin}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <BriefcaseBusiness size={14} />
              <span>Exit to Workspace View</span>
            </button>
          </div>
        </div>
      </div>

      {/* ADMIN TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ' + (
            activeTab === 'overview'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <BarChart3 size={14} />
          <span>Executive Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ' + (
            activeTab === 'users'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Users size={14} />
          <span>User Directory</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-current">
            {allWorkspaces.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ' + (
            activeTab === 'payments'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <CreditCard size={14} />
          <span>Payment Approvals</span>
          {pendingPaymentsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-extrabold animate-pulse">
              {pendingPaymentsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ' + (
            activeTab === 'tickets'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <HelpCircle size={14} />
          <span>Support Inbox</span>
          {openTicketsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500 text-white font-extrabold">
              {openTicketsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ' + (
            activeTab === 'announcements'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <Bell size={14} />
          <span>Broadcast Notice</span>
          {annEnabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('admins')}
          className={'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ' + (
            activeTab === 'admins'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          <ShieldCheck size={14} />
          <span>Co-Admins</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-current">
            {adminRoles.length}
          </span>
        </button>
      </div>

      {/* --- TAB 1: EXECUTIVE OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total BDT Revenue</span>
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
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Agencies</span>
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
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Payments</span>
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
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Support Inquiries</span>
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

          {/* QUICK DIRECTORY SNAPSHOT */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Agency Workspaces</h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time telemetry of clients utilizing Quantrex</p>
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
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
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
              <span className="text-xs text-slate-400 font-bold">Filter:</span>
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
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Agency / Workspace</th>
                  <th className="pb-3">Owner Contact</th>
                  <th className="pb-3">Plan Tier</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3">Revenue Paid</th>
                  <th className="pb-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredWorkspaces.map(w => (
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
                        w.status === 'Active'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      )}>
                        ● {w.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400">{w.signupDate}</td>
                    <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                      ৳{(w.totalSpentBDT || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleQuickUpgradeWorkspace(w.id)}
                        className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-slate-950 font-bold text-[11px] transition-all cursor-pointer mr-1.5"
                      >
                        Grant Starter Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                <p className="text-xs text-slate-400 mt-0.5">Audit customer transaction IDs and activate subscriptions with 1 click</p>
              </div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                Total Verified: ৳{totalRevenue.toLocaleString()}
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
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
                <p className="text-xs text-slate-400 mt-0.5">Tickets submitted by clients from within the Quantrex app</p>
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
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Global Announcement Banner</h3>
            <p className="text-xs text-slate-400 mt-0.5">Broadcast an instant alert or promotional offer across all client workspaces</p>
          </div>

          <form onSubmit={handleSaveAnnouncement} className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Broadcast Status</div>
                <div className="text-[11px] text-slate-400">When enabled, every user sees this banner on their dashboard</div>
              </div>
              <button
                type="button"
                onClick={() => setAnnEnabled(!annEnabled)}
                className={'px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ' + (
                  annEnabled
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                )}
              >
                {annEnabled ? '● Broadcasting Live' : '○ Disabled'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Banner Type / Color Tone
                </label>
                <select
                  value={annType}
                  onChange={(e) => setAnnType(e.target.value)}
                  className="w-full bg-white dark:bg-[#090d16] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-bold"
                >
                  <option value="promo">🎉 Launching Promo (Gold / Amber)</option>
                  <option value="info">ℹ️ System Notice (Sky Blue)</option>
                  <option value="warning">⚡ Maintenance / Alert (Rose / Red)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Banner Headline
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
                Detailed Message / Promo Instructions
              </label>
              <textarea
                required
                rows={3}
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                placeholder="Describe offer, coupon code, or maintenance schedule..."
                className="w-full bg-white dark:bg-[#090d16] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs"
              />
            </div>

            {/* LIVE PREVIEW BOX */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Live Preview (What Users See)
              </label>
              <div className={'p-3.5 rounded-xl border flex items-center justify-between gap-3 ' + (
                annType === 'promo'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
                  : annType === 'warning'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
                    : 'bg-sky-500/10 border-sky-500/30 text-sky-950 dark:text-sky-200'
              )}>
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="shrink-0 text-amber-500" />
                  <div>
                    <strong className="text-xs">{annTitle || 'Special Launching Offer'}</strong>
                    <div className="text-[11px] opacity-90">{annMessage || 'Message will appear here...'}</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/10">
                  {annEnabled ? 'Live' : 'Draft'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                Save &amp; Broadcast Announcement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- TAB 6: CO-ADMIN MANAGEMENT --- */}
      {activeTab === 'admins' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800/90 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Admin Team &amp; Access Control</h3>
              <p className="text-xs text-slate-400 mt-0.5">Grant admin privileges to partners or support agents without touching code</p>
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
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
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
  );
}
