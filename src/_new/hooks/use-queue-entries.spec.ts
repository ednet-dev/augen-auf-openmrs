import { renderHook, waitFor } from '@testing-library/react';
import { useQueueEntries } from './use-queue-entries';
import { fetchQueueEntries, QueueEntry } from '../patient-service';
import { Patient } from '@openmrs/esm-framework';

jest.mock('../patient-service', () => ({
  fetchQueueEntries: jest.fn(),
}));

const mockFetchQueueEntries = fetchQueueEntries as jest.MockedFunction<typeof fetchQueueEntries>;

describe('useQueueEntries', () => {
  const mockQueueUuid = 'queue-123';
  const mockStatusUuid = 'status-456';

  const mockPatient1: Patient = {
    uuid: 'patient-1',
    display: 'John Doe',
    identifiers: [],
    person: {
      uuid: 'person-1',
      display: 'John Doe',
      gender: 'M',
      age: 30,
      birthdate: '1994-01-01',
      birthdateEstimated: false,
      dead: false,
      deathDate: null,
      causeOfDeath: null,
      preferredName: {
        uuid: 'name-1',
        display: 'John Doe',
        givenName: 'John',
        familyName: 'Doe',
      },
      preferredAddress: null,
      attributes: [],
      voided: false,
      deathdateEstimated: false,
      birthtime: null,
    },
  };

  const mockPatient2: Patient = {
    uuid: 'patient-2',
    display: 'Jane Smith',
    identifiers: [],
    person: {
      uuid: 'person-2',
      display: 'Jane Smith',
      gender: 'F',
      age: 25,
      birthdate: '1999-01-01',
      birthdateEstimated: false,
      dead: false,
      deathDate: null,
      causeOfDeath: null,
      preferredName: {
        uuid: 'name-2',
        display: 'Jane Smith',
        givenName: 'Jane',
        familyName: 'Smith',
      },
      preferredAddress: null,
      attributes: [],
      voided: false,
      deathdateEstimated: false,
      birthtime: null,
    },
  };

  const mockQueueEntries: QueueEntry[] = [
    {
      uuid: 'entry-1',
      patient: mockPatient1,
    },
    {
      uuid: 'entry-2',
      patient: mockPatient2,
    },
  ];

  beforeEach(() => {
    mockFetchQueueEntries.mockClear();
  });

  it('should fetch queue entries on mount', async () => {
    mockFetchQueueEntries.mockResolvedValue(mockQueueEntries);

    const { result } = renderHook(() => useQueueEntries(mockQueueUuid, mockStatusUuid));

    expect(mockFetchQueueEntries).toHaveBeenCalledWith(mockQueueUuid, mockStatusUuid);

    await waitFor(() => {
      expect(result.current.queueEntries).toEqual(mockQueueEntries);
    });
  });

  it('should return empty array initially', () => {
    mockFetchQueueEntries.mockResolvedValue(mockQueueEntries);

    const { result } = renderHook(() => useQueueEntries(mockQueueUuid, mockStatusUuid));

    expect(result.current.queueEntries).toEqual([]);
  });

  it('should provide a refresh function', async () => {
    mockFetchQueueEntries.mockResolvedValue(mockQueueEntries);

    const { result } = renderHook(() => useQueueEntries(mockQueueUuid, mockStatusUuid));

    expect(result.current.refresh).toBeDefined();
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should refetch queue entries when refresh is called', async () => {
    mockFetchQueueEntries.mockResolvedValueOnce(mockQueueEntries);

    const { result } = renderHook(() => useQueueEntries(mockQueueUuid, mockStatusUuid));

    await waitFor(() => {
      expect(result.current.queueEntries).toEqual(mockQueueEntries);
    });

    expect(mockFetchQueueEntries).toHaveBeenCalledTimes(1);

    // Update mock to return different data
    const updatedQueueEntries: QueueEntry[] = [
      {
        uuid: 'entry-3',
        patient: mockPatient1,
      },
    ];

    mockFetchQueueEntries.mockResolvedValueOnce(updatedQueueEntries);

    // Call refresh
    result.current.refresh();

    await waitFor(() => {
      expect(result.current.queueEntries).toEqual(updatedQueueEntries);
    });

    expect(mockFetchQueueEntries).toHaveBeenCalledTimes(2);
    expect(mockFetchQueueEntries).toHaveBeenCalledWith(mockQueueUuid, mockStatusUuid);
  });

  it('should refetch when queueUuid changes', async () => {
    mockFetchQueueEntries.mockResolvedValue(mockQueueEntries);

    const { result, rerender } = renderHook(
      ({ queueUuid, statusUuid }) => useQueueEntries(queueUuid, statusUuid),
      {
        initialProps: {
          queueUuid: mockQueueUuid,
          statusUuid: mockStatusUuid,
        },
      }
    );

    await waitFor(() => {
      expect(result.current.queueEntries).toEqual(mockQueueEntries);
    });

    expect(mockFetchQueueEntries).toHaveBeenCalledTimes(1);
    expect(mockFetchQueueEntries).toHaveBeenCalledWith(mockQueueUuid, mockStatusUuid);

    // Change queueUuid
    const newQueueUuid = 'queue-789';
    const updatedEntries: QueueEntry[] = [mockQueueEntries[0]];
    mockFetchQueueEntries.mockResolvedValueOnce(updatedEntries);

    rerender({ queueUuid: newQueueUuid, statusUuid: mockStatusUuid });

    await waitFor(() => {
      expect(mockFetchQueueEntries).toHaveBeenCalledWith(newQueueUuid, mockStatusUuid);
    });

    expect(mockFetchQueueEntries).toHaveBeenCalledTimes(2);
  });

  it('should refetch when statusUuid changes', async () => {
    mockFetchQueueEntries.mockResolvedValue(mockQueueEntries);

    const { result, rerender } = renderHook(
      ({ queueUuid, statusUuid }) => useQueueEntries(queueUuid, statusUuid),
      {
        initialProps: {
          queueUuid: mockQueueUuid,
          statusUuid: mockStatusUuid,
        },
      }
    );

    await waitFor(() => {
      expect(result.current.queueEntries).toEqual(mockQueueEntries);
    });

    expect(mockFetchQueueEntries).toHaveBeenCalledTimes(1);

    // Change statusUuid
    const newStatusUuid = 'status-789';
    const updatedEntries: QueueEntry[] = [];
    mockFetchQueueEntries.mockResolvedValueOnce(updatedEntries);

    rerender({ queueUuid: mockQueueUuid, statusUuid: newStatusUuid });

    await waitFor(() => {
      expect(mockFetchQueueEntries).toHaveBeenCalledWith(mockQueueUuid, newStatusUuid);
    });

    expect(mockFetchQueueEntries).toHaveBeenCalledTimes(2);
  });

  it('should handle empty queue entries', async () => {
    mockFetchQueueEntries.mockResolvedValue([]);

    const { result } = renderHook(() => useQueueEntries(mockQueueUuid, mockStatusUuid));

    await waitFor(() => {
      expect(result.current.queueEntries).toEqual([]);
    });

    expect(mockFetchQueueEntries).toHaveBeenCalledWith(mockQueueUuid, mockStatusUuid);
  });

  it('should maintain stable refresh function reference', async () => {
    mockFetchQueueEntries.mockResolvedValue(mockQueueEntries);

    const { result, rerender } = renderHook(() => useQueueEntries(mockQueueUuid, mockStatusUuid));

    const firstRefresh = result.current.refresh;

    await waitFor(() => {
      expect(result.current.queueEntries).toEqual(mockQueueEntries);
    });

    rerender();

    const secondRefresh = result.current.refresh;

    expect(firstRefresh).toBe(secondRefresh);
  });

  it('should set isLoading to true initially and false after data is loaded', async () => {
    mockFetchQueueEntries.mockResolvedValue(mockQueueEntries);

    const { result } = renderHook(() => useQueueEntries(mockQueueUuid, mockStatusUuid));

    // Initially should be loading
    expect(result.current.isLoading).toBe(true);

    // After data is fetched, should not be loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.queueEntries).toEqual(mockQueueEntries);
  });

  it('should set isLoading to true when refresh is called', async () => {
    mockFetchQueueEntries.mockResolvedValue(mockQueueEntries);

    const { result } = renderHook(() => useQueueEntries(mockQueueUuid, mockStatusUuid));

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Setup a delayed response to test loading state
    let resolvePromise: (value: QueueEntry[]) => void;
    const delayedPromise = new Promise<QueueEntry[]>((resolve) => {
      resolvePromise = resolve;
    });
    
    mockFetchQueueEntries.mockReturnValueOnce(delayedPromise);

    // Call refresh
    result.current.refresh();

    // Should be loading immediately after refresh
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Resolve the promise
    resolvePromise!(mockQueueEntries);

    // Should eventually complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should set isLoading to false even when fetch fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchQueueEntries.mockRejectedValue(new Error('Fetch failed'));

    const { result } = renderHook(() => useQueueEntries(mockQueueUuid, mockStatusUuid));

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
    mockFetchQueueEntries.mockRejectedValue(testError);

    const { result } = renderHook(() => useQueueEntries(mockQueueUuid, mockStatusUuid));

    // Initially should have no error
    expect(result.current.error).toBeNull();

    // After fetch fails, should have error
    await waitFor(() => {
      expect(result.current.error).toBe(testError);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.queueEntries).toEqual([]);

    consoleErrorSpy.mockRestore();
  });

  it('should clear error on successful fetch', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // First fetch fails
    mockFetchQueueEntries.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useQueueEntries(mockQueueUuid, mockStatusUuid));

    // Wait for error to be set
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error?.message).toBe('Network error');

    // Second fetch succeeds
    mockFetchQueueEntries.mockResolvedValueOnce(mockQueueEntries);
    
    result.current.refresh();

    // Error should be cleared on successful fetch
    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });

    expect(result.current.queueEntries).toEqual(mockQueueEntries);
    expect(result.current.isLoading).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it('should set error to null initially', () => {
    mockFetchQueueEntries.mockResolvedValue(mockQueueEntries);

    const { result } = renderHook(() => useQueueEntries(mockQueueUuid, mockStatusUuid));

    expect(result.current.error).toBeNull();
  });

  it('should maintain error state until next fetch', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const testError = new Error('Persistent error');
    mockFetchQueueEntries.mockRejectedValue(testError);

    const { result, rerender } = renderHook(() => useQueueEntries(mockQueueUuid, mockStatusUuid));

    await waitFor(() => {
      expect(result.current.error).toBe(testError);
    });

    // Rerender shouldn't clear error
    rerender();

    expect(result.current.error).toBe(testError);

    consoleErrorSpy.mockRestore();
  });
});
