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
    renderPatientActions?: (patient: Patient) => React.ReactNode;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
}

const PatientTile = ({ patient, isSelected, onSelect, renderActions }: { 
    patient: Patient; 
    isSelected: boolean; 
    onSelect: () => void;
    renderActions?: (patient: Patient) => React.ReactNode;
}) => {
    return (
        <div className={styles.patientItemWrapper}>
            <ClickableTile onClick={onSelect} className={`${styles.patientItem} ${isSelected ? styles.active : ''}`}>
                {patient.display}
            </ClickableTile>
            {renderActions && (
                <div className={styles.patientActions}>
                    {renderActions(patient)}
                </div>
            )}
        </div>
    );
}

export const PatientList: React.FC<Props> = ({ patients, selectedPatient, onPatientSelect, isLoading, error, renderPatientActions, emptyStateTitle, emptyStateDescription }) => {
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
                    title={emptyStateTitle || "No patients in queue"}
                    description={emptyStateDescription || "There are currently no patients waiting in this stage"}
                />
            );
        }

        return patients.map(patient => (
            <PatientTile 
                key={patient.uuid}
                patient={patient}
                isSelected={selectedPatient?.uuid === patient.uuid}
                onSelect={() => onPatientSelect?.(patient)}
                renderActions={renderPatientActions}
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