export interface Stage {
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
    stages: Stage[];
    status: {
        waitingUuid: string;
        inServiceUuid: string;
        finishedUuid: string;
    }
    priorities: {
        normalUuid: string;
    }
}