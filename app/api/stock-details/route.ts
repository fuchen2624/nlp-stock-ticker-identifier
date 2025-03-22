import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { Stock } from '../../types';
import { getStockBySymbol } from '../../services/stockList';

// Cache for storing API responses to minimize API calls
const stockDetailsCache = new Map<string, Stock>();
let lastFetchTime = new Map<string, number>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetch detailed stock information for a specific ticker
 */
export async function GET(request: NextRequest) {
  // Set cache headers for Vercel Edge Cache
  const headers = new Headers();
  headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400'); // Cache for 1 hour on client, 24 hours on CDN
  
  const symbol = request.nextUrl.searchParams.get('symbol');
  
  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400, headers }
    );
  }
  
  try {
    // Check if we have cached data for this symbol and it's still valid
    const currentTime = Date.now();
    const cachedFetchTime = lastFetchTime.get(symbol) || 0;
    
    if (stockDetailsCache.has(symbol) && currentTime - cachedFetchTime < CACHE_DURATION) {
      return NextResponse.json(stockDetailsCache.get(symbol), { headers });
    }
    
    // First try to get the stock from our stock list service
    const stockFromList = await getStockBySymbol(symbol);
    
    if (stockFromList) {
      // Cache the result
      stockDetailsCache.set(symbol, stockFromList);
      lastFetchTime.set(symbol, currentTime);
      
      return NextResponse.json(stockFromList, { headers });
    }
    
    // If not found in our list, fall back to FMP API
    const API_KEY = process.env.FMP_API_KEY;
    const response = await axios.get(
      `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${API_KEY}`,
      {
        headers: {
          'Cache-Control': 'max-age=86400' // 24 hours caching
        }
      }
    );
    
    // Process and cache the result
    if (Array.isArray(response.data) && response.data.length > 0) {
      const stockDetails: Stock = {
        symbol: response.data[0].symbol,
        name: response.data[0].companyName,
        price: response.data[0].price,
        exchange: response.data[0].exchange,
        exchangeShortName: response.data[0].exchangeShortName,
        type: "stock"
      };
      
      stockDetailsCache.set(symbol, stockDetails);
      lastFetchTime.set(symbol, currentTime);
      
      return NextResponse.json(stockDetails, { headers });
    } else {
      return NextResponse.json(
        { error: 'Stock details not found' },
        { status: 404, headers }
      );
    }
  } catch (error) {
    console.error(`Error fetching details for ${symbol}:`, error);
    
    // Return cached data if available even if expired
    if (stockDetailsCache.has(symbol)) {
      return NextResponse.json(stockDetailsCache.get(symbol), { headers });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch stock details' },
      { status: 500, headers }
    );
  }
}
