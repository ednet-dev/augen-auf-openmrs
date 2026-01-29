import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useConfig } from "@openmrs/esm-framework";
import { NewConfig, ResolvedConfig, Stage, StageConfig } from "./new-config";
import { resolveFormUuid, isUuid } from "./hooks/use-form-lookup";

interface ConfigResolverContextValue {
  config: ResolvedConfig | null;
  isLoading: boolean;
  error: Error | null;
  unresolvedForms: string[];
}

const ConfigResolverContext = createContext<ConfigResolverContextValue>({
  config: null,
  isLoading: true,
  error: null,
  unresolvedForms: [],
});

/**
 * Hook to access the resolved config with form UUIDs
 */
export function useResolvedConfig(): ConfigResolverContextValue {
  return useContext(ConfigResolverContext);
}

interface ConfigResolverProviderProps {
  children: ReactNode;
}

/**
 * Resolves a StageConfig to a Stage by looking up form UUID if needed
 */
async function resolveStageFormUuid(stage: StageConfig): Promise<{ stage: Stage | null; error?: string }> {
  // Determine the form identifier - prefer formUuid, fallback to formName
  const formIdentifier = stage.formUuid || stage.formName;

  if (!formIdentifier) {
    return {
      stage: null,
      error: `Stage "${stage.id}" has neither formUuid nor formName configured`,
    };
  }

  try {
    const resolvedUuid = await resolveFormUuid(formIdentifier);

    if (!resolvedUuid) {
      return {
        stage: null,
        error: `Could not resolve form "${formIdentifier}" for stage "${stage.id}"`,
      };
    }

    // Log resolution for debugging
    if (!isUuid(formIdentifier)) {
      console.log(`Resolved form name "${formIdentifier}" to UUID "${resolvedUuid}" for stage "${stage.id}"`);
    }

    return {
      stage: {
        id: stage.id,
        label: stage.label,
        enabled: stage.enabled,
        queueUuid: stage.queueUuid,
        formUuid: resolvedUuid,
      },
    };
  } catch (error) {
    return {
      stage: null,
      error: `Error resolving form for stage "${stage.id}": ${error}`,
    };
  }
}

/**
 * Provider that resolves form names to UUIDs at startup
 * Wraps children with resolved config context
 */
export function ConfigResolverProvider({ children }: ConfigResolverProviderProps) {
  const rawConfig = useConfig() as NewConfig;
  const [resolvedConfig, setResolvedConfig] = useState<ResolvedConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [unresolvedForms, setUnresolvedForms] = useState<string[]>([]);
  
  // Use ref to track if we've already resolved to prevent infinite loops
  // useConfig() returns a new object reference each render
  const hasResolved = useRef(false);
  const configKey = rawConfig?.stages ? JSON.stringify(rawConfig.stages.map(s => s.id)) : null;

  useEffect(() => {
    // Skip if no stages or already resolved with same config
    if (!rawConfig?.stages) {
      setIsLoading(false);
      return;
    }

    // Prevent re-resolving if we've already done it
    if (hasResolved.current) {
      return;
    }

    const resolveAllForms = async () => {
      setIsLoading(true);
      setError(null);
      const errors: string[] = [];

      try {
        // Resolve all stage forms in parallel
        const resolutionResults = await Promise.all(
          rawConfig.stages.map((stage) => resolveStageFormUuid(stage))
        );

        const resolvedStages: Stage[] = [];

        resolutionResults.forEach((result, index) => {
          if (result.stage) {
            resolvedStages.push(result.stage);
          } else if (result.error) {
            errors.push(result.error);
            console.error(result.error);
          }
        });

        setUnresolvedForms(errors);

        // Create resolved config
        const resolved: ResolvedConfig = {
          stages: resolvedStages,
          status: rawConfig.status,
          priorities: rawConfig.priorities,
        };

        setResolvedConfig(resolved);
        hasResolved.current = true;

        if (errors.length > 0) {
          console.warn(
            `${errors.length} form(s) could not be resolved. Some stages may not work correctly.`
          );
        }
      } catch (err) {
        setError(err as Error);
        console.error("Error resolving form configurations:", err);
      } finally {
        setIsLoading(false);
      }
    };

    resolveAllForms();
  }, [configKey]); // Use stable key instead of rawConfig object

  return (
    <ConfigResolverContext.Provider
      value={{
        config: resolvedConfig,
        isLoading,
        error,
        unresolvedForms,
      }}
    >
      {children}
    </ConfigResolverContext.Provider>
  );
}

/**
 * HOC to wrap a component with config resolution
 */
export function withResolvedConfig<P extends object>(
  Component: React.ComponentType<P & { resolvedConfig: ResolvedConfig }>
): React.FC<P> {
  return function WrappedComponent(props: P) {
    const { config, isLoading, error, unresolvedForms } = useResolvedConfig();

    if (isLoading) {
      return <div>Loading configuration...</div>;
    }

    if (error) {
      return <div>Error loading configuration: {error.message}</div>;
    }

    if (!config) {
      return <div>No configuration available</div>;
    }

    if (unresolvedForms.length > 0) {
      console.warn("Some forms could not be resolved:", unresolvedForms);
    }

    return <Component {...props} resolvedConfig={config} />;
  };
}
