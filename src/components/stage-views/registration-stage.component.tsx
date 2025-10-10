import React from 'react';
import { Tile, Button } from '@carbon/react';
import { Add, Search } from '@carbon/react/icons';
import { PatientListItem, WorkflowStage } from '../../types';
import styles from './stage-view.scss';

interface RegistrationStageProps {
  patient: PatientListItem;
  stage: WorkflowStage;
  mode: 'form' | 'info';
}

const RegistrationStage: React.FC<RegistrationStageProps> = ({ patient, stage, mode }) => {
  const isNewPatient = !patient.uuid;

  if (mode === 'form') {
    return (
      <div className={styles.stageView}>
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

          {!isNewPatient && (
            <>
              <div className={styles.patientInfo}>
                <p><strong>Patient ID:</strong> {patient.uuid}</p>
                <p><strong>Name:</strong> {patient.display}</p>
                <p><strong>Age:</strong> {patient.person.age}</p>
                <p><strong>Gender:</strong> {patient.person.gender}</p>
              </div>
              <div className={styles.formPlaceholder}>
                <p>Registration form will render here</p>
                <p>Form UUID: {stage.formUuid || 'Not configured'}</p>
              </div>
            </>
          )}

          {isNewPatient && (
            <div className={styles.formPlaceholder}>
              <p>New patient registration form will render here</p>
              <p>Form UUID: {stage.formUuid || 'Not configured'}</p>
              <p className={styles.formNote}>
                Use the buttons above to launch the OpenMRS patient registration form
                or search for an existing patient to continue with their workflow.
              </p>
            </div>
          )}
        </Tile>
      </div>
    );
  }

  // Info mode - show what's been collected
  return (
    <div className={styles.stageView}>
      <Tile className={styles.infoContainer}>
        <h2>Registration Information</h2>
        <div className={styles.infoContent}>
          <p><strong>Patient ID:</strong> {patient.uuid}</p>
          <p><strong>Name:</strong> {patient.display}</p>
          <p><strong>Age:</strong> {patient.person.age}</p>
          <p><strong>Gender:</strong> {patient.person.gender}</p>
          {patient.identifiers && patient.identifiers.length > 0 && (
            <div>
              <p><strong>Identifiers:</strong></p>
              <ul>
                {patient.identifiers.map((id, idx) => (
                  <li key={idx}>
                    {id.identifierType.display}: {id.identifier}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Tile>
    </div>
  );
};

export default RegistrationStage;
