import React, { useState, useMemo } from 'react';
import { EARNINGS_CALENDAR } from '../data/marketData';
import { EarningsReportItem } from '../types/market';
import { formatCurrencyValue } from '../utils/currency';

interface EarningsAiViewProps {
  onSelectStock: (stockId: string) => void;
}

export const EarningsAiView: React.FC<EarningsAiViewProps> = ({ onSelectStock }) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UPCOMING' | 'REPORTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEarnings = useMemo(() => {
    return (EARNINGS_CALENDAR as EarningsReportItem[]).filter((item) => {
      const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;
      const matchQuery =
        !searchQuery.trim() ||
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [filterStatus, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-800">
              EARNINGS INTELLIGENCE
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Global Earnings AI & Valuation Catalyst Tracker</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Surveillance of quarterly filings, consensus EPS/revenue expectations, historical post-earnings volatility, forward guidance changes, and explainable AI bottom-line impact.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {(['ALL', 'UPCOMING', 'REPORTED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded transition-colors ${
                  filterStatus === st
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter ticker (e.g. NVDA)..."
            className="bg-[#070a0f] border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none"
          />
        </div>
      </div>

      {/* Earnings Grid */}
      <div className="space-y-4">
        {filteredEarnings.map((item) => (
          <div
            key={item.id}
            className="bg-[#0b0f17] border border-slate-800 hover:border-slate-700 transition-all rounded-lg p-5 space-y-4"
          >
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectStock(item.symbol.toLowerCase())}
                  className="text-base font-bold font-mono text-white hover:text-emerald-400 transition-colors"
                >
                  {item.symbol}
                </button>
                <span className="text-xs text-slate-300 font-medium">{item.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {item.exchange} · {item.fiscalPeriod}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">Release Date: <strong className="text-white">{item.date}</strong></span>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    item.status === 'UPCOMING'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : item.beatMiss === 'BEAT'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {item.status === 'UPCOMING' ? 'UPCOMING RELEASE' : `${item.beatMiss} CONSENSUS`}
                </span>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              {/* EPS */}
              <div className="bg-[#070a0f] p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block mb-0.5">EPS Performance</span>
                <div className="text-slate-200">
                  Expected: <strong>${item.expectedEps.toFixed(2)}</strong>
                </div>
                {item.actualEps !== undefined && (
                  <div className={`font-bold mt-0.5 ${item.actualEps >= item.expectedEps ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Actual: ${item.actualEps.toFixed(2)} ({item.actualEps >= item.expectedEps ? 'Beat' : 'Miss'})
                  </div>
                )}
              </div>

              {/* Revenue */}
              <div className="bg-[#070a0f] p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Top-Line Revenue</span>
                <div className="text-slate-200">
                  Expected: <strong>${item.expectedRevenue.toLocaleString()}M</strong>
                </div>
                {item.actualRevenue !== undefined && (
                  <div className={`font-bold mt-0.5 ${item.actualRevenue >= item.expectedRevenue ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Actual: ${item.actualRevenue.toLocaleString()}M
                  </div>
                )}
              </div>

              {/* Historical Reaction */}
              <div className="bg-[#070a0f] p-3 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Historical Reaction Vol</span>
                <span className="text-cyan-400 font-bold text-sm block">±{item.historicalReactionAvgPct}%</span>
                <span className="text-[10px] text-slate-500 block">Average 1-day move</span>
              </div>

              {/* Action Button */}
              <div className="bg-[#070a0f] p-3 rounded border border-slate-800 flex flex-col justify-center">
                <button
                  onClick={() => onSelectStock(item.symbol.toLowerCase())}
                  className="w-full py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium text-xs transition-colors text-center"
                >
                  Analyze Technical Setup →
                </button>
              </div>
            </div>

            {/* Guidance & AI Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="bg-slate-900/60 p-3 rounded border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                  Management Guidance & Outlook:
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">{item.guidance}</p>
              </div>

              <div className="bg-cyan-950/20 p-3 rounded border border-cyan-900/50 space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400 font-mono block">
                  AI Bottom-Line Analysis:
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">{item.aiExplanation}</p>
              </div>
            </div>
          </div>
        ))}

        {filteredEarnings.length === 0 && (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            No matching earnings disclosures found.
          </div>
        )}
      </div>
    </div>
  );
};
