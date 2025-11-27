import React from "react";
import { fetchQueueEntries, QueueEntry } from "../patient-service";

export const useQueueEntries = (queueUuid: string, queueStatusUuid: string) => {
    const [queueEntries, setQueueEntries] = React.useState<QueueEntry[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<Error | null>(null);
    
    const refresh = React.useCallback(() => {
        setIsLoading(true);
        setError(null);
        fetchQueueEntries(queueUuid, queueStatusUuid)
        .then(fetchedEntries => {
            setQueueEntries(fetchedEntries);
            setIsLoading(false);
        })
        .catch(error => {
            console.error("Failed to fetch queue entries:", error);
            setError(error);
            setIsLoading(false);
        });
    }, [queueUuid, queueStatusUuid]);
    
    React.useEffect(() => {
        refresh();
    }, [refresh]);
    
    return { queueEntries, isLoading, error, refresh };
}