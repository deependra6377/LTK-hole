export const API_URL = "http://192.168.0.106:8000";

export const POLYGON_FRAMES = {
  briefs: [[0.1, 0.0], [0.9, 0.0], [1.0, 0.7], [0.0, 0.7]],
  boxers: [[0.05, 0.0], [0.95, 0.0], [0.95, 0.9], [0.05, 0.9]],
  bikini: [[0.15, 0.0], [0.85, 0.0], [0.9, 0.6], [0.1, 0.6]],
  thong: [[0.2, 0.0], [0.8, 0.0], [0.85, 0.5], [0.15, 0.5]]
};

export const PRODUCT_TYPES = [
  { value: 'briefs', label: 'Briefs' },
  { value: 'boxers', label: 'Boxers' },
  { value: 'bikini', label: 'Bikini' },
  { value: 'thong', label: 'Thong' }
] as const;

export type ProductType = keyof typeof POLYGON_FRAMES;