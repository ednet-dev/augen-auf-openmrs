import React, { useState } from 'react';
import { ClickableTile, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { PatientListItem, WorkflowStage, WorkflowStageId } from '../types';
import styles from './patient-list.scss';

interface PatientListProps {
  patients: PatientListItem[];
  selectedPatientUuid: string | null;
  workflowStages: WorkflowStage[];
  onPatientSelect: (patientUuid: string) => void;
  onMovePatient?: (patientUuid: string, targetStage: WorkflowStageId) => Promise<void>;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  selectedPatientUuid,
  workflowStages,
  onPatientSelect,
  onMovePatient,
}) => {
  const [movingPatient, setMovingPatient] = useState<string | null>(null);

  const handleMovePatient = async (patientUuid: string, targetStage: WorkflowStageId) => {
    if (!onMovePatient) return;

    setMovingPatient(patientUuid);
    try {
      await onMovePatient(patientUuid, targetStage);
    } catch (error) {
      console.error('Error moving patient:', error);
    } finally {
      setMovingPatient(null);
    }
  };

  return (
    <aside className={styles.patientListSidebar}>
      <div className={styles.patientList}>
        <div className={styles.patientListHeader}>Patients</div>
        <div className={styles.patientItems}>
          {patients.map((patient) => {
            const isFinished = patient.workflowData?.currentStage === 'finished';
            const isActive = patient.uuid === selectedPatientUuid;
            const isMoving = movingPatient === patient.uuid;
            const currentStage = patient.workflowData?.currentStage;

            return (
              <div key={patient.uuid} className={styles.patientItemWrapper}>
                <ClickableTile
                  className={`${styles.patientItem} ${
                    isActive ? styles.active : ''
                  } ${isFinished ? styles.finished : ''}`}
                  onClick={() => onPatientSelect(patient.uuid)}
                  disabled={isMoving}
                >
                  <span>
                    {isFinished ? `(${patient.display})` : patient.display}
                    {isMoving && ' (Moving...)'}
                  </span>
                </ClickableTile>
                {onMovePatient && (
                  <OverflowMenu
                    size="sm"
                    flipped
                    aria-label={`Move ${patient.display}`}
                    className={styles.patientMenu}
                  >
                    {workflowStages
                      .filter((stage) => stage.id !== currentStage)
                      .map((stage) => (
                        <OverflowMenuItem
                          key={stage.id}
                          itemText={`Move to ${stage.label}`}
                          onClick={() => handleMovePatient(patient.uuid, stage.id)}
                          disabled={isMoving}
                        />
                      ))}
                  </OverflowMenu>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default PatientList;
