import TickerExtractorForm from './components/TickerExtractorForm';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 bg-black">
      <header className="w-full max-w-4xl mb-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2 text-center text-white">NLP Stock Ticker Identifier</h1>
        <p className="text-gray-400 text-center max-w-2xl">
          Extract stock tickers from natural language queries across different markets
        </p>
      </header>

      <main className="w-full max-w-4xl flex-1">
        <TickerExtractorForm />
      </main>

      <footer className="w-full max-w-4xl mt-8 py-6 border-t border-gray-800">
        <p className="text-center text-gray-500 text-sm">
          Powered by Financial Modeling Prep API
        </p>
      </footer>
    </div>
  );
}
