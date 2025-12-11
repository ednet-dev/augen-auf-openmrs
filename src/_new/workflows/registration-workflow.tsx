import React, { useEffect } from "react";
import { useSearchPatients } from "../hooks/use-search-patients";
import { PatientList } from "../patient-list.component";
import { TextInput } from "@carbon/react";
import { MoveButton } from "../move-button";
import { Patient } from "@openmrs/esm-framework/src";

type Props = {
    nextStage: Stage;
    allStages: Stage[];
}

export const RegistrationWorkflow = (props: Props) => {
    const { setQuery, patients, isLoading, error, refresh } = useSearchPatients();
    const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);

    return (
        <div>
            <TextInput
                id="patient-search-input"
                labelText="Search Patients"
                placeholder="Enter patient name or ID"
                onChange={(e) => setQuery(e.target.value)}
                style={{ marginBottom: '1rem' }}
            />

            <PatientList
                emptyStateTitle="No patients found"
                emptyStateDescription="Try adjusting your search criteria"
                patients={patients}
                selectedPatient={selectedPatient}
                onPatientSelect={setSelectedPatient}
                isLoading={isLoading}
                error={error}
                renderPatientActions={(patient) => (
                    <MoveButton 
                        queueEntry={{ uuid: "", patient }}
                        nextStage={props.nextStage}
                        allStages={props.allStages}
                        onMoveComplete={refresh}
                        />
                )}
            />
        </div>
    );
}