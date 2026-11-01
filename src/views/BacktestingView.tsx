import React, { useState, useEffect } from 'react';
import { StockItem, BacktestResult } from '../types/market';
import { formatCurrencyValue } from '../utils/currency';

interface BacktestingViewProps {
  stocks: StockItem[];
}

export const BacktestingView: React.FC<BacktestingViewProps> = ({ stocks }) => {
  const [selectedSymbol, setSelectedSymbol] = useState(stocks[0]?.symbol || 'AAPL');
  const [strategy, setStrategy] = useState('52-Week High Breakout + Volume Surge');
  const [timeframe, setTimeframe] = useState('1 Year (Daily)');
  const [stopLossPercent, setStopLossPercent] = useState('5.0');
  const [targetProfitPercent, setTargetProfitPercent] = useState('12.0');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const runBacktest = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/market/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol,
          strategy,
          timeframe,
          stopLossPercent: parseFloat(stopLossPercent),
          targetProfitPercent: parseFloat(targetProfitPercent),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to run backtest:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runBacktest();
  }, [selectedSymbol]);

  const currentStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg space-y-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Quantitative Strategy Backtester</h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulate breakout and mean-reversion rule-based trading models with realistic transaction costs, stop-loss execution, and drawdown attribution.
          </p>
        </div>

        {/* Backtest Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs pt-1">
          {/* Instrument */}
          <div className="bg-[#070a0f] border border-slate-800 rounded p-2.5">
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Target Instrument</span>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full bg-transparent text-emerald-400 font-mono font-bold focus:outline-none cursor-pointer"
            >
              {stocks.map((s) => (
                <option key={s.id} value={s.symbol} className="bg-slate-900 text-slate-200">
                  {s.qualifiedSymbol} ({s.country})
                </option>
              ))}
            </select>
          </div>

          {/* Strategy Model */}
          <div className="bg-[#070a0f] border border-slate-800 rounded p-2.5">
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Trading Strategy</span>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="52-Week High Breakout + Volume Surge">52-Week High Breakout</option>
              <option value="20-Day VWAP Cross & Momentum">20-Day VWAP Cross</option>
              <option value="Golden Cross (50/200 SMA)">Golden Cross (50/200 SMA)</option>
              <option value="RSI Oversold Mean Reversion">RSI Oversold Mean Reversion</option>
            </select>
          </div>

          {/* Stop Loss % */}
          <div className="bg-[#070a0f] border border-slate-800 rounded p-2.5">
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Stop-Loss Limit (%)</span>
            <input
              type="number"
              step="0.5"
              value={stopLossPercent}
              onChange={(e) => setStopLossPercent(e.target.value)}
              className="w-full bg-transparent text-rose-400 font-mono font-bold focus:outline-none"
            />
          </div>

          {/* Target Profit % */}
          <div className="bg-[#070a0f] border border-slate-800 rounded p-2.5">
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Take Profit Target (%)</span>
            <input
              type="number"
              step="0.5"
              value={targetProfitPercent}
              onChange={(e) => setTargetProfitPercent(e.target.value)}
              className="w-full bg-transparent text-emerald-400 font-mono font-bold focus:outline-none"
            />
          </div>

          {/* Trigger Button */}
          <div className="flex items-end">
            <button
              onClick={runBacktest}
              disabled={isRunning}
              className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors disabled:opacity-50"
            >
              {isRunning ? 'Computing Trades...' : 'Run Simulation'}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Key Quant Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            <div className="bg-[#0b0f17] border border-slate-800 p-3 rounded-lg text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Win Rate</span>
              <span className="text-lg font-bold text-emerald-400">{result.winRatePercent}%</span>
            </div>

            <div className="bg-[#0b0f17] border border-slate-800 p-3 rounded-lg text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Profit Factor</span>
              <span className="text-lg font-bold text-white">{result.profitFactor}</span>
            </div>

            <div className="bg-[#0b0f17] border border-slate-800 p-3 rounded-lg text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Strategy Return</span>
              <span className="text-lg font-bold text-emerald-400">+{result.totalReturnPercent}%</span>
            </div>

            <div className="bg-[#0b0f17] border border-slate-800 p-3 rounded-lg text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Benchmark Return</span>
              <span className="text-lg font-bold text-slate-300">+{result.benchmarkReturnPercent}%</span>
            </div>

            <div className="bg-[#0b0f17] border border-slate-800 p-3 rounded-lg text-center">
              <span className="text-[10px] text-rose-400 uppercase font-bold block mb-1">Max Drawdown</span>
              <span className="text-lg font-bold text-rose-400">-{result.maxDrawdownPercent}%</span>
            </div>

            <div className="bg-[#0b0f17] border border-slate-800 p-3 rounded-lg text-center">
              <span className="text-[10px] text-cyan-400 uppercase font-bold block mb-1">Sharpe Ratio</span>
              <span className="text-lg font-bold text-cyan-400">{result.sharpeRatio}</span>
            </div>
          </div>

          {/* Trade Execution Log */}
          <div className="bg-[#0b0f17] border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-800/80 flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-300">
                Simulated Execution Log ({result.totalTrades} Executions)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Avg Hold: {result.avgHoldingDays} Days · Slippage Model: 0.05%
              </span>
            </div>

            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className="sticky top-0 bg-[#0e1420]">
                  <tr className="text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Trade #</th>
                    <th className="py-2.5 px-3">Entry Date</th>
                    <th className="py-2.5 px-3">Exit Date</th>
                    <th className="py-2.5 px-3 text-right">Entry Price</th>
                    <th className="py-2.5 px-3 text-right">Exit Price</th>
                    <th className="py-2.5 px-3 text-right">Return %</th>
                    <th className="py-2.5 px-3 text-center">Exit Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {result.tradeLog.map((t) => {
                    const isWin = t.returnPercent >= 0;
                    return (
                      <tr key={t.tradeId} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400">#{t.tradeId}</td>
                        <td className="py-2.5 px-3 text-slate-300">{t.entryDate}</td>
                        <td className="py-2.5 px-3 text-slate-300">{t.exitDate}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {formatCurrencyValue(t.entryPrice, currentStock.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-100 font-bold">
                          {formatCurrencyValue(t.exitPrice, currentStock.currency)}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold ${
                            isWin ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isWin ? '+' : ''}{t.returnPercent.toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-center font-sans">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                              t.exitReason.includes('Target')
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {t.exitReason}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
