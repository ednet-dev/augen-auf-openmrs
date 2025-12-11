export interface StageConfig {
    queueUuid: string;
    formUuid: string;
}

export interface NewConfig {
    stages: {
        refraction: StageConfig;
        eyeExam: StageConfig;
        therapy: StageConfig;
        preSurgery: StageConfig;
        surgery: StageConfig;
    }
    status: {
        waitingUuid: string;
        inServiceUuid: string;
        finishedUuid: string;
    }
    priorities: {
        normalUuid: string;
    }
}