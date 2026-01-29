/**
 * Stage configuration as it comes from the config file
 * Supports both formUuid (direct UUID) and formName (looked up at runtime)
 */
export interface StageConfig {
    id: string;
    label: {
        en: string;
        de: string;
        es: string;
        [key: string]: string; // Allow other language codes
    };
    enabled: boolean;
    queueUuid: string;
    /** Form UUID - use this if the UUID is stable across deployments */
    formUuid?: string;
    /** Form name - use this if UUIDs change across deployments (will be resolved at runtime) */
    formName?: string;
}

/**
 * Resolved stage with guaranteed formUuid (after form name lookup)
 */
export interface Stage {
    id: string;
    label: {
        en: string;
        de: string;
        es: string;
        [key: string]: string;
    };
    enabled: boolean;
    queueUuid: string;
    formUuid: string; // Always resolved to actual UUID
}

export interface NewConfig {
    stages: StageConfig[];
    status: {
        waitingUuid: string;
        inServiceUuid: string;
        finishedUuid: string;
    }
    priorities: {
        normalUuid: string;
    }
}

/**
 * Config with resolved form UUIDs
 */
export interface ResolvedConfig {
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