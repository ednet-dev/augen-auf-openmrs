import { Button } from "@carbon/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { endQueueEntry, endVisit, movePatientToStage, QueueEntry } from "./patient-service";
import { NewConfig } from "./new-config";
import { Visit } from "@openmrs/esm-framework/src";

type Props = {
    queueEntry: QueueEntry;
    config: NewConfig;
    activeVisit: Visit | null;
    onEndComplete?: () => void;
}

export const EndVisitButton: React.FC<Props> = ({ queueEntry, config, activeVisit, onEndComplete }) => {
    const { t } = useTranslation();
    const [isEnding, setIsEnding] = React.useState(false);

    const handleEndVisit = async () => {
            // Implement end visit logic here
            setIsEnding(true);

            await endVisit(activeVisit);
            await endQueueEntry(queueEntry.uuid);

            // Example: call an API to end the visit
            // After successful end visit
            setIsEnding(false);
            onEndComplete?.();   
        }

    return (
        <Button disabled={isEnding} onClick={() => {
            handleEndVisit();
        }}>
            {isEnding ? t('endVisitButton.ending', 'Ending...') : t('endVisitButton.endVisit', 'End Visit')}
        </Button>
    );
}