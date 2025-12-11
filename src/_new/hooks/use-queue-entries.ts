import React from "react";
import { fetchQueueEntries, QueueEntry } from "../patient-service";
import { useAsyncData } from "./use-async-data";

export const useQueueEntries = (queueUuid: string, queueStatusUuid: string) => {
    const fetchFunction = React.useCallback(
        () => fetchQueueEntries(queueUuid, queueStatusUuid),
        [queueUuid, queueStatusUuid]
    );
    
    const { data, isLoading, error, refresh } = useAsyncData<QueueEntry[]>(
        fetchFunction
    );
    
    return { 
        queueEntries: data ?? [], 
        isLoading, 
        error, 
        refresh 
    };
}