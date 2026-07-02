// Data-layer seam: every hook in src/hooks/data returns this React Query-compatible
// shape so views don't change when the mock source is swapped for useQuery + a real API.
export interface DataResult<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
}

export function mockResult<T>(data: T): DataResult<T> {
  return { data, isLoading: false, error: null };
}
