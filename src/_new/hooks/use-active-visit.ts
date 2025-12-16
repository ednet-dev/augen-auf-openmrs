import { useState, useEffect } from "react";
import { openmrsFetch, restBaseUrl } from "@openmrs/esm-framework";

interface Visit {
  uuid: string;
  startDatetime: string;
  stopDatetime: string | null;
  visitType: {
    uuid: string;
    name: string;
    display: string;
  };
  encounters?: Array<{
    uuid: string;
    encounterType: {
      uuid: string;
    };
    form?: {
      uuid: string;
      name: string;
    };
  }>;
}

export function useActiveVisit(patientUuid: string | undefined, formUuid?: string) {
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null);
  const [encounterUuid, setEncounterUuid] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!patientUuid) {
      setActiveVisit(null);
      setEncounterUuid(undefined);
      return;
    }

    const fetchActiveVisit = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch active visits for the patient with encounters
        const response = await openmrsFetch(
          `${restBaseUrl}/visit?patient=${patientUuid}&includeInactive=false&v=custom:(uuid,startDatetime,stopDatetime,visitType:(uuid,name,display),encounters:(uuid,encounterType:(uuid),form:(uuid,name)))`
        );

        const visits = response.data?.results || [];

        // Find an active visit (no stopDatetime)
        const active = visits.find((v: Visit) => !v.stopDatetime);

        if (active) {
          setActiveVisit(active);
          
          // If formUuid is provided, try to find the corresponding encounter
          if (formUuid) {
            const existingEncounter = active.encounters?.find(enc => enc.form?.uuid === formUuid || enc.form?.name === formUuid);
            setEncounterUuid(existingEncounter?.uuid);
          }
        } else {
          // No active visit - create one
          const newVisit = await createVisit(patientUuid);
          setActiveVisit(newVisit);
          setEncounterUuid(undefined);
        }
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching/creating visit:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveVisit();
  }, [patientUuid, formUuid]);

  return { activeVisit, encounterUuid, isLoading, error };
}

async function createVisit(patientUuid: string): Promise<Visit> {
  // Default visit type UUID - "Facility Visit" is common
  const defaultVisitTypeUuid = "7b0f5697-27e3-40c4-8bae-f4049abfb4ed";

  const response = await openmrsFetch(
    `${restBaseUrl}/visit?v=custom:(uuid,startDatetime,stopDatetime,visitType:(uuid,name,display))`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patient: patientUuid,
        visitType: defaultVisitTypeUuid,
        startDatetime: new Date().toISOString(),
      }),
    }
  );

  return response.data;
}
