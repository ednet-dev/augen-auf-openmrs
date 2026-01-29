import { Button } from "@carbon/react";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  endQueueEntry,
  endVisit,
  movePatientToStage,
  QueueEntry,
} from "./patient-service";
import { ResolvedConfig } from "./new-config";
import { Visit } from "@openmrs/esm-framework/src";

type Props = {
  queueEntry: QueueEntry;
  config: ResolvedConfig;
  activeVisit: Visit | null;
  onEndComplete?: () => void;
};

export const EndVisitButton: React.FC<Props> = ({
  queueEntry,
  config,
  activeVisit,
  onEndComplete,
}) => {
  const { t } = useTranslation();
  const [isEnding, setIsEnding] = React.useState(false);

  const handleEndVisit = async () => {
    if (!activeVisit) {
      console.warn("Cannot end visit: no active visit found");
      return;
    }

    setIsEnding(true);

    try {
      await endVisit(activeVisit);
      await endQueueEntry(queueEntry.uuid);
      onEndComplete?.();
    } catch (error) {
      console.error("Error ending visit:", error);
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <Button
      disabled={isEnding || !activeVisit}
      onClick={() => {
        handleEndVisit();
      }}
    >
      {isEnding
        ? t("endVisitButton.ending", "Ending...")
        : t("endVisitButton.endVisit", "End Visit")}
    </Button>
  );
};
