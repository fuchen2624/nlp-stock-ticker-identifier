// This file is kept for reference but is no longer used directly.
// The stock fetching logic has been moved to the backend API routes:
// - /api/extract-tickers for ticker extraction
// - /api/stocks for raw stock data access

import { Stock } from '../types';

export function getExchangeCategory(exchange: string, shortName: string): 'US' | 'HK' | 'China' | 'Global' {
  const upperExchange = exchange.toUpperCase();
  const upperShortName = shortName.toUpperCase();
  
  if (upperExchange.includes('NYSE') || upperExchange.includes('NASDAQ') || upperShortName === 'NYSE' || upperShortName === 'NASDAQ') {
    return 'US';
  } else if (upperExchange.includes('HKEX') || upperShortName === 'HKEX' || upperExchange.includes('HONG KONG') || shortName.endsWith('.HK')) {
    return 'HK';
  } else if (
    upperExchange.includes('SHANGHAI') || 
    upperExchange.includes('SHENZHEN') || 
    upperShortName === 'SSE' || 
    upperShortName === 'SZSE' || 
    shortName.endsWith('.SS') || 
    shortName.endsWith('.SZ')
  ) {
    return 'China';
  }
  
  return 'Global';
}
