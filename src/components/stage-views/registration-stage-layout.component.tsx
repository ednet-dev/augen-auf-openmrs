import React from 'react';
import { Tile, Button, InlineLoading } from '@carbon/react';
import { Add, Search } from '@carbon/react/icons';
import { AugenAufConfig, PatientListItem, WorkflowStage, WorkflowStageId } from '../../types';
import PatientList from '../patient-list.component';
import styles from './stage-view.scss';

interface RegistrationStageLayoutProps {
  config: AugenAufConfig;
  patients: PatientListItem[];
  isLoading: boolean;
  error: Error | null;
  selectedPatientUuid: string | null;
  onPatientSelect: (uuid: string) => void;
  onMovePatient: (patientUuid: string, targetStage: WorkflowStageId) => Promise<void>;
}

const RegistrationStageLayout: React.FC<RegistrationStageLayoutProps> = ({
  config,
  patients,
  isLoading,
  error,
  selectedPatientUuid,
  onPatientSelect,
  onMovePatient,
}) => {
  const registrationStage = config.workflowStages.find((s) => s.id === 'registration');
  const selectedPatient = patients.find((p) => p.uuid === selectedPatientUuid);

  return (
    <div className={styles.registrationLayout}>
      {/* Patient List on the left */}
      <div className={styles.registrationPatientList}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <InlineLoading description="Loading patients..." />
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>Error loading patients: {error.message}</p>
          </div>
        ) : (
          <PatientList
            patients={patients}
            selectedPatientUuid={selectedPatientUuid}
            workflowStages={config.workflowStages}
            onPatientSelect={onPatientSelect}
            onMovePatient={onMovePatient}
          />
        )}
      </div>

      {/* Registration form on the right */}
      <div className={styles.registrationFormArea}>
        <Tile className={styles.formContainer}>
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
