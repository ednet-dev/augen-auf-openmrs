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
    schema: currentFormSchema,
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
                  <Tab key={stage.formUuid}>Form: {stage.label}</Tab>
                ))}
              </TabList>
              <TabPanels>
                <TabPanel>
                  {isFormLoading ? (
                    <div>{t("workflow.loadingForm", "Loading form...")}</div>
                  ) : formError ? (
                    <div className={styles.errorState}>
                      {t("workflow.formError", "Error loading form: {{error}}", {
                        error: formError.message,
                      })}
                    </div>
                  ) : !resolvedFormUuid || !currentFormSchema ? (
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
                      key={`${selectedPatient.uuid}-${activeVisit.uuid}-${encounterUuid || "new"}`}
                      onSubmit={(data) => console.log("onSubmit", data)}
                      // formJson={currentFormSchema}
                      formUUID = {resolvedFormUuid}
                      patientUUID={selectedPatient.uuid}
                      visit={activeVisit}
                      encounterUUID={encounterUuid}
                      mode={encounterUuid ? SessionMode.EDIT : SessionMode.ENTER }
                      hidePatientBanner={false}
                    />
                  )}
                </TabPanel>

                {otherStages.map((stage) => {
                  const { schema, isLoading: stageLoading, error: stageError } =
                    useO3FormSchema(stage.formUuid);

                  return (
                    <TabPanel key={stage.formUuid}>
                      {stageLoading ? (
                        <div>
                          {t("workflow.loadingForm", "Loading form for {label}...", {
                            label: stage.label,
                          })}
                        </div>
                      ) : stageError ? (
                        <div className={styles.errorState}>
                          {t("workflow.formError", "Error loading form: {{error}}", {
                            error: stageError.message,
                          })}
                        </div>
                      ) : !schema ? (
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
                        <FormTabContent
                          formUuid={stage.formUuid}
                          patientUUID={selectedPatient.uuid}
                          visit={activeVisit}
                          encounterUUID={encounterUuidPerForm[stage.formUuid]}
                          mode="embedded-view"
                          hidePatientBanner={true}
                          onSubmit={(data) => console.log("onSubmit for other stage", data)} // optional
                  
                  //    <FormEngine
                  //        key={`${selectedPatient.uuid}-${activeVisit.uuid}-${encounterUuid || "new"}-${stage.formUuid}`}
                  //         // formJson={currentFormSchema}
                  //        formUUID = {resolvedFormUuid}
                  //        formJson={schema}
                  //        patientUUID={selectedPatient.uuid}
                  //        visit={activeVisit}
                  //        encounterUUID={encounterUuidPerForm[stage.formUuid]}
                  //        mode="embedded-view"
                  //        hidePatientBanner={true}
                         />
                      )}
                    </TabPanel>
                  );
                })}
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
  visit: any; // use proper type from your hooks
  encounterUUID?: string;
  mode: string;
  hidePatientBanner: boolean;
  onSubmit?: (data: any) => void;
}) {
  const { schema, isLoading: formLoading, error: formError } = useO3FormSchema(formUuid);

  if (formLoading) {
    return <div>Loading form...</div>;
  }

  if (formError) {
    return (
      <div className={styles.errorState}>
        Error loading form: {formError.message}
      </div>
    );
  }

  //  if (!schema) {
  //    return <div className={styles.errorState}>Form schema not found or invalid.</div>;
  //  }

  // You can add visitLoading / visitError checks here if needed,
  // but since they're shared, it's often better to keep them outside

  return (
    <FormEngine
      key={`${patientUUID}-${visit?.uuid || "no-visit"}-${encounterUUID || "new"}`}
      // formJson={schema}          // ← use formJson with the fetched schema (preferred for embedded case)
      formUUID={formUuid}     // ← alternative if you want engine to fetch itself (but slower)
      patientUUID={patientUUID}
      visit={visit}
      encounterUUID={encounterUUID}
      mode={SessionMode.VIEW}
      hidePatientBanner={hidePatientBanner}
      onSubmit={onSubmit}
      // Add formSessionIntent if needed: formSessionIntent={encounterUUID ? "edit" : "enter"}
    />
  );
}
