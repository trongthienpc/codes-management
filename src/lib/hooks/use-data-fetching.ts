// src/lib/hooks/use-data-fetching.ts
import useSWR from "swr";
import { useCallback } from "react";

export function useDataFetching<T>(
  url: string | null,
  fetcher: (url: string) => Promise<T>,
  options?: {
    revalidateOnFocus?: boolean;
    refreshInterval?: number;
  }
) {
  const { data, error, mutate, isLoading, isValidating } = useSWR<T>(
    url,
    fetcher,
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      refreshInterval: options?.refreshInterval,
      dedupingInterval: 5000,
      revalidateIfStale: false,
    }
  );

  const refreshData = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return {
    data,
    error,
    mutate,
    isLoading,
    isValidating,
    refreshData,
  };
}
