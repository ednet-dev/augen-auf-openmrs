export interface StageConfig {
    queueUuid: string;
    formUuid: string;
}

export interface WorkflowStep {
    id: string;
    label: string;
    enabled: boolean;
    queueUuid: string;
    formUuid: string;
}

export interface NewConfig {
    workflowSteps: WorkflowStep[];
    status: {
        waitingUuid: string;
        inServiceUuid: string;
        finishedUuid: string;
    }
    priorities: {
        normalUuid: string;
    }
}