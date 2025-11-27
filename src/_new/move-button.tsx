import { ComboButton, MenuItem } from "@carbon/react";
import { ArrowRight } from "@carbon/react/icons";
import { Patient } from "@openmrs/esm-framework/src";
import React from "react";
import { movePatientToStage, QueueEntry } from "./patient-service";

type Props = {
    queueEntry: QueueEntry;
    nextStage: Stage;
    allStages: Stage[];
    onMoveComplete?: () => void;
}

export const MoveButton: React.FC<Props> = ({ queueEntry, nextStage, allStages, onMoveComplete }) => {
    const [isMoving, setIsMoving] = React.useState(false);

    const handleMovePatient = (targetStage: Stage) => {
        setIsMoving(true);
        movePatientToStage(
            queueEntry.uuid,
            targetStage.queueUuid,
            targetStage.waitingStatusUuid
        ).then(() => {
            setIsMoving(false);
            onMoveComplete?.();
        }).catch(() => {
            setIsMoving(false);
        });
    };

    return (
        <ComboButton
            label={isMoving ? 'Moving...' : `Move to ${nextStage.label}`}
            disabled={isMoving}
            onClick={() => handleMovePatient(nextStage)}
        >
            {allStages.map((stage) => (
                <MenuItem
                    key={stage.queueUuid}
                    label={`Move to ${stage.label}`}
                    onClick={() => handleMovePatient(stage)}
                />
            ))}
        </ComboButton>
    );
}