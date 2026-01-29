import {
  openmrsFetch,
  Patient,
  restBaseUrl,
  Visit,
} from "@openmrs/esm-framework";
import { fetchAll } from "./fetch-utils";
import { ResolvedConfig } from "./new-config";

export const fetchAllPatients = async (): Promise<Patient[]> => {
  const url = `${restBaseUrl}/patient?q=all`;

  try {
    const response = await fetchAll<Patient>(url);

    return response.results;
  } catch (error) {
    console.error("Error searching patients:", error);
    return [];
  }
};

export const searchPatients = async (query: string): Promise<Patient[]> => {
  const url = `${restBaseUrl}/patient?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetchAll<Patient>(url);

    return response.results;
  } catch (error) {
    console.error("Error searching patients:", error);
    return [];
  }
};

export interface QueueEntry {
  uuid: string;
  patient: Patient;
}

export const fetchQueueEntries = async (
  queueUuid: string,
  statusWaitingUuid: string,
): Promise<QueueEntry[]> => {
  // Use custom representation to avoid previousQueueEntry resolution which can fail with data integrity issues
  const customRep =
    "custom:(uuid,patient:(uuid,display,person:(uuid,display,preferredName,gender,age,birthdate)),queue,status,priority,startedAt,endedAt,sortWeight)";
  const url = `${restBaseUrl}/queue-entry?queue=${queueUuid}&status=${statusWaitingUuid}&v=${encodeURIComponent(customRep)}&isEnded=false`;

  try {
    const response = await fetchAll<QueueEntry>(url);
    return response.results;
  } catch (error) {
    console.error("Error fetching queue entries:", error);
    return [];
  }
};

export async function movePatientToStage(
  queueEntryUuid: string,
  patientUuid: string,
  queueUuid: string,
  config: ResolvedConfig,
): Promise<void> {
  const url = `${restBaseUrl}/queue-entry/transition`;

  // If no queue entry UUID provided, check if patient already has an active queue entry
  if (!queueEntryUuid) {
    const existingEntry = await findActiveQueueEntryForPatient(patientUuid);
    if (existingEntry) {
      // Patient already has a queue entry - transition it instead
      queueEntryUuid = existingEntry.uuid;
    } else {
      // No existing entry - create a new one
      return createQueueEntry(
        queueUuid,
        patientUuid,
        config.status.waitingUuid,
      );
    }
  }

  const body = {
    queueEntryToTransition: queueEntryUuid,
    newQueue: queueUuid,
    newStatus: config.status.waitingUuid,
    newPriority: config.priorities.normalUuid,
    newPriorityComment: "",
  };

  await openmrsFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function findActiveQueueEntryForPatient(
  patientUuid: string,
): Promise<{ uuid: string } | null> {
  try {
    const response = await openmrsFetch(
      `${restBaseUrl}/queue-entry?patient=${patientUuid}&isEnded=false&v=default`,
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return { uuid: data.results[0].uuid };
    }
    return null;
  } catch (error) {
    console.error("Error finding existing queue entry:", error);
    return null;
  }
}

async function createQueueEntry(
  queueUuid: string,
  patientUuid: string,
  statusUuid: string,
): Promise<void> {
  const queueEntryPayload = {
    patient: { uuid: patientUuid },
    queue: { uuid: queueUuid },
    status: { uuid: statusUuid },
    priority: { uuid: "f4620bfa-3625-4883-bd3f-84c2cce14470" }, // Not Urgent
    startedAt: new Date().toISOString(),
    sortWeight: 0,
  };

  await openmrsFetch(`${restBaseUrl}/queue-entry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(queueEntryPayload),
  });
}

export async function endVisit(visit: Visit): Promise<void> {
  const url = `${restBaseUrl}/visit/${visit.uuid}`;

  const body = {
    stopDatetime: new Date().toISOString(),
  };

  await openmrsFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
