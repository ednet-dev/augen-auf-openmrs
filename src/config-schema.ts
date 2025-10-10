import { Type } from "@openmrs/esm-framework";

export const configSchema = {
  protocols: {
    _type: Type.Object,
    _description: "Protocol to form UUID mappings for the surgery workflow",
    _default: {
      "protocol-1": {
        name: "Pre-Surgery",
        formUuid: "",
        encounterTypeUuid: "",
        icon: "surgery",
        color: "#FFA500"
      },
      "protocol-2": {
        name: "Intra-Surgery",
        formUuid: "",
        encounterTypeUuid: "",
        icon: "eye",
        color: "#FF8C00"
      },
      "protocol-3": {
        name: "Post-Surgery",
        formUuid: "",
        encounterTypeUuid: "",
        icon: "checkmark",
        color: "#FFD700"
      }
    }
  },
  workflowStages: {
    _type: Type.Array,
    _description: "Available workflow stages for patient filtering",
    _default: [
      {
        id: "registration",
        label: "Registration",
        color: "#E0E0E0",
        encounterTypeUuid: ""
      },
      {
        id: "refraction",
        label: "Refraction",
        color: "#C0C0C0",
        encounterTypeUuid: ""
      },
      {
        id: "eye-exam",
        label: "Eye Exam",
        color: "#A0A0A0",
        encounterTypeUuid: ""
      },
      {
        id: "therapy",
        label: "Therapy",
        color: "#808080",
        encounterTypeUuid: ""
      },
      {
        id: "finished",
        label: "Finished",
        color: "#90EE90",
        encounterTypeUuid: ""
      }
    ]
  },
  surgeryWorkflowConceptUuid: {
    _type: Type.UUID,
    _description: "Concept UUID for tracking surgery workflow stage",
    _default: ""
  },
  needsSurgeryConceptUuid: {
    _type: Type.UUID,
    _description: "Concept UUID for marking patient needs surgery",
    _default: ""
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
