import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { PatientListItem, PatientWorkflowData, WorkflowStageId } from '../types';

/**
 * Fetch patients based on search query and filters
 */
export async function searchPatients(
  searchQuery: string = '',
  limit: number = 50
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
    console.error('Error searching patients:', error);
    return [];
  }
}

/**
 * Fetch recent patients (for initial load)
 */
export async function fetchRecentPatients(limit: number = 50): Promise<PatientListItem[]> {
  // TODO: This endpoint might need adjustment based on your OpenMRS setup
  const url = `${restBaseUrl}/patient?v=full&limit=${limit}`;

  try {
    const response = await openmrsFetch(url);
    const data = await response.json();

    return data.results.map((patient: any) => transformPatient(patient));
  } catch (error) {
    console.error('Error fetching recent patients:', error);
    // Return mock data for development
    return getMockPatients();
  }
}

/**
 * Fetch patients filtered by workflow stage
 */
export async function fetchPatientsByWorkflowStage(
  stage: WorkflowStageId | 'all' | 'needs-surgery',
  workflowConceptUuid: string
): Promise<PatientListItem[]> {
  if (stage === 'all') {
    return fetchRecentPatients();
  }

  // TODO: Implement filtering by workflow stage using obs or custom attribute
  // This will depend on how you're storing workflow data in OpenMRS
  const patients = await fetchRecentPatients();

  if (stage === 'needs-surgery') {
    return patients.filter(p => p.workflowData?.needsSurgery);
  }

  return patients.filter(p => p.workflowData?.currentStage === stage);
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

/**
 * Mock data for development
 */
function getMockPatients(): PatientListItem[] {
  return [
    {
      uuid: '002',
      display: 'Patient 002',
      identifiers: [],
      person: { age: 45, birthdate: '1979-01-01', gender: 'M', display: 'Patient 002' },
      workflowData: {
        patientUuid: '002',
        currentStage: 'eye-exam',
        needsSurgery: false,
        completedProtocols: ['protocol-1'],
        lastUpdated: new Date().toISOString(),
      },
    },
    {
      uuid: '003',
      display: 'Patient 003',
      identifiers: [],
      person: { age: 52, birthdate: '1972-01-01', gender: 'F', display: 'Patient 003' },
      workflowData: {
        patientUuid: '003',
        currentStage: 'refraction',
        needsSurgery: true,
        completedProtocols: [],
        lastUpdated: new Date().toISOString(),
      },
    },
    {
      uuid: '005',
      display: 'Patient 005',
      identifiers: [],
      person: { age: 38, birthdate: '1986-01-01', gender: 'M', display: 'Patient 005' },
      workflowData: {
        patientUuid: '005',
        currentStage: 'registration',
        needsSurgery: false,
        completedProtocols: [],
        lastUpdated: new Date().toISOString(),
      },
    },
    {
      uuid: '001',
      display: 'Patient 001',
      identifiers: [],
      person: { age: 60, birthdate: '1964-01-01', gender: 'F', display: 'Patient 001' },
      workflowData: {
        patientUuid: '001',
        currentStage: 'finished',
        needsSurgery: false,
        completedProtocols: ['protocol-1', 'protocol-2', 'protocol-3'],
        lastUpdated: new Date().toISOString(),
      },
    },
    {
      uuid: '004',
      display: 'Patient 004',
      identifiers: [],
      person: { age: 55, birthdate: '1969-01-01', gender: 'M', display: 'Patient 004' },
      workflowData: {
        patientUuid: '004',
        currentStage: 'finished',
        needsSurgery: false,
        completedProtocols: ['protocol-1', 'protocol-2'],
        lastUpdated: new Date().toISOString(),
      },
    },
  ];
}
