import { ComboButton, MenuItem } from "@carbon/react";
import React from "react";
import { movePatientToStage, QueueEntry } from "./patient-service";
import { NewConfig } from "./new-config";

type Props = {
    queueEntry: QueueEntry;
    nextStage: Stage;
    allStages: Stage[];
    config: NewConfig;
    onMoveComplete?: () => void;
}

export const MoveButton: React.FC<Props> = ({ queueEntry, nextStage, allStages, config, onMoveComplete }) => {
    const [isMoving, setIsMoving] = React.useState(false);

    const handleMovePatient = (targetStage: Stage) => {
        setIsMoving(true);
        movePatientToStage(
            queueEntry.uuid,
            queueEntry.patient.uuid,
            targetStage.queueUuid,
            config
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