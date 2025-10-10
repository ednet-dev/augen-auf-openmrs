import { defineConfigSchema, getAsyncLifecycle } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";

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
