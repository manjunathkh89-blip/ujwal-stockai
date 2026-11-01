import React from 'react';

interface SettingsViewProps {
  baseCurrency: string;
  onChangeCurrency: (currency: string) => void;
  preferredCountry: string;
  onChangePreferredCountry: (country: string) => void;
  timezone: string;
  onChangeTimezone: (tz: string) => void;
  onReplayIntro: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  baseCurrency,
  onChangeCurrency,
  preferredCountry,
  onChangePreferredCountry,
  timezone,
  onChangeTimezone,
  onReplayIntro,
}) => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg space-y-2">
        <h1 className="text-xl font-bold text-white tracking-tight">Platform Settings & Localization</h1>
        <p className="text-xs text-slate-400">
          Configure preferred base conversion currency, primary domestic market, local exchange clock, and quantitative parameters.
        </p>
      </div>

      {/* Main Settings Sections */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-6">
        {/* Currency & Localization */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider font-mono">
            01. Currency & Valuation Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/60 p-4 rounded border border-slate-800 space-y-2">
              <label className="block text-slate-300 font-semibold">Base Display Currency</label>
              <p className="text-[11px] text-slate-400">
                All foreign equity prices and portfolio totals will be calculated alongside this primary fiat denominator.
              </p>
              <select
                value={baseCurrency}
                onChange={(e) => onChangeCurrency(e.target.value)}
                className="w-full bg-[#070a0f] border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono focus:outline-none cursor-pointer"
              >
                <option value="USD">USD — United States Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
                <option value="GBP">GBP — British Pound (£)</option>
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="JPY">JPY — Japanese Yen (¥)</option>
                <option value="CAD">CAD — Canadian Dollar (CA$)</option>
                <option value="AUD">AUD — Australian Dollar (A$)</option>
                <option value="CHF">CHF — Swiss Franc (Fr)</option>
                <option value="BRL">BRL — Brazilian Real (R$)</option>
                <option value="HKD">HKD — Hong Kong Dollar (HK$)</option>
              </select>
            </div>

            <div className="bg-slate-900/60 p-4 rounded border border-slate-800 space-y-2">
              <label className="block text-slate-300 font-semibold">Primary Sovereign Market Hub</label>
              <p className="text-[11px] text-slate-400">
                Sets default landing priority and regional news prioritization.
              </p>
              <select
                value={preferredCountry}
                onChange={(e) => onChangePreferredCountry(e.target.value)}
                className="w-full bg-[#070a0f] border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono focus:outline-none cursor-pointer"
              >
                <option value="GLOBAL">Global Multi-Exchange (All Markets)</option>
                <option value="United States">United States (NYSE / NASDAQ)</option>
                <option value="India">India (NSE / BSE)</option>
                <option value="United Kingdom">United Kingdom (LSE)</option>
                <option value="Germany">Germany / Europe (XETRA / Euronext)</option>
                <option value="Japan">Japan (TSE)</option>
                <option value="Taiwan">Taiwan (TWSE)</option>
                <option value="Canada">Canada (TSX)</option>
                <option value="Australia">Australia (ASX)</option>
                <option value="Brazil">Brazil (B3)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Time Zone Preferences */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider font-mono">
            02. Session Clock & Time Zone
          </h2>

          <div className="bg-slate-900/60 p-4 rounded border border-slate-800 space-y-2 text-xs">
            <label className="block text-slate-300 font-semibold">Active Terminal Time Zone</label>
            <p className="text-[11px] text-slate-400">
              Synchronizes economic calendars and market bell countdown clocks.
            </p>
            <select
              value={timezone}
              onChange={(e) => onChangeTimezone(e.target.value)}
              className="w-full max-w-md bg-[#070a0f] border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono focus:outline-none cursor-pointer"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">America/New_York (EDT / EST - NYSE / NASDAQ)</option>
              <option value="Europe/London">Europe/London (BST / GMT - LSE)</option>
              <option value="Europe/Berlin">Europe/Berlin (CEST / CET - XETRA / Euronext)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST - NSE / BSE)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST - Tokyo Stock Exchange)</option>
              <option value="Asia/Hong_Kong">Asia/Hong_Kong (HKT - HKEX)</option>
              <option value="Australia/Sydney">Australia/Sydney (AEST - ASX)</option>
            </select>
          </div>
        </div>

        {/* Brand & Developer Attestation */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
            03. Platform Architecture & Attestation
          </h2>

          <div className="bg-slate-900/60 p-4 rounded border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <div className="font-bold text-white text-sm">
                Global AI Stock Market Intelligence Platform
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Engineered & Developed by <strong className="text-emerald-400">Manjunath KH</strong>
              </div>
            </div>

            <button
              onClick={onReplayIntro}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-xs font-mono"
            >
              Replay Opening Sequence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
