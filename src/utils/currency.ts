// Approximate exchange rates to USD base
const USD_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 1.0825, // 1 EUR = 1.0825 USD
  GBP: 1.2980, // 1 GBP = 1.2980 USD
  INR: 0.01189, // 1 INR = 0.01189 USD (84.08 INR = 1 USD)
  JPY: 0.006585, // 1 JPY = 0.006585 USD (151.85 JPY = 1 USD)
  CAD: 0.7236, // 1 CAD = 0.7236 USD (1.382 CAD = 1 USD)
  AUD: 0.6655, // 1 AUD = 0.6655 USD
  CHF: 1.1547, // 1 CHF = 1.1547 USD
  HKD: 0.1287, // 1 HKD = 0.1287 USD
  CNY: 0.1402, // 1 CNY = 0.1402 USD
  TWD: 0.0311, // 1 TWD = 0.0311 USD
  KRW: 0.000725, // 1 KRW = 0.000725 USD
  BRL: 0.1751, // 1 BRL = 0.1751 USD
  ZAR: 0.0568, // 1 ZAR = 0.0568 USD
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  CHF: 'Fr',
  HKD: 'HK$',
  CNY: '¥',
  TWD: 'NT$',
  KRW: '₩',
  BRL: 'R$',
  ZAR: 'R',
};

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): { converted: number; rate: number } {
  if (fromCurrency === toCurrency) {
    return { converted: amount, rate: 1.0 };
  }

  const fromInUsd = USD_RATES[fromCurrency] || 1.0;
  const toInUsd = USD_RATES[toCurrency] || 1.0;

  // Amount in USD = amount * fromInUsd
  const amountInUsd = amount * fromInUsd;
  // Amount in toCurrency = amountInUsd / toInUsd
  const converted = amountInUsd / toInUsd;
  const rate = fromInUsd / toInUsd;

  return {
    converted: Number(converted.toFixed(2)),
    rate: Number(rate.toFixed(4)),
  };
}

export function formatCurrencyValue(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency + ' ';
  if (Math.abs(amount) >= 1_000_000_000_000) {
    return `${symbol}${(amount / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${symbol}${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(2)}M`;
  }
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
