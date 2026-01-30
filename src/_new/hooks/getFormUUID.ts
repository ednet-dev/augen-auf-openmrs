// import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { openmrsFetch } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';

// Reusable hook — returns the resolved form UUID (accepts form name or uuid)
export function useO3FormSchema(formNameOrUuid: string | undefined) {
  const [formUuid, setFormUuid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!formNameOrUuid) {
      setIsLoading(false);
      return;
    }

    const abortController = new AbortController();

    const fetchForm = async () => {
      setIsLoading(true);
      setError(null);

      try {        
        const response = await openmrsFetch(
          `/ws/rest/v1/form/${encodeURIComponent(formNameOrUuid)}`,
          {
            method: 'GET',
            signal: abortController.signal,
            headers: { accept: 'application/json' },
          },
        );

        const data = await response.json();
        setFormUuid(data.uuid);
      } catch (err: any) {
        setError(err);
        console.error('Failed to load O3 form:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();

    return () => abortController.abort();
  }, [formNameOrUuid]);

  return { formUuid, isLoading, error };
}
