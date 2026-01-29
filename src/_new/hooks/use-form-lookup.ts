import { useState, useEffect, useCallback } from "react";
import { openmrsFetch, restBaseUrl } from "@openmrs/esm-framework";

interface Form {
  uuid: string;
  name: string;
  version: string;
  published: boolean;
}

interface FormLookupResult {
  uuid: string | null;
  isLoading: boolean;
  error: Error | null;
}

// Cache for form lookups to avoid repeated API calls
const formCache = new Map<string, string>();

/**
 * Checks if a string is a valid UUID format
 */
export function isUuid(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Fetches a form UUID by name from the OpenMRS REST API
 */
export async function fetchFormUuidByName(formName: string): Promise<string | null> {
  // Check cache first
  if (formCache.has(formName)) {
    return formCache.get(formName)!;
  }

  try {
    // Search for form by name - use exact match
    const response = await openmrsFetch(
      `${restBaseUrl}/form?q=${encodeURIComponent(formName)}&v=custom:(uuid,name,version,published)`
    );

    const forms: Form[] = response.data?.results || [];
    
    // Find exact match (case-insensitive)
    const exactMatch = forms.find(
      (f) => f.name.toLowerCase() === formName.toLowerCase() && f.published
    );

    if (exactMatch) {
      formCache.set(formName, exactMatch.uuid);
      return exactMatch.uuid;
    }

    // If no published exact match, try unpublished
    const unpublishedMatch = forms.find(
      (f) => f.name.toLowerCase() === formName.toLowerCase()
    );

    if (unpublishedMatch) {
      console.warn(`Form "${formName}" found but is not published. Using UUID: ${unpublishedMatch.uuid}`);
      formCache.set(formName, unpublishedMatch.uuid);
      return unpublishedMatch.uuid;
    }

    console.error(`Form not found: "${formName}". Available forms:`, forms.map(f => f.name));
    return null;
  } catch (error) {
    console.error(`Error fetching form by name "${formName}":`, error);
    throw error;
  }
}

/**
 * Resolves a form identifier (UUID or name) to a UUID
 * If the value is already a UUID, returns it directly
 * If it's a name, looks it up via the API
 */
export async function resolveFormUuid(formIdentifier: string): Promise<string | null> {
  if (!formIdentifier) {
    return null;
  }

  // If it's already a UUID, return it directly
  if (isUuid(formIdentifier)) {
    return formIdentifier;
  }

  // Otherwise, treat it as a form name and look it up
  return fetchFormUuidByName(formIdentifier);
}

/**
 * Hook to look up a form UUID by name or return existing UUID
 * Supports both UUID and form name as input
 */
export function useFormLookup(formIdentifier: string | undefined): FormLookupResult {
  const [uuid, setUuid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!formIdentifier) {
      setUuid(null);
      setIsLoading(false);
      return;
    }

    // If it's already a UUID, use it directly
    if (isUuid(formIdentifier)) {
      setUuid(formIdentifier);
      setIsLoading(false);
      return;
    }

    // Check cache
    if (formCache.has(formIdentifier)) {
      setUuid(formCache.get(formIdentifier)!);
      setIsLoading(false);
      return;
    }

    // Look up by name
    setIsLoading(true);
    setError(null);

    fetchFormUuidByName(formIdentifier)
      .then((resolvedUuid) => {
        setUuid(resolvedUuid);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, [formIdentifier]);

  return { uuid, isLoading, error };
}

/**
 * Batch resolve multiple form identifiers to UUIDs
 * Useful for resolving all stage forms at once
 */
export async function resolveFormUuids(formIdentifiers: string[]): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  
  // Process in parallel
  const promises = formIdentifiers.map(async (identifier) => {
    const uuid = await resolveFormUuid(identifier);
    results.set(identifier, uuid);
  });

  await Promise.all(promises);
  return results;
}

/**
 * Clear the form cache (useful for testing or after form updates)
 */
export function clearFormCache(): void {
  formCache.clear();
}
