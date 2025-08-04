import React from 'react';
import { Camera, Loader } from 'lucide-react';

interface CaptureButtonProps {
  onCapture: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function CaptureButton({ onCapture, disabled, loading }: CaptureButtonProps) {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
      <button
        onClick={onCapture}
        disabled={disabled || loading}
        className={`
          w-20 h-20 rounded-full border-4 border-white shadow-2xl
          flex items-center justify-center transition-all duration-200
          ${disabled || loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700 active:scale-95'
          }
        `}
      >
        {loading ? (
          <Loader className="w-8 h-8 text-white animate-spin" />
        ) : (
          <Camera className="w-8 h-8 text-white" />
        )}
      </button>
      
      {disabled && !loading && (
        <p className="text-white text-xs text-center mt-2 bg-black bg-opacity-50 rounded px-2 py-1">
          Position item properly
        </p>
      )}
    </div>
  );
}