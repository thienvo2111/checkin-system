'use client';

import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  isScanning: boolean;
}

export default function QRScanner({ onScan, isScanning }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanningError, setScanningError] = useState('');
  const lastScannedRef = useRef('');

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setScanningError('');
        }
      } catch (error) {
        setScanningError('Không thể truy cập camera. Vui lòng kiểm tra quyền.');
        console.error('Camera error:', error);
      }
    };

    if (isScanning) {
      startCamera();
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [isScanning]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const context = canvasRef.current.getContext('2d', { willReadFrequently: true });
        if (context && videoRef.current.readyState === 4) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;

          context.drawImage(videoRef.current, 0, 0);
          const imageData = context.getImageData(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code && code.data !== lastScannedRef.current) {
            lastScannedRef.current = code.data;
            onScan(code.data);
          }
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isScanning, onScan]);

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-md mx-auto bg-black rounded-xl overflow-hidden aspect-square shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Scanning frame */}
        <div className="absolute inset-0 border-4 border-teal-400 m-8 rounded-lg pointer-events-none shadow-lg" />
        
        {/* Corner indicators */}
        <div className="absolute top-8 left-8 w-6 h-6 border-t-4 border-l-4 border-teal-400"></div>
        <div className="absolute top-8 right-8 w-6 h-6 border-t-4 border-r-4 border-teal-400"></div>
        <div className="absolute bottom-8 left-8 w-6 h-6 border-b-4 border-l-4 border-teal-400"></div>
        <div className="absolute bottom-8 right-8 w-6 h-6 border-b-4 border-r-4 border-teal-400"></div>
      </div>

      {scanningError && (
        <div className="bg-red-500 text-white p-4 rounded-lg text-center">
          {scanningError}
        </div>
      )}
    </div>
  );
}
