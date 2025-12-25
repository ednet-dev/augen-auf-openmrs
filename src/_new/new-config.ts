export interface StageConfig {
    queueUuid: string;
    formUuid: string;
}

export interface WorkflowStep {
    id: string;
    label: {
        en: string;
        de: string;
        es: string;
        [key: string]: string; // Allow other language codes
    };
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