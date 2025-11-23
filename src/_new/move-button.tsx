import { Button } from "@carbon/react";
import { ArrowRight } from "@carbon/react/icons";
import { Patient } from "@openmrs/esm-framework/src";
import React from "react";
import { movePatientToStage, QueueEntry } from "./patient-service";

type Props = {
    queueEntry: QueueEntry;
    nextStage: Stage;
    onMoveComplete?: () => void;
}

export const MoveButton: React.FC<Props> = ({ queueEntry, nextStage, onMoveComplete }) => {
    const [isMoving, setIsMoving] = React.useState(false);

    const handleMovePatient = () => {
        setIsMoving(true);
        movePatientToStage(
            queueEntry.uuid,
            nextStage.queueUuid,
            nextStage.waitingStatusUuid
        ).then(() => {
            setIsMoving(false);
            onMoveComplete?.();
        }).catch(() => {
            setIsMoving(false);
        });
    };

    return (
        <Button
                  kind="primary"
                  renderIcon={ArrowRight}
                  size="md"
                  onClick={handleMovePatient}
                  disabled={isMoving}
                >
                  {isMoving ? 'Moving...' : `Move to ${nextStage.label}`}
        </Button>
    );
}