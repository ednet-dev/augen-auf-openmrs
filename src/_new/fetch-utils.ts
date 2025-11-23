import { openmrsFetch } from "@openmrs/esm-framework";

export type ServiceResponse<T> = {
    results: T[];
    links?: Array<{
        rel: string;
        uri: string;
    }>;
}

export const fetchPage = async<T>(url: string, page=0, limit=100): Promise<ServiceResponse<T>> => {
    const separator = url.includes('?') ? '&' : '?';
    const pagedUrl = `${url}${separator}startIndex=${page * limit}&limit=${limit}`;
    const response = await openmrsFetch<ServiceResponse<T>>(pagedUrl);
    return response.json() as Promise<ServiceResponse<T>>;
}

export const fetchNextPage = async<T>(currentData: ServiceResponse<T>): Promise<ServiceResponse<T> | null> => {
    const nextLink = currentData.links?.find(link => link.rel === 'next');
    if (nextLink) {
        const response = await openmrsFetch<ServiceResponse<T>>(nextLink.uri);
        return response.json() as Promise<ServiceResponse<T>>;
    }
    return null;
}   

export const fetchAll = async<T>(path: string): Promise<ServiceResponse<T>> => {
    try {
        const initialPage = await fetchPage<T>(path, 0, 100);
        let data: ServiceResponse<T> = { results: initialPage.results };
        let nextPageData: ServiceResponse<T> | null = initialPage;

        while (nextPageData) {
            nextPageData = await fetchNextPage<T>(nextPageData);
            if (nextPageData) {
                data.results = data.results.concat(nextPageData.results);
            }
        }

        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return Promise.reject(error);
    }
}