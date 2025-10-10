export type WorkflowStageId =
  | 'registration'
  | 'refraction'
  | 'eye-exam'
  | 'therapy'
  | 'finished';

export interface WorkflowStage {
  id: WorkflowStageId;
  label: string;
  color: string;
  queueUuid: string;
  formUuid: string;
  encounterTypeUuid: string;
}

export interface DateFilter {
  label: string;
  days: number | null;
}

export interface DateFiltersConfig {
  today: DateFilter;
  yesterday: DateFilter;
  lastWeek: DateFilter;
  lastMonth: DateFilter;
  custom: DateFilter;
}

export interface AugenAufConfig {
  visitEncounterTypeUuid: string;
  workflowStages: WorkflowStage[];
  surgeryWorkflowConceptUuid: string;
  needsSurgeryConceptUuid: string;
  dateFilters: DateFiltersConfig;
  queueStatusWaitingUuid: string;
  queueStatusInServiceUuid: string;
  queueStatusFinishedUuid: string;
}

export interface PatientWorkflowData {
  patientUuid: string;
  currentStage: WorkflowStageId;
  needsSurgery: boolean;
  completedStages: WorkflowStageId[];
  lastUpdated: string;
}

export interface PatientListItem {
  uuid: string;
  display: string;
  identifiers: Array<{
    identifier: string;
    identifierType: {
      display: string;
    };
  }>;
  person: {
    age: number;
    birthdate: string;
    gender: string;
    display: string;
  };
  workflowData?: PatientWorkflowData;
}

export interface FilterState {
  dateFilter: keyof DateFiltersConfig;
  customDateRange?: {
    start: Date;
    end: Date;
  };
  workflowStage: WorkflowStageId | 'all' | 'needs-surgery';
  searchQuery: string;
}
