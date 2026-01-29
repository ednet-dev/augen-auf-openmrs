import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';

// Reusable hook — returns the resolved form schema (which includes uuid)
function useO3FormSchema(formNameOrUuid: string | undefined) {
  const config = useConfig(); // optional: can override base URL if needed
  const [schema, setSchema] = useState<any>(null);
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
        // The O3-specific endpoint accepts name OR uuid!
        const response = await openmrsFetch(
          `/ws/rest/v1/o3/forms/${encodeURIComponent(formNameOrUuid)}`,
          {
            signal: abortController.signal,
            headers: { accept: 'application/json' },
          },
        );

        const data = await response.json();

        // data should contain: uuid, name, version, published, schema (json schema), etc.
        setFormUuid(data.uuid);
        setSchema(data.schema); // ← this is what FormEngine really needs under the hood
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

  return { schema, formUuid, isLoading, error };
}
