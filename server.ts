import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
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
  generateCandleHistory,
} from './src/data/marketData.ts';
import {
  BacktestResult,
  AiBuyHoldSellReport,
  WatchlistAlert,
  NotificationDeliveryLog,
  NotificationChannelConfig,
  BuyScanRankedCandidate,
  ExitAdvisorResult,
  ProfitLossCalculation,
  AlertCategory,
} from './src/types/market.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// 1. Overview API
app.get('/api/market/overview', (_req: Request, res: Response) => {
  res.json({
    sessions: GLOBAL_SESSIONS,
    indices: GLOBAL_INDICES,
    currencies: GLOBAL_CURRENCY_RATES,
    commodities: COMMODITIES_DATA,
    crypto: CRYPTO_DATA,
    timestamp: new Date().toISOString(),
  });
});

// 2. Stocks API with search and filters
app.get('/api/market/stocks', (req: Request, res: Response) => {
  const { query, country, exchange, sector, classification } = req.query;
  let results = [...GLOBAL_STOCKS];

  if (typeof query === 'string' && query.trim()) {
    const q = query.toLowerCase().trim();
    results = results.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.qualifiedSymbol.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q)
    );
  }

  if (typeof country === 'string' && country !== 'ALL') {
    results = results.filter((s) => s.countryCode === country || s.country === country);
  }

  if (typeof exchange === 'string' && exchange !== 'ALL') {
    results = results.filter((s) => s.exchange.toLowerCase().includes(exchange.toLowerCase()));
  }

  if (typeof sector === 'string' && sector !== 'ALL') {
    results = results.filter((s) => s.sector.toLowerCase() === sector.toLowerCase());
  }

  if (typeof classification === 'string' && classification !== 'ALL') {
    results = results.filter((s) => s.breakoutSignal?.classification === classification);
  }

  res.json({
    count: results.length,
    stocks: results,
  });
});

// 3. Single Stock Details + Candles
app.get('/api/market/stocks/:id', (req: Request, res: Response) => {
  const id = req.params.id.toLowerCase();
  const stock = GLOBAL_STOCKS.find(
    (s) => s.id.toLowerCase() === id || s.symbol.toLowerCase() === id || s.qualifiedSymbol.toLowerCase() === id
  );

  if (!stock) {
    res.status(404).json({ error: 'Stock not found across connected global feeds' });
    return;
  }

  const candles = generateCandleHistory(stock.price, 90, 0.016);
  res.json({
    stock,
    candles,
    lastRefreshed: new Date().toISOString(),
  });
});

// 4. Scanner Endpoint
app.get('/api/market/scanner', (req: Request, res: Response) => {
  const { minRvol, pattern, horizon } = req.query;
  let signals = GLOBAL_STOCKS.filter((s) => s.breakoutSignal).map((s) => s.breakoutSignal!);

  if (minRvol) {
    const min = parseFloat(minRvol as string);
    if (!isNaN(min)) {
      signals = signals.filter((sig) => sig.rvol >= min);
    }
  }

  if (pattern && pattern !== 'ALL') {
    signals = signals.filter((sig) => sig.pattern.toLowerCase().includes((pattern as string).toLowerCase()));
  }

  if (horizon && horizon !== 'ALL') {
    signals = signals.filter((sig) => sig.horizon.toLowerCase().includes((horizon as string).toLowerCase()));
  }

  res.json({
    count: signals.length,
    signals,
  });
});

// 5. Corporate Scandals & Risk Monitor
app.get('/api/market/scandals', (req: Request, res: Response) => {
  const { severity, category } = req.query;
  let list = [...CORPORATE_SCANDALS];

  if (severity && severity !== 'ALL') {
    list = list.filter((s) => s.severity === severity);
  }

  if (category && category !== 'ALL') {
    list = list.filter((s) => s.category === category);
  }

  res.json({
    count: list.length,
    scandals: list,
  });
});

// 6. Economic Calendar
app.get('/api/market/calendar', (_req: Request, res: Response) => {
  res.json({
    events: ECONOMIC_CALENDAR,
  });
});

// 7. Provider Status
app.get('/api/market/providers', (_req: Request, res: Response) => {
  res.json({
    providers: PROVIDER_STATUSES,
  });
});

// 8. Backtest Quantitative Engine
app.post('/api/market/backtest', (req: Request, res: Response) => {
  const { strategy, symbol, timeframe, stopLossPercent, targetProfitPercent } = req.body;

  const stock = GLOBAL_STOCKS.find((s) => s.symbol === symbol || s.id === symbol) || GLOBAL_STOCKS[0];
  const sl = Number(stopLossPercent) || 5;
  const tp = Number(targetProfitPercent) || 12;

  // Simulate historical trades based on deterministic math from prices
  const totalTrades = 24;
  let wins = 0;
  const tradeLog = [];
  let equity = 10000;

  for (let i = 1; i <= totalTrades; i++) {
    const isWin = (i * 7 + stock.price) % 10 > 3.8; // ~62% base win rate
    if (isWin) wins++;

    const returnPct = isWin ? tp * (0.85 + ((i * 3) % 4) * 0.1) : -sl * (0.9 + ((i * 2) % 3) * 0.1);
    equity = equity * (1 + returnPct / 100);

    tradeLog.push({
      tradeId: i,
      symbol: stock.symbol,
      entryDate: `2024-${String(Math.floor((i - 1) / 2) + 1).padStart(2, '0')}-05`,
      exitDate: `2024-${String(Math.floor((i - 1) / 2) + 1).padStart(2, '0')}-18`,
      entryPrice: Number((stock.price * (0.8 + (i / totalTrades) * 0.2)).toFixed(2)),
      exitPrice: Number((stock.price * (0.8 + (i / totalTrades) * 0.2) * (1 + returnPct / 100)).toFixed(2)),
      returnPercent: Number(returnPct.toFixed(2)),
      exitReason: (isWin ? (returnPct > tp ? 'Target 2' : 'Target 1') : 'Stop Loss') as any,
    });
  }

  const winRate = Number(((wins / totalTrades) * 100).toFixed(1));
  const profitFactor = Number(((wins * tp) / ((totalTrades - wins) * sl)).toFixed(2));
  const totalReturn = Number((((equity - 10000) / 10000) * 100).toFixed(2));
  const maxDrawdown = Number((sl * 1.85).toFixed(1));
  const sharpeRatio = Number((profitFactor * 0.95).toFixed(2));

  const result: BacktestResult = {
    strategyName: strategy || '52-Week High Breakout + Volume Surge',
    benchmark: 'S&P 500 / MSCI World',
    timeframe: timeframe || '1 Year (Daily)',
    totalTrades,
    winRatePercent: winRate,
    profitFactor,
    totalReturnPercent: totalReturn,
    benchmarkReturnPercent: 18.4,
    maxDrawdownPercent: maxDrawdown,
    sharpeRatio,
    avgHoldingDays: 14,
    tradeLog,
  };

  res.json(result);
});

// 9. AI Buy / Hold / Sell Report Endpoint
app.post('/api/ai/analysis', async (req: Request, res: Response) => {
  const { symbol } = req.body;
  const stock = GLOBAL_STOCKS.find((s) => s.symbol === symbol || s.id === symbol) || GLOBAL_STOCKS[0];

  const fallbackReport: AiBuyHoldSellReport = {
    symbol: stock.symbol,
    companyName: stock.name,
    rating: stock.changePercent > 0 ? 'ACCUMULATE' : 'HOLD',
    confidenceScore: 78,
    latestVerifiedPrice: stock.price,
    currency: stock.currency,
    potentialEntryZone: {
      min: Number((stock.price * 0.975).toFixed(2)),
      max: Number((stock.price * 1.01).toFixed(2)),
    },
    stopLossInvalidation: Number((stock.price * 0.935).toFixed(2)),
    targetZones: {
      target1: Number((stock.price * 1.085).toFixed(2)),
      target2: Number((stock.price * 1.17).toFixed(2)),
      extendedTarget: Number((stock.price * 1.25).toFixed(2)),
    },
    riskToRewardRatio: '1:2.6',
    expectedHorizon: '2 to 6 Weeks (Swing Position)',
    technicalPosture: `Trading at ${stock.currency} ${stock.price} relative to 50-day SMA of ${stock.technicals.sma50}. RSI(14) stands at ${stock.technicals.rsi14} with MACD histogram at ${stock.technicals.macd.histogram}. Support firmly identified near ${stock.currency} ${stock.technicals.supportLevel}.`,
    fundamentalPosture: `P/E multiple of ${stock.fundamentals.peRatio}x on ${stock.fundamentals.revenueGrowthYOY}% YoY top-line growth. Operating margin of ${stock.fundamentals.operatingMargin}% and clean ${stock.fundamentals.accountingStandard} financial statements verified by ${stock.fundamentals.auditor}.`,
    bullishScenario: `A confirmed close above ${stock.technicals.resistanceLevel} with relative volume exceeding 1.5x validates continuation toward target zone 1 (${stock.currency} ${(stock.price * 1.085).toFixed(2)}).`,
    bearishScenario: `A daily break and close below ${stock.technicals.supportLevel} invalidates momentum, shifting structure toward defensive accumulation at lower bounds.`,
    eventRisks: [
      'Next quarterly earnings disclosure and guidance revisions',
      'Central bank policy trajectory affecting high-duration multiples',
      'Sector-specific regulatory updates and competitive margin pressures',
    ],
    supportResistanceSummary: `Key primary floor at ${stock.currency} ${stock.technicals.supportLevel}; ceiling resistance capped at ${stock.currency} ${stock.technicals.resistanceLevel}.`,
    peerValuationNotes: `Compared with global sector averages, trading at a slight premium reflecting superior ROE (${stock.fundamentals.roe}%) and robust free cash flow generation.`,
    currencyGeopoliticalRisk: `Traded in ${stock.currency} on ${stock.exchange}. Foreign currency investors should account for FX volatility against home base currency.`,
    actionableConditions: {
      buyConditions: [
        `Price consolidates within entry zone ${stock.currency} ${(stock.price * 0.975).toFixed(2)} - ${(stock.price * 1.01).toFixed(2)} with contracting volume`,
        'RSI remains above 50 on daily time frame',
      ],
      waitConditions: [
        'If price gaps aggressively above target 1 without structural retest',
        'Ahead of major binary central bank rate decisions',
      ],
      sellConditions: [
        `Daily close breaking below strict stop-loss invalidation of ${stock.currency} ${(stock.price * 0.935).toFixed(2)}`,
        'Auditor qualifications or material regulatory inquiries emerge',
      ],
    },
    generatedAt: new Date().toISOString(),
    disclaimer: 'Probabilistic analytical model output for informational and research purposes only. Not financial advice or a guarantee of future performance.',
  };

  if (!aiClient) {
    res.json(fallbackReport);
    return;
  }

  try {
    const prompt = `You are a senior quantitative equity strategist and risk officer. Provide a rigorous, explainable, probabilistic Buy/Hold/Sell analysis report in strict JSON format for:
Company: ${stock.name} (${stock.qualifiedSymbol})
Country: ${stock.country}, Exchange: ${stock.exchange}, Currency: ${stock.currency}
Latest Price: ${stock.price}
Technicals: RSI(14)=${stock.technicals.rsi14}, MACD Hist=${stock.technicals.macd.histogram}, SMA20=${stock.technicals.sma20}, SMA50=${stock.technicals.sma50}, Support=${stock.technicals.supportLevel}, Resistance=${stock.technicals.resistanceLevel}, RVOL=${stock.technicals.rvol}
Fundamentals: PE=${stock.fundamentals.peRatio}, RevGrowth=${stock.fundamentals.revenueGrowthYOY}%, ROE=${stock.fundamentals.roe}%, Debt/Equity=${stock.fundamentals.debtToEquity}, Accounting=${stock.fundamentals.accountingStandard}, Auditor=${stock.fundamentals.auditor}

Respond with ONLY valid JSON containing:
{
  "rating": "BUY_ZONE" | "ACCUMULATE" | "HOLD" | "REDUCE_EXPOSURE" | "SELL_ZONE" | "NEUTRAL_WAIT",
  "confidenceScore": number (50-95),
  "potentialEntryZone": {"min": number, "max": number},
  "stopLossInvalidation": number,
  "targetZones": {"target1": number, "target2": number, "extendedTarget": number},
  "riskToRewardRatio": string (e.g. "1:2.8"),
  "expectedHorizon": string,
  "technicalPosture": string,
  "fundamentalPosture": string,
  "bullishScenario": string,
  "bearishScenario": string,
  "eventRisks": string[],
  "supportResistanceSummary": string,
  "peerValuationNotes": string,
  "currencyGeopoliticalRisk": string,
  "actionableConditions": {
    "buyConditions": string[],
    "waitConditions": string[],
    "sellConditions": string[]
  }
}`;

    const aiResponse = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(aiResponse.text || '{}');
    res.json({
      ...fallbackReport,
      ...parsed,
      symbol: stock.symbol,
      companyName: stock.name,
      latestVerifiedPrice: stock.price,
      currency: stock.currency,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Gemini AI analysis error, using fallback:', error);
    res.json(fallbackReport);
  }
});

// 10. AI Research Assistant Chat Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { query, history } = req.body;

  if (!query) {
    res.status(400).json({ error: 'Query is required' });
    return;
  }

  if (!aiClient) {
    res.json({
      reply: `[Research Engine Note: Local Analytical Mode]\n\nRegarding "${query}":\n\n1. Global Context: International equities are currently pricing in divergence between US Federal Reserve monetary easing expectations, European industrial headwinds, and Asian semiconductor infrastructure capex.\n\n2. Technical & Fundamental Synthesis: For actionable positioning, focus on high-RVOL breakouts with clean balance sheets (low debt-to-equity and audited unreserved financials). Always enforce risk-to-reward ratios greater than 1:2.0 and strict stop-loss invalidation levels.\n\n(To enable live server-side Gemini intelligence, verify the GEMINI_API_KEY environment secret.)`,
    });
    return;
  }

  try {
    const systemInstruction = `You are the lead Quantitative Research Analyst and Chief Investment Strategist of the Global AI Stock Market Intelligence Platform.
You provide objective, data-grounded, explainable intelligence covering global equities (US, India, UK, Europe, Japan, China, Taiwan, Brazil, Australia, etc.), macroeconomic policy, technical breakouts, corporate fraud risks, and multi-currency exposures.
Always state prices, ranges, risks, and invalidation rules clearly.
Always remind users that financial markets carry uncertainty, and analysis is probabilistic decision support rather than guaranteed returns.`;

    const chatResponse = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Question: ${query}` }],
        },
      ],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    res.json({
      reply: chatResponse.text || 'No response generated.',
    });
  } catch (err: any) {
    console.error('AI chat endpoint error:', err);
    res.status(500).json({
      error: 'Failed to generate AI response. Using local analytical fallback.',
      reply: `Analytical Engine Fallback for "${query}": Current market posture requires strict disciplined sizing, monitoring earnings calendar releases, and respecting key support/resistance boundaries.`,
    });
  }
});

// ==========================================
// CONTINUOUS BACKGROUND MONITORING ENGINE
// ==========================================

let serverAlerts: WatchlistAlert[] = INITIAL_ALERTS.map((a, idx) => ({
  ...a,
  category: (idx === 0 ? 'BREAKOUT WATCH' : idx === 1 ? 'BUY OPPORTUNITY WATCH' : 'HOLD / MONITOR') as AlertCategory,
  dropPercentThreshold: 2.0,
  referenceType: 'PREV_CLOSE' as const,
  trailingStopActive: false,
  trailingStopPercent: 5.0,
  highestPriceReached: a.currentPrice,
  cooldownMinutes: 15,
  lastTriggeredAt: 0,
  suggestedAction: 'WAIT FOR STABILIZATION' as const,
  smartReason: 'Initialized baseline price guard',
}));

let serverNotificationLogs: NotificationDeliveryLog[] = [
  {
    id: 'log-seed-1',
    alertId: 'alt-1',
    symbol: 'AAPL',
    category: 'BREAKOUT WATCH',
    channel: 'IN_APP',
    status: 'DELIVERED',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    headline: 'AAPL: Breakout Watch Triggered near All-Time High Resistance',
    detail: 'Price trading at USD 232.80, within 3.1% of target resistance $240.00 on NASDAQ. RVOL is 1.25x with RSI at 64.',
  },
  {
    id: 'log-seed-2',
    alertId: 'alt-2',
    symbol: 'NVDA',
    category: 'BUY OPPORTUNITY WATCH',
    channel: 'BROWSER_PUSH',
    status: 'DELIVERED',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    headline: 'NVDA: Healthy Pullback to Verified Support Floor ($128.50)',
    detail: 'Price tested $128.50 support on Nasdaq. Volume contraction detected; RSI stabilized at 52.',
  },
  {
    id: 'log-seed-3',
    alertId: 'alt-3',
    symbol: 'TSLA',
    category: 'RED ALERT',
    channel: 'EMAIL_ALERT',
    status: 'DELIVERED',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    headline: 'TSLA: Rapid Price Drop Breached Defensive Support Limit',
    detail: 'Stock dropped 3.4% from day opening price. Volatility index expanded by 18%; position review suggested.',
  },
];

let notificationConfig: NotificationChannelConfig = {
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
};

// Check if current hour falls within configured quiet hours
function isInQuietHours(config: NotificationChannelConfig): boolean {
  if (!config.quietHoursEnabled) return false;
  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = config.quietHoursStart.split(':').map(Number);
    const [endH, endM] = config.quietHoursEnd.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (startTotal <= endTotal) {
      return currentMinutes >= startTotal && currentMinutes <= endTotal;
    } else {
      // Overnight interval (e.g. 22:00 to 07:00)
      return currentMinutes >= startTotal || currentMinutes <= endTotal;
    }
  } catch {
    return false;
  }
}

// Background monitoring worker: runs every 5 seconds independently of user browser tabs
setInterval(() => {
  // 1. Simulate micro-fluctuations on 1-2 random instruments
  for (let i = 0; i < GLOBAL_STOCKS.length; i++) {
    if (Math.random() < 0.15) {
      const s = GLOBAL_STOCKS[i];
      const deltaPercent = (Math.random() - 0.49) * 0.0025;
      const newPrice = Number(Math.max(1, s.price * (1 + deltaPercent)).toFixed(2));
      s.change = Number((newPrice - (s.price - s.change)).toFixed(2));
      s.changePercent = Number((((newPrice - (s.price - s.change)) / (s.price - s.change)) * 100).toFixed(2));
      s.price = newPrice;
      s.dayHigh = Math.max(s.dayHigh, newPrice);
      s.dayLow = Math.min(s.dayLow, newPrice);
      s.lastUpdated = new Date().toISOString();
    }
  }

  // 2. Evaluate all active server-managed alerts
  const nowMs = Date.now();
  const quiet = isInQuietHours(notificationConfig);

  serverAlerts.forEach((alert) => {
    if (alert.status !== 'ACTIVE') return;

    const stock = GLOBAL_STOCKS.find((s) => s.symbol.toUpperCase() === alert.symbol.toUpperCase());
    if (!stock) return;

    alert.currentPrice = stock.price;

    // Track highest price reached for trailing stops
    if (alert.trailingStopActive) {
      alert.highestPriceReached = Math.max(alert.highestPriceReached || stock.price, stock.price);
    }

    let isTriggered = false;
    let category: AlertCategory = alert.category || 'HOLD / MONITOR';
    let headline = '';
    let detail = '';
    let action: any = 'DO NOT PANIC SELL';

    // A. Check Trailing Stop
    if (alert.trailingStopActive && alert.trailingStopPercent && alert.highestPriceReached) {
      const dynamicStop = alert.highestPriceReached * (1 - alert.trailingStopPercent / 100);
      if (stock.price <= dynamicStop) {
        isTriggered = true;
        category = 'SELL / REDUCE EXPOSURE REVIEW';
        headline = `🚨 Trailing Stop Triggered: ${stock.symbol} dropped ${alert.trailingStopPercent}% from peak (${stock.currency} ${alert.highestPriceReached.toFixed(2)})`;
        detail = `Current price ${stock.currency} ${stock.price} breached dynamic trailing floor of ${stock.currency} ${dynamicStop.toFixed(2)}. Profit protection activated.`;
        action = 'CONSIDER EXIT';
      }
    }

    // B. Check Percentage Drop Threshold
    if (!isTriggered && alert.dropPercentThreshold) {
      let refPrice = stock.price - stock.change; // Default: Previous Close
      if (alert.referenceType === 'DAY_OPEN') {
        refPrice = Number((stock.dayLow + (stock.dayHigh - stock.dayLow) * 0.45).toFixed(2));
      } else if (alert.referenceType === 'RECENT_HIGH') {
        refPrice = stock.dayHigh;
      } else if (alert.referenceType === 'CUSTOM_PRICE' && alert.referencePrice) {
        refPrice = alert.referencePrice;
      }

      const dropPct = ((refPrice - stock.price) / refPrice) * 100;
      if (dropPct >= alert.dropPercentThreshold) {
        isTriggered = true;
        category = dropPct >= 3.0 ? 'RED ALERT' : 'BUY OPPORTUNITY WATCH';
        headline = `${category === 'RED ALERT' ? '⚠️ RED ALERT' : '⚡ BUY OPPORTUNITY WATCH'}: ${stock.symbol} down ${dropPct.toFixed(2)}% from ${alert.referenceType || 'baseline'}`;
        detail = `Price fell from ${stock.currency} ${refPrice.toFixed(2)} to ${stock.currency} ${stock.price}. Daily support: ${stock.currency} ${stock.technicals.supportLevel}.`;
        action = dropPct >= 4.0 ? 'REVIEW POSITION SIZE' : 'WAIT FOR STABILIZATION';
      }
    }

    // C. Check Support Level Breakdown
    if (!isTriggered && alert.supportBreakLevel && stock.price < alert.supportBreakLevel) {
      isTriggered = true;
      category = 'RED ALERT';
      headline = `🛑 Support Breakdown: ${stock.symbol} sliced below key technical floor of ${stock.currency} ${alert.supportBreakLevel}`;
      detail = `Price broke confirmed support at ${stock.currency} ${alert.supportBreakLevel}. Immediate invalidation of bullish thesis.`;
      action = 'REVIEW POSITION SIZE';
    }

    // D. Check Target High Hit
    if (!isTriggered && stock.price >= alert.targetPrice) {
      isTriggered = true;
      category = 'SELL / REDUCE EXPOSURE REVIEW';
      headline = `🎯 Target Price Hit: ${stock.symbol} reached ${stock.currency} ${stock.price}!`;
      detail = `Target high of ${stock.currency} ${alert.targetPrice} achieved on ${stock.exchange}. Consider scaling out or raising stops.`;
      action = 'TARGET REACHED - SCALE OUT';
      alert.status = 'TRIGGERED_TARGET';
    }

    // E. Check Stop Loss Breached
    if (!isTriggered && stock.price <= alert.stopPrice) {
      isTriggered = true;
      category = 'RED ALERT';
      headline = `🛑 Stop Loss Hit: ${stock.symbol} reached defensive stop ${stock.currency} ${alert.stopPrice}!`;
      detail = `Price fell to ${stock.currency} ${stock.price}. Risk management parameter breached.`;
      action = 'CONSIDER EXIT';
      alert.status = 'TRIGGERED_STOP';
    }

    // If triggered, handle cooldown, quiet hours, and channel logging
    if (isTriggered) {
      const cooldownMs = (alert.cooldownMinutes || notificationConfig.defaultCooldownMinutes || 15) * 60 * 1000;
      const isCooldownActive = alert.lastTriggeredAt ? nowMs - alert.lastTriggeredAt < cooldownMs : false;

      let deliveryStatus: 'DELIVERED' | 'SUPPRESSED_COOLDOWN' | 'SUPPRESSED_QUIET_HOURS' = 'DELIVERED';
      if (quiet) {
        deliveryStatus = 'SUPPRESSED_QUIET_HOURS';
      } else if (isCooldownActive) {
        deliveryStatus = 'SUPPRESSED_COOLDOWN';
      } else {
        alert.lastTriggeredAt = nowMs;
        alert.suggestedAction = action;
        alert.smartReason = headline;
      }

      // Record logs across configured channels
      const channels: ('IN_APP' | 'BROWSER_PUSH' | 'WEBHOOK_DISPATCH' | 'EMAIL_ALERT')[] = [];
      if (notificationConfig.inAppEnabled) channels.push('IN_APP');
      if (notificationConfig.browserPushEnabled) channels.push('BROWSER_PUSH');
      if (notificationConfig.webhookEnabled) channels.push('WEBHOOK_DISPATCH');
      if (notificationConfig.emailSimulationEnabled) channels.push('EMAIL_ALERT');

      channels.forEach((ch) => {
        serverNotificationLogs.unshift({
          id: `log-${nowMs}-${Math.random().toString(36).substring(2, 7)}`,
          alertId: alert.id,
          symbol: alert.symbol,
          category,
          channel: ch,
          status: deliveryStatus,
          timestamp: new Date().toISOString(),
          headline,
          detail,
        });
      });

      // Keep logs to latest 100 entries
      if (serverNotificationLogs.length > 100) {
        serverNotificationLogs = serverNotificationLogs.slice(0, 100);
      }
    }
  });
}, 5000);

// ==========================================
// ALERTS & NOTIFICATIONS ENDPOINTS
// ==========================================

app.get('/api/alerts', (_req: Request, res: Response) => {
  res.json({
    alerts: serverAlerts,
    monitoringActive: true,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/alerts', (req: Request, res: Response) => {
  const alertData: WatchlistAlert = req.body;
  if (!alertData || !alertData.symbol) {
    res.status(400).json({ error: 'Valid alert symbol is required' });
    return;
  }

  const existingIdx = serverAlerts.findIndex((a) => a.id === alertData.id);
  if (existingIdx >= 0) {
    serverAlerts[existingIdx] = { ...serverAlerts[existingIdx], ...alertData };
    res.json({ success: true, alert: serverAlerts[existingIdx] });
  } else {
    const newAlert: WatchlistAlert = {
      ...alertData,
      id: alertData.id || `alt-${Date.now()}`,
      status: 'ACTIVE',
      dateCreated: alertData.dateCreated || new Date().toISOString().split('T')[0],
      highestPriceReached: alertData.currentPrice,
    };
    serverAlerts.unshift(newAlert);
    res.json({ success: true, alert: newAlert });
  }
});

app.delete('/api/alerts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  serverAlerts = serverAlerts.filter((a) => a.id !== id);
  res.json({ success: true, removedId: id });
});

app.get('/api/notifications/log', (_req: Request, res: Response) => {
  res.json({
    logs: serverNotificationLogs,
    count: serverNotificationLogs.length,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/notifications/log/clear', (_req: Request, res: Response) => {
  serverNotificationLogs = [];
  res.json({ success: true });
});

app.get('/api/notifications/config', (_req: Request, res: Response) => {
  res.json({
    config: notificationConfig,
  });
});

app.post('/api/notifications/config', (req: Request, res: Response) => {
  notificationConfig = {
    ...notificationConfig,
    ...req.body,
  };
  res.json({
    success: true,
    config: notificationConfig,
  });
});

// ==========================================
// AI BUY ADVISOR: MULTI-FACTOR DISCOVERY ENGINE
// ==========================================

app.post('/api/advisor/buy-scan', (_req: Request, res: Response) => {
  // Quantitative 5-Pillar Discovery Algorithm:
  // 1. Trend Strength (0-20)
  // 2. Volume Confirmation (0-20)
  // 3. Valuation Quality (0-20)
  // 4. Balance Sheet Safety (0-20)
  // 5. Risk-to-Reward Ratio (0-20)

  const rankedCandidates: BuyScanRankedCandidate[] = GLOBAL_STOCKS.map((stock) => {
    // 1. Trend Strength: SMA alignments and price vs 50 SMA
    let trendScore = 10;
    if (stock.price > stock.technicals.sma20 && stock.technicals.sma20 > stock.technicals.sma50) trendScore += 6;
    if (stock.price > stock.technicals.sma200) trendScore += 4;
    trendScore = Math.min(20, trendScore);

    // 2. Volume Confirmation: RVOL and money flow
    let volScore = 8;
    if (stock.technicals.rvol >= 1.5) volScore += 8;
    else if (stock.technicals.rvol >= 1.2) volScore += 5;
    if (stock.technicals.macd.histogram > 0) volScore += 4;
    volScore = Math.min(20, volScore);

    // 3. Valuation Quality: P/E and margin health
    let valScore = 10;
    if (stock.fundamentals.peRatio > 0 && stock.fundamentals.peRatio < 35) valScore += 5;
    if (stock.fundamentals.revenueGrowthYOY > 12) valScore += 5;
    valScore = Math.min(20, valScore);

    // 4. Balance Sheet Safety: Debt to equity & clean audit
    let bsScore = 12;
    if (stock.fundamentals.debtToEquity < 0.8) bsScore += 5;
    if (stock.fundamentals.auditOpinion === 'Unqualified (Clean)') bsScore += 3;
    bsScore = Math.min(20, bsScore);

    // 5. Risk-to-Reward: Reward to Stop distance
    const stopDistance = Math.max(0.01, stock.price - stock.technicals.supportLevel);
    const rewardDistance = Math.max(0.01, stock.technicals.resistanceLevel - stock.price);
    const rr = rewardDistance / stopDistance;
    let rrScore = 10;
    if (rr >= 2.5) rrScore = 20;
    else if (rr >= 2.0) rrScore = 17;
    else if (rr >= 1.5) rrScore = 13;
    else rrScore = 8;

    const overallScore = Math.round(trendScore + volScore + valScore + bsScore + rrScore);

    // Strict status determination with "WAIT FOR CONFIRMATION" guards
    let status: 'READY TO BUY' | 'WAIT FOR CONFIRMATION' | 'APPROACHING ENTRY' = 'WAIT FOR CONFIRMATION';
    if (overallScore >= 80 && stock.technicals.rsi14 >= 48 && stock.technicals.rsi14 <= 66 && stock.technicals.rvol >= 1.2) {
      status = 'READY TO BUY';
    } else if (stock.price <= stock.technicals.supportLevel * 1.025) {
      status = 'APPROACHING ENTRY';
    } else {
      status = 'WAIT FOR CONFIRMATION';
    }

    const entryMin = Number((stock.price * 0.98).toFixed(2));
    const entryMax = Number((stock.price * 1.01).toFixed(2));
    const stopLoss = Number((stock.technicals.supportLevel * 0.98).toFixed(2));
    const target1 = Number(stock.technicals.resistanceLevel.toFixed(2));
    const target2 = Number((stock.technicals.resistanceLevel * 1.08).toFixed(2));

    const evidence = [
      `RVOL of ${stock.technicals.rvol}x indicates institutional accumulation`,
      `Verified support floor identified at ${stock.currency} ${stock.technicals.supportLevel}`,
      `P/E multiple ${stock.fundamentals.peRatio}x on ${stock.fundamentals.revenueGrowthYOY}% top-line YoY expansion`,
      `Audited clean ${stock.fundamentals.accountingStandard} financial statements by ${stock.fundamentals.auditor}`,
    ];

    const invalidationRationale = `Daily close breaking below verified support of ${stock.currency} ${stopLoss} invalidates setup.`;

    return {
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      country: stock.country,
      currency: stock.currency,
      price: stock.price,
      rsi: stock.technicals.rsi14,
      overallScore,
      breakdown: {
        trendStrength: trendScore,
        volumeConfirmation: volScore,
        valuationQuality: valScore,
        balanceSheetSafety: bsScore,
        riskRewardScore: rrScore,
      },
      entryZone: { min: entryMin, max: entryMax },
      stopLoss,
      target1,
      target2,
      horizon: '2 - 6 Weeks (Swing Position)',
      riskRating: overallScore >= 80 ? 'LOW' : overallScore >= 65 ? 'MEDIUM' : 'HIGH',
      status,
      invalidationRationale,
      evidence,
    };
  });

  // Sort descending by overallScore
  rankedCandidates.sort((a, b) => b.overallScore - a.overallScore);

  res.json({
    count: rankedCandidates.length,
    candidates: rankedCandidates,
    scoringMethodology: '5-Pillar Multi-Factor Quantitative Scoring (0-100 pts)',
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// RIGHT TIME TO SELL ADVISOR (EXIT ANALYSIS ENGINE)
// ==========================================

app.post('/api/advisor/sell-review', (req: Request, res: Response) => {
  const { symbol, entryPrice, shares, holdingHorizon } = req.body;
  const stock = GLOBAL_STOCKS.find(
    (s) => s.symbol.toUpperCase() === String(symbol || '').toUpperCase() || s.id === symbol
  ) || GLOBAL_STOCKS[0];

  const ep = Number(entryPrice) || stock.price * 0.92;
  const currentPrice = stock.price;
  const gainPct = Number((((currentPrice - ep) / ep) * 100).toFixed(2));

  // Check for scandals or governance red flags
  const scandal = CORPORATE_SCANDALS.find((sc) => sc.symbol.toUpperCase() === stock.symbol.toUpperCase());

  const conditionsTriggered: string[] = [];
  let recommendation: 'HOLD' | 'TAKE-PROFIT REVIEW' | 'REDUCE-RISK REVIEW' | 'EXIT-CONDITION TRIGGERED' | 'WAIT' = 'HOLD';
  let urgency: 'URGENT' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
  let primaryReason = 'Position performing within normal volatility bounds; primary technical trend intact.';
  let thesisIntegrity: 'INTACT' | 'WEAKENED' | 'INVALIDATED' = 'INTACT';

  // 1. Check critical governance / scandal trigger
  if (scandal && (scandal.severity === 'Critical' || scandal.severity === 'High')) {
    recommendation = 'EXIT-CONDITION TRIGGERED';
    urgency = 'URGENT';
    thesisIntegrity = 'INVALIDATED';
    primaryReason = `Material governance/fraud risk detected: ${scandal.headline}`;
    conditionsTriggered.push(`Active scandal logged: ${scandal.headline}`);
  }

  // 2. Check technical overextension
  if (stock.technicals.rsi14 >= 75) {
    conditionsTriggered.push(`RSI(14) overextended at ${stock.technicals.rsi14} (severe momentum exhaustion risk)`);
    if (recommendation !== 'EXIT-CONDITION TRIGGERED') {
      recommendation = 'TAKE-PROFIT REVIEW';
      urgency = 'HIGH';
      primaryReason = `RSI reached ${stock.technicals.rsi14}, signaling near-term exhaustion.`;
    }
  }

  // 3. Check proximity to target resistance
  const distanceToResistance = ((stock.technicals.resistanceLevel - currentPrice) / currentPrice) * 100;
  if (distanceToResistance <= 1.5 && gainPct > 5) {
    conditionsTriggered.push(`Price is within ${distanceToResistance.toFixed(1)}% of verified ceiling (${stock.currency} ${stock.technicals.resistanceLevel})`);
    if (recommendation === 'HOLD') {
      recommendation = 'TAKE-PROFIT REVIEW';
      urgency = 'HIGH';
      primaryReason = `Testing major resistance at ${stock.currency} ${stock.technicals.resistanceLevel} with ${gainPct}% unrealized gain.`;
    }
  }

  // 4. Check breakdown below moving average or support
  if (currentPrice < stock.technicals.supportLevel) {
    conditionsTriggered.push(`Price breached daily support floor at ${stock.currency} ${stock.technicals.supportLevel}`);
    recommendation = 'EXIT-CONDITION TRIGGERED';
    urgency = 'HIGH';
    thesisIntegrity = 'INVALIDATED';
    primaryReason = `Breakdown below key structural support ${stock.currency} ${stock.technicals.supportLevel}.`;
  } else if (currentPrice < stock.technicals.sma20) {
    conditionsTriggered.push('Closed below short-term 20-day Simple Moving Average');
    if (recommendation === 'HOLD') {
      recommendation = 'REDUCE-RISK REVIEW';
      urgency = 'MODERATE';
      thesisIntegrity = 'WEAKENED';
      primaryReason = 'Short-term momentum waning below SMA20.';
    }
  }

  // Remaining Reward to Risk ratio
  const upsideToResistance = Math.max(0.01, stock.technicals.resistanceLevel - currentPrice);
  const downsideToSupport = Math.max(0.01, currentPrice - stock.technicals.supportLevel);
  const remainingRR = `1:${(upsideToResistance / downsideToSupport).toFixed(2)}`;

  let partialProfitGuidance = 'Maintain stop loss 1 ATR below 20-day SMA. Let winning trend continue.';
  if (gainPct >= 10 || recommendation === 'TAKE-PROFIT REVIEW') {
    partialProfitGuidance = `Lock in 50% profit on position now. Raise stop loss on remaining 50% to entry breakeven (${stock.currency} ${ep.toFixed(2)}) to guarantee positive trade outcome.`;
  }

  const trailingStopRecommendation = `Suggested trailing stop: ${stock.currency} ${(currentPrice * 0.95).toFixed(2)} (5% below current peak) or 1.5x ATR at ${stock.currency} ${(currentPrice - stock.technicals.atr14 * 1.5).toFixed(2)}.`;

  let suggestedExecution = 'Hold position with current risk parameters.';
  if (recommendation === 'EXIT-CONDITION TRIGGERED') {
    suggestedExecution = 'Execute market or tight limit sell order to terminate position and safeguard principal.';
  } else if (recommendation === 'TAKE-PROFIT REVIEW') {
    suggestedExecution = 'Scale out 33% to 50% of position size. Retain runner with trailing stop.';
  } else if (recommendation === 'REDUCE-RISK REVIEW') {
    suggestedExecution = 'Trim exposure by 25-30% to de-risk against broader market correction.';
  }

  const result: ExitAdvisorResult = {
    symbol: stock.symbol,
    name: stock.name,
    exchange: stock.exchange,
    currentPrice,
    recommendation,
    urgency,
    remainingRewardToRisk: remainingRR,
    primaryReason,
    thesisIntegrity,
    conditionsTriggered,
    suggestedExecution,
    partialProfitGuidance,
    trailingStopRecommendation,
    timestamp: new Date().toISOString(),
  };

  res.json(result);
});

// ==========================================
// PROFIT, LOSS & RISK-TO-REWARD CALCULATOR
// ==========================================

app.post('/api/calculator/risk-reward', (req: Request, res: Response) => {
  const {
    entryPrice,
    shares,
    stopLossPrice,
    targetPrice1,
    targetPrice2,
    feesAndCommissions,
    estimatedSlippagePercent,
    portfolioSize,
  } = req.body;

  const ep = Number(entryPrice) || 100;
  const qty = Number(shares) || 100;
  const sl = Number(stopLossPrice) || ep * 0.95;
  const tp1 = Number(targetPrice1) || ep * 1.10;
  const tp2 = targetPrice2 ? Number(targetPrice2) : undefined;
  const fees = Number(feesAndCommissions) || 5;
  const slippagePct = Number(estimatedSlippagePercent) || 0.1;
  const portSize = portfolioSize ? Number(portfolioSize) : undefined;

  const totalInvested = ep * qty;
  const grossProfitTarget1 = qty * (tp1 - ep);
  const grossProfitTarget2 = tp2 ? qty * (tp2 - ep) : undefined;
  const grossLossStop = qty * (ep - sl);

  const targetReturnPct1 = Number((((tp1 - ep) / ep) * 100).toFixed(2));
  const targetReturnPct2 = tp2 ? Number((((tp2 - ep) / ep) * 100).toFixed(2)) : undefined;
  const stopLossReturnPct = Number((((ep - sl) / ep) * 100).toFixed(2));

  const rewardPerShare = Number((tp1 - ep).toFixed(2));
  const riskPerShare = Number((ep - sl).toFixed(2));
  const riskRewardRatio = riskPerShare > 0 ? Number((rewardPerShare / riskPerShare).toFixed(2)) : 0;
  const riskRewardDisplay = `1:${riskRewardRatio}`;

  const slippageCost = totalInvested * (slippagePct / 100);
  const netProfitAfterFeesTarget1 = Number((grossProfitTarget1 - fees - slippageCost).toFixed(2));
  const netLossAfterFeesStop = Number((grossLossStop + fees + slippageCost).toFixed(2));

  const breakevenPrice = Number((ep + (fees * 2 + slippageCost) / qty).toFixed(2));
  const maxCapitalAtRisk = netLossAfterFeesStop;
  const portfolioExposurePct = portSize && portSize > 0 ? Number(((totalInvested / portSize) * 100).toFixed(2)) : undefined;

  const rating: 'FAVORABLE' | 'MARGINAL' | 'UNFAVORABLE' =
    riskRewardRatio >= 2.0 ? 'FAVORABLE' : riskRewardRatio >= 1.5 ? 'MARGINAL' : 'UNFAVORABLE';

  const calculation: ProfitLossCalculation = {
    shares: qty,
    entryPrice: ep,
    totalInvested: Number(totalInvested.toFixed(2)),
    targetPrice1: tp1,
    targetPrice2: tp2,
    stopLossPrice: sl,
    feesAndCommissions: fees,
    estimatedSlippagePercent: slippagePct,
    grossProfitTarget1: Number(grossProfitTarget1.toFixed(2)),
    grossProfitTarget2: grossProfitTarget2 ? Number(grossProfitTarget2.toFixed(2)) : undefined,
    grossLossStop: Number(grossLossStop.toFixed(2)),
    targetReturnPct1,
    targetReturnPct2,
    stopLossReturnPct,
    rewardPerShare,
    riskPerShare,
    riskRewardRatio,
    riskRewardDisplay,
    breakevenPrice,
    netProfitAfterFeesTarget1,
    netLossAfterFeesStop,
    maxCapitalAtRisk,
    portfolioSize: portSize,
    portfolioExposurePct,
    rating,
  };

  res.json(calculation);
});

// Serve frontend in dev via Vite middlewares, or static dist in prod
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Global AI Stock Market Platform running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
