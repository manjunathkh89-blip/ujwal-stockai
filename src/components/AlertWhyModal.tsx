import React from 'react';
import { AlertWhyExplanation } from '../types/market';

interface AlertWhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  category: string;
  headline: string;
  price?: number;
  currency?: string;
  explanation?: AlertWhyExplanation;
}

export const AlertWhyModal: React.FC<AlertWhyModalProps> = ({
  isOpen,
  onClose,
  symbol,
  category,
  headline,
  price,
  currency = 'USD',
  explanation,
}) => {
  if (!isOpen) return null;

  const defaultExplanation: AlertWhyExplanation = explanation || {
    whatHappened: `Price broke key technical reference bounds with unusual relative volume surge.`,
    whyItMatters: `Structural demand absorption was tested. Institutional participants are actively repricing risk at current levels.`,
    whatToWatch: `Daily close confirmation above verified support floor. Look for contracting volume on pullbacks.`,
    whatCouldGoWrong: `A high-volume daily breakdown invalidates the thesis and shifts the structure into defensive de-risking.`,
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#0e1420] border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-400 border border-slate-700">
                EXPLAINABLE AI INTEL
              </span>
              <span className="text-[10px] text-slate-400 uppercase">{category}</span>
            </div>
            <h3 className="text-base font-bold text-white font-sans">{symbol} — Why Did This Alert Trigger?</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">{headline}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base p-1"
          >
            ✕
          </button>
        </div>

        {/* 4 Pillars of 'WHY?' */}
        <div className="space-y-3 font-sans">
          {/* 1. What Happened */}
          <div className="bg-[#070a0f] p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <span className="text-cyan-400 font-bold">1.</span> WHAT HAPPENED?
            </span>
            <p className="text-slate-200 text-xs leading-relaxed">{defaultExplanation.whatHappened}</p>
          </div>

          {/* 2. Why It Matters */}
          <div className="bg-[#070a0f] p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">2.</span> WHY IT MATTERS?
            </span>
            <p className="text-slate-200 text-xs leading-relaxed">{defaultExplanation.whyItMatters}</p>
          </div>

          {/* 3. What To Watch */}
          <div className="bg-[#070a0f] p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">3.</span> WHAT SHOULD I WATCH NEXT?
            </span>
            <p className="text-slate-200 text-xs leading-relaxed">{defaultExplanation.whatToWatch}</p>
          </div>

          {/* 4. What Could Go Wrong */}
          <div className="bg-[#070a0f] p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <span className="text-rose-400 font-bold">4.</span> WHAT COULD INVALIDATE THIS?
            </span>
            <p className="text-slate-200 text-xs leading-relaxed">{defaultExplanation.whatCouldGoWrong}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
          <span>Probabilistic Risk Decision Support</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-sans font-semibold text-xs transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
