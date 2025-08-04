import { API_URL } from '../config';
import { ScanResult } from '../types';

export async function uploadScan(imageBlob: Blob, productType: string): Promise<ScanResult> {
  try {
    const formData = new FormData();
    formData.append('file', imageBlob, 'scan.jpg');
    formData.append('product_type', productType);

    const response = await fetch(`${API_URL}/scan`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload scan. Please try again.');
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}