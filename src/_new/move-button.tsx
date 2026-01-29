import { ComboButton, MenuItem } from "@carbon/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { movePatientToStage, QueueEntry } from "./patient-service";
import { ResolvedConfig } from "./new-config";
import { RuntimeStage } from "./types";

type Props = {
    queueEntry: QueueEntry;
    nextStage: RuntimeStage;
    allStages: RuntimeStage[];
    config: ResolvedConfig;
    onMoveComplete?: () => void;
}

export const MoveButton: React.FC<Props> = ({ queueEntry, nextStage, allStages, config, onMoveComplete }) => {
    const { t } = useTranslation();
    const [isMoving, setIsMoving] = React.useState(false);

    const handleMovePatient = (targetStage: RuntimeStage) => {
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
            label={isMoving ? t('moveButton.moving', 'Moving...') : t('moveButton.moveTo', 'Move to {{stageName}}', { stageName: nextStage.label })}
            disabled={isMoving}
            onClick={() => handleMovePatient(nextStage)}
        >
            {allStages.map((stage) => (
                <MenuItem
                    key={stage.queueUuid}
                    label={t('moveButton.moveTo', 'Move to {{stageName}}', { stageName: stage.label })}
                    onClick={() => handleMovePatient(stage)}
                />
            ))}
        </ComboButton>
    );
}