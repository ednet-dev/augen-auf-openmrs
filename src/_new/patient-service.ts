import { openmrsFetch, Patient, restBaseUrl } from '@openmrs/esm-framework';
import { fetchAll } from "./fetch-utils";

export const fetchAllPatients = async (): Promise<Patient[]> => {
      const url = `${restBaseUrl}/patient?q=all`;
    
      try {
        const response = await fetchAll<Patient>(url);

        return response.results;
      } catch (error) {
        console.error('Error searching patients:', error);
        return [];
      }
}

export interface QueueEntry {
    uuid: string;
    patient: Patient;
}

export const fetchQueueEntries = async (queueUuid: string, statusWaitingUuid: string): Promise<QueueEntry[]> => {
    const url = `${restBaseUrl}/queue-entry?queue=${queueUuid}&status=${statusWaitingUuid}&v=full&isEnded=false`;

    try {
        const response = await fetchAll<QueueEntry>(url);
        return response.results;
    } catch (error) {
        console.error('Error searching patients:', error);
        return [];
    }
}

export async function movePatientToStage(
  queueEntryUuid: string,
  queueUuid: string,
  statusWaitingUuid: string
): Promise<void> {
  const url = `${restBaseUrl}/queue-entry/transition`;

  const body = {
    queueEntryToTransition: queueEntryUuid,
    newQueue: queueUuid,
    newStatus: statusWaitingUuid,
    newPriority: "f4620bfa-3625-4883-bd3f-84c2cce14470",
    newPriorityComment: ""
  };

  await openmrsFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}



