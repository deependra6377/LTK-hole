import React from 'react';
import { X, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { ScanResult } from '../types';

interface ResultModalProps {
  result: ScanResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResultModal({ result, isOpen, onClose }: ResultModalProps) {
  const [copied, setCopied] = React.useState(false);

  const copyDiscountCode = () => {
    if (result?.discount) {
      navigator.clipboard.writeText(result.discount);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-sm w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-6 pt-12">
          {result.hole_detected ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Hole Detected!
              </h3>
              
              <p className="text-gray-600 mb-4">
                We found a hole in your innerwear
              </p>
              
              {result.hole_area_mm2 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">Hole Size</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {result.hole_area_mm2.toFixed(1)} mm²
                  </p>
                </div>
              )}
              
              {result.discount && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 mb-4">
                  <p className="text-white text-sm font-medium mb-2">
                    Your Discount Code
                  </p>
                  <div className="flex items-center justify-between bg-white bg-opacity-20 rounded px-3 py-2">
                    <span className="text-white font-bold text-lg">
                      {result.discount}
                    </span>
                    <button
                      onClick={copyDiscountCode}
                      className="p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  {copied && (
                    <p className="text-white text-xs mt-1 opacity-75">
                      Copied to clipboard!
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Hole Detected
              </h3>
              
              <p className="text-gray-600">
                Your innerwear looks good! No holes were found.
              </p>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white rounded-lg py-3 font-medium hover:bg-gray-800 transition-colors mt-6"
          >
            Scan Another Item
          </button>
        </div>
      </div>
    </div>
  );
}