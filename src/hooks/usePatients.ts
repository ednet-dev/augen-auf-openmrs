import { useEffect, useState } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { PatientListItem, WorkflowStageId, AugenAufConfig } from '../types';
import {
  searchPatients,
  fetchPatientsByWorkflowStage,
  fetchRecentPatients,
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

  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPatients = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let results: PatientListItem[];

      if (searchQuery.trim()) {
        // Search mode
        results = await searchPatients(searchQuery);
      } else if (workflowStage !== 'all') {
        // Filter by workflow stage
        results = await fetchPatientsByWorkflowStage(
          workflowStage,
          config.surgeryWorkflowConceptUuid
        );
      } else {
        // Default: load recent patients
        results = await fetchRecentPatients();
      }

      setPatients(results);
    } catch (err) {
      console.error('Error loading patients:', err);
      setError(err instanceof Error ? err : new Error('Failed to load patients'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [searchQuery, workflowStage]);

  return {
    patients,
    isLoading,
    error,
    refetch: loadPatients,
  };
}
