import React from 'react';
import { MarketSession } from '../types/market';

interface MarketSessionBarProps {
  sessions: MarketSession[];
}

export const MarketSessionBar: React.FC<MarketSessionBarProps> = ({ sessions }) => {
  return (
    <div className="bg-[#0e1420] border-b border-slate-800/80 px-4 py-1.5 overflow-x-auto text-[11px] font-mono select-none">
      <div className="flex items-center gap-6 min-w-max">
        <span className="text-slate-400 font-semibold tracking-wider uppercase text-[10px] flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Global Sessions
        </span>

        {sessions.map((sess) => {
          const isOpen = sess.status === 'OPEN';
          const isPre = sess.status === 'PRE_MARKET';

          return (
            <div key={sess.id} className="flex items-center gap-2 text-slate-400 shrink-0">
              <span className="font-medium text-slate-300">{sess.city}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  isOpen
                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                    : isPre
                    ? 'bg-amber-950/70 text-amber-400 border border-amber-800/50'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {sess.status}
              </span>
              <span className="text-slate-400">{sess.currentLocalTime}</span>
              <span className="text-slate-400 text-[10px]">({sess.timeUntilNextEvent})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
