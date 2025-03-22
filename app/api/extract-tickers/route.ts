import { NextRequest, NextResponse } from 'next/server';
import { Market } from '../../types';
import { extractTickersWithAI } from '../../services/openai';

// API route handler
export async function POST(request: NextRequest) {
  // Set cache headers for Vercel Edge Cache
  const headers = new Headers();
  headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400'); // Cache for 1 hour on client, 24 hours on CDN
  
  try {
    const { query, market = 'Global' } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400, headers }
      );
    }
    
    // Extract tickers using OpenAI
    const tickers = await extractTickersWithAI(query, market as Market);
    
    return NextResponse.json({
      tickers,
      message: tickers.length > 0 ? `Found ${tickers.length} ticker(s)` : 'No tickers found',
      source: 'openai'
    }, { headers });
  } catch (error) {
    console.error('Error in extract-tickers API:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}
