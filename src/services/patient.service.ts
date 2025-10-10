import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { PatientListItem, PatientWorkflowData, WorkflowStageId, ProtocolId } from '../types';

/**
 * Fetch patients based on search query and filters
 */
export async function searchPatients(
  searchQuery: string = '',
  limit: number = 50
): Promise<PatientListItem[]> {
  const query = searchQuery.trim();

  if (!query) {
    // No search query provided - return empty array
    return [];
  }

  const url = `${restBaseUrl}/patient?q=${encodeURIComponent(query)}&v=full&limit=${limit}`;

  try {
    const response = await openmrsFetch(url);
    const data = await response.json();

    return data.results.map((patient: any) => transformPatient(patient));
  } catch (error) {
    console.error('Error searching patients:', error);
    return [];
  }
}

/**
 * Fetch patients filtered by workflow stage using queue entries
 *
 * Note: 'needs-surgery' is handled as a special case because it represents a
 * cross-cutting concern (a boolean flag/attribute) rather than a sequential workflow stage.
 * Patients can need surgery while being in ANY workflow stage (registration, refraction, etc.).
 *
 * Data sources:
 * - Workflow stages: Queried via queue entries - patients currently in that stage's queue
 * - Needs surgery: Queried via observations (concept) - represents a patient attribute
 */
export async function fetchPatientsByWorkflowStage(
  stage: WorkflowStageId | 'all' | 'needs-surgery',
  queueUuid: string,
  statusWaitingUuid: string,
  needsSurgeryConceptUuid: string,
  workflowStages: Array<{ id: WorkflowStageId; queueUuid: string }>
): Promise<PatientListItem[]> {
  if (stage === 'all') {
    // 'all' should not be calling this function - return empty array
    return [];
  }

  try {
    if (stage === 'needs-surgery') {
      // Special case: Query observations for patients who need surgery
      // This is NOT a workflow stage but a patient attribute that can apply to any stage
      const url = `${restBaseUrl}/obs?concept=${needsSurgeryConceptUuid}&v=full&limit=100`;
      const response = await openmrsFetch(url);
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        // No observations found
        return [];
      }

      // Extract unique patient UUIDs from observations
      const patientUuids = [...new Set(data.results.map((obs: any) => obs.person.uuid))] as string[];

      // Fetch full patient data for each UUID
      const patients = await Promise.all(
        patientUuids.map((uuid) => fetchPatientByUuid(uuid))
      );

      return patients.filter((p): p is PatientListItem => p !== null);
    } else {
      // Standard workflow stage: Query queue entries
      // This returns all patients currently in the specified queue
      return await fetchPatientsByQueue(
        queueUuid,
        statusWaitingUuid,
        workflowStages,
        needsSurgeryConceptUuid
      );
    }
  } catch (error) {
    console.error('Error fetching patients by workflow stage:', error);
    // Return empty array on error - don't fall back to mock data
    return [];
  }
}

/**
 * Fetch patients currently in a specific queue
 */
export async function fetchPatientsByQueue(
  queueUuid: string,
  statusWaitingUuid: string,
  workflowStages: Array<{ id: WorkflowStageId; queueUuid: string }>,
  needsSurgeryConceptUuid: string
): Promise<PatientListItem[]> {
  try {
    // Query for active queue entries in this queue with "Waiting" status
    const url = `${restBaseUrl}/queue-entry?queue=${queueUuid}&status=${statusWaitingUuid}&v=full&limit=100`;
    const response = await openmrsFetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    // Extract patient UUIDs and fetch full patient data
    const patientUuids = data.results
      .filter((entry: any) => !entry.endedAt) // Only active entries
      .map((entry: any) => entry.patient.uuid);

    const patients = await Promise.all(
      patientUuids.map((uuid: string) => fetchPatientByUuid(uuid))
    );

    const validPatients = patients.filter((p): p is PatientListItem => p !== null);

    // Fetch workflow data for each patient
    const patientsWithWorkflow = await Promise.all(
      validPatients.map(async (patient) => {
        const workflowData = await fetchPatientWorkflowData(
          patient.uuid,
          workflowStages,
          needsSurgeryConceptUuid
        );
        return { ...patient, workflowData };
      })
    );

    return patientsWithWorkflow;
  } catch (error) {
    console.error('Error fetching patients by queue:', error);
    return [];
  }
}

/**
 * Fetch a single patient by UUID
 */
async function fetchPatientByUuid(uuid: string): Promise<PatientListItem | null> {
  try {
    const url = `${restBaseUrl}/patient/${uuid}?v=full`;
    const response = await openmrsFetch(url);
    const patient = await response.json();
    return transformPatient(patient);
  } catch (error) {
    console.error(`Error fetching patient ${uuid}:`, error);
    return null;
  }
}

/**
 * Fetch patient workflow data based on active queue entry
 */
export async function fetchPatientWorkflowData(
  patientUuid: string,
  workflowStages: Array<{ id: WorkflowStageId; queueUuid: string }>,
  needsSurgeryConceptUuid: string
): Promise<PatientWorkflowData | null> {
  try {
    // Fetch active queue entries for this patient
    const queueUrl = `${restBaseUrl}/queue-entry?patient=${patientUuid}&v=full&limit=100`;
    const queueResponse = await openmrsFetch(queueUrl);
    const queueData = await queueResponse.json();

    // Determine current stage based on active queue entry
    let currentStage: WorkflowStageId = 'registration';
    let completedProtocols: ProtocolId[] = [];
    let lastUpdated = new Date().toISOString();

    if (queueData.results && queueData.results.length > 0) {
      // Find the active queue entry (one without endedAt)
      const activeEntry = queueData.results.find((entry: any) => !entry.endedAt);

      if (activeEntry) {
        // Find which workflow stage this queue belongs to
        const stage = workflowStages.find(
          (s) => s.queueUuid === activeEntry.queue.uuid
        );
        if (stage) {
          currentStage = stage.id as WorkflowStageId;
          lastUpdated = activeEntry.startedAt;
        }
      }

      // TODO: Extract completed protocols from form encounters
      // This depends on how protocol forms are linked to encounters
    }

    // Check if patient needs surgery
    const needsSurgery = await checkNeedsSurgery(patientUuid, needsSurgeryConceptUuid);

    return {
      patientUuid,
      currentStage,
      needsSurgery,
      completedProtocols,
      lastUpdated,
    };
  } catch (error) {
    console.error('Error fetching patient workflow data:', error);
    return null;
  }
}

/**
 * Check if patient needs surgery based on observations
 */
async function checkNeedsSurgery(
  patientUuid: string,
  needsSurgeryConceptUuid: string
): Promise<boolean> {
  if (!needsSurgeryConceptUuid) {
    return false;
  }

  try {
    const url = `${restBaseUrl}/obs?patient=${patientUuid}&concept=${needsSurgeryConceptUuid}&limit=1&v=full`;
    const response = await openmrsFetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const latestObs = data.results[0];
      // Assuming the obs value is a boolean or coded concept
      return latestObs.value === true || latestObs.value?.display === 'Yes';
    }
  } catch (error) {
    console.error('Error checking needs surgery:', error);
  }

  return false;
}

/**
 * Move patient to a new workflow stage by updating queue entries
 *
 * This function:
 * 1. Ends any existing queue entries for this patient
 * 2. Creates a new queue entry for the target stage
 *
 * Note: We use a single encounter per patient visit, not per stage transition.
 * The encounter is created during registration and protocol forms attach to it.
 */
export async function movePatientToStage(
  patientUuid: string,
  targetStage: WorkflowStageId,
  queueUuid: string,
  statusWaitingUuid: string
): Promise<void> {
  if (!queueUuid) {
    throw new Error(`No queue UUID configured for stage: ${targetStage}`);
  }

  try {
    // Step 1: End any existing queue entries for this patient
    await endPatientQueueEntries(patientUuid);

    // Step 2: Create new queue entry for target stage
    await createQueueEntry(patientUuid, queueUuid, statusWaitingUuid);

  } catch (error) {
    console.error(`Error moving patient to stage ${targetStage}:`, error);
    throw error;
  }
}

/**
 * End all active queue entries for a patient
 */
async function endPatientQueueEntries(patientUuid: string): Promise<void> {
  try {
    // Get all active queue entries for this patient (entries without endedAt)
    const response = await openmrsFetch(
      `${restBaseUrl}/queue-entry?patient=${patientUuid}&v=default&limit=100`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // End each active entry
      await Promise.all(
        data.results
          .filter((entry: any) => !entry.endedAt)
          .map((entry: any) =>
            openmrsFetch(`${restBaseUrl}/queue-entry/${entry.uuid}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                endedAt: new Date().toISOString(),
              }),
            })
          )
      );
    }
  } catch (error) {
    console.error('Error ending patient queue entries:', error);
    // Don't throw - allow queue entry creation to continue
  }
}

/**
 * Create a new queue entry for a patient
 */
async function createQueueEntry(
  patientUuid: string,
  queueUuid: string,
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

/**
 * Update patient workflow data
 */
export async function updatePatientWorkflowData(
  patientUuid: string,
  workflowData: Partial<PatientWorkflowData>,
  workflowConceptUuid: string,
  encounterTypeUuid: string
): Promise<void> {
  // TODO: Implement saving workflow data as an observation

  try {
    const obsPayload = {
      person: patientUuid,
      concept: workflowConceptUuid,
      obsDatetime: new Date().toISOString(),
      value: JSON.stringify(workflowData),
    };

    // Create an encounter and obs
    const encounterPayload = {
      patient: patientUuid,
      encounterType: encounterTypeUuid,
      encounterDatetime: new Date().toISOString(),
      obs: [obsPayload],
    };

    await openmrsFetch(`${restBaseUrl}/encounter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encounterPayload),
    });
  } catch (error) {
    console.error('Error updating patient workflow data:', error);
    throw error;
  }
}

/**
 * Transform OpenMRS patient API response to our internal format
 */
function transformPatient(patient: any): PatientListItem {
  return {
    uuid: patient.uuid,
    display: patient.display || patient.person?.display || 'Unknown Patient',
    identifiers: patient.identifiers || [],
    person: {
      age: patient.person?.age || 0,
      birthdate: patient.person?.birthdate || '',
      gender: patient.person?.gender || 'U',
      display: patient.person?.display || '',
    },
    // Workflow data will be fetched separately
    workflowData: undefined,
  };
}

/**
 * Parse workflow data from an observation
 */
function parseWorkflowObs(obs: any): PatientWorkflowData | null {
  try {
    // Assuming the obs value contains JSON-stringified workflow data
    const value = obs.value;
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error('Error parsing workflow obs:', error);
    return null;
  }
}

