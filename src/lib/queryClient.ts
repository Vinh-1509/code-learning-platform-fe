import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Shared QueryClient instance.
 * Import this wherever you need direct cache access outside of React
 * (e.g. route guards, Axios interceptors).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Data is considered fresh for 60 seconds.
       * Individual query hooks can override this with a tighter or looser value.
       */
      staleTime: 60_000,

      /**
       * Keep unused query results in memory for 5 minutes before GC.
       */
      gcTime: 5 * 60_000,

      /**
       * Smart retry logic:
       *  - Never retry 401 (session expired) or 404 (resource doesn't exist).
       *  - Retry everything else up to 2 times.
       */
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 401 || status === 404) return false;
        }
        return failureCount < 2;
      },

      /**
       * Do not propagate query errors to the nearest error boundary by default.
       * Let each query hook / component decide how to handle errors.
       */
      throwOnError: false,
    },

    mutations: {
      /**
       * Global fallback: log unexpected mutation errors in development.
       * Feature-level `onError` handlers take priority and should handle
       * user-facing feedback (toasts, inline messages, etc.).
       */
      onError: (error) => {
        if (import.meta.env.DEV) {
          console.error('[Mutation Error]', error);
        }
      },
    },
  },
});
