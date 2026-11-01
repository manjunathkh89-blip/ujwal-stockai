import React from 'react';
import { ActiveTab } from './Sidebar';
import { AppExperienceMode } from '../types/market';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  baseCurrency: string;
  onChangeCurrency: (currency: string) => void;
  onOpenSearch: () => void;
  experienceMode: AppExperienceMode;
  onChangeExperienceMode: (mode: AppExperienceMode) => void;
  alertCount: number;
  onOpenWhyFell?: () => void;
  onOpenEmergencyAlert?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  baseCurrency,
  onChangeCurrency,
  onOpenSearch,
  experienceMode,
  onChangeExperienceMode,
  alertCount,
  onOpenWhyFell,
  onOpenEmergencyAlert,
}) => {
  return (
    <header className="h-14 bg-[#0b0f17] border-b border-slate-800/80 px-4 flex items-center justify-between gap-4 select-none shrink-0 z-10">
      {/* Zone 1: Quick Search Box */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          className="w-full bg-[#070a0f] hover:bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all flex items-center justify-between shadow-inner"
        >
          <span className="flex items-center gap-2">
            <span>🔍</span>
            <span className="truncate">Search global stock, ticker, exchange, country...</span>
          </span>
          <kbd className="hidden sm:inline-block bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded font-mono border border-slate-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 2: Status & Mode Controls */}
      <div className="flex items-center gap-3 font-mono text-xs">
        {/* Live Market Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/60 text-[11px] text-emerald-400 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>MARKETS LIVE</span>
        </div>

        {/* Experience Mode Selector: Simple vs Pro vs Ultimate AI */}
        <div className="flex items-center bg-[#070a0f] p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            onClick={() => onChangeExperienceMode('simple')}
            className={`px-2.5 py-1 rounded transition-colors ${
              experienceMode === 'simple'
                ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Beginner mode: plain-English explanations without complex jargon"
          >
            Simple
          </button>
          <button
            onClick={() => onChangeExperienceMode('pro')}
            className={`px-2.5 py-1 rounded transition-colors ${
              experienceMode === 'pro'
                ? 'bg-slate-800 text-cyan-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Pro mode: advanced quantitative indicators, VWAP, MACD, and RVOL profiles"
          >
            Pro
          </button>
          <button
            onClick={() => onChangeExperienceMode('ultimate')}
            className={`px-2.5 py-1 rounded transition-colors ${
              experienceMode === 'ultimate'
                ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Ultimate AI mode: consolidated single-decision synthesis"
          >
            ✦ Ultimate AI
          </button>
        </div>

        {/* Quick Diagnostic Triggers */}
        {onOpenWhyFell && (
          <button
            onClick={onOpenWhyFell}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/60 text-rose-300 text-[11px] font-semibold transition-colors"
            title="Diagnose why any stock fell today"
          >
            <span>📉</span>
            <span>Why Move?</span>
          </button>
        )}

        {onOpenEmergencyAlert && (
          <button
            onClick={onOpenEmergencyAlert}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 border border-rose-600/60 text-rose-400 text-[11px] font-semibold transition-colors"
            title="Review active emergency crisis alerts"
          >
            <span>🚨</span>
            <span>Crisis Radar</span>
          </button>
        )}

        {/* Base Currency Selector */}
        <div className="flex items-center gap-1.5 bg-[#070a0f] border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
          <span className="text-slate-400 text-[11px] font-sans">Base:</span>
          <select
            value={baseCurrency}
            onChange={(e) => onChangeCurrency(e.target.value)}
            className="bg-transparent text-emerald-400 font-mono font-semibold focus:outline-none cursor-pointer"
          >
            <option value="USD" className="bg-slate-900 text-slate-200">USD ($)</option>
            <option value="EUR" className="bg-slate-900 text-slate-200">EUR (€)</option>
            <option value="GBP" className="bg-slate-900 text-slate-200">GBP (£)</option>
            <option value="INR" className="bg-slate-900 text-slate-200">INR (₹)</option>
            <option value="JPY" className="bg-slate-900 text-slate-200">JPY (¥)</option>
            <option value="CAD" className="bg-slate-900 text-slate-200">CAD ($)</option>
            <option value="AUD" className="bg-slate-900 text-slate-200">AUD ($)</option>
            <option value="CHF" className="bg-slate-900 text-slate-200">CHF (Fr)</option>
            <option value="BRL" className="bg-slate-900 text-slate-200">BRL (R$)</option>
            <option value="HKD" className="bg-slate-900 text-slate-200">HKD ($)</option>
          </select>
        </div>

        {/* Notifications Icon Button */}
        <button
          onClick={() => onSelectTab('watchlist')}
          className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
            activeTab === 'watchlist'
              ? 'bg-slate-800 text-white border-slate-700'
              : 'bg-[#070a0f] text-slate-300 hover:text-white border-slate-800'
          }`}
          title="Notification Center & Real-Time Alerts"
        >
          <span>🔔</span>
          {alertCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
              {alertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
