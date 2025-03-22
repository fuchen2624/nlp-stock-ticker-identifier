// This file is retained for reference.
// The actual implementation has been moved to /app/api/extract-tickers/route.ts

import { Stock, Market, TickerResult } from '../types';
import Fuse from 'fuse.js';

// Regular expression to match potential stock tickers
const TICKER_REGEX = /\b[A-Z]{1,5}(?:\.[A-Z]{1,2})?\b/g;

// Common words to exclude from ticker matches
const COMMON_WORDS = new Set([
  'A', 'I', 'AM', 'AN', 'AS', 'AT', 'BE', 'BY', 'GO', 'IF', 'IN', 'IS', 'IT', 'ME', 'MY', 'NO', 'OF', 'ON', 'OR', 'SO', 'TO', 'UP', 'US', 'WE'
]);

// Location/Exchange keywords for different markets
const LOCATION_KEYWORDS = {
  US: ['us', 'usa', 'nyse', 'nasdaq', 'american', 'america', 'united states'],
  HK: ['hk', 'hong kong', 'hongkong', '香港', 'hkex'],
  China: ['china', 'mainland', 'shanghai', 'shenzhen', '中国', '大陆', 'sse', 'szse', 'a股', 'a-share', 'a share'],
  Global: ['global', 'world', 'international']
};

// Function to detect potential exchange preference from the query
export function detectExchangePreference(query: string): Market | null {
  const lowerQuery = query.toLowerCase();
  
  for (const [market, keywords] of Object.entries(LOCATION_KEYWORDS)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      return market as Market;
    }
  }
  
  return null;
}

// Function to detect if a query is in Chinese
export function isChinese(text: string): boolean {
  // Check for Chinese characters
  return /[\u4e00-\u9fff]/.test(text);
}

// Function to detect language of the query
export function detectLanguage(query: string): 'English' | 'Simplified Chinese' | 'Traditional Chinese' {
  if (!isChinese(query)) {
    return 'English';
  }
  
  // Basic heuristic: Traditional Chinese uses more complex characters
  const traditionalChars = /[馬車長見門風開關無是這個來們想實行觀點時機會]/.test(query);
  return traditionalChars ? 'Traditional Chinese' : 'Simplified Chinese';
}

// Function to extract direct ticker mentions from text
export function extractDirectTickers(text: string): string[] {
  const matches = text.match(TICKER_REGEX) || [];
  return matches.filter(match => !COMMON_WORDS.has(match));
}
