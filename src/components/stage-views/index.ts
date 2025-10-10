import React from 'react';
import { PatientListItem, WorkflowStage, WorkflowStageId } from '../../types';
import RegistrationStage from './registration-stage.component';
import DefaultStage from './default-stage.component';

interface StageViewProps {
  patient: PatientListItem;
  stage: WorkflowStage;
  mode: 'form' | 'info';
}

/**
 * Component map for stage-specific views
 * Add custom components here for stages that need special layouts
 */
const stageComponents: Record<WorkflowStageId, React.FC<StageViewProps>> = {
  registration: RegistrationStage,
  refraction: DefaultStage,
  'eye-exam': DefaultStage,
  therapy: DefaultStage,
  finished: DefaultStage,
};

/**
 * Get the appropriate component for a given workflow stage
 */
export const getStageComponent = (stageId: WorkflowStageId): React.FC<StageViewProps> => {
  return stageComponents[stageId] || DefaultStage;
};

export { RegistrationStage, DefaultStage };
export type { StageViewProps };
