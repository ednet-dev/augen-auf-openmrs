import { openmrsFetch, Patient, restBaseUrl, Visit } from '@openmrs/esm-framework';
import { fetchAll } from "./fetch-utils";
import { NewConfig } from './new-config';

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

export const searchPatients = async (query: string): Promise<Patient[]> => {
    const url = `${restBaseUrl}/patient?q=${encodeURIComponent(query)}`;
  
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
  patientUuid: string,
  queueUuid: string,
  config: NewConfig
): Promise<void> {
  const url = `${restBaseUrl}/queue-entry/transition`;

  if (!queueEntryUuid) {
    return createQueueEntry(queueUuid, patientUuid, config.status.waitingUuid);
  }

  const body = {
    queueEntryToTransition: queueEntryUuid,
    newQueue: queueUuid,
    newStatus: config.status.waitingUuid,
    newPriority: config.priorities.normalUuid,
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

async function createQueueEntry(
  queueUuid: string,
  patientUuid: string,
  statusUuid: string
): Promise<void> {
  const queueEntryPayload = {
    patient: { uuid: patientUuid },
    queue: { uuid: queueUuid },
    status: { uuid: statusUuid },
    priority: { uuid: 'f4620bfa-3625-4883-bd3f-84c2cce14470' }, // Not Urgent
    startedAt: new Date().toISOString(),
    sortWeight: 0,
  };

  await openmrsFetch(`${restBaseUrl}/queue-entry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(queueEntryPayload),
  });
}

export async function endVisit(visit: Visit): Promise<void> {
    const url = `${restBaseUrl}/visit/${visit.uuid}`;
  
    const body = {
      stopDatetime: new Date().toISOString(),
    };
  
    await openmrsFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
}

export async function endQueueEntry(queueEntryUuid: string): Promise<void> {
    const url = `${restBaseUrl}/queue-entry/${queueEntryUuid}`;
  
    const body = {
      endedAt: new Date().toISOString(),
    };

    await openmrsFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
}
