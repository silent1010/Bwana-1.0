import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, HardDriveDownload } from 'lucide-react';
import {
  getOfflineCacheMetadata,
  formatCachedTimestamp,
  saveBusinessesToOfflineCache
} from '../../services/offlineCache';
import { Business } from '../../types';

interface OfflineCacheBannerProps {
  businesses: Business[];
  isLiveConnected: boolean;
  onRefreshLive?: () => void;
}

export const OfflineCacheBanner: React.FC<OfflineCacheBannerProps> = ({
  businesses,
  isLiveConnected,
  onRefreshLive,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [cachedMeta, setCachedMeta] = useState(() => getOfflineCacheMetadata());
  const [showManualSyncFeedback, setShowManualSyncFeedback] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setCachedMeta(getOfflineCacheMetadata());
    };
    const handleOffline = () => {
      setIsOnline(false);
      setCachedMeta(getOfflineCacheMetadata());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check for cache metadata
    const interval = setInterval(() => {
      setCachedMeta(getOfflineCacheMetadata());
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Update cached metadata when businesses array updates
  useEffect(() => {
    if (businesses && businesses.length > 0) {
      setCachedMeta(getOfflineCacheMetadata());
    }
  }, [businesses]);

  const handleManualCacheSave = () => {
    if (businesses && businesses.length > 0) {
      saveBusinessesToOfflineCache(businesses);
      setCachedMeta(getOfflineCacheMetadata());
      setShowManualSyncFeedback(true);
      setTimeout(() => setShowManualSyncFeedback(false), 3000);
    }
  };

  const handleRetryConnection = () => {
    setIsRefreshing(true);
    if (onRefreshLive) {
      onRefreshLive();
    }
    setTimeout(() => {
      setIsRefreshing(false);
      setCachedMeta(getOfflineCacheMetadata());
    }, 1200);
  };

  // If completely offline (navigator.onLine is false or live connection dropped while offline)
  const isEffectivelyOffline = !isOnline || !isLiveConnected;

  if (isEffectivelyOffline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-amber-900/95 border-b border-amber-700/80 text-amber-100 px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-200"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-amber-800 flex items-center justify-center text-amber-300 shrink-0">
            <WifiOff className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-white mr-1.5">Offline Directory Mode:</span>
            <span>
              Browsing {cachedMeta?.businessCount || businesses.length} businesses from local offline cache.
            </span>
            <span className="text-amber-300 ml-1.5 opacity-90 hidden sm:inline">
              (Last synced: {formatCachedTimestamp(cachedMeta?.cachedAt || null)})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRetryConnection}
            disabled={isRefreshing}
            className="px-3 py-1 bg-amber-800 hover:bg-amber-700 active:bg-amber-900 text-amber-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-600/70"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Reconnecting...' : 'Retry Connection'}</span>
          </button>
        </div>
      </div>
    );
  }

  // When online, show a subtle pill or helper banner if user saved cache
  if (showManualSyncFeedback) {
    return (
      <div className="bg-emerald-900 border-b border-emerald-700 text-emerald-100 px-4 py-1.5 text-xs flex items-center justify-between animate-in fade-in">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Offline directory updated! {businesses.length} businesses saved to device for offline browsing.</span>
        </div>
        <span className="text-[11px] font-mono text-emerald-300">Available without internet</span>
      </div>
    );
  }

  return null;
};
