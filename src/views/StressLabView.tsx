import React, { useState } from 'react';
import { StressScenario, StockItem } from '../types/market';
import { INITIAL_STRESS_SCENARIOS } from '../data/marketData';

interface StressLabViewProps {
  stocks: StockItem[];
  onSelectStock: (stockId: string) => void;
}

export const StressLabView: React.FC<StressLabViewProps> = ({ stocks, onSelectStock }) => {
  const [scenarios] = useState<StressScenario[]>(INITIAL_STRESS_SCENARIOS);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0].id);
  const [customMarketDrop, setCustomMarketDrop] = useState<number>(10);

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  // Portfolio Digital Twin Baseline (virtual model)
  const portfolioBaseline = {
    totalValue: 24500.0,
    portfolioBeta: 1.18,
    concentrationTop3: 58.4, // % in top 3
    currencyExposure: { USD: 62, INR: 18, EUR: 12, TWD: 8 },
    sectorExposure: { Technology: 54, Energy: 22, Industrials: 14, Healthcare: 10 },
  };

  // Custom simulation calculation
  const customDollarImpact = -((portfolioBaseline.totalValue * (customMarketDrop / 100)) * portfolioBaseline.portfolioBeta);
  const customPercentImpact = -((customMarketDrop * portfolioBaseline.portfolioBeta));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧪</span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                AI Market Stress Lab & Portfolio Digital Twin
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                HYPOTHETICAL SIMULATION ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Stress-testing institutional holdings against macroeconomic shocks, rate hikes, energy supply crunches, and cross-strait export controls using covariance beta modeling.
            </p>
          </div>

          <div className="text-[10px] font-mono text-amber-400/90 bg-amber-950/40 border border-amber-900/60 p-2 rounded">
            ⚠️ SIMULATIONS ARE STATISTICAL ESTIMATES · NOT PREDICTIONS OF FUTURE OUTCOMES
          </div>
        </div>

        {/* Portfolio Digital Twin Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-[#070a0f] p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Virtual Portfolio Size:</span>
            <span className="text-sm font-bold text-white">${portfolioBaseline.totalValue.toLocaleString()}</span>
          </div>
          <div className="bg-[#070a0f] p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Portfolio Beta:</span>
            <span className="text-sm font-bold text-cyan-400">{portfolioBaseline.portfolioBeta}x vs S&P 500</span>
          </div>
          <div className="bg-[#070a0f] p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Top 3 Concentration:</span>
            <span className="text-sm font-bold text-amber-400">{portfolioBaseline.concentrationTop3}% (Elevated)</span>
          </div>
          <div className="bg-[#070a0f] p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Top Sector Exposure:</span>
            <span className="text-sm font-bold text-white">Technology (54%)</span>
          </div>
          <div className="bg-[#070a0f] p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 block text-[10px]">Currency Diversity:</span>
            <span className="text-sm font-bold text-emerald-400">4 Currencies (USD, INR, EUR, TWD)</span>
          </div>
        </div>
      </div>

      {/* Interactive Scenario Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((sc) => {
          const isSelected = sc.id === selectedScenarioId;
          const isNegative = sc.portfolioImpactPct < 0;

          return (
            <div
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              className={`p-4 rounded-lg border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-[#0f172a] border-cyan-500 shadow-lg'
                  : 'bg-[#0b0f17] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    sc.severity === 'CRITICAL'
                      ? 'text-rose-400 bg-rose-950/80 border border-rose-800'
                      : sc.severity === 'HIGH'
                      ? 'text-amber-400 bg-amber-950/80 border border-amber-800'
                      : 'text-cyan-400 bg-cyan-950/80 border border-cyan-800'
                  }`}
                >
                  {sc.severity} SHOCK
                </span>
                <span className="font-mono text-xs text-slate-400">{sc.shockFactor}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{sc.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {sc.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-400">Estimated Portfolio Impact:</span>
                <span className={`font-bold ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isNegative ? `${sc.portfolioImpactPct}%` : `+${sc.portfolioImpactPct}%`} (${sc.portfolioDollarLoss.toFixed(0)})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Scenario Deep-Dive Dossier */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-slate-400">Deep-Dive Simulation:</span>
              <h2 className="text-base font-bold text-white">{activeScenario.title}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{activeScenario.description}</p>
          </div>

          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-500 block">SIMULATED PORTFOLIO DRAWDOWN:</span>
            <span
              className={`text-lg font-bold ${
                activeScenario.portfolioImpactPct < 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {activeScenario.portfolioImpactPct}% (${activeScenario.portfolioDollarLoss.toFixed(0)})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Vulnerable Holdings */}
          <div className="bg-[#070a0f] p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[11px] uppercase font-bold text-rose-400 tracking-wider block">
              ⚠️ Highest Vulnerability Holdings
            </span>
            <p className="text-slate-400 text-xs">
              Positions with elevated sensitivity to this specific macro risk factor:
            </p>
            <div className="space-y-1.5 pt-1">
              {activeScenario.vulnerableHoldings.map((h, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#0b0f17] p-2 rounded border border-slate-800 text-slate-200 font-mono">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Hedge Recommendations */}
          <div className="bg-[#070a0f] p-4 rounded-lg border border-slate-800 space-y-2">
            <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider block">
              🛡️ Recommended Risk-Reduction Actions
            </span>
            <p className="text-slate-400 text-xs">
              Algorithmic hedging recommendations to mitigate downside before event occurrence:
            </p>
            <div className="space-y-1.5 pt-1">
              {activeScenario.hedgeRecommendations.map((rec, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#0b0f17] p-2 rounded border border-slate-800 text-slate-200">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Custom Market Shock Slider */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Custom Market Shock Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Drag the slider to simulate any custom broad market drop and observe portfolio beta covariance.
            </p>
          </div>

          <div className="font-mono text-xs text-right">
            <span className="text-slate-400 text-[10px] block">Calculated Loss at {customMarketDrop}% drop:</span>
            <span className="text-rose-400 font-bold text-sm">
              {customPercentImpact.toFixed(1)}% ({customDollarImpact.toFixed(0)} USD)
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <input
            type="range"
            min={1}
            max={35}
            step={1}
            value={customMarketDrop}
            onChange={(e) => setCustomMarketDrop(parseInt(e.target.value, 10))}
            className="w-full cursor-pointer h-2 bg-slate-800 rounded-lg accent-rose-500 appearance-none"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>-1% (Dip)</span>
            <span>-5% (Pullback)</span>
            <span>-10% (Correction)</span>
            <span>-20% (Bear Market)</span>
            <span>-35% (Crash)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
