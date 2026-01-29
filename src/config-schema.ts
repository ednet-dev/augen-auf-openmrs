import { Type } from "@openmrs/esm-framework";

export const configSchema = {
  stages: {
    _type: Type.Array,
    _description: "Dynamic workflow steps configuration. Array order determines workflow sequence.",
    _elements: {
      id: {
        _type: Type.String,
        _description: "Unique identifier for this workflow step"
      },
      label: {
        _type: Type.Object,
        _description: "Display name for the workflow step in multiple languages",
        _default: {},
        en: {
          _type: Type.String,
          _description: "English label",
          _default: ""
        },
        de: {
          _type: Type.String,
          _description: "German label",
          _default: ""
        },
        es: {
          _type: Type.String,
          _description: "Spanish label",
          _default: ""
        }
      },
      enabled: {
        _type: Type.Boolean,
        _description: "Whether this workflow step is active",
        _default: true
      },
      queueUuid: {
        _type: Type.UUID,
        _description: "UUID of the queue for this workflow step"
      },
      formUuid: {
        _type: Type.String,
        _description: "UUID of the form for this workflow step. Use this if form UUIDs are stable across deployments."
      },
      formName: {
        _type: Type.String,
        _description: "Name of the form for this workflow step (will be resolved to UUID at runtime). Use this if form UUIDs change across deployments. Takes precedence over formUuid if both are provided."
      }
    },
    _default: [
      {
        id: "registration-form",
        label: {
          en: "Registration Form",
          de: "Registrierungsformular",
          es: "Formulario de Registración"
        },
        enabled: true,
        queueUuid: "310b9d28-737d-45d2-8b6a-f059aac6cea8",
        formName: "AUA Registration"
      },
      {
        id: "auto-refraction",
        label: {
          en: "Auto Refraction",
          de: "Auto Refraktion",
          es: "Autorefracción"
        },
        enabled: true,
        queueUuid: "cbb6ec0c-c6c7-4e31-a6a6-3c447a29d95b",
        formName: "AUA AutoRefraction"
      },
      {
        id: "eye-exam",
        label: {
          en: "Eye Exam",
          de: "Augenuntersuchung",
          es: "Examen Ocular"
        },
        enabled: true,
        queueUuid: "3eab5184-aa9d-4ef6-8072-d219cd4fbcbf",
        formName: "AUA Eye Exam"
      },
      {
        id: "therapy",
        label: {
          en: "Therapy",
          de: "Therapie",
          es: "Terapia"
        },
        enabled: true,
        queueUuid: "59006885-9096-407d-9428-efbbe6e5c8f3",
        formName: "AUA Therapy"
      }
    ]
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
