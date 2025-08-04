import { Point } from '../types';

export function createPolygonPath(points: number[][], width: number, height: number): string {
  const scaledPoints = points.map(([x, y]) => `${x * width},${y * height}`);
  return `M ${scaledPoints.join(' L ')} Z`;
}

export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  const { x, y } = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

export function calculatePolygonFit(
  imageData: ImageData,
  polygon: number[][],
  width: number,
  height: number
): number {
  const polygonPoints: Point[] = polygon.map(([x, y]) => ({
    x: x * width,
    y: y * height
  }));
  
  let totalPixels = 0;
  let filledPixels = 0;
  
  // Sample pixels to check polygon coverage
  const step = 4; // Check every 4th pixel for performance
  
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (isPointInPolygon({ x, y }, polygonPoints)) {
        totalPixels++;
        
        // Check if pixel has significant content (not just background)
        const pixelIndex = (y * width + x) * 4;
        const r = imageData.data[pixelIndex];
        const g = imageData.data[pixelIndex + 1];
        const b = imageData.data[pixelIndex + 2];
        const brightness = (r + g + b) / 3;
        
        // Consider pixel "filled" if it's not too bright (not background)
        if (brightness < 200) {
          filledPixels++;
        }
      }
    }
  }
  
  return totalPixels > 0 ? (filledPixels / totalPixels) * 100 : 0;
}

export function validatePolygonFit(fit: number): boolean {
  return fit >= 70;
}