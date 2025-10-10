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
 * Fetch patients filtered by workflow stage using encounters
 *
 * Note: 'needs-surgery' is handled as a special case because it represents a
 * cross-cutting concern (a boolean flag/attribute) rather than a sequential workflow stage.
 * Patients can need surgery while being in ANY workflow stage (registration, refraction, etc.).
 *
 * Data sources:
 * - Workflow stages: Queried via encounters (encounterType) - represents sequential progression
 * - Needs surgery: Queried via observations (concept) - represents a patient attribute
 */
export async function fetchPatientsByWorkflowStage(
  stage: WorkflowStageId | 'all' | 'needs-surgery',
  encounterTypeUuid: string,
  needsSurgeryConceptUuid: string
): Promise<PatientListItem[]> {
  if (stage === 'all') {
    return fetchRecentPatients();
  }

  try {
    if (stage === 'needs-surgery') {
      // Special case: Query observations for patients who need surgery
      // This is NOT a workflow stage but a patient attribute that can apply to any stage
      const url = `${restBaseUrl}/obs?concept=${needsSurgeryConceptUuid}&v=full&limit=100`;
      const response = await openmrsFetch(url);
      const data = await response.json();

      // Extract unique patient UUIDs from observations
      const patientUuids = [...new Set(data.results.map((obs: any) => obs.person.uuid))] as string[];

      // Fetch full patient data for each UUID
      const patients = await Promise.all(
        patientUuids.map((uuid) => fetchPatientByUuid(uuid))
      );

      return patients.filter((p): p is PatientListItem => p !== null);
    } else {
      // Standard case: Query encounters by type to find patients in a specific workflow stage
      const url = `${restBaseUrl}/encounter?encounterType=${encounterTypeUuid}&v=full&limit=100`;
      const response = await openmrsFetch(url);
      const data = await response.json();

      // Extract unique patient UUIDs from encounters
      const patientUuids = [...new Set(data.results.map((enc: any) => enc.patient.uuid))] as string[];

      // Fetch full patient data for each UUID
      const patients = await Promise.all(
        patientUuids.map((uuid) => fetchPatientByUuid(uuid))
      );

      return patients.filter((p): p is PatientListItem => p !== null);
    }
  } catch (error) {
    console.error('Error fetching patients by workflow stage:', error);
    return getMockPatients().filter(p => {
      if (stage === 'needs-surgery') {
        return p.workflowData?.needsSurgery;
      }
      return p.workflowData?.currentStage === stage;
    });
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
 * Fetch patient workflow data based on encounters
 */
export async function fetchPatientWorkflowData(
  patientUuid: string,
  workflowStages: Array<{ id: WorkflowStageId; encounterTypeUuid: string }>,
  needsSurgeryConceptUuid: string
): Promise<PatientWorkflowData | null> {
  try {
    // Fetch all encounters for this patient
    const encountersUrl = `${restBaseUrl}/encounter?patient=${patientUuid}&v=full&limit=100`;
    const encountersResponse = await openmrsFetch(encountersUrl);
    const encountersData = await encountersResponse.json();

    // Determine current stage based on most recent encounter type
    let currentStage: WorkflowStageId = 'registration';
    let completedProtocols: ProtocolId[] = [];
    let lastUpdated = new Date().toISOString();

    if (encountersData.results && encountersData.results.length > 0) {
      // Sort encounters by date (most recent first)
      const sortedEncounters = encountersData.results.sort(
        (a: any, b: any) =>
          new Date(b.encounterDatetime).getTime() - new Date(a.encounterDatetime).getTime()
      );

      // Find the most recent workflow stage encounter
      for (const encounter of sortedEncounters) {
        const stage = workflowStages.find(
          (s) => s.encounterTypeUuid === encounter.encounterType.uuid
        );
        if (stage) {
          currentStage = stage.id as WorkflowStageId;
          lastUpdated = encounter.encounterDatetime;
          break;
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
