// import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { openmrsFetch } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';

// Reusable hook — returns the resolved form schema (which includes uuid)
export function useO3FormSchema(formNameOrUuid: string | undefined) {
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
          `/ws/rest/v1/form/${encodeURIComponent(formNameOrUuid)}`,
          {
            method: 'GET',
            signal: abortController.signal,
            headers: { accept: 'application/json' },
          },
        );

        const data = await response.json();

        // data should contain: uuid, name, version, published, schema (json schema), etc.
        setFormUuid(data.uuid);
//        setSchema(data.schema); // ← this is what FormEngine really needs under the hood
               if (data.schema) {
          setSchema(data.schema);
        } else if (data.uuid) {
          // Fallback: load schema from form resources (e.g. when O3 stores JSON schema in a form resource)
          try {
            const resResponse = await openmrsFetch(
              `/ws/rest/v1/form/${data.uuid}/resource?v=full`,
              { method: 'GET', signal: abortController.signal, headers: { accept: 'application/json' } },
            );
            const resData = resResponse.data as { results?: Array<{ name?: string; value?: string | object }> };
            const resources = resData?.results ?? [];
            const jsonResource = resources.find(
              (r) => r.name === 'json' || r.name === 'JSON schema' || r.name === 'schema',
            );
            if (jsonResource?.value != null) {
              const raw = jsonResource.value;
              setSchema(typeof raw === 'string' ? JSON.parse(raw) : raw);
            }
          } catch {
            // Ignore; schema stays null when backend does not expose it via form or resources
          }
        }
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
