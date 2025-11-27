import React from "react";
import { Patient } from "@openmrs/esm-framework/src";
import { ClickableTile } from "@carbon/react";
import { EmptyState } from "./empty-state.component";
import { UserMultiple } from "@carbon/react/icons";
import styles from './patient-list.scss';

type Props = {
    patients: Patient[];
    selectedPatient: Patient | null;
    onPatientSelect?: (patient: Patient) => void;
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

export const PatientList: React.FC<Props> = ({ patients, selectedPatient, onPatientSelect }) => {
    return (
        <aside className={styles.patientListSidebar}>
            <div className={styles.patientList}>
                <div className={styles.patientListHeader}>Patients</div>
                <div className={styles.patientItems}>
                {patients.length > 0 ? (
                    patients.map(patient => (
                        <PatientTile 
                            key={patient.uuid}
                            patient={patient}
                            isSelected={selectedPatient?.uuid === patient.uuid}
                            onSelect={() => onPatientSelect?.(patient)}
                        />
                    ))
                ) : (
                    <EmptyState 
                        icon={UserMultiple}
                        title="No patients in queue"
                        description="There are currently no patients waiting in this stage"
                    />
                )}
                </div>
            </div>
        </aside>
    );
}