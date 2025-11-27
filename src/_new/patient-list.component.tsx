import React from "react";
import { Patient } from "@openmrs/esm-framework/src";
import { ClickableTile, InlineLoading } from "@carbon/react";
import { EmptyState } from "./empty-state.component";
import { UserMultiple, WarningAlt } from "@carbon/react/icons";
import styles from './patient-list.scss';

type Props = {
    patients: Patient[];
    selectedPatient: Patient | null;
    onPatientSelect?: (patient: Patient) => void;
    isLoading?: boolean;
    error?: Error | null;
}

const PatientTile = ({ patient, isSelected, onSelect }: { patient: Patient; isSelected: boolean; onSelect: () => void }) => {
    return (
        <div className={styles.patientItemWrapper}>
            <ClickableTile onClick={onSelect} className={`${styles.patientItem} ${isSelected ? styles.active : ''}`}>
                {patient.display}
            </ClickableTile>
        </div>
    );
}

export const PatientList: React.FC<Props> = ({ patients, selectedPatient, onPatientSelect, isLoading, error }) => {
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className={styles.centeredContainer}>
                    <InlineLoading description="Loading patients..." />
                </div>
            );
        }

        if (error) {
            return (
                <EmptyState 
                    icon={WarningAlt}
                    title="Failed to load patients"
                    description={error.message || "An error occurred while loading the patient queue"}
                />
            );
        }

        if (patients.length === 0) {
            return (
                <EmptyState 
                    icon={UserMultiple}
                    title="No patients in queue"
                    description="There are currently no patients waiting in this stage"
                />
            );
        }

        return patients.map(patient => (
            <PatientTile 
                key={patient.uuid}
                patient={patient}
                isSelected={selectedPatient?.uuid === patient.uuid}
                onSelect={() => onPatientSelect?.(patient)}
            />
        ));
    };

    return (
        <aside className={styles.patientListSidebar}>
            <div className={styles.patientList}>
                <div className={styles.patientListHeader}>Patients</div>
                <div className={styles.patientItems}>
                    {renderContent()}
                </div>
            </div>
        </aside>
    );
}