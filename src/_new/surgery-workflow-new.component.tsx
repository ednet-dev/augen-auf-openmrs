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

    const refractionStage = { label:"Refraction", queueUuid: config.stages.refraction.queueUuid, waitingStatusUuid: config.status.waitingUuid };
    const eyeExamStage = { label:"Eye Exam", queueUuid: config.stages.eyeExam.queueUuid, waitingStatusUuid: config.status.waitingUuid };
    const therapyStage = { label:"Therapy", queueUuid: config.stages.therapy.queueUuid, waitingStatusUuid: config.status.waitingUuid };
    
    const allStages = [refractionStage, eyeExamStage, therapyStage];
    
    const workflows = [
        {
            id: "registration",
            label: "Registration Workflow",
            component: () => <RegistrationWorkflow nextStage={refractionStage} allStages={allStages} config={config} />
        },
        {
            id: "refraction",
            label: "Refraction Workflow",
            component: () => (
                <GenericWorkflow
                    stage={refractionStage}
                    nextStage={eyeExamStage}
                    allStages={allStages}
                    config={config}
                />
            )
        },
        {
            id: "eye-exam",
            label: "Eye Exam Workflow",
            component: () => (
                <GenericWorkflow 
                    stage={eyeExamStage}
                    nextStage={therapyStage}
                    allStages={allStages}
                    config={config}
                />
            )
        },
        {
            id: "therapy",
            label: "Therapy Workflow",
            component: () => (
                <GenericWorkflow 
                    stage={therapyStage}
                    nextStage={refractionStage}
                    allStages={allStages}
                    config={config}
                />
            )
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
                {workflows[selectedWorkflow].component()}
            </div>
        </div>
    );
}

export default SurgeryWorkflowNew;