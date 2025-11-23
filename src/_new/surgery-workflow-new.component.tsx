import React from "react";
import { RefractionWorkflow } from "./workflows/refraction-workflow";
import { useConfig } from "@openmrs/esm-framework";
import { AugenAufConfig } from "../types";
import { EyeExamWorkflow } from "./workflows/eye-exam-workflow";
import { Tab, TabList, TabListVertical, TabPanel, TabPanels, Tabs, TabsVertical } from "@carbon/react";
import { Activity } from "@carbon/react/icons";

type WorkFlow = {
    id: string;
    label: string;
    component: JSX.Element;
}

const SurgeryWorkflowNew = () => {
    const config = useConfig() as AugenAufConfig;      
    const [selectedWorkflow, setSelectedWorkflow] = React.useState<WorkFlow | undefined>(undefined);

    const refractionStage = { label:"Refraction", queueUuid: "aa004400-1234-5678-90ab-000000000002", waitingStatusUuid: config.queueStatusWaitingUuid };
    const eyeExamStage = { label:"Eye Exam", queueUuid: "aa004400-1234-5678-90ab-000000000003", waitingStatusUuid: config.queueStatusWaitingUuid };
    const therapyStage = { label:"Therapy", queueUuid: "aa004400-1234-5678-90ab-000000000004", waitingStatusUuid: config.queueStatusWaitingUuid }; 
    
    const workflows: WorkFlow[] = [
        {
            id: "refraction",
            label: "Refraction Workflow",
            component: <RefractionWorkflow stage={refractionStage} nextStage={eyeExamStage} />,
        },
        {
            id: "eye-exam",
            label: "Eye Exam Workflow",
            component: <EyeExamWorkflow stage={eyeExamStage} nextStage={therapyStage} />,
        },
        {
            id: "therapy",
            label: "Therapy Workflow",
            component: <EyeExamWorkflow stage={therapyStage} nextStage={refractionStage} />,
        },
    ];

    console.log(workflows);

    return (
        <TabsVertical>
            <TabListVertical>
                {workflows.map((workflow) => (
                    <Tab
                        key={workflow.id}
                        renderIcon={Activity}
                    >
                        {workflow.label}
                    </Tab>
                ))}
            </TabListVertical>
            <TabPanels>
                {workflows.map((workflow) => (
                    <TabPanel key={workflow.id}>
                        {workflow.component}
                    </TabPanel>
                ))}
            </TabPanels>
        </TabsVertical>
    );
}

export default SurgeryWorkflowNew;