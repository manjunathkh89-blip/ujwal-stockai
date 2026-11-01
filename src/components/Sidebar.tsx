import React from 'react';

export type ActiveTab =
  | 'overview'
  | 'brain'
  | 'explorer'
  | 'search'
  | 'scanner'
  | 'candle-ai'
  | 'stock-detail'
  | 'watchlist'
  | 'portfolio'
  | 'stress-lab'
  | 'paper-trade'
  | 'radar'
  | 'earnings'
  | 'briefing'
  | 'news-calendar'
  | 'assistant'
  | 'scandals'
  | 'fundamentals'
  | 'backtester'
  | 'providers'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  const navSections = [
    {
      title: 'MARKET INTELLIGENCE',
      items: [
        { id: 'overview', label: 'Home Dashboard', icon: '📊' },
        { id: 'brain', label: 'AI Market Brain', icon: '🧠' },
        { id: 'explorer', label: 'Global Markets', icon: '🌐' },
        { id: 'scanner', label: 'Stock Scanner', icon: '✦' },
        { id: 'candle-ai', label: 'Candle AI', icon: '🕯️' },
        { id: 'radar', label: 'Market Radar', icon: '🎯' },
      ],
    },
    {
      title: 'INVESTMENT & RISK',
      items: [
        { id: 'watchlist', label: 'Watchlist & Alerts', icon: '🔔' },
        { id: 'portfolio', label: 'Portfolio AI', icon: '💼' },
        { id: 'stress-lab', label: 'Market Stress Lab', icon: '🧪' },
        { id: 'paper-trade', label: 'Paper Trading', icon: '📈' },
        { id: 'stock-detail', label: 'Stock Analysis', icon: '🔍' },
        { id: 'scandals', label: 'Risk Center', icon: '🚨' },
      ],
    },
    {
      title: 'CALENDAR & RESEARCH',
      items: [
        { id: 'briefing', label: 'Daily AI Briefing', icon: '📋' },
        { id: 'earnings', label: 'Earnings AI', icon: '💰' },
        { id: 'news-calendar', label: 'Macro Calendar', icon: '📅' },
        { id: 'assistant', label: 'Market AI Chat', icon: '🤖' },
        { id: 'backtester', label: 'Quant Backtester', icon: '⚡' },
        { id: 'settings', label: 'Settings', icon: '⚙' },
      ],
    },
  ];

  return (
    <aside
      className={`bg-[#070a0f] border-r border-slate-800/80 transition-all duration-300 flex flex-col shrink-0 select-none z-20 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand header */}
      <div className="h-14 border-b border-slate-800/80 px-4 flex items-center justify-between">
        {!collapsed && (
          <button
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="h-6 w-6 rounded bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center font-bold text-black text-xs">
              ▲
            </div>
            <div>
              <span className="font-bold text-xs tracking-tight text-white block">APEX GLOBAL</span>
              <span className="text-[9px] font-mono text-emerald-400 block -mt-0.5">AI TERMINAL 2026</span>
            </div>
          </button>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 text-xs mx-auto"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 py-4 overflow-y-auto space-y-5 px-2">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 pb-1 text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                {sec.title}
              </div>
            )}

            {sec.items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as ActiveTab)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800/90 text-white font-semibold shadow-sm border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="text-sm shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar bottom stamp */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
          <div>Engine: <span className="text-emerald-400">Continuous 24/7</span></div>
          <div className="text-slate-400 mt-0.5">By Manjunath KH</div>
        </div>
      )}
    </aside>
  );
};
