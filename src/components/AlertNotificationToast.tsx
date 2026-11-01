import React from 'react';
import { WatchlistAlert } from '../types/market';
import { formatCurrencyValue } from '../utils/currency';

export interface TriggeredAlertEvent {
  id: string;
  alert: WatchlistAlert;
  type: 'TARGET_HIT' | 'STOP_HIT';
  price: number;
  timestamp: string;
}

interface AlertNotificationToastProps {
  notifications: TriggeredAlertEvent[];
  onDismiss: (id: string) => void;
  onNavigateToWatchlist: () => void;
  onInspectStock: (stockId: string) => void;
  onViewWhy?: (item: TriggeredAlertEvent) => void;
}

export const AlertNotificationToast: React.FC<AlertNotificationToastProps> = ({
  notifications,
  onDismiss,
  onNavigateToWatchlist,
  onInspectStock,
  onViewWhy,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((item) => {
        const isTarget = item.type === 'TARGET_HIT';

        return (
          <div
            key={item.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all animate-slideIn ${
              isTarget
                ? 'bg-emerald-950/95 border-emerald-600 text-slate-100 shadow-emerald-950/50'
                : 'bg-rose-950/95 border-rose-600 text-slate-100 shadow-rose-950/50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{isTarget ? '🎯' : '🛑'}</span>
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider font-mono">
                    {isTarget ? 'Price Target Hit!' : 'Stop-Loss Triggered!'}
                  </div>
                  <div className="font-mono text-sm font-extrabold text-white">
                    {item.alert.symbol} ({item.alert.exchange})
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDismiss(item.id)}
                className="text-slate-400 hover:text-white text-sm font-mono p-1"
                title="Dismiss notification"
              >
                ✕
              </button>
            </div>

            <div className="mt-2 text-xs font-mono space-y-1 bg-black/30 p-2.5 rounded-lg border border-white/5">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Market Price:</span>
                <span className="font-bold text-white">
                  {formatCurrencyValue(item.price, item.alert.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">
                  {isTarget ? 'Target High Level:' : 'Stop Low Limit:'}
                </span>
                <span className={isTarget ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {formatCurrencyValue(
                    isTarget ? item.alert.targetPrice : item.alert.stopPrice,
                    item.alert.currency
                  )}
                </span>
              </div>
              {item.alert.note && (
                <div className="text-[11px] text-slate-300 italic pt-1 border-t border-white/10 font-sans">
                  "{item.alert.note}"
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">{item.timestamp}</span>
              <div className="flex items-center gap-2">
                {onViewWhy && (
                  <button
                    onClick={() => onViewWhy(item)}
                    className="px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-bold border border-amber-700/80 transition-colors"
                  >
                    WHY?
                  </button>
                )}
                <button
                  onClick={() => onInspectStock(item.alert.symbol.toLowerCase())}
                  className="px-2 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
                >
                  Analyze Chart
                </button>
                <button
                  onClick={onNavigateToWatchlist}
                  className="px-2 py-1 rounded bg-white text-slate-900 hover:bg-slate-200 font-bold transition-colors"
                >
                  Watchlist →
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
