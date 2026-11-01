import React, { useState, useEffect } from 'react';
import { WatchlistAlert, StockItem, NotificationDeliveryLog, NotificationChannelConfig } from '../types/market';
import { formatCurrencyValue } from '../utils/currency';
import { INITIAL_ALERTS } from '../data/marketData';
import { MiniSparkline, generate24hPricePoints } from '../components/MiniSparkline';

interface WatchlistViewProps {
  stocks: StockItem[];
  alerts?: WatchlistAlert[];
  onAddAlert?: (alert: WatchlistAlert) => void;
  onDeleteAlert?: (alertId: string) => void;
  onSelectStock: (stockId: string) => void;
}

type WatchlistActiveTab = 'alerts-table' | 'notification-center';

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  stocks,
  alerts: externalAlerts,
  onAddAlert: externalAddAlert,
  onDeleteAlert: externalDeleteAlert,
  onSelectStock,
}) => {
  const [activeTab, setActiveTab] = useState<WatchlistActiveTab>('alerts-table');

  const [internalAlerts, setInternalAlerts] = useState<WatchlistAlert[]>(() => {
    const saved = localStorage.getItem('apex_watchlist_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const alerts = externalAlerts || internalAlerts;

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(stocks[0]?.symbol || 'AAPL');
  const [targetPrice, setTargetPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [dropPercentThreshold, setDropPercentThreshold] = useState<number>(2.0);
  const [referenceType, setReferenceType] = useState<'PREV_CLOSE' | 'DAY_OPEN' | 'RECENT_HIGH'>('PREV_CLOSE');
  const [isTrailing, setIsTrailing] = useState<boolean>(false);
  const [trailingPct, setTrailingPct] = useState<number>(5.0);
  const [note, setNote] = useState('');

  // Notification Center State
  const [deliveryLogs, setDeliveryLogs] = useState<NotificationDeliveryLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [channelConfig, setChannelConfig] = useState<NotificationChannelConfig>({
    inAppEnabled: true,
    browserPushEnabled: true,
    webhookEnabled: false,
    webhookUrl: 'https://hooks.slack.com/services/T000/B000/XXXX',
    emailSimulationEnabled: true,
    emailRecipient: 'trader@apexcapital.internal',
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    defaultCooldownMinutes: 15,
  });

  useEffect(() => {
    if (!externalAlerts) {
      localStorage.setItem('apex_watchlist_alerts', JSON.stringify(internalAlerts));
    }
  }, [internalAlerts, externalAlerts]);

  // Fetch Delivery Logs & Config from server
  const fetchNotificationData = async () => {
    setIsLoadingLogs(true);
    try {
      const [logsRes, configRes] = await Promise.all([
        fetch('/api/notifications/log'),
        fetch('/api/notifications/config'),
      ]);
      const logsData = await logsRes.json();
      const configData = await configRes.json();
      if (logsData.logs) setDeliveryLogs(logsData.logs);
      if (configData.config) setChannelConfig(configData.config);
    } catch (err) {
      console.error('Failed to load notification logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchNotificationData();
  }, [activeTab]);

  const saveChannelConfig = async (newConfig: NotificationChannelConfig) => {
    setChannelConfig(newConfig);
    try {
      await fetch('/api/notifications/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  };

  const clearDeliveryLogs = async () => {
    try {
      await fetch('/api/notifications/log/clear', { method: 'POST' });
      setDeliveryLogs([]);
    } catch (err) {
      console.error('Failed to clear logs:', err);
    }
  };

  // Update current prices dynamically from stock list
  const enrichedAlerts = alerts.map((a) => {
    const stock = stocks.find((s) => s.symbol.toUpperCase() === a.symbol.toUpperCase());
    const curr = stock ? stock.price : a.currentPrice;
    let status = a.status;
    if (curr >= a.targetPrice && a.status === 'ACTIVE') status = 'TRIGGERED_TARGET';
    else if (curr <= a.stopPrice && a.status === 'ACTIVE') status = 'TRIGGERED_STOP';

    return {
      ...a,
      currentPrice: curr,
      status,
    };
  });

  const handleAddAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const stock = stocks.find((s) => s.symbol === selectedSymbol);
    if (!stock) return;

    const newAlert: WatchlistAlert = {
      id: `alt-${Date.now()}`,
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      currency: stock.currency,
      targetPrice: Number(targetPrice) || stock.price * 1.1,
      stopPrice: Number(stopPrice) || stock.price * 0.93,
      currentPrice: stock.price,
      status: 'ACTIVE',
      dateCreated: new Date().toISOString().split('T')[0],
      note: note || `Monitored with ${dropPercentThreshold}% drop alert`,
      category: isTrailing ? 'SELL / REDUCE EXPOSURE REVIEW' : 'BUY OPPORTUNITY WATCH',
      dropPercentThreshold,
      referenceType,
      trailingStopActive: isTrailing,
      trailingStopPercent: isTrailing ? trailingPct : undefined,
      highestPriceReached: stock.price,
      cooldownMinutes: 15,
      suggestedAction: 'WAIT FOR STABILIZATION',
    };

    if (externalAddAlert) {
      externalAddAlert(newAlert);
    } else {
      setInternalAlerts([newAlert, ...internalAlerts]);
    }

    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert),
      });
    } catch {
      // ignore
    }

    setShowAddModal(false);
    setTargetPrice('');
    setStopPrice('');
    setNote('');
  };

  const handleDeleteAlert = async (id: string) => {
    if (externalDeleteAlert) {
      externalDeleteAlert(id);
    } else {
      setInternalAlerts(internalAlerts.filter((a) => a.id !== id));
    }

    try {
      await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Mode Navigation */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Continuous Market Monitoring & Real-Time Alerts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Multi-exchange surveillance worker operating continuous price drop detection, dynamic trailing profit protection, and multi-channel notification dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('alerts-table')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'alerts-table'
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Triggers ({alerts.length})
            </button>
            <button
              onClick={() => setActiveTab('notification-center')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'notification-center'
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Notification Center & Audit Log ({deliveryLogs.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>+ Set New Alert</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: ACTIVE WATCHLIST & PRICE ALERTS */}
      {activeTab === 'alerts-table' && (
        <div className="space-y-4">
          <div className="bg-[#0b0f17] border border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-[#0e1420] text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 font-sans">Instrument</th>
                    <th className="py-3 px-4 text-right">Current Price</th>
                    <th className="py-3 px-4 text-center font-sans">24h Sparkline</th>
                    <th className="py-3 px-4 text-right">Target Alert</th>
                    <th className="py-3 px-4 text-right">Stop Invalidation</th>
                    <th className="py-3 px-4 text-center">Drop Threshold</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 font-sans">Strategy Note</th>
                    <th className="py-3 px-4 text-center font-sans">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {enrichedAlerts.map((alt) => {
                    const targetDist = ((alt.targetPrice - alt.currentPrice) / alt.currentPrice) * 100;
                    const stopDist = ((alt.stopPrice - alt.currentPrice) / alt.currentPrice) * 100;
                    const matchingStock = stocks.find((s) => s.symbol.toUpperCase() === alt.symbol.toUpperCase());
                    const changePct = matchingStock ? matchingStock.changePercent : 0;
                    const isUp = changePct >= 0;
                    const sparklinePoints = generate24hPricePoints(
                      alt.currentPrice,
                      changePct,
                      matchingStock?.dayHigh,
                      matchingStock?.dayLow,
                      alt.symbol
                    );

                    return (
                      <tr key={alt.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-4 font-sans">
                          <div
                            onClick={() => onSelectStock(matchingStock ? matchingStock.id : alt.symbol.toLowerCase())}
                            className="font-bold text-white hover:text-emerald-400 cursor-pointer font-mono"
                          >
                            {alt.symbol}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {alt.name} ({alt.exchange})
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right font-bold text-slate-100">
                          {formatCurrencyValue(alt.currentPrice, alt.currency)}
                        </td>

                        {/* 24-Hour Mini Sparkline Column */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <MiniSparkline points={sparklinePoints} isPositive={isUp} width={104} height={26} />
                            <div className="flex items-center gap-1.5 text-[10px] font-mono mt-1">
                              <span className={isUp ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {isUp ? '▲ +' : '▼ '}
                                {changePct.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="text-emerald-400 font-bold">
                            {formatCurrencyValue(alt.targetPrice, alt.currency)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            ({targetDist >= 0 ? '+' : ''}
                            {targetDist.toFixed(1)}%)
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="text-rose-400 font-bold">
                            {formatCurrencyValue(alt.stopPrice, alt.currency)}
                          </div>
                          <div className="text-[10px] text-slate-400">({stopDist.toFixed(1)}%)</div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-orange-400 border border-slate-800">
                            {alt.dropPercentThreshold ? `-${alt.dropPercentThreshold}%` : '-2.0%'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-sans">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                              alt.status === 'TRIGGERED_TARGET'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : alt.status === 'TRIGGERED_STOP'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {alt.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-300 font-sans text-xs max-w-xs truncate">
                          {alt.note}
                        </td>

                        <td className="py-3 px-4 text-center font-sans">
                          <button
                            onClick={() => handleDeleteAlert(alt.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete alert"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {enrichedAlerts.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 text-xs font-sans">
                        No active price alerts on your watchlist. Click above to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: MULTI-CHANNEL NOTIFICATION CENTER & AUDIT LOG */}
      {activeTab === 'notification-center' && (
        <div className="space-y-6">
          {/* Channel Configuration Bar */}
          <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Multi-Channel Dispatch Channels & Rules
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                Cooldown Guard: {channelConfig.defaultCooldownMinutes} min active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Channel 1: In-App Toasts */}
              <div className="bg-[#070a0f] p-3 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">In-App Alerts</span>
                  <span className="text-[10px] text-slate-400">Audio chime & floating toasts</span>
                </div>
                <input
                  type="checkbox"
                  checked={channelConfig.inAppEnabled}
                  onChange={(e) => saveChannelConfig({ ...channelConfig, inAppEnabled: e.target.checked })}
                  className="h-4 w-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Channel 2: Browser Push */}
              <div className="bg-[#070a0f] p-3 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Browser Push</span>
                  <span className="text-[10px] text-slate-400">Native system notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={channelConfig.browserPushEnabled}
                  onChange={(e) => saveChannelConfig({ ...channelConfig, browserPushEnabled: e.target.checked })}
                  className="h-4 w-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Channel 3: Email Dispatch */}
              <div className="bg-[#070a0f] p-3 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Email Dispatch</span>
                  <span className="text-[10px] text-slate-400">{channelConfig.emailRecipient}</span>
                </div>
                <input
                  type="checkbox"
                  checked={channelConfig.emailSimulationEnabled}
                  onChange={(e) => saveChannelConfig({ ...channelConfig, emailSimulationEnabled: e.target.checked })}
                  className="h-4 w-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Channel 4: Quiet Hours */}
              <div className="bg-[#070a0f] p-3 rounded border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Quiet Hours</span>
                  <span className="text-[10px] text-slate-400">
                    {channelConfig.quietHoursStart} – {channelConfig.quietHoursEnd}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={channelConfig.quietHoursEnabled}
                  onChange={(e) => saveChannelConfig({ ...channelConfig, quietHoursEnabled: e.target.checked })}
                  className="h-4 w-4 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Delivery Audit Log ({deliveryLogs.length} Records)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchNotificationData}
                  disabled={isLoadingLogs}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ↻ Refresh
                </button>
                <button
                  onClick={clearDeliveryLogs}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Clear Log
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto">
              {deliveryLogs.map((log) => (
                <div key={log.id} className="py-3 px-2 hover:bg-slate-900/50 transition-colors text-xs font-mono">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.category === 'RED ALERT'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : log.category === 'BUY OPPORTUNITY WATCH'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : log.category === 'BREAKOUT WATCH'
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            : 'bg-slate-900 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {log.category}
                      </span>
                      <strong className="text-white">{log.symbol}</strong>
                      <span className="text-slate-500 text-[11px] font-sans">via {log.channel}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span
                        className={`font-semibold ${
                          log.status === 'DELIVERED'
                            ? 'text-emerald-400'
                            : log.status === 'SUPPRESSED_COOLDOWN'
                            ? 'text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="text-slate-200 font-sans font-medium text-[11px] mt-0.5">{log.headline}</div>
                  <div className="text-slate-400 font-sans text-[11px] mt-0.5 leading-relaxed">{log.detail}</div>
                </div>
              ))}

              {deliveryLogs.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-xs font-mono">
                  No notification events recorded yet. Background monitoring worker is actively checking thresholds.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#0e1420] border border-slate-700 rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create Price / Drop Alert</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAlert} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Instrument</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="w-full bg-[#070a0f] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none font-mono"
                >
                  {stocks.map((s) => (
                    <option key={s.id} value={s.symbol} className="bg-slate-900">
                      {s.qualifiedSymbol} — {s.name} ({formatCurrencyValue(s.price, s.currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-emerald-400 mb-1">Target Price (High)</label>
                  <input
                    type="number"
                    step="any"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="e.g. 245.00"
                    className="w-full bg-[#070a0f] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-rose-400 mb-1">Stop Invalidation (Low)</label>
                  <input
                    type="number"
                    step="any"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(e.target.value)}
                    placeholder="e.g. 222.00"
                    className="w-full bg-[#070a0f] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Drop Threshold (%)</label>
                  <select
                    value={dropPercentThreshold}
                    onChange={(e) => setDropPercentThreshold(parseFloat(e.target.value))}
                    className="w-full bg-[#070a0f] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none font-mono"
                  >
                    <option value={1}>-1% Drop Trigger</option>
                    <option value={2}>-2% Drop Trigger</option>
                    <option value={3}>-3% Drop Trigger</option>
                    <option value={5}>-5% Severe Alert</option>
                    <option value={10}>-10% Crash Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Reference Price</label>
                  <select
                    value={referenceType}
                    onChange={(e) => setReferenceType(e.target.value as any)}
                    className="w-full bg-[#070a0f] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none font-mono"
                  >
                    <option value="PREV_CLOSE">Previous Close</option>
                    <option value="DAY_OPEN">Day Open</option>
                    <option value="RECENT_HIGH">Recent High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Trade Rationale / Note</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Invalidate trade if price breaks 50-day moving average"
                  className="w-full bg-[#070a0f] border border-slate-700 rounded px-3 py-2 text-slate-200 focus:outline-none"
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
                  Activate Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
