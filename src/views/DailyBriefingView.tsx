import React, { useState } from 'react';
import { StockItem, DailyBriefingData } from '../types/market';
import { INITIAL_DAILY_BRIEFING } from '../data/marketData';
import { formatCurrencyValue } from '../utils/currency';

interface DailyBriefingViewProps {
  stocks: StockItem[];
  onSelectStock: (stockId: string) => void;
  onNavigateTab: (tabId: any) => void;
}

export const DailyBriefingView: React.FC<DailyBriefingViewProps> = ({
  stocks,
  onSelectStock,
  onNavigateTab,
}) => {
  const [briefing] = useState<DailyBriefingData>(INITIAL_DAILY_BRIEFING);
  const [activeTab, setActiveTab] = useState<'morning-plan' | 'end-of-day'>('morning-plan');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Daily AI Market Briefing & Institutional Playbook
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {briefing.date}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Synthesizing pre-market futures, central bank schedules, key support pivots, and end-of-day execution reviews.
            </p>
          </div>

          {/* Toggle between Morning Plan and End-of-Day Report */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('morning-plan')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'morning-plan'
                  ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌅 Today's Market Plan
            </button>
            <button
              onClick={() => setActiveTab('end-of-day')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'end-of-day'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌆 End-of-Day Close Report
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'morning-plan' ? (
        <div className="space-y-5">
          {/* WHAT MATTERS TODAY - 2 MINUTE SUMMARY */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-[#0b0f17] to-[#0b0f17] border border-emerald-800/80 rounded-lg p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <span>⚡</span>
              <span>What Matters Today · 2-Minute Executive Brief</span>
            </div>
            <p className="text-sm font-medium text-white leading-relaxed">
              "{briefing.whatMattersToday}"
            </p>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {briefing.globalMarketSummary}
            </p>
          </div>

          {/* 3 Pillars Grid: Risks, Opportunities, Macro Events */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Top Risks */}
            <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
                <span>⚠️</span>
                <span>Top Risks to Monitor</span>
              </div>
              <ul className="space-y-2 text-slate-300">
                {briefing.topRisks.map((risk, idx) => (
                  <li key={idx} className="bg-[#070a0f] p-2.5 rounded border border-slate-800/80 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">!</span>
                    <span className="leading-snug">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Opportunities */}
            <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                <span>💰</span>
                <span>Top Opportunities</span>
              </div>
              <ul className="space-y-2 text-slate-300">
                {briefing.topOpportunities.map((opp, idx) => (
                  <li key={idx} className="bg-[#070a0f] p-2.5 rounded border border-slate-800/80 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span className="leading-snug">{opp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Macro Events */}
            <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                <span>📅</span>
                <span>High-Impact Macro Events</span>
              </div>
              <ul className="space-y-2 text-slate-300">
                {briefing.keyMacroEvents.map((ev, idx) => (
                  <li key={idx} className="bg-[#070a0f] p-2.5 rounded border border-slate-800/80 flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">⏱</span>
                    <span className="leading-snug">{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Critical Price Levels to Watch */}
          <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Critical Invalidation & Target Levels for Active Watchlist
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Updated Pre-Market</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
              {briefing.criticalLevels.map((lvl) => {
                const stock = stocks.find((s) => s.symbol.toUpperCase() === lvl.symbol.toUpperCase());
                return (
                  <div
                    key={lvl.symbol}
                    onClick={() => stock && onSelectStock(stock.id)}
                    className="bg-[#070a0f] p-3 rounded border border-slate-800 hover:border-slate-700 cursor-pointer space-y-1 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">{lvl.symbol}</span>
                      <span className="text-cyan-400 font-bold">
                        {stock ? formatCurrencyValue(lvl.level, stock.currency) : lvl.level}
                      </span>
                    </div>
                    <p className="text-[11px] font-sans text-slate-400 line-clamp-2">
                      {lvl.note}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* END-OF-DAY CLOSE REPORT */
        <div className="space-y-5">
          <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Official Market Close Summary
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Institutional performance analysis, sector dispersion, and overnight tail-risk evaluation.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400">Trading Session Concluded</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Winning & Losing Sectors */}
              <div className="bg-[#070a0f] p-4 rounded-lg border border-slate-800 space-y-3">
                <span className="text-[11px] uppercase font-bold text-slate-300 tracking-wider block">
                  Sector Dispersion
                </span>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-emerald-400 text-[10px] font-mono block">Top Gaining Sectors:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {briefing.endOfDayReport?.winningSectors.map((s, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-mono text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1 pt-2">
                    <span className="text-rose-400 text-[10px] font-mono block">Lagging Sectors:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {briefing.endOfDayReport?.losingSectors.map((s, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-rose-950/60 border border-rose-800 text-rose-300 font-mono text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notable Breakouts & Overnight Risks */}
              <div className="bg-[#070a0f] p-4 rounded-lg border border-slate-800 space-y-3">
                <span className="text-[11px] uppercase font-bold text-slate-300 tracking-wider block">
                  Breakout Validation & Overnight Posture
                </span>
                <div className="space-y-2 text-slate-300">
                  <div>
                    <span className="text-cyan-400 text-[10px] font-mono block">Verified Breakouts:</span>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 pt-0.5">
                      {briefing.endOfDayReport?.notableBreakouts.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2">
                    <span className="text-amber-400 text-[10px] font-mono block">Overnight Risks to Guard:</span>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pt-0.5">
                      {briefing.endOfDayReport?.overnightRisks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
