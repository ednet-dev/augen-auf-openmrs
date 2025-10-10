import { AugenAufConfig } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates the module configuration
 * Checks that all required UUIDs are configured
 */
export function validateConfig(config: AugenAufConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate workflow stages
  if (!config.workflowStages || config.workflowStages.length === 0) {
    errors.push('No workflow stages configured');
  } else {
    config.workflowStages.forEach((stage, index) => {
      if (!stage.id) {
        errors.push(`Workflow stage at index ${index} is missing 'id'`);
      }
      if (!stage.label) {
        warnings.push(`Workflow stage '${stage.id}' is missing 'label'`);
      }
      if (!stage.encounterTypeUuid || stage.encounterTypeUuid === '') {
        errors.push(`Workflow stage '${stage.id}' is missing 'encounterTypeUuid'`);
      } else if (!isValidUuid(stage.encounterTypeUuid)) {
        errors.push(`Workflow stage '${stage.id}' has invalid UUID format: ${stage.encounterTypeUuid}`);
      }
    });
  }

  // Validate needsSurgeryConceptUuid
  if (!config.needsSurgeryConceptUuid || config.needsSurgeryConceptUuid === '') {
    errors.push("'needsSurgeryConceptUuid' is not configured");
  } else if (!isValidUuid(config.needsSurgeryConceptUuid)) {
    errors.push(`'needsSurgeryConceptUuid' has invalid UUID format: ${config.needsSurgeryConceptUuid}`);
  }

  // Validate surgeryWorkflowConceptUuid (warning only, not critical)
  if (!config.surgeryWorkflowConceptUuid || config.surgeryWorkflowConceptUuid === '') {
    warnings.push("'surgeryWorkflowConceptUuid' is not configured (optional)");
  } else if (!isValidUuid(config.surgeryWorkflowConceptUuid)) {
    warnings.push(`'surgeryWorkflowConceptUuid' has invalid UUID format: ${config.surgeryWorkflowConceptUuid}`);
  }

  // Validate protocols
  if (!config.protocols || Object.keys(config.protocols).length === 0) {
    warnings.push('No protocols configured');
  } else {
    Object.entries(config.protocols).forEach(([key, protocol]) => {
      if (!protocol.name) {
        warnings.push(`Protocol '${key}' is missing 'name'`);
      }
      if (!protocol.formUuid || protocol.formUuid === '') {
        warnings.push(`Protocol '${key}' is missing 'formUuid' - forms will not be displayed`);
      } else if (!isValidUuid(protocol.formUuid)) {
        warnings.push(`Protocol '${key}' has invalid formUuid format: ${protocol.formUuid}`);
      }
      if (!protocol.encounterTypeUuid || protocol.encounterTypeUuid === '') {
        warnings.push(`Protocol '${key}' is missing 'encounterTypeUuid'`);
      } else if (!isValidUuid(protocol.encounterTypeUuid)) {
        warnings.push(`Protocol '${key}' has invalid encounterTypeUuid format: ${protocol.encounterTypeUuid}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates UUID format
 * Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Logs validation results to console
 */
export function logValidationResults(result: ValidationResult): void {
  if (result.isValid) {
    console.log('%c✓ Configuration validation passed', 'color: green; font-weight: bold');
  } else {
    console.error('%c✗ Configuration validation failed', 'color: red; font-weight: bold');
  }

  if (result.errors.length > 0) {
    console.group('%cErrors:', 'color: red; font-weight: bold');
    result.errors.forEach((error) => console.error(`  • ${error}`));
    console.groupEnd();
  }

  if (result.warnings.length > 0) {
    console.group('%cWarnings:', 'color: orange; font-weight: bold');
    result.warnings.forEach((warning) => console.warn(`  • ${warning}`));
    console.groupEnd();
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log('No issues found. All configuration values are set correctly.');
  }
}

/**
 * Gets a human-readable summary of configuration status
 */
export function getConfigSummary(config: AugenAufConfig): string {
  const validation = validateConfig(config);

  const lines = [];
  lines.push('Configuration Summary:');
  lines.push('─────────────────────');
  lines.push(`Workflow Stages: ${config.workflowStages.length}`);

  const configuredStages = config.workflowStages.filter(s => s.encounterTypeUuid && s.encounterTypeUuid !== '').length;
  lines.push(`  Configured: ${configuredStages}/${config.workflowStages.length}`);

  const protocolCount = Object.keys(config.protocols).length;
  lines.push(`Protocols: ${protocolCount}`);

  const configuredProtocols = Object.values(config.protocols).filter(p => p.formUuid && p.formUuid !== '').length;
  lines.push(`  Configured: ${configuredProtocols}/${protocolCount}`);

  lines.push(`Needs Surgery Concept: ${config.needsSurgeryConceptUuid ? '✓' : '✗'}`);
  lines.push('');
  lines.push(`Status: ${validation.isValid ? '✓ Valid' : '✗ Invalid'}`);
  lines.push(`Errors: ${validation.errors.length}`);
  lines.push(`Warnings: ${validation.warnings.length}`);

  return lines.join('\n');
}

/**
 * Hook for validating configuration on component mount
 */
export function useConfigValidation(config: AugenAufConfig): ValidationResult {
  const result = validateConfig(config);

  // Log results in development
  if (process.env.NODE_ENV === 'development') {
    logValidationResults(result);
    console.log(getConfigSummary(config));
  }

  return result;
}
