'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, X, Check, RotateCcw } from 'lucide-react';
import { compressImage, getFileSizeKB } from '@/lib/imageCompression';

interface PhotoCaptureProps {
  onCapture: (photoBase64: string) => void;
  onCancel?: () => void;
  compact?: boolean;
}

export function PhotoCapture({ onCapture, onCancel, compact }: PhotoCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      setError(null);
      setIsOpen(true);
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsOpen(false);
    setPreview(null);
  }, [stream]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const rawPhoto = canvas.toDataURL('image/jpeg', 1.0);
      const rawSize = getFileSizeKB(rawPhoto);
      
      const compressedPhoto = await compressImage(rawPhoto, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
        outputFormat: 'jpeg',
      });
      
      const compressedSize = getFileSizeKB(compressedPhoto);
      console.log(`Photo compressed: ${rawSize}KB → ${compressedSize}KB (${Math.round((1 - compressedSize/rawSize) * 100)}% reduction)`);
      
      setPreview(compressedPhoto);
    }
  };

  const confirmPhoto = () => {
    if (preview) {
      onCapture(preview);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setPreview(null);
  };

  const handleCancel = () => {
    stopCamera();
    onCancel?.();
  };

  useEffect(() => {
    startCamera();
  }, []);

  return (
    <>
      {/* Camera Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
          {/* Header */}
          <div className="bg-gray-900 p-4 flex items-center justify-between">
            <h3 className="text-white font-semibold">Ambil Foto</h3>
            <button
              onClick={handleCancel}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Camera View / Preview */}
          <div className="flex-1 relative overflow-hidden">
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gray-900">
                <Camera size={64} className="text-gray-600 mb-4" />
                <p className="text-gray-400 text-center mb-6">{error}</p>
                <button
                  onClick={startCamera}
                  className="btn-glove bg-primary text-black px-6"
                >
                  Coba Lagi
                </button>
              </div>
            ) : preview ? (
              // Photo Preview
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              // Live Camera Feed
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Viewfinder overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/30 rounded-lg" />
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="bg-gray-900 p-6">
            {preview ? (
              // Preview controls
              <div className="flex gap-4">
                <button
                  onClick={retakePhoto}
                  className="flex-1 btn-glove bg-gray-700 text-white border border-gray-600"
                >
                  <RotateCcw size={20} className="mr-2" />
                  Ulangi
                </button>
                <button
                  onClick={confirmPhoto}
                  className="flex-1 btn-glove bg-success text-white"
                >
                  <Check size={20} className="mr-2" />
                  Gunakan Foto
                </button>
              </div>
            ) : (
              // Capture controls
              <div className="flex justify-center">
                <button
                  onClick={capturePhoto}
                  disabled={!!error}
                  className="w-20 h-20 rounded-full bg-white border-4 border-gray-600 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
                >
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-300" />
                </button>
              </div>
            )}
          </div>

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Trigger Button (when modal is closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={startCamera}
          className={compact
            ? 'p-1 bg-gray-700 hover:bg-gray-600 rounded text-white border border-gray-500'
            : 'btn-glove bg-gray-700 hover:bg-gray-600 text-white border border-gray-500 px-6'
          }
        >
          <Camera size={compact ? 14 : 20} className={compact ? '' : 'mr-2'} />
          {!compact && 'Ambil Foto'}
        </button>
      )}
    </>
  );
}
