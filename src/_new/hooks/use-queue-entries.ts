import React from "react";
import { fetchQueueEntries, QueueEntry } from "../patient-service";

export const useQueueEntries = (queueUuid: string, queueStatusUuid: string) => {
    const [queueEntries, setQueueEntries] = React.useState<QueueEntry[]>([]);
    
    const refresh = React.useCallback(() => {
        fetchQueueEntries(queueUuid, queueStatusUuid)
        .then(fetchedEntries => {
            setQueueEntries(fetchedEntries);
        });
    }, [queueUuid, queueStatusUuid]);
    
    React.useEffect(() => {
        refresh();
    }, [refresh]);
    
    return { queueEntries, refresh };
}