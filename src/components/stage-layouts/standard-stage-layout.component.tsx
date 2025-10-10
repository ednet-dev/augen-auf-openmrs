import React from 'react';
import { Button, Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { Printer, ArrowRight } from '@carbon/react/icons';
import { AugenAufConfig, PatientListItem, WorkflowStageId } from '../../types';
import PatientList from '../patient-list.component';
import { getStageComponent } from '../stage-views';
import styles from './stage-layout.scss';

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
  const selectedPatient = patients.find((p) => p.uuid === selectedPatientUuid);
  const currentStage = selectedPatient?.workflowData?.currentStage || 'registration';
  const stage = config.workflowStages.find((s) => s.id === currentStage);
  const StageComponent = stage ? getStageComponent(currentStage) : null;
  const nextStage = getNextStage();

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
        {selectedPatient && stage && StageComponent ? (
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
                  <StageComponent patient={selectedPatient} stage={stage} mode="form" />
                </TabPanel>

                {/* Info Tab Panel */}
                <TabPanel>
                  <StageComponent patient={selectedPatient} stage={stage} mode="info" />
                </TabPanel>
              </TabPanels>
            </Tabs>

            {/* Action Bar */}
            <div className={styles.actionBar}>
              {nextStage && (
                <Button
                  kind="primary"
                  renderIcon={ArrowRight}
                  size="md"
                  onClick={onMoveToNextStage}
                >
                  Move to {config.workflowStages.find((s) => s.id === nextStage)?.label}
                </Button>
              )}
              <Button
                kind="secondary"
                renderIcon={Printer}
                size="md"
              >
                Print
              </Button>
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
