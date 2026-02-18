import React, { useEffect, useState } from 'react';
import { storageService } from '../../services/storageService';
import { Loader2, ImageOff } from 'lucide-react';

const SIGNED_URL_TTL_MS = 55 * 60 * 1000;
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

interface StorageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  path?: string | null;
  fallbackSrc?: string;
  showLoading?: boolean;
}

export const StorageImage: React.FC<StorageImageProps> = ({ 
  path, 
  fallbackSrc,
  className = '', 
  alt,
  showLoading = true,
  loading: imgLoading,
  decoding: imgDecoding,
  fetchPriority,
  ...props 
}) => {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadSrc = async () => {
      setLoading(true);
      if (!path) {
        setSrc(fallbackSrc || null);
        setLoading(false);
        return;
      }
      
      // If it's already a full URL (e.g. Google avatar or blob preview)
      if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
        setSrc(path);
        setLoading(false);
        return;
      }

      try {
        const cached = signedUrlCache.get(path);
        if (cached && cached.expiresAt > Date.now()) {
          setSrc(cached.url);
          setLoading(false);
          return;
        }

        const url = await storageService.getSignedUrl(path);
        if (isMounted) setSrc(url);
        if (url) {
          signedUrlCache.set(path, { url, expiresAt: Date.now() + SIGNED_URL_TTL_MS });
        }
      } catch (err) {
        console.error("Failed to load image", err);
        if (isMounted) setSrc(fallbackSrc || null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSrc();
    return () => { isMounted = false; };
  }, [path, fallbackSrc]);

  if (loading && showLoading) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 ${className}`}>
        <Loader2 className="animate-spin text-slate-300" size={20} />
      </div>
    );
  }

  if (!src) {
     return (
       <div className={`flex items-center justify-center bg-slate-100 text-slate-300 ${className}`}>
         <ImageOff size={24} />
       </div>
     );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={imgLoading || 'lazy'}
      decoding={imgDecoding || 'async'}
      fetchPriority={fetchPriority}
      {...props}
    />
  );
};