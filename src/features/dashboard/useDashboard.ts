import { useState, useEffect } from 'react';
import { fetchDashboardData, type DashboardResponse } from '@/lib/axios';

/**
 * Custom hook to handle fetching and state management for the user dashboard data.
 */
export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getDetails() {
      try {
        setLoading(true);
        const data = await fetchDashboardData();
        console.log('dashboard payload:', data); // ← add this
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }

    void getDetails();
  }, []);

  return {
    dashboardData,
    loading,
    error,
  };
}
