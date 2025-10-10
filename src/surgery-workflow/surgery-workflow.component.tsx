import React, { useState } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import {
  Button,
  Dropdown,
  Search,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tile,
  ClickableTile,
  Layer,
} from '@carbon/react';
import { Settings, Printer, Add, Link } from '@carbon/react/icons';
import { AugenAufConfig, FilterState } from '../types';
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

  const dateFilterItems = Object.entries(config.dateFilters).map(([key, filter]) => ({
    id: key,
    label: filter.label,
  }));

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
        {/* Left Sidebar - Filters and Patient List */}
        <aside className={styles.sidebar}>
          {/* Filter Section (A) */}
          <Layer className={styles.filterSection}>
            <Dropdown
              id="date-filter"
              titleText="Filter by Date"
              label="Select date range"
              items={dateFilterItems}
              itemToString={(item) => item?.label || ''}
              selectedItem={dateFilterItems.find((item) => item.id === filterState.dateFilter)}
              onChange={({ selectedItem }) =>
                setFilterState({
                  ...filterState,
                  dateFilter: selectedItem.id as keyof typeof config.dateFilters,
                })
              }
            />

            <Search
              id="patient-search"
              labelText="Search for Patient"
              placeholder="Search for Patient"
              value={filterState.searchQuery}
              onChange={(e) =>
                setFilterState({ ...filterState, searchQuery: e.target.value })
              }
              size="sm"
            />
          </Layer>

          {/* Workflow Stage Filter (B) */}
          <div className={styles.workflowStages}>
            <ClickableTile
              className={`${styles.stageItem} ${
                filterState.workflowStage === 'all' ? styles.active : ''
              }`}
              onClick={() =>
                setFilterState({ ...filterState, workflowStage: 'all' })
              }
            >
              Show All
            </ClickableTile>
            {config.workflowStages.map((stage) => (
              <ClickableTile
                key={stage.id}
                className={`${styles.stageItem} ${
                  filterState.workflowStage === stage.id ? styles.active : ''
                }`}
                onClick={() =>
                  setFilterState({ ...filterState, workflowStage: stage.id })
                }
                style={{ borderLeftColor: stage.color }}
              >
                {stage.label} &gt;
              </ClickableTile>
            ))}
          </div>

          {/* Protocol Filter (B2) */}
          <div className={styles.protocolFilter}>
            <ClickableTile
              className={`${styles.stageItem} ${
                filterState.workflowStage === 'needs-surgery' ? styles.active : ''
              }`}
              onClick={() =>
                setFilterState({ ...filterState, workflowStage: 'needs-surgery' })
              }
            >
              Needs surgery &gt;
            </ClickableTile>
          </div>

          {/* Patient List (C) */}
          <div className={styles.patientList}>
            <div className={styles.patientListHeader}>Patients</div>
            <div className={styles.patientItems}>
              <ClickableTile
                className={`${styles.patientItem} ${
                  selectedPatient === '002' ? styles.active : ''
                }`}
                onClick={() => setSelectedPatient('002')}
              >
                Patient 002
              </ClickableTile>
              <ClickableTile
                className={styles.patientItem}
                onClick={() => setSelectedPatient('003')}
              >
                Patient 003
              </ClickableTile>
              <ClickableTile
                className={styles.patientItem}
                onClick={() => setSelectedPatient('005')}
              >
                Patient 005
              </ClickableTile>
              <ClickableTile className={`${styles.patientItem} ${styles.finished}`}>
                (Patient 001)
              </ClickableTile>
              <ClickableTile className={`${styles.patientItem} ${styles.finished}`}>
                (Patient 004)
              </ClickableTile>
            </div>
          </div>
        </aside>

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
  );
};

export default SurgeryWorkflow;
