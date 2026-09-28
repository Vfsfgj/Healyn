/**
 * Compress an image file to a lightweight data URL (JPEG/WebP)
 * to prevent QuotaExceededError in localStorage/sessionStorage.
 * Handles high-resolution studio photos, PNG transparency (white matting),
 * and bicubic downscaling for crisp display.
 */
export function compressImageFile(
  file: File,
  maxDimension: number = 1000,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    // If not an image, fallback immediately
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    let objectUrl = '';
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      objectUrl = '';
    }

    const fallbackToFileReader = () => {
      if (objectUrl) {
        try { URL.revokeObjectURL(objectUrl); } catch {}
      }
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    };

    if (!objectUrl) {
      fallbackToFileReader();
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onerror = () => {
      fallbackToFileReader();
    };

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          fallbackToFileReader();
          return;
        }

        // Downscale proportionally if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false });

        if (!ctx) {
          fallbackToFileReader();
          return;
        }

        // Matting with white background to prevent transparent PNGs from turning black
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for optimal size/quality ratio, fallback to JPEG
        let compressedDataUrl = '';
        try {
          compressedDataUrl = canvas.toDataURL('image/webp', quality);
          if (!compressedDataUrl.startsWith('data:image/webp')) {
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        try { URL.revokeObjectURL(objectUrl); } catch {}
        resolve(compressedDataUrl);
      } catch {
        fallbackToFileReader();
      }
    };

    img.src = objectUrl;
  });
}
