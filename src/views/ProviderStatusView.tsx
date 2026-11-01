import React from 'react';
import { ProviderStatus } from '../types/market';

interface ProviderStatusViewProps {
  providers: ProviderStatus[];
}

export const ProviderStatusView: React.FC<ProviderStatusViewProps> = ({ providers }) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg space-y-2">
        <h1 className="text-xl font-bold text-white tracking-tight">Data Providers & Gateway Telemetry</h1>
        <p className="text-xs text-slate-400">
          Full data provenance and feed transparency. The platform enforces strict disclosure of real-time, 15-minute delayed, or end-of-day licensed exchange contracts.
        </p>
      </div>

      {/* Provider Policy Commitment */}
      <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <span className="text-emerald-400 font-bold text-base leading-none">✓</span>
        <div>
          <span className="font-semibold text-emerald-300">Data Integrity Protocol: </span>
          We never fabricate live prices, financial statements, or regulatory actions. Delayed or end-of-day feeds are explicitly flagged with timestamp origins so users never execute decisions on stale quotes without awareness.
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((p) => {
          const isConnected = p.status === 'CONNECTED';
          const isPartial = p.status === 'PARTIAL';

          return (
            <div
              key={p.id}
              className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{p.name}</h3>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Region: {p.region} · Feed: {p.feedType}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isConnected
                        ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                        : isPartial
                        ? 'bg-amber-950/70 text-amber-400 border-amber-800'
                        : 'bg-rose-950/70 text-rose-400 border-rose-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                {/* Exchanges Covered */}
                <div className="bg-[#0e1420] p-2.5 rounded border border-slate-800/80 my-3 text-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                    Exchanges Handled:
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                    {p.exchangesCovered.map((ex) => (
                      <span key={ex} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-800">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Telemetry Stats */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs pt-1">
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Round-trip</span>
                    <span className="font-bold text-emerald-400">{p.latencyMs}ms</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Freshness</span>
                    <span className="font-semibold text-slate-200 text-[11px]">{p.freshness.split(' ')[0]}</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded border border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block">Rate Limit</span>
                    <span className="font-semibold text-slate-200 text-[10px] truncate">{p.rateLimit.split('/')[0]}</span>
                  </div>
                </div>
              </div>

              {/* License notes */}
              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <span className="text-slate-400">License: </span>
                {p.licenseNotes}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
