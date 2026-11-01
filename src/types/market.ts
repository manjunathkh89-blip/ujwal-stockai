export type MarketSessionStatus = 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS' | 'HALTED';

export interface MarketSession {
  id: string;
  name: string;
  country: string;
  exchange: string;
  city: string;
  timezone: string;
  openLocalTime: string;
  closeLocalTime: string;
  status: MarketSessionStatus;
  currentLocalTime: string;
  timeUntilNextEvent: string;
}

export interface GlobalIndex {
  symbol: string;
  name: string;
  country: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  previousClose: number;
  high52w: number;
  low52w: number;
  volume: number;
  status: MarketSessionStatus;
}

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi14: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  sma200: number;
  ema9: number;
  ema21: number;
  vwap: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  supportLevel: number;
  resistanceLevel: number;
  rvol: number; // Relative Volume
  atr14: number; // Average True Range
}

export interface Fundamentals {
  marketCap: number; // in local currency
  enterpriseValue: number;
  peRatio: number;
  forwardPE: number;
  pbRatio: number;
  evEbitda: number;
  revenue: number;
  revenueGrowthYOY: number;
  netIncome: number;
  eps: number;
  epsGrowthYOY: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roe: number;
  roic: number;
  debtToEquity: number;
  freeCashFlow: number;
  dividendYield: number;
  sharesOutstanding: number;
  accountingStandard: 'US GAAP' | 'IFRS' | 'Ind AS' | 'J-GAAP';
  fiscalYearEnd: string;
  auditor: string;
  auditOpinion: 'Unqualified (Clean)' | 'Qualified' | 'Adverse' | 'Disclaimer of Opinion';
}

export type BreakoutClassification = 
  | 'Potential Breakout' 
  | 'Strong Momentum' 
  | 'Reversal Candidate' 
  | 'Unusual Volume' 
  | 'Overextended' 
  | 'Weakening Trend' 
  | 'High Risk';

export interface BreakoutSignal {
  stockSymbol: string;
  companyName: string;
  exchange: string;
  country: string;
  currency: string;
  price: number;
  changePercent: number;
  rvol: number;
  pattern: string;
  classification: BreakoutClassification;
  breakoutTriggerPrice: number;
  invalidationLevel: number;
  target1: number;
  target2: number;
  riskRewardRatio: string;
  horizon: 'Intraday (1-2d)' | 'Swing (1-3w)' | 'Position (1-3m)';
  evidence: string[];
  confidenceLimitations: string;
  detectionTime: string;
}

export interface AiBuyHoldSellReport {
  symbol: string;
  companyName: string;
  rating: 'BUY_ZONE' | 'ACCUMULATE' | 'HOLD' | 'REDUCE_EXPOSURE' | 'SELL_ZONE' | 'NEUTRAL_WAIT';
  confidenceScore: number; // 0 - 100
  latestVerifiedPrice: number;
  currency: string;
  potentialEntryZone: { min: number; max: number };
  stopLossInvalidation: number;
  targetZones: {
    target1: number;
    target2: number;
    extendedTarget?: number;
  };
  riskToRewardRatio: string;
  expectedHorizon: string;
  technicalPosture: string;
  fundamentalPosture: string;
  bullishScenario: string;
  bearishScenario: string;
  eventRisks: string[];
  supportResistanceSummary: string;
  peerValuationNotes: string;
  currencyGeopoliticalRisk: string;
  actionableConditions: {
    buyConditions: string[];
    waitConditions: string[];
    sellConditions: string[];
  };
  generatedAt: string;
  disclaimer: string;
}

export type ScandalSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type FactStatus = 'Official Allegation' | 'Verified Fact' | 'Company Response' | 'Disputed Claim' | 'Regulatory Sanction';

export interface CorporateScandal {
  id: string;
  companyName: string;
  symbol: string;
  exchange: string;
  country: string;
  regulatorOrSource: string;
  headline: string;
  summary: string;
  category: 
    | 'Accounting Fraud & Restatement'
    | 'Auditor Resignation'
    | 'Insider Trading & Governance'
    | 'Regulatory Penalty & Sanction'
    | 'Short-Seller Report'
    | 'Trading Suspension / Investigation'
    | 'Litigation & Insolvency';
  severity: ScandalSeverity;
  factStatus: FactStatus;
  publicationDate: string;
  sourceUrl: string;
  investorImplications: string;
  marketImpactPercent: number;
}

export interface StockItem {
  id: string;
  symbol: string;
  qualifiedSymbol: string; // e.g. AAPL.NASDAQ, RELIANCE.NSE
  name: string;
  country: string;
  countryCode: string;
  exchange: string;
  currency: string;
  sector: string;
  industry: string;
  description: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  dataFreshness: 'Real-Time' | '15m Delayed' | 'End of Day' | 'Demo Provider';
  provider: string;
  lastUpdated: string;
  technicals: TechnicalIndicators;
  fundamentals: Fundamentals;
  breakoutSignal?: BreakoutSignal;
}

export interface PortfolioPosition {
  id: string;
  symbol: string;
  qualifiedSymbol: string;
  name: string;
  exchange: string;
  country: string;
  shares: number;
  avgCostLocal: number;
  currency: string;
  currentPriceLocal: number;
  sector: string;
  dateAdded: string;
}

export type AlertCategory = 
  | 'RED ALERT' 
  | 'BUY OPPORTUNITY WATCH' 
  | 'BREAKOUT WATCH' 
  | 'SELL / REDUCE EXPOSURE REVIEW' 
  | 'HOLD / MONITOR';

export type AlertReferenceType = 
  | 'PREV_CLOSE' 
  | 'DAY_OPEN' 
  | 'RECENT_HIGH' 
  | 'CUSTOM_PRICE' 
  | 'TECHNICAL_LEVEL';

export interface WatchlistAlert {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  targetPrice: number;
  stopPrice: number;
  currentPrice: number;
  status: 'ACTIVE' | 'TRIGGERED_TARGET' | 'TRIGGERED_STOP';
  dateCreated: string;
  note: string;
  category?: AlertCategory;
  dropPercentThreshold?: number; // e.g. 1, 2, 3, 5% drop trigger
  referenceType?: AlertReferenceType;
  referencePrice?: number;
  supportBreakLevel?: number;
  trailingStopActive?: boolean;
  trailingStopPercent?: number; // e.g. 5% trailing from peak
  highestPriceReached?: number;
  cooldownMinutes?: number;
  lastTriggeredAt?: number;
  suggestedAction?: 'DO NOT PANIC SELL' | 'WAIT FOR STABILIZATION' | 'REVIEW POSITION SIZE' | 'CONSIDER EXIT' | 'TARGET REACHED - SCALE OUT';
  smartReason?: string;
}

export interface ProfitLossCalculation {
  shares: number;
  entryPrice: number;
  totalInvested: number;
  targetPrice1: number;
  targetPrice2?: number;
  stopLossPrice: number;
  feesAndCommissions: number;
  estimatedSlippagePercent: number;
  grossProfitTarget1: number;
  grossProfitTarget2?: number;
  grossLossStop: number;
  targetReturnPct1: number;
  targetReturnPct2?: number;
  stopLossReturnPct: number;
  rewardPerShare: number;
  riskPerShare: number;
  riskRewardRatio: number;
  riskRewardDisplay: string;
  breakevenPrice: number;
  netProfitAfterFeesTarget1: number;
  netLossAfterFeesStop: number;
  maxCapitalAtRisk: number;
  portfolioSize?: number;
  portfolioExposurePct?: number;
  rating: 'FAVORABLE' | 'MARGINAL' | 'UNFAVORABLE';
}

export interface ExitAdvisorResult {
  symbol: string;
  name: string;
  exchange: string;
  currentPrice: number;
  recommendation: 'HOLD' | 'TAKE-PROFIT REVIEW' | 'REDUCE-RISK REVIEW' | 'EXIT-CONDITION TRIGGERED' | 'WAIT';
  urgency: 'URGENT' | 'HIGH' | 'MODERATE' | 'LOW';
  remainingRewardToRisk: string;
  primaryReason: string;
  thesisIntegrity: 'INTACT' | 'WEAKENED' | 'INVALIDATED';
  conditionsTriggered: string[];
  suggestedExecution: string;
  partialProfitGuidance?: string;
  trailingStopRecommendation?: string;
  timestamp: string;
}

export interface BuyScanRankedCandidate {
  symbol: string;
  name: string;
  exchange: string;
  country: string;
  currency: string;
  price: number;
  rsi?: number;
  overallScore: number; // 0-100
  breakdown: {
    trendStrength: number;
    volumeConfirmation: number;
    valuationQuality: number;
    balanceSheetSafety: number;
    riskRewardScore: number;
  };
  entryZone: { min: number; max: number };
  stopLoss: number;
  target1: number;
  target2: number;
  horizon: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'READY TO BUY' | 'WAIT FOR CONFIRMATION' | 'APPROACHING ENTRY';
  invalidationRationale: string;
  evidence: string[];
}

export interface NotificationDeliveryLog {
  id: string;
  alertId: string;
  symbol: string;
  category: AlertCategory;
  channel: 'IN_APP' | 'BROWSER_PUSH' | 'WEBHOOK_DISPATCH' | 'EMAIL_ALERT';
  status: 'DELIVERED' | 'SUPPRESSED_COOLDOWN' | 'SUPPRESSED_QUIET_HOURS' | 'QUEUED';
  timestamp: string;
  headline: string;
  detail: string;
}

export interface NotificationChannelConfig {
  inAppEnabled: boolean;
  browserPushEnabled: boolean;
  webhookEnabled: boolean;
  webhookUrl?: string;
  emailSimulationEnabled: boolean;
  emailRecipient?: string;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  defaultCooldownMinutes: number;
}

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  countryCode: string;
  category: 'Central Bank' | 'Inflation' | 'Labor' | 'GDP' | 'Trade' | 'Earnings';
  scheduledTime: string;
  impact: 'High' | 'Medium' | 'Low';
  actual?: string;
  forecast?: string;
  previous?: string;
  affectedMarkets: string[];
  source: string;
}

export interface CurrencyRate {
  pair: string;
  rate: number;
  changePercent: number;
  timestamp: string;
}

export interface CommodityPrice {
  name: string;
  symbol: string;
  price: number;
  unit: string;
  changePercent: number;
  currency: string;
}

export interface CryptoPrice {
  name: string;
  symbol: string;
  price: number;
  changePercent: number;
  volume24h: number;
}

export interface BacktestResult {
  strategyName: string;
  benchmark: string;
  timeframe: string;
  totalTrades: number;
  winRatePercent: number;
  profitFactor: number;
  totalReturnPercent: number;
  benchmarkReturnPercent: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  avgHoldingDays: number;
  tradeLog: {
    tradeId: number;
    symbol: string;
    entryDate: string;
    exitDate: string;
    entryPrice: number;
    exitPrice: number;
    returnPercent: number;
    exitReason: 'Target 1' | 'Target 2' | 'Stop Loss' | 'Time Expiry';
  }[];
}

export interface ProviderStatus {
  id: string;
  name: string;
  region: string;
  exchangesCovered: string[];
  feedType: 'Live REST' | 'WebSocket Stream' | 'Delayed Feed' | 'Simulated Provider Demo';
  status: 'CONNECTED' | 'PARTIAL' | 'DELAYED' | 'DISCONNECTED';
  latencyMs: number;
  freshness: string;
  rateLimit: string;
  licenseNotes: string;
}

export type AppExperienceMode = 'simple' | 'pro' | 'ultimate';

export type CandlePatternType =
  | 'Bullish Engulfing'
  | 'Bearish Engulfing'
  | 'Hammer'
  | 'Inverted Hammer'
  | 'Shooting Star'
  | 'Morning Star'
  | 'Evening Star'
  | 'Doji'
  | 'Inside Bar'
  | 'Outside Bar'
  | 'Pin Bar'
  | 'Three White Soldiers'
  | 'Three Black Crows'
  | 'Marubozu'
  | 'Harami'
  | 'Piercing Pattern'
  | 'Dark Cloud Cover';

export interface CandlePatternSignal {
  type: CandlePatternType;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  index: number;
  time: string;
  price: number;
  description: string;
  significance: 'High' | 'Medium' | 'Low';
}

export interface PaperTradePosition {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  type: 'BUY' | 'SELL_SHORT';
  shares: number;
  entryPrice: number;
  currentPrice: number;
  targetPrice?: number;
  stopLossPrice?: number;
  dateOpened: string;
}

export interface PaperTradeOrder {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  timestamp: string;
  status: 'FILLED' | 'CANCELLED';
  pnl?: number;
}

export interface EarningsReportItem {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  date: string;
  fiscalPeriod: string;
  status: 'UPCOMING' | 'REPORTED';
  expectedEps: number;
  actualEps?: number;
  expectedRevenue: number; // in Millions
  actualRevenue?: number;
  beatMiss?: 'BEAT' | 'MISS' | 'IN_LINE';
  historicalReactionAvgPct: number;
  guidance: string;
  aiExplanation: string;
}

export interface GlobalMarketRadarRegion {
  id: string;
  name: string;
  countryCode: string;
  trend: 'Strong Uptrend' | 'Uptrend' | 'Sideways' | 'Weakening' | 'Downtrend';
  strengthScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  majorIndex: string;
  indexChangePct: number;
  keyDriver: string;
  sectorLeadership: string;
}

export interface AlertWhyExplanation {
  whatHappened: string;
  whyItMatters: string;
  whatToWatch: string;
  whatCouldGoWrong: string;
}

export type MarketRegimeType =
  | 'BULL MARKET'
  | 'BEAR MARKET'
  | 'SIDEWAYS'
  | 'HIGH VOLATILITY'
  | 'RISK-ON'
  | 'RISK-OFF'
  | 'TRANSITION';

export interface MarketRegimeInfo {
  currentRegime: MarketRegimeType;
  confidenceScore: number;
  volatilityScore: number;
  dominantDriver: string;
  recommendedStrategy: string;
  momentumWeight: number;
  fundamentalWeight: number;
  defensiveWeight: number;
  suggestedStopDistance: string;
  lastUpdated: string;
}

export interface MultiAiScores {
  technicalScore: number;
  fundamentalScore: number;
  newsScore: number;
  sentimentScore: number;
  marketRegimeScore: number;
  overallConviction: number;
}

export interface AiDecisionExplainer {
  decision: 'STRONG SETUP' | 'WATCH' | 'EARLY SETUP' | 'CONFIRMATION REQUIRED' | 'HIGH-RISK SETUP' | 'NO SETUP';
  reasons: string[];
  supports: {
    technical: string;
    fundamental: string;
    news: string;
    market: string;
  };
  risks: string[];
  invalidationCondition: string;
}

export interface ProbabilisticForecast {
  bullishProbability: number;
  neutralProbability: number;
  bearishProbability: number;
  sampleSize: number;
  modelVersion: string;
  horizon: string;
  backtestPeriod: string;
  calibrationBrierScore: number;
  confidenceInterval: string;
  falsePositiveRate: number;
  falseNegativeRate: number;
}

export interface MultiScenarioAnalysis {
  bullCase: {
    targetPrice: number;
    catalyst: string;
    expectedGainPct: number;
  };
  baseCase: {
    targetPrice: number;
    catalyst: string;
    expectedGainPct: number;
  };
  bearCase: {
    targetPrice: number;
    catalyst: string;
    expectedDropPct: number;
  };
  invalidationTrigger: string;
}

export interface DynamicStopLossConfig {
  atrStop: { price: number; label: string; distancePct: number };
  supportFloorStop: { price: number; label: string; distancePct: number };
  volatilityBandStop: { price: number; label: string; distancePct: number };
  trailingStop5Pct: { price: number; label: string; distancePct: number };
  recommendedStop: 'ATR' | 'SUPPORT' | 'VOLATILITY' | 'TRAILING';
  rationale: string;
}

export interface StressScenario {
  id: string;
  title: string;
  description: string;
  shockFactor: string;
  simulatedMarketDropPct: number;
  portfolioImpactPct: number;
  portfolioDollarLoss: number;
  vulnerableHoldings: string[];
  hedgeRecommendations: string[];
  severity: 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface AiMemoryRecord {
  id: string;
  timestamp: string;
  stockSymbol: string;
  companyName: string;
  signalType: string;
  marketRegime: MarketRegimeType;
  entryPrice: number;
  stopPrice: number;
  targetPrice: number;
  outcome: 'WIN' | 'LOSS' | 'SCRATCH' | 'PENDING';
  maxFavorableExcursionPct: number;
  maxAdverseExcursionPct: number;
  pnlPct: number;
  aiLesson: string;
}

export interface DailyBriefingData {
  date: string;
  globalMarketSummary: string;
  activeRegime: MarketRegimeType;
  topRisks: string[];
  topOpportunities: string[];
  keyMacroEvents: string[];
  criticalLevels: { symbol: string; level: number; note: string }[];
  whatMattersToday: string;
  endOfDayReport?: {
    winningSectors: string[];
    losingSectors: string[];
    notableBreakouts: string[];
    overnightRisks: string[];
  };
}

