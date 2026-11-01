import React, { useState, useEffect, useMemo } from 'react';
import { StockItem, PaperTradePosition, PaperTradeOrder } from '../types/market';
import { formatCurrencyValue } from '../utils/currency';

interface PaperTradingViewProps {
  stocks: StockItem[];
  baseCurrency: string;
  onSelectStock: (stockId: string) => void;
}

const INITIAL_VIRTUAL_CASH = 100000;

export const PaperTradingView: React.FC<PaperTradingViewProps> = ({
  stocks,
  baseCurrency,
  onSelectStock,
}) => {
  // Virtual Balance State stored in localStorage
  const [cashBalance, setCashBalance] = useState<number>(() => {
    const saved = localStorage.getItem('apex_paper_cash');
    return saved ? parseFloat(saved) : INITIAL_VIRTUAL_CASH;
  });

  const [positions, setPositions] = useState<PaperTradePosition[]>(() => {
    const saved = localStorage.getItem('apex_paper_positions');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'paper-1',
            symbol: 'NVDA',
            name: 'NVIDIA Corporation',
            exchange: 'NASDAQ',
            currency: 'USD',
            type: 'BUY',
            shares: 50,
            entryPrice: 128.5,
            currentPrice: 143.5,
            targetPrice: 165.0,
            stopLossPrice: 122.0,
            dateOpened: '2024-10-10',
          },
          {
            id: 'paper-2',
            symbol: 'AAPL',
            name: 'Apple Inc.',
            exchange: 'NASDAQ',
            currency: 'USD',
            type: 'BUY',
            shares: 60,
            entryPrice: 226.0,
            currentPrice: 232.8,
            targetPrice: 245.0,
            stopLossPrice: 218.0,
            dateOpened: '2024-10-18',
          },
        ];
  });

  const [orders, setOrders] = useState<PaperTradeOrder[]>(() => {
    const saved = localStorage.getItem('apex_paper_orders');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'ord-1',
            symbol: 'NVDA',
            type: 'BUY',
            shares: 50,
            price: 128.5,
            timestamp: '2024-10-10 09:35:00',
            status: 'FILLED',
          },
          {
            id: 'ord-2',
            symbol: 'AAPL',
            type: 'BUY',
            shares: 60,
            price: 226.0,
            timestamp: '2024-10-18 10:15:00',
            status: 'FILLED',
          },
        ];
  });

  // Order Ticket State
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(stocks[0]?.symbol || 'NVDA');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL_SHORT'>('BUY');
  const [tradeShares, setTradeShares] = useState<number>(25);
  const [targetTakeProfit, setTargetTakeProfit] = useState<string>('');
  const [stopLossTrigger, setStopLossTrigger] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('apex_paper_cash', cashBalance.toString());
  }, [cashBalance]);

  useEffect(() => {
    localStorage.setItem('apex_paper_positions', JSON.stringify(positions));
  }, [positions]);

  useEffect(() => {
    localStorage.setItem('apex_paper_orders', JSON.stringify(orders));
  }, [orders]);

  const activeStock = useMemo(() => {
    return stocks.find((s) => s.symbol.toUpperCase() === selectedStockSymbol.toUpperCase()) || stocks[0];
  }, [stocks, selectedStockSymbol]);

  // Update target and stop loss suggestions when stock changes
  useEffect(() => {
    if (activeStock) {
      setTargetTakeProfit(Number((activeStock.price * 1.10).toFixed(2)).toString());
      setStopLossTrigger(Number((activeStock.price * 0.94).toFixed(2)).toString());
    }
  }, [activeStock]);

  // Enriched Positions with Live Prices
  const enrichedPositions = useMemo(() => {
    return positions.map((p) => {
      const live = stocks.find((s) => s.symbol.toUpperCase() === p.symbol.toUpperCase());
      const currentPrice = live ? live.price : p.currentPrice;
      const totalCost = p.shares * p.entryPrice;
      const currentValue = p.shares * currentPrice;
      const pnl = p.type === 'BUY' ? currentValue - totalCost : totalCost - currentValue;
      const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

      return {
        ...p,
        currentPrice,
        totalCost,
        currentValue,
        pnl,
        pnlPct,
      };
    });
  }, [positions, stocks]);

  // Account Analytics
  const portfolioEquity = useMemo(() => {
    const openValue = enrichedPositions.reduce((acc, p) => acc + p.currentValue, 0);
    return cashBalance + openValue;
  }, [cashBalance, enrichedPositions]);

  const totalUnrealizedPnl = useMemo(() => {
    return enrichedPositions.reduce((acc, p) => acc + p.pnl, 0);
  }, [enrichedPositions]);

  // Execute Paper Trade Order
  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStock) return;

    const totalCost = activeStock.price * tradeShares;
    if (totalCost > cashBalance) {
      setToastMessage('⚠️ Insufficient virtual buying power for this transaction.');
      setTimeout(() => setToastMessage(''), 4000);
      return;
    }

    setCashBalance((prev) => prev - totalCost);

    const newPos: PaperTradePosition = {
      id: `paper-${Date.now()}`,
      symbol: activeStock.symbol,
      name: activeStock.name,
      exchange: activeStock.exchange,
      currency: activeStock.currency,
      type: tradeType,
      shares: tradeShares,
      entryPrice: activeStock.price,
      currentPrice: activeStock.price,
      targetPrice: parseFloat(targetTakeProfit) || undefined,
      stopLossPrice: parseFloat(stopLossTrigger) || undefined,
      dateOpened: new Date().toISOString().split('T')[0],
    };

    const newOrd: PaperTradeOrder = {
      id: `ord-${Date.now()}`,
      symbol: activeStock.symbol,
      type: tradeType === 'BUY' ? 'BUY' : 'SELL',
      shares: tradeShares,
      price: activeStock.price,
      timestamp: new Date().toLocaleString(),
      status: 'FILLED',
    };

    setPositions([newPos, ...positions]);
    setOrders([newOrd, ...orders]);
    setToastMessage(`✓ Virtual order filled: ${tradeShares} shares of ${activeStock.symbol} at ${formatCurrencyValue(activeStock.price, activeStock.currency)}`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  // Close Position
  const handleClosePosition = (posId: string) => {
    const target = enrichedPositions.find((p) => p.id === posId);
    if (!target) return;

    setCashBalance((prev) => prev + target.currentValue);
    setPositions((prev) => prev.filter((p) => p.id !== posId));

    const closeOrd: PaperTradeOrder = {
      id: `ord-${Date.now()}`,
      symbol: target.symbol,
      type: 'SELL',
      shares: target.shares,
      price: target.currentPrice,
      timestamp: new Date().toLocaleString(),
      status: 'FILLED',
      pnl: target.pnl,
    };

    setOrders([closeOrd, ...orders]);
    setToastMessage(`✓ Position closed: ${target.symbol} with ${target.pnl >= 0 ? '+' : ''}${formatCurrencyValue(target.pnl, target.currency)} realized P&L`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleResetPaperAccount = () => {
    if (confirm('Reset virtual paper trading balance back to initial $100,000 cash?')) {
      setCashBalance(INITIAL_VIRTUAL_CASH);
      setPositions([]);
      setOrders([]);
      setToastMessage('✓ Paper trading simulation reset to $100,000 virtual balance.');
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Risk-Free Notice */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-bold border border-emerald-800">
              SAFE VIRTUAL SIMULATION
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">Institutional Paper Trading Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Test quantitative setups, validate stop-loss strategies, and practice trade execution using verified real-time global market feeds. Uses simulated capital without real-money risk.
          </p>
        </div>

        <button
          onClick={handleResetPaperAccount}
          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded font-mono hover:bg-slate-800 transition-colors"
        >
          Reset Simulation ($100k)
        </button>
      </div>

      {toastMessage && (
        <div className="bg-emerald-950/80 border border-emerald-700 p-3 rounded-lg text-xs text-emerald-200 font-mono flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-emerald-400 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Account KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-[#0b0f17] border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Total Account Equity</span>
          <span className="text-xl font-bold text-white">${portfolioEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Cash + Open Positions</span>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Available Virtual Cash</span>
          <span className="text-xl font-bold text-emerald-400">${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Unallocated Buying Power</span>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Unrealized P&L</span>
          <span className={`text-xl font-bold ${totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{enrichedPositions.length} Open Trades</span>
        </div>

        <div className="bg-[#0b0f17] border border-slate-800 p-4 rounded-lg">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Historical Win Rate</span>
          <span className="text-xl font-bold text-cyan-400">
            {orders.filter((o) => o.pnl !== undefined).length > 0
              ? `${(
                  (orders.filter((o) => (o.pnl || 0) > 0).length /
                    orders.filter((o) => o.pnl !== undefined).length) *
                  100
                ).toFixed(1)}%`
              : 'N/A (Open)'}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Closed Trades Evaluated</span>
        </div>
      </div>

      {/* Main Grid: Order Execution Ticket & Active Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Ticket */}
        <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-300 font-mono">
              Virtual Order Terminal
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">Instant Execution</span>
          </div>

          <form onSubmit={handleExecuteOrder} className="space-y-3 text-xs">
            {/* Instrument Dropdown */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Instrument</label>
              <select
                value={selectedStockSymbol}
                onChange={(e) => setSelectedStockSymbol(e.target.value)}
                className="w-full bg-[#070a0f] border border-slate-700 rounded px-3 py-2 text-slate-200 font-mono font-bold focus:outline-none"
              >
                {stocks.map((s) => (
                  <option key={s.id} value={s.symbol} className="bg-slate-900">
                    {s.qualifiedSymbol} — {formatCurrencyValue(s.price, s.currency)} ({s.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Buy vs Short Toggle */}
            <div className="grid grid-cols-2 gap-2 font-mono">
              <button
                type="button"
                onClick={() => setTradeType('BUY')}
                className={`py-1.5 rounded font-bold text-center transition-colors ${
                  tradeType === 'BUY'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                BUY / LONG
              </button>
              <button
                type="button"
                onClick={() => setTradeType('SELL_SHORT')}
                className={`py-1.5 rounded font-bold text-center transition-colors ${
                  tradeType === 'SELL_SHORT'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                SELL / SHORT
              </button>
            </div>

            {/* Shares Quantity */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-slate-400">Order Quantity</label>
                <span className="font-mono text-slate-400 text-[10px]">
                  Estimated: {formatCurrencyValue(activeStock.price * tradeShares, activeStock.currency)}
                </span>
              </div>
              <input
                type="number"
                min={1}
                value={tradeShares}
                onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#070a0f] border border-slate-700 rounded px-3 py-1.5 text-white font-mono font-bold focus:outline-none"
              />
            </div>

            {/* Take Profit & Stop Loss inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-emerald-400 block mb-1">Target Price (High)</label>
                <input
                  type="number"
                  step="any"
                  value={targetTakeProfit}
                  onChange={(e) => setTargetTakeProfit(e.target.value)}
                  className="w-full bg-[#070a0f] border border-slate-700 rounded px-2.5 py-1 text-emerald-400 font-mono focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-rose-400 block mb-1">Stop Loss (Low)</label>
                <input
                  type="number"
                  step="any"
                  value={stopLossTrigger}
                  onChange={(e) => setStopLossTrigger(e.target.value)}
                  className="w-full bg-[#070a0f] border border-slate-700 rounded px-2.5 py-1 text-rose-400 font-mono focus:outline-none text-xs"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-2.5 rounded font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>Execute Virtual Trade</span>
            </button>
          </form>
        </div>

        {/* Active Open Positions Table */}
        <div className="lg:col-span-2 bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-300 font-mono">
              Active Virtual Positions ({enrichedPositions.length})
            </span>
            <span className="text-slate-400 font-mono text-[11px]">Real-Time Price Updates</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800/80 text-[10px] uppercase">
                  <th className="py-2 px-3 font-sans">Asset</th>
                  <th className="py-2 px-3 text-right">Shares</th>
                  <th className="py-2 px-3 text-right">Entry</th>
                  <th className="py-2 px-3 text-right">Current</th>
                  <th className="py-2 px-3 text-right">Unrealized P&L</th>
                  <th className="py-2 px-3 text-center font-sans">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {enrichedPositions.map((pos) => {
                  const isUp = pos.pnl >= 0;

                  return (
                    <tr key={pos.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-2.5 px-3 font-sans">
                        <div
                          onClick={() => onSelectStock(pos.symbol.toLowerCase())}
                          className="font-bold text-white hover:text-emerald-400 cursor-pointer font-mono"
                        >
                          {pos.symbol}
                        </div>
                        <div className="text-[10px] text-slate-400">{pos.name}</div>
                      </td>

                      <td className="py-2.5 px-3 text-right text-slate-200 font-bold">{pos.shares}</td>

                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {formatCurrencyValue(pos.entryPrice, pos.currency)}
                      </td>

                      <td className="py-2.5 px-3 text-right text-white font-semibold">
                        {formatCurrencyValue(pos.currentPrice, pos.currency)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-bold">
                        <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
                          {isUp ? '+' : ''}{formatCurrencyValue(pos.pnl, pos.currency)} ({isUp ? '+' : ''}{pos.pnlPct.toFixed(2)}%)
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center font-sans">
                        <button
                          onClick={() => handleClosePosition(pos.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/60 rounded hover:bg-rose-900 transition-colors"
                        >
                          Close Out
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {enrichedPositions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500 font-sans text-xs">
                      No active open positions. Select an instrument on the left to start testing strategies.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trade Execution History Ledger */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-300 font-mono">
            Virtual Execution Ledger ({orders.length} Trades)
          </span>
          <span className="text-[11px] font-mono text-slate-500">Audit Provenance</span>
        </div>

        <div className="divide-y divide-slate-800/80 max-h-56 overflow-y-auto">
          {orders.map((ord) => (
            <div key={ord.id} className="py-2 px-2 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    ord.type === 'BUY'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {ord.type}
                </span>
                <strong className="text-white">{ord.symbol}</strong>
                <span className="text-slate-400">{ord.shares} shares @ ${ord.price.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-4">
                {ord.pnl !== undefined && (
                  <span className={`font-bold ${ord.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {ord.pnl >= 0 ? '+' : ''}${ord.pnl.toFixed(2)}
                  </span>
                )}
                <span className="text-[10px] text-slate-500">{ord.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
