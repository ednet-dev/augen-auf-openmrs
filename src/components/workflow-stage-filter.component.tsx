import React from 'react';
import { ClickableTile } from '@carbon/react';
import { WorkflowStage, WorkflowStageId } from '../types';
import styles from './workflow-stage-filter.scss';

interface WorkflowStageFilterProps {
  stages: WorkflowStage[];
  selectedStage: WorkflowStageId | 'all' | 'needs-surgery';
  onStageSelect: (stage: WorkflowStageId | 'all' | 'needs-surgery') => void;
}

const WorkflowStageFilter: React.FC<WorkflowStageFilterProps> = ({
  stages,
  selectedStage,
  onStageSelect,
}) => {
  return (
    <aside className={styles.workflowSidebar}>
      <div className={styles.workflowStages}>
        <ClickableTile
          className={`${styles.stageItem} ${
            selectedStage === 'all' ? styles.active : ''
          }`}
          onClick={() => onStageSelect('all')}
        >
          Show All
        </ClickableTile>
        {stages.map((stage) => (
          <ClickableTile
            key={stage.id}
            className={`${styles.stageItem} ${
              selectedStage === stage.id ? styles.active : ''
            }`}
            onClick={() => onStageSelect(stage.id)}
            style={{ borderLeftColor: stage.color }}
          >
            {stage.label} &gt;
          </ClickableTile>
        ))}
      </div>

      <div className={styles.protocolFilter}>
        <ClickableTile
          className={`${styles.stageItem} ${
            selectedStage === 'needs-surgery' ? styles.active : ''
          }`}
          onClick={() => onStageSelect('needs-surgery')}
        >
          Needs surgery &gt;
        </ClickableTile>
      </div>
    </aside>
  );
};

export default WorkflowStageFilter;
