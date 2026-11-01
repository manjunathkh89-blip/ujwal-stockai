import React, { useState, useEffect } from 'react';
import { OpeningIntro } from './components/OpeningIntro';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { MarketSessionBar } from './components/MarketSessionBar';
import { AlertWhyModal } from './components/AlertWhyModal';

// Views
import { OverviewView } from './views/OverviewView';
import { MarketBrainView } from './views/MarketBrainView';
import { StressLabView } from './views/StressLabView';
import { DailyBriefingView } from './views/DailyBriefingView';
import { ExplorerView } from './views/ExplorerView';
import { SearchView } from './views/SearchView';
import { ScannerView } from './views/ScannerView';
import { StockDetailView } from './views/StockDetailView';
import { CandleAiView } from './views/CandleAiView';
import { PaperTradingView } from './views/PaperTradingView';
import { MarketRadarView } from './views/MarketRadarView';
import { EarningsAiView } from './views/EarningsAiView';
import { ScandalMonitorView } from './views/ScandalMonitorView';
import { FundamentalView } from './views/FundamentalView';
import { PortfolioView } from './views/PortfolioView';
import { WatchlistView } from './views/WatchlistView';
import { NewsCalendarView } from './views/NewsCalendarView';
import { AiAssistantView } from './views/AiAssistantView';
import { BacktestingView } from './views/BacktestingView';
import { ProviderStatusView } from './views/ProviderStatusView';
import { SettingsView } from './views/SettingsView';
import { WhyFellModal } from './components/WhyFellModal';
import { EmergencyAlertModal } from './components/EmergencyAlertModal';

import {
  GLOBAL_SESSIONS,
  GLOBAL_INDICES,
  GLOBAL_CURRENCY_RATES,
  COMMODITIES_DATA,
  CRYPTO_DATA,
  GLOBAL_STOCKS,
  CORPORATE_SCANDALS,
  ECONOMIC_CALENDAR,
  PROVIDER_STATUSES,
  INITIAL_ALERTS,
} from './data/marketData';
import {
  StockItem,
  GlobalIndex,
  MarketSession,
  CorporateScandal,
  EconomicEvent,
  CurrencyRate,
  CommodityPrice,
  CryptoPrice,
  ProviderStatus,
  WatchlistAlert,
  AppExperienceMode,
} from './types/market';

import {
  globalPriceObserver,
  playAlertChime,
  dispatchBrowserNotification,
} from './utils/observer';
import {
  AlertNotificationToast,
  TriggeredAlertEvent,
} from './components/AlertNotificationToast';
import { formatCurrencyValue } from './utils/currency';

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    return sessionStorage.getItem('apex_intro_shown') !== 'true';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [experienceMode, setExperienceMode] = useState<AppExperienceMode>('pro');

  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [preferredCountry, setPreferredCountry] = useState<string>('GLOBAL');
  const [timezone, setTimezone] = useState<string>('America/New_York');
  const [selectedStockId, setSelectedStockId] = useState<string>('nvda');

  // Live state with reliable fallbacks
  const [stocks, setStocks] = useState<StockItem[]>(GLOBAL_STOCKS);
  const [sessions, setSessions] = useState<MarketSession[]>(GLOBAL_SESSIONS);
  const [indices, setIndices] = useState<GlobalIndex[]>(GLOBAL_INDICES);
  const [currencies, setCurrencies] = useState<CurrencyRate[]>(GLOBAL_CURRENCY_RATES);
  const [commodities, setCommodities] = useState<CommodityPrice[]>(COMMODITIES_DATA);
  const [crypto, setCrypto] = useState<CryptoPrice[]>(CRYPTO_DATA);
  const [scandals, setScandals] = useState<CorporateScandal[]>(CORPORATE_SCANDALS);
  const [events, setEvents] = useState<EconomicEvent[]>(ECONOMIC_CALENDAR);
  const [providers, setProviders] = useState<ProviderStatus[]>(PROVIDER_STATUSES);

  // Global Alerts State synchronized with localStorage
  const [alerts, setAlerts] = useState<WatchlistAlert[]>(() => {
    const saved = localStorage.getItem('apex_watchlist_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  // Active floating notifications triggered by the observer
  const [activeNotifications, setActiveNotifications] = useState<TriggeredAlertEvent[]>([]);

  // Why? Modal State
  const [whyModal, setWhyModal] = useState<{
    isOpen: boolean;
    symbol: string;
    category: string;
    headline: string;
  }>({
    isOpen: false,
    symbol: 'NVDA',
    category: 'PRICE DROP ALERT',
    headline: 'Stock dropped below primary support floor',
  });

  // Why Did It Move (8-Factor Diagnosis) Modal State
  const [isWhyFellOpen, setIsWhyFellOpen] = useState<boolean>(false);
  const [whyFellStockId, setWhyFellStockId] = useState<string>('nvda');

  // Emergency Market Crisis Alert Modal State
  const [isEmergencyAlertOpen, setIsEmergencyAlertOpen] = useState<boolean>(false);

  // Background observer stream toggle
  const [isObserverStreamActive] = useState<boolean>(true);

  // Quick Command Palette Modal state
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('apex_watchlist_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const handleAddAlert = (newAlert: WatchlistAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  // 1. Observer Pattern: compares incoming prices against active price alerts
  useEffect(() => {
    const unsubscribe = globalPriceObserver.subscribe((updatedStocks) => {
      setAlerts((currentAlerts) => {
        let hasChanges = false;
        const newAlerts = currentAlerts.map((alert) => {
          if (alert.status !== 'ACTIVE') return alert;

          const stock = updatedStocks.find(
            (s) => s.symbol.toUpperCase() === alert.symbol.toUpperCase()
          );
          if (!stock) return alert;

          // Check if Target High reached
          if (stock.price >= alert.targetPrice) {
            hasChanges = true;
            const event: TriggeredAlertEvent = {
              id: `evt-${Date.now()}-${alert.id}`,
              alert: { ...alert, status: 'TRIGGERED_TARGET' },
              type: 'TARGET_HIT',
              price: stock.price,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            };

            setActiveNotifications((prev) => [event, ...prev.slice(0, 3)]);
            playAlertChime(false);
            dispatchBrowserNotification(
              `🎯 Target Hit: ${alert.symbol} reached ${formatCurrencyValue(stock.price, alert.currency)}!`,
              `Price reached target high of ${formatCurrencyValue(alert.targetPrice, alert.currency)} on ${alert.exchange}.`
            );

            return { ...alert, status: 'TRIGGERED_TARGET' as const, currentPrice: stock.price };
          }

          // Check if Stop Low breached
          if (stock.price <= alert.stopPrice) {
            hasChanges = true;
            const event: TriggeredAlertEvent = {
              id: `evt-${Date.now()}-${alert.id}`,
              alert: { ...alert, status: 'TRIGGERED_STOP' },
              type: 'STOP_HIT',
              price: stock.price,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            };

            setActiveNotifications((prev) => [event, ...prev.slice(0, 3)]);
            playAlertChime(true);
            dispatchBrowserNotification(
              `🛑 Stop Loss Triggered: ${alert.symbol} dropped to ${formatCurrencyValue(stock.price, alert.currency)}!`,
              `Price breached defensive stop limit of ${formatCurrencyValue(alert.stopPrice, alert.currency)} on ${alert.exchange}.`
            );

            return { ...alert, status: 'TRIGGERED_STOP' as const, currentPrice: stock.price };
          }

          return { ...alert, currentPrice: stock.price };
        });

        return hasChanges ? newAlerts : currentAlerts;
      });
    });

    return () => unsubscribe();
  }, []);

  // 2. Background Live Price Tick Stream
  useEffect(() => {
    if (!isObserverStreamActive) return;

    const interval = setInterval(() => {
      setStocks((prevStocks) => {
        const updated = prevStocks.map((stock) => {
          if (Math.random() > 0.45) return stock;

          const deltaPercent = (Math.random() - 0.49) * 0.003;
          const newPrice = Number(Math.max(1, stock.price * (1 + deltaPercent)).toFixed(2));
          const change = Number((newPrice - (stock.price - stock.change)).toFixed(2));
          const changePercent = Number((((newPrice - (stock.price - stock.change)) / (stock.price - stock.change)) * 100).toFixed(2));

          return {
            ...stock,
            price: newPrice,
            change,
            changePercent,
            dayHigh: Math.max(stock.dayHigh, newPrice),
            dayLow: Math.min(stock.dayLow, newPrice),
          };
        });

        globalPriceObserver.notify(updated);
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isObserverStreamActive]);

  // Global Keyboard shortcuts: CMD+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isCommandOpen) {
        setIsCommandOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen]);

  // Stock selection callback
  const handleSelectStock = (stockId: string) => {
    setSelectedStockId(stockId);
    setActiveTab('stock-detail');
    setIsCommandOpen(false);
  };

  // Filtered command palette stocks
  const commandResults = stocks
    .filter(
      (s) =>
        s.symbol.toLowerCase().includes(commandQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(commandQuery.toLowerCase()) ||
        s.qualifiedSymbol.toLowerCase().includes(commandQuery.toLowerCase())
    )
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden">
      {/* 5-Second Ultra-Premium Cinematic App Launch Intro */}
      {showIntro && (
        <OpeningIntro
          onComplete={() => {
            setShowIntro(false);
            sessionStorage.setItem('apex_intro_shown', 'true');
          }}
        />
      )}

      {/* Floating Price Alert Notification Toasts */}
      <AlertNotificationToast
        notifications={activeNotifications}
        onDismiss={(id: string) => setActiveNotifications((prev) => prev.filter((e) => e.id !== id))}
        onNavigateToWatchlist={() => setActiveTab('watchlist')}
        onInspectStock={(stockId: string) => handleSelectStock(stockId)}
        onViewWhy={(event: TriggeredAlertEvent) => {
          setWhyModal({
            isOpen: true,
            symbol: event.alert.symbol,
            category: event.type === 'TARGET_HIT' ? 'PROFIT TARGET HIT' : 'STOP LOSS BREACH',
            headline: `${event.alert.symbol} triggered at ${formatCurrencyValue(event.price, event.alert.currency)}`,
          });
        }}
      />

      {/* "WHY?" Explanation Modal */}
      <AlertWhyModal
        isOpen={whyModal.isOpen}
        onClose={() => setWhyModal((prev) => ({ ...prev, isOpen: false }))}
        symbol={whyModal.symbol}
        category={whyModal.category}
        headline={whyModal.headline}
      />

      {/* Shell with Left Sidebar & Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Institutional Navigation) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Right Main Container */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar */}
          <Navbar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            baseCurrency={baseCurrency}
            onChangeCurrency={setBaseCurrency}
            onOpenSearch={() => setIsCommandOpen(true)}
            experienceMode={experienceMode}
            onChangeExperienceMode={setExperienceMode}
            alertCount={alerts.filter((a) => a.status === 'ACTIVE').length}
            onOpenWhyFell={() => {
              setWhyFellStockId(selectedStockId);
              setIsWhyFellOpen(true);
            }}
            onOpenEmergencyAlert={() => setIsEmergencyAlertOpen(true)}
          />

          {/* Real-time Exchange Sessions Status Bar */}
          <MarketSessionBar sessions={sessions} />

          {/* Main Content Area */}
          <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto space-y-6">
            {/* Simple / Beginner Mode Notice Banner */}
            {experienceMode === 'simple' && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center justify-between text-xs text-emerald-300 font-sans">
                <div className="flex items-center gap-2">
                  <span className="font-bold">🟢 Beginner Mode Active:</span>
                  <span>Financial terms are automatically simplified into plain conversational English.</span>
                </div>
                <button
                  onClick={() => setExperienceMode('pro')}
                  className="font-mono underline text-white hover:text-emerald-200"
                >
                  Switch to Pro Mode →
                </button>
              </div>
            )}

            {/* Ultimate AI Mode Notice Banner */}
            {experienceMode === 'ultimate' && (
              <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-lg flex items-center justify-between text-xs text-cyan-300 font-sans">
                <div className="flex items-center gap-2">
                  <span className="font-bold">✦ Ultimate AI Mode:</span>
                  <span>Synthesizing multi-exchange technicals, order flow, balance sheets, and macroeconomic catalysts into one unified decision.</span>
                </div>
                <button
                  onClick={() => setExperienceMode('pro')}
                  className="font-mono underline text-white hover:text-cyan-200"
                >
                  Pro View →
                </button>
              </div>
            )}

            {/* View Switching */}
            {activeTab === 'overview' && (
              <OverviewView
                indices={indices}
                stocks={stocks}
                currencies={currencies}
                commodities={commodities}
                crypto={crypto}
                baseCurrency={baseCurrency}
                onSelectStock={handleSelectStock}
                onNavigateTab={setActiveTab}
                onOpenWhyFell={() => {
                  setWhyFellStockId(selectedStockId);
                  setIsWhyFellOpen(true);
                }}
                onOpenEmergencyAlert={() => setIsEmergencyAlertOpen(true)}
              />
            )}

            {activeTab === 'brain' && (
              <MarketBrainView
                stocks={stocks}
                onSelectStock={handleSelectStock}
                onOpenWhyFell={(id) => {
                  setWhyFellStockId(id || selectedStockId);
                  setIsWhyFellOpen(true);
                }}
                onOpenEmergencyAlert={() => setIsEmergencyAlertOpen(true)}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'explorer' && (
              <ExplorerView
                stocks={stocks}
                sessions={sessions}
                onSelectStock={handleSelectStock}
              />
            )}

            {activeTab === 'search' && (
              <SearchView
                stocks={stocks}
                baseCurrency={baseCurrency}
                onSelectStock={handleSelectStock}
              />
            )}

            {activeTab === 'scanner' && (
              <ScannerView
                stocks={stocks}
                onSelectStock={handleSelectStock}
              />
            )}

            {activeTab === 'candle-ai' && (
              <CandleAiView
                stocks={stocks}
                selectedStockId={selectedStockId}
                onSelectStock={handleSelectStock}
              />
            )}

            {activeTab === 'radar' && (
              <MarketRadarView
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'earnings' && (
              <EarningsAiView
                onSelectStock={handleSelectStock}
              />
            )}

            {activeTab === 'paper-trade' && (
              <PaperTradingView
                stocks={stocks}
                baseCurrency={baseCurrency}
                onSelectStock={handleSelectStock}
              />
            )}

            {activeTab === 'stock-detail' && (
              <StockDetailView
                selectedStockId={selectedStockId}
                stocks={stocks}
                baseCurrency={baseCurrency}
                alerts={alerts}
                onAddAlert={handleAddAlert}
                onDeleteAlert={handleDeleteAlert}
                onSelectStock={handleSelectStock}
                onNavigateTab={setActiveTab}
                onOpenWhyFell={(id) => {
                  setWhyFellStockId(id || selectedStockId);
                  setIsWhyFellOpen(true);
                }}
              />
            )}

            {activeTab === 'stress-lab' && (
              <StressLabView
                stocks={stocks}
                onSelectStock={handleSelectStock}
              />
            )}

            {activeTab === 'briefing' && (
              <DailyBriefingView
                stocks={stocks}
                onSelectStock={handleSelectStock}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'scandals' && (
              <ScandalMonitorView
                scandals={scandals}
                onSelectStockBySymbol={(sym) => {
                  const found = stocks.find((s) => s.symbol.toUpperCase() === sym.toUpperCase());
                  if (found) handleSelectStock(found.id);
                }}
              />
            )}

            {activeTab === 'fundamentals' && (
              <FundamentalView
                stocks={stocks}
                baseCurrency={baseCurrency}
                onSelectStock={handleSelectStock}
              />
            )}

            {activeTab === 'portfolio' && (
              <PortfolioView
                stocks={stocks}
                baseCurrency={baseCurrency}
                onSelectStock={handleSelectStock}
              />
            )}

            {activeTab === 'watchlist' && (
              <WatchlistView
                stocks={stocks}
                alerts={alerts}
                onAddAlert={handleAddAlert}
                onDeleteAlert={handleDeleteAlert}
                onSelectStock={handleSelectStock}
              />
            )}

            {activeTab === 'news-calendar' && (
              <NewsCalendarView events={events} />
            )}

            {activeTab === 'assistant' && (
              <AiAssistantView />
            )}

            {activeTab === 'backtester' && (
              <BacktestingView stocks={stocks} />
            )}

            {activeTab === 'providers' && (
              <ProviderStatusView providers={providers} />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                baseCurrency={baseCurrency}
                onChangeCurrency={setBaseCurrency}
                preferredCountry={preferredCountry}
                onChangePreferredCountry={setPreferredCountry}
                timezone={timezone}
                onChangeTimezone={setTimezone}
                onReplayIntro={() => setShowIntro(true)}
              />
            )}
          </main>

          {/* Terminal Footer */}
          <footer className="bg-[#070a0f] border-t border-slate-800/80 px-6 py-4 mt-auto text-xs text-slate-400">
            <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-200">APEX GLOBAL TERMINAL</span>
                <span className="text-slate-500">·</span>
                <span>Developed by <strong className="text-emerald-400 font-medium">Manjunath KH</strong></span>
                <span className="text-slate-500">·</span>
                <span>Multi-Exchange 24/7 Monitoring Engine</span>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                <span>NYSE · NASDAQ · NSE · BSE · LSE · XETRA · TSE · HKEX · TWSE · ASX · B3</span>
                <span className="text-slate-500">·</span>
                <button
                  onClick={() => setActiveTab('providers')}
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  Feed Provenance
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Quick Command Palette Modal */}
      {isCommandOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
          onClick={() => setIsCommandOpen(false)}
        >
          <div
            className="bg-[#0e1420] border border-slate-700 rounded-lg max-w-xl w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-slate-800 flex items-center gap-3">
              <span className="text-slate-400 font-mono text-sm">🔍</span>
              <input
                type="text"
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Jump to any global ticker (e.g. NVDA, RELIANCE, TSMC, ASML, AAPL)..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none font-mono"
                autoFocus
              />
              <span className="text-[11px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                ESC
              </span>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/80">
              {commandResults.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectStock(s.id)}
                  className="p-3 hover:bg-slate-800/80 transition-colors cursor-pointer flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="font-bold text-white font-mono">{s.qualifiedSymbol}</div>
                    <div className="text-[11px] text-slate-400">{s.name} · {s.country}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-white font-semibold">{s.currency} {s.price}</div>
                    <div className={s.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}

              {commandResults.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-xs font-mono">
                  No matching instruments found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Why Did My Stock Move? (8-Factor Diagnosis Modal) */}
      <WhyFellModal
        isOpen={isWhyFellOpen}
        onClose={() => setIsWhyFellOpen(false)}
        stocks={stocks}
        defaultStockId={whyFellStockId}
        onSelectStock={handleSelectStock}
      />

      {/* High-Priority Emergency Market Crisis Alert Modal */}
      <EmergencyAlertModal
        isOpen={isEmergencyAlertOpen}
        onClose={() => setIsEmergencyAlertOpen(false)}
      />
    </div>
  );
}
