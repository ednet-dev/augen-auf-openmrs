import React, { useState } from 'react';
import { Button, Tabs, TabList, Tab, TabPanels, TabPanel, Tile } from '@carbon/react';
import { Printer, ArrowRight } from '@carbon/react/icons';
import { AugenAufConfig, PatientListItem, WorkflowStageId } from '../../types';
import PatientList from '../patient-list.component';
import styles from './stage-layout.scss';
import stageViewStyles from './stage-view.scss';

interface StandardStageLayoutProps {
  config: AugenAufConfig;
  patients: PatientListItem[];
  selectedPatientUuid: string | null;
  onPatientSelect: (uuid: string) => void;
  onMovePatient: (patientUuid: string, targetStage: WorkflowStageId) => Promise<void>;
  onMoveToNextStage: () => Promise<void>;
  getNextStage: () => WorkflowStageId | null;
}

const StandardStageLayout: React.FC<StandardStageLayoutProps> = ({
  config,
  patients,
  selectedPatientUuid,
  onPatientSelect,
  onMovePatient,
  onMoveToNextStage,
  getNextStage,
}) => {
  const [isMoving, setIsMoving] = useState(false);
  const selectedPatient = patients.find((p) => p.uuid === selectedPatientUuid);
  const currentStage = selectedPatient?.workflowData?.currentStage || 'registration';
  const stage = config.workflowStages.find((s) => s.id === currentStage);
  const nextStage = getNextStage();

  const handleMoveClick = async () => {
    setIsMoving(true);
    try {
      await onMoveToNextStage();
    } finally {
      setIsMoving(false);
    }
  };

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

      {/* Content area on the right */}
      <div className={styles.contentSection}>
        {selectedPatient && stage ? (
          <>
            {/* Tabs for Form and Info */}
            <Tabs>
              <TabList aria-label="Stage content tabs" contained>
                <Tab>Form</Tab>
                <Tab>Info</Tab>
              </TabList>

              <TabPanels>
                {/* Form Tab Panel */}
                <TabPanel>
                  <div className={stageViewStyles.stageView}>
                    <Tile className={stageViewStyles.formContainer}>
                      <h2>{stage.label} Form</h2>
                      <div className={stageViewStyles.patientInfo}>
                        <p><strong>Patient:</strong> {selectedPatient.display}</p>
                        <p><strong>ID:</strong> {selectedPatient.uuid}</p>
                      </div>
                      <div className={stageViewStyles.formPlaceholder}>
                        <p>Form engine will render here</p>
                        <p>Form UUID: {stage.formUuid || 'Not configured'}</p>
                      </div>
                    </Tile>
                  </div>
                </TabPanel>

                {/* Info Tab Panel */}
                <TabPanel>
                  <div className={stageViewStyles.stageView}>
                    <Tile className={stageViewStyles.infoContainer}>
                      <h2>Accumulated Information</h2>
                      <div className={stageViewStyles.infoContent}>
                        <p><strong>Patient:</strong> {selectedPatient.display}</p>
                        <p><strong>Current Stage:</strong> {stage.label}</p>
                        {selectedPatient.workflowData && (
                          <>
                            <p><strong>Completed Stages:</strong></p>
                            <ul>
                              {selectedPatient.workflowData.completedStages.map((stageId, idx) => (
                                <li key={idx}>{stageId}</li>
                              ))}
                            </ul>
                            {selectedPatient.workflowData.needsSurgery && (
                              <p><strong>Status:</strong> Needs Surgery</p>
                            )}
                          </>
                        )}
                        <p className={stageViewStyles.placeholder}>
                          Encounter data from previous stages will be displayed here
                        </p>
                      </div>
                    </Tile>
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>

            {/* Action Bar */}
            <div className={styles.actionBar}>
              <Button
                kind="secondary"
                renderIcon={Printer}
                size="md"
              >
                Print
              </Button>
              {nextStage && (
                <Button
                  kind="primary"
                  renderIcon={ArrowRight}
                  size="md"
                  onClick={handleMoveClick}
                  disabled={isMoving}
                >
                  {isMoving ? 'Moving...' : `Move to ${config.workflowStages.find((s) => s.id === nextStage)?.label}`}
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className={styles.noPatientSelected}>
            <p>Select a patient from the list to view their information</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardStageLayout;
