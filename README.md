# NLP Stock Ticker Identifier

A modern web application that extracts stock ticker symbols from natural language queries across multiple markets.

## Demo

NVIDIA vs Alibaba
![DEMO1](/public/demo1.png)

NVIDIA vs Alibaba 香港
![DEMO2](/public/demo2.png)

is AMD a good investment right now?
![DEMO3](/public/demo3.png)

random text
![DEMO4](/public/demo4.png)

HSBC in Hong Kong market
![DEMO5](/public/demo5.png)

HSBC in US market
![DEMO6](/public/demo6.png)

微軟、蘋果和亞馬遜的市值比較
![DEMO7](/public/demo7.png)

"facbook stock price" (misspelled company name)
![DEMO8](/public/demo8.png)

## Speed Analysis

apart from the initial load time, the application is designed to be fast and responsive,  usually take few hundred milliseconds to get the result.

![Speed Analysis](/public/speed_analysis2.png)

## Features

- Natural language processing for extracting stock tickers from plain text queries
- Multi-market support (Global, US, Hong Kong, China)
- Automatic language detection from user queries
- Stock details retrieval with price and exchange information
- Modern UI with multi-step flow
- Server-side caching for improved performance

## Setup Instructions

### Prerequisites

- Node.js 18.x or higher
- API key from OpenAI or Deepseek AI
- API key from Financial Modeling Prep for extended stock details

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nlp-stock-ticker-identifier.git
   cd nlp-stock-ticker-identifier
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment setup:
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Required for AI ticker extraction
   API_KEY=your_openai_or_deepseek_api_key
   BASE_URL=https://api.openai.com/v1  # Or your Deepseek base URL (Optional if OpenAI is used)
   MODEL=gpt-4o-mini  # Or your preferred Deepseek model (Optional if OpenAI is used)

   # Optional - for extended stock information
   FMP_API_KEY=your_financial_modeling_prep_api_key
   ```

4. Build the application:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

## API Usage

The application exposes two main API endpoints:

### 1. Extract Tickers from Query

```http
POST /api/extract-tickers
Content-Type: application/json

{
  "query": "Looking for Apple's stock performance compared to Microsoft",
  "market": "US"
}
```

**Parameters:**
- `query` (required): The natural language text query
- `market` (optional): The market to prioritize (Default: "Global")
  - Available options: "Global", "US", "Asia", "Europe", "Emerging", "LatinAmerica", "MiddleEast", "Africa"

**Response:**
```json
{
  "tickers": ["AAPL", "MSFT"],
  "message": "Found 2 ticker(s)",
  "source": "openai"
}
```

### 2. Fetch Stock Details

```http
GET /api/stock-details?symbol=AAPL
```

**Parameters:**
- `symbol` (required): The stock ticker symbol

**Response:**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 198.45,
  "exchange": "NASDAQ",
  "exchangeShortName": "NASDAQ",
  "type": "stock"
}
```

## Assumptions

1. **Language Detection**: The system automatically detects whether the query is in English, Simplified Chinese, or Traditional Chinese.

2. **Market Prioritization**: When a market is specified, tickers will be prioritized for that market. For example, "HSBC" in the Asia market will return "0005.HK" while in the US market it will return "HSBC".

3. **Ticker Validation**: Extracted tickers are validated against a stock database to ensure accuracy.

4. **Caching Strategy**: 
   - API responses are cached for 1 hour on the client and 24 hours on the CDN
   - Stock details are cached in-memory for 24 hours to minimize API calls

5. **Fallback Mechanism**: If a stock is not found in the local database, the system will attempt to fetch it from the Financial Modeling Prep API if configured.

## Development

For local development, you can run:

```bash
npm run lint
```

**Note**: Do not run `npm run dev` after completing setup tasks as it may cause issues with the application.

## License

[MIT](LICENSE)