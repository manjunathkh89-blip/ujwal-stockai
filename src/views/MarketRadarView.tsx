import React, { useState } from 'react';
import { GLOBAL_MARKET_RADAR } from '../data/marketData';
import { GlobalMarketRadarRegion } from '../types/market';

interface MarketRadarViewProps {
  onNavigateTab: (tab: any) => void;
}

export const MarketRadarView: React.FC<MarketRadarViewProps> = ({ onNavigateTab }) => {
  const [selectedRisk, setSelectedRisk] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');

  const filteredRegions = (GLOBAL_MARKET_RADAR as GlobalMarketRadarRegion[]).filter((r) => {
    return selectedRisk === 'ALL' || r.riskLevel === selectedRisk;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-800">
              CROSS-ASSET MACRO RADAR
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Global AI Market Radar</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Continuously evaluates macro liquidity, sovereign risk, sector leadership, and relative momentum across 11 key international capital markets.
          </p>
        </div>

        {/* Risk Filter */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map((rk) => (
            <button
              key={rk}
              onClick={() => setSelectedRisk(rk)}
              className={`px-3 py-1 rounded transition-colors ${
                selectedRisk === rk
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {rk === 'ALL' ? 'All Risk Levels' : `${rk} RISK`}
            </button>
          ))}
        </div>
      </div>

      {/* Radar Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRegions.map((reg) => (
          <div
            key={reg.id}
            className="bg-[#0b0f17] border border-slate-800 hover:border-slate-700 transition-all rounded-lg p-4 space-y-3.5 flex flex-col justify-between"
          >
            <div>
              {/* Region and Benchmark */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{reg.name}</h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Benchmark: <strong className="text-slate-200">{reg.majorIndex}</strong> ({reg.indexChangePct >= 0 ? '+' : ''}{reg.indexChangePct.toFixed(2)}%)
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      reg.riskLevel === 'LOW'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : reg.riskLevel === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-rose-950 text-rose-400 border-rose-800'
                    }`}
                  >
                    {reg.riskLevel} RISK
                  </span>
                </div>
              </div>

              {/* Strength Score Meter */}
              <div className="space-y-1 mt-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Market Strength Score:</span>
                  <span className="font-bold text-white">{reg.strengthScore} / 100</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      reg.strengthScore >= 80
                        ? 'bg-emerald-500'
                        : reg.strengthScore >= 65
                        ? 'bg-cyan-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${reg.strengthScore}%` }}
                  />
                </div>
              </div>

              {/* Trend Tag */}
              <div className="pt-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded font-mono ${
                    reg.trend.includes('Strong Uptrend')
                      ? 'text-emerald-300 bg-emerald-950/60'
                      : reg.trend.includes('Uptrend')
                      ? 'text-emerald-400 bg-emerald-950/40'
                      : reg.trend.includes('Sideways')
                      ? 'text-slate-300 bg-slate-800'
                      : 'text-rose-400 bg-rose-950/60'
                  }`}
                >
                  ● {reg.trend}
                </span>
              </div>
            </div>

            {/* Drivers & Leadership */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="bg-[#070a0f] p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Primary Market Driver:</span>
                <p className="text-slate-300 text-[11px] leading-snug mt-0.5">{reg.keyDriver}</p>
              </div>

              <div className="bg-[#070a0f] p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Leading Sectors:</span>
                <p className="text-emerald-400 font-mono text-[11px] font-semibold mt-0.5">{reg.sectorLeadership}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
