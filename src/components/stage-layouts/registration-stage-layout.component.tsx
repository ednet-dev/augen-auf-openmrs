import React from 'react';
import { Tile, Button } from '@carbon/react';
import { Add, Search } from '@carbon/react/icons';
import { AugenAufConfig, PatientListItem, WorkflowStageId } from '../../types';
import PatientList from '../patient-list.component';
import styles from './stage-layout.scss';

interface RegistrationStageLayoutProps {
  config: AugenAufConfig;
  patients: PatientListItem[];
  selectedPatientUuid: string | null;
  onPatientSelect: (uuid: string) => void;
  onMovePatient: (patientUuid: string, targetStage: WorkflowStageId) => Promise<void>;
}

const RegistrationStageLayout: React.FC<RegistrationStageLayoutProps> = ({
  config,
  patients,
  selectedPatientUuid,
  onPatientSelect,
  onMovePatient,
}) => {
  const registrationStage = config.workflowStages.find((s) => s.id === 'registration');
  const selectedPatient = patients.find((p) => p.uuid === selectedPatientUuid);

  return (
    <div className={styles.stageLayout}>
      {/* Patient List on the left */}
      <PatientList
        patients={patients}
        selectedPatientUuid={selectedPatientUuid}
        workflowStages={config.workflowStages}
        onPatientSelect={onPatientSelect}
        onMovePatient={onMovePatient}
      />

      {/* Registration content on the right */}
      <div className={styles.contentSection}>
        <Tile className={styles.contentTile}>
          <h2>Patient Registration</h2>

          <div className={styles.registrationActions}>
            <Button
              kind="primary"
              renderIcon={Add}
              size="md"
            >
              Register Patient
            </Button>
            <Button
              kind="secondary"
              renderIcon={Search}
              size="md"
            >
              Search For Patient
            </Button>
          </div>

          {selectedPatient ? (
            <>
              <div className={styles.patientInfo}>
                <p><strong>Patient ID:</strong> {selectedPatient.uuid}</p>
                <p><strong>Name:</strong> {selectedPatient.display}</p>
                <p><strong>Age:</strong> {selectedPatient.person.age}</p>
                <p><strong>Gender:</strong> {selectedPatient.person.gender}</p>
              </div>
              <div className={styles.formPlaceholder}>
                <p>Registration form will render here</p>
                <p>Form UUID: {registrationStage?.formUuid || 'Not configured'}</p>
              </div>
            </>
          ) : (
            <div className={styles.formPlaceholder}>
              <p>New patient registration form will render here</p>
              <p>Form UUID: {registrationStage?.formUuid || 'Not configured'}</p>
              <p className={styles.formNote}>
                Use the buttons above to launch the OpenMRS patient registration form
                or search for an existing patient to continue with their workflow.
              </p>
            </div>
          )}
        </Tile>
      </div>
    </div>
  );
};

export default RegistrationStageLayout;
