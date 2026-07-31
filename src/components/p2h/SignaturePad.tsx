'use client';

import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
  onSign: (dataUrl: string | null) => void;
}

export function SignaturePad({ onSign }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const handleEnd = () => {
    if (sigCanvas.current) {
      onSign(sigCanvas.current.isEmpty() ? null : sigCanvas.current.toDataURL());
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      onSign(null);
    }
  };

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-200">
      <SignatureCanvas
        ref={sigCanvas}
        penColor="black"
        canvasProps={{ className: 'w-full h-48 cursor-crosshair touch-none', style: { width: '100%', height: '192px' } }}
        onEnd={handleEnd}
      />
      <div className="bg-gray-300 p-2 flex justify-between items-center border-t border-gray-400">
        <span className="text-xs text-gray-600 font-medium">Tanda Tangan di sini</span>
        <button 
          onClick={handleClear} 
          className="text-sm bg-gray-400 text-white font-semibold px-3 py-1 rounded hover:bg-gray-500 transition-colors"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
