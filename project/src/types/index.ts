export interface ScanResult {
  hole_detected: boolean;
  hole_area_mm2?: number;
  discount?: string;
  file?: string;
  message?: string;
}

export interface CaptureData {
  imageBlob: Blob;
  productType: string;
  polygonFit: number;
}

export interface Point {
  x: number;
  y: number;
}