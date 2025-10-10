import React, { useState } from 'react';
import { useConfig } from '@openmrs/esm-framework';
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

  return (
    <div className={styles.surgeryWorkflowContainer}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Surgery Workflow</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.linkButton}>
            Link to Database (e.g. Statistic)
          </button>
          <button className={styles.settingsButton}>⚙</button>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Left Sidebar - Filters and Patient List */}
        <aside className={styles.sidebar}>
          {/* Filter Section (A) */}
          <div className={styles.filterSection}>
            <div className={styles.dateFilter}>
              <label>Filter by Date</label>
              <select
                value={filterState.dateFilter}
                onChange={(e) =>
                  setFilterState({
                    ...filterState,
                    dateFilter: e.target.value as keyof typeof config.dateFilters,
                  })
                }
              >
                {Object.entries(config.dateFilters).map(([key, filter]) => (
                  <option key={key} value={key}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search for Patient"
                value={filterState.searchQuery}
                onChange={(e) =>
                  setFilterState({ ...filterState, searchQuery: e.target.value })
                }
              />
            </div>
          </div>

          {/* Workflow Stage Filter (B) */}
          <div className={styles.workflowStages}>
            <div
              className={`${styles.stageItem} ${
                filterState.workflowStage === 'all' ? styles.active : ''
              }`}
              onClick={() =>
                setFilterState({ ...filterState, workflowStage: 'all' })
              }
            >
              Show All
            </div>
            {config.workflowStages.map((stage) => (
              <div
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
              </div>
            ))}
          </div>

          {/* Protocol Filter (B2) */}
          <div className={styles.protocolFilter}>
            <div
              className={`${styles.stageItem} ${
                filterState.workflowStage === 'needs-surgery' ? styles.active : ''
              }`}
              onClick={() =>
                setFilterState({ ...filterState, workflowStage: 'needs-surgery' })
              }
            >
              Needs surgery &gt;
            </div>
          </div>

          {/* Patient List (C) */}
          <div className={styles.patientList}>
            <div className={styles.patientListHeader}>Patients</div>
            <div className={styles.patientItems}>
              <div
                className={`${styles.patientItem} ${styles.active}`}
                onClick={() => setSelectedPatient('002')}
              >
                Patient 002
              </div>
              <div
                className={styles.patientItem}
                onClick={() => setSelectedPatient('003')}
              >
                Patient 003
              </div>
              <div
                className={styles.patientItem}
                onClick={() => setSelectedPatient('005')}
              >
                Patient 005
              </div>
              <div className={`${styles.patientItem} ${styles.finished}`}>
                (Patient 001)
              </div>
              <div className={`${styles.patientItem} ${styles.finished}`}>
                (Patient 004)
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={styles.contentArea}>
          {/* Top Actions (D) */}
          <div className={styles.topActions}>
            <button className={styles.addPatientButton}>add new patient</button>
          </div>

          {/* Protocol Tabs (E) */}
          <div className={styles.protocolTabs}>
            {Object.entries(config.protocols).map(([key, protocol]) => (
              <button
                key={key}
                className={`${styles.protocolTab} ${
                  selectedProtocol === key ? styles.activeTab : ''
                }`}
                style={{
                  backgroundColor:
                    selectedProtocol === key ? protocol.color : undefined,
                }}
                onClick={() => setSelectedProtocol(key)}
              >
                {protocol.name}
              </button>
            ))}
          </div>

          {/* Form Display Area */}
          <div className={styles.formArea}>
            {selectedPatient ? (
              <div className={styles.formPlaceholder}>
                <h2>ID: {selectedPatient}</h2>
                <h3>{config.protocols[selectedProtocol]?.name || 'Form'}</h3>
                <p>Form engine will render here</p>
                <p>Form UUID: {config.protocols[selectedProtocol]?.formUuid || 'Not configured'}</p>
              </div>
            ) : (
              <div className={styles.noSelection}>
                <p>Select a patient to view their protocol forms</p>
              </div>
            )}
          </div>

          {/* Print Button (F) */}
          <div className={styles.actionBar}>
            <button className={styles.printButton}>PRINT</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SurgeryWorkflow;
