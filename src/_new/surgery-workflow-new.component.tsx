import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { GenericWorkflow } from "./workflows/generic-workflow";
import { RegistrationWorkflow } from "./workflows/registration-workflow";
import { SideNav, SideNavItems, SideNavLink } from "@carbon/react";
import { InlineLoading } from "@carbon/react";
import styles from "./surgery-workflow-new.scss";
import { ResolvedConfig } from "./new-config";
import { ConfigResolverProvider, useResolvedConfig } from "./config-resolver";

/**
 * Inner component that uses the resolved config
 */
const SurgeryWorkflowContent = () => {
    const { config, isLoading, error, unresolvedForms } = useResolvedConfig();
    const { t, i18n } = useTranslation();
    const [selectedWorkflow, setSelectedWorkflow] = useState(0);

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <InlineLoading description={t('workflow.resolvingForms', 'Resolving form configurations...')} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                {t('workflow.configError', 'Error loading configuration: {{message}}', { message: error.message })}
            </div>
        );
    }

    if (!config) {
        return (
            <div className={styles.errorContainer}>
                {t('workflow.noConfig', 'No configuration available')}
            </div>
        );
    }

    // Log any unresolved forms as warnings
    if (unresolvedForms.length > 0) {
        console.warn('Some forms could not be resolved:', unresolvedForms);
    }

    // Build stages from resolved configuration
    const enabledStages = config.stages.filter(stage => stage.enabled);
    
    // Get current language or fallback to English
    const currentLanguage = i18n.language || 'en';
    
    const allStages = enabledStages.map(stage => ({
        label: stage.label[currentLanguage] || stage.label['en'] || Object.values(stage.label)[0],
        queueUuid: stage.queueUuid,
        formUuid: stage.formUuid,
        waitingStatusUuid: config.status.waitingUuid
    }));
    
    // Build workflows dynamically
    const workflows = [
        {
            id: "registration",
            label: t('workflow.registration', 'Registration'),
            component: () => (
                <RegistrationWorkflow 
                    nextStage={allStages[0]} 
                    allStages={allStages} 
                    config={config} 
                />
            )
        },
        ...enabledStages.map((step, index) => ({
            id: step.id,
            label: step.label[currentLanguage] || step.label['en'] || Object.values(step.label)[0],
            component: () => (
                <GenericWorkflow
                    stage={allStages[index]}
                    nextStage={allStages[index + 1] || allStages[0]}
                    allStages={allStages}
                    config={config}
                />
            )
        }))
    ];

    return (
        <div className={styles.workflowContainer}>
            <SideNav 
                expanded 
                aria-label={t('navigation.workflowNavigation', 'Workflow navigation')}
                className={styles.workflowSideNav}
            >
                <SideNavItems>
                    {workflows.map((workflow, index) => (
                        <SideNavLink
                            key={workflow.id}
                            isActive={selectedWorkflow === index}
                            onClick={(e) => {
                                e.preventDefault();
                                setSelectedWorkflow(index);
                            }}
                        >
                            {workflow.label}
                        </SideNavLink>
                    ))}
                </SideNavItems>
            </SideNav>
            <div className={styles.workflowContentColumn} key={workflows[selectedWorkflow].id}>
                {workflows[selectedWorkflow].component()}
            </div>
        </div>
    );
}

/**
 * Main component wrapped with ConfigResolverProvider
 * Resolves form names to UUIDs before rendering the workflow
 */
const SurgeryWorkflowNew = () => {
    return (
        <ConfigResolverProvider>
            <SurgeryWorkflowContent />
        </ConfigResolverProvider>
    );
};

export default SurgeryWorkflowNew;