'use client';

import { useState, useEffect } from 'react';
import { Market, TickerResult, Stock } from '../types';

export default function TickerExtractorForm() {
  const [query, setQuery] = useState('');
  const [market, setMarket] = useState<Market>('Global');
  const [result, setResult] = useState<TickerResult>({ tickers: [] });
  const [stockDetails, setStockDetails] = useState<Stock[]>([]);
  const [loadingTickers, setLoadingTickers] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);

  // Fetch stock details for each ticker
  const fetchStockDetails = async (tickers: string[]) => {
    if (!tickers.length) return;
    
    setLoadingDetails(true);
    
    try {
      const detailsPromises = tickers.map(async (ticker) => {
        try {
          const response = await fetch(`/api/stock-details?symbol=${ticker}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch details for ${ticker}`);
          }
          return await response.json();
        } catch (err) {
          console.error(`Error fetching details for ${ticker}:`, err);
          return null;
        }
      });
      
      const fetchedDetails = (await Promise.all(detailsPromises))
        .filter((detail): detail is Stock => detail !== null);
      
      setStockDetails(fetchedDetails);
    } catch (err) {
      console.error('Error fetching stock details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setResult({ tickers: [], message: 'Please enter a query' });
      return;
    }
    
    setLoadingTickers(true);
    setError('');
    // Clear previous results immediately
    setResult({ tickers: [] });
    setStockDetails([]);
    
    try {
      // Step 1: Call our backend API to extract tickers
      const response = await fetch('/api/extract-tickers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, market }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract tickers');
      }
      
      const data = await response.json();
      setResult(data);
      setShowPreferences(false); // Hide preferences after search
      
      // Step 2: Fetch stock details for each ticker
      if (data.tickers && data.tickers.length > 0) {
        fetchStockDetails(data.tickers);
      }
    } catch (err) {
      console.error('Error extracting tickers:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResult({ tickers: [], message: 'Failed to process query' });
    } finally {
      setLoadingTickers(false);
    }
  };

  // Market selection dropdown
  const handleMarketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMarket(e.target.value as Market);
  };

  // Main form
  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Stock Ticker Identifier</h2>
            <div className="flex items-center">
              <label htmlFor="market-select" className="text-sm text-gray-400 mr-2">Market:</label>
              <select
                id="market-select"
                value={market}
                onChange={handleMarketChange}
                className="bg-gray-800 text-white border border-gray-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Global">Global</option>
                <option value="US">US</option>
                <option value="HK">HK</option>
                <option value="China">China</option>
              </select>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter any query to extract stock tickers (e.g., 'Apple stock price')"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loadingTickers}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition"
        >
          {loadingTickers ? 'Processing...' : 'Extract Stock Tickers'}
        </button>
      </form>
    );
  };

  // Results section
  const renderResults = () => {
    if (!result.tickers.length && !result.message) {
      return null;
    }
    
    return (
      <div className="mt-8 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Results</h2>
          {result.message && (
            <span className="text-xs px-2 py-1 rounded bg-blue-900 text-blue-200">
              AI-Powered
            </span>
          )}
        </div>
        
        {result.message && (
          <p className="text-sm text-gray-400 mb-4">{result.message}</p>
        )}
        
        {loadingDetails && (
          <p className="text-sm text-blue-400 mb-4">Loading stock details...</p>
        )}
        
        <div className="grid gap-4 sm:grid-cols-2">
          {result.tickers.map((ticker, index) => {
            // Find stock details if available
            const stockDetail = stockDetails.find(detail => detail.symbol === ticker);
            
            return (
              <div key={index} className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-lg font-bold text-blue-400">{ticker}</span>
                    {stockDetail && (
                      <h3 className="text-base font-medium text-gray-300">{stockDetail.name}</h3>
                    )}
                  </div>
                  {stockDetail && stockDetail.price !== undefined && (
                    <span className="text-lg font-bold text-green-400">
                      {typeof stockDetail.price === 'number' 
                        ? stockDetail.price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })
                        : stockDetail.price}
                    </span>
                  )}
                </div>
                
                {stockDetail ? (
                  <div className="mt-2 text-sm text-gray-400">
                    <p>
                      {stockDetail.exchange}
                      {stockDetail.exchangeShortName && ` (${stockDetail.exchangeShortName})`}
                    </p>
                    <p className="capitalize">{stockDetail.type}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-400">
                    {loadingDetails ? "Loading details..." : "No additional details available"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        
        {result.tickers.length === 0 && (
          <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-md">
            <p className="text-gray-400">No tickers found</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-900 border border-red-800 text-red-200 rounded-lg">
            {error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-gray-900 rounded-xl shadow-xl p-6">
      {renderForm()}
      {renderResults()}
    </div>
  );
}
