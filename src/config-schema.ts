import { Type } from "@openmrs/esm-framework";

export const configSchema = {
  exampleConfig: {
    _type: Type.String,
    _default: "default value",
    _description: "An example configuration property",
  },
};
