import axios from 'axios';
import { Stock } from '../types';

// In-memory cache
let stockListCache: Stock[] = [];
let stockSymbolMap: Map<string, Stock> = new Map();
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetch stock list directly from Financial Modeling Prep API
 */
export async function getStockList(): Promise<Stock[]> {
  // Check if we have cached data and it's still valid
  const currentTime = Date.now();
  
  if (stockListCache.length > 0 && currentTime - lastFetchTime < CACHE_DURATION) {
    return stockListCache;
  }
  
  try {
    // Fetch from FMP API
    const API_KEY = process.env.FMP_API_KEY;
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/stock/list?apikey=${API_KEY}`,
      {
        headers: {
          'Cache-Control': 'max-age=86400' // 24 hours caching
        }
      }
    );
    
    if (Array.isArray(response.data)) {
      // Process and cache the result
      stockListCache = response.data.map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        price: item.price,
        exchange: item.exchange,
        exchangeShortName: item.exchangeShortName,
        type: item.type
      }));
      
      // Build efficient lookup map by symbol
      stockSymbolMap.clear();
      for (const stock of stockListCache) {
        stockSymbolMap.set(stock.symbol, stock);
      }
      
      lastFetchTime = currentTime;
      return stockListCache;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching stock list:', error);
    return stockListCache.length > 0 ? stockListCache : [];
  }
}

/**
 * Get a stock by its exact symbol
 */
export async function getStockBySymbol(symbol: string): Promise<Stock | null> {
  // Ensure the stock list is loaded
  if (stockListCache.length === 0) {
    await getStockList();
  }
  
  return stockSymbolMap.get(symbol) || null;
}

/**
 * Search for stocks by partial symbol or name
 */
export async function searchStocks(query: string, limit: number = 10): Promise<Stock[]> {
  // Ensure the stock list is loaded
  if (stockListCache.length === 0) {
    await getStockList();
  }
  
  query = query.toUpperCase();
  
  // First search for direct symbol matches
  const symbolMatches = stockListCache.filter(
    stock => stock.symbol.toUpperCase().includes(query)
  );
  
  // Then search for name matches
  const nameMatches = stockListCache.filter(
    stock => !stock.symbol.toUpperCase().includes(query) && 
             stock.name.toUpperCase().includes(query)
  );
  
  // Combine results, prioritizing symbol matches
  return [...symbolMatches, ...nameMatches].slice(0, limit);
}

/**
 * Validate if a stock symbol exists in our database
 */
export async function validateSymbol(symbol: string): Promise<boolean> {
  // Ensure the stock list is loaded
  if (stockListCache.length === 0) {
    await getStockList();
  }
  
  return stockSymbolMap.has(symbol);
}

/**
 * Get details for multiple stock symbols
 */
export async function getStocksDetails(symbols: string[]): Promise<Stock[]> {
  // Ensure the stock list is loaded
  if (stockListCache.length === 0) {
    await getStockList();
  }
  
  return symbols
    .map(symbol => stockSymbolMap.get(symbol))
    .filter((stock): stock is Stock => stock !== undefined);
}
