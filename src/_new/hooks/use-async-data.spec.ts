import { renderHook, waitFor } from '@testing-library/react';
import { useAsyncData } from './use-async-data';

describe('useAsyncData', () => {
  const mockData = { id: 1, name: 'Test Data' };
  const mockDataUpdated = { id: 2, name: 'Updated Data' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data on mount', async () => {
    const fetchFunction = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useAsyncData(fetchFunction));

    expect(fetchFunction).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });
  });

  it('should return null data initially', () => {
    const fetchFunction = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useAsyncData(fetchFunction));

    expect(result.current.data).toBeNull();
  });

  it('should provide a refresh function', async () => {
    const fetchFunction = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useAsyncData(fetchFunction));

    expect(result.current.refresh).toBeDefined();
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should refetch data when refresh is called', async () => {
    const fetchFunction = jest.fn()
      .mockResolvedValueOnce(mockData)
      .mockResolvedValueOnce(mockDataUpdated);

    const { result } = renderHook(() => useAsyncData(fetchFunction));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(fetchFunction).toHaveBeenCalledTimes(1);

    // Call refresh
    result.current.refresh();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockDataUpdated);
    });

    expect(fetchFunction).toHaveBeenCalledTimes(2);
  });

  it('should refetch when fetch function changes', async () => {
    const fetchFunction1 = jest.fn().mockResolvedValue(mockData);

    const { result, rerender } = renderHook(
      ({ fn }) => useAsyncData(fn),
      {
        initialProps: { fn: fetchFunction1 },
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(fetchFunction1).toHaveBeenCalledTimes(1);

    // Change fetch function
    const fetchFunction2 = jest.fn().mockResolvedValue(mockDataUpdated);

    rerender({ fn: fetchFunction2 });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockDataUpdated);
    });

    expect(fetchFunction1).toHaveBeenCalledTimes(1);
    expect(fetchFunction2).toHaveBeenCalledTimes(1);
  });

  it('should maintain stable refresh function reference', async () => {
    const fetchFunction = jest.fn().mockResolvedValue(mockData);

    const { result, rerender } = renderHook(() => useAsyncData(fetchFunction));

    const firstRefresh = result.current.refresh;

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    rerender();

    const secondRefresh = result.current.refresh;

    expect(firstRefresh).toBe(secondRefresh);
  });

  it('should set isLoading to true initially and false after data is loaded', async () => {
    const fetchFunction = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useAsyncData(fetchFunction));

    // Initially should be loading
    expect(result.current.isLoading).toBe(true);

    // After data is fetched, should not be loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('should set isLoading to true when refresh is called', async () => {
    const fetchFunction = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useAsyncData(fetchFunction));

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Setup a delayed response to test loading state
    let resolvePromise: (value: typeof mockData) => void;
    const delayedPromise = new Promise<typeof mockData>((resolve) => {
      resolvePromise = resolve;
    });
    
    fetchFunction.mockReturnValueOnce(delayedPromise);

    // Call refresh
    result.current.refresh();

    // Should be loading immediately after refresh
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Resolve the promise
    resolvePromise!(mockData);

    // Should eventually complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should set isLoading to false even when fetch fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const fetchFunction = jest.fn().mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useAsyncData(fetchFunction));

    // Initially should be loading
    expect(result.current.isLoading).toBe(true);

    // After error, should not be loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    consoleErrorSpy.mockRestore();
  });

  it('should set error state when fetch fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const testError = new Error('Network error');
    const fetchFunction = jest.fn().mockRejectedValue(testError);

    const { result } = renderHook(() => useAsyncData(fetchFunction));

    // Initially should have no error
    expect(result.current.error).toBeNull();

    // After fetch fails, should have error
    await waitFor(() => {
      expect(result.current.error).toBe(testError);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it('should clear error on successful fetch', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // First fetch fails
    const fetchFunction = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useAsyncData(fetchFunction));

    // Wait for error to be set
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error?.message).toBe('Network error');

    // Second fetch succeeds
    result.current.refresh();

    // Error should be cleared on successful fetch
    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it('should set error to null initially', () => {
    const fetchFunction = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useAsyncData(fetchFunction));

    expect(result.current.error).toBeNull();
  });

  it('should maintain error state until next fetch', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const testError = new Error('Persistent error');
    const fetchFunction = jest.fn().mockRejectedValue(testError);

    const { result, rerender } = renderHook(() => useAsyncData(fetchFunction));

    await waitFor(() => {
      expect(result.current.error).toBe(testError);
    });

    // Rerender shouldn't clear error
    rerender();

    expect(result.current.error).toBe(testError);

    consoleErrorSpy.mockRestore();
  });

  it('should work with different data types', async () => {
    const numberData = 42;
    const fetchFunction = jest.fn().mockResolvedValue(numberData);

    const { result } = renderHook(() => useAsyncData<number>(fetchFunction));

    await waitFor(() => {
      expect(result.current.data).toBe(numberData);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should work with array data', async () => {
    const arrayData = [1, 2, 3, 4, 5];
    const fetchFunction = jest.fn().mockResolvedValue(arrayData);

    const { result } = renderHook(() => useAsyncData<number[]>(fetchFunction));

    await waitFor(() => {
      expect(result.current.data).toEqual(arrayData);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  /*it('should pass parameters to fetch function', async () => {
    const mockFetch = jest.fn().mockResolvedValue(mockData);
    const param1 = 'test-param';
    const param2 = 123;

    const { result } = renderHook(() => 
      useAsyncData(() => mockFetch(param1, param2))
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(param1, param2);
  });*/

  it('should not refetch when unrelated props change but fetch function is stable', async () => {
    const fetchFunction = jest.fn().mockResolvedValue(mockData);
    let otherProp = 'value1';

    const { result, rerender } = renderHook(
      ({ other }) => {
        // fetchFunction is stable, other prop is unrelated
        return useAsyncData(fetchFunction);
      },
      {
        initialProps: { other: otherProp },
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    expect(fetchFunction).toHaveBeenCalledTimes(1);

    // Change unrelated prop
    otherProp = 'value2';
    rerender({ other: otherProp });

    // Should not trigger refetch because fetchFunction is stable
    expect(fetchFunction).toHaveBeenCalledTimes(1);
  });
});
