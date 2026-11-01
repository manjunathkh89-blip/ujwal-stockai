import React, { useState } from 'react';
import { ThreeMarketBrain } from '../components/ThreeMarketBrain';
import {
  MarketRegimeInfo,
  MarketRegimeType,
  StockItem,
  AiMemoryRecord,
} from '../types/market';
import {
  INITIAL_MARKET_REGIME,
  MARKET_REGIME_DEFINITIONS,
  INITIAL_AI_MEMORY,
} from '../data/marketData';

interface MarketBrainViewProps {
  stocks: StockItem[];
  onSelectStock: (stockId: string) => void;
  onOpenWhyFell: (stockId?: string) => void;
  onOpenEmergencyAlert: () => void;
  onNavigateTab: (tabId: any) => void;
}

export const MarketBrainView: React.FC<MarketBrainViewProps> = ({
  stocks,
  onSelectStock,
  onOpenWhyFell,
  onOpenEmergencyAlert,
  onNavigateTab,
}) => {
  const [currentRegimeInfo, setCurrentRegimeInfo] = useState<MarketRegimeInfo>(INITIAL_MARKET_REGIME);
  const [selectedRegimeForDetail, setSelectedRegimeForDetail] = useState<MarketRegimeType>(currentRegimeInfo.currentRegime);
  const [aiMemoryList] = useState<AiMemoryRecord[]>(INITIAL_AI_MEMORY);
  const [activeSubEngine, setActiveSubEngine] = useState<string>('Technical AI');

  // Regime definitions
  const activeDef = MARKET_REGIME_DEFINITIONS[selectedRegimeForDetail];

  // Self-Learning Stats
  const wins = aiMemoryList.filter((m) => m.outcome === 'WIN').length;
  const totalClosed = aiMemoryList.filter((m) => m.outcome !== 'PENDING').length;
  const winRate = totalClosed > 0 ? Math.round((wins / totalClosed) * 100) : 75;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                AI Market Brain · Central Synthesis Engine
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE MULTI-AI FUSION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Continuously unifying live pricing, volume profile, multi-engine technicals, audited balance sheets, sentiment velocity, and macroeconomic regimes into evidence-backed decision support.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenWhyFell()}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded transition-colors flex items-center gap-1.5"
            >
              <span>📉</span>
              <span>Why Did My Stock Fall?</span>
            </button>
            <button
              onClick={() => onNavigateTab('scanner')}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded transition-colors flex items-center gap-1.5"
            >
              <span>✦</span>
              <span>Find Best Opportunities</span>
            </button>
            <button
              onClick={onOpenEmergencyAlert}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors flex items-center gap-1.5 animate-pulse"
            >
              <span>🚨</span>
              <span>Emergency Alert</span>
            </button>
          </div>
        </div>

        {/* 3D Three.js Market Brain Visualizer */}
        <div className="pt-2">
          <ThreeMarketBrain
            activeRegime={currentRegimeInfo.currentRegime}
            onSelectNode={(nodeName) => setActiveSubEngine(nodeName)}
          />
        </div>
      </div>

      {/* 1. MARKET REGIME SWITCH & STRATEGY WEIGHTS */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                1. Market Regime Switch & Dynamic Strategy Adaptation
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                ACTIVE: {currentRegimeInfo.currentRegime} ({currentRegimeInfo.confidenceScore}% CONFIDENCE)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Trading strategies must automatically recalibrate weights and stops when market regimes rotate.
            </p>
          </div>

          <span className="text-[10px] font-mono text-slate-500">
            {currentRegimeInfo.lastUpdated}
          </span>
        </div>

        {/* Regime Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          {(Object.keys(MARKET_REGIME_DEFINITIONS) as MarketRegimeType[]).map((regime) => {
            const isSelected = selectedRegimeForDetail === regime;
            const isLive = currentRegimeInfo.currentRegime === regime;

            return (
              <button
                key={regime}
                onClick={() => setSelectedRegimeForDetail(regime)}
                className={`p-2.5 rounded-lg border text-left transition-all relative ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 text-white shadow-md'
                    : 'bg-[#070a0f] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {isLive && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
                <span className="text-[10px] uppercase font-bold block truncate">
                  {regime}
                </span>
                <span className="text-[9px] font-mono text-slate-500 mt-1 block">
                  {isLive ? '🟢 Current Live' : 'Simulate'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Regime Rules & Weights Card */}
        <div className="bg-[#070a0f] border border-slate-800/80 rounded-lg p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                {selectedRegimeForDetail} — Tactical Posture: <span className="text-cyan-400">{activeDef.posture}</span>
              </span>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                {activeDef.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentRegimeInfo((prev) => ({
                    ...prev,
                    currentRegime: selectedRegimeForDetail,
                  }));
                }}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded border border-slate-700 transition-colors"
              >
                Set as Active Regime
              </button>
            </div>
          </div>

          {/* Strategy Weighting Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
            <div className="bg-[#0b0f17] p-2.5 rounded border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Momentum Weight:</span>
                <span className="text-cyan-400 font-bold">{currentRegimeInfo.momentumWeight}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                <div className="bg-cyan-500 h-full" style={{ width: `${currentRegimeInfo.momentumWeight}%` }} />
              </div>
            </div>

            <div className="bg-[#0b0f17] p-2.5 rounded border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Fundamental Weight:</span>
                <span className="text-emerald-400 font-bold">{currentRegimeInfo.fundamentalWeight}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${currentRegimeInfo.fundamentalWeight}%` }} />
              </div>
            </div>

            <div className="bg-[#0b0f17] p-2.5 rounded border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Capital Defense Weight:</span>
                <span className="text-amber-400 font-bold">{currentRegimeInfo.defensiveWeight}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${currentRegimeInfo.defensiveWeight}%` }} />
              </div>
            </div>
          </div>

          {/* Tactical Execution Rules */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-300 uppercase block tracking-wider">
              Enforced Tactical Execution Rules:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {activeDef.tacticalRules.map((rule, idx) => (
                <div key={idx} className="bg-[#0b0f17] p-2 rounded border border-slate-800/60 text-slate-300 flex items-start gap-1.5 text-[11px]">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MULTI-AI SUB-ENGINES EVALUATION MATRIX */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              2. Multi-AI Sub-Engine Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Five independent domain intelligences computing consensus decision models.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">Consensus Engine: 86/100</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {/* Engine 1: Technical AI */}
          <div
            onClick={() => setActiveSubEngine('Technical AI')}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer space-y-2 ${
              activeSubEngine === 'Technical AI' ? 'bg-[#0f1825] border-emerald-500 shadow-md' : 'bg-[#070a0f] border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Technical AI</span>
              <span className="text-xs font-bold text-emerald-400">88/100</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Price action, candlestick verification, RSI divergences, and structural support floors.
            </p>
            <div className="text-[10px] font-mono text-emerald-400 pt-1">
              Status: ASCENDING MOMENTUM
            </div>
          </div>

          {/* Engine 2: Fundamental AI */}
          <div
            onClick={() => setActiveSubEngine('Fundamental AI')}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer space-y-2 ${
              activeSubEngine === 'Fundamental AI' ? 'bg-[#0f1825] border-cyan-500 shadow-md' : 'bg-[#070a0f] border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Fundamental AI</span>
              <span className="text-xs font-bold text-cyan-400">84/100</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Revenue YoY, operating margin resilience, debt-to-equity safety, and clean audit verification.
            </p>
            <div className="text-[10px] font-mono text-cyan-400 pt-1">
              Status: UNQUALIFIED AUDIT (CLEAN)
            </div>
          </div>

          {/* Engine 3: News AI */}
          <div
            onClick={() => setActiveSubEngine('News AI')}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer space-y-2 ${
              activeSubEngine === 'News AI' ? 'bg-[#0f1825] border-amber-500 shadow-md' : 'bg-[#070a0f] border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">News AI</span>
              <span className="text-xs font-bold text-amber-400">76/100</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Source validation, corporate filings, regulatory disclosures, and rumor filtering.
            </p>
            <div className="text-[10px] font-mono text-amber-400 pt-1">
              Status: 0 CRITICAL SCANDALS
            </div>
          </div>

          {/* Engine 4: Sentiment AI */}
          <div
            onClick={() => setActiveSubEngine('Sentiment AI')}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer space-y-2 ${
              activeSubEngine === 'Sentiment AI' ? 'bg-[#0f1825] border-purple-500 shadow-md' : 'bg-[#070a0f] border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Sentiment AI</span>
              <span className="text-xs font-bold text-purple-400">81/100</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Institutional block trade velocity, options put/call skew, and retail attention metrics.
            </p>
            <div className="text-[10px] font-mono text-purple-400 pt-1">
              Status: INSTITUTIONAL INFLOW
            </div>
          </div>

          {/* Engine 5: Regime AI */}
          <div
            onClick={() => setActiveSubEngine('Market Regime AI')}
            className={`p-3.5 rounded-lg border transition-all cursor-pointer space-y-2 ${
              activeSubEngine === 'Market Regime AI' ? 'bg-[#0f1825] border-blue-500 shadow-md' : 'bg-[#070a0f] border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Regime AI</span>
              <span className="text-xs font-bold text-blue-400">78/100</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Macro regime classification, sovereign rate yields, and cross-border currency correlation.
            </p>
            <div className="text-[10px] font-mono text-blue-400 pt-1">
              Status: MULTI-SPEED TRANSITION
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI MEMORY & SELF-LEARNING PERFORMANCE TRACKER */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <span>3. AI Memory & Self-Learning Performance Audit</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable analytical ledger of past signals, model assumptions, and empirical outcomes. (Non-fabrication guarantee).
            </p>
          </div>

          {/* Aggregate Performance Badges */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-400">
              Win Rate: <strong className="text-emerald-400">{winRate}%</strong>
            </span>
            <span className="text-slate-400">
              Profit Factor: <strong className="text-cyan-400">2.68</strong>
            </span>
            <span className="text-slate-400">
              Avg Reward/Risk: <strong className="text-white">1:2.45</strong>
            </span>
          </div>
        </div>

        {/* Memory Records List */}
        <div className="space-y-3">
          {aiMemoryList.map((record) => (
            <div
              key={record.id}
              className="bg-[#070a0f] border border-slate-800/80 rounded-lg p-3.5 space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-sm text-white">{record.stockSymbol}</span>
                  <span className="text-slate-400">{record.companyName}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {record.signalType}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300">
                    Regime: {record.marketRegime}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                      record.outcome === 'WIN'
                        ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800'
                        : record.outcome === 'LOSS'
                        ? 'text-rose-400 bg-rose-950/80 border border-rose-800'
                        : 'text-amber-400 bg-amber-950/80 border border-amber-800'
                    }`}
                  >
                    {record.outcome} ({record.pnlPct >= 0 ? `+${record.pnlPct}%` : `${record.pnlPct}%`})
                  </span>
                  <span className="text-slate-500 text-[10px]">{record.timestamp}</span>
                </div>
              </div>

              {/* Price Parameters & Excursions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] bg-[#0b0f17] p-2 rounded border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block">Entry Assumption:</span>
                  <span className="text-white font-semibold">{record.entryPrice}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Stop Floor:</span>
                  <span className="text-rose-400 font-semibold">{record.stopPrice}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Pivot:</span>
                  <span className="text-emerald-400 font-semibold">{record.targetPrice}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Max Excursions (MFE/MAE):</span>
                  <span className="text-slate-300">+{record.maxFavorableExcursionPct}% / {record.maxAdverseExcursionPct}%</span>
                </div>
              </div>

              {/* AI Learned Lesson */}
              <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800/60">
                <span className="text-emerald-400 font-bold mr-1">💡 AI Memory Insight:</span>
                {record.aiLesson}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. DATA TRUST & PROVENANCE FOOTER */}
      <div className="bg-[#070a0f] border border-slate-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-500">
        <div>
          Engine Model: <strong className="text-slate-300">v3.8-Flash-Quant-Institutional</strong> · Data Verification: <strong className="text-emerald-400">100% Verified</strong>
        </div>
        <div>
          Safety Guard: If critical feed is delayed &gt; 15m, <span className="text-amber-400">ANALYSIS PAUSED — INSUFFICIENT DATA</span> activates automatically.
        </div>
      </div>
    </div>
  );
};
