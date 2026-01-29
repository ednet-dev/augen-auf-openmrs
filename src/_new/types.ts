/**
 * Runtime stage type used in workflow components
 * Has resolved label (single string) and waitingStatusUuid
 */
export type RuntimeStage = {
    label: string;
    queueUuid: string;
    waitingStatusUuid: string;
    formUuid: string;  // Always a resolved UUID (never a form name)
}