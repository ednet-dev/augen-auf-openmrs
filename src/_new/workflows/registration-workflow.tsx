import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchPatients } from "../hooks/use-search-patients";
import { PatientList } from "../patient-list.component";
import { TextInput } from "@carbon/react";
import { MoveButton } from "../move-button";
import { Patient } from "@openmrs/esm-framework";
import { NewConfig } from "../new-config";

type Props = {
    nextStage: Stage;
    allStages: Stage[];
    config: NewConfig;
}

export const RegistrationWorkflow = (props: Props) => {
    const { t } = useTranslation();
    const { setQuery, patients, isLoading, error, refresh } = useSearchPatients();
    const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);

    return (
        <div>
            <TextInput
                id="patient-search-input"
                labelText={t('search.searchPatients', 'Search Patients')}
                placeholder={t('search.enterNameOrId', 'Enter patient name or ID')}
                onChange={(e) => setQuery(e.target.value)}
                style={{ marginBottom: '1rem' }}
            />

            <PatientList
                emptyStateTitle={t('patientList.noPatientsFound', 'No patients found')}
                emptyStateDescription={t('patientList.adjustSearchCriteria', 'Try adjusting your search criteria')}
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
                        config={props.config}
                        onMoveComplete={refresh}
                        />
                )}
            />
        </div>
    );
}