
import React, { useState } from "react";
import { FormEngine, type FormSchema } from "@openmrs/esm-form-engine-lib";
import { PatientList } from "../patient-list.component";
import { CalendarHeatMapIcon, ConditionsIcon, Patient, ProgramsIcon } from "@openmrs/esm-framework";
import { MoveButton } from "../move-button";
import { useQueueEntries } from "../hooks/use-queue-entries";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@carbon/react";
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
    
    const handleMoveComplete = () => {
        setSelectedPatient(null);
        refresh();
    };

    // Dummy form schema for testing
    const dummySchema: FormSchema = {
        encounterType: 'aa003300-1234-5678-90ab-000000000002',
        name: 'Eye Exam Form',
        pages: [
            {
                label: 'Eye Exam',
                sections: [
                    {
                        label: 'Visual Acuity',
                        isExpanded: 'true',
                        questions: [
                            {
                                label: 'Right Eye',
                                type: 'obs',
                                questionOptions: {
                                    rendering: 'text' as const,
                                    concept: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                                },
                                id: 'rightEye', 
                            },
                        ],
                    },
                ],
            },
        ],
        processor: 'EncounterFormProcessor',
        referencedForms: [],
        uuid: 'eye-exam-form-uuid',
    };
    
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

            <div className={styles.tabsContainer}>
                {selectedPatient ? (
                    <Tabs>
                        <TabList contained>
                            <Tab renderIcon={AlignBoxTopLeft}>Form</Tab>
                            <Tab renderIcon={CalendarHeatMapIcon}>Visits</Tab>
                            <Tab renderIcon={ConditionsIcon}>Conditions</Tab>
                            <Tab renderIcon={ProgramsIcon}>Therapies</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <div className={styles.formTabContent}>
                                    <div className={styles.formScrollContainer}>
                                        <h3>Patient Form</h3>
                                        <FormEngine 
                                            key={selectedPatient.uuid}
                                            formJson={dummySchema} 
                                            patientUUID={selectedPatient.uuid}
                                            visit={undefined}
                                            formSessionIntent="enter"
                                        />
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
                                </div>
                            </TabPanel>
                            <TabPanel>Coming soon...</TabPanel>
                            <TabPanel>Coming soon...</TabPanel>
                            <TabPanel>Coming soon...</TabPanel>
                        </TabPanels>
                    </Tabs>
                ) : (
                    <EmptyState
                        icon={Person}
                        title="No patient selected"
                        description="Select a patient from the queue on the left to view their information and fill out forms"
                    />
                )}
            </div>
        </div>
    );
}