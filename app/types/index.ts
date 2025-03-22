export type Stock = {
  symbol: string;
  name: string;
  price?: number;
  exchange?: string;
  exchangeShortName?: string;
  type?: string;
};

export type Market = 'US' | 'HK' | 'China' | 'Global' | 'Asia' | 'Europe' | 'Emerging' | 'LatinAmerica' | 'MiddleEast' | 'Africa';
export type Language = 'English' | 'Simplified Chinese' | 'Traditional Chinese';

export type TickerResult = {
  tickers: string[];
  stockDetails?: Stock[];
  message?: string;
};
