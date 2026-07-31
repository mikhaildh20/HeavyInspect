'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScanLine, Keyboard, Camera, CameraOff } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export function ScannerView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [manualInput, setManualInput] = useState('');
  const [isManual, setIsManual] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const presetUnit = searchParams.get('unit');
    if (presetUnit) {
      router.replace(`/p2h/${encodeURIComponent(presetUnit)}`);
    }
  }, [searchParams, router]);

  const handleScan = (decodedText: string) => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    
    stopScanner();

    let unitId = decodedText.trim();
    try {
      const url = new URL(decodedText);
      const segments = url.pathname.split('/').filter(Boolean);
      unitId = segments[segments.length - 1] || unitId;
    } catch {
    }

    router.push(`/p2h/${encodeURIComponent(unitId)}`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
    }
  };

  const startScanner = async () => {
    if (!containerRef.current) return;
    
    try {
      setError(null);
      setIsScanning(true);
      
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Success - scan complete
          handleScan(decodedText);
        },
        () => {
          // Scan failure - ignore, keep scanning
        }
      );
    } catch (err) {
      console.error("Scanner error:", err);
        setError("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    scannerRef.current = null;
    setIsScanning(false);
    try {
      await scanner.stop();
    } catch { /* already stopped */ }
    try {
      scanner.clear();
    } catch { /* already removed */ }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // Start scanner when switching to camera mode
  useEffect(() => {
    if (!isManual && !isScanning) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanner();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isManual]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6">
      <div className="text-center mt-12 z-10">
        <h1 className="text-2xl font-bold text-white mb-2">Scan Unit</h1>
        <p className="text-gray-300">Arahkan kamera ke QR code pada chassis unit</p>
      </div>

      {!isManual ? (
        <div className="relative w-72 h-72 my-auto">
          {/* Real Camera Viewport */}
          <div 
            id="qr-reader" 
            ref={containerRef}
            className="absolute inset-0 rounded-2xl overflow-hidden"
          />
          
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg z-20" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg z-20" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg z-20" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg z-20" />
          
          {/* Simulated scan line */}
          {isScanning && (
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_2px_rgba(250,204,21,0.7)] animate-pulse z-30" />
          )}
          
          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 z-40">
              <CameraOff size={48} className="text-red-400 mb-4" />
              <p className="text-red-200 text-center text-sm">{error}</p>
            </div>
          )}
          
          {/* Loading overlay */}
          {!isScanning && !error && (
            <div className="absolute inset-0 bg-gray-800/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-40">
              <Camera size={48} className="text-primary opacity-50 mb-4 animate-pulse" />
              <p className="text-sm text-gray-400 px-8 text-center">
                Memulai kamera...
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-sm my-auto bg-gray-900 p-6 rounded-2xl border border-gray-700">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label htmlFor="unitId" className="block text-sm font-medium text-gray-300 mb-2">
                Kode Unit
              </label>
              <input
                id="unitId"
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="e.g. PC200-001"
                className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none uppercase"
                required
              />
            </div>
              <button type="submit" className="btn-primary w-full">
                Lanjut ke Form P2H
              </button>
          </form>
        </div>
      )}

      <div className="mb-24 z-10 flex gap-4 w-full max-w-xs">
        {!isManual ? (
          <>
            <button 
              onClick={() => {
                stopScanner();
                setIsManual(true);
              }} 
              className="btn-glove bg-gray-800 text-white flex-1 border border-gray-600"
            >
              Manual Input
            </button>
            <button 
              onClick={() => {
                stopScanner();
                setIsManual(true);
              }} 
              className="btn-glove bg-gray-800 text-white flex-none w-14 border border-gray-600"
              aria-label="Input Manual"
            >
              <Keyboard size={24} />
            </button>
          </>
        ) : (
          <button 
            onClick={() => {
              setIsManual(false);
              setError(null);
            }} 
            className="btn-glove bg-gray-800 text-white w-full border border-gray-600"
          >
            Kembali ke Scanner
          </button>
        )}
      </div>
    </div>
  );
}
