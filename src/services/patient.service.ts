import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { PatientListItem, PatientWorkflowData, WorkflowStageId } from '../types';

/**
 * Delay helper for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  timeout: 5000, // 5 seconds per request
};

/**
 * Fetch patients based on search query and filters
 */
export async function searchPatients(
  searchQuery: string = '',
  limit: number = 50,
  retryCount: number = 0
): Promise<PatientListItem[]> {
  const query = searchQuery.trim();

  if (!query) {
    // If no search query, fetch recent patients
    return fetchRecentPatients(limit);
  }

  const url = `${restBaseUrl}/patient?q=${encodeURIComponent(query)}&v=full&limit=${limit}`;

  try {
    const response = await openmrsFetch(url);
    const data = await response.json();

    return data.results.map((patient: any) => transformPatient(patient));
  } catch (error) {
    console.error(`Error searching patients (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries + 1}):`, error);

    // Retry with exponential backoff if we haven't exceeded max retries
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delayMs = RETRY_CONFIG.baseDelay * Math.pow(2, retryCount);
      console.log(`Retrying search in ${delayMs}ms...`);
      await delay(delayMs);
      return searchPatients(searchQuery, limit, retryCount + 1);
    }

    // After all retries exhausted, return empty array
    console.error('All retry attempts exhausted. Returning empty search results.');
    return [];
  }
}

/**
 * Fetch recent patients (for initial load)
 */
export async function fetchRecentPatients(
  limit: number = 50,
  retryCount: number = 0
): Promise<PatientListItem[]> {
  const url = `${restBaseUrl}/patient?v=full&limit=${limit}`;

  try {
    const response = await openmrsFetch(url);
    const data = await response.json();

    return data.results.map((patient: any) => transformPatient(patient));
  } catch (error) {
    console.error(`Error fetching recent patients (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries + 1}):`, error);

    // Retry with exponential backoff if we haven't exceeded max retries
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delayMs = RETRY_CONFIG.baseDelay * Math.pow(2, retryCount);
      console.log(`Retrying in ${delayMs}ms...`);
      await delay(delayMs);
      return fetchRecentPatients(limit, retryCount + 1);
    }

    // After all retries exhausted, return empty array
    // UI will show "No patients found" - better than returning stale mock data
    console.error('All retry attempts exhausted. Returning empty patient list.');
    return [];
  }
}

/**
 * Fetch patients filtered by workflow stage
 */
export async function fetchPatientsByWorkflowStage(
  stage: WorkflowStageId | 'all' | 'needs-surgery',
  workflowConceptUuid: string,
  retryCount: number = 0
): Promise<PatientListItem[]> {
  if (stage === 'all') {
    return fetchRecentPatients();
  }

  try {
    // Fetch all patients first
    const patients = await fetchRecentPatients();

    // Fetch workflow data for each patient in parallel
    const patientsWithWorkflow = await Promise.all(
      patients.map(async (patient) => {
        const workflowData = await fetchPatientWorkflowData(patient.uuid, workflowConceptUuid);
        return { ...patient, workflowData };
      })
    );

    // Filter based on stage
    if (stage === 'needs-surgery') {
      return patientsWithWorkflow.filter(p => p.workflowData?.needsSurgery);
    }

    return patientsWithWorkflow.filter(p => p.workflowData?.currentStage === stage);
  } catch (error) {
    console.error(`Error fetching patients by workflow stage (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries + 1}):`, error);

    // Retry with exponential backoff
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delayMs = RETRY_CONFIG.baseDelay * Math.pow(2, retryCount);
      console.log(`Retrying workflow stage fetch in ${delayMs}ms...`);
      await delay(delayMs);
      return fetchPatientsByWorkflowStage(stage, workflowConceptUuid, retryCount + 1);
    }

    // After all retries exhausted, return empty array
    console.error('All retry attempts exhausted. Returning empty patient list.');
    return [];
  }
}

/**
 * Fetch patient workflow data
 */
export async function fetchPatientWorkflowData(
  patientUuid: string,
  workflowConceptUuid: string
): Promise<PatientWorkflowData | null> {
  // TODO: Implement fetching workflow data from obs or custom attribute
  // This is a placeholder that returns null

  try {
    // Example: Fetch latest obs for workflow concept
    const url = `${restBaseUrl}/obs?patient=${patientUuid}&concept=${workflowConceptUuid}&limit=1&v=full`;
    const response = await openmrsFetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Parse the obs value to extract workflow data
      // This structure depends on how you store the data
      return parseWorkflowObs(data.results[0]);
    }
  } catch (error) {
    console.error('Error fetching patient workflow data:', error);
  }

  return null;
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

