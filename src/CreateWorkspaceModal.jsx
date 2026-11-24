import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Building, X, Plus, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export default function CreateWorkspaceModal({ isOpen, onClose, onCreate, theme }) {
  const [businessName, setBusinessName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [workspaceType, setWorkspaceType] = useState('Digital Marketing Agency');
  const [primaryCurrency, setPrimaryCurrency] = useState('BDT');
  const [defaultUSDRate, setDefaultUSDRate] = useState('125');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const val = e.target.value;
    setBusinessName(val);
    if (!shortCode || shortCode.length <= 4) {
      const words = val.trim().split(/\s+/).filter(Boolean);
      let autoCode = '';
      if (words.length >= 2) {
        autoCode = words.map(w => w[0]).join('').slice(0, 4).toUpperCase();
      } else if (val.trim().length > 0) {
        autoCode = val.trim().slice(0, 3).toUpperCase();
      }
      setShortCode(autoCode);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Please enter your agency or workspace name.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onCreate({
        businessName: businessName.trim(),
        shortCode: shortCode.trim() || businessName.slice(0, 3).toUpperCase(),
        workspaceType,
        primaryCurrency,
        defaultUSDRate: defaultUSDRate || '125',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create workspace.');
      setIsSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all ${
          theme === 'dark'
            ? 'bg-[#111722] border-white/10 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
            : 'bg-white border-slate-200 text-slate-900 shadow-[0_20px_50px_rgba(166,180,200,0.4)]'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold">
              <Building size={20} />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Create Agency Workspace</h2>
              <p className="text-xs text-slate-400 mt-0.5">Add an independent workspace for another agency</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Agency / Workspace Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Apex Digital, Velox Media Lab"
              value={businessName}
              onChange={handleNameChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-[#0a0f18] border-white/10 focus:border-sky-500 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Short Code / Slug
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. AD, AML"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold tracking-wider outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-[#0a0f18] border-white/10 focus:border-sky-500 text-white'
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Primary Currency
              </label>
              <select
                value={primaryCurrency}
                onChange={(e) => setPrimaryCurrency(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#0a0f18] border-white/10 focus:border-sky-500 text-white'
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-900'
                }`}
              >
                <option value="BDT">৳ BDT (Taka)</option>
                <option value="USD">$ USD (Dollar)</option>
                <option value="EUR">€ EUR (Euro)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Workspace Type
              </label>
              <select
                value={workspaceType}
                onChange={(e) => setWorkspaceType(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[#0a0f18] border-white/10 focus:border-sky-500 text-white'
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-900'
                }`}
              >
                <option value="Digital Marketing Agency">Digital Marketing Agency</option>
                <option value="Performance Media Buying">Performance Media Buying</option>
                <option value="E-Commerce Brand">E-Commerce Brand</option>
                <option value="Freelancer / Consultant">Freelancer / Consultant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Default USD Rate (BDT)
              </label>
              <input
                type="number"
                step="0.01"
                value={defaultUSDRate}
                onChange={(e) => setDefaultUSDRate(e.target.value)}
                placeholder="125"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-[#0a0f18] border-white/10 focus:border-sky-500 text-white'
                    : 'bg-slate-50 border-slate-200 focus:border-sky-500 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-500/10 dark:bg-sky-950/20 border border-sky-500/20 flex items-center gap-2.5">
            <Sparkles size={16} className="text-sky-500 shrink-0" />
            <p className="text-[11px] text-sky-700 dark:text-sky-300">
              Each workspace maintains its own isolated clients, campaigns, transactions, and currency settings.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-sky-600 hover:bg-sky-500 text-white shadow-md hover:shadow-sky-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Creating Workspace...</span>
                </>
              ) : (
                <>
                  <Plus size={14} strokeWidth={2.5} />
                  <span>Create & Switch to Agency</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
