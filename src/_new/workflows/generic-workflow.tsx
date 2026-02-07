import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormEngine, SessionMode } from "@openmrs/esm-form-engine-lib";
import { PatientList } from "../patient-list.component";
import {
  CalendarHeatMapIcon,
  ConditionsIcon,
  Patient,
  ProgramsIcon,
} from "@openmrs/esm-framework";
import { MoveButton } from "../move-button";
import { useQueueEntries } from "../hooks/use-queue-entries";
import { useActiveVisit } from "../hooks/use-active-visit";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@carbon/react";
import { AlignBoxTopLeft, Person } from "@carbon/react/icons";
import { EmptyState } from "../empty-state.component";
import styles from "./generic-workflow.scss";
import { ResolvedConfig } from "../new-config";
import { RuntimeStage } from "../types";
import { EndVisitButton } from "../end-visit-button";
import { useO3FormSchema } from "../hooks/getFormUUID";

type Props = {
  stage: RuntimeStage;
  nextStage: RuntimeStage;
  allStages: RuntimeStage[];
  config: ResolvedConfig;
};

export const GenericWorkflow = (props: Props) => {
  const { t } = useTranslation();
  const { queueEntries, isLoading, error, refresh } = useQueueEntries(
    props.stage.queueUuid,
    props.stage.waitingStatusUuid,
  );
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const {
    activeVisit,
    isLoading: visitLoading,
    encounterUuid,
    encounterUuidPerForm,
    error: visitError,
  } = useActiveVisit(selectedPatient?.uuid, props.stage.formUuid);

  const handleMoveComplete = () => {
    setSelectedPatient(null);
    refresh();
  };

  const otherStages = props.allStages.filter(
    (stage) => stage.formUuid !== props.stage.formUuid,
  );

  const {  
    formUuid: resolvedFormUuid,
    isLoading: isFormLoading,
    error: formError,
  } = useO3FormSchema(props.stage.formUuid);

  return (
    <div className={styles.workflowWrapper}>
      <div className={styles.patientListContainer}>
        <PatientList
          patients={queueEntries.map((entry) => entry.patient)}
          selectedPatient={selectedPatient}
          onPatientSelect={(patient) => setSelectedPatient(patient)}
          isLoading={isLoading}
          error={error}
        />
      </div>

      {selectedPatient ? (
        <>
          <div className={styles.tabsContainer}>
            <Tabs>
              <TabList contained>
                <Tab renderIcon={AlignBoxTopLeft}>
                  {t("workflow.formTab", "Form")}
                </Tab>
                {otherStages.map((stage) => (
                  <Tab key={`displayform-{stage.formUuid}`}>Form: {stage.label}</Tab>
                ))}
              </TabList>
              <TabPanels>
                <TabPanel key={`displayform-{resolvedFormUuid ?? props.stage.formUuid}`}>
                  {isFormLoading ? (
                    <div>{t("workflow.loadingForm", "Loading form...")}</div>
                  ) : formError ? (
                    <div className={styles.errorState}>
                      {t("workflow.formError", "Error loading form: {{error}}", {
                        error: formError.message,
                      })}
                    </div>                  
                    ) : !resolvedFormUuid ? (
                    <div className={styles.errorState}>
                      {t("workflow.formNotFound", "Form not found or invalid.")}
                    </div>
                  ) : visitLoading ? (
                    <div>{t("workflow.loadingVisit", "Loading visit...")}</div>
                  ) : visitError ? (
                    <div className={styles.errorState}>
                      {t(
                        "workflow.visitError",
                        "Error loading visit: {{error}}",
                        { error: visitError.message },
                      )}
                    </div>
                  ) : !activeVisit ? (
                    <div className={styles.errorState}>
                      {t(
                        "workflow.noVisit",
                        "No active visit found. Please ensure the patient has been registered properly.",
                      )}
                    </div>
                  ) : (
                    <FormEngine                 
                      // key={`${selectedPatient.uuid}-${activeVisit.uuid}-${encounterUuid || "new"}`}
                      // key={`form-${resolvedFormUuid}-${selectedPatient.uuid}-${activeVisit.uuid}-${encounterUuid ?? "new"}`}
                      key={`activeform-${resolvedFormUuid}-${selectedPatient.uuid}`}
                      onSubmit={(data) => console.log("onSubmit", data)}                      
                      formUUID = {resolvedFormUuid}
                      patientUUID={selectedPatient.uuid}
                      visit={activeVisit}
                      {...(encounterUuid != null && { encounterUUID: encounterUuid })}
                      mode={encounterUuid ? "edit" : "enter"}
                      hidePatientBanner={false}
                    />
                  )}
                </TabPanel>

                  {otherStages.map((stage) => (
                  <TabPanel key={`displayform-{stage.formUuid}`}>
                    {visitLoading ? (
                      <div>{t("workflow.loadingVisit", "Loading visit...")}</div>
                    ) : visitError ? (
                      <div className={styles.errorState}>
                        {t("workflow.visitError", "Error loading visit: {{error}}", { error: visitError.message })}
                      </div>
                    ) : !activeVisit ? (
                      <div className={styles.errorState}>
                        {t("workflow.noVisit", "No active visit found. Please ensure the patient has been registered properly.")}
                      </div>
                    ) : (
                      <FormTabContent
                        formUuid={stage.formUuid}
                        patientUUID={selectedPatient.uuid}
                        visit={activeVisit}
                        encounterUUID={encounterUuidPerForm[stage.formUuid]}
                        mode="embedded-view"
                        hidePatientBanner={true}                        
                      />
                    )}
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </div>

          <div className={styles.moveButtonContainer}>
            <div style={{ marginRight: "1em" }}>
              <EndVisitButton
                queueEntry={
                  queueEntries.find(
                    (entry) => entry.patient.uuid === selectedPatient?.uuid,
                  )!
                }
                config={props.config}
                activeVisit={activeVisit}
                onEndComplete={handleMoveComplete}
              />
            </div>

            <MoveButton
              queueEntry={
                queueEntries.find(
                  (entry) => entry.patient.uuid === selectedPatient?.uuid,
                )!
              }
              nextStage={props.nextStage}
              allStages={props.allStages}
              config={props.config}
              onMoveComplete={handleMoveComplete}
            />
          </div>
        </>
      ) : (
        <div className={styles.emptyStateContainer}>
          <EmptyState
            icon={Person}
            title={t("workflow.noPatientSelected", "No patient selected")}
            description={t(
              "workflow.selectPatientDescription",
              "Select a patient from the queue on the left to view their information and fill out forms",
            )}
          />
        </div>
      )}
    </div>
  );
};

function FormTabContent({
  formUuid,
  patientUUID,
  visit,
  encounterUUID,  
  mode,
  hidePatientBanner,
  onSubmit,
}: {
  formUuid: string;
  patientUUID: string;
  visit: any; 
  encounterUUID?: string;
  mode?: SessionMode;
  hidePatientBanner: boolean;
  onSubmit?: (data: any) => void;
}) {
  return (
    <FormEngine
      // key={`${patientUUID}-${visit?.uuid || "no-visit"}-${encounterUUID || "new"}`}      
      key={`displayform-${formUuid}-${patientUUID}-${visit?.uuid || "no-visit"}-${encounterUUID ?? "new"}`}
      formUUID={formUuid}     
      patientUUID={patientUUID}
      visit={visit}      
      {...(encounterUUID != null && { encounterUUID })}
      mode={mode}
      hidePatientBanner={hidePatientBanner}
      onSubmit={onSubmit}      
    />
  );
}
