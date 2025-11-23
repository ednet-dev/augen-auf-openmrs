import React, { useState } from "react";
import { FormEngine, type FormSchema } from "@openmrs/esm-form-engine-lib";
import { PatientList } from "../patient-list.component";
import { Patient } from "@openmrs/esm-framework/src";
import { MoveButton } from "../move-button";
import { useQueueEntries } from "../hooks/use-queue-entries";

type Props = {
    stage: Stage;
    nextStage: Stage;
}

export const EyeExamWorkflow = (props: Props) => {
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
    
    return <div>
        <h2>Eye Exam Workflow</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
            <PatientList patients={queueEntries.map(entry => entry.patient)} selectedPatient={selectedPatient} onPatientSelect={(patient) => setSelectedPatient(patient)} />

            <div style={{ flex: 2 }}>
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
            </div>
        </div>
    </div>;
}