import React from "react";

export const useAsyncData = <T>(
    fetchFunction: () => Promise<T>
) => {
    const [data, setData] = React.useState<T | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<Error | null>(null);
    
    const refresh = React.useCallback(() => {
        setIsLoading(true);
        setError(null);
        fetchFunction()
            .then(fetchedData => {
                setData(fetchedData);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Failed to fetch data:", error);
                setError(error);
                setIsLoading(false);
            });
    }, [fetchFunction]);
    
    React.useEffect(() => {
        refresh();
    }, [refresh]);
    
    return { data, isLoading, error, refresh };
};
