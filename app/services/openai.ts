import { OpenAI } from 'openai';
import { Language, Market } from '../types';
import { validateSymbol } from './stockList';

// Create a reusable OpenAI client instance
let openaiClient: OpenAI | null = null;

const MODEL = process.env.MODEL || 'deepseek-chat';
const BASE_URL = process.env.BASE_URL || 'https://api.deepseek.com/v1';
const API_KEY = process.env.API_KEY;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!API_KEY) {
      throw new Error('API_KEY is not defined in environment variables');
    }
    
    openaiClient = new OpenAI({
      baseURL: BASE_URL,
      apiKey: API_KEY,
    });
  }
  
  return openaiClient;
}

// Simple interface for ticker response
export interface ExtractedTicker {
  ticker: string;
}

/**
 * Extract stock tickers from a natural language query using OpenAI
 * @param query - The user's natural language query
 * @param market - The market preference (US, HK, China, Global)
 * @param language - The language preference (English, Simplified Chinese, Traditional Chinese)
 * @returns An array of extracted tickers
 */
export async function extractTickersWithAI(
  query: string, 
  market: Market,
  language: Language = 'English'
): Promise<string[]> {
  const openai = getOpenAIClient();
  
  try {
    // Adjust the system prompt based on language preference
    let systemPrompt = 'You are a financial AI that extracts stock tickers from text. Return only the ticker symbol without any explanation.';
    
    if (language === 'Simplified Chinese') {
      systemPrompt = '您是一个从文本中提取股票代码的金融AI。仅返回股票代码，不需要任何解释。';
    } else if (language === 'Traditional Chinese') {
      systemPrompt = '您是一個從文本中提取股票代碼的金融AI。僅返回股票代碼，不需要任何解釋。';
    }
    
    const prompt = `extracts stock tickers from natural language queries, ensuring 
they match the Financial Modeling Prep (FMP) ticker format. 

e.g 
query: "Find me Apple stock price"  location: ${market}--> AAPL
query: "Thoughts on HSBC"  location: US--> HSBC
query: "Thoughts on HSBC"  location: Asia--> 0005.HK
query: "compare Alibaba 港股 and NVDA" Global --> 9988.HK, NVDA
query: "compare BABA and NVDA" Global --> BABA, NVDA
---
query:"${query}". location: ${market}

return the ticker without any explanation`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    });
    
    // Get the response content
    const responseContent = response.choices[0]?.message?.content || '';
    
    // Parse the response - it should be just a ticker or multiple tickers separated by commas
    const extractedTickers = responseContent.split(',')
      .map(t => t.trim())
      .filter(t => t && t.length > 0 && t.length <= 10); // Basic validation
    
    // Validate tickers against our stock list database
    const validatedTickers: string[] = [];
    
    for (const ticker of extractedTickers) {
      // Remove any non-alphanumeric characters except dots
      const cleanTicker = ticker.replace(/[^a-zA-Z0-9.]/g, '');
      
      // Skip if ticker became empty after cleaning
      if (!cleanTicker) continue;
      
      // Validate against our stock database
      const isValid = await validateSymbol(cleanTicker);
      
      if (isValid) {
        validatedTickers.push(cleanTicker);
      } else {
        // If not valid, still include it but log for debugging
        console.log(`Ticker ${cleanTicker} not found in stock database`);
        validatedTickers.push(cleanTicker);
      }
    }
    
    return validatedTickers;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return [];
  }
}
