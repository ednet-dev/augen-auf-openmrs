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
      if (!stage.queueUuid || stage.queueUuid === '') {
        errors.push(`Workflow stage '${stage.id}' is missing 'queueUuid'`);
      } else if (!isValidUuid(stage.queueUuid)) {
        errors.push(`Workflow stage '${stage.id}' has invalid queueUuid format: ${stage.queueUuid}`);
      }
      if (!stage.formUuid || stage.formUuid === '') {
        warnings.push(`Workflow stage '${stage.id}' is missing 'formUuid' - form will not be displayed`);
      } else if (!isValidUuid(stage.formUuid)) {
        warnings.push(`Workflow stage '${stage.id}' has invalid formUuid format: ${stage.formUuid}`);
      }
      if (!stage.encounterTypeUuid || stage.encounterTypeUuid === '') {
        warnings.push(`Workflow stage '${stage.id}' is missing 'encounterTypeUuid'`);
      } else if (!isValidUuid(stage.encounterTypeUuid)) {
        warnings.push(`Workflow stage '${stage.id}' has invalid encounterTypeUuid format: ${stage.encounterTypeUuid}`);
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

  // Validate visitEncounterTypeUuid
  if (!config.visitEncounterTypeUuid || config.visitEncounterTypeUuid === '') {
    errors.push("'visitEncounterTypeUuid' is not configured");
  } else if (!isValidUuid(config.visitEncounterTypeUuid)) {
    errors.push(`'visitEncounterTypeUuid' has invalid UUID format: ${config.visitEncounterTypeUuid}`);
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

  const configuredStages = config.workflowStages.filter(s => s.queueUuid && s.queueUuid !== '' && s.formUuid && s.formUuid !== '').length;
  lines.push(`  Fully Configured: ${configuredStages}/${config.workflowStages.length}`);

  lines.push(`Visit Encounter Type: ${config.visitEncounterTypeUuid ? '✓' : '✗'}`);
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
