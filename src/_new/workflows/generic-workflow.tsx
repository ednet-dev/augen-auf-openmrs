
import React, { useState } from "react";
import { FormEngine } from "@openmrs/esm-form-engine-lib";
import { PatientList } from "../patient-list.component";
import { CalendarHeatMapIcon, ConditionsIcon, Patient, ProgramsIcon } from "@openmrs/esm-framework";
import { MoveButton } from "../move-button";
import { useQueueEntries } from "../hooks/use-queue-entries";
import { useActiveVisit } from "../hooks/use-active-visit";
import { Button, Tab, TabList, TabPanel, TabPanels, Tabs } from "@carbon/react";
import { AlignBoxTopLeft, Person } from "@carbon/react/icons";
import { EmptyState } from "../empty-state.component";
import styles from "./generic-workflow.scss";
import { NewConfig } from "../new-config";

type Props = {
    stage: Stage;
    nextStage: Stage;
    allStages: Stage[];
    config: NewConfig;
}

export const GenericWorkflow = (props: Props) => {
    const { queueEntries, isLoading, error, refresh } = useQueueEntries(props.stage.queueUuid, props.stage.waitingStatusUuid);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const { activeVisit, isLoading: visitLoading, encounterUuid } = useActiveVisit(selectedPatient?.uuid, props.stage.formUuid);
    
    const handleMoveComplete = () => {
        setSelectedPatient(null);
        refresh();
    };

    /*const triggerFormValidation = () => {
         window.dispatchEvent(
            new CustomEvent('ampath-form-action', {
                detail: {
                    formUuid: props.stage.formUuid,
                    patientUuid: selectedPatient?.uuid,
                    action: 'validateForm',
                },
            })
        );
    };

    const triggerFormSubmission = () => {
         window.dispatchEvent(
            new CustomEvent('ampath-form-action', {
                detail: {
                    formUuid: props.stage.formUuid,
                    patientUuid: selectedPatient?.uuid,
                    action: 'onSubmit',
                },
            })
        );
    }*/
    
    return (
        <div className={styles.workflowWrapper}>
            <div className={styles.patientListContainer}>
                <PatientList 
                    patients={queueEntries.map(entry => entry.patient)} 
                    selectedPatient={selectedPatient} 
                    onPatientSelect={(patient) => setSelectedPatient(patient)}
                    isLoading={isLoading}
                    error={error}
                />
            </div>

            {selectedPatient ? (
                <>
                    <div className={styles.tabsContainer}>
                        <Tabs>
                            <TabList contained>
                                <Tab renderIcon={AlignBoxTopLeft}>Form</Tab>
                                <Tab renderIcon={CalendarHeatMapIcon}>Visits</Tab>
                                <Tab renderIcon={ConditionsIcon}>Conditions</Tab>
                                <Tab renderIcon={ProgramsIcon}>Therapies</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    {visitLoading ? (
                                        <div>Loading visit...</div>
                                    ) : (
                                        <FormEngine 
                                            key={`${selectedPatient.uuid}-${activeVisit?.uuid}-${encounterUuid || 'new'}`}
                                            onSubmit={(data) => console.log("onSubmit", data)}
                                            formUUID={props.stage.formUuid}
                                            patientUUID={selectedPatient.uuid}
                                            visit={activeVisit}
                                            encounterUUID={encounterUuid}
                                            formSessionIntent={encounterUuid ? "edit" : "enter"}
                                            mode="edit"
                                            hidePatientBanner={false}
                                        />
                                    )}
                                </TabPanel>
                                <TabPanel>Coming soon...</TabPanel>
                                <TabPanel>Coming soon...</TabPanel>
                                <TabPanel>Coming soon...</TabPanel>
                            </TabPanels>
                        </Tabs>
                    </div>

                    <div className={styles.moveButtonContainer}>
                        <MoveButton 
                            queueEntry={queueEntries.find(entry => entry.patient.uuid === selectedPatient?.uuid)!} 
                            nextStage={props.nextStage} 
                            allStages={props.allStages}
                            config={props.config}
                            onMoveComplete={handleMoveComplete}
                        />
                    </div>
                </>
            ) : (
                <div className={styles.emptyStateContainer}>
                    <EmptyState
                        icon={Person}
                        title="No patient selected"
                        description="Select a patient from the queue on the left to view their information and fill out forms"
                    />
                </div>
            )}
        </div>
    );
}