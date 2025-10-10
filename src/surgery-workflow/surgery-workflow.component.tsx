import React, { useState } from 'react';
import { useConfig, showToast } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';
import { Settings, Link } from '@carbon/react/icons';
import { AugenAufConfig, FilterState, WorkflowStageId } from '../types';
import FilterBar from '../components/filter-bar.component';
import WorkflowStageFilter from '../components/workflow-stage-filter.component';
import RegistrationStageLayout from '../components/stage-layouts/registration-stage-layout.component';
import StandardStageLayout from '../components/stage-layouts/standard-stage-layout.component';
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

  // Determine which stage layout to render
  const renderStageLayout = () => {
    if (filterState.workflowStage === 'registration') {
      return (
        <RegistrationStageLayout
          config={config}
          patients={patients}
          selectedPatientUuid={selectedPatient}
          onPatientSelect={(uuid) => setSelectedPatient(uuid)}
          onMovePatient={handleMovePatient}
        />
      );
    }

    return (
      <StandardStageLayout
        config={config}
        patients={patients}
        selectedPatientUuid={selectedPatient}
        onPatientSelect={(uuid) => setSelectedPatient(uuid)}
        onMovePatient={handleMovePatient}
        onMoveToNextStage={handleMoveToNextStage}
        getNextStage={getNextStage}
      />
    );
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

        {/* Sidebar with Workflow Stage Filter */}
        <div className={styles.sidebarContainer}>
          <WorkflowStageFilter
            stages={config.workflowStages}
            selectedStage={filterState.workflowStage}
            onStageSelect={(stage) =>
              setFilterState({ ...filterState, workflowStage: stage })
            }
          />

          {/* Render the appropriate stage layout */}
          {renderStageLayout()}
        </div>
      </div>
    </div>
  );
};

export default SurgeryWorkflow;
