import React, { useState, useEffect, useMemo } from 'react';
import { PortfolioPosition, StockItem, ExitAdvisorResult } from '../types/market';
import { convertCurrency, formatCurrencyValue } from '../utils/currency';

interface PortfolioViewProps {
  stocks: StockItem[];
  baseCurrency: string;
  onSelectStock: (stockId: string) => void;
}

const INITIAL_POSITIONS: PortfolioPosition[] = [
  {
    id: 'pos-1',
    symbol: 'NVDA',
    qualifiedSymbol: 'NVDA.NASDAQ',
    name: 'NVIDIA Corporation',
    exchange: 'NASDAQ',
    country: 'United States',
    shares: 40,
    avgCostLocal: 118.5,
    currency: 'USD',
    currentPriceLocal: 143.5,
    sector: 'Technology',
    dateAdded: '2024-08-15',
  },
  {
    id: 'pos-2',
    symbol: 'RELIANCE',
    qualifiedSymbol: 'RELIANCE.NSE',
    name: 'Reliance Industries Limited',
    exchange: 'NSE',
    country: 'India',
    shares: 80,
    avgCostLocal: 2580.0,
    currency: 'INR',
    currentPriceLocal: 2712.45,
    sector: 'Energy & Conglomerate',
    dateAdded: '2024-09-02',
  },
  {
    id: 'pos-3',
    symbol: '2330',
    qualifiedSymbol: '2330.TWSE',
    name: 'Taiwan Semiconductor Manufacturing Co.',
    exchange: 'TWSE',
    country: 'Taiwan',
    shares: 200,
    avgCostLocal: 940.0,
    currency: 'TWD',
    currentPriceLocal: 1075.0,
    sector: 'Technology',
    dateAdded: '2024-07-20',
  },
  {
    id: 'pos-4',
    symbol: 'ASML',
    qualifiedSymbol: 'ASML.EURONEXT',
    name: 'ASML Holding N.V.',
    exchange: 'Euronext Amsterdam',
    country: 'Netherlands',
    shares: 15,
    avgCostLocal: 720.0,
    currency: 'EUR',
    currentPriceLocal: 668.5,
    sector: 'Technology',
    dateAdded: '2024-09-10',
  },
];

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  stocks,
  baseCurrency,
  onSelectStock,
}) => {
  const [positions, setPositions] = useState<PortfolioPosition[]>(() => {
    const saved = localStorage.getItem('apex_portfolio_positions');
    return saved ? JSON.parse(saved) : INITIAL_POSITIONS;
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState(stocks[0]?.symbol || 'AAPL');
  const [newShares, setNewShares] = useState('10');
  const [newAvgCost, setNewAvgCost] = useState(stocks[0]?.price.toString() || '200');

  // Sell Advisor Modal State
  const [reviewPosition, setReviewPosition] = useState<PortfolioPosition | null>(null);
  const [sellAdvisorResult, setSellAdvisorResult] = useState<ExitAdvisorResult | null>(null);
  const [isLoadingSellReview, setIsLoadingSellReview] = useState(false);

  useEffect(() => {
    localStorage.setItem('apex_portfolio_positions', JSON.stringify(positions));
  }, [positions]);

  // Update current prices with live stock feed data
  const enrichedPositions = useMemo(() => {
    return positions.map((p) => {
      const live = stocks.find((s) => s.symbol.toUpperCase() === p.symbol.toUpperCase());
      const currentPrice = live ? live.price : p.currentPriceLocal;
      const totalCostLocal = p.shares * p.avgCostLocal;
      const currentValueLocal = p.shares * currentPrice;
      const pnlLocal = currentValueLocal - totalCostLocal;
      const pnlPercent = totalCostLocal > 0 ? (pnlLocal / totalCostLocal) * 100 : 0;

      // Base currency conversions
      const costInBase = convertCurrency(totalCostLocal, p.currency, baseCurrency).converted;
      const valueInBase = convertCurrency(currentValueLocal, p.currency, baseCurrency).converted;
      const pnlInBase = valueInBase - costInBase;

      return {
        ...p,
        currentPriceLocal: currentPrice,
        totalCostLocal,
        currentValueLocal,
        pnlLocal,
        pnlPercent,
        costInBase,
        valueInBase,
        pnlInBase,
      };
    });
  }, [positions, stocks, baseCurrency]);

  // Aggregated Portfolio Totals in Base Currency
  const totals = useMemo(() => {
    let totalCostBase = 0;
    let totalValueBase = 0;
    const countryExposure: Record<string, number> = {};
    const sectorExposure: Record<string, number> = {};

    enrichedPositions.forEach((p) => {
      totalCostBase += p.costInBase;
      totalValueBase += p.valueInBase;

      countryExposure[p.country] = (countryExposure[p.country] || 0) + p.valueInBase;
      sectorExposure[p.sector] = (sectorExposure[p.sector] || 0) + p.valueInBase;
    });

    const totalPnlBase = totalValueBase - totalCostBase;
    const totalPnlPercent = totalCostBase > 0 ? (totalPnlBase / totalCostBase) * 100 : 0;

    return {
      totalCostBase,
      totalValueBase,
      totalPnlBase,
      totalPnlPercent,
      countryExposure,
      sectorExposure,
    };
  }, [enrichedPositions]);

  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    const stock = stocks.find((s) => s.symbol.toUpperCase() === newSymbol.toUpperCase());
    if (!stock) return;

    const newPos: PortfolioPosition = {
      id: `pos-${Date.now()}`,
      symbol: stock.symbol,
      qualifiedSymbol: stock.qualifiedSymbol,
      name: stock.name,
      exchange: stock.exchange,
      country: stock.country,
      shares: Number(newShares) || 1,
      avgCostLocal: Number(newAvgCost) || stock.price,
      currency: stock.currency,
      currentPriceLocal: stock.price,
      sector: stock.sector,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    setPositions([...positions, newPos]);
    setShowAddModal(false);
  };

  const handleRemovePosition = (id: string) => {
    setPositions(positions.filter((p) => p.id !== id));
  };

  const openSellReview = async (pos: PortfolioPosition) => {
    setReviewPosition(pos);
    setIsLoadingSellReview(true);
    setSellAdvisorResult(null);

    try {
      const res = await fetch('/api/advisor/sell-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: pos.symbol,
          entryPrice: pos.avgCostLocal,
          shares: pos.shares,
        }),
      });
      const data = await res.json();
      setSellAdvisorResult(data);
    } catch (err) {
      console.error('Failed to evaluate sell timing:', err);
    } finally {
      setIsLoadingSellReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">International Multi-Currency Portfolio</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracks positions across global exchanges with dual local-currency & preferred base-currency conversion, plus real-time AI Sell Timing advice.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
        >
          + Add International Position
        </button>
      </div>

      {/* Portfolio Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-[#0b0f17] border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            Total Portfolio Value ({baseCurrency})
          </span>
          <span className="text-xl font-bold text-white">
            {formatCurrencyValue(totals.totalValueBase, baseCurrency)}
          </span>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            Invested Capital ({baseCurrency})
          </span>
          <span className="text-xl font-bold text-slate-300">
            {formatCurrencyValue(totals.totalCostBase, baseCurrency)}
          </span>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Unrealized P&L</span>
          <span
            className={`text-xl font-bold ${
              totals.totalPnlBase >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totals.totalPnlBase >= 0 ? '+' : ''}
            {formatCurrencyValue(totals.totalPnlBase, baseCurrency)} ({totals.totalPnlPercent.toFixed(2)}%)
          </span>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            Positions & Diversification
          </span>
          <span className="text-xl font-bold text-cyan-400">{positions.length} Active Holdings</span>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex justify-between items-center text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-300">Active Holdings Ledger</span>
          <span className="text-[11px] font-mono text-slate-400">
            Live Feed Currency: <strong className="text-white">{baseCurrency}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-[#0e1420] text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4 font-sans">Instrument</th>
                <th className="py-3 px-4 text-center">Country / Exchange</th>
                <th className="py-3 px-4 text-right">Shares</th>
                <th className="py-3 px-4 text-right">Avg Cost (Local)</th>
                <th className="py-3 px-4 text-right">Current Price (Local)</th>
                <th className="py-3 px-4 text-right">Value ({baseCurrency})</th>
                <th className="py-3 px-4 text-right">Unrealized P&L</th>
                <th className="py-3 px-4 text-center font-sans">AI Sell Advisor</th>
                <th className="py-3 px-4 text-center font-sans">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {enrichedPositions.map((pos) => {
                const isPosUp = pos.pnlLocal >= 0;

                return (
                  <tr key={pos.id} className="hover:bg-slate-900/60 transition-colors">
                    {/* Symbol */}
                    <td className="py-3 px-4 font-sans">
                      <div
                        onClick={() => onSelectStock(pos.symbol.toLowerCase())}
                        className="font-bold text-white hover:text-emerald-400 cursor-pointer font-mono"
                      >
                        {pos.qualifiedSymbol}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{pos.name}</div>
                    </td>

                    {/* Country & Exchange */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-slate-300">{pos.country}</span>
                      <div className="text-[10px] text-slate-400">{pos.exchange}</div>
                    </td>

                    {/* Shares */}
                    <td className="py-3 px-4 text-right text-slate-200 font-bold">{pos.shares}</td>

                    {/* Avg Cost Local */}
                    <td className="py-3 px-4 text-right text-slate-400">
                      {formatCurrencyValue(pos.avgCostLocal, pos.currency)}
                    </td>

                    {/* Current Price Local */}
                    <td className="py-3 px-4 text-right text-slate-200 font-semibold">
                      {formatCurrencyValue(pos.currentPriceLocal, pos.currency)}
                    </td>

                    {/* Converted Value Base */}
                    <td className="py-3 px-4 text-right text-white font-bold">
                      {formatCurrencyValue(pos.valueInBase, baseCurrency)}
                    </td>

                    {/* Unrealized P&L */}
                    <td className="py-3 px-4 text-right font-bold">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                          isPosUp ? 'text-emerald-400 bg-emerald-950/50' : 'text-rose-400 bg-rose-950/50'
                        }`}
                      >
                        {isPosUp ? '+' : ''}
                        {formatCurrencyValue(pos.pnlInBase, baseCurrency)} ({isPosUp ? '+' : ''}
                        {pos.pnlPercent.toFixed(2)}%)
                      </span>
                    </td>

                    {/* AI Sell Advisor Button */}
                    <td className="py-3 px-4 text-center font-sans">
                      <button
                        onClick={() => openSellReview(pos)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 rounded hover:bg-cyan-900 transition-colors"
                      >
                        🔍 Should I Sell?
                      </button>
                    </td>

                    {/* Delete action */}
                    <td className="py-3 px-4 text-center font-sans">
                      <button
                        onClick={() => handleRemovePosition(pos.id)}
                        className="text-slate-500 hover:text-rose-400 text-xs transition-colors px-2 py-1"
                        title="Remove position"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sell Advisor Review Modal */}
      {reviewPosition && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0e1420] border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Sell Timing Assistant ("Should I Sell?")</span>
                  <span className="font-mono text-emerald-400">{reviewPosition.qualifiedSymbol}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Position: {reviewPosition.shares} shares @ {reviewPosition.currency} {reviewPosition.avgCostLocal}
                </p>
              </div>
              <button
                onClick={() => setReviewPosition(null)}
                className="text-slate-400 hover:text-white text-base font-mono p-1"
              >
                ✕
              </button>
            </div>

            {isLoadingSellReview ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                Running quantitative exit analysis against verified support and momentum...
              </div>
            ) : sellAdvisorResult ? (
              <div className="space-y-4 text-xs font-mono">
                {/* Recommendation Status */}
                <div className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400 font-sans">AI Recommendation:</span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded border uppercase ${
                      sellAdvisorResult.recommendation === 'HOLD'
                        ? 'text-emerald-400 bg-emerald-950 border-emerald-800'
                        : sellAdvisorResult.recommendation === 'TAKE-PROFIT REVIEW'
                        ? 'text-amber-400 bg-amber-950 border-amber-800'
                        : sellAdvisorResult.recommendation === 'REDUCE-RISK REVIEW'
                        ? 'text-orange-400 bg-orange-950 border-orange-800'
                        : 'text-rose-400 bg-rose-950 border-rose-800'
                    }`}
                  >
                    {sellAdvisorResult.recommendation}
                  </span>
                </div>

                {/* Reason */}
                <div className="bg-[#070a0f] p-3 rounded border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Primary Reason:</span>
                  <p className="text-slate-200 font-sans leading-relaxed text-xs">
                    {sellAdvisorResult.primaryReason}
                  </p>
                </div>

                {/* Profit Guidance */}
                <div className="bg-emerald-950/20 border border-emerald-900/60 p-3 rounded space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                    Partial Profit-Taking Guidance:
                  </span>
                  <p className="text-slate-300 font-sans leading-relaxed text-xs">
                    {sellAdvisorResult.partialProfitGuidance}
                  </p>
                </div>

                {/* Trailing Stop Recommendation */}
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded space-y-1">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold block">
                    Dynamic Trailing Stop:
                  </span>
                  <p className="text-slate-300 font-sans leading-relaxed text-xs">
                    {sellAdvisorResult.trailingStopRecommendation}
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 font-sans italic pt-1">
                  Note: Decision models evaluate risk asymmetry and capital protection. Never guarantees exact market tops.
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setReviewPosition(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (reviewPosition) {
                    onSelectStock(reviewPosition.symbol.toLowerCase());
                    setReviewPosition(null);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
              >
                Inspect Full Technical Chart →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Position Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0e1420] border border-slate-700 rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add Global Position</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPosition} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Instrument</label>
                <select
                  value={newSymbol}
                  onChange={(e) => {
                    setNewSymbol(e.target.value);
                    const match = stocks.find((s) => s.symbol === e.target.value);
                    if (match) setNewAvgCost(match.price.toString());
                  }}
                  className="w-full bg-[#070a0f] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none font-mono"
                >
                  {stocks.map((s) => (
                    <option key={s.id} value={s.symbol} className="bg-slate-900">
                      {s.qualifiedSymbol} — {s.name} ({s.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Quantity (Shares)</label>
                <input
                  type="number"
                  value={newShares}
                  onChange={(e) => setNewShares(e.target.value)}
                  className="w-full bg-[#070a0f] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Average Purchase Price (Local Currency)</label>
                <input
                  type="number"
                  step="any"
                  value={newAvgCost}
                  onChange={(e) => setNewAvgCost(e.target.value)}
                  className="w-full bg-[#070a0f] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded"
                >
                  Record Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
