import { useCallback } from 'react';

// Global event system for statistics refresh
const STATISTICS_REFRESH_EVENT = 'statistics-refresh';

export const useStatisticsRefresh = () => {
  const triggerRefresh = useCallback((type = 'admin') => {
    // Dispatch custom event that can be listened to by statistics components
    window.dispatchEvent(new CustomEvent(STATISTICS_REFRESH_EVENT, {
      detail: { type }
    }));
  }, []);

  const listenForRefresh = useCallback((callback) => {
    const handleRefresh = (event) => {
      callback(event.detail);
    };

    window.addEventListener(STATISTICS_REFRESH_EVENT, handleRefresh);

    // Return cleanup function
    return () => {
      window.removeEventListener(STATISTICS_REFRESH_EVENT, handleRefresh);
    };
  }, []);

  return {
    triggerRefresh,
    listenForRefresh
  };
};