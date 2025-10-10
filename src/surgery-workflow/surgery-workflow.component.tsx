import React, { useState } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import {
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tile,
} from '@carbon/react';
import { Settings, Printer, Add, Link } from '@carbon/react/icons';
import { AugenAufConfig, FilterState, PatientListItem } from '../types';
import FilterBar from '../components/filter-bar.component';
import WorkflowStageFilter from '../components/workflow-stage-filter.component';
import PatientList from '../components/patient-list.component';
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

  // Mock patient data - will be replaced with real API calls
  const mockPatients: PatientListItem[] = [
    {
      uuid: '002',
      display: 'Patient 002',
      identifiers: [],
      person: { age: 45, birthdate: '1979-01-01', gender: 'M', display: 'Patient 002' },
    },
    {
      uuid: '003',
      display: 'Patient 003',
      identifiers: [],
      person: { age: 52, birthdate: '1972-01-01', gender: 'F', display: 'Patient 003' },
    },
    {
      uuid: '005',
      display: 'Patient 005',
      identifiers: [],
      person: { age: 38, birthdate: '1986-01-01', gender: 'M', display: 'Patient 005' },
    },
    {
      uuid: '001',
      display: 'Patient 001',
      identifiers: [],
      person: { age: 60, birthdate: '1964-01-01', gender: 'F', display: 'Patient 001' },
      workflowData: {
        patientUuid: '001',
        currentStage: 'finished',
        needsSurgery: false,
        completedProtocols: ['protocol-1', 'protocol-2', 'protocol-3'],
        lastUpdated: new Date().toISOString(),
      },
    },
    {
      uuid: '004',
      display: 'Patient 004',
      identifiers: [],
      person: { age: 55, birthdate: '1969-01-01', gender: 'M', display: 'Patient 004' },
      workflowData: {
        patientUuid: '004',
        currentStage: 'finished',
        needsSurgery: false,
        completedProtocols: ['protocol-1', 'protocol-2'],
        lastUpdated: new Date().toISOString(),
      },
    },
  ];

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
          <PatientList
            patients={mockPatients}
            selectedPatientUuid={selectedPatient}
            onPatientSelect={(uuid) => setSelectedPatient(uuid)}
          />

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
