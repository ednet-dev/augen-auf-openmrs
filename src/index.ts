import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import SurgeryWorkflowMenuLink from "./surgery-workflow-menu-link.component";

const moduleName = "@augen-auf/openmrs-esm-augen-auf";

const options = {
  featureName: "augen-auf",
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(
  () => import("./root.component"),
  options
);

export const surgeryWorkflow = getAsyncLifecycle(
  () => import("./surgery-workflow/surgery-workflow.component"),
  options
);

export const surgeryWorkflowMenuLink = getSyncLifecycle(
  SurgeryWorkflowMenuLink,
  options
);
