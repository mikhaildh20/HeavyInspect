export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'jpeg' | 'webp';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  outputFormat: 'jpeg',
};

export function compressImage(
  base64Input: string,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      if (width > opts.maxWidth! || height > opts.maxHeight!) {
        const ratio = Math.min(opts.maxWidth! / width, opts.maxHeight! / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      const mimeType = opts.outputFormat === 'webp' ? 'image/webp' : 'image/jpeg';
      const compressed = canvas.toDataURL(mimeType, opts.quality);
      
      resolve(compressed);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64Input;
  });
}

export function getFileSizeKB(base64: string): number {
  const base64Clean = base64.replace(/^data:image\/\w+;base64,/, '');
  const decoded = atob(base64Clean);
  return Math.round(decoded.length / 1024);
}
