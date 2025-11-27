import React, { useState } from "react";
import { useConfig } from "@openmrs/esm-framework";
import { AugenAufConfig } from "../types";
import { GenericWorkflow } from "./workflows/generic-workflow";
import { SideNav, SideNavItems, SideNavLink } from "@carbon/react";
import styles from "./surgery-workflow-new.scss";

const SurgeryWorkflowNew = () => {
    const config = useConfig() as AugenAufConfig;
    const [selectedWorkflow, setSelectedWorkflow] = useState(0);

    const refractionStage = { label:"Refraction", queueUuid: "aa004400-1234-5678-90ab-000000000002", waitingStatusUuid: config.queueStatusWaitingUuid };
    const eyeExamStage = { label:"Eye Exam", queueUuid: "aa004400-1234-5678-90ab-000000000003", waitingStatusUuid: config.queueStatusWaitingUuid };
    const therapyStage = { label:"Therapy", queueUuid: "aa004400-1234-5678-90ab-000000000004", waitingStatusUuid: config.queueStatusWaitingUuid }; 
    
    const workflows = [
        {
            id: "refraction",
            label: "Refraction Workflow",
            component: <GenericWorkflow stage={refractionStage} nextStage={eyeExamStage} />,
        },
        {
            id: "eye-exam",
            label: "Eye Exam Workflow",
            component: <GenericWorkflow stage={eyeExamStage} nextStage={therapyStage} />,
        },
        {
            id: "therapy",
            label: "Therapy Workflow",
            component: <GenericWorkflow stage={therapyStage} nextStage={refractionStage} />,
        },
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
            <div className={styles.workflowContentColumn}>
                {workflows[selectedWorkflow]?.component}
            </div>
        </div>
    );
}

export default SurgeryWorkflowNew;