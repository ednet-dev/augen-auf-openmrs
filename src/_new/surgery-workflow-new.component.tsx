import React, { useState } from "react";
import { useConfig } from "@openmrs/esm-framework";
import { GenericWorkflow } from "./workflows/generic-workflow";
import { RegistrationWorkflow } from "./workflows/registration-workflow";
import { SideNav, SideNavItems, SideNavLink } from "@carbon/react";
import styles from "./surgery-workflow-new.scss";
import { NewConfig } from "./new-config";

const SurgeryWorkflowNew = () => {
    const config = useConfig() as NewConfig;
    const [selectedWorkflow, setSelectedWorkflow] = useState(0);

    // Build stages from dynamic configuration
    const enabledSteps = config.workflowSteps.filter(step => step.enabled);
    
    const allStages = enabledSteps.map(step => ({
        label: step.label,
        queueUuid: step.queueUuid,
        formUuid: step.formUuid,
        waitingStatusUuid: config.status.waitingUuid
    }));
    
    // Build workflows dynamically
    const workflows = [
        {
            id: "registration",
            label: "Registration",
            component: () => (
                <RegistrationWorkflow 
                    nextStage={allStages[0]} 
                    allStages={allStages} 
                    config={config} 
                />
            )
        },
        ...enabledSteps.map((step, index) => ({
            id: step.id,
            label: step.label,
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
                aria-label="Workflow navigation"
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