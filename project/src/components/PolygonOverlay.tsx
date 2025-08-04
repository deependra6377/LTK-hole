import React from 'react';
import { createPolygonPath } from '../utils/polygonUtils';

interface PolygonOverlayProps {
  polygon: number[][];
  width: number;
  height: number;
  isValid: boolean;
}

export default function PolygonOverlay({ polygon, width, height, isValid }: PolygonOverlayProps) {
  const pathData = createPolygonPath(polygon, width, height);
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg 
        width={width} 
        height={height} 
        className="absolute inset-0"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Background overlay */}
        <defs>
          <mask id="polygon-mask">
            <rect width="100%" height="100%" fill="black" />
            <path d={pathData} fill="white" />
          </mask>
        </defs>
        
        {/* Dark overlay outside polygon */}
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(0, 0, 0, 0.6)" 
          mask="url(#polygon-mask)" 
        />
        
        {/* Polygon border */}
        <path
          d={pathData}
          fill="none"
          stroke={isValid ? "#10b981" : "#ef4444"}
          strokeWidth="3"
          strokeDasharray="10,5"
          className="animate-pulse"
        />
        
        {/* Corner indicators */}
        {polygon.map(([x, y], index) => (
          <circle
            key={index}
            cx={x * width}
            cy={y * height}
            r="8"
            fill={isValid ? "#10b981" : "#ef4444"}
            stroke="white"
            strokeWidth="2"
            className="animate-pulse"
          />
        ))}
      </svg>
      
      {/* Instructions */}
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-black bg-opacity-70 rounded-lg p-3">
          <p className="text-white text-sm font-medium text-center">
            Align your innerwear within the frame
          </p>
          <div className="flex items-center justify-center mt-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-white text-xs">
              {isValid ? 'Ready to capture' : 'Position item properly'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}