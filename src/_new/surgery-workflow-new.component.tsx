import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useConfig } from "@openmrs/esm-framework";
import { GenericWorkflow } from "./workflows/generic-workflow";
import { RegistrationWorkflow } from "./workflows/registration-workflow";
import { SideNav, SideNavItems, SideNavLink } from "@carbon/react";
import styles from "./surgery-workflow-new.scss";
import { NewConfig } from "./new-config";

const SurgeryWorkflowNew = () => {
    const config = useConfig() as NewConfig;
    const { t, i18n } = useTranslation();
    const [selectedWorkflow, setSelectedWorkflow] = useState(0);

    // Build stages from dynamic configuration
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

export default SurgeryWorkflowNew;