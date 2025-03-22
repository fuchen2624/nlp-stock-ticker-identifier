// Market options
export type Market = 'Global' | 'US' | 'Asia' | 'Europe' | 'Emerging' | 'LatinAmerica' | 'MiddleEast' | 'Africa';

// Language options
export type Language = 'English' | 'Simplified Chinese' | 'Traditional Chinese';

// Stock details from Financial Modeling Prep API
export interface Stock {
  symbol: string;
  name: string;
  price?: number;
  exchange?: string;
  exchangeShortName?: string;
  type?: string;
}

// Ticker extraction result
export interface TickerResult {
  tickers: string[];
  message?: string;
  stockDetails?: Stock[];
}
