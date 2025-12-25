import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import SurgeryWorkflowMenuLink from "./surgery-workflow-menu-link.component";

const moduleName = "@augen-auf/openmrs-esm-augen-auf";

const options = {
  featureName: "augen-auf",
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(
  () => import("./root.component"),
  options
);

export const surgeryWorkflowMenuLink = getSyncLifecycle(
  SurgeryWorkflowMenuLink,
  options
);

export const surgeryWorkflowNew = getAsyncLifecycle(
  () => import("./_new/surgery-workflow-new.component"),
  options
);
