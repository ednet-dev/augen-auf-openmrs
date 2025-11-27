
import React, { useState } from "react";
import { FormEngine, type FormSchema } from "@openmrs/esm-form-engine-lib";
import { PatientList } from "../patient-list.component";
import { CalendarHeatMapIcon, ConditionsIcon, Patient, ProgramsIcon } from "@openmrs/esm-framework";
import { MoveButton } from "../move-button";
import { useQueueEntries } from "../hooks/use-queue-entries";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@carbon/react";
import { AlignBoxTopLeft } from "@carbon/react/icons";
import styles from "./generic-workflow.scss";

type Props = {
    stage: Stage;
    nextStage: Stage;
}

export const GenericWorkflow = (props: Props) => {
    const queueEntries = useQueueEntries(props.stage.queueUuid, props.stage.waitingStatusUuid);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

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
                />
            </div>

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
                            {selectedPatient ? (
                                <div>
                                    <h3>Patient Form</h3>
                                    <FormEngine 
                                        formJson={dummySchema} 
                                        patientUUID={selectedPatient.uuid}
                                        visit={undefined}
                                        formSessionIntent="enter"
                                    />
                                    <MoveButton queueEntry={queueEntries.find(entry => entry.patient.uuid === selectedPatient?.uuid)!} nextStage={props.nextStage} />
                                </div>
                            ) : (
                                <div>
                                    <h3>Select a patient</h3>
                                    <p>Choose a patient from the queue to view and fill out their form</p>
                                </div>
                            )}
                        </TabPanel>
                        <TabPanel>Coming soon...</TabPanel>
                        <TabPanel>Coming soon...</TabPanel>
                        <TabPanel>Coming soon...</TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        </div>
    );
}