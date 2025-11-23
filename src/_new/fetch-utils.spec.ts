import { openmrsFetch } from "@openmrs/esm-framework";
import { fetchAll, fetchNextPage, fetchPage, ServiceResponse } from "./fetch-utils";

jest.mock("@openmrs/esm-framework", () => ({
  openmrsFetch: jest.fn(),
}));

const mockOpenmrsFetch = openmrsFetch as jest.MockedFunction<typeof openmrsFetch>;

describe('fetch-utils', () => {
  describe('fetchAll', () => {
    beforeEach(() => {
      mockOpenmrsFetch.mockClear();
    });

    it('should add startIndex and limit query parameters to the URL', async () => {
        const testUrl = '/patients';

        mockOpenmrsFetch.mockResolvedValue({
          json: async () => ({ results: [], links: [] }),
        } as any);

        await fetchAll<any>(testUrl);

        expect(mockOpenmrsFetch).toHaveBeenCalled();

        const calledUrl = mockOpenmrsFetch.mock.calls[0][0];

        expect(calledUrl).toContain('startIndex=0');
        expect(calledUrl).toContain('limit=100');
    });

    it('should respect existing query parameters', async () => {
        const testUrl = '/patients?status=active';

        mockOpenmrsFetch.mockResolvedValue({
          json: async () => ({ results: [], links: [] }),
        } as any);

        await fetchAll<any>(testUrl);

        expect(mockOpenmrsFetch).toHaveBeenCalled();

        const calledUrl = mockOpenmrsFetch.mock.calls[0][0];

        expect(calledUrl).toContain('?status=active');
        expect(calledUrl).toContain('&startIndex=0');
        expect(calledUrl).toContain('&limit=100');
    });

    it ('should fetch all pages of results', async () => {
        const testUrl = '/patients';

        mockOpenmrsFetch
          .mockResolvedValueOnce({
            json: async () => ({
              results: [{ id: 1 }, { id: 2 }],
              links: [{ rel: 'next', uri: '/patients?startIndex=2&limit=100' }],
            }),
          } as any)
          .mockResolvedValueOnce({
            json: async () => ({
              results: [{ id: 3 }],
              links: [],
            }),
          } as any);

        const result = await fetchAll<any>(testUrl);

        expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2);
        expect(result.results).toHaveLength(3);
        expect(result.results).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
        expect(result.links).toBeUndefined();
    });
  });

  describe('fetchPage', () => {
    beforeEach(() => {
      mockOpenmrsFetch.mockClear();
    });

    it('should add startIndex and limit query parameters to the URL', async () => {
        const testUrl = '/patients';

        mockOpenmrsFetch.mockResolvedValue({
          json: async () => ({ results: [], links: [] }),
        } as any);

        await fetchPage<any>(testUrl, 2, 50);

        expect(mockOpenmrsFetch).toHaveBeenCalled();

        const calledUrl = mockOpenmrsFetch.mock.calls[0][0];

        expect(calledUrl).toContain('startIndex=100'); // 2 * 50
        expect(calledUrl).toContain('limit=50');
    });

    it('should respect existing query parameters', async () => {
        const testUrl = '/patients?status=active';

        mockOpenmrsFetch.mockResolvedValue({
          json: async () => ({ results: [], links: [] }),
        } as any);

        await fetchPage<any>(testUrl, 1, 25);

        expect(mockOpenmrsFetch).toHaveBeenCalled();

        const calledUrl = mockOpenmrsFetch.mock.calls[0][0];

        expect(calledUrl).toContain('?status=active');
        expect(calledUrl).toContain('&startIndex=25'); // 1 * 25
        expect(calledUrl).toContain('&limit=25');
    });
  });

  describe('fetchNextPage', () => {
    beforeEach(() => {
      mockOpenmrsFetch.mockClear();
    });

    it('should fetch the next page when a next link is present', async () => {
        const currentData: ServiceResponse<any> = {
            results: [{ id: 1 }],
            links: [{ rel: 'next', uri: '/patients?startIndex=1&limit=100' }],
        };

        mockOpenmrsFetch.mockResolvedValue({
          json: async () => ({ results: [{ id: 2 }], links: [] }),
        } as any);

        const nextPageData = await fetchNextPage<any>(currentData);

        expect(mockOpenmrsFetch).toHaveBeenCalled();

        const calledUrl = mockOpenmrsFetch.mock.calls[0][0];

        expect(calledUrl).toBe('/patients?startIndex=1&limit=100');
        expect(nextPageData).not.toBeNull();
        expect(nextPageData?.results).toHaveLength(1);
        expect(nextPageData?.results[0]).toEqual({ id: 2 });
    });

    it('should return null when no next link is present', async () => {
        const currentData: ServiceResponse<any> = {
            results: [{ id: 1 }],
            links: [],
        };

        const nextPageData = await fetchNextPage<any>(currentData);

        expect(mockOpenmrsFetch).not.toHaveBeenCalled();
        expect(nextPageData).toBeNull();
    });
  });
});