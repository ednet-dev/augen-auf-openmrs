import React, { useState } from 'react';
import { useConfig, launchWorkspace } from '@openmrs/esm-framework';
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
import { Settings, Printer, Add, Link } from '@carbon/react/icons';
import { AugenAufConfig, FilterState } from '../types';
import FilterBar from '../components/filter-bar.component';
import WorkflowStageFilter from '../components/workflow-stage-filter.component';
import PatientList from '../components/patient-list.component';
import { usePatients } from '../hooks/usePatients';
import styles from './surgery-workflow.scss';

const SurgeryWorkflow: React.FC = () => {
  const config = useConfig() as AugenAufConfig;

  const [filterState, setFilterState] = useState<FilterState>({
    dateFilter: 'today',
    workflowStage: 'all',
    protocolFilter: 'all',
    searchQuery: '',
  });

  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<string>('protocol-1');

  // Load patients using the service
  const { patients, isLoading, error } = usePatients({
    searchQuery: filterState.searchQuery,
    workflowStage: filterState.workflowStage,
  });

  // Handler for opening patient registration workspace
  const handleAddPatient = () => {
    launchWorkspace('patient-registration');
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
              onPatientSelect={(uuid) => setSelectedPatient(uuid)}
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
              onClick={handleAddPatient}
            >
              Add new patient
            </Button>
          </div>

          {/* Protocol Tabs (E) */}
          <Tabs selectedIndex={Object.keys(config.protocols).indexOf(selectedProtocol)}>
            <TabList aria-label="Protocol tabs" contained>
              {Object.entries(config.protocols).map(([key, protocol]) => (
                <Tab
                  key={key}
                  onClick={() => setSelectedProtocol(key)}
                >
                  {protocol.name}
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {Object.entries(config.protocols).map(([key, protocol]) => (
                <TabPanel key={key}>
                  {/* Form Display Area */}
                  <div className={styles.formArea}>
                    {selectedPatient ? (
                      <Tile className={styles.formPlaceholder}>
                        <h2>ID: {selectedPatient}</h2>
                        <h3>{protocol.name}</h3>
                        <p>Form engine will render here</p>
                        <p>Form UUID: {protocol.formUuid || 'Not configured'}</p>
                      </Tile>
                    ) : (
                      <div className={styles.noSelection}>
                        <p>Select a patient to view their protocol forms</p>
                      </div>
                    )}
                  </div>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>

          {/* Print Button (F) */}
          <div className={styles.actionBar}>
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
