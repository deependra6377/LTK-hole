import React, { useRef, useEffect, useState } from 'react';
import { startCamera, stopCamera, captureFrame } from '../utils/cameraUtils';
import { calculatePolygonFit, validatePolygonFit } from '../utils/polygonUtils';
import { uploadScan } from '../api/scanService';
import { POLYGON_FRAMES, ProductType } from '../config';
import { ScanResult } from '../types';
import PolygonOverlay from './PolygonOverlay';
import CaptureButton from './CaptureButton';

interface CameraCaptureProps {
  productType: ProductType;
  onResult: (result: ScanResult) => void;
  onError: (error: string) => void;
}

export default function CameraCapture({ productType, onResult, onError }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [videoReady, setVideoReady] = useState(false);
  const [polygonFit, setPolygonFit] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    initCamera();
    return () => {
      if (streamRef.current) {
        stopCamera(streamRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (videoReady) {
      const interval = setInterval(checkPolygonFit, 500);
      return () => clearInterval(interval);
    }
  }, [videoReady, productType]);



  const initCamera = async () => {
    try {
      const stream = await startCamera();
      streamRef.current = stream;

      if (videoRef.current && !videoRef.current.srcObject) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err =>
          console.warn("Video play blocked:", err)
        );
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Camera access failed');
    }
  };


  const handleVideoReady = () => {
    if (videoRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;
      setDimensions({ width: videoWidth, height: videoHeight });
      setVideoReady(true);
    }
  };

  const checkPolygonFit = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const polygon = POLYGON_FRAMES[productType];
    const fit = calculatePolygonFit(imageData, polygon, canvas.width, canvas.height);
    
    setPolygonFit(fit);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || capturing) return;

    try {
      setCapturing(true);
      
      const imageBlob = await captureFrame(videoRef.current, canvasRef.current);
      const result = await uploadScan(imageBlob, productType);
      
      onResult(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Capture failed');
    } finally {
      setCapturing(false);
    }
  };

  const isValidFit = validatePolygonFit(polygonFit);
  const polygon = POLYGON_FRAMES[productType];

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={handleVideoReady}
        className="w-full h-full object-cover"
      />
      
      <canvas
        ref={canvasRef}
        className="hidden"
      />
      
      {videoReady && (
        <PolygonOverlay
          polygon={polygon}
          width={dimensions.width}
          height={dimensions.height}
          isValid={isValidFit}
        />
      )}
      
      <CaptureButton
        onCapture={handleCapture}
        disabled={!isValidFit || !videoReady}
        loading={capturing}
      />
      
      {/* Debug info (remove in production) */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
        Fit: {polygonFit.toFixed(1)}%
      </div>
    </div>
  );
}