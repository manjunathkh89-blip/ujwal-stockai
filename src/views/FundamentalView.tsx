import React, { useState } from 'react';
import { StockItem } from '../types/market';
import { formatCurrencyValue } from '../utils/currency';

interface FundamentalViewProps {
  stocks: StockItem[];
  baseCurrency: string;
  onSelectStock: (stockId: string) => void;
}

export const FundamentalView: React.FC<FundamentalViewProps> = ({
  stocks,
  baseCurrency,
  onSelectStock,
}) => {
  const [selectedStockId, setSelectedStockId] = useState<string>(stocks[0]?.id || 'aapl');
  const [filterSector, setFilterSector] = useState<string>('ALL');

  const currentStock = stocks.find((s) => s.id === selectedStockId) || stocks[0];

  // Filter peers
  const peers = stocks.filter(
    (s) => filterSector === 'ALL' || s.sector.toLowerCase() === filterSector.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Global Fundamental Analytics & Valuation</h1>
          <p className="text-xs text-slate-400 mt-1">
            Normalized international balance sheet analysis, cash flow durability, and peer multiple comparisons across US GAAP, IFRS, Ind AS, and J-GAAP standards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#070a0f] border border-slate-700 rounded px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 text-[10px] block font-mono">Select Entity</span>
            <select
              value={currentStock.id}
              onChange={(e) => setSelectedStockId(e.target.value)}
              className="bg-transparent text-emerald-400 font-mono font-bold focus:outline-none cursor-pointer"
            >
              {stocks.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.qualifiedSymbol} — {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selected Entity Key Financial Scorecard */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono text-white">{currentStock.qualifiedSymbol}</span>
              <span className="text-xs text-slate-400">· {currentStock.name}</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Accounting Regime: <strong className="text-slate-200">{currentStock.fundamentals.accountingStandard}</strong> ·
              Auditor: <strong className="text-slate-200">{currentStock.fundamentals.auditor}</strong> ({currentStock.fundamentals.auditOpinion})
            </div>
          </div>

          <div className="text-right text-xs font-mono">
            <span className="text-slate-400">Fiscal Year End: </span>
            <span className="text-white font-semibold">{currentStock.fundamentals.fiscalYearEnd}</span>
          </div>
        </div>

        {/* 4 Category Metric Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* 1. Valuation Multiples */}
          <div className="bg-slate-900/60 p-3.5 rounded border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-bold text-cyan-400 border-b border-slate-800 pb-1">
              Valuation Multiples
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">P/E (TTM):</span>
              <span className="text-white font-bold">{currentStock.fundamentals.peRatio.toFixed(1)}x</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Forward P/E:</span>
              <span className="text-slate-200 font-semibold">{currentStock.fundamentals.forwardPE.toFixed(1)}x</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">EV / EBITDA:</span>
              <span className="text-slate-200 font-semibold">{currentStock.fundamentals.evEbitda.toFixed(1)}x</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Price / Book:</span>
              <span className="text-slate-200 font-semibold">{currentStock.fundamentals.pbRatio.toFixed(1)}x</span>
            </div>
          </div>

          {/* 2. Profitability & Margins */}
          <div className="bg-slate-900/60 p-3.5 rounded border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-bold text-emerald-400 border-b border-slate-800 pb-1">
              Margins & Returns
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Gross Margin:</span>
              <span className="text-white font-bold">{currentStock.fundamentals.grossMargin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Operating Margin:</span>
              <span className="text-slate-200 font-semibold">{currentStock.fundamentals.operatingMargin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Net Margin:</span>
              <span className="text-slate-200 font-semibold">{currentStock.fundamentals.netMargin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">ROE / ROIC:</span>
              <span className="text-emerald-400 font-bold">{currentStock.fundamentals.roe.toFixed(1)}% / {currentStock.fundamentals.roic.toFixed(1)}%</span>
            </div>
          </div>

          {/* 3. Growth & Top-Line */}
          <div className="bg-slate-900/60 p-3.5 rounded border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-bold text-yellow-400 border-b border-slate-800 pb-1">
              Growth & Cash Flow
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Revenue YoY:</span>
              <span className={`font-bold ${currentStock.fundamentals.revenueGrowthYOY >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentStock.fundamentals.revenueGrowthYOY >= 0 ? '+' : ''}{currentStock.fundamentals.revenueGrowthYOY.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">EPS YoY:</span>
              <span className={`font-bold ${currentStock.fundamentals.epsGrowthYOY >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentStock.fundamentals.epsGrowthYOY >= 0 ? '+' : ''}{currentStock.fundamentals.epsGrowthYOY.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Free Cash Flow:</span>
              <span className="text-slate-200 font-semibold">
                {formatCurrencyValue(currentStock.fundamentals.freeCashFlow, currentStock.currency)}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Dividend Yield:</span>
              <span className="text-emerald-400 font-bold">{currentStock.fundamentals.dividendYield.toFixed(2)}%</span>
            </div>
          </div>

          {/* 4. Balance Sheet Quality */}
          <div className="bg-slate-900/60 p-3.5 rounded border border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-bold text-purple-400 border-b border-slate-800 pb-1">
              Capital Structure
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Debt / Equity:</span>
              <span className="text-white font-bold">{currentStock.fundamentals.debtToEquity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Shares Out:</span>
              <span className="text-slate-200 font-semibold">
                {(currentStock.fundamentals.sharesOutstanding / 1000000000).toFixed(2)}B
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Enterprise Value:</span>
              <span className="text-slate-200 font-semibold">
                {formatCurrencyValue(currentStock.fundamentals.enterpriseValue, currentStock.currency)}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-400">Audit Status:</span>
              <span className="text-emerald-400 font-bold">Clean</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Border Peer Comparison Matrix */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Cross-Border Peer Comparison Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Benchmark multiple valuation metrics against international industry comparables.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter Sector:</span>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Sectors</option>
              <option value="Technology">Technology</option>
              <option value="Energy">Energy</option>
              <option value="Consumer Discretionary">Consumer</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0e1420] text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3">Exchange</th>
                <th className="py-2.5 px-3 text-right">P/E (TTM)</th>
                <th className="py-2.5 px-3 text-right">EV/EBITDA</th>
                <th className="py-2.5 px-3 text-right">Revenue YoY</th>
                <th className="py-2.5 px-3 text-right">ROE</th>
                <th className="py-2.5 px-3 text-right">Debt/Equity</th>
                <th className="py-2.5 px-3 text-right">Yield</th>
                <th className="py-2.5 px-3">Standard</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {peers.map((p) => {
                const isSelected = p.id === currentStock.id;
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-900/60 transition-colors ${
                      isSelected ? 'bg-slate-800/40' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-bold text-white font-mono">{p.symbol}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[120px]">{p.name}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{p.exchange}</td>
                    <td className="py-2.5 px-3 text-right text-slate-200 font-semibold">{p.fundamentals.peRatio.toFixed(1)}x</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{p.fundamentals.evEbitda.toFixed(1)}x</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${p.fundamentals.revenueGrowthYOY >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {p.fundamentals.revenueGrowthYOY >= 0 ? '+' : ''}{p.fundamentals.revenueGrowthYOY.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-200">{p.fundamentals.roe.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{p.fundamentals.debtToEquity.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">{p.fundamentals.dividendYield.toFixed(2)}%</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-400">{p.fundamentals.accountingStandard}</td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <button
                        onClick={() => setSelectedStockId(p.id)}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
