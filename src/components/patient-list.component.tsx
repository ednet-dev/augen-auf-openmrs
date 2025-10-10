import React from 'react';
import { ClickableTile } from '@carbon/react';
import { PatientListItem } from '../types';
import styles from './patient-list.scss';

interface PatientListProps {
  patients: PatientListItem[];
  selectedPatientUuid: string | null;
  onPatientSelect: (patientUuid: string) => void;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  selectedPatientUuid,
  onPatientSelect,
}) => {
  return (
    <aside className={styles.patientListSidebar}>
      <div className={styles.patientList}>
        <div className={styles.patientListHeader}>Patients</div>
        <div className={styles.patientItems}>
          {patients.map((patient) => {
            const isFinished = patient.workflowData?.currentStage === 'finished';
            const isActive = patient.uuid === selectedPatientUuid;

            return (
              <ClickableTile
                key={patient.uuid}
                className={`${styles.patientItem} ${
                  isActive ? styles.active : ''
                } ${isFinished ? styles.finished : ''}`}
                onClick={() => onPatientSelect(patient.uuid)}
              >
                {isFinished ? `(${patient.display})` : patient.display}
              </ClickableTile>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default PatientList;
