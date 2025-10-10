import React from 'react';
import { Tile } from '@carbon/react';
import { PatientListItem, WorkflowStage } from '../../types';
import styles from './stage-view.scss';

interface DefaultStageProps {
  patient: PatientListItem;
  stage: WorkflowStage;
  mode: 'form' | 'info';
}

const DefaultStage: React.FC<DefaultStageProps> = ({ patient, stage, mode }) => {
  if (mode === 'form') {
    return (
      <div className={styles.stageView}>
        <Tile className={styles.formContainer}>
          <h2>{stage.label} Form</h2>
          <div className={styles.patientInfo}>
            <p><strong>Patient:</strong> {patient.display}</p>
            <p><strong>ID:</strong> {patient.uuid}</p>
          </div>
          <div className={styles.formPlaceholder}>
            <p>Form engine will render here</p>
            <p>Form UUID: {stage.formUuid || 'Not configured'}</p>
          </div>
        </Tile>
      </div>
    );
  }

  // Info mode - show accumulated information
  return (
    <div className={styles.stageView}>
      <Tile className={styles.infoContainer}>
        <h2>Accumulated Information</h2>
        <div className={styles.infoContent}>
          <p><strong>Patient:</strong> {patient.display}</p>
          <p><strong>Current Stage:</strong> {stage.label}</p>
          {patient.workflowData && (
            <>
              <p><strong>Completed Stages:</strong></p>
              <ul>
                {patient.workflowData.completedStages.map((stageId, idx) => (
                  <li key={idx}>{stageId}</li>
                ))}
              </ul>
              {patient.workflowData.needsSurgery && (
                <p><strong>Status:</strong> Needs Surgery</p>
              )}
            </>
          )}
          <p className={styles.placeholder}>
            Encounter data from previous stages will be displayed here
          </p>
        </div>
      </Tile>
    </div>
  );
};

export default DefaultStage;
