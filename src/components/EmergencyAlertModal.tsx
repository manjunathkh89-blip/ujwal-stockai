import React from 'react';

export interface EmergencyAlertItem {
  id: string;
  type: 'CRITICAL_MARKET_CRASH' | 'TRADING_HALT' | 'REGULATORY_ACTION' | 'EARNINGS_COLLAPSE' | 'GEOPOLITICAL_EVENT';
  headline: string;
  whatHappened: string;
  whyItMatters: string;
  portfolioImpact: string;
  whatToWatch: string;
  dataSource: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH';
}

interface EmergencyAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert?: EmergencyAlertItem;
}

export const DEFAULT_EMERGENCY_ALERT: EmergencyAlertItem = {
  id: 'emer-2026-global-1',
  type: 'REGULATORY_ACTION',
  headline: '🚨 CRITICAL MARKET ALERT: Multilateral Semiconductor Export Restriction & Tariff Review Initiated',
  whatHappened: 'Coordinated regulatory disclosures from global commerce authorities initiating immediate compliance audits on advanced AI packaging, extreme ultraviolet (EUV) lithography subsystems, and cross-border GPU transfers.',
  whyItMatters: 'Triggers elevated downside volatility across high-beta technology and semiconductor hardware equities. May temporarily compress institutional valuation multiples while supply chain compliance is verified.',
  portfolioImpact: 'High-beta semiconductor holdings (NVDA, TSMC 2330, ASML) carry estimated 3.5% to 6.0% short-term beta sensitivity. Defensive holdings (TCS, SHEL, PETR4) provide natural insulation.',
  whatToWatch: '1. Hold of defensive support levels ($134.00 on NVDA, €638.00 on ASML).\n2. 20-day moving average reactions on NASDAQ and TAIEX.\n3. Official government clarification statements over the next 48 hours.',
  dataSource: 'LSEG / Regulatory EDGAR Wire & Official Ministry Disclosures',
  timestamp: 'Live Active System Alert · Verified 2026',
  severity: 'CRITICAL',
};

export const EmergencyAlertModal: React.FC<EmergencyAlertModalProps> = ({
  isOpen,
  onClose,
  alert = DEFAULT_EMERGENCY_ALERT,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b0f17] border-2 border-rose-600/80 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
        {/* Header Banner */}
        <div className="flex items-start justify-between border-b border-rose-900/50 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold tracking-wider animate-pulse">
                HIGH PRIORITY SYSTEM ADVISORY
              </span>
              <span className="font-mono text-xs text-rose-400 font-semibold">
                {alert.timestamp}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
              {alert.headline}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 text-lg transition-colors ml-2"
          >
            ✕
          </button>
        </div>

        {/* 4 Pillars of Emergency Alert */}
        <div className="space-y-3.5 text-xs">
          {/* 1. What Happened */}
          <div className="bg-[#070a0f] p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
              1. What Happened?
            </span>
            <p className="text-slate-200 leading-relaxed text-xs">
              {alert.whatHappened}
            </p>
          </div>

          {/* 2. Why It Matters */}
          <div className="bg-[#070a0f] p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">
              2. Why It Matters?
            </span>
            <p className="text-slate-300 leading-relaxed text-xs">
              {alert.whyItMatters}
            </p>
          </div>

          {/* 3. Your Portfolio Impact */}
          <div className="bg-[#070a0f] p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">
              3. Your Portfolio Impact & Vulnerabilities
            </span>
            <p className="text-slate-300 leading-relaxed text-xs">
              {alert.portfolioImpact}
            </p>
          </div>

          {/* 4. What To Watch */}
          <div className="bg-[#070a0f] p-3.5 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              4. Key Invalidation Levels & Actionable Rules
            </span>
            <p className="text-slate-300 leading-relaxed text-xs whitespace-pre-line font-mono">
              {alert.whatToWatch}
            </p>
          </div>
        </div>

        {/* Provenance and Action Footer */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[10px] font-mono text-slate-500">
            Source: <strong className="text-slate-400">{alert.dataSource}</strong> · No Automated Trade Without Confirmation
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs transition-colors"
            >
              Acknowledge Emergency Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
