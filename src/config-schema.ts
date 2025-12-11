import _default from "@carbon/react/lib/components/Button/Button";
import { Type } from "@openmrs/esm-framework";
import { ref } from "process";

export const configSchema = {
  stages: {
    _type: Type.Object,
    _description: "Workflow stages configuration",
    _default: {
      registration: {
        queueUuid: "",
        formUuid: ""
      },
      refraction: {
        queueUuid: "aa004400-1234-5678-90ab-000000000002",
        formUuid: ""
      },
      eyeExam: {
        queueUuid: "aa004400-1234-5678-90ab-000000000003",
        formUuid: ""
      },
      therapy: {
        queueUuid: "aa004400-1234-5678-90ab-000000000004",
        formUuid: ""
      },
      surgery: {
        queueUuid: "",
        formUuid: ""
      }
    },
  },
  status: {
    _type: Type.Object,
    _description: "Workflow status UUIDs",
    _default: {
      waitingUuid: "51ae5e4d-b72b-4912-bf31-a17efb690aeb",
      inServiceUuid: "ca7494ae-437f-4fd0-8aae-b88b9a2ba47d",
      finishedUuid: "b559fb77-4e1e-4285-b9b7-1d03e0ba983f"
    },
  },
  priorities: {
    _type: Type.Object,
    _description: "Workflow priority UUIDs",
    _default: {
      normalUuid: "f4620bfa-3625-4883-bd3f-84c2cce14470"
    }
  }
};
