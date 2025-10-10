import { Type } from "@openmrs/esm-framework";

export const configSchema = {
  visitEncounterTypeUuid: {
    _type: Type.UUID,
    _description: "Encounter type UUID for the single patient visit encounter",
    _default: "aa001100-1234-5678-90ab-000000000001"
  },
  workflowStages: {
    _type: Type.Array,
    _description: "Available workflow stages with one form per stage",
    _default: [
      {
        id: "registration",
        label: "Registration",
        color: "#E0E0E0",
        queueUuid: "aa004400-1234-5678-90ab-000000000001",
        formUuid: "",
        encounterTypeUuid: "aa003300-1234-5678-90ab-000000000001"
      },
      {
        id: "refraction",
        label: "Refraction",
        color: "#C0C0C0",
        queueUuid: "aa004400-1234-5678-90ab-000000000002",
        formUuid: "",
        encounterTypeUuid: "aa003300-1234-5678-90ab-000000000002"
      },
      {
        id: "eye-exam",
        label: "Eye Exam",
        color: "#A0A0A0",
        queueUuid: "aa004400-1234-5678-90ab-000000000003",
        formUuid: "",
        encounterTypeUuid: "aa003300-1234-5678-90ab-000000000003"
      },
      {
        id: "therapy",
        label: "Therapy",
        color: "#808080",
        queueUuid: "aa004400-1234-5678-90ab-000000000004",
        formUuid: "",
        encounterTypeUuid: "aa003300-1234-5678-90ab-000000000004"
      },
      {
        id: "finished",
        label: "Finished",
        color: "#90EE90",
        queueUuid: "aa004400-1234-5678-90ab-000000000005",
        formUuid: "",
        encounterTypeUuid: "aa003300-1234-5678-90ab-000000000005"
      }
    ]
  },
  queueStatusWaitingUuid: {
    _type: Type.UUID,
    _description: "Queue status UUID for 'Waiting' state",
    _default: "51ae5e4d-b72b-4912-bf31-a17efb690aeb"
  },
  queueStatusInServiceUuid: {
    _type: Type.UUID,
    _description: "Queue status UUID for 'In Service' state",
    _default: "ca7494ae-437f-4fd0-8aae-b88b9a2ba47d"
  },
  queueStatusFinishedUuid: {
    _type: Type.UUID,
    _description: "Queue status UUID for 'Finished Service' state",
    _default: "b559fb77-4e1e-4285-b9b7-1d03e0ba983f"
  },
  surgeryWorkflowConceptUuid: {
    _type: Type.UUID,
    _description: "Concept UUID for tracking surgery workflow stage",
    _default: "aa002200-1234-5678-90ab-000000000001"
  },
  needsSurgeryConceptUuid: {
    _type: Type.UUID,
    _description: "Concept UUID for marking patient needs surgery",
    _default: "aa002200-1234-5678-90ab-000000000002"
  },
  dateFilters: {
    _type: Type.Object,
    _description: "Available date filter options",
    _default: {
      today: { label: "Today", days: 0 },
      yesterday: { label: "Yesterday", days: 1 },
      lastWeek: { label: "Last Week", days: 7 },
      lastMonth: { label: "Last Month", days: 30 },
      custom: { label: "Custom Range", days: null }
    }
  }
};
