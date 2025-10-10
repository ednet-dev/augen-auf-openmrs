import React, { useState } from 'react';
import { useConfig, showToast } from '@openmrs/esm-framework';
import {
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tile,
  InlineLoading,
} from '@carbon/react';
import { Settings, Printer, Add, Link, ArrowRight } from '@carbon/react/icons';
import { AugenAufConfig, FilterState, WorkflowStageId } from '../types';
import FilterBar from '../components/filter-bar.component';
import WorkflowStageFilter from '../components/workflow-stage-filter.component';
import PatientList from '../components/patient-list.component';
import { usePatients } from '../hooks/usePatients';
import { movePatientToStage } from '../services/patient.service';
import { useConfigValidation } from '../utils/config-validation';
import styles from './surgery-workflow.scss';

const SurgeryWorkflow: React.FC = () => {
  const config = useConfig() as AugenAufConfig;

  // Validate configuration on mount
  const configValidation = useConfigValidation(config);

  const [filterState, setFilterState] = useState<FilterState>({
    dateFilter: 'today',
    workflowStage: 'all',
    searchQuery: '',
  });

  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<WorkflowStageId>('registration');

  // Load patients using the service
  const { patients, isLoading, error, refetch } = usePatients({
    searchQuery: filterState.searchQuery,
    workflowStage: filterState.workflowStage,
  });

  // Handle moving patient to a new stage
  const handleMovePatient = async (patientUuid: string, targetStage: WorkflowStageId) => {
    const stage = config.workflowStages.find((s) => s.id === targetStage);
    if (!stage) {
      showToast({
        title: 'Error',
        kind: 'error',
        description: `Invalid workflow stage: ${targetStage}`,
      });
      return;
    }

    try {
      await movePatientToStage(
        patientUuid,
        targetStage,
        stage.queueUuid,
        config.queueStatusWaitingUuid
      );

      showToast({
        title: 'Success',
        kind: 'success',
        description: `Patient moved to ${stage.label}`,
      });

      // Refresh patient list
      refetch();
    } catch (error) {
      showToast({
        title: 'Error',
        kind: 'error',
        description: `Failed to move patient: ${error.message || 'Unknown error'}`,
      });
    }
  };

  // Get the next workflow stage for the selected patient
  const getNextStage = (): WorkflowStageId | null => {
    if (!selectedPatient) return null;

    const patient = patients.find((p) => p.uuid === selectedPatient);
    const currentStage = patient?.workflowData?.currentStage;

    if (!currentStage) return config.workflowStages[0]?.id || null;

    const currentIndex = config.workflowStages.findIndex((s) => s.id === currentStage);
    if (currentIndex === -1 || currentIndex >= config.workflowStages.length - 1) {
      return null; // Already at last stage
    }

    return config.workflowStages[currentIndex + 1].id;
  };

  // Handle moving patient to next stage
  const handleMoveToNextStage = async () => {
    if (!selectedPatient) return;

    const nextStage = getNextStage();
    if (!nextStage) {
      showToast({
        title: 'Info',
        kind: 'info',
        description: 'Patient is already at the final stage',
      });
      return;
    }

    await handleMovePatient(selectedPatient, nextStage);
  };

  return (
    <div className={styles.surgeryWorkflowContainer}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Surgery Workflow</h1>
        </div>
        <div className={styles.headerRight}>
          <Button
            kind="tertiary"
            renderIcon={Link}
            size="sm"
          >
            Link to Database
          </Button>
          <Button
            kind="ghost"
            renderIcon={Settings}
            hasIconOnly
            iconDescription="Settings"
            size="sm"
          />
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Top Filter Section (A) */}
        <FilterBar
          dateFilters={config.dateFilters}
          selectedDateFilter={filterState.dateFilter}
          searchQuery={filterState.searchQuery}
          onDateFilterChange={(filter) =>
            setFilterState({ ...filterState, dateFilter: filter })
          }
          onSearchChange={(query) =>
            setFilterState({ ...filterState, searchQuery: query })
          }
        />

        {/* Sidebar Area with Workflow Stages and Patient List */}
        <div className={styles.sidebarContainer}>
          {/* Left: Workflow Stage Filter (B) */}
          <WorkflowStageFilter
            stages={config.workflowStages}
            selectedStage={filterState.workflowStage}
            onStageSelect={(stage) =>
              setFilterState({ ...filterState, workflowStage: stage })
            }
          />

          {/* Right: Patient List (C) */}
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
              selectedPatientUuid={selectedPatient}
              workflowStages={config.workflowStages}
              onPatientSelect={(uuid) => setSelectedPatient(uuid)}
              onMovePatient={handleMovePatient}
            />
          )}

          {/* Main Content Area */}
          <main className={styles.contentArea}>
          {/* Top Actions (D) */}
          <div className={styles.topActions}>
            <Button
              kind="primary"
              renderIcon={Add}
              size="md"
            >
              Add new patient
            </Button>
          </div>

          {/* Stage Tabs (E) - 2 tabs: Form for current stage and Info from previous stages */}
          {selectedPatient && (() => {
            const patient = patients.find((p) => p.uuid === selectedPatient);
            const currentStage = patient?.workflowData?.currentStage || 'registration';
            const stage = config.workflowStages.find((s) => s.id === currentStage);

            if (!stage) return null;

            return (
              <Tabs>
                <TabList aria-label="Stage content tabs" contained>
                  <Tab>Form</Tab>
                  <Tab>Info</Tab>
                </TabList>

                <TabPanels>
                  {/* Form Tab Panel */}
                  <TabPanel>
                    <div className={styles.formArea}>
                      <Tile className={styles.formPlaceholder}>
                        <h2>ID: {selectedPatient}</h2>
                        <h3>{stage.label} Form</h3>
                        <p>Form engine will render here</p>
                        <p>Form UUID: {stage.formUuid || 'Not configured'}</p>
                      </Tile>
                    </div>
                  </TabPanel>

                  {/* Info Tab Panel */}
                  <TabPanel>
                    <div className={styles.formArea}>
                      <Tile className={styles.formPlaceholder}>
                        <h2>ID: {selectedPatient}</h2>
                        <h3>Accumulated Information</h3>
                        <p>Display gathered data from previous stages here</p>
                        {/* TODO: Fetch and display encounter data from completed stages */}
                      </Tile>
                    </div>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            );
          })()}

          {!selectedPatient && (
            <div className={styles.noSelection}>
              <p>Select a patient to view their stage forms</p>
            </div>
          )}

          {/* Action Bar (F) */}
          <div className={styles.actionBar}>
            {selectedPatient && getNextStage() && (
              <Button
                kind="primary"
                renderIcon={ArrowRight}
                size="md"
                onClick={handleMoveToNextStage}
              >
                Move to {config.workflowStages.find((s) => s.id === getNextStage())?.label}
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
        </main>
        </div>
      </div>
    </div>
  );
};

export default SurgeryWorkflow;
