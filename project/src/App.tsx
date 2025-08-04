import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { ProductType } from './config';
import { ScanResult } from './types';
import ProductSelector from './components/ProductSelector';
import CameraCapture from './components/CameraCapture';
import ResultModal from './components/ResultModal';

function App() {
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('briefs');
  const [showCamera, setShowCamera] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartScan = () => {
    setError(null);
    setShowCamera(true);
  };

  const handleScanResult = (result: ScanResult) => {
    setScanResult(result);
    setShowResults(true);
    setShowCamera(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setShowCamera(false);
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setScanResult(null);
  };

  if (showCamera) {
    return (
      <div className="fixed inset-0 bg-black">
        <CameraCapture
          productType={selectedProduct}
          onResult={handleScanResult}
          onError={handleError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9ZM19 21H5V3H13V9H19V21Z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hole Detection
          </h1>
          <p className="text-gray-600">
            Scan your innerwear and get instant discount codes
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  Scan Failed
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Product Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <ProductSelector
            selectedProduct={selectedProduct}
            onProductChange={setSelectedProduct}
          />
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How it works
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-red-600">1</span>
              </div>
              <p className="text-sm text-gray-600">
                Select your innerwear type and tap "Start Scan"
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-red-600">2</span>
              </div>
              <p className="text-sm text-gray-600">
                Align your item within the frame overlay
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-red-600">3</span>
              </div>
              <p className="text-sm text-gray-600">
                Capture and get instant results with discount codes
              </p>
            </div>
          </div>
        </div>

        {/* Start Scan Button */}
        <button
          onClick={handleStartScan}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-2xl transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] duration-200"
        >
          Start Scan
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Ensure good lighting and hold your device steady for best results
        </p>
      </div>

      {/* Results Modal */}
      <ResultModal
        result={scanResult}
        isOpen={showResults}
        onClose={handleCloseResults}
      />
    </div>
  );
}

export default App;