export type WorkflowStageId =
  | 'registration'
  | 'refraction'
  | 'eye-exam'
  | 'therapy'
  | 'finished';

export type ProtocolId = 'protocol-1' | 'protocol-2' | 'protocol-3';

export interface WorkflowStage {
  id: WorkflowStageId;
  label: string;
  color: string;
  encounterTypeUuid: string;
}

export interface Protocol {
  name: string;
  formUuid: string;
  encounterTypeUuid: string;
  icon: string;
  color: string;
}

export interface ProtocolsConfig {
  [key: string]: Protocol;
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
  protocols: ProtocolsConfig;
  workflowStages: WorkflowStage[];
  surgeryWorkflowConceptUuid: string;
  needsSurgeryConceptUuid: string;
  dateFilters: DateFiltersConfig;
}

export interface PatientWorkflowData {
  patientUuid: string;
  currentStage: WorkflowStageId;
  needsSurgery: boolean;
  completedProtocols: ProtocolId[];
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
  protocolFilter: ProtocolId | 'all';
  searchQuery: string;
}
