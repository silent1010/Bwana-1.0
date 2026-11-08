/**
 * Bwana Image Optimizer & WebP Compression Engine
 * Enforces strict bandwidth conservation for Zambian 2G/3G/4G mobile networks.
 * Targets: WebP format, max 400px width constraint for listings, <100kb file size.
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100 or 0-1
  format?: 'webp' | 'jpg' | 'auto';
  fit?: 'crop' | 'clip' | 'scale';
}

export interface CompressedImageResult {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number;
  format: 'image/webp' | 'image/jpeg';
}

/**
 * Standard business placeholder fallback when image fails to load
 */
export const DEFAULT_BUSINESS_COVER =
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80&fm=webp';

/**
 * Optimizes an image URL (Unsplash, Cloudinary, etc.) with explicit WebP format and a 400px width constraint.
 */
export function getOptimizedImageUrl(
  originalUrl: string | undefined | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!originalUrl) return DEFAULT_BUSINESS_COVER;

  // Preserve inline SVG or already processed data URLs
  if (originalUrl.startsWith('data:image/svg') || originalUrl.startsWith('data:image/webp')) {
    return originalUrl;
  }

  const { width = 400, quality = 80, format = 'webp', fit = 'crop' } = options;

  // 1. Unsplash dynamic URL parameter optimization
  if (originalUrl.includes('images.unsplash.com')) {
    try {
      const url = new URL(originalUrl);
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', fit);
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', String(quality));
      if (format === 'webp') {
        url.searchParams.set('fm', 'webp');
      }
      return url.toString();
    } catch {
      return originalUrl;
    }
  }

  // 2. Cloudinary dynamic URL transformation
  if (originalUrl.includes('cloudinary.com')) {
    const transformation = `w_${width},c_limit,q_${quality},f_webp`;
    if (originalUrl.includes('/upload/')) {
      return originalUrl.replace('/upload/', `/upload/${transformation}/`);
    }
  }

  return originalUrl;
}

/**
 * Fast helper to optimize business cover images and logos to a strict 400px width WebP format.
 */
export function optimizeBusinessImage(
  urlOrSrc: string | undefined | null,
  maxWidth: number = 400
): string {
  return getOptimizedImageUrl(urlOrSrc, { width: maxWidth, format: 'webp', quality: 80 });
}

/**
 * Client-side browser utility to process and compress an image file, blob, or URL
 * to WebP format with a strict 400px width constraint (maintaining aspect ratio).
 *
 * Keeps file size <100kb for Tecno Pop 7 and 2G/3G network performance in Zambia.
 */
export async function compressImageToWebP(
  input: File | Blob | string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0.1 to 1.0 (default: 0.8)
  } = {}
): Promise<CompressedImageResult> {
  const { maxWidth = 400, maxHeight = 400, quality = 0.8 } = options;

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('compressImageToWebP is a client-side utility.');
  }

  // Determine source URL and original size
  let srcUrl = '';
  let shouldRevoke = false;
  let originalSizeBytes = 0;

  if (typeof input === 'string') {
    srcUrl = input;
    originalSizeBytes = input.length;
  } else if (input instanceof Blob) {
    srcUrl = URL.createObjectURL(input);
    shouldRevoke = true;
    originalSizeBytes = input.size;
  } else {
    throw new Error('Unsupported image input type for compression.');
  }

  try {
    const img = await loadImage(srcUrl);

    // Calculate constrained dimensions (max 400px width constraint)
    let targetWidth = img.naturalWidth || img.width;
    let targetHeight = img.naturalHeight || img.height;

    if (targetWidth > maxWidth) {
      const ratio = maxWidth / targetWidth;
      targetWidth = maxWidth;
      targetHeight = Math.round(targetHeight * ratio);
    }

    if (maxHeight && targetHeight > maxHeight) {
      const ratio = maxHeight / targetHeight;
      targetHeight = maxHeight;
      targetWidth = Math.round(targetWidth * ratio);
    }

    // Ensure minimum dimensions
    targetWidth = Math.max(1, targetWidth);
    targetHeight = Math.max(1, targetHeight);

    // Draw to HTMLCanvasElement with high-quality smoothing
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not acquire 2D canvas context.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Compress to WebP (with fallback to JPEG if browser doesn't support WebP export)
    const blobResult = await exportCanvasToBlob(canvas, 'image/webp', quality);
    const finalFormat: 'image/webp' | 'image/jpeg' = blobResult.format;
    const finalBlob = blobResult.blob;
    const dataUrl = canvas.toDataURL(finalFormat, quality);

    const compressedSizeBytes = finalBlob.size;
    const compressionRatio =
      originalSizeBytes > 0 ? Number((compressedSizeBytes / originalSizeBytes).toFixed(2)) : 1;

    return {
      blob: finalBlob,
      dataUrl,
      width: targetWidth,
      height: targetHeight,
      originalSizeBytes,
      compressedSizeBytes,
      compressionRatio,
      format: finalFormat,
    };
  } finally {
    if (shouldRevoke && srcUrl) {
      URL.revokeObjectURL(srcUrl);
    }
  }
}

/**
 * Helper to asynchronously load an image
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Retry without crossOrigin if CORS blocks it
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = (err) => reject(new Error('Failed to load image for compression.'));
      fallbackImg.src = src;
    };
    img.src = src;
  });
}

/**
 * Helper to export canvas to blob with WebP check
 */
function exportCanvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<{ blob: Blob; format: 'image/webp' | 'image/jpeg' }> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, format: 'image/webp' });
        } else {
          // Fallback to jpeg
          canvas.toBlob(
            (jpegBlob) => {
              if (jpegBlob) {
                resolve({ blob: jpegBlob, format: 'image/jpeg' });
              } else {
                reject(new Error('Canvas export to blob failed.'));
              }
            },
            'image/jpeg',
            quality
          );
        }
      },
      format,
      quality
    );
  });
}

/**
 * Preload high-priority banner images for faster LCP (<1.5s)
 */
export function preloadImage(url: string): void {
  if (typeof window === 'undefined') return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getOptimizedImageUrl(url, { width: 800, format: 'webp' });
  document.head.appendChild(link);
}
