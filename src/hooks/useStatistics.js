import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useStatisticsRefresh } from './useStatisticsRefresh';

export const useStatistics = (type = 'admin', refreshInterval = 60000) => {
  const [statistics, setStatistics] = useState({
    totalPending: 0,
    totalProcessing: 0,
    totalReleased: 0,
    totalDecline: 0,
    totalReadyForPickup: 0,
    totalProcessedToday: 0,
    totalRequests: 0,
    totalStudent: 0,
    totalAlumni: 0,
    completionRate: 0,
    myPendingRequests: 0,
    myProcessingRequests: 0,
    myReleasedDocuments: 0,
    myDeclineRequests: 0,
    myReadyForPickup: 0,
    myCompletionRate: 0,
    byStatus: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatistics = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError('');

      const token = type === 'admin'
        ? localStorage.getItem('adminToken')
        : localStorage.getItem('staffToken');

      console.log(`Fetching ${type} statistics:`, {
        hasToken: !!token,
        tokenType: type,
        endpoint: type === 'admin' ? '/api/admin/stats' : '/api/staff/stats'
      });

      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const endpoint = type === 'admin'
        ? '/api/admin/stats'
        : '/api/staff/stats';

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`API Response for ${type}:`, response.data);

      if (response.data.success) {
        console.log(`Successfully loaded ${type} statistics:`, response.data.data);
        setStatistics(response.data.data);
      } else {
        console.error(`API Error for ${type}:`, response.data.message);
        setError(response.data.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError(error.response?.data?.message || 'Failed to fetch statistics');

      // Set default values on error
      setStatistics({
        totalPending: 0,
        totalProcessing: 0,
        totalReleased: 0,
        totalDecline: 0,
        totalReadyForPickup: 0,
        totalProcessedToday: 0,
        totalRequests: 0,
        totalStudent: 0,
        totalAlumni: 0,
        completionRate: 0,
        myPendingRequests: 0,
        myProcessingRequests: 0,
        myReleasedDocuments: 0,
        myDeclineRequests: 0,
        myReadyForPickup: 0,
        myCompletionRate: 0,
        byStatus: {}
      });
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [type]);

  // Listen for manual refresh events
  const { listenForRefresh } = useStatisticsRefresh();

  useEffect(() => {
    fetchStatistics();

    // Set up auto-refresh interval
    const interval = setInterval(fetchStatistics, refreshInterval);

    // Listen for manual refresh events
    const cleanupRefreshListener = listenForRefresh((event) => {
      // Only refresh if the event type matches our statistics type
      if (event.type === type) {
        fetchStatistics(false); // Don't show loading state for manual refreshes
      }
    });

    // Cleanup
    return () => {
      clearInterval(interval);
      cleanupRefreshListener();
    };
  }, [fetchStatistics, refreshInterval, type, listenForRefresh]);

  return {
    statistics,
    loading,
    error,
    refreshStatistics: fetchStatistics
  };
};