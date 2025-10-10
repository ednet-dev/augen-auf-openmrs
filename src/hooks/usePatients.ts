import { useEffect, useState } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { PatientListItem, WorkflowStageId, AugenAufConfig } from '../types';
import {
  searchPatients,
  fetchPatientsByWorkflowStage,
  fetchPatientWorkflowData,
} from '../services/patient.service';

interface UsePatientsOptions {
  searchQuery?: string;
  workflowStage?: WorkflowStageId | 'all' | 'needs-surgery';
}

interface UsePatientsResult {
  patients: PatientListItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePatients(options: UsePatientsOptions = {}): UsePatientsResult {
  const { searchQuery = '', workflowStage = 'all' } = options;
  const config = useConfig() as AugenAufConfig;

  const [allPatients, setAllPatients] = useState<PatientListItem[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPatients = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let results: PatientListItem[];

      if (searchQuery.trim()) {
        // Search mode - fetch from API
        results = await searchPatients(searchQuery);

        // Fetch workflow data for each patient
        const patientsWithWorkflow = await Promise.all(
          results.map(async (patient) => {
            const workflowData = await fetchPatientWorkflowData(
              patient.uuid,
              config.workflowStages,
              config.needsSurgeryConceptUuid
            );
            return { ...patient, workflowData };
          })
        );

        setAllPatients(patientsWithWorkflow);
      } else if (workflowStage === 'needs-surgery') {
        // Special case: fetch patients with needs-surgery observation
        results = await fetchPatientsByWorkflowStage(
          workflowStage,
          '',
          config.queueStatusWaitingUuid,
          config.needsSurgeryConceptUuid,
          config.workflowStages
        );
        setAllPatients(results);
      } else if (workflowStage !== 'all') {
        // Fetch patients from the workflow stage's queue
        const stage = config.workflowStages.find((s) => s.id === workflowStage);
        if (stage) {
          results = await fetchPatientsByWorkflowStage(
            workflowStage,
            stage.queueUuid,
            config.queueStatusWaitingUuid,
            config.needsSurgeryConceptUuid,
            config.workflowStages
          );
          setAllPatients(results);
        } else {
          setAllPatients([]);
        }
      } else {
        // No search query and 'all' selected - show empty list
        setAllPatients([]);
      }
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err instanceof Error ? err : new Error('Failed to load patients'));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter patients client-side based on workflow stage
  useEffect(() => {
    if (workflowStage === 'all') {
      setFilteredPatients(allPatients);
    } else if (workflowStage === 'needs-surgery') {
      // Already filtered by API for needs-surgery
      setFilteredPatients(allPatients);
    } else {
      // Filter by workflow stage client-side
      setFilteredPatients(
        allPatients.filter((p) => p.workflowData?.currentStage === workflowStage)
      );
    }
  }, [allPatients, workflowStage]);

  useEffect(() => {
    loadPatients();
  }, [searchQuery, workflowStage]);

  return {
    patients: filteredPatients,
    isLoading,
    error,
    refetch: loadPatients,
  };
}
